import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { tokenService, type TokenQueueState, type DoctorAvailabilityStatus } from '../../services/tokenService'
import { useLocalizedText } from '../../utils/langHelper'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  PhoneCall,
  UserCheck,
} from 'lucide-react'

interface TokenQueueCardProps {
  isDoctorView?: boolean
  onCallPatient?: () => void
}

export const TokenQueueCard: React.FC<TokenQueueCardProps> = ({ isDoctorView = false, onCallPatient }) => {
  const { localized } = useLocalizedText()
  const [queueState, setQueueState] = useState<TokenQueueState>(tokenService.getState())

  useEffect(() => {
    const unsubscribe = tokenService.subscribe((state) => {
      setQueueState(state)
    })
    return unsubscribe
  }, [])

  const patientsAhead = tokenService.getPatientsAhead(queueState.myToken, queueState.currentServingToken)
  const waitMinutes = tokenService.getEstimatedWaitMinutes(patientsAhead)
  const isMyTurn = queueState.myToken === queueState.currentServingToken

  const getStatusBadge = (status: DoctorAvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 px-2.5 py-1 text-xs shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {localized('Doctor Free & Available', 'डॉक्टर उपलब्ध आहेत (मोकळे)', 'डॉक्टर उपलब्ध हैं (मुक्त)')}
          </Badge>
        )
      case 'IN_CONSULTATION':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 px-2.5 py-1 text-xs shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {localized('Doctor in Consultation', 'डॉक्टर सल्लामसलत करत आहेत', 'डॉक्टर परामर्श में हैं')}
          </Badge>
        )
      case 'ON_BREAK':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5 px-2.5 py-1 text-xs shadow-sm flex items-center">
            <Clock className="w-3 h-3" />
            {localized('Doctor on Short Break', 'डॉक्टर विश्रांतीवर आहेत', 'डॉक्टर ब्रेक पर हैं')}
          </Badge>
        )
      case 'OFFLINE':
      default:
        return (
          <Badge className="bg-slate-400 text-white gap-1.5 px-2.5 py-1 text-xs shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-white" />
            {localized('Doctor Offline', 'डॉक्टर ऑफलाइन आहेत', 'डॉक्टर ऑफ़लाइन हैं')}
          </Badge>
        )
    }
  }

  // Doctor View Controller Card
  if (isDoctorView) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-teal-50/60 via-white to-sky-50/60 shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🩺</span>
                <h3 className="font-bold text-gray-900 text-base">
                  {localized('OPD Token Queue Manager', 'OPD टोकन व्यवस्थापक', 'OPD टोकन प्रबंधक')}
                </h3>
                {getStatusBadge(queueState.doctorStatus)}
              </div>
              <p className="text-xs text-gray-500">
                {localized(
                  'Manage your patient live queue and update your availability status in real-time.',
                  'आपली थेट रुग्ण रांग व्यवस्थापित करा आणि आपली स्थिती अपडेट करा.',
                  'अपनी लाइव्ह मरीज़ कतार प्रबंधित करें और उपलब्धता अपडेट करें.'
                )}
              </p>
            </div>

            {/* Doctor Status Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-gray-600 mr-1">
                {localized('My Status:', 'माझी स्थिती:', 'मेरी स्थिति:')}
              </span>
              <Button
                type="button"
                size="sm"
                variant={queueState.doctorStatus === 'AVAILABLE' ? 'default' : 'outline'}
                className={`h-8 text-xs font-medium ${queueState.doctorStatus === 'AVAILABLE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                onClick={() => tokenService.setDoctorStatus('AVAILABLE')}
              >
                🟢 {localized('Free', 'उपलब्ध', 'उपलब्ध')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={queueState.doctorStatus === 'IN_CONSULTATION' ? 'default' : 'outline'}
                className={`h-8 text-xs font-medium ${queueState.doctorStatus === 'IN_CONSULTATION' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
                onClick={() => tokenService.setDoctorStatus('IN_CONSULTATION')}
              >
                🟡 {localized('Busy', 'सल्लामसलत', 'परामर्श')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={queueState.doctorStatus === 'ON_BREAK' ? 'default' : 'outline'}
                className="h-8 text-xs font-medium"
                onClick={() => tokenService.setDoctorStatus('ON_BREAK')}
              >
                ☕ {localized('Break', 'विश्रांती', 'ब्रेक')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 items-center">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <span className="text-xs text-gray-500 font-medium block">
                {localized('Currently Serving', 'सध्या चालू टोकन', 'वर्तमान टोकन')}
              </span>
              <span className="text-2xl font-black text-primary-700 tracking-tight">
                {tokenService.formatToken(queueState.currentServingToken)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <span className="text-xs text-gray-500 font-medium block">
                {localized('Total in OPD Queue', 'रांगेतील एकूण रुग्ण', 'कतार में कुल मरीज़')}
              </span>
              <span className="text-2xl font-black text-gray-800">
                {queueState.totalInQueue}
              </span>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Button
                onClick={() => tokenService.nextPatient()}
                className="flex-1 bg-primary text-white h-10 shadow-sm hover:bg-primary/90 text-xs font-semibold gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                {localized('Call Next Token', 'पुढील टोकन बोलवा', 'अगला टोकन बुलाएं')}
              </Button>

              {onCallPatient && (
                <Button
                  onClick={onCallPatient}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10 shadow-sm text-xs font-semibold gap-1.5 animate-pulse"
                >
                  <PhoneCall className="w-4 h-4" />
                  {localized('Call Patient Now', 'रुग्णाला कॉल करा', 'मरीज़ को कॉल करें')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Patient View Card
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white overflow-hidden relative">
      {/* Background glow & accents */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-5 md:p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 backdrop-blur-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-white">
                  {localized('Live OPD Queue & Token Status', 'थेट OPD टोकन व रांग स्थिती', 'लाइव्ह OPD टोकन व कतार स्थिति')}
                </h3>
                {getStatusBadge(queueState.doctorStatus)}
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                {localized('Doctor:', 'डॉक्टर:', 'डॉक्टर:')} <span className="font-semibold text-white">{queueState.doctorName}</span> • General OPD Teleconsultation
              </p>
            </div>
          </div>

          <Link to="/patient/consultation">
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs shadow-md gap-1.5 h-9"
            >
              <Video className="w-4 h-4" />
              {localized('Open Consultation Room', 'सल्लामसलत रूम उघडा', 'परामर्श कक्ष खोलें')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {/* Your Token */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] font-medium text-teal-200 uppercase tracking-wider block">
              {localized('Your Token', 'आपला टोकन क्रमांक', 'आपका टोकन')}
            </span>
            <span className="text-2xl md:text-3xl font-black text-amber-300 tracking-tight block mt-0.5">
              {tokenService.formatToken(queueState.myToken)}
            </span>
            <span className="text-[10px] text-teal-100/70">
              {isMyTurn
                ? localized('⭐ It is your turn now!', '⭐ आता आपली पाळी आहे!', '⭐ अब आपकी बारी है!')
                : localized('Assigned for Today', 'आजसाठी नियुक्त', 'आज के लिए निर्धारित')}
            </span>
          </div>

          {/* Currently Serving */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] font-medium text-teal-200 uppercase tracking-wider block">
              {localized('Currently Serving', 'सध्या चालू टोकन', 'वर्तमान टोकन')}
            </span>
            <span className="text-2xl md:text-3xl font-black text-white tracking-tight block mt-0.5">
              {tokenService.formatToken(queueState.currentServingToken)}
            </span>
            <span className="text-[10px] text-teal-100/70">
              {queueState.doctorStatus === 'AVAILABLE'
                ? localized('Doctor Ready for Next', 'डॉक्टर पुढील रुग्णासाठी तयार', 'डॉक्टर अगले मरीज़ के लिए तैयार')
                : localized('Consultation in Progress', 'सल्लामसलत चालू आहे', 'परामर्श जारी है')}
            </span>
          </div>

          {/* Patients Ahead */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] font-medium text-teal-200 uppercase tracking-wider block">
              {localized('Patients Ahead', 'आपल्या पुढील रुग्ण', 'आगे के मरीज़')}
            </span>
            <span className="text-2xl md:text-3xl font-black text-teal-200 tracking-tight block mt-0.5">
              {patientsAhead}
            </span>
            <span className="text-[10px] text-teal-100/70">
              {patientsAhead === 0
                ? localized('Next in queue!', 'रांगेत पुढची पाळी!', 'कतार में अगले आप!')
                : localized('In waiting room', 'प्रतीक्षा कक्षात आहेत', 'प्रतीक्षा कक्ष में हैं')}
            </span>
          </div>

          {/* Est. Wait Time */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] font-medium text-teal-200 uppercase tracking-wider block">
              {localized('Est. Wait Time', 'अंदाजे प्रतीक्षा वेळ', 'अनुमानित प्रतीक्षा')}
            </span>
            <span className="text-2xl md:text-3xl font-black text-emerald-300 tracking-tight block mt-0.5">
              {patientsAhead === 0 ? '0 mins' : `~${waitMinutes}m`}
            </span>
            <span className="text-[10px] text-teal-100/70">
              {patientsAhead === 0
                ? localized('Doctor ready to call', 'डॉक्टर कधीही कॉल करतील', 'डॉक्टर जल्द कॉल करेंगे')
                : localized('Average ~7 mins/patient', 'सरासरी ~7 मिनिटे/रुग्ण', 'औसत ~7 मिनट/मरीज़')}
            </span>
          </div>
        </div>

        {isMyTurn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-emerald-500/25 border border-emerald-400/40 rounded-xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 text-emerald-200 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {localized(
                  'Your token is currently being called! Please stay ready or open your consultation room.',
                  'आपला टोकन सध्या बोलवला जात आहे! कृपया तयार राहा किंवा सल्लामसलत कक्ष उघडा.',
                  'आपका टोकन अभी बुलाया जा रहा है! कृपया तैयार रहें या परामर्श कक्ष खोलें.'
                )}
              </span>
            </div>
            <Link to="/patient/consultation">
              <Button size="sm" className="bg-white text-emerald-800 hover:bg-white/90 font-bold h-7 text-xs">
                {localized('Join Now', 'आता सामील व्हा', 'अभी जुड़ें')}
              </Button>
            </Link>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
