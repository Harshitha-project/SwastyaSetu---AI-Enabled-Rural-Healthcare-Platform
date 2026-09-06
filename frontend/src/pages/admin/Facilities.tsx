import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Bed,
  Activity,
  Phone,
  MapPin,
  Search,
  PlusCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react'

interface Facility {
  id: string
  name: string
  type: 'PHC' | 'CHC' | 'Sub-District Hospital' | 'District Hospital'
  district: string
  taluka: string
  totalBeds: number
  availableBeds: number
  oxygenBedsAvailable: number
  icuBedsAvailable: number
  hasAmbulance: boolean
  phone: string
  inChargeDoctor: string
}

const MOCK_FACILITIES: Facility[] = [
  {
    id: 'fac-1',
    name: 'Saswad Sub-District Hospital',
    type: 'Sub-District Hospital',
    district: 'Pune',
    taluka: 'Purandar',
    totalBeds: 50,
    availableBeds: 18,
    oxygenBedsAvailable: 8,
    icuBedsAvailable: 3,
    hasAmbulance: true,
    phone: '02115-222340',
    inChargeDoctor: 'Dr. Suresh Patil (MS)',
  },
  {
    id: 'fac-2',
    name: 'Primary Health Centre (PHC) Uruli Kanchan',
    type: 'PHC',
    district: 'Pune',
    taluka: 'Haveli',
    totalBeds: 10,
    availableBeds: 4,
    oxygenBedsAvailable: 2,
    icuBedsAvailable: 0,
    hasAmbulance: true,
    phone: '020-26926222',
    inChargeDoctor: 'Dr. Neha Kadam (MBBS)',
  },
  {
    id: 'fac-3',
    name: 'Community Health Centre (CHC) Bhor',
    type: 'CHC',
    district: 'Pune',
    taluka: 'Bhor',
    totalBeds: 30,
    availableBeds: 9,
    oxygenBedsAvailable: 4,
    icuBedsAvailable: 1,
    hasAmbulance: true,
    phone: '02113-222510',
    inChargeDoctor: 'Dr. Anand Shinde (MD)',
  },
  {
    id: 'fac-4',
    name: 'Sassoon General Hospital Pune',
    type: 'District Hospital',
    district: 'Pune',
    taluka: 'Pune City',
    totalBeds: 1296,
    availableBeds: 214,
    oxygenBedsAvailable: 68,
    icuBedsAvailable: 19,
    hasAmbulance: true,
    phone: '020-26128000',
    inChargeDoctor: 'Dr. Vinayak Kale (Dean)',
  },
  {
    id: 'fac-5',
    name: 'Primary Health Centre (PHC) Trimbak',
    type: 'PHC',
    district: 'Nashik',
    taluka: 'Trimbakeshwar',
    totalBeds: 12,
    availableBeds: 5,
    oxygenBedsAvailable: 2,
    icuBedsAvailable: 0,
    hasAmbulance: true,
    phone: '02594-233120',
    inChargeDoctor: 'Dr. Mahesh Gite (MBBS)',
  },
]

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const filtered = facilities.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.taluka.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.district.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || f.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalBedsState = facilities.reduce((sum, f) => sum + f.totalBeds, 0)
  const availableBedsState = facilities.reduce((sum, f) => sum + f.availableBeds, 0)
  const oxygenBedsState = facilities.reduce((sum, f) => sum + f.oxygenBedsAvailable, 0)
  const icuBedsState = facilities.reduce((sum, f) => sum + f.icuBedsAvailable, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>🏛️</span> Public Healthcare Facilities & Bed Tracking (आरोग्य संस्था)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time tracking of PHC, CHC, and District Hospital bed capacities, oxygen availability, and ambulances
          </p>
        </div>
      </div>

      {/* State Capacity Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total General Beds</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalBedsState}</p>
            <span className="text-xs text-emerald-600 font-medium">{availableBedsState} Currently Available</span>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Oxygen Beds Free</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{oxygenBedsState}</p>
            <span className="text-xs text-gray-500">Equipped with O2 manifolds</span>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">ICU Ventilator Beds</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{icuBedsState}</p>
            <span className="text-xs text-gray-500">Critical care capacity</span>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Facilities Tracked</span>
            <p className="text-2xl font-black text-purple-600 mt-1">{facilities.length}</p>
            <span className="text-xs text-gray-500">100% Ambulance Equipped</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search facility name, taluka, or district..."
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Facility Types (सर्व प्रकार)</option>
                <option value="PHC">Primary Health Centre (PHC)</option>
                <option value="CHC">Community Health Centre (CHC)</option>
                <option value="Sub-District Hospital">Sub-District Hospital</option>
                <option value="District Hospital">District Hospital</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities List */}
      <div className="space-y-3">
        {filtered.map(facility => (
          <Card key={facility.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">{facility.name}</span>
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                      {facility.type}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Taluka: {facility.taluka}, Dist: {facility.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {facility.phone}
                    </span>
                    <span>Medical Officer: <strong className="text-gray-700">{facility.inChargeDoctor}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-emerald-600">
                      {facility.availableBeds} / {facility.totalBeds}
                    </span>
                    <span className="text-[11px] text-gray-500 uppercase">Available Beds</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">{facility.oxygenBedsAvailable}</span>
                    <span className="text-[11px] text-gray-500 uppercase">O2 Beds</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-rose-600">{facility.icuBedsAvailable}</span>
                    <span className="text-[11px] text-gray-500 uppercase">ICU Beds</span>
                  </div>
                  <div className="text-center pl-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px]">
                      <Truck className="w-3 h-3" /> 108 Ready
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
