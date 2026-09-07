import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { callNotificationService, type IncomingCallData } from '../../services/callNotificationService'
import { useLocalizedText } from '../../utils/langHelper'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Video, Phone, PhoneOff, Stethoscope, Sparkles } from 'lucide-react'

export const IncomingCallModal: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { localized } = useLocalizedText()
  const [activeCall, setActiveCall] = useState<IncomingCallData | null>(null)

  useEffect(() => {
    // Only show incoming call popups if user is a PATIENT or in demo mode
    const unsubscribe = callNotificationService.subscribe((call) => {
      // If user is currently a DOCTOR, do not show their own call alert
      if (user?.role === 'DOCTOR') {
        setActiveCall(null)
      } else {
        setActiveCall(call)
      }
    })
    return unsubscribe
  }, [user?.role])

  if (!activeCall) return null

  const handleJoin = () => {
    const roomId = activeCall.roomId || activeCall.appointmentId || 'default-room'
    callNotificationService.dismissCall()
    navigate(`/patient/consultation/${roomId}`)
  }

  const handleDecline = () => {
    callNotificationService.dismissCall()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white rounded-2xl shadow-2xl border border-teal-100 max-w-md w-full overflow-hidden text-center p-6 relative"
        >
          {/* Top pulse decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-500" />

          {/* Animated Call Icon */}
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 mb-2">
            🔔 {localized('Incoming Video Consultation', 'सल्लामसलत व्हिडिओ कॉल येत आहे', 'इनकमिंग वीडियो परामर्श कॉल')}
          </span>

          <h3 className="text-xl font-bold text-gray-900 mt-1">
            {activeCall.doctorName}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCall.doctorSpecialty || 'General Telemedicine Officer'}
          </p>

          {activeCall.tokenNumber && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
              <span>{localized('Calling Your Token:', 'आपला टोकन:', 'आपका टोकन:')}</span>
              <span className="text-amber-700 font-black">{activeCall.tokenNumber}</span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3 px-4">
            {localized(
              'Doctor has initiated your teleconsultation session. Please click below to enter the video room.',
              'डॉक्टरांनी आपला सल्लामसलत कक्ष सुरू केला आहे. कृपया सामील होण्यासाठी खाली क्लिक करा.',
              'डॉक्टर ने आपका परामर्श सत्र शुरू कर दिया है. जुड़ने के लिए नीचे क्लिक करें.'
            )}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleDecline}
              className="flex-1 h-11 border-gray-300 text-gray-600 hover:bg-gray-100 gap-1.5 text-xs font-semibold"
            >
              <PhoneOff className="w-4 h-4 text-red-500" />
              {localized('Dismiss', 'रद्द करा', 'खारिज करें')}
            </Button>

            <Button
              type="button"
              onClick={handleJoin}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 gap-1.5 text-xs font-bold"
            >
              <Video className="w-4 h-4" />
              {localized('Join Consultation', 'कॉलमध्ये सामील व्हा', 'परामर्श में जुड़ें')}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
