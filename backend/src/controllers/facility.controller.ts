import { Request, Response } from 'express'
import { Facility } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// List all facilities with pagination and filters
export async function listFacilities(req: Request, res: Response): Promise<Response> {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      district,
      services,
      is24x7,
      search,
    } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    // Build query
    const query: any = { isActive: true }

    if (type) {
      query.type = type
    }

    if (district) {
      query['address.district'] = { $regex: district, $options: 'i' }
    }

    if (services) {
      const serviceList = (services as string).split(',')
      query.services = { $in: serviceList }
    }

    if (is24x7 === 'true') {
      query['operatingHours.is24x7'] = true
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.district': { $regex: search, $options: 'i' } },
      ]
    }

    // Execute query
    const [facilities, total] = await Promise.all([
      Facility.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Facility.countDocuments(query),
    ])

    return sendSuccess(res, {
      facilities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List facilities error:', error)
    return sendServerError(res, error as Error)
  }
}

// Search facilities by name, city, or service
export async function searchFacilities(req: Request, res: Response): Promise<Response> {
  try {
    const { q, limit = 10 } = req.query

    if (!q || (q as string).length < 2) {
      return sendError(res, 'Search query must be at least 2 characters')
    }

    const facilities = await Facility.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
        { 'address.district': { $regex: q, $options: 'i' } },
        { services: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name type address.city address.district contact.phone services operatingHours.is24x7')
      .limit(Math.min(20, Number(limit)))
      .lean()

    return sendSuccess(res, facilities)
  } catch (error) {
    console.error('Search facilities error:', error)
    return sendServerError(res, error as Error)
  }
}

// Find nearby facilities using geospatial query
export async function findNearbyFacilities(req: Request, res: Response): Promise<Response> {
  try {
    const { lat, lng, maxDistance = 50000, type, limit = 10 } = req.query

    if (!lat || !lng) {
      return sendError(res, 'Latitude and longitude are required')
    }

    const latitude = parseFloat(lat as string)
    const longitude = parseFloat(lng as string)

    if (isNaN(latitude) || isNaN(longitude)) {
      return sendError(res, 'Invalid latitude or longitude')
    }

    const query: any = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: Number(maxDistance),
        },
      },
    }

    if (type) {
      query.type = type
    }

    const facilities = await Facility.find(query)
      .limit(Math.min(20, Number(limit)))
      .lean()

    // Calculate distance for each facility
    const facilitiesWithDistance = facilities.map((facility: any) => {
      const [facLng, facLat] = facility.location?.coordinates || [0, 0]
      const distance = calculateDistance(latitude, longitude, facLat, facLng)
      return {
        ...facility,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        distanceUnit: 'km',
      }
    })

    return sendSuccess(res, facilitiesWithDistance)
  } catch (error) {
    console.error('Find nearby facilities error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get facility by ID
export async function getFacilityById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const facility = await Facility.findById(id).lean()

    if (!facility) {
      return sendNotFound(res, 'Facility not found')
    }

    return sendSuccess(res, facility)
  } catch (error) {
    console.error('Get facility error:', error)
    return sendServerError(res, error as Error)
  }
}

// Create new facility (Admin only)
export async function createFacility(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const facilityData = req.body

    // Check for duplicate
    const existing = await Facility.findOne({
      name: facilityData.name,
      'address.city': facilityData.address?.city,
    })

    if (existing) {
      return sendError(res, 'A facility with this name already exists in this city', 409)
    }

    const facility = await Facility.create({
      ...facilityData,
      isActive: true,
      isVerified: false, // Needs admin verification
    })

    return sendCreated(res, facility, 'Facility created successfully')
  } catch (error) {
    console.error('Create facility error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update facility (Admin only)
export async function updateFacility(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const updates = req.body

    const facility = await Facility.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!facility) {
      return sendNotFound(res, 'Facility not found')
    }

    return sendSuccess(res, facility, 'Facility updated successfully')
  } catch (error) {
    console.error('Update facility error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get facility types and counts
export async function getFacilityStats(req: Request, res: Response): Promise<Response> {
  try {
    const stats = await Facility.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalBeds: { $sum: '$beds.total' },
          availableBeds: { $sum: '$beds.available' },
        },
      },
      { $sort: { count: -1 } },
    ])

    const districtStats = await Facility.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$address.district',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    return sendSuccess(res, {
      byType: stats,
      byDistrict: districtStats,
    })
  } catch (error) {
    console.error('Get facility stats error:', error)
    return sendServerError(res, error as Error)
  }
}

// Helper: Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
