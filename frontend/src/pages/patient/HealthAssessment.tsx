import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService, type AIAnalysisResult, type VitalsInput } from '../../services/aiService'
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
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  History,
  RotateCcw,
} from 'lucide-react'

const SYMPTOM_CATEGORIES = [
  {
    category: 'Respiratory / श्वसन',
    items: ['Cough (खोकला)', 'Cold / Runny Nose (सर्दी)', 'Shortness of Breath (दम लागणे)', 'Sore Throat (घसा खवखवणे)'],
  },
  {
    category: 'General & Fever / सामान्य व ताप',
    items: ['Fever (ताप)', 'Headache (डोकेदुखी)', 'Severe Body Pain (अंगदुखी)', 'Fatigue / Weakness (अशक्तपणा)'],
  },
  {
    category: 'Cardiovascular / हृदय व छाती',
    items: ['Chest Pain / Tightness (छातीत दुखणे)', 'Palpitations (धडधडणे)', 'Dizziness (चक्कर येणे)'],
  },
  {
    category: 'Digestive / पचन',
    items: ['Nausea / Vomiting (उलटी/मळमळ)', 'Diarrhea / Loose Stool (जुलाब)', 'Abdominal Pain (पोटदुखी)', 'Loss of Appetite (भूक मंदावणे)'],
  },
  {
    category: 'Muscles & Joints / स्नायू व सांधे',
    items: ['Joint Pain (सांधेदुखी)', 'Muscle Cramps (पेटके येणे)', 'Backache (कंबरदुखी)'],
  },
]

const HealthAssessment: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState('')
  const [vitals, setVitals] = useState<VitalsInput>({
    heartRate: '78',
    systolic: '120',
    diastolic: '80',
    spo2: '98',
    temperature: '98.6',
    glucose: '105',
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    aiService.getAssessmentHistory().then(setHistory)
  }, [])

  const toggleSymptom = (item: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    )
  }

  const handleAddCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault()
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()])
      setCustomSymptom('')
    }
  }

  const handleVitalChange = (field: keyof VitalsInput, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const cleanSymptoms = selectedSymptoms.map(s => s.split(' (')[0])
      const res = await aiService.assessHealthRisk({
        symptoms: cleanSymptoms,
        vitals,
      })
      setResult(res)
      setStep(3)
      aiService.getAssessmentHistory().then(setHistory)
    } catch (e) {
      console.error('Assessment failed', e)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedSymptoms([])
    setResult(null)
    setStep(1)
  }

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              {isMarathi ? 'एआय-सक्षम आरोग्य मूल्यांकन' : 'AI-Assisted Preliminary Health Assessment'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {isMarathi ? '🩺 माझी आरोग्य तपासणी' : '🩺 Check My Health'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'लक्षणे व पॅरामीटर्स प्रविष्ट करा, एआय तात्काळ जोखीम पातळी व योग्य सल्ला देईल.'
              : 'Enter symptoms and vitals to receive immediate clinical risk categorization and recommendations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2 text-xs"
          >
            <History className="w-4 h-4" />
            {showHistory ? (isMarathi ? 'फॉर्म दाखवा' : 'Hide History') : (isMarathi ? 'मागील तपासण्या' : 'Past Assessments')}
          </Button>
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="w-3.5 h-3.5" />
              {isMarathi ? 'रीसेट' : 'Reset'}
            </Button>
          )}
        </div>
      </div>

      {/* Medical Safety Disclaimer Alert */}
      <Alert className="bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
        <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-xs font-semibold uppercase tracking-wider">
          {isMarathi ? 'वैद्यकीय अस्वीकरण (Medical Disclaimer)' : 'Preliminary Clinical Triage Tool'}
        </AlertTitle>
        <AlertDescription className="text-xs">
          {isMarathi
            ? 'हे एआय मूल्यांकन केवळ माहिती व प्राथमिक मार्गदर्शनासाठी आहे, हा अधिकृत वैद्यकीय निदान नाही. गंभीर त्रास असल्यास तात्काळ १०८/११२ वर कॉल करा किंवा डॉक्टरांचा सल्ला घ्या.'
            : 'This AI assessment provides preliminary health triage only and does NOT replace doctor diagnosis. For emergency chest pain or acute breathlessness, call 112 or visit a hospital immediately.'}
        </AlertDescription>
      </Alert>

      {/* Historical Drawer if toggled */}
      {showHistory && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isMarathi ? 'मागील आरोग्य नोंदी' : 'Recent Assessment History'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((h, i) => (
              <Card key={h.id || i} className="p-4 border-border/70 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={h.riskLevel === 'HIGH' ? 'destructive' : h.riskLevel === 'MODERATE' ? 'default' : 'secondary'}
                  >
                    {h.riskLevel} RISK
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{h.recommendation}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step Progress Bar */}
      <div className="flex items-center justify-between max-w-xl mx-auto relative px-4">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-muted -z-0">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />
        </div>
        {[
          { num: 1, label: isMarathi ? 'लक्षणे' : 'Symptoms' },
          { num: 2, label: isMarathi ? 'व्हायटल्स' : 'Vitals' },
          { num: 3, label: isMarathi ? 'निकाल' : 'AI Report' },
        ].map(s => (
          <div key={s.num} className="flex flex-col items-center relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                step >= s.num
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.num}
            </div>
            <span className="text-xs font-medium mt-1.5 text-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Symptom Selector */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {isMarathi ? 'तुम्हाला काय त्रास होत आहे? (लक्षणे निवडा)' : 'What symptoms are you experiencing?'}
              </CardTitle>
              <CardDescription>
                {isMarathi
                  ? 'खालील यादीतून एक किंवा अधिक लक्षणे निवडा किंवा स्वतः टाईप करा.'
                  : 'Select all applicable symptoms below to help the AI engine understand your condition.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Custom Symptom Input */}
              <form onSubmit={handleAddCustomSymptom} className="flex gap-2">
                <Input
                  placeholder={isMarathi ? 'इतर लक्षण लिहा (उदा. पोटात कळ, चक्कर)...' : 'Type another symptom and press Add...'}
                  value={customSymptom}
                  onChange={e => setCustomSymptom(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  {isMarathi ? '+ जोडा' : '+ Add'}
                </Button>
              </form>

              {/* Categorized Symptoms */}
              <div className="space-y-4">
                {SYMPTOM_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map(symptom => {
                        const isSelected = selectedSymptoms.includes(symptom)
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-primary-600 text-white border-primary-600 shadow-sm scale-102'
                                : 'bg-card text-foreground border-border hover:bg-muted/70 hover:border-border/90'
                            }`}
                          >
                            {symptom}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Counter */}
              {selectedSymptoms.length > 0 && (
                <div className="p-3 bg-primary-50/70 dark:bg-primary-950/30 rounded-xl flex items-center justify-between border border-primary-100 dark:border-primary-900">
                  <span className="text-xs text-primary-800 dark:text-primary-200 font-medium">
                    {isMarathi
                      ? `${selectedSymptoms.length} लक्षणे निवडली आहेत`
                      : `${selectedSymptoms.length} symptom(s) selected`}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSymptoms([])} className="h-7 text-xs text-primary-700">
                    {isMarathi ? 'सर्व पुसा' : 'Clear All'}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-border/40">
              <Button
                onClick={() => setStep(2)}
                disabled={selectedSymptoms.length === 0}
                className="gap-2 px-6"
              >
                {isMarathi ? 'पुढील पायरी: व्हायटल्स' : 'Next: Vital Signs'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Vitals Inputs */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {isMarathi ? 'आरोग्य पॅरामीटर्स (व्हायटल्स)' : 'Current Vital Signs & Measurements'}
              </CardTitle>
              <CardDescription>
                {isMarathi
                  ? 'तुमचे मोजलेले पॅरामीटर्स प्रविष्ट करा. माहिती नसल्यास अंदाजे सामान्य मूल्ये ठेवा.'
                  : 'Vital signs significantly improve preliminary assessment accuracy.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Heart Rate */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="heartRate" className="flex items-center gap-2 text-sm font-semibold">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {isMarathi ? 'हृदयाचे ठोके (Pulse / Heart Rate)' : 'Heart Rate'}
                  </Label>
                  <span className="text-xs text-muted-foreground">Normal: 60 - 100 bpm</span>
                </div>
                <div className="relative">
                  <Input
                    id="heartRate"
                    type="number"
                    value={vitals.heartRate}
                    onChange={e => handleVitalChange('heartRate', e.target.value)}
                    placeholder="78"
                    className="pr-12 text-base font-medium"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">bpm</span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="spo2" className="flex items-center gap-2 text-sm font-semibold">
                    <Wind className="w-4 h-4 text-cyan-500" />
                    {isMarathi ? 'ऑक्सिजन पातळी (Blood Oxygen SpO₂)' : 'Blood Oxygen (SpO₂)'}
                  </Label>
                  <span className="text-xs text-muted-foreground">Normal: 95% - 100%</span>
                </div>
                <div className="relative">
                  <Input
                    id="spo2"
                    type="number"
                    value={vitals.spo2}
                    onChange={e => handleVitalChange('spo2', e.target.value)}
                    placeholder="98"
                    className="pr-12 text-base font-medium"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                </div>
              </div>

              {/* Blood Pressure Systolic / Diastolic */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Activity className="w-4 h-4 text-amber-500" />
                    {isMarathi ? 'रक्तदाब (Blood Pressure - Systolic / Diastolic)' : 'Blood Pressure'}
                  </Label>
                  <span className="text-xs text-muted-foreground">Normal: ~120/80 mmHg</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      type="number"
                      value={vitals.systolic}
                      onChange={e => handleVitalChange('systolic', e.target.value)}
                      placeholder="120"
                      className="pr-16 text-base font-medium"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Systolic</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={vitals.diastolic}
                      onChange={e => handleVitalChange('diastolic', e.target.value)}
                      placeholder="80"
                      className="pr-16 text-base font-medium"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Diastolic</span>
                  </div>
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature" className="flex items-center gap-2 text-sm font-semibold">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    {isMarathi ? 'शरीराचे तापमान (Body Temperature)' : 'Body Temperature'}
                  </Label>
                  <span className="text-xs text-muted-foreground">Normal: 97°F - 99°F</span>
                </div>
                <div className="relative">
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={e => handleVitalChange('temperature', e.target.value)}
                    placeholder="98.6"
                    className="pr-12 text-base font-medium"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">°F</span>
                </div>
              </div>

              {/* Blood Glucose */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="glucose" className="flex items-center gap-2 text-sm font-semibold">
                    <Droplets className="w-4 h-4 text-purple-500" />
                    {isMarathi ? 'रक्तातील साखर (Random Glucose)' : 'Blood Glucose'}
                  </Label>
                  <span className="text-xs text-muted-foreground">Normal: 70 - 140 mg/dL</span>
                </div>
                <div className="relative">
                  <Input
                    id="glucose"
                    type="number"
                    value={vitals.glucose}
                    onChange={e => handleVitalChange('glucose', e.target.value)}
                    placeholder="105"
                    className="pr-16 text-base font-medium"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">mg/dL</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t border-border/40">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isMarathi ? 'मागे' : 'Back'}
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2 px-6 bg-gradient-to-r from-primary-600 to-indigo-600">
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    {isMarathi ? 'एआय विश्लेषण चालू आहे...' : 'AI Engine Analyzing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {isMarathi ? '🩺 एआय विश्लेषण सुरू करा' : '🩺 Generate AI Assessment'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 3: AI Assessment Results */}
      {step === 3 && result && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          {/* Main Risk Card */}
          <Card className={`overflow-hidden border-2 shadow-lg ${
            result.riskLevel === 'HIGH'
              ? 'border-rose-500/80 bg-gradient-to-b from-rose-50/50 via-card to-card dark:from-rose-950/20'
              : result.riskLevel === 'MODERATE'
              ? 'border-amber-500/80 bg-gradient-to-b from-amber-50/50 via-card to-card dark:from-amber-950/20'
              : 'border-emerald-500/80 bg-gradient-to-b from-emerald-50/50 via-card to-card dark:from-emerald-950/20'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {isMarathi ? 'प्राथमिक एआय जोखीम वर्गवारी' : 'AI-Assisted Preliminary Triage'}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      {result.riskLevel === 'HIGH'
                        ? (isMarathi ? '🔴 उच्च जोखीम (High Risk)' : '🔴 HIGH RISK LEVEL')
                        : result.riskLevel === 'MODERATE'
                        ? (isMarathi ? '🟠 मध्यम जोखीम (Moderate Risk)' : '🟠 MODERATE RISK LEVEL')
                        : (isMarathi ? '🟢 कमी जोखीम (Low Risk)' : '🟢 LOW RISK LEVEL')}
                    </h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">{isMarathi ? 'जोखीम गुणांक' : 'Calculated Risk Score'}</span>
                  <span className="text-3xl font-black text-foreground">{result.riskScore}/100</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.riskLevel === 'HIGH'
                      ? 'bg-rose-600'
                      : result.riskLevel === 'MODERATE'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>

              {/* Recommendation Box */}
              <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <Info className="w-4 h-4 text-primary-600" />
                  <span>{isMarathi ? 'वैद्यकीय सल्ला व पुढील पायरी' : 'Clinical Recommendation & Next Step'}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.recommendation}
                </p>
              </div>

              {/* Possible Condition Indicators */}
              {result.possibleConditions && result.possibleConditions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isMarathi ? 'संभाव्य लक्षण-नमुने (Possible Pattern Matches)' : 'Preliminary Clinical Pattern Matches'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.possibleConditions.map((cond, i) => (
                      <Badge key={i} variant="outline" className="bg-muted/40 py-1 px-2.5 text-xs">
                        ⚠️ {cond}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Parameter Indicators breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isMarathi ? 'पॅरामीटर तपशील' : 'Key Diagnostic Indicators Breakdown'}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                        ind.status === 'critical'
                          ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                          : ind.status === 'abnormal'
                          ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                          : 'border-border bg-card text-foreground'
                      }`}
                    >
                      <div>
                        <span className="font-semibold block">{ind.name}</span>
                        {ind.message && <p className="text-[11px] opacity-85 mt-0.5">{ind.message}</p>}
                      </div>
                      <Badge
                        variant={ind.status === 'critical' ? 'destructive' : ind.status === 'abnormal' ? 'default' : 'secondary'}
                        className="text-[10px] shrink-0"
                      >
                        {ind.value || ind.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/60 bg-muted/10">
              <Button
                asChild
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium"
              >
                <Link to="/patient/book-appointment">
                  <Calendar className="w-4 h-4" />
                  {isMarathi ? '👨‍⚕️ डॉक्टरांची भेट बुक करा' : '👨‍⚕️ Book Doctor Consultation'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
                <Link to="/patient/facilities">
                  <MapPin className="w-4 h-4" />
                  {isMarathi ? '🏥 जवळचे रुग्णालय (PHC)' : '🏥 Find Nearest Hospital'}
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleReset} className="w-full sm:w-auto ml-auto text-xs">
                {isMarathi ? 'पुन्हा तपासणी करा' : 'Start New Check'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default HealthAssessment
