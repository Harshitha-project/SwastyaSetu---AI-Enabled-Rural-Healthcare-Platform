import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { appointmentService } from '../../services/appointmentService'
import { patientService } from '../../services/patientService'
import type { Appointment, Patient } from '../../types'
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Users,
  Calendar,
  AlertTriangle,
  Video,
  Clock,
  ArrowRight,
  Stethoscope,
  Activity,
  FileText,
  CheckCircle2,
  Phone,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { TokenQueueCard } from '../../components/teleconsultation/TokenQueueCard'
import { callNotificationService } from '../../services/callNotificationService'

const DoctorDashboard: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleStartCall = () => {
    const doctorFullName = user?.name || (user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim() : 'Doctor')
    callNotificationService.initiateCall({
      doctorName: doctorFullName,
      doctorSpecialty: 'Senior Telemedicine Consultant',
      appointmentId: 'apt-101',
      roomId: 'room-apt-101',
      tokenNumber: '#A-14',
    })
    navigate('/doctor/consultation/apt-101')
  }

  useEffect(() => {
    Promise.all([
      appointmentService.getAppointments(),
      patientService.listPatients(),
    ]).then(([apts, pats]) => {
      setAppointments(apts)
      setPatients(pats)
      setIsLoading(false)
    }).catch(err => {
      console.error('Failed to load dashboard data:', err)
      setIsLoading(false)
    })
  }, [])

  const isMarathi = i18n.language === 'mr'

  // Show loading while auth or data is loading
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const highRiskPatients = patients.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL')
  const todaysAppointments = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-800 to-indigo-900 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/20 text-white shadow-inner">
              👨‍⚕️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Welcome, Dr. {user?.firstName} {user?.lastName}!
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs">
                  Verified Doctor
                </Badge>
              </div>
              <p className="text-primary-100 text-sm mt-1">
                {isMarathi
                  ? `आज तुमच्याकडे ${todaysAppointments.length} रुग्ण तपासणीसाठी नियोजित आहेत. ${highRiskPatients.length} रुग्णांना त्वरित लक्ष देण्याची गरज आहे.`
                  : `You have ${todaysAppointments.length} patient appointments scheduled today. ${highRiskPatients.length} high-risk rural cases flagged by AI triage.`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="bg-white text-primary-800 hover:bg-primary-50 font-semibold shadow-sm">
              <Link to="/doctor/appointments">
                <Calendar className="w-4 h-4 mr-1.5" />
                {isMarathi ? 'आजच्या भेटी' : "Today's Queue"}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* OPD Token Queue & Doctor Availability Manager */}
      <TokenQueueCard isDoctorView={true} onCallPatient={handleStartCall} />

      {/* High-Risk Patient Alert Banner */}
      {highRiskPatients.length > 0 && (
        <Alert className="bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-200">
          <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <AlertTitle className="font-bold flex items-center gap-2 text-sm">
              <span>⚠️ {isMarathi ? 'उच्च जोखीम रुग्ण अलर्ट (High-Risk Triage Alert)' : 'High-Risk Priority Alert'}</span>
              <Badge variant="destructive" className="text-[10px] py-0 px-2">
                {highRiskPatients.length} High Risk
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {isMarathi
                ? 'खालील रुग्णांच्या एआय तपासणीत असामान्य रक्तदाब किंवा ऑक्सिजन पातळी आढळली आहे. त्वरित प्राधान्य द्या.'
                : 'AI Symptom & Vitals Checker flagged elevated clinical risk for rural patients. Review history or initiate teleconsultation.'}
            </AlertDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs text-rose-700 border-rose-300 shrink-0">
            <Link to="/doctor/patients?risk=HIGH">
              {isMarathi ? 'रुग्ण पहा' : 'View Patients'}
            </Link>
          </Button>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: isMarathi ? 'एकूण रुग्ण' : 'Total Patients',
            value: patients.length + 140,
            icon: Users,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
          },
          {
            label: isMarathi ? 'आजच्या भेटी' : "Today's Appointments",
            value: todaysAppointments.length,
            icon: Calendar,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
          },
          {
            label: isMarathi ? 'उच्च जोखीम रुग्ण' : 'High-Risk Cases',
            value: highRiskPatients.length,
            icon: AlertTriangle,
            color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
          },
          {
            label: isMarathi ? 'पूर्ण केलेल्या सल्लामसलती' : 'Teleconsults Done',
            value: 48,
            icon: Video,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30',
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 border-border/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main Grid: Today's Appointment Queue (left) + High Priority Triage (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  {isMarathi ? 'आजचे अपॉइंटमेंट वेळापत्रक' : "Today's Patient Queue"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isMarathi ? 'सल्लामसलत सुरू करण्यासाठी कॉल बटनावर क्लिक करा' : 'Click Join to launch interactive telemedicine workspace'}
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary-600">
                <Link to="/doctor/appointments">
                  {isMarathi ? 'सर्व पहा' : 'View All'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map(apt => {
                  const patName =
                    (apt.patient?.user as any)?.name ||
                    `${(apt.patient?.user as any)?.firstName || 'Ramesh'} ${(apt.patient?.user as any)?.lastName || 'Patil'}`
                  const village = apt.patient?.address?.village || 'Shirur'
                  const isVideo = apt.type === 'VIDEO'
                  return (
                    <div
                      key={apt.id || apt._id}
                      className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                          {patName.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-foreground">{patName}</h4>
                            <Badge
                              variant={
                                apt.patient?.riskLevel === 'HIGH'
                                  ? 'destructive'
                                  : apt.patient?.riskLevel === 'MODERATE'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {apt.patient?.riskLevel || 'LOW'} RISK
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {village}, Pune • Scheduled: <span className="font-medium text-foreground">{apt.scheduledTime}</span>
                          </p>
                          {apt.reason && (
                            <p className="text-xs text-muted-foreground italic">
                              "{apt.reason}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button asChild size="sm" variant="outline" className="text-xs h-8">
                          <Link to={`/doctor/patients/${apt.patientId}`}>
                            {isMarathi ? 'रेकॉर्ड्स' : 'EMR'}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="text-xs h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-xs"
                        >
                          <Link to={`/doctor/consultation/${apt.id || apt._id}`}>
                            <Video className="w-3.5 h-3.5" />
                            {isMarathi ? 'सुरू करा' : 'Start Consult'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No appointments scheduled in the active queue.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* High-Risk Triage Column (1 col) */}
        <div className="space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {isMarathi ? 'प्राधान्य रुग्ण (High Risk)' : 'Priority Triage'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isMarathi ? 'एआय-फ्लॅग केलेले गंभीर रुग्ण' : 'Flagged rural cases requiring doctor attention'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {highRiskPatients.map(pat => {
                const name = (pat.user as any)?.name || `${(pat.user as any)?.firstName} ${(pat.user as any)?.lastName}`
                return (
                  <div
                    key={pat.id || pat._id}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{name}</span>
                      <Badge variant="destructive" className="text-[10px]">
                        HIGH RISK
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Village: {pat.address?.village}, {pat.address?.district} • Blood: {pat.bloodGroup || 'O+'}
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 text-[11px] font-medium">
                      ⚠️ History: {pat.medicalHistory?.join(', ') || 'Hypertension, High Blood Sugar'}
                    </p>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary-600">
                        <Link to={`/doctor/patients/${pat.id || pat._id}`}>
                          {isMarathi ? 'इतिहास पहा' : 'View EMR History'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
