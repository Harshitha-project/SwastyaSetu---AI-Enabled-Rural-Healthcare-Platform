import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { appointmentService } from '../../services/appointmentService'
import { recordsService } from '../../services/recordsService'
import { useAuth } from '../../hooks/useAuth'
import { useWebRTC } from '../../hooks/useWebRTC'
import { useAIAnalysis } from '../../hooks/useAIAnalysis'
import AIAnalysisPanel from '../../components/consultation/AIAnalysisPanel'
import type { Appointment } from '../../types'
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
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Send,
  PlusCircle,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  Phone,
  VolumeX,
  Brain,
  AlertTriangle,
} from 'lucide-react'

interface MedItem {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

const DoctorConsultation: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { i18n } = useTranslation()

  // For testing without login - use a default user if not authenticated
  const effectiveUser = user || {
    id: 'demo-doctor-1',
    firstName: 'Test',
    lastName: 'Doctor',
    name: 'Dr. Test Doctor',
    role: 'DOCTOR' as const,
  }

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(true)

  // Prescription builder state
  const [diagnosis, setDiagnosis] = useState('')
  const [clinicalAdvice, setClinicalAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0])
  const [medications, setMedications] = useState<MedItem[]>([])

  // New med input
  const [newMed, setNewMed] = useState<MedItem>({
    name: '',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '5 days',
    instructions: 'After meals',
  })

  const chatEndRef = useRef<HTMLDivElement>(null)

  // WebRTC Hook
  const userName = effectiveUser ? `Dr. ${effectiveUser.lastName || effectiveUser.firstName}` : 'Doctor'
  const {
    localStream,
    remoteStream,
    isConnected,
    isCallActive,
    peer,
    messages,
    error,
    isAudioEnabled,
    isVideoEnabled,
    isPeerAudioEnabled,
    isPeerVideoEnabled,
    joinRoom,
    endCall,
    toggleAudio,
    toggleVideo,
    sendMessage,
    localVideoRef,
    remoteVideoRef,
  } = useWebRTC({
    roomId: id || 'default-room',
    userName,
    role: 'DOCTOR',
    autoJoin: false,
  })

  // AI Analysis Hook - analyze patient's video
  const {
    analysis: aiAnalysis,
    analysisHistory,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
  } = useAIAnalysis({
    videoRef: remoteVideoRef,
    enabled: hasJoined && isCallActive && showAIPanel,
    intervalMs: 4000,
    onHighRisk: (analysis) => {
      console.log('[Doctor] High risk detected:', analysis.riskLevel)
      // Could show a toast notification here
    },
  })

  // Update diagnosis from AI analysis
  useEffect(() => {
    if (aiAnalysis && aiAnalysis.detectedSymptoms.length > 0 && !diagnosis) {
      // Auto-suggest diagnosis based on AI detected symptoms
      const symptoms = aiAnalysis.detectedSymptoms.map(s => s.symptom).join(', ')
      if (symptoms) {
        setDiagnosis(prev => prev || `Presenting symptoms: ${symptoms}`)
      }
    }
  }, [aiAnalysis, diagnosis])

  // Load appointment data
  useEffect(() => {
    if (id) {
      appointmentService.getAppointmentById(id).then(apt => {
        if (apt) {
          setAppointment(apt)
        }
      })
    }
  }, [id])

  // Call duration timer
  useEffect(() => {
    if (!hasJoined || isCompleted) return
    const timer = setInterval(() => setCallDuration(p => p + 1), 1000)
    return () => clearInterval(timer)
  }, [hasJoined, isCompleted])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleJoinCall = async () => {
    setIsJoining(true)
    try {
      await joinRoom()
      setHasJoined(true)
    } catch (err) {
      console.error('Failed to join call:', err)
    } finally {
      setIsJoining(false)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    sendMessage(newMessage)
    setNewMessage('')
  }

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMed.name.trim()) return
    setMedications(prev => [...prev, newMed])
    setNewMed({
      name: '',
      dosage: '1 tablet',
      frequency: 'Twice daily',
      duration: '5 days',
      instructions: 'After meals',
    })
  }

  const handleRemoveMed = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index))
  }

  const handleCompleteConsultation = async () => {
    if (!id) return
    try {
      // 1. Create prescription
      await recordsService.createPrescription({
        patientId: (appointment?.patientId as string) || 'pat-001',
        doctorId: effectiveUser?.id || 'doc-001',
        appointmentId: id,
        diagnosis,
        notes: clinicalAdvice,
        followUpDate,
        medications,
      })

      // 2. Mark appointment completed
      await appointmentService.updateStatus(id, 'COMPLETED')
      
      // 3. Stop AI analysis
      stopAnalysis()
      
      // 4. End the WebRTC call
      endCall()
      
      setIsCompleted(true)
    } catch (err) {
      console.error('Failed to complete consultation', err)
    }
  }

  const isMarathi = i18n.language === 'mr'
  const patName = peer?.odName || (appointment as any)?.patientName || 'Patient'

  // Pre-call waiting screen
  if (!hasJoined && !isCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <Card className="p-8 border-primary/30 shadow-xl">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isMarathi ? 'टेलीकन्सल्टेशन सुरू करा' : 'Start Teleconsultation'}
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {isMarathi
                ? `रुग्ण ${patName} सोबत व्हिडिओ कॉलसाठी तयार व्हा`
                : `Begin video consultation with patient ${patName}`}
            </p>

            {/* AI Analysis Preview */}
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold text-sm">AI-Assisted Consultation</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time AI analysis will monitor patient vitals, facial expressions, and detect symptoms during the consultation.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {/* Patient Info Preview */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-sm text-foreground mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{patName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="font-medium">{appointment?.reason || 'General Consultation'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">Video Teleconsultation</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Scheduled:</span>
                  <p className="font-medium">{appointment?.scheduledTime || 'Now'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleJoinCall}
                disabled={isJoining}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isMarathi ? 'कनेक्ट होत आहे...' : 'Connecting...'}
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    {isMarathi ? 'कॉल सुरू करा' : 'Start Consultation'}
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/doctor">
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Post-consultation completion screen
  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 border-emerald-500/70 shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isMarathi ? 'सल्लामसलत यशस्वीरित्या पूर्ण!' : 'Consultation Completed & Rx Issued!'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isMarathi
                ? `${patName} यांच्यासाठी डिजिटल औषधचिठ्ठी तयार केली आहे व आरोग्य रेकॉर्डमध्ये जोडली गेली आहे.`
                : `Digital prescription issued for ${patName}. Medical timeline has been updated.`}
            </p>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-left my-6 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-foreground">
                <span>Diagnosis:</span>
                <span className="text-right max-w-[60%]">{diagnosis || 'General consultation'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Prescribed Medications:</span>
                <span>{medications.length} Medicines</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Consultation Duration:</span>
                <span>{formatDuration(callDuration)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Next Follow-up:</span>
                <span>{followUpDate}</span>
              </div>
              {aiAnalysis && (
                <div className="flex justify-between text-muted-foreground">
                  <span>AI Risk Assessment:</span>
                  <Badge className={`text-[10px] ${
                    aiAnalysis.riskLevel === 'high' || aiAnalysis.riskLevel === 'critical' ? 'bg-red-500' :
                    aiAnalysis.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                  } text-white`}>
                    {aiAnalysis.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="gap-2 bg-gradient-to-r from-primary to-indigo-600">
                <Link to="/doctor/prescriptions">
                  <FileText className="w-4 h-4" />
                  {isMarathi ? 'जारी केलेली प्रिस्क्रिप्शन पहा' : 'View Issued Prescriptions'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/doctor">
                  {isMarathi ? 'डॉक्टर डॅशबोर्ड' : 'Back to Dashboard'}
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Active consultation screen
  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            {isCallActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Consulting: {patName}</h2>
              <Badge className={`text-[10px] px-2 py-0 ${isCallActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {isCallActive ? 'TELEHEALTH LIVE' : 'CONNECTING...'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isConnected ? (
                <span className="text-emerald-600 inline-flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-amber-600 inline-flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Connecting
                </span>
              )}
              {isAnalyzing && (
                <span className="ml-2 text-primary inline-flex items-center gap-1">
                  <Brain className="w-3 h-3" /> AI Active
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={showAIPanel ? 'border-primary text-primary' : ''}
          >
            <Brain className="w-4 h-4 mr-1" />
            AI
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted font-mono text-xs text-foreground font-semibold">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {formatDuration(callDuration)}
          </div>
          <Button
            onClick={handleCompleteConsultation}
            className="gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isMarathi ? 'पूर्ण करा व Rx पाठवा' : 'Complete & Issue Rx'}
          </Button>
        </div>
      </div>

      {/* AI Alert Banner */}
      {aiAnalysis && (aiAnalysis.riskLevel === 'high' || aiAnalysis.riskLevel === 'critical') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              AI Alert: {aiAnalysis.riskLevel.toUpperCase()} Risk Detected
            </p>
            <p className="text-xs text-red-600 dark:text-red-300">
              {aiAnalysis.alertFlags.join(' • ') || 'Review patient condition carefully'}
            </p>
          </div>
          <Badge className="bg-red-600 text-white">
            Risk: {aiAnalysis.riskScore}/100
          </Badge>
        </motion.div>
      )}

      {/* 3-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: AI Analysis & Patient Info (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* AI Analysis Panel */}
          {showAIPanel && (
            <AIAnalysisPanel
              analysis={aiAnalysis}
              isAnalyzing={isAnalyzing}
              showHistory={true}
              analysisHistory={analysisHistory}
            />
          )}

          {/* Patient Allergies */}
          <Card className="p-4 border-border/80 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Patient Allergies
            </span>
            <div className="flex flex-wrap gap-1">
              <Badge variant="destructive" className="text-[10px]">
                ⚠️ Penicillin
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Dust Mites
              </Badge>
            </div>
          </Card>
        </div>

        {/* Center Column: Video Call & Chat (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Video Stream Frame */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800">
            {/* Remote video - always mounted for ref stability */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${remoteStream ? 'block' : 'hidden'}`}
            />
            
            {/* Placeholder when no remote stream */}
            {!remoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
                <div className="w-20 h-20 rounded-full bg-emerald-600/30 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-3xl mb-2 shadow-lg">
                  👩‍🦰
                </div>
                <p className="text-white font-semibold text-base">{patName}</p>
                <p className="text-xs text-slate-400">
                  {peer ? 'Establishing video connection...' : 'Waiting for patient to join...'}
                </p>
                <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isCallActive ? 'Live HD Stream' : 'SwasthyaSetu WebRTC'}
                </div>
              </div>
            )}

            {/* Peer media status indicators */}
            {peer && (
              <div className="absolute top-3 left-3 flex gap-2">
                {!isPeerAudioEnabled && (
                  <div className="px-2 py-1 rounded-full bg-red-500/80 text-white text-[10px] flex items-center gap-1">
                    <VolumeX className="w-3 h-3" />
                    Muted
                  </div>
                )}
                {!isPeerVideoEnabled && (
                  <div className="px-2 py-1 rounded-full bg-red-500/80 text-white text-[10px] flex items-center gap-1">
                    <VideoOff className="w-3 h-3" />
                    Camera Off
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Indicator */}
            {isAnalyzing && remoteStream && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/80 text-white text-[10px] flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI Analyzing
              </div>
            )}

            {/* Doctor Self-View */}
            <div className="absolute bottom-3 right-3 w-28 h-20 rounded-xl bg-slate-800 border-2 border-slate-600 overflow-hidden shadow-xl">
              {/* Local video - always mounted */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${localStream && isVideoEnabled ? 'block' : 'hidden'}`}
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Placeholder when no local stream or camera off */}
              {(!localStream || !isVideoEnabled) && (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-[10px]">
                  {isVideoEnabled ? (
                    <span className="font-semibold">You (Dr. {effectiveUser?.lastName || 'Doctor'})</span>
                  ) : (
                    <>
                      <VideoOff className="w-5 h-5 mb-1" />
                      <span>Camera Off</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Self audio indicator */}
              {!isAudioEnabled && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[9px] flex items-center gap-0.5">
                  <MicOff className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          </div>

          {/* Video Controls Toolbar */}
          <div className="flex items-center justify-center gap-3 p-2.5 rounded-2xl bg-card border border-border shadow-sm">
            <Button
              variant={!isAudioEnabled ? 'destructive' : 'secondary'}
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={toggleAudio}
            >
              {!isAudioEnabled ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              variant={!isVideoEnabled ? 'destructive' : 'secondary'}
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={toggleVideo}
            >
              {!isVideoEnabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full px-4 gap-1.5"
              onClick={() => { endCall(); setIsCompleted(true); }}
            >
              <PhoneOff className="w-3.5 h-3.5" />
              End
            </Button>
          </div>

          {/* In-Call Live Chat */}
          <Card className="h-56 flex flex-col border-border shadow-sm">
            <CardHeader className="p-2.5 border-b border-border/70">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" /> Patient Chat
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {messages.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2.5 overflow-y-auto space-y-2 text-xs">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-6 h-6 mb-1 opacity-50" />
                  <p className="text-[11px]">No messages yet</p>
                </div>
              ) : (
                messages.map(m => {
                  const isDoc = m.senderRole === 'DOCTOR'
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isDoc ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-muted-foreground mb-0.5">{m.senderName} • {m.timestamp}</span>
                      <div className={`p-2 rounded-xl max-w-[85%] text-xs ${
                        isDoc ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </CardContent>
            <CardFooter className="p-2 border-t border-border/70">
              <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type message to patient..."
                  className="h-8 text-xs"
                />
                <Button type="submit" size="sm" className="h-8 px-2.5" disabled={!newMessage.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Digital Prescription & Diagnosis Writer (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="border-border shadow-sm p-4 space-y-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                {isMarathi ? 'डिजिटल औषधचिठ्ठी' : 'Digital Prescription'}
              </CardTitle>
              <CardDescription className="text-xs">
                Instantly synced to patient's health records
              </CardDescription>
            </div>

            {/* Diagnosis */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Clinical Diagnosis:</Label>
              <Input
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Viral Bronchitis"
                className="h-8 text-xs font-medium"
              />
              {aiAnalysis && aiAnalysis.detectedSymptoms.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  AI detected: {aiAnalysis.detectedSymptoms.map(s => s.symptom).join(', ')}
                </p>
              )}
            </div>

            {/* Prescribed Meds List */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Medications ({medications.length}):</Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {medications.map((med, i) => (
                  <div key={i} className="p-2 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate text-foreground">{med.name}</p>
                      <p className="text-[11px] text-muted-foreground">{med.dosage} • {med.frequency} • {med.duration}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-rose-500 hover:text-rose-600 shrink-0"
                      onClick={() => handleRemoveMed(i)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Med Form */}
            <div className="p-2.5 rounded-xl border border-dashed border-border bg-muted/20 space-y-2 text-xs">
              <span className="font-semibold text-foreground block text-[11px]">+ Add Medicine</span>
              <Input
                placeholder="Medicine Name (e.g. Azithromycin 500mg)"
                value={newMed.name}
                onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))}
                className="h-7 text-xs"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  placeholder="Dosage (1 tab)"
                  value={newMed.dosage}
                  onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))}
                  className="h-7 text-xs"
                />
                <Input
                  placeholder="Duration (5 days)"
                  value={newMed.duration}
                  onChange={e => setNewMed(p => ({ ...p, duration: e.target.value }))}
                  className="h-7 text-xs"
                />
              </div>
              <Button size="sm" variant="secondary" onClick={handleAddMedication} className="w-full h-7 text-xs">
                <PlusCircle className="w-3 h-3 mr-1" />
                Add to Rx List
              </Button>
            </div>

            {/* Clinical Advice & Follow-up */}
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Clinical Advice:</Label>
                <textarea
                  rows={2}
                  value={clinicalAdvice}
                  onChange={e => setClinicalAdvice(e.target.value)}
                  placeholder="Diet, lifestyle, and care instructions..."
                  className="w-full p-2 rounded-lg border border-input text-xs bg-background resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Follow-up Date:</Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleCompleteConsultation}
              className="w-full gap-2 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMarathi ? 'सल्लामसलत पूर्ण करा व Rx पाठवा' : 'Sign & Issue Digital Rx'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DoctorConsultation
