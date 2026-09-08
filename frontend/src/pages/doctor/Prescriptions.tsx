import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { recordsService } from '../../services/recordsService'
import type { Prescription } from '../../types'
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
  ClipboardList,
  Calendar,
  Pill,
  Printer,
  Search,
  FileCheck,
  User,
  PlusCircle,
} from 'lucide-react'

const DoctorPrescriptions: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const loadRx = () => recordsService.getPrescriptions().then(setPrescriptions)

  useEffect(() => {
    loadRx()
    // Real-time sync when new prescription is created
    const handleSync = () => loadRx()
    window.addEventListener('swasthyasetu:records_sync', handleSync)
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('swasthyasetu_records_bus')
      channel.onmessage = (e) => { if (e.data?.type === 'NEW_PRESCRIPTION') loadRx() }
    } catch {}
    return () => {
      window.removeEventListener('swasthyasetu:records_sync', handleSync)
      channel?.close()
    }
  }, [])

  const doctorName = user?.name || (user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim() : 'Doctor')

  const isMarathi = i18n.language === 'mr'

  const filtered = prescriptions.filter(rx =>
    !searchQuery ||
    rx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary-600" />
            {isMarathi ? 'जारी केलेल्या डिजिटल औषधचिठ्ठ्या' : 'Issued Prescriptions Archive'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'तुम्ही रुग्णांना दिलेल्या सर्व डिजिटल प्रिस्क्रिप्शनचा अधिकृत वैद्यकीय संग्रह.'
              : 'Audit log of all digital prescriptions authored with dosage schedules and instructions.'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 shrink-0">
          <Printer className="w-4 h-4" />
          {isMarathi ? 'सर्व प्रिंट करा' : 'Print Archive'}
        </Button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filtered.map(rx => (
          <Card key={rx.id || rx._id} className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">
                    Rx ID: {rx.id || rx._id}
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground">
                    Diagnosis: {rx.diagnosis || 'Clinical follow-up'}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary-600" />
                  {new Date(rx.createdAt).toLocaleDateString()}
                  {rx.followUpDate && (
                    <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs">
                      Follow-up: {rx.followUpDate}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {rx.medications.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border/70 bg-card">
                    <p className="font-semibold text-foreground">{m.name}</p>
                    <p className="text-primary-600 mt-0.5">{m.dosage} • {m.frequency} • {m.duration}</p>
                    {m.instructions && <p className="text-[11px] text-muted-foreground italic mt-0.5">{m.instructions}</p>}
                  </div>
                ))}
              </div>

              {rx.notes && (
                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                  <strong>Clinical Advice:</strong> {rx.notes}
                </p>
              )}
            </CardContent>

            <CardFooter className="bg-muted/10 border-t border-border/50 p-3 flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Digitally signed by {doctorName}
              </span>
              <Button variant="ghost" size="sm" onClick={() => window.print()} className="h-7 text-xs gap-1">
                <Printer className="w-3.5 h-3.5" />
                {isMarathi ? 'प्रिंट' : 'Print Slip'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DoctorPrescriptions
