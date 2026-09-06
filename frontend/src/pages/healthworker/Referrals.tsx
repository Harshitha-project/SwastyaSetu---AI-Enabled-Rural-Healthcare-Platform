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
  GitPullRequest,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Video,
  ArrowUpRight,
} from 'lucide-react'

interface Referral {
  id: string
  patientName: string
  age: number
  village: string
  targetFacility: string
  specialtyRequired: string
  urgency: 'HIGH' | 'MEDIUM' | 'ROUTINE'
  reason: string
  referralDate: string
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED'
}

const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref-1',
    patientName: 'Suresh Gaikwad',
    age: 62,
    village: 'Saswad',
    targetFacility: 'Saswad Sub-District Hospital',
    specialtyRequired: 'Cardiology / General Medicine',
    urgency: 'HIGH',
    reason: 'BP 168/102 mmHg with recurring dizziness; suspected hypertensive urgency.',
    referralDate: '2025-02-18',
    status: 'ACCEPTED',
  },
  {
    id: 'ref-2',
    patientName: 'Kavita Pawar',
    age: 35,
    village: 'Shiroli',
    targetFacility: 'Primary Health Centre (PHC) Uruli Kanchan',
    specialtyRequired: 'Obstetrics & Gynaecology',
    urgency: 'MEDIUM',
    reason: 'Second trimester anomaly ultrasound and gestational diabetes screening.',
    referralDate: '2025-02-16',
    status: 'PENDING',
  },
  {
    id: 'ref-3',
    patientName: 'Meena Bhosle',
    age: 28,
    village: 'Khed Shivapur',
    targetFacility: 'Teleconsultation - Dr. Rajesh Kulkarni',
    specialtyRequired: 'Pulmonology',
    urgency: 'ROUTINE',
    reason: 'Frequent nocturnal wheezing during winter season. Inhaler dosage adjustment.',
    referralDate: '2025-02-12',
    status: 'COMPLETED',
  },
]

export default function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRef, setNewRef] = useState({
    patientName: '',
    age: '40',
    village: 'Shiroli',
    targetFacility: 'Saswad Sub-District Hospital',
    specialtyRequired: 'General Medicine',
    urgency: 'HIGH' as Referral['urgency'],
    reason: '',
  })

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRef.patientName || !newRef.reason) return

    const item: Referral = {
      id: `ref-${Date.now()}`,
      patientName: newRef.patientName,
      age: parseInt(newRef.age) || 30,
      village: newRef.village,
      targetFacility: newRef.targetFacility,
      specialtyRequired: newRef.specialtyRequired,
      urgency: newRef.urgency,
      reason: newRef.reason,
      referralDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    }

    setReferrals([item, ...referrals])
    setShowAddModal(false)
    setNewRef({
      patientName: '',
      age: '40',
      village: 'Shiroli',
      targetFacility: 'Saswad Sub-District Hospital',
      specialtyRequired: 'General Medicine',
      urgency: 'HIGH',
      reason: '',
    })
  }

  const getUrgencyBadge = (urgency: Referral['urgency']) => {
    switch (urgency) {
      case 'HIGH':
        return <Badge variant="destructive">Urgent (उच्च प्राधान्य)</Badge>
      case 'MEDIUM':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Moderate</Badge>
      case 'ROUTINE':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Routine</Badge>
    }
  }

  const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Facility Accepted</Badge>
      case 'COMPLETED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Consulted</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="text-gray-600">Pending Review</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>📋</span> Rural Patient Referrals (रुग्ण संदर्भ सेवा)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Refer high-risk rural patients to Sub-District Hospitals, PHCs, or Teleconsultation Specialists
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white gap-2 shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Referral
        </Button>
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {referrals.map(ref => (
          <Card key={ref.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">{ref.patientName}</span>
                    <span className="text-xs text-gray-500">
                      ({ref.age} yrs • Village {ref.village})
                    </span>
                    {getUrgencyBadge(ref.urgency)}
                    {getStatusBadge(ref.status)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg w-fit">
                    <Building2 className="w-3.5 h-3.5" />
                    <strong>Referred to:</strong> {ref.targetFacility} ({ref.specialtyRequired})
                  </div>

                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <strong className="text-gray-900">Clinical Reason & Triage Notes:</strong> {ref.reason}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date: {ref.referralDate}
                    </span>
                    <span>Referral ID: {ref.id}</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Connecting ${ref.patientName} with teleconsultation doctor...`)}
                    className="gap-1.5 text-xs text-primary-700 border-primary-200 hover:bg-primary-50"
                  >
                    <Video className="w-3.5 h-3.5" /> Book Teleconsult
                  </Button>
                  {ref.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReferrals(prev =>
                          prev.map(r => (r.id === ref.id ? { ...r, status: 'ACCEPTED' } : r))
                        )
                      }}
                      className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      Mark Accepted
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Referral Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Create Healthcare Referral</h3>
            <p className="text-xs text-gray-500">
              Escalate high-risk cases or specialized consultations to government hospitals or specialist doctors.
            </p>

            <form onSubmit={handleCreateReferral} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Patient Full Name</label>
                  <Input
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={newRef.patientName}
                    onChange={e => setNewRef({ ...newRef, patientName: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Patient Age</label>
                  <Input
                    type="number"
                    value={newRef.age}
                    onChange={e => setNewRef({ ...newRef, age: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Village</label>
                  <Input
                    value={newRef.village}
                    onChange={e => setNewRef({ ...newRef, village: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Urgency Level</label>
                  <select
                    value={newRef.urgency}
                    onChange={e => setNewRef({ ...newRef, urgency: e.target.value as any })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md mt-1 text-sm bg-white"
                  >
                    <option value="HIGH">High / Urgent (तातडीचे)</option>
                    <option value="MEDIUM">Medium / Moderate</option>
                    <option value="ROUTINE">Routine Follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Destination Facility / Specialist</label>
                <select
                  value={newRef.targetFacility}
                  onChange={e => setNewRef({ ...newRef, targetFacility: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md mt-1 text-sm bg-white"
                >
                  <option value="Saswad Sub-District Hospital">Saswad Sub-District Hospital</option>
                  <option value="Primary Health Centre (PHC) Uruli Kanchan">Primary Health Centre (PHC) Uruli Kanchan</option>
                  <option value="Sassoon General Hospital Pune">Sassoon General Hospital Pune</option>
                  <option value="Teleconsultation Specialist Network">Teleconsultation Specialist Network</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Clinical Reason & Symptoms</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe patient condition, measured vitals, and why referral is required..."
                  value={newRef.reason}
                  onChange={e => setNewRef({ ...newRef, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">
                  Issue Referral
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}
