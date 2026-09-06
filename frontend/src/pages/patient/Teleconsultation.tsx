import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { appointmentService } from '../../services/appointmentService'
import { useAuth } from '../../hooks/useAuth'
import { useWebRTC } from '../../hooks/useWebRTC'
import { useAIAnalysis } from '../../hooks/useAIAnalysis'
import type { Appointment } from '../../types'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  Share2,
  Wifi,
  WifiOff,
  AlertCircle,
  Phone,
  VolumeX,
  Brain,
  Heart,
  Activity,
  Thermometer,
} from 'lucide-react'

const PatientTeleconsultation: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { i18n } = useTranslation()

  // For testing without login - use a default user if not authenticated
  const effectiveUser = user || {
    id: 'demo-patient-1',
    firstName: 'Ramesh',
    lastName: 'Patil',
    name: 'Ramesh Patil',
    role: 'PATIENT' as const,
  }

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [callEnded, setCallEnded] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [showAIStatus, setShowAIStatus] = useState(true)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // WebRTC Hook
  const userName = effectiveUser ? `${effectiveUser.firstName} ${effectiveUser.lastName}` : 'Patient'
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
    role: 'PATIENT',
    autoJoin: false,
  })

  // AI Analysis on patient's own video (self-monitoring)
  const {
    analysis: aiAnalysis,
    isAnalyzing,
  } = useAIAnalysis({
    videoRef: localVideoRef,
    enabled: hasJoined && isCallActive && showAIStatus,
    intervalMs: 5000,
  })

  // Load appointment data
  useEffect(() => {
    if (id) {
      appointmentService.getAppointmentById(id).then(apt => {
        if (apt) setAppointment(apt)
      })
    }
  }, [id])

  // Call duration timer
  useEffect(() => {
    if (!hasJoined || callEnded) return
    const timer = setInterval(() => setCallDuration(p => p + 1), 1000)
    return () => clearInterval(timer)
  }, [hasJoined, callEnded])

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

  const handleEndCall = () => {
    endCall()
    setCallEnded(true)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    sendMessage(newMessage)
    setNewMessage('')
  }

  const isMarathi = i18n.language === 'mr'
  const doctorName = peer?.odName || (appointment as any)?.doctorName || `Dr. Rajesh Patil`

  // Pre-call waiting screen
  if (!hasJoined && !callEnded) {
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
              {isMarathi ? 'व्हिडिओ सल्लामसलतीसाठी तयार व्हा' : 'Ready for Video Consultation'}
            </h2>
            
            <p className="text-muted-foreground mb-2">
              {isMarathi
                ? `तुमचे डॉक्टर ${doctorName} लवकरच सामील होतील`
                : `Your doctor ${doctorName} will join shortly`}
            </p>
            
            <p className="text-sm text-primary mb-6">
              {isMarathi ? 'कृपया शांत ठिकाणी रहा आणि चांगला प्रकाश असल्याची खात्री करा' : 'Please be in a quiet place with good lighting'}
            </p>

            {/* AI Analysis Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold text-sm">AI Health Monitoring</span>
              </div>
              <p className="text-xs text-muted-foreground">
                During the call, AI will monitor your vitals and help the doctor provide better care. 
                This is safe and helps in accurate diagnosis.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {/* Pre-call Checklist */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                {isMarathi ? 'कॉलपूर्व तपासणी' : 'Pre-Call Checklist'}
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {isMarathi ? 'स्थिर इंटरनेट कनेक्शन' : 'Stable internet connection'}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {isMarathi ? 'कॅमेरा आणि मायक्रोफोन तयार' : 'Camera and microphone ready'}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {isMarathi ? 'शांत वातावरण' : 'Quiet environment'}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {isMarathi ? 'लक्षणांची यादी तयार' : 'List of symptoms ready'}
                </li>
              </ul>
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
                    {isMarathi ? 'सल्लामसलतीत सामील व्हा' : 'Join Consultation'}
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/patient/appointments">
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Post-call completion screen
  if (callEnded) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 border-emerald-500/70 shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isMarathi ? 'सल्लामसलत पूर्ण!' : 'Consultation Complete!'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isMarathi
                ? 'तुमची व्हिडिओ सल्लामसलत यशस्वीरित्या पूर्ण झाली.'
                : 'Your video consultation has been successfully completed.'}
            </p>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-left my-6 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{isMarathi ? 'डॉक्टर:' : 'Doctor:'}</span>
                <span className="font-medium text-foreground">{doctorName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isMarathi ? 'कालावधी:' : 'Duration:'}</span>
                <span className="font-medium text-foreground">{formatDuration(callDuration)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isMarathi ? 'संदेश:' : 'Messages:'}</span>
                <span className="font-medium text-foreground">{messages.length}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              {isMarathi
                ? 'तुमचे डॉक्टर लवकरच डिजिटल प्रिस्क्रिप्शन पाठवतील.'
                : 'Your doctor will send a digital prescription shortly.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="gap-2 bg-gradient-to-r from-primary to-indigo-600">
                <Link to="/patient/prescriptions">
                  <FileText className="w-4 h-4" />
                  {isMarathi ? 'प्रिस्क्रिप्शन पहा' : 'View Prescriptions'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/patient">
                  {isMarathi ? 'डॅशबोर्ड' : 'Back to Dashboard'}
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
    <div className="max-w-6xl mx-auto space-y-4 pb-12 px-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            {isCallActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">{doctorName}</h2>
              <Badge className={`text-[10px] px-2 py-0 ${isCallActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {isCallActive ? 'LIVE' : 'CONNECTING...'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {(appointment as any)?.doctorSpecialization || 'General Physician'} •
              {isConnected ? (
                <span className="text-emerald-600 ml-1 inline-flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-amber-600 ml-1 inline-flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Connecting
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted font-mono text-xs text-foreground font-semibold">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {formatDuration(callDuration)}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/patient" className="text-xs">
              <Share2 className="w-3.5 h-3.5 mr-1" />
              {isMarathi ? 'डॅशबोर्ड' : 'Dashboard'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Section (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Main Video */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800">
            {/* Remote video - always mounted, visibility controlled by CSS */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${remoteStream ? 'block' : 'hidden'}`}
            />
            
            {/* Placeholder when no remote stream */}
            {!remoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
                <div className="w-24 h-24 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center text-primary font-bold text-4xl mb-3 shadow-lg">
                  👨‍⚕️
                </div>
                <p className="text-white font-semibold text-lg">{doctorName}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {peer ? 'Establishing video connection...' : 'Waiting for doctor to join...'}
                </p>
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SwasthyaSetu Telehealth
                </div>
              </div>
            )}

            {/* Doctor's media status indicators */}
            {peer && (
              <div className="absolute top-3 left-3 flex gap-2">
                {!isPeerAudioEnabled && (
                  <div className="px-2 py-1 rounded-full bg-red-500/80 text-white text-[10px] flex items-center gap-1">
                    <VolumeX className="w-3 h-3" />
                    Doctor Muted
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

            {/* Self-view (Picture-in-Picture) */}
            <div className="absolute bottom-3 right-3 w-32 h-24 rounded-xl bg-slate-800 border-2 border-slate-600 overflow-hidden shadow-xl">
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
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-xs">
                  {isVideoEnabled ? (
                    <span className="font-semibold">You</span>
                  ) : (
                    <>
                      <VideoOff className="w-6 h-6 mb-1" />
                      <span>Camera Off</span>
                    </>
                  )}
                </div>
              )}

              {/* Your audio indicator */}
              {!isAudioEnabled && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[9px] flex items-center gap-0.5">
                  <MicOff className="w-2.5 h-2.5" />
                </div>
              )}

              {/* AI analyzing indicator */}
              {isAnalyzing && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-primary/80 text-white text-[9px] flex items-center gap-0.5">
                  <Brain className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          </div>

          {/* Video Controls */}
          <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-sm">
            <Button
              variant={!isAudioEnabled ? 'destructive' : 'secondary'}
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={toggleAudio}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {!isAudioEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              variant={!isVideoEnabled ? 'destructive' : 'secondary'}
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={toggleVideo}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full px-6 gap-2"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-5 h-5" />
              {isMarathi ? 'कॉल संपवा' : 'End Call'}
            </Button>
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-3">
          {/* AI Health Status */}
          {showAIStatus && aiAnalysis && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold">Your Health Status</span>
                  </div>
                  {isAnalyzing && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                {/* Quick Vitals */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <p className="text-sm font-bold">{aiAnalysis.vitalsEstimate.heartRate}</p>
                    <p className="text-[10px] text-muted-foreground">Heart Rate</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <Activity className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                    <p className="text-sm font-bold">{aiAnalysis.vitalsEstimate.oxygenEstimate}%</p>
                    <p className="text-[10px] text-muted-foreground">SpO₂</p>
                  </div>
                </div>

                {/* Status */}
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Overall Status</span>
                    <Badge className={`text-[10px] ${
                      aiAnalysis.riskLevel === 'low' ? 'bg-emerald-500' :
                      aiAnalysis.riskLevel === 'moderate' ? 'bg-amber-500' :
                      'bg-red-500'
                    } text-white`}>
                      {aiAnalysis.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <Progress value={100 - aiAnalysis.riskScore} className="h-1.5" />
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  AI is helping your doctor monitor your health
                </p>
              </CardContent>
            </Card>
          )}

          {/* Chat Section */}
          <Card className="h-80 flex flex-col border-border shadow-sm">
            <CardHeader className="p-3 border-b border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">Chat with Doctor</span>
                </div>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {messages.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs text-center">
                    {isMarathi ? 'अद्याप कोणताही संदेश नाही' : 'No messages yet'}
                  </p>
                  <p className="text-[10px] text-center mt-1">
                    {isMarathi ? 'तुमच्या डॉक्टरांशी संपर्क साधा' : 'Start chatting with your doctor'}
                  </p>
                </div>
              ) : (
                messages.map(m => {
                  const isPatient = m.senderRole === 'PATIENT'
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-muted-foreground mb-0.5">
                        {m.senderName} • {m.timestamp}
                      </span>
                      <div className={`p-2 rounded-xl max-w-[90%] text-xs ${
                        isPatient ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
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
                  placeholder={isMarathi ? 'संदेश लिहा...' : 'Type a message...'}
                  className="h-8 text-xs"
                />
                <Button type="submit" size="sm" className="h-8 px-3" disabled={!newMessage.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </CardFooter>
          </Card>

          {/* Tips Card */}
          <Card className="p-3 border-border/50 bg-muted/30">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {isMarathi ? 'सल्लामसलत टिप्स' : 'Consultation Tips'}
            </h4>
            <ul className="text-[10px] text-muted-foreground space-y-1">
              <li>• {isMarathi ? 'सर्व लक्षणे स्पष्टपणे सांगा' : 'Describe all symptoms clearly'}</li>
              <li>• {isMarathi ? 'प्रश्न विचारायला संकोच करू नका' : "Don't hesitate to ask questions"}</li>
              <li>• {isMarathi ? 'औषधांची माहिती लिहून ठेवा' : 'Note down medicine instructions'}</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PatientTeleconsultation
