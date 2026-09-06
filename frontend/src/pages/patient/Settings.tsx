import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
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
  Globe,
  Bell,
  Shield,
  Smartphone,
  CheckCircle2,
  Save,
  PhoneCall,
  HardDrive,
  Download,
} from 'lucide-react'

export default function PatientSettings() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  const [language, setLanguage] = useState(i18n.language || 'mr')
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)
  const [medicineAlerts, setMedicineAlerts] = useState(true)
  const [offlineSync, setOfflineSync] = useState(true)
  const [abhaLinked, setAbhaLinked] = useState(true)
  const [abhaId, setAbhaId] = useState('91-8472-9102-4412')
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98220 12345')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <span>⚙️</span> {t('nav.settings', 'Settings & Preferences')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage language, ABHA digital health ID, notifications, and offline preferences.
        </p>
      </div>

      {savedSuccess && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <AlertTitle className="font-semibold">Preferences Saved Successfully!</AlertTitle>
          <AlertDescription className="text-xs text-emerald-700">
            Your notifications, language, and emergency settings have been updated across your profile.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Selection */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Language / भाषा / भाषा निवडा</CardTitle>
                <CardDescription>
                  Choose your preferred language for the interface, voice guides, and notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: 'mr', label: 'मराठी', sublabel: 'Marathi (Default for Maharashtra Rural)' },
                { code: 'hi', label: 'हिंदी', sublabel: 'Hindi (Rashtrabhasha)' },
                { code: 'en', label: 'English', sublabel: 'English' },
              ].map(langItem => (
                <button
                  type="button"
                  key={langItem.code}
                  onClick={() => handleLanguageChange(langItem.code)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    language === langItem.code
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-base">{langItem.label}</span>
                    {language === langItem.code && (
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">{langItem.sublabel}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ayushman Bharat Digital Mission (ABHA) */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">ABHA Digital Health ID (ABDM)</CardTitle>
                  <CardDescription>
                    Ayushman Bharat Health Account allows seamless sharing of medical records with verified doctors
                  </CardDescription>
                </div>
              </div>
              <Badge variant={abhaLinked ? 'default' : 'secondary'} className={abhaLinked ? 'bg-emerald-600' : ''}>
                {abhaLinked ? 'Linked & Verified' : 'Not Linked'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="abhaId">ABHA Number</Label>
                <Input
                  id="abhaId"
                  value={abhaId}
                  onChange={e => setAbhaId(e.target.value)}
                  placeholder="14-digit ABHA ID"
                  className="mt-1 font-mono tracking-wider"
                />
                <p className="text-xs text-gray-500 mt-1">
                  National Health Authority authorized identity for Indian healthcare.
                </p>
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Number</Label>
                <div className="relative mt-1">
                  <PhoneCall className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    className="pl-9"
                    placeholder="+91 Mobile number"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Receives automated alerts if high vitals anomaly is detected during AI screening.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Channels */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Rural Notification Channels</CardTitle>
                <CardDescription>
                  Keep notifications active even in low-bandwidth rural connectivity
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900">SMS Appointment & Prescription Alerts</p>
                <p className="text-xs text-gray-500">
                  Receive basic feature-phone SMS when doctor writes a prescription or confirms slot
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={e => setSmsNotifications(e.target.checked)}
                className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900">WhatsApp Health Updates</p>
                <p className="text-xs text-gray-500">
                  Receive PDF prescriptions and video teleconsultation links directly on WhatsApp
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={e => setWhatsappAlerts(e.target.checked)}
                className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900">Daily Medicine Reminder Chimes</p>
                <p className="text-xs text-gray-500">
                  Audible reminders for morning, afternoon, and night dosage schedules
                </p>
              </div>
              <input
                type="checkbox"
                checked={medicineAlerts}
                onChange={e => setMedicineAlerts(e.target.checked)}
                className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Offline Storage & Sync */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Offline Cache & Local Records</CardTitle>
                <CardDescription>
                  Keep your digital health records viewable even when offline in remote villages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Offline Access Enabled</p>
                <p className="text-xs text-gray-500">
                  Encrypted local copy of prescriptions and emergency cards stored on this device
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Cached (1.8 MB)
              </span>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => alert('Offline health card downloaded to your device!')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download Offline Health Emergency Card
            </Button>
            <Button type="submit" className="gap-2 bg-primary-600 hover:bg-primary-700">
              <Save className="w-4 h-4" /> Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  )
}
