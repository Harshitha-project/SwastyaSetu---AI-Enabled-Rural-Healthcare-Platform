import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { doctorService } from '../../services/doctorService'
import { appointmentService } from '../../services/appointmentService'
import type { Doctor } from '../../types'
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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  UserCheck,
  Stethoscope,
  Building2,
  CheckCircle2,
  ChevronRight,
  Shield,
  Star,
  Activity,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

const BookAppointment: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  )
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'IN_PERSON' | 'AUDIO'>('VIDEO')
  const [reason, setReason] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookedSuccess, setBookedSuccess] = useState<any>(null)

  // Load doctors
  useEffect(() => {
    doctorService.getDoctors().then(data => {
      setDoctors(data)
      if (data.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(data[0].id || data[0]._id)
      }
    })
  }, [])

  // Load slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      doctorService.getAvailableSlots(selectedDoctorId, selectedDate).then(slots => {
        setAvailableSlots(slots)
        if (slots.length > 0) setSelectedSlot(slots[0])
      })
    }
  }, [selectedDoctorId, selectedDate])

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId || d._id === selectedDoctorId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctorId || !selectedDate || !selectedSlot) return

    setIsBooking(true)
    try {
      const apt = await appointmentService.createAppointment({
        doctorId: selectedDoctorId,
        scheduledDate: selectedDate,
        scheduledTime: selectedSlot,
        type: consultationType,
        reason: reason || 'General medical consultation and symptom review',
      })
      setBookedSuccess(apt)
    } catch (err) {
      console.error('Booking failed', err)
    } finally {
      setIsBooking(false)
    }
  }

  const isMarathi = i18n.language === 'mr'

  if (bookedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-emerald-500/80 bg-gradient-to-b from-emerald-50/50 via-card to-card dark:from-emerald-950/20 text-center p-8 shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {isMarathi ? 'भेट यशस्वीरित्या बुक झाली!' : 'Appointment Confirmed!'}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {isMarathi
                ? 'डॉक्टरांना सूचना पाठवली आहे. सल्लामसलतीच्या वेळेपूर्वी ५ मिनिटे आधी लॉग इन करा.'
                : 'Your teleconsultation has been scheduled. You will receive an SMS reminder before the slot.'}
            </p>

            <div className="p-4 rounded-xl bg-card border border-border/80 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isMarathi ? 'डॉक्टर' : 'Doctor'}:</span>
                <span className="font-semibold text-foreground">
                  {(selectedDoctor?.user as any)?.name || (selectedDoctor?.user as any)?.firstName || 'Dr. Rajesh Patil'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isMarathi ? 'विशेषज्ञता' : 'Specialization'}:</span>
                <span className="font-medium text-foreground">{selectedDoctor?.specialization}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isMarathi ? 'तारीख व वेळ' : 'Date & Time'}:</span>
                <span className="font-medium text-foreground">{selectedDate} at {selectedSlot}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isMarathi ? 'प्रकार' : 'Consultation Mode'}:</span>
                <Badge variant="secondary" className="gap-1">
                  <Video className="w-3 h-3 text-primary-600" /> {consultationType}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/patient/appointments')} className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {isMarathi ? 'माझ्या सर्व भेटी पहा' : 'View My Appointments'}
              </Button>
              <Button variant="outline" onClick={() => setBookedSuccess(null)}>
                {isMarathi ? 'दुसरी भेट बुक करा' : 'Book Another'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-primary-600" />
          {isMarathi ? '📅 डॉक्टरांची भेट बुक करा' : '📅 Book a Consultation'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'तज्ज्ञ डॉक्टरांची निवड करा, सोयीची वेळ ठरवा आणि व्हिडिओ किंवा प्रत्यक्ष तपासणीसाठी भेट निश्चित करा.'
            : 'Schedule a secure digital teleconsultation or hospital visit with verified medical specialists.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Consultation Type */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {isMarathi ? '१. सल्लामसलतीचा प्रकार निवडा' : '1. Select Consultation Mode'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                type: 'VIDEO',
                title: isMarathi ? 'व्हिडिओ कॉल' : 'Video Teleconsultation',
                desc: isMarathi ? 'घरी बसून डॉक्टरांशी बोला' : 'High definition video from your phone',
                icon: Video,
              },
              {
                type: 'IN_PERSON',
                title: isMarathi ? 'प्रत्यक्ष भेट (PHC/क्लिनिक)' : 'In-Person Hospital Visit',
                desc: isMarathi ? 'प्राथमिक आरोग्य केंद्रात जा' : 'Physical examination at clinic/PHC',
                icon: Building2,
              },
              {
                type: 'AUDIO',
                title: isMarathi ? 'ऑडिओ कॉल' : 'Phone / Audio Call',
                desc: isMarathi ? 'कमी इंटरनेट बँडविड्थ' : 'Works seamlessly on 2G/poor network',
                icon: Clock,
              },
            ].map(mode => {
              const Icon = mode.icon
              const isSelected = consultationType === mode.type
              return (
                <div
                  key={mode.type}
                  onClick={() => setConsultationType(mode.type as any)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-sm text-foreground">{mode.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Step 2: Select Doctor */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  {isMarathi ? '२. उपलब्ध डॉक्टर निवडा' : '2. Choose Available Specialist'}
                </CardTitle>
                <CardDescription>
                  {isMarathi ? 'महाराष्ट्र शासन व वैद्यकीय परिषदेद्वारे प्रमाणित' : 'Verified medical practitioners'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="spec-filter" className="text-xs text-muted-foreground">Filter:</Label>
                <select
                  id="spec-filter"
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="h-8 text-xs px-2.5 rounded-md border border-input bg-background"
                >
                  <option value="all">All Specialties / सर्व</option>
                  <option value="Cardiology">Cardiology / हृदय</option>
                  <option value="Pediatrics">Pediatrics / बालरोग</option>
                  <option value="Gynecology">Gynecology / स्त्रीरोग</option>
                  <option value="Pulmonology">Pulmonology / श्वसन</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors
              .filter(d => selectedSpecialty === 'all' || d.specialization.includes(selectedSpecialty))
              .map(doc => {
                const isSelected = (doc.id || doc._id) === selectedDoctorId
                const name = (doc.user as any)?.name || `${(doc.user as any)?.firstName} ${(doc.user as any)?.lastName}`
                return (
                  <div
                    key={doc.id || doc._id}
                    onClick={() => setSelectedDoctorId(doc.id || doc._id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex gap-4 ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm'
                        : 'border-border bg-card hover:border-border/90'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-foreground">{name}</h4>
                        <div className="flex items-center text-xs text-amber-500 font-bold gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {doc.rating}
                        </div>
                      </div>
                      <p className="text-xs text-primary-600 font-medium">{doc.specialization}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.qualification} • {doc.experience} yrs exp</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-foreground">₹{doc.consultationFee} fee</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                          {doc.teleconsultationEnabled ? 'Available for Video' : 'In-Person only'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>

        {/* Step 3: Date & Slot Picker */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {isMarathi ? '३. तारीख व वेळ निवडा' : '3. Select Preferred Date & Slot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="datePicker">{isMarathi ? 'तारीख' : 'Date'}</Label>
                <Input
                  id="datePicker"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isMarathi ? 'उपलब्ध वेळ (Time Slots)' : 'Available Slots for Selected Date'}
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {availableSlots.map(slot => {
                  const isSelected = selectedSlot === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Health Reason */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {isMarathi ? '४. आजाराचे किंवा भेटीचे कारण' : '4. Reason for Consultation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={
                isMarathi
                  ? 'लक्षणे किंवा डॉक्टरांना सांगायची माहिती येथे लिहा (उदा. ३ दिवसांपासून खोकला व ताप आहे)...'
                  : 'Briefly describe your symptoms or what you would like to discuss with the doctor...'
              }
              className="w-full p-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t border-border/40">
            <Button variant="ghost" type="button" onClick={() => navigate('/patient')}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isBooking || !selectedDoctorId || !selectedSlot}
              className="gap-2 px-8 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium"
            >
              {isBooking ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  {isMarathi ? 'बुक करत आहे...' : 'Confirming Booking...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isMarathi ? 'भेट निश्चित करा (Confirm)' : 'Confirm Appointment'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default BookAppointment
