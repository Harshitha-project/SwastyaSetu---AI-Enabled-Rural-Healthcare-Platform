import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { appointmentService } from '../../services/appointmentService'
import type { Appointment } from '../../types'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  Video,
  Building2,
  User,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'

const DoctorAppointments: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    appointmentService.getAppointments().then(data => {
      setAppointments(data)
      setIsLoading(false)
    })
  }, [])

  const handleMarkComplete = async (id: string) => {
    await appointmentService.updateStatus(id, 'COMPLETED')
    const updated = await appointmentService.getAppointments()
    setAppointments(updated)
  }

  const isMarathi = i18n.language === 'mr'

  const activeAppointments = appointments.filter(
    a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  )
  const completedAppointments = appointments.filter(
    a => a.status === 'COMPLETED' || a.status === 'CANCELLED'
  )

  const renderDoctorAppointmentRow = (apt: Appointment) => {
    const patName =
      (apt.patient?.user as any)?.name ||
      `${(apt.patient?.user as any)?.firstName || 'Ramesh'} ${(apt.patient?.user as any)?.lastName || 'Patil'}`
    const village = apt.patient?.address?.village || 'Shirur'
    const isVideo = apt.type === 'VIDEO'
    const isHighRisk = apt.patient?.riskLevel === 'HIGH' || apt.patient?.riskLevel === 'CRITICAL'

    return (
      <Card
        key={apt.id || apt._id}
        className={`p-5 border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isHighRisk
            ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-border/80 bg-card hover:border-primary/40'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base shrink-0 mt-0.5">
            {patName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-foreground">{patName}</h3>
              <Badge
                variant={
                  apt.patient?.riskLevel === 'HIGH'
                    ? 'destructive'
                    : apt.patient?.riskLevel === 'MODERATE'
                    ? 'default'
                    : 'secondary'
                }
                className="text-xs"
              >
                {apt.patient?.riskLevel || 'LOW'} RISK
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                {isVideo ? <Video className="w-3 h-3 text-primary-600" /> : <Building2 className="w-3 h-3" />}
                {apt.type}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Village: {village}, Pune • Date: <strong className="text-foreground">{apt.scheduledDate}</strong> at <strong className="text-foreground">{apt.scheduledTime}</strong>
            </p>

            {apt.reason && (
              <p className="text-xs text-muted-foreground pt-0.5 italic">
                Reason: "{apt.reason}"
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <Button asChild size="sm" variant="outline" className="text-xs h-8">
            <Link to={`/doctor/patients/${apt.patientId}`}>
              <FileText className="w-3.5 h-3.5 mr-1" />
              {isMarathi ? 'रुग्ण EMR' : 'View EMR'}
            </Link>
          </Button>

          {apt.status !== 'COMPLETED' ? (
            <>
              {isVideo && (
                <Button
                  asChild
                  size="sm"
                  className="text-xs h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-xs"
                >
                  <Link to={`/doctor/consultation/${apt.id || apt._id}`}>
                    <Video className="w-3.5 h-3.5" />
                    {isMarathi ? 'सल्लामसलत सुरू करा' : 'Start Consult'}
                  </Link>
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-8"
                onClick={() => handleMarkComplete(apt.id || apt._id)}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {isMarathi ? 'पूर्ण झाली' : 'Mark Done'}
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="text-xs text-emerald-700 bg-emerald-100">
              Completed
            </Badge>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary-600" />
          {isMarathi ? 'डॉक्टरांचे अपॉइंटमेंट वेळापत्रक' : 'Doctor Appointment Management'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'आजच्या व आगामी सर्व दूरस्थ टेलिमेडिसिन सल्लामसलतींचे नियोजन व व्यवस्थापन.'
            : 'Review scheduled patient consultations, launch telemedicine workspaces, and issue digital prescriptions.'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="active" className="text-xs">
            {isMarathi ? 'सक्रिय भेटी' : 'Active Queue'} ({activeAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            {isMarathi ? 'पूर्ण झालेल्या' : 'Completed'} ({completedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 pt-4">
          {activeAppointments.length > 0 ? (
            activeAppointments.map(renderDoctorAppointmentRow)
          ) : (
            <Card className="p-8 text-center border-dashed">
              <p className="text-xs text-muted-foreground">No active appointments in the queue.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 pt-4">
          {completedAppointments.length > 0 ? (
            completedAppointments.map(renderDoctorAppointmentRow)
          ) : (
            <Card className="p-8 text-center border-dashed">
              <p className="text-xs text-muted-foreground">No completed appointments yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DoctorAppointments
