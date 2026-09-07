import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { doctorService, DEMO_DOCTORS } from '../../services/doctorService'
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
import { Badge } from '@/components/ui/badge'
import {
  Stethoscope,
  Search,
  Star,
  Video,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  ShieldCheck,
  Phone,
} from 'lucide-react'

const FindDoctor: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')

  useEffect(() => {
    doctorService.getDoctors().then(setDoctors)
  }, [])

  const isMarathi = i18n.language === 'mr'

  const filtered = doctors.filter(d => {
    const matchesSpec = selectedSpecialty === 'all' || d.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase())
    const docName = (d.user as any)?.name || `${(d.user as any)?.firstName} ${(d.user as any)?.lastName}`
    const matchesSearch =
      !searchQuery ||
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.qualification.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSpec && matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-primary-600" />
            {isMarathi ? '👨‍⚕️ तज्ज्ञ डॉक्टर शोधा' : 'Find Verified Doctors'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'महाराष्ट्र वैद्यकीय परिषदेद्वारे प्रमाणित डॉक्टरांशी व्हिडिओ किंवा प्रत्यक्ष सल्लामसलतीसाठी संपर्क साधा.'
              : 'Consult verified clinical specialists across General Medicine, Pediatrics, Cardiology, and Gynecology.'}
          </p>
        </div>

        <Button asChild className="gap-2 shrink-0 bg-gradient-to-r from-primary-600 to-indigo-600">
          <Link to="/patient/book-appointment">
            <Calendar className="w-4 h-4" />
            {isMarathi ? 'थेट भेट बुक करा' : 'Quick Booking'}
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 border-border/70 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'डॉक्टरांचे नाव किंवा विशेषज्ञता शोधा...' : 'Search doctor name, specialty, or qualifications...'}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="h-10 text-xs px-3 rounded-md border border-input bg-background"
          >
            <option value="all">{isMarathi ? 'सर्व विशेषज्ञता' : 'All Specialties'}</option>
            <option value="Dentistry">Dentistry / दंतचिकित्सा 🦷</option>
            <option value="Cardiology">Cardiology / हृदय ❤️</option>
            <option value="Pediatrics">Pediatrics / बालरोग 👶</option>
            <option value="Gynecology">Gynecology / स्त्रीरोग 🌸</option>
            <option value="Pulmonology">Pulmonology / श्वसन 🫁</option>
            <option value="Dermatology">Dermatology / त्वचा 🧴</option>
            <option value="Orthopedics">Orthopedics / सांधे व हाडे 🦴</option>
          </select>
        </div>
      </Card>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(doc => {
          const name = (doc.user as any)?.name || `${(doc.user as any)?.firstName} ${(doc.user as any)?.lastName}`
          return (
            <Card key={doc.id || doc._id} className="border-border/80 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                    {name.replace('Dr. ', '').charAt(0)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                        {name}
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {doc.rating}
                      </div>
                    </div>
                    <p className="text-xs text-primary-600 font-semibold">{doc.specialization}</p>
                    <p className="text-xs text-muted-foreground">{doc.qualification}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Reg: {doc.registrationNumber} • {doc.experience} Years Clinical Experience
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs pt-0">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{isMarathi ? 'तपासणी शुल्क' : 'Consultation Fee'}</span>
                    <span className="text-sm font-bold text-foreground">₹{doc.consultationFee}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                    {doc.teleconsultationEnabled ? '✓ Available for Teleconsult' : 'In-Person'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    {isMarathi ? 'नियमित वेळ:' : 'Weekly Schedule:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {doc.availability.map((av, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {av.day}: {av.startTime} - {av.endTime}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
                <Button
                  asChild
                  className="gap-1.5 text-xs bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium"
                >
                  <Link 
                    to={`/patient/book-appointment?doctorId=${doc.id || doc._id}`}
                    state={{ doctorId: doc.id || doc._id }}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {isMarathi ? 'भेट बुक करा (Book Appointment)' : 'Book Consultation'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default FindDoctor
