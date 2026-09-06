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
  Activity,
  HeartPulse,
  Baby,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react'

interface ScreeningRecord {
  id: string
  date: string
  village: string
  campName: string
  type: 'NCD (BP & Sugar)' | 'Maternal & Child' | 'Anemia Camp' | 'General Vitals'
  totalScreened: number
  highRiskCount: number
  referredCount: number
  status: 'COMPLETED' | 'IN_PROGRESS'
}

const MOCK_SCREENINGS: ScreeningRecord[] = [
  {
    id: 'sc-1',
    date: '2025-02-18',
    village: 'Shiroli',
    campName: 'Shiroli Gram Panchayat NCD Screening Drive',
    type: 'NCD (BP & Sugar)',
    totalScreened: 42,
    highRiskCount: 6,
    referredCount: 5,
    status: 'COMPLETED',
  },
  {
    id: 'sc-2',
    date: '2025-02-14',
    village: 'Saswad',
    campName: 'Anganwadi Maternal Nutrition & Hb Screening',
    type: 'Maternal & Child',
    totalScreened: 28,
    highRiskCount: 3,
    referredCount: 3,
    status: 'COMPLETED',
  },
  {
    id: 'sc-3',
    date: '2025-02-10',
    village: 'Khed Shivapur',
    campName: 'Zilla Parishad School Anemia Check',
    type: 'Anemia Camp',
    totalScreened: 64,
    highRiskCount: 8,
    referredCount: 4,
    status: 'COMPLETED',
  },
  {
    id: 'sc-4',
    date: '2025-02-20',
    village: 'Loni Kalbhor',
    campName: 'Senior Citizen Cardiovascular Camp',
    type: 'NCD (BP & Sugar)',
    totalScreened: 18,
    highRiskCount: 4,
    referredCount: 2,
    status: 'IN_PROGRESS',
  },
]

export default function Screenings() {
  const [screenings, setScreenings] = useState<ScreeningRecord[]>(MOCK_SCREENINGS)
  const [selectedType, setSelectedType] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCamp, setNewCamp] = useState({
    village: 'Uruli Kanchan',
    campName: '',
    type: 'NCD (BP & Sugar)' as ScreeningRecord['type'],
  })

  const filteredScreenings = screenings.filter(
    s => selectedType === 'ALL' || s.type === selectedType
  )

  const totalVillagersScreened = screenings.reduce((sum, s) => sum + s.totalScreened, 0)
  const totalHighRisk = screenings.reduce((sum, s) => sum + s.highRiskCount, 0)
  const totalReferred = screenings.reduce((sum, s) => sum + s.referredCount, 0)

  const handleCreateCamp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCamp.campName) return

    const item: ScreeningRecord = {
      id: `sc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      village: newCamp.village,
      campName: newCamp.campName,
      type: newCamp.type,
      totalScreened: 0,
      highRiskCount: 0,
      referredCount: 0,
      status: 'IN_PROGRESS',
    }

    setScreenings([item, ...screenings])
    setShowAddModal(false)
    setNewCamp({ village: 'Uruli Kanchan', campName: '', type: 'NCD (BP & Sugar)' })
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
            <span>🩺</span> Community Health Screenings (आरोग्य तपासणी शिबिरे)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track village-level NCD screening camps, maternal drives, and door-to-door checkups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Screening data exported as CSV for PHC report!')}
            className="gap-1.5 text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export PHC Report
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white gap-2 shadow-sm text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Start New Camp
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-100 bg-blue-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Total Screened</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{totalVillagersScreened}</p>
              <p className="text-xs text-gray-500 mt-0.5">Across 4 rural villages</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">High Risk Flagged</p>
              <p className="text-3xl font-black text-rose-700 mt-1">{totalHighRisk}</p>
              <p className="text-xs text-rose-600 mt-0.5">Hypertension, Glucose, SpO2 flags</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Doctor Referrals</p>
              <p className="text-3xl font-black text-emerald-700 mt-1">{totalReferred}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Scheduled for teleconsult / PHC</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'NCD (BP & Sugar)', 'Maternal & Child', 'Anemia Camp'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedType(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedType === tab
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab === 'ALL' ? 'All Camps (सर्व शिबिरे)' : tab}
          </button>
        ))}
      </div>

      {/* Screenings List */}
      <div className="space-y-3">
        {filteredScreenings.map(s => (
          <Card key={s.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">{s.campName}</span>
                    <Badge variant={s.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {s.status === 'COMPLETED' ? 'Completed' : 'Active Camp'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {s.date}
                    </span>
                    <span>📍 Village: <strong className="text-gray-700">{s.village}</strong></span>
                    <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {s.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">{s.totalScreened}</span>
                    <span className="text-[11px] text-gray-500 uppercase">Screened</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-rose-600">{s.highRiskCount}</span>
                    <span className="text-[11px] text-gray-500 uppercase">High Risk</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-emerald-600">{s.referredCount}</span>
                    <span className="text-[11px] text-gray-500 uppercase">Referred</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal to Add New Camp */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Start New Screening Camp</h3>
            <p className="text-xs text-gray-500">
              Set up a field screening drive for rural villagers in your assigned jurisdiction.
            </p>

            <form onSubmit={handleCreateCamp} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Camp Name / Event</label>
                <Input
                  required
                  placeholder="e.g. Uruli Kanchan Ward 3 Door-to-Door Drive"
                  value={newCamp.campName}
                  onChange={e => setNewCamp({ ...newCamp, campName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Village</label>
                <Input
                  required
                  value={newCamp.village}
                  onChange={e => setNewCamp({ ...newCamp, village: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Screening Type</label>
                <select
                  value={newCamp.type}
                  onChange={e => setNewCamp({ ...newCamp, type: e.target.value as any })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md mt-1 text-sm bg-white"
                >
                  <option value="NCD (BP & Sugar)">NCD (BP & Sugar)</option>
                  <option value="Maternal & Child">Maternal & Child</option>
                  <option value="Anemia Camp">Anemia Camp</option>
                  <option value="General Vitals">General Vitals</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">
                  Create & Launch Camp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}
