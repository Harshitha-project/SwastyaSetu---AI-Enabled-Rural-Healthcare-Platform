import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { patientService } from '../../services/patientService'
import { recordsService, type EHRTimelineItem } from '../../services/recordsService'
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
import { Badge } from '@/components/ui/badge'
import {
  User,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  Stethoscope,
  FileText,
  Activity,
  Heart,
  Wind,
  Droplets,
  ClipboardList,
  Video,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [timeline, setTimeline] = useState<EHRTimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      patientService.getPatientById(id).then(pat => {
        if (pat) setPatient(pat)
        setIsLoading(false)
      })
      recordsService.getEHRTimeline(id).then(setTimeline)
    }
  }, [id])

  const isMarathi = i18n.language === 'mr'
  const patName = patient ? (patient.user as any)?.name || `${(patient.user as any)?.firstName} ${(patient.user as any)?.lastName}` : 'Patient'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
        <Link to="/doctor/patients">
          <ArrowLeft className="w-4 h-4" />
          {isMarathi ? 'रुग्ण यादीकडे परत' : 'Back to Patients'}
        </Link>
      </Button>

      {/* Patient Header Banner */}
      <Card className="border-border/80 shadow-md p-6 bg-gradient-to-r from-card via-card to-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              {patName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{patName}</h1>
                <Badge
                  variant={
                    patient?.riskLevel === 'HIGH'
                      ? 'destructive'
                      : patient?.riskLevel === 'MODERATE'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {patient?.riskLevel || 'LOW'} RISK
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ABHA: 91-8402-9182-3841
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" />
                  {patient?.address?.village}, Taluka {patient?.address?.taluka}, {patient?.address?.district}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary-600" />
                  +91 {(patient?.user as any)?.phone || '9876543210'}
                </span>
                <span>Blood: <strong>{patient?.bloodGroup || 'B+'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-medium">
              <Link to="/doctor/appointments">
                <Video className="w-4 h-4" />
                {isMarathi ? 'सल्लामसलत सुरू करा' : 'Start Teleconsult'}
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Clinical Metrics & Medical History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vitals Summary */}
        <Card className="p-4 border-border/80 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {isMarathi ? 'ताजी आरोग्य तपासणी' : 'Latest Vitals (Triage)'}
          </span>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40">
              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500" /> Pulse</span>
              <span className="font-bold text-foreground">78 bpm</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40">
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-amber-500" /> Blood Pressure</span>
              <span className="font-bold text-foreground">124/82 mmHg</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40">
              <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-500" /> SpO₂ Oxygen</span>
              <span className="font-bold text-emerald-600">97% Normal</span>
            </div>
          </div>
        </Card>

        {/* Known Allergies */}
        <Card className="p-4 border-border/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {isMarathi ? 'ॲलर्जी (Drug Allergies)' : 'Known Drug Allergies'}
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {patient?.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((al, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  ⚠️ {al}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No known drug allergies reported.</span>
            )}
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="p-4 border-border/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {isMarathi ? 'आपत्कालीन संपर्क' : 'Emergency Guardian'}
          </span>
          <div className="text-xs space-y-1 pt-1 text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">{patient?.emergencyContact?.name || 'Sanjay Sharma'}</p>
            <p>Relation: {patient?.emergencyContact?.relation || 'Spouse'}</p>
            <p className="flex items-center gap-1 text-primary-600 font-medium">
              <Phone className="w-3 h-3" /> +91 {patient?.emergencyContact?.phone || '9822012345'}
            </p>
          </div>
        </Card>
      </div>

      {/* Complete EMR Clinical Timeline */}
      <Card className="border-border/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              {isMarathi ? 'वैद्यकीय इतिहास आणि सल्लामसलत नोंदी' : 'Electronic Medical Record (EMR) Timeline'}
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of clinical visits, diagnostic reports, and issued medications
            </CardDescription>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {timeline.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                  <p className="text-primary-600 font-medium">{item.subtitle}</p>
                  {item.details && <p className="text-muted-foreground mt-1">{item.details}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Badge variant="outline" className="text-[10px]">
                  {new Date(item.date).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default PatientDetail
