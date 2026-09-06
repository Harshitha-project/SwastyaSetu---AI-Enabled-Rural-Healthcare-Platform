import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Phone,
  User,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'

const Appointments: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    setIsLoading(true)
    try {
      const data = await appointmentService.getAppointments()
      setAppointments(data)
    } catch (e) {
      console.error('Failed to load appointments', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await appointmentService.cancelAppointment(id)
      loadAppointments()
    }
  }

  const isMarathi = i18n.language === 'mr'

  const upcoming = appointments.filter(
    a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  )
  const past = appointments.filter(
    a => a.status === 'COMPLETED' || a.status === 'CANCELLED'
  )

  const renderAppointmentCard = (apt: Appointment) => {
    const doctorName =
      (apt.doctor?.user as any)?.name ||
      `${(apt.doctor?.user as any)?.firstName || 'Dr. Rajesh'} ${(apt.doctor?.user as any)?.lastName || 'Patil'}`
    const specialty = apt.doctor?.specialization || 'General Physician'
    const isVideo = apt.type === 'VIDEO'

    return (
      <Card key={apt.id || apt._id} className="overflow-hidden border-border/70 shadow-sm hover:border-primary/40 transition-all">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
              {doctorName.replace('Dr. ', '').charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-foreground">{doctorName}</h3>
                <Badge
                  variant={
                    apt.status === 'CONFIRMED'
                      ? 'default'
                      : apt.status === 'IN_PROGRESS'
                      ? 'destructive'
                      : apt.status === 'COMPLETED'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {apt.status}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  {isVideo ? <Video className="w-3 h-3 text-primary-600" /> : <Building2 className="w-3 h-3" />}
                  {apt.type}
                </Badge>
              </div>

              <p className="text-xs text-primary-600 font-medium">{specialty}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary-600" />
                  {apt.scheduledDate}
                </span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                  {apt.scheduledTime}
                </span>
              </div>

              {apt.reason && (
                <p className="text-xs text-muted-foreground pt-1 italic line-clamp-1">
                  "{apt.reason}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {isVideo && (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED' || apt.status === 'IN_PROGRESS') && (
              <Button
                asChild
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-sm"
              >
                <Link to={`/patient/consultation/${apt.id || apt._id}`}>
                  <Video className="w-4 h-4" />
                  {isMarathi ? 'कॉल जोडा (Join Call)' : 'Join Video Call'}
                </Link>
              </Button>
            )}

            {(apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(apt.id || apt._id)}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </Button>
            )}

            {apt.status === 'COMPLETED' && (
              <Button asChild variant="secondary" size="sm" className="text-xs gap-1">
                <Link to="/patient/records">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isMarathi ? 'प्रिस्क्रिप्शन पहा' : 'View Rx / Summary'}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-600" />
            {isMarathi ? 'माझ्या डॉक्टरांच्या भेटी' : 'My Appointments'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'आगामी व मागील सर्व डॉक्टरांच्या भेटींचे व्यवस्थापन करा आणि व्हिडिओ कॉल सुरू करा.'
              : 'Manage upcoming video teleconsultations and physical clinic appointments.'}
          </p>
        </div>
        <Button asChild className="gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-sm">
          <Link to="/patient/book-appointment">
            <PlusCircle className="w-4 h-4" />
            {isMarathi ? '+ नवीन भेट बुक करा' : '+ Book Consultation'}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" onValueChange={v => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="upcoming" className="text-xs">
            {isMarathi ? 'आगामी भेटी' : 'Upcoming'} ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs">
            {isMarathi ? 'मागील भेटी' : 'Past / Completed'} ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 pt-4">
          {upcoming.length > 0 ? (
            upcoming.map(renderAppointmentCard)
          ) : (
            <Card className="p-10 text-center border-dashed border-2">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-semibold text-base text-foreground mb-1">
                {isMarathi ? 'कोणतीही आगामी भेट निश्चित नाही' : 'No upcoming appointments scheduled'}
              </h3>
              <p className="text-xs text-muted-foreground mb-5 max-w-sm mx-auto">
                {isMarathi
                  ? 'तुम्हाला लक्षणे जाणवत असल्यास तज्ज्ञ डॉक्टरांशी व्हिडिओ किंवा प्रत्यक्ष भेटीसाठी वेळ बुक करा.'
                  : 'If you are experiencing any health symptoms, schedule a consultation with an available physician.'}
              </p>
              <Button asChild className="gap-2">
                <Link to="/patient/book-appointment">
                  <PlusCircle className="w-4 h-4" />
                  {isMarathi ? 'आताच भेट बुक करा' : 'Book Appointment Now'}
                </Link>
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 pt-4">
          {past.length > 0 ? (
            past.map(renderAppointmentCard)
          ) : (
            <Card className="p-8 text-center border-dashed border-2">
              <p className="text-xs text-muted-foreground">
                {isMarathi ? 'मागील कोणतीही नोंद उपलब्ध नाही' : 'No past appointments found'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Appointments
