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
  Filter,
  Download,
  Users,
  ShieldCheck,
  AlertTriangle,
  Building,
  Phone,
  Calendar,
} from 'lucide-react'

interface AdminPatient {
  id: string
  name: string
  age: number
  gender: string
  district: string
  village: string
  phone: string
  abhaNumber: string
  isAbhaVerified: boolean
  registeredDate: string
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH'
  totalConsultations: number
}

const MOCK_ADMIN_PATIENTS: AdminPatient[] = [
  {
    id: 'p-101',
    name: 'Ramesh Dinkar Patil',
    age: 54,
    gender: 'Male',
    district: 'Pune',
    village: 'Shiroli',
    phone: '+91 98223 11234',
    abhaNumber: '91-8472-9102-4412',
    isAbhaVerified: true,
    registeredDate: '2024-11-12',
    riskLevel: 'HIGH',
    totalConsultations: 4,
  },
  {
    id: 'p-102',
    name: 'Kavita Suresh Pawar',
    age: 35,
    gender: 'Female',
    district: 'Pune',
    village: 'Saswad',
    phone: '+91 98223 45678',
    abhaNumber: '91-3829-1102-5534',
    isAbhaVerified: true,
    registeredDate: '2025-01-05',
    riskLevel: 'LOW',
    totalConsultations: 2,
  },
  {
    id: 'p-103',
    name: 'Suresh Babanrao Gaikwad',
    age: 62,
    gender: 'Male',
    district: 'Nashik',
    village: 'Trimbak',
    phone: '+91 98901 23456',
    abhaNumber: '91-4921-6672-8819',
    isAbhaVerified: true,
    registeredDate: '2024-10-20',
    riskLevel: 'HIGH',
    totalConsultations: 6,
  },
  {
    id: 'p-104',
    name: 'Meena Anand Bhosle',
    age: 28,
    gender: 'Female',
    district: 'Satara',
    village: 'Wai',
    phone: '+91 94230 98765',
    abhaNumber: '91-7712-9934-2201',
    isAbhaVerified: false,
    registeredDate: '2025-02-01',
    riskLevel: 'MODERATE',
    totalConsultations: 1,
  },
  {
    id: 'p-105',
    name: 'Sunita Tukaram Kadam',
    age: 48,
    gender: 'Female',
    district: 'Kolhapur',
    village: 'Panhala',
    phone: '+91 97654 32109',
    abhaNumber: '91-1029-4482-9901',
    isAbhaVerified: true,
    registeredDate: '2025-02-14',
    riskLevel: 'LOW',
    totalConsultations: 0,
  },
]

export default function AdminPatients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [selectedRisk, setSelectedRisk] = useState('ALL')

  const filtered = MOCK_ADMIN_PATIENTS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaNumber.includes(searchTerm) ||
      p.phone.includes(searchTerm) ||
      p.village.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDistrict = selectedDistrict === 'ALL' || p.district === selectedDistrict
    const matchesRisk = selectedRisk === 'ALL' || p.riskLevel === selectedRisk
    return matchesSearch && matchesDistrict && matchesRisk
  })

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
            <span>👥</span> State Patient Master Registry (रुग्ण नोंदणी यादी)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centrally monitor registered citizens, ABHA verification rates, and high-risk case distribution
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => alert('Exporting patient database as encrypted CSV...')}
          className="gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total Citizens</span>
            <p className="text-2xl font-black text-gray-900 mt-1">2,456</p>
            <span className="text-xs text-emerald-600 font-medium">+142 this month</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">ABHA Linked</span>
            <p className="text-2xl font-black text-blue-600 mt-1">89.4%</p>
            <span className="text-xs text-gray-500">2,196 verified</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">High Risk Monitored</span>
            <p className="text-2xl font-black text-rose-600 mt-1">318</p>
            <span className="text-xs text-rose-600 font-medium">Flagged by AI triage</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Rural Teleconsults</span>
            <p className="text-2xl font-black text-purple-600 mt-1">1,890</p>
            <span className="text-xs text-gray-500">Completed consultations</span>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient name, ABHA number, village..."
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Districts (सर्व जिल्हे)</option>
                <option value="Pune">Pune</option>
                <option value="Nashik">Nashik</option>
                <option value="Satara">Satara</option>
                <option value="Kolhapur">Kolhapur</option>
              </select>
            </div>
            <div>
              <select
                value={selectedRisk}
                onChange={e => setSelectedRisk(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk Only</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-[11px] font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Patient Details</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">ABHA ID</th>
                <th className="px-5 py-3">Risk Assessment</th>
                <th className="px-5 py-3">Consultations</th>
                <th className="px-5 py-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-bold text-gray-900 block">{patient.name}</span>
                    <span className="text-xs text-gray-500">
                      {patient.age} yrs • {patient.gender} • {patient.phone}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-900 font-medium">{patient.village}</span>
                    <span className="text-xs text-gray-500 block">Dist: {patient.district}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded block w-fit">
                      {patient.abhaNumber}
                    </span>
                    {patient.isAbhaVerified ? (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3" /> ABDM Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium mt-1 block">Pending Verification</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {patient.riskLevel === 'HIGH' && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" /> High Risk
                      </Badge>
                    )}
                    {patient.riskLevel === 'MODERATE' && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">Moderate</Badge>
                    )}
                    {patient.riskLevel === 'LOW' && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Low Risk</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {patient.totalConsultations} visits
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">
                    {patient.registeredDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
