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
  Calendar,
  Clock,
  Video,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Building,
} from 'lucide-react'

interface AdminAppointment {
  id: string
  patientName: string
  doctorName: string
  specialty: string
  type: 'VIDEO' | 'IN_PERSON'
  date: string
  time: string
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'
  notes: string
}

const MOCK_ADMIN_APPOINTMENTS: AdminAppointment[] = [
  {
    id: 'apt-501',
    patientName: 'Ramesh Patil',
    doctorName: 'Dr. Rajesh Kulkarni',
    specialty: 'General Medicine',
    type: 'VIDEO',
    date: '2025-02-21',
    time: '10:00 AM',
    status: 'CONFIRMED',
    notes: 'Follow-up on high blood pressure reading recorded by ASHA worker.',
  },
  {
    id: 'apt-502',
    patientName: 'Kavita Pawar',
    doctorName: 'Dr. Sneha Joshi',
    specialty: 'Obstetrics & Gynaecology',
    type: 'VIDEO',
    date: '2025-02-21',
    time: '11:30 AM',
    status: 'IN_PROGRESS',
    notes: 'Antenatal teleconsultation and nutrition advisory.',
  },
  {
    id: 'apt-503',
    patientName: 'Suresh Gaikwad',
    doctorName: 'Dr. Rahul Deshmukh',
    specialty: 'Cardiology',
    type: 'IN_PERSON',
    date: '2025-02-20',
    time: '02:00 PM',
    status: 'COMPLETED',
    notes: 'ECG review and anti-hypertensive titration.',
  },
  {
    id: 'apt-504',
    patientName: 'Meena Bhosle',
    doctorName: 'Dr. Vikram Kulkarni',
    specialty: 'Pulmonology',
    type: 'VIDEO',
    date: '2025-02-19',
    time: '04:00 PM',
    status: 'COMPLETED',
    notes: 'Asthma symptom management and inhaler usage guidance.',
  },
  {
    id: 'apt-505',
    patientName: 'Sunita Jadhav',
    doctorName: 'Dr. Meena Sawant',
    specialty: 'General Medicine',
    type: 'VIDEO',
    date: '2025-02-18',
    time: '09:30 AM',
    status: 'CANCELLED',
    notes: 'Patient rescheduled due to power cut in village.',
  },
]

export default function AdminAppointments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = MOCK_ADMIN_APPOINTMENTS.filter(apt => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: AdminAppointment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Scheduled</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 animate-pulse">In Session</Badge>
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
    }
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
            <span>📅</span> State Teleconsultation Queue (टेलिकन्सल्टेशन नोंदी)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            System-wide log of tele-health video consults and primary health center appointments
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => alert('Exporting appointments audit trail as CSV...')}
          className="gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Export Audit Log
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient, doctor, or specialty..."
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Statuses (सर्व स्थिती)</option>
                <option value="CONFIRMED">Scheduled</option>
                <option value="IN_PROGRESS">In Session</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-[11px] font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Doctor & Specialty</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900">{apt.patientName}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900 block">{apt.doctorName}</span>
                    <span className="text-xs text-primary-600">{apt.specialty}</span>
                  </td>
                  <td className="px-5 py-4">
                    {apt.type === 'VIDEO' ? (
                      <span className="flex items-center gap-1.5 text-xs text-purple-700 font-medium bg-purple-50 px-2 py-1 rounded w-fit">
                        <Video className="w-3.5 h-3.5" /> Video Teleconsult
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded w-fit">
                        <Building className="w-3.5 h-3.5" /> In-Person PHC
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> {apt.date}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> {apt.time}
                    </div>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(apt.status)}</td>
                  <td className="px-5 py-4 text-xs text-gray-600 max-w-xs truncate">
                    {apt.notes}
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
