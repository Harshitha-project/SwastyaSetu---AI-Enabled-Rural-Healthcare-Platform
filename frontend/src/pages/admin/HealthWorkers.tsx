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
  Users,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  Activity,
  Download,
  Award,
} from 'lucide-react'

interface HealthWorker {
  id: string
  name: string
  role: 'ASHA Worker' | 'ANM' | 'MPW' | 'Community Health Officer'
  district: string
  taluka: string
  assignedVillages: string[]
  phone: string
  screeningsConducted: number
  activePatients: number
  lastSyncTime: string
  status: 'ACTIVE' | 'ON_LEAVE'
}

const MOCK_WORKERS: HealthWorker[] = [
  {
    id: 'hw-1',
    name: 'Sunita Tukaram Kadam',
    role: 'ASHA Worker',
    district: 'Pune',
    taluka: 'Haveli',
    assignedVillages: ['Shiroli', 'Khed Shivapur'],
    phone: '+91 98221 34567',
    screeningsConducted: 248,
    activePatients: 64,
    lastSyncTime: '10 mins ago',
    status: 'ACTIVE',
  },
  {
    id: 'hw-2',
    name: 'Surekha Dilip Patil',
    role: 'ANM',
    district: 'Pune',
    taluka: 'Purandar',
    assignedVillages: ['Saswad', 'Dive', 'Sonori'],
    phone: '+91 98229 88123',
    screeningsConducted: 412,
    activePatients: 110,
    lastSyncTime: '1 hour ago',
    status: 'ACTIVE',
  },
  {
    id: 'hw-3',
    name: 'Anita Ramesh Shinde',
    role: 'Community Health Officer',
    district: 'Pune',
    taluka: 'Haveli',
    assignedVillages: ['Uruli Kanchan', 'Loni Kalbhor'],
    phone: '+91 94231 55678',
    screeningsConducted: 530,
    activePatients: 145,
    lastSyncTime: 'Just now',
    status: 'ACTIVE',
  },
  {
    id: 'hw-4',
    name: 'Jyoti Laxman More',
    role: 'ASHA Worker',
    district: 'Nashik',
    taluka: 'Trimbakeshwar',
    assignedVillages: ['Trimbak Hamlet 1', 'Hamlet 2'],
    phone: '+91 98904 11223',
    screeningsConducted: 184,
    activePatients: 42,
    lastSyncTime: '2 hours ago',
    status: 'ACTIVE',
  },
]

export default function AdminHealthWorkers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const filtered = MOCK_WORKERS.filter(w => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.assignedVillages.some(v => v.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.taluka.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || w.role === roleFilter
    return matchesSearch && matchesRole
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
            <span>👩‍⚕️</span> ASHA & Rural Health Worker Cadre (आशा व आरोग्य कर्मचारी)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Grassroots frontline workers conducting door-to-door screenings and teleconsultation facilitation
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => alert('Exporting Health Worker performance metric report...')}
          className="gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Export Cadre Roster
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total Field Cadre</span>
            <p className="text-2xl font-black text-gray-900 mt-1">124</p>
            <span className="text-xs text-emerald-600 font-medium">Active in 36 Talukas</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total Screenings</span>
            <p className="text-2xl font-black text-blue-600 mt-1">1,374</p>
            <span className="text-xs text-gray-500">Conducted this month</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Offline Records Synced</span>
            <p className="text-2xl font-black text-purple-600 mt-1">99.2%</p>
            <span className="text-xs text-emerald-600 font-medium">Automatic cloud sync</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">High-Risk Followups</span>
            <p className="text-2xl font-black text-rose-600 mt-1">94%</p>
            <span className="text-xs text-gray-500">Contacted within 48h</span>
          </CardContent>
        </Card>
      </div>

      {/* Search & Role Filter */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search worker name, assigned village, or taluka..."
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Roles (सर्व पदे)</option>
                <option value="ASHA Worker">ASHA Worker</option>
                <option value="ANM">ANM</option>
                <option value="Community Health Officer">Community Health Officer (CHO)</option>
                <option value="MPW">MPW</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(worker => (
          <Card key={worker.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900">{worker.name}</h3>
                  <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200 mt-1">
                    {worker.role}
                  </Badge>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {worker.status}
                </Badge>
              </div>

              <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span><strong>Jurisdiction:</strong> Taluka {worker.taluka}, Dist {worker.district}</span>
                </div>
                <div className="text-gray-600 pl-4">
                  Villages: {worker.assignedVillages.join(', ')}
                </div>
                <div className="flex items-center gap-1 text-gray-700 pt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{worker.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-gray-100">
                <div>
                  <span className="block text-lg font-bold text-gray-900">{worker.screeningsConducted}</span>
                  <span className="text-[10px] uppercase text-gray-500">Screenings</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-primary-700">{worker.activePatients}</span>
                  <span className="text-[10px] uppercase text-gray-500">Roster Patients</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-emerald-700 mt-1">{worker.lastSyncTime}</span>
                  <span className="text-[10px] uppercase text-gray-500">Last Sync</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
