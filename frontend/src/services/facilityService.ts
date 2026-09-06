import api from './api'
import type { Facility, ApiResponse } from '../types'

export const DEMO_FACILITIES: Facility[] = [
  {
    id: 'fac-01',
    _id: 'fac-01',
    name: 'Khed Primary Health Centre (PHC)',
    type: 'PHC',
    address: {
      street: 'Taluka Road, Near Gram Panchayat',
      village: 'Khed',
      taluka: 'Shirur',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '410501',
    },
    contact: {
      phone: '02135-222104',
      emergencyPhone: '108',
      email: 'phc.khed@maharashtra.gov.in',
    },
    location: {
      type: 'Point',
      coordinates: [73.9056, 18.8475],
    },
    services: [
      'General OPD',
      'Maternal & Antenatal Care',
      'Immunization & Child Vaccination',
      'Basic Blood & Urine Testing',
      'Free Generic Medicines Distribution',
      'Telemedicine Node',
    ],
    operatingHours: {
      open: '08:00 AM',
      close: '08:00 PM',
      is24x7: false,
    },
    bedCapacity: {
      total: 10,
      available: 6,
    },
    staff: {
      doctorsCount: 2,
      nursesCount: 4,
    },
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'fac-02',
    _id: 'fac-02',
    name: 'Shirur Community Health Centre (CHC)',
    type: 'CHC',
    address: {
      street: 'Pune-Nagar Highway, Shirur',
      village: 'Shirur',
      taluka: 'Shirur',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '412210',
    },
    contact: {
      phone: '02138-222340',
      emergencyPhone: '108',
      email: 'chc.shirur@maharashtra.gov.in',
    },
    location: {
      type: 'Point',
      coordinates: [74.3789, 18.8268],
    },
    services: [
      '24x7 Emergency & Trauma',
      'Maternity & Labor Ward',
      'Pediatric Care',
      'Digital X-Ray & Sonography',
      'Pathology Lab',
      'Ambulance Station',
    ],
    operatingHours: {
      open: '00:00',
      close: '23:59',
      is24x7: true,
    },
    bedCapacity: {
      total: 30,
      available: 12,
    },
    staff: {
      doctorsCount: 5,
      nursesCount: 12,
    },
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'fac-03',
    _id: 'fac-03',
    name: 'Aundh District Hospital',
    type: 'DISTRICT_HOSPITAL',
    address: {
      street: 'Near Sangvi Phata, Aundh',
      village: 'Aundh',
      taluka: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411027',
    },
    contact: {
      phone: '020-27280045',
      emergencyPhone: '108',
      email: 'adh.pune@maharashtra.gov.in',
    },
    location: {
      type: 'Point',
      coordinates: [73.8077, 18.5793],
    },
    services: [
      'Multispecialty ICU',
      'Cardiology & Dialysis Center',
      'Surgery & Orthopedics',
      'Blood Bank (24x7)',
      'Advanced Diagnostic CT/MRI',
      'Government Scheme Desk (MJPJAY)',
    ],
    operatingHours: {
      open: '00:00',
      close: '23:59',
      is24x7: true,
    },
    bedCapacity: {
      total: 300,
      available: 48,
    },
    staff: {
      doctorsCount: 35,
      nursesCount: 90,
    },
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'fac-04',
    _id: 'fac-04',
    name: 'Velhe Sub-District Hospital',
    type: 'RURAL_HOSPITAL',
    address: {
      street: 'Main Bazaar Road, Velhe',
      village: 'Velhe',
      taluka: 'Velhe',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '412212',
    },
    contact: {
      phone: '02130-221012',
      emergencyPhone: '108',
    },
    location: {
      type: 'Point',
      coordinates: [73.6375, 18.2936],
    },
    services: [
      'General Medicine',
      'Snake Bite & Anti-venom Center',
      'Minor OT',
      'Normal Delivery Ward',
      'Mobile Medical Unit Base',
    ],
    operatingHours: {
      open: '00:00',
      close: '23:59',
      is24x7: true,
    },
    bedCapacity: {
      total: 20,
      available: 9,
    },
    staff: {
      doctorsCount: 3,
      nursesCount: 8,
    },
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
]

export const facilityService = {
  async getFacilities(params?: { district?: string; taluka?: string; type?: string; search?: string }): Promise<Facility[]> {
    try {
      const res = await api.get<ApiResponse<Facility[]>>('/facilities', { params })
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API getFacilities fallback to local', err)
    }

    let list = [...DEMO_FACILITIES]
    if (params?.district && params.district !== 'all') {
      list = list.filter(f => f.address.district.toLowerCase() === params.district!.toLowerCase())
    }
    if (params?.taluka && params.taluka !== 'all') {
      list = list.filter(f => f.address.taluka.toLowerCase() === params.taluka!.toLowerCase())
    }
    if (params?.type && params.type !== 'all') {
      list = list.filter(f => f.type === params.type)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      list = list.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.address.village.toLowerCase().includes(q) ||
        f.services.some(s => s.toLowerCase().includes(q))
      )
    }
    return list
  },

  async getFacilityById(id: string): Promise<Facility | undefined> {
    try {
      const res = await api.get<ApiResponse<Facility>>(`/facilities/${id}`)
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getFacilityById fallback', err)
    }
    return DEMO_FACILITIES.find(f => f.id === id || f._id === id)
  }
}
