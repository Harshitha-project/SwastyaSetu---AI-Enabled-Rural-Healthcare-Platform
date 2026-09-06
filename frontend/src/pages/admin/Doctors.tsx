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
  Search,
  CheckCircle,
  ShieldCheck,
  Stethoscope,
  Star,
  Clock,
  Phone,
  Video,
  UserCheck,
} from 'lucide-react'

interface AdminDoctor {
  id: string
  name: string
  specialty: string
  qualification: string
  registrationNumber: string // MMC reg no
  hospital: string
  district: string
  phone: string
  rating: number
  totalConsultations: number
  isVerified: boolean
  isOnline: boolean
}

const MOCK_DOCTORS: AdminDoctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Rajesh Kulkarni',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD (Internal Medicine)',
    registrationNumber: 'MMC/2012/04/1829',
    hospital: 'District Hospital Pune',
    district: 'Pune',
    phone: '+91 98220 54321',
    rating: 4.9,
    totalConsultations: 342,
    isVerified: true,
    isOnline: true,
  },
  {
    id: 'doc-2',
    name: 'Dr. Rahul Deshmukh',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
    registrationNumber: 'MMC/2009/11/0542',
    hospital: 'Sassoon General Hospital',
    district: 'Pune',
    phone: '+91 98231 67890',
    rating: 4.8,
    totalConsultations: 215,
    isVerified: true,
    isOnline: false,
  },
  {
    id: 'doc-3',
    name: 'Dr. Anjali Patil',
    specialty: 'Pediatrics',
    qualification: 'MBBS, DCH, DNB',
    registrationNumber: 'MMC/2015/08/3312',
    hospital: 'Civil Hospital Nashik',
    district: 'Nashik',
    phone: '+91 94220 11984',
    rating: 4.9,
    totalConsultations: 198,
    isVerified: true,
    isOnline: true,
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Kulkarni',
    specialty: 'Pulmonology',
    qualification: 'MBBS, MD (Chest & TB)',
    registrationNumber: 'MMC/2018/02/7711',
    hospital: 'Rural Hospital Baramati',
    district: 'Pune',
    phone: '+91 97650 99881',
    rating: 4.7,
    totalConsultations: 142,
    isVerified: true,
    isOnline: false,
  },
  {
    id: 'doc-5',
    name: 'Dr. Sneha Joshi',
    specialty: 'Obstetrics & Gynaecology',
    qualification: 'MBBS, MS (OBGYN)',
    registrationNumber: 'MMC/2021/06/9182',
    hospital: 'Sub-District Hospital Saswad',
    district: 'Pune',
    phone: '+91 98812 34455',
    rating: 4.6,
    totalConsultations: 89,
    isVerified: false, // New applicant
    isOnline: false,
  },
]

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>(MOCK_DOCTORS)
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL')

  const filtered = doctors.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpec = specialtyFilter === 'ALL' || d.specialty === specialtyFilter
    return matchesSearch && matchesSpec
  })

  const toggleVerify = (id: string) => {
    setDoctors(prev =>
      prev.map(d => (d.id === id ? { ...d, isVerified: !d.isVerified } : d))
    )
  }

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
            <span>👨‍⚕️</span> Medical Council Doctor Directory (डॉक्टर पडताळणी)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Verify MMC medical licenses, track active telemedicine hours, and monitor quality ratings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 py-1.5 px-3">
            {doctors.filter(d => d.isOnline).length} Doctors Online Now
          </Badge>
        </div>
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
                placeholder="Search by doctor name, MMC registration number, or hospital..."
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Specialties (सर्व शाखा)</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <Card key={doc.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary-600">{doc.specialty}</p>
                  <p className="text-[11px] text-gray-500">{doc.qualification}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {doc.isOnline ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">Offline</span>
                  )}
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {doc.rating}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">MMC Reg:</span>
                  <span className="font-mono text-gray-800 font-medium">{doc.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hospital:</span>
                  <span className="text-gray-800">{doc.hospital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">District:</span>
                  <span className="text-gray-800">{doc.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teleconsults:</span>
                  <span className="font-bold text-primary-700">{doc.totalConsultations} sessions</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {doc.isVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> License Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[11px]">
                    Pending Verification
                  </Badge>
                )}

                <Button
                  size="sm"
                  variant={doc.isVerified ? 'outline' : 'default'}
                  onClick={() => toggleVerify(doc.id)}
                  className={`text-xs h-8 ${!doc.isVerified ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                >
                  {doc.isVerified ? 'Revoke License' : 'Verify MMC License'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
