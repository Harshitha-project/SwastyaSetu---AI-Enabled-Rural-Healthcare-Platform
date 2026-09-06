import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Activity,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  Radio,
  RotateCw,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const INITIAL_VITALS_STREAM = [
  { time: '08:00 AM', heartRate: 72, spo2: 98, systolic: 118, diastolic: 78, temp: 98.4 },
  { time: '10:00 AM', heartRate: 75, spo2: 98, systolic: 120, diastolic: 80, temp: 98.6 },
  { time: '12:00 PM', heartRate: 82, spo2: 97, systolic: 124, diastolic: 82, temp: 98.7 },
  { time: '02:00 PM', heartRate: 80, spo2: 98, systolic: 122, diastolic: 81, temp: 98.6 },
  { time: '04:00 PM', heartRate: 76, spo2: 97, systolic: 121, diastolic: 80, temp: 98.5 },
  { time: '06:00 PM', heartRate: 78, spo2: 98, systolic: 120, diastolic: 79, temp: 98.6 },
]

const HealthMonitoring: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [dataStream, setDataStream] = useState(INITIAL_VITALS_STREAM)
  const [currentVitals, setCurrentVitals] = useState({
    heartRate: 78,
    spo2: 98,
    systolic: 120,
    diastolic: 80,
    temperature: 98.6,
    glucose: 102,
  })
  const [isSimulating, setIsSimulating] = useState(false)
  const [hasAnomaly, setHasAnomaly] = useState(false)

  const handleSimulateSync = () => {
    setIsSimulating(true)
    setTimeout(() => {
      // Generate realistic reading with slight random fluctuation
      const hr = Math.floor(68 + Math.random() * 26) // 68 - 94
      const spo2Val = Math.floor(95 + Math.random() * 5) // 95 - 99
      const sys = Math.floor(115 + Math.random() * 15)
      const dia = Math.floor(75 + Math.random() * 10)
      const temp = parseFloat((98.2 + Math.random() * 0.8).toFixed(1))

      const newReading = {
        heartRate: hr,
        spo2: spo2Val,
        systolic: sys,
        diastolic: dia,
        temperature: temp,
        glucose: Math.floor(95 + Math.random() * 30),
      }
      setCurrentVitals(newReading)

      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setDataStream(prev => [
        ...prev.slice(1),
        {
          time: timeLabel,
          heartRate: hr,
          spo2: spo2Val,
          systolic: sys,
          diastolic: dia,
          temp: temp,
        },
      ])
      setHasAnomaly(spo2Val < 93 || hr > 110)
      setIsSimulating(false)
    }, 1000)
  }

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Radio className="w-4 h-4 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isMarathi ? 'थेट सेन्सर व वेअरेबल मॉनिटरिंग' : 'Live IoT Telemetry & Anomaly Detection'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary-600" />
            {isMarathi ? 'आरोग्य पॅरामीटर्स आणि सतत देखरेख' : 'Remote Health Monitoring'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'वेअरेबल सेन्सर किंवा स्मार्ट उपकरणांद्वारे सतत रक्तदाब, पल्स आणि ऑक्सिजन पातळीवर लक्ष ठेवा.'
              : 'Continuous physiological tracking of vital signs with automated threshold anomaly detection.'}
          </p>
        </div>

        <Button
          onClick={handleSimulateSync}
          disabled={isSimulating}
          className="gap-2 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium"
        >
          <RotateCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          {isMarathi ? 'नवीन रिडिंग घ्या (Sync IoT)' : 'Simulate Wearable Sync'}
        </Button>
      </div>

      {hasAnomaly && (
        <Alert variant="destructive" className="animate-bounce">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">
            {isMarathi ? 'असामान्य पॅरामीटर आढळले!' : 'Abnormal Vital Sign Detected!'}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {isMarathi
              ? 'तुमची ऑक्सिजन पातळी किंवा हृदयाचे ठोके सामान्य मर्यादेबाहेर आहेत. तात्काळ डॉक्टरांशी संपर्क साधा किंवा १०८ कॉल करा.'
              : 'Your vital measurements exceeded safe clinical thresholds. An alert has been logged for doctor review.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Vitals Gauges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <Card className="p-4 border-border/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{isMarathi ? 'हृदयाचे ठोके' : 'Heart Rate'}</span>
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{currentVitals.heartRate}</span>
            <span className="text-xs text-muted-foreground">BPM</span>
          </div>
          <Badge variant="secondary" className="mt-2 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            Normal (60-100)
          </Badge>
        </Card>

        {/* SpO2 */}
        <Card className="p-4 border-border/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{isMarathi ? 'ऑक्सिजन (SpO₂)' : 'Blood Oxygen'}</span>
            <Wind className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{currentVitals.spo2}</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <Badge
            variant="secondary"
            className={`mt-2 text-[10px] ${
              currentVitals.spo2 >= 95
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                : 'text-rose-600 bg-rose-50'
            }`}
          >
            {currentVitals.spo2 >= 95 ? 'Optimal (≥95%)' : 'Attention (<95%)'}
          </Badge>
        </Card>

        {/* Blood Pressure */}
        <Card className="p-4 border-border/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{isMarathi ? 'रक्तदाब (BP)' : 'Blood Pressure'}</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">
              {currentVitals.systolic}/{currentVitals.diastolic}
            </span>
            <span className="text-xs text-muted-foreground">mmHg</span>
          </div>
          <Badge variant="secondary" className="mt-2 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            Target &lt;130/85
          </Badge>
        </Card>

        {/* Temperature */}
        <Card className="p-4 border-border/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{isMarathi ? 'तापमान' : 'Temperature'}</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{currentVitals.temperature}</span>
            <span className="text-xs text-muted-foreground">°F</span>
          </div>
          <Badge variant="secondary" className="mt-2 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            Normal Afebrile
          </Badge>
        </Card>
      </div>

      {/* Vitals Trend Charts (Recharts) */}
      <Card className="p-5 border-border/80 shadow-sm space-y-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            {isMarathi ? 'दिवसाभरातील ट्रेंड (Diurnal Vital Trends)' : 'Diurnal Vitals Trend (Today)'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isMarathi
              ? 'वेअरेबल उपकरणाने नोंदवलेले हृदयाचे ठोके आणि रक्तातील ऑक्सिजन पातळी.'
              : 'Chronological recording of pulse rate and oxygen saturation across daily intervals.'}
          </CardDescription>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataStream}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 110]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#f43f5e"
                strokeWidth={2.5}
                name="Heart Rate (BPM)"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="#06b6d4"
                strokeWidth={2.5}
                name="Oxygen SpO2 (%)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

export default HealthMonitoring
