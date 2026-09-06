import React, { useState } from 'react'
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
  Settings,
  Cpu,
  MessageSquare,
  ShieldCheck,
  PhoneCall,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react'

export default function AdminSettings() {
  const [systolicAlert, setSystolicAlert] = useState('160')
  const [spo2Alert, setSpo2Alert] = useState('92')
  const [bloodSugarAlert, setBloodSugarAlert] = useState('250')
  const [smsGateway, setSmsGateway] = useState('Govt CDAC / NIC SMS Gateway')
  const [abdmClientId, setAbdmClientId] = useState('ABDM_MH_HEALTH_2025_PROD')
  const [ambulanceNumber, setAmbulanceNumber] = useState('108')
  const [healthHelpline, setHealthHelpline] = useState('104')
  const [aiTriageAutoReferral, setAiTriageAutoReferral] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <span>⚙️</span> Platform Administration & Clinical Thresholds (प्रणाली सेटिंग्ज)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure clinical AI triage trigger levels, ABDM integration, rural SMS dispatch, and emergency hotlines
        </p>
      </div>

      {isSaved && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <AlertTitle className="font-semibold">System Settings Updated!</AlertTitle>
          <AlertDescription className="text-xs text-emerald-700">
            Clinical AI thresholds and gateway configurations have been successfully distributed to all nodes.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinical AI Risk Thresholds */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">AI Clinical Triage Alert Trigger Thresholds</CardTitle>
                <CardDescription className="text-xs">
                  Patients with vitals breaching these limits are automatically elevated to HIGH RISK and queued for urgent doctor review
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="systolic" className="text-xs font-semibold">
                  Critical Systolic BP (mmHg)
                </Label>
                <Input
                  id="systolic"
                  type="number"
                  value={systolicAlert}
                  onChange={e => setSystolicAlert(e.target.value)}
                  className="mt-1 text-sm font-semibold"
                />
                <p className="text-[11px] text-gray-500 mt-1">Trigger hypertensive crisis alert</p>
              </div>

              <div>
                <Label htmlFor="spo2" className="text-xs font-semibold">
                  Critical SpO2 Threshold (%)
                </Label>
                <Input
                  id="spo2"
                  type="number"
                  value={spo2Alert}
                  onChange={e => setSpo2Alert(e.target.value)}
                  className="mt-1 text-sm font-semibold"
                />
                <p className="text-[11px] text-gray-500 mt-1">Hypoxia warning trigger</p>
              </div>

              <div>
                <Label htmlFor="sugar" className="text-xs font-semibold">
                  Critical Blood Sugar (mg/dL)
                </Label>
                <Input
                  id="sugar"
                  type="number"
                  value={bloodSugarAlert}
                  onChange={e => setBloodSugarAlert(e.target.value)}
                  className="mt-1 text-sm font-semibold"
                />
                <p className="text-[11px] text-gray-500 mt-1">Hyperglycemia screening flag</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-gray-900">Automated High-Risk Doctor Teleconsult Escalation</p>
                <p className="text-[11px] text-gray-500">
                  When AI flags HIGH RISK, automatically reserve earliest slot in duty doctor teleconsult queue
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiTriageAutoReferral}
                onChange={e => setAiTriageAutoReferral(e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* National Health Authority & ABDM Config */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Ayushman Bharat Digital Mission (ABDM) Integration</CardTitle>
                <CardDescription className="text-xs">
                  FHIR v4.0.1 compliant state health information exchange connectivity
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="abdmClientId" className="text-xs font-semibold">
                  ABDM Facility Client ID
                </Label>
                <Input
                  id="abdmClientId"
                  value={abdmClientId}
                  onChange={e => setAbdmClientId(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="smsGateway" className="text-xs font-semibold">
                  Rural SMS / DLT Gateway Provider
                </Label>
                <Input
                  id="smsGateway"
                  value={smsGateway}
                  onChange={e => setSmsGateway(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Hotlines */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Public Emergency Hotlines</CardTitle>
                <CardDescription className="text-xs">
                  Numbers dialled directly by emergency one-tap buttons across patient and field worker apps
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amb" className="text-xs font-semibold">
                  State Emergency Ambulance
                </Label>
                <Input
                  id="amb"
                  value={ambulanceNumber}
                  onChange={e => setAmbulanceNumber(e.target.value)}
                  className="mt-1 font-mono font-bold text-base"
                />
              </div>
              <div>
                <Label htmlFor="help" className="text-xs font-semibold">
                  Arogya Sahayata 24x7 Helpline
                </Label>
                <Input
                  id="help"
                  value={healthHelpline}
                  onChange={e => setHealthHelpline(e.target.value)}
                  className="mt-1 font-mono font-bold text-base"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 flex justify-end">
            <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white gap-2 text-xs">
              <Save className="w-4 h-4" /> Save System Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  )
}
