import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  Video,
  Save,
  CheckCircle2,
  Settings,
  ShieldCheck,
} from 'lucide-react'

const DoctorSchedule: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [teleconsultEnabled, setTeleconsultEnabled] = useState(true)
  const [fee, setFee] = useState('300')
  const [days, setDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: false,
  })
  const [morningSlot, setMorningSlot] = useState({ start: '09:00 AM', end: '01:00 PM' })
  const [eveningSlot, setEveningSlot] = useState({ start: '02:00 PM', end: '06:00 PM' })
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleDayToggle = (day: keyof typeof days) => {
    setDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Clock className="w-7 h-7 text-primary-600" />
          {isMarathi ? 'वेळापत्रक व उपलब्धता सेटिंग्ज' : 'Doctor Schedule & Availability'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'दूरस्थ व्हिडिओ सल्लामसलतीचे कामाचे तास, दिवस आणि तपासणी शुल्क नियंत्रित करा.'
            : 'Configure working hours, teleconsultation availability, and consultation slots.'}
        </p>
      </div>

      {savedSuccess && (
        <Alert className="bg-emerald-50 border-emerald-300 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertTitle className="font-semibold">Schedule Updated Successfully!</AlertTitle>
          <AlertDescription className="text-xs">
            Your weekly consultation hours and teleconsultation toggle have been synced.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Teleconsultation Switch */}
        <Card className="border-border/80 shadow-xs p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary-600" />
                {isMarathi ? 'व्हिडिओ सल्लामसलत सुरू ठेवा' : 'Enable Digital Teleconsultations'}
              </h3>
              <p className="text-xs text-muted-foreground">
                When enabled, rural patients can book video call appointments with you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTeleconsultEnabled(!teleconsultEnabled)}
              className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                teleconsultEnabled ? 'bg-primary-600' : 'bg-muted'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                  teleconsultEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Working Days */}
        <Card className="border-border/80 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-base text-foreground">Available Working Days</h3>
            <p className="text-xs text-muted-foreground">Select days you accept appointments:</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {Object.entries(days).map(([day, isAvailable]) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day as any)}
                className={`p-3 rounded-xl text-center border font-medium text-xs transition-all cursor-pointer ${
                  isAvailable
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </Card>

        {/* Slot Timings & Fee */}
        <Card className="border-border/80 shadow-xs p-5 space-y-4">
          <h3 className="font-semibold text-base text-foreground">Time Slots & Consultation Fee</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Morning Shift Hours:</Label>
              <Input
                value={`${morningSlot.start} - ${morningSlot.end}`}
                onChange={() => {}}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Afternoon Shift Hours:</Label>
              <Input
                value={`${eveningSlot.start} - ${eveningSlot.end}`}
                onChange={() => {}}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Consultation Fee (₹):</Label>
              <Input
                type="number"
                value={fee}
                onChange={e => setFee(e.target.value)}
                className="text-xs font-bold"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2 px-8 bg-gradient-to-r from-primary-600 to-indigo-600 font-semibold">
            <Save className="w-4 h-4" />
            {isMarathi ? 'वेळापत्रक जतन करा' : 'Save Schedule Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DoctorSchedule
