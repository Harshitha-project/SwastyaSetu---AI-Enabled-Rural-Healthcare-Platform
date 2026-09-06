import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { aiService } from '../../services/aiService'
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
  Activity,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Save,
} from 'lucide-react'

const RecordVitals: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [vitals, setVitals] = useState({
    heartRate: '76',
    systolic: '122',
    diastolic: '80',
    spo2: '98',
    temperature: '98.6',
    glucose: '105',
  })
  const [symptoms, setSymptoms] = useState('Mild cough, weakness')
  const [screeningResult, setScreeningResult] = useState<any>(null)
  const [isScreening, setIsScreening] = useState(false)

  const handleScreen = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsScreening(true)
    try {
      const res = await aiService.assessHealthRisk({
        symptoms: symptoms.split(',').map(s => s.trim()),
        vitals,
      })
      setScreeningResult(res)
    } finally {
      setIsScreening(false)
    }
  }

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="w-7 h-7 text-primary-600" />
          {isMarathi ? 'रुग्ण व्हायटल्स तपासणी व प्राथमिक एआय स्क्रीनिंग' : 'Field Vitals Screening & AI Triage'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'आशा सेविकेद्वारे घरभेटीदरम्यान रक्तदाब, पल्स व ऑक्सिजन नोंदवून एआय विश्लेषण करा.'
            : 'Record physiological vitals during village household screening to trigger preliminary AI risk alerts.'}
        </p>
      </div>

      <Card className="border-border/80 shadow-md">
        <form onSubmit={handleScreen}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate (BPM)
                </Label>
                <Input
                  type="number"
                  value={vitals.heartRate}
                  onChange={e => setVitals(p => ({ ...p, heartRate: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Wind className="w-3.5 h-3.5 text-cyan-500" /> SpO₂ Oxygen (%)
                </Label>
                <Input
                  type="number"
                  value={vitals.spo2}
                  onChange={e => setVitals(p => ({ ...p, spo2: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temp (°F)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={e => setVitals(p => ({ ...p, temperature: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">BP Systolic</Label>
                <Input
                  type="number"
                  value={vitals.systolic}
                  onChange={e => setVitals(p => ({ ...p, systolic: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">BP Diastolic</Label>
                <Input
                  type="number"
                  value={vitals.diastolic}
                  onChange={e => setVitals(p => ({ ...p, diastolic: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Blood Glucose</Label>
                <Input
                  type="number"
                  value={vitals.glucose}
                  onChange={e => setVitals(p => ({ ...p, glucose: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Observed Symptoms:</Label>
              <Input
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Fever, cough, breathlessness..."
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end p-4 border-t border-border/60 bg-muted/10">
            <Button type="submit" disabled={isScreening} className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white">
              <Sparkles className="w-4 h-4" />
              {isScreening ? 'विश्लेषण होत आहे...' : 'Run Instant AI Triage'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {screeningResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`p-6 border-2 ${
            screeningResult.riskLevel === 'HIGH' ? 'border-rose-500 bg-rose-50/30' : 'border-emerald-500 bg-emerald-50/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-foreground">
                Screening Result: {screeningResult.riskLevel} RISK ({screeningResult.riskScore}/100)
              </h3>
              <Badge variant={screeningResult.riskLevel === 'HIGH' ? 'destructive' : 'secondary'}>
                {screeningResult.riskLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {screeningResult.recommendation}
            </p>
            {screeningResult.riskLevel === 'HIGH' && (
              <div className="p-3 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-800 text-xs font-semibold">
                ⚠️ Immediate Doctor Teleconsultation recommended for this rural patient.
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default RecordVitals
