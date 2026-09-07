import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService, type AIAnalysisResult, type VitalsInput } from '../../services/aiService'
import { doctorService, type DoctorRecommendation } from '../../services/doctorService'
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
  Brain,
  Stethoscope,
  Star,
  Video,
  PhoneCall,
  X,
  UserCheck,
} from 'lucide-react'

const SYMPTOM_CATEGORIES = [
  {
    category: 'Dental & Oral / दात व तोंड 🦷',
    items: [
      'Toothache (दातदुखी)',
      'Gum Bleeding / Swelling (हिरड्यांमधून रक्त/सूज)',
      'Cavities / Tooth Decay (किडलेले दात)',
      'Mouth Ulcers (तोंडातील व्रण)',
      'Sensitivity to Hot/Cold (दात आंबणे)',
    ],
  },
  {
    category: 'Respiratory / श्वसन 🫁',
    items: [
      'Cough (खोकला)',
      'Cold / Runny Nose (सर्दी)',
      'Shortness of Breath (दम लागणे)',
      'Sore Throat (घसा खवखवणे)',
      'Wheezing / Asthma (घरघर)',
    ],
  },
  {
    category: 'Cardiovascular / हृदय व छाती ❤️',
    items: [
      'Chest Pain / Tightness (छातीत दुखणे)',
      'Palpitations (धडधडणे)',
      'Dizziness (चक्कर येणे)',
      'High Blood Pressure (रक्तदाब वाढणे)',
    ],
  },
  {
    category: 'General & Fever / सामान्य व ताप 🌡️',
    items: [
      'Fever (ताप)',
      'Headache (डोकेदुखी)',
      'Severe Body Pain (अंगदुखी)',
      'Fatigue / Weakness (अशक्तपणा)',
    ],
  },
  {
    category: 'Skin & Allergy / त्वचा व ॲलर्जी 🧴',
    items: [
      'Skin Rash / Itching (त्वचेवर खाज / पुरळ)',
      'Fungal Infection / Ringworm (गजकर्ण)',
      'Boils / Red Swelling (फोड / लालसरपणा)',
    ],
  },
  {
    category: 'Muscles & Joints / स्नायू व सांधे 🦴',
    items: [
      'Joint Pain (सांधेदुखी)',
      'Muscle Cramps (पेटके येणे)',
      'Backache (कंबरदुखी)',
      'Knee Pain (गुडघेदुखी)',
    ],
  },
  {
    category: 'Women & Maternal / स्त्रीरोग व प्रसूती 🌸',
    items: [
      'Pregnancy Related (गर्भावस्थेतील तक्रार)',
      'Severe Menstrual Cramps (मासिक पाळीचा त्रास)',
      'Pelvic Pain (ओटीपोटात दुखणे)',
    ],
  },
  {
    category: 'Digestive / पचन 🥗',
    items: [
      'Nausea / Vomiting (उलटी/मळमळ)',
      'Diarrhea / Loose Stool (जुलाब)',
      'Abdominal Pain (पोटदुखी)',
      'Loss of Appetite (भूक मंदावणे)',
    ],
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
  const [recommendedDoctor, setRecommendedDoctor] = useState<DoctorRecommendation | null>(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)

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

      // Intelligent Specialist Recommendation according to symptoms
      const rec = await doctorService.recommendDoctor(cleanSymptoms, res.possibleConditions)
      if (rec) {
        setRecommendedDoctor(rec)
        setShowDoctorModal(true) // Automatically trigger doctor recommendation popup!
      }
    } catch (e) {
      console.error('Assessment failed', e)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedSymptoms([])
    setResult(null)
    setRecommendedDoctor(null)
    setShowDoctorModal(false)
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

              {/* ML Model Diagnosis & Probability Confidence */}
              {result.possibleConditions && result.possibleConditions.length > 0 && (
                <div className="p-4 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      {isMarathi ? 'मशीन लर्निंग संभाव्य रोग निदान (ML Predicted Conditions)' : 'ML Statistical Disease Predictions'}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-indigo-100 text-indigo-800 border-indigo-300">
                      Random Forest Ensemble
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {result.possibleConditions.map((item: any, i) => {
                      const name = typeof item === 'string' ? item : item.condition
                      const conf = typeof item === 'object' && item.confidence ? Math.round(item.confidence * 100) : null
                      return (
                        <div key={i} className="p-3 rounded-lg bg-white/90 dark:bg-card border border-indigo-100 dark:border-indigo-900 flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                            <span className="text-xs font-semibold text-foreground">{name}</span>
                          </div>
                          {conf !== null && (
                            <Badge className={`text-[10px] font-bold ${conf > 60 ? 'bg-indigo-600' : 'bg-slate-600'} text-white`}>
                              {conf}% Match
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Doctor Recommendation Section in Results Card */}
              {recommendedDoctor && (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-primary-500/60 bg-gradient-to-br from-primary-50/70 via-card to-indigo-50/50 dark:from-primary-950/30 dark:to-indigo-950/20 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-primary-100 dark:bg-primary-900/50">{recommendedDoctor.icon}</span>
                      <div>
                        <Badge className="bg-primary-600 text-white text-[10px] tracking-wider uppercase mb-0.5">
                          {isMarathi ? 'लक्षणांनुसार शिफारस केलेले तज्ज्ञ' : 'AI-Recommended Specialist'}
                        </Badge>
                        <h4 className="font-bold text-base text-foreground">
                          {isMarathi ? recommendedDoctor.specialtyLabelMr : recommendedDoctor.specialtyLabelEn}
                        </h4>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDoctorModal(true)}
                      className="text-xs gap-1.5 border-primary-300 text-primary-700"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                      {isMarathi ? 'तपशील पहा' : 'View Details'}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isMarathi ? recommendedDoctor.matchReasonMr : recommendedDoctor.matchReasonEn}
                  </p>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-card border border-primary-200/80 dark:border-primary-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                        {((recommendedDoctor.doctor.user as any)?.name || 'Dr').replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1">
                          {(recommendedDoctor.doctor.user as any)?.name || (recommendedDoctor.doctor.user as any)?.firstName}
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </h5>
                        <p className="text-[11px] text-muted-foreground">
                          {recommendedDoctor.doctor.specialization} • ⭐ {recommendedDoctor.doctor.rating}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 text-xs bg-gradient-to-r from-primary-600 to-indigo-600 text-white shrink-0"
                    >
                      <Link
                        to={`/patient/book-appointment?doctorId=${recommendedDoctor.doctor.id || recommendedDoctor.doctor._id}&reason=${encodeURIComponent(selectedSymptoms.join(', '))}`}
                        state={{ doctorId: recommendedDoctor.doctor.id || recommendedDoctor.doctor._id }}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {isMarathi ? 'या डॉक्टरांची भेट बुक करा' : 'Book Consultation'}
                      </Link>
                    </Button>
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
                <Link
                  to={recommendedDoctor ? `/patient/book-appointment?doctorId=${recommendedDoctor.doctor.id || recommendedDoctor.doctor._id}&reason=${encodeURIComponent(selectedSymptoms.join(', '))}` : '/patient/book-appointment'}
                  state={recommendedDoctor ? { doctorId: recommendedDoctor.doctor.id || recommendedDoctor.doctor._id } : undefined}
                >
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

      {/* Recommended Doctor Popup Modal */}
      <AnimatePresence>
        {showDoctorModal && recommendedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border-2 border-primary-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Top gradient banner */}
              <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-teal-600 p-5 text-white relative">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="absolute right-4 top-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                    {recommendedDoctor.icon}
                  </div>
                  <div>
                    <Badge className="bg-white/25 hover:bg-white/30 text-white text-[10px] tracking-wider uppercase mb-1">
                      {isMarathi ? 'एआय शिफारस' : 'AI Specialist Recommendation'}
                    </Badge>
                    <h3 className="font-bold text-lg md:text-xl text-white">
                      {isMarathi ? recommendedDoctor.specialtyLabelMr : recommendedDoctor.specialtyLabelEn}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Reason description box */}
                <div className="p-3.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900 text-xs leading-relaxed text-foreground flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">
                      {isMarathi ? 'ही शिफारस का दिली आहे?' : 'Why this specialist is recommended for you:'}
                    </span>
                    <p className="text-muted-foreground">
                      {isMarathi ? recommendedDoctor.matchReasonMr : recommendedDoctor.matchReasonEn}
                    </p>
                  </div>
                </div>

                {/* Doctor Details Card */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                      {((recommendedDoctor.doctor.user as any)?.name || (recommendedDoctor.doctor.user as any)?.firstName || 'Dr').replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-foreground truncate flex items-center gap-1.5">
                          {(recommendedDoctor.doctor.user as any)?.name || `${(recommendedDoctor.doctor.user as any)?.firstName} ${(recommendedDoctor.doctor.user as any)?.lastName}`}
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {recommendedDoctor.doctor.rating}
                        </div>
                      </div>
                      <p className="text-xs text-primary-600 font-semibold">{recommendedDoctor.doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground">{recommendedDoctor.doctor.qualification}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Reg: {recommendedDoctor.doctor.registrationNumber} • {recommendedDoctor.doctor.experience} Yrs Clinical Exp
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">{isMarathi ? 'सल्लामसलत शुल्क' : 'Consultation Fee'}</span>
                      <span className="font-bold text-foreground">₹{recommendedDoctor.doctor.consultationFee} <span className="text-[10px] text-emerald-600 font-normal">(Free with ABHA)</span></span>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-[10px]">
                      🟢 {isMarathi ? 'व्हिडिओ कॉल उपलब्ध' : 'Available for Video Consult'}
                    </Badge>
                  </div>
                </div>

                {/* Patient symptoms tag list */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    {isMarathi ? 'विश्लेषण केलेली तुमची लक्षणे:' : 'Your analyzed symptoms matching this doctor:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map(s => (
                      <Badge key={s} variant="secondary" className="text-[11px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer / CTAs */}
              <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-2.5">
                <Button
                  asChild
                  className="flex-1 gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold shadow-md text-xs h-10"
                >
                  <Link
                    to={`/patient/book-appointment?doctorId=${recommendedDoctor.doctor.id || recommendedDoctor.doctor._id}&reason=${encodeURIComponent(selectedSymptoms.join(', '))}`}
                    state={{ doctorId: recommendedDoctor.doctor.id || recommendedDoctor.doctor._id }}
                  >
                    <Calendar className="w-4 h-4" />
                    {isMarathi ? 'थेट भेट निश्चित करा' : `Book with ${((recommendedDoctor.doctor.user as any)?.firstName || 'Doctor')}`}
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="gap-2 text-xs h-10 border-primary/40 text-primary-700 hover:bg-primary-50"
                >
                  <Link to="/patient/consultation">
                    <Video className="w-4 h-4" />
                    {isMarathi ? 'व्हिडिओ रूम' : 'Quick Teleconsult'}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowDoctorModal(false)}
                  className="text-xs text-muted-foreground h-10"
                >
                  {isMarathi ? 'अहवाल पहा' : 'View Full Report'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HealthAssessment
