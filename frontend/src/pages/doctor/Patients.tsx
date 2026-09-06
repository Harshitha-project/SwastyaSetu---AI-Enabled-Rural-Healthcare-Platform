import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { patientService } from '../../services/patientService'
import type { Patient } from '../../types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  FileText,
  Activity,
} from 'lucide-react'

const DoctorPatients: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const initialRisk = searchParams.get('risk') || 'ALL'

  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState<string>(initialRisk)

  useEffect(() => {
    patientService.listPatients().then(setPatients)
  }, [])

  const isMarathi = i18n.language === 'mr'

  const filtered = patients.filter(p => {
    const matchesRisk = selectedRisk === 'ALL' || p.riskLevel === selectedRisk
    const name = (p.user as any)?.name || `${(p.user as any)?.firstName} ${(p.user as any)?.lastName}`
    const village = p.address?.village || ''
    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.medicalHistory && p.medicalHistory.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesRisk && matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary-600" />
            {isMarathi ? 'माझे रुग्ण (Patient Roster)' : 'Assigned Patients & EMR'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'सर्व नोंदणीकृत ग्रामीण रुग्ण, त्यांची आरोग्य पार्श्वभूमी आणि एआय जोखीम पातळी तपासा.'
              : 'Complete directory of registered rural patients with clinical histories and AI risk classifications.'}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border-border/70 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'रुग्णाचे नाव, गाव किंवा आजार शोधा...' : 'Search by patient name, village, or chronic condition...'}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {[
              { id: 'ALL', label: isMarathi ? 'सर्व रुग्ण' : 'All' },
              { id: 'HIGH', label: isMarathi ? '🔴 उच्च जोखीम' : '🔴 High Risk' },
              { id: 'MODERATE', label: isMarathi ? '🟠 मध्यम' : '🟠 Moderate' },
              { id: 'LOW', label: isMarathi ? '🟢 सामान्य' : '🟢 Low' },
            ].map(r => (
              <Button
                key={r.id}
                size="sm"
                variant={selectedRisk === r.id ? 'default' : 'outline'}
                onClick={() => setSelectedRisk(r.id)}
                className="text-xs h-8 px-3"
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(pat => {
          const name = (pat.user as any)?.name || `${(pat.user as any)?.firstName} ${(pat.user as any)?.lastName}`
          const isHigh = pat.riskLevel === 'HIGH' || pat.riskLevel === 'CRITICAL'
          return (
            <Card
              key={pat.id || pat._id}
              className={`p-5 border-2 transition-all flex flex-col justify-between ${
                isHigh ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/10' : 'border-border/80 bg-card hover:border-primary/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-600" />
                        {pat.address?.village}, Taluka {pat.address?.taluka}, {pat.address?.district}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={isHigh ? 'destructive' : pat.riskLevel === 'MODERATE' ? 'default' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {pat.riskLevel} RISK
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">{isMarathi ? 'लिंग व वय' : 'Gender & DOB'}</span>
                    <span className="font-medium text-foreground">{pat.gender === 'F' ? 'Female' : 'Male'} • {pat.dateOfBirth?.split('T')[0]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">{isMarathi ? 'रक्तगट' : 'Blood Group'}</span>
                    <span className="font-bold text-foreground">{pat.bloodGroup || 'B+'}</span>
                  </div>
                </div>

                {pat.medicalHistory && pat.medicalHistory.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                      {isMarathi ? 'जुनाट आजार / हिस्ट्री:' : 'Chronic Conditions:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {pat.medicalHistory.map((h, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-muted/50">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  ABHA: 91-8402-9182
                </span>
                <Button asChild size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-primary-600 to-indigo-600">
                  <Link to={`/doctor/patients/${pat.id || pat._id}`}>
                    <FileText className="w-3.5 h-3.5" />
                    {isMarathi ? 'संपूर्ण EMR पहा' : 'View Full EMR'}
                  </Link>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default DoctorPatients
