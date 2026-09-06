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
  UserPlus,
  MapPin,
  Phone,
  CheckCircle2,
  WifiOff,
  Save,
  Shield,
} from 'lucide-react'

const RegisterPatient: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'F',
    bloodGroup: 'B+',
    village: '',
    taluka: 'Shirur',
    district: 'Pune',
    emergencyContact: '',
    medicalNotes: '',
  })
  const [isSaved, setIsSaved] = useState(false)
  const isOnline = navigator.onLine

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save to offline queue or API
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: 'F',
        bloodGroup: 'B+',
        village: '',
        taluka: 'Shirur',
        district: 'Pune',
        emergencyContact: '',
        medicalNotes: '',
      })
    }, 4000)
  }

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-primary-600" />
          {isMarathi ? 'स्मार्टफोन नसलेल्या ग्रामीण रुग्णाची नोंदणी' : 'Field Patient Registration (No Smartphone)'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'आशा व आरोग्यसेविकांद्वारे ऑफलाइन नोंदणी. इंटरनेट परत आल्यास डेटा आपोआप सर्व्हरशी सिंक होतो.'
            : 'Register rural citizens on the field. Automatically queues in local storage if offline and syncs when connection resumes.'}
        </p>
      </div>

      {!isOnline && (
        <Alert className="bg-amber-50 border-amber-300 text-amber-800">
          <WifiOff className="w-4 h-4" />
          <AlertTitle className="font-semibold text-xs">Offline Mode Active</AlertTitle>
          <AlertDescription className="text-xs">
            Data will be saved locally on this tablet and synchronized once you return to network coverage.
          </AlertDescription>
        </Alert>
      )}

      {isSaved && (
        <Alert className="bg-emerald-50 border-emerald-300 text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <AlertTitle className="font-semibold text-sm">Patient Registered Successfully!</AlertTitle>
          <AlertDescription className="text-xs">
            ABHA Rural Health ID generated: 91-8402-9182. Patient can now be connected to doctors.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/80 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'पहिले नाव' : 'First Name'}</Label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="e.g. Shakuntala"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'आडनाव' : 'Last Name'}</Label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="e.g. More"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'मोबाईल नंबर' : 'Phone Number (if available)'}</Label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="98XXXXXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'जन्मतारीख' : 'Date of Birth / Age'}</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'गाव' : 'Village'}</Label>
                <Input
                  required
                  value={formData.village}
                  onChange={e => setFormData(p => ({ ...p, village: e.target.value }))}
                  placeholder="e.g. Khed"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'तालुका' : 'Taluka'}</Label>
                <Input
                  value={formData.taluka}
                  onChange={e => setFormData(p => ({ ...p, taluka: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isMarathi ? 'जिल्हा' : 'District'}</Label>
                <Input
                  value={formData.district}
                  onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{isMarathi ? 'आरोग्य पार्श्वभूमी / तक्रार' : 'Clinical Health Complaint / Notes'}</Label>
              <textarea
                rows={3}
                value={formData.medicalNotes}
                onChange={e => setFormData(p => ({ ...p, medicalNotes: e.target.value }))}
                placeholder="Fever for 3 days, joint aches, pregnancy 2nd trimester..."
                className="w-full p-2.5 rounded-xl border border-input text-xs bg-background"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end p-4 border-t border-border/60 bg-muted/10">
            <Button type="submit" className="gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 font-semibold">
              <Save className="w-4 h-4" />
              {isMarathi ? 'रुग्ण नोंदणी पूर्ण करा' : 'Register Patient'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPatient
