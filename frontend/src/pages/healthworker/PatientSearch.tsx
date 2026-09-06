import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  UserPlus,
  Activity,
  ArrowRight,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
} from 'lucide-react'

interface RuralPatient {
  id: string
  name: string
  age: number
  gender: string
  village: string
  taluka: string
  phone: string
  abhaNumber: string
  lastVisit: string
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH'
  condition: string
}

const MOCK_PATIENTS: RuralPatient[] = [
  {
    id: 'pat-1',
    name: 'Kavita Pawar',
    age: 35,
    gender: 'Female',
    village: 'Shiroli',
    taluka: 'Haveli',
    phone: '+91 98223 45678',
    abhaNumber: '91-8472-9102-4412',
    lastVisit: '2025-02-18',
    riskLevel: 'LOW',
    condition: 'Routine antenatal check (Trimester 2)',
  },
  {
    id: 'pat-2',
    name: 'Suresh Gaikwad',
    age: 62,
    gender: 'Male',
    village: 'Saswad',
    taluka: 'Purandar',
    phone: '+91 98901 23456',
    abhaNumber: '91-4921-6672-8819',
    lastVisit: '2025-02-15',
    riskLevel: 'HIGH',
    condition: 'Hypertensive crisis history, Type 2 Diabetes',
  },
  {
    id: 'pat-3',
    name: 'Meena Bhosle',
    age: 28,
    gender: 'Female',
    village: 'Khed Shivapur',
    taluka: 'Haveli',
    phone: '+91 94230 98765',
    abhaNumber: '91-3829-1102-5534',
    lastVisit: '2025-02-10',
    riskLevel: 'MODERATE',
    condition: 'Chronic asthma, seasonal bronchitis',
  },
  {
    id: 'pat-4',
    name: 'Ramesh Patil',
    age: 45,
    gender: 'Male',
    village: 'Loni Kalbhor',
    taluka: 'Haveli',
    phone: '+91 97654 32109',
    abhaNumber: '91-1029-4482-9901',
    lastVisit: '2025-01-29',
    riskLevel: 'LOW',
    condition: 'Post-fracture follow-up',
  },
  {
    id: 'pat-5',
    name: 'Sunita Jadhav',
    age: 50,
    gender: 'Female',
    village: 'Uruli Kanchan',
    taluka: 'Haveli',
    phone: '+91 98224 88312',
    abhaNumber: '91-7712-9934-2201',
    lastVisit: '2025-02-12',
    riskLevel: 'MODERATE',
    condition: 'Joint pains & elevated uric acid',
  },
]

export default function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('ALL')
  const navigate = useNavigate()

  const filteredPatients = MOCK_PATIENTS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaNumber.includes(searchTerm) ||
      p.phone.includes(searchTerm) ||
      p.village.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVillage = selectedVillage === 'ALL' || p.village === selectedVillage
    return matchesSearch && matchesVillage
  })

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return <Badge variant="destructive">High Risk</Badge>
      case 'MODERATE':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Moderate</Badge>
      case 'LOW':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Low Risk</Badge>
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>🔍</span> Rural Patient Registry & Search
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search registered villagers by Name, ABHA ID, Village, or Phone Number
          </p>
        </div>
        <Button
          onClick={() => navigate('/worker/register')}
          className="bg-primary-600 hover:bg-primary-700 text-white gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> + Register New Patient
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient name, ABHA ID, mobile number..."
                className="pl-10 text-base"
              />
            </div>
            <div>
              <select
                value={selectedVillage}
                onChange={e => setSelectedVillage(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Villages (सर्व गावे)</option>
                <option value="Shiroli">Shiroli</option>
                <option value="Saswad">Saswad</option>
                <option value="Khed Shivapur">Khed Shivapur</option>
                <option value="Loni Kalbhor">Loni Kalbhor</option>
                <option value="Uruli Kanchan">Uruli Kanchan</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
          Matching Villagers ({filteredPatients.length})
        </div>

        {filteredPatients.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            <p className="text-base font-medium">No patients found matching "{searchTerm}"</p>
            <p className="text-xs mt-1">Check the spelling or register them as a new patient.</p>
            <Button
              variant="outline"
              onClick={() => navigate('/worker/register')}
              className="mt-4 gap-2 text-primary-600"
            >
              <UserPlus className="w-4 h-4" /> Register Patient Now
            </Button>
          </Card>
        ) : (
          filteredPatients.map(patient => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow border-gray-200">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900">{patient.name}</span>
                      <span className="text-xs text-gray-500">
                        {patient.age} yrs • {patient.gender}
                      </span>
                      {getRiskBadge(patient.riskLevel)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {patient.village}, {patient.taluka}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {patient.phone}
                      </span>
                      <span className="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        ABHA: {patient.abhaNumber}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 mt-1">
                      <strong className="text-gray-900">Notes:</strong> {patient.condition}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/worker/vitals/${patient.id}`)}
                      className="gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Activity className="w-3.5 h-3.5" /> Record Vitals
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/worker/referrals')}
                      className="gap-1.5 text-xs text-primary-700 border-primary-200 hover:bg-primary-50"
                    >
                      <FileText className="w-3.5 h-3.5" /> Refer to Doctor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  )
}
