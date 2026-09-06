import type { Consultation, ApiResponse } from '../types'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'PATIENT' | 'DOCTOR'
  text: string
  timestamp: string
}

const DEMO_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'apt-101': [
    {
      id: 'm-1',
      senderId: 'u-doc-1',
      senderName: 'Dr. Rajesh Patil',
      senderRole: 'DOCTOR',
      text: 'नमस्कार Priya ji. How are you feeling today? Are you experiencing any breathing discomfort?',
      timestamp: '10:31 AM',
    },
    {
      id: 'm-2',
      senderId: 'u-pat-1',
      senderName: 'Priya Sharma',
      senderRole: 'PATIENT',
      text: 'Good morning Doctor. The fever has gone down slightly, but the chest heaviness and coughing get worse at night.',
      timestamp: '10:32 AM',
    },
    {
      id: 'm-3',
      senderId: 'u-doc-1',
      senderName: 'Dr. Rajesh Patil',
      senderRole: 'DOCTOR',
      text: 'I see your SpO2 is 97% which is reassuring. Let me prescribe steam inhalation and an antibiotic course.',
      timestamp: '10:33 AM',
    },
  ],
}

export const consultationService = {
  // Get chat messages for consultation/appointment
  getMessages(appointmentId: string): ChatMessage[] {
    try {
      const raw = localStorage.getItem(`swasthyasetu_chat_${appointmentId}`)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.error(e)
    }
    const def = DEMO_CHAT_MESSAGES[appointmentId] || [
      {
        id: 'm-init',
        senderId: 'u-doc-1',
        senderName: 'Dr. Rajesh Patil',
        senderRole: 'DOCTOR',
        text: 'Hello! I have reviewed your AI health assessment and vital signs. How can I assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]
    localStorage.setItem(`swasthyasetu_chat_${appointmentId}`, JSON.stringify(def))
    return def
  },

  // Send a message
  sendMessage(appointmentId: string, message: { senderId: string; senderName: string; senderRole: 'PATIENT' | 'DOCTOR'; text: string }): ChatMessage[] {
    const list = this.getMessages(appointmentId)
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      text: message.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    list.push(newMsg)
    try {
      localStorage.setItem(`swasthyasetu_chat_${appointmentId}`, JSON.stringify(list))
    } catch (e) {
      console.error(e)
    }
    return list
  }
}
