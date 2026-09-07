/**
 * Call Notification Service
 * Manages real-time incoming consultation call alerts from doctor to patient across tabs and devices.
 */

export interface IncomingCallData {
  callId: string
  doctorName: string
  doctorSpecialty?: string
  patientId: string
  patientName?: string
  appointmentId: string
  roomId: string
  tokenNumber?: string
  timestamp: number
}

type CallListener = (call: IncomingCallData | null) => void

const CALL_STORAGE_KEY = 'swasthyasetu_active_call'
const CALL_CHANNEL_NAME = 'swasthyasetu_call_channel'

class CallNotificationService {
  private channel: BroadcastChannel | null = null
  private listeners: Set<CallListener> = new Set()
  private activeCall: IncomingCallData | null = null
  private ringtoneInterval: any = null
  private audioCtx: AudioContext | null = null

  constructor() {
    this.initChannel()
  }

  private initChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CALL_CHANNEL_NAME)
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'INCOMING_CALL') {
            this.handleIncomingCall(event.data.call)
          } else if (event.data?.type === 'DISMISS_CALL') {
            this.handleDismissCall()
          }
        }
      }

      window.addEventListener('storage', (e) => {
        if (e.key === CALL_STORAGE_KEY) {
          if (e.newValue) {
            try {
              const call = JSON.parse(e.newValue)
              this.handleIncomingCall(call)
            } catch {}
          } else {
            this.handleDismissCall()
          }
        }
      })
    } catch {}
  }

  private handleIncomingCall(call: IncomingCallData) {
    this.activeCall = call
    this.startRing()
    this.notifyListeners()
  }

  private handleDismissCall() {
    this.activeCall = null
    this.stopRing()
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.activeCall))
  }

  // Synthesize a pleasant hospital phone chime using Web Audio API
  private startRing() {
    try {
      if (!this.audioCtx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass()
        }
      }

      const playChime = () => {
        if (!this.audioCtx) return
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume()
        }

        const now = this.audioCtx.currentTime
        // Note 1 (E5 - 659Hz)
        const osc1 = this.audioCtx.createOscillator()
        const gain1 = this.audioCtx.createGain()
        osc1.frequency.setValueAtTime(659.25, now)
        gain1.gain.setValueAtTime(0.15, now)
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
        osc1.connect(gain1)
        gain1.connect(this.audioCtx.destination)
        osc1.start(now)
        osc1.stop(now + 0.4)

        // Note 2 (G#5 - 830Hz)
        const osc2 = this.audioCtx.createOscillator()
        const gain2 = this.audioCtx.createGain()
        osc2.frequency.setValueAtTime(830.61, now + 0.2)
        gain2.gain.setValueAtTime(0.15, now + 0.2)
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
        osc2.connect(gain2)
        gain2.connect(this.audioCtx.destination)
        osc2.start(now + 0.2)
        osc2.stop(now + 0.7)
      }

      playChime()
      if (this.ringtoneInterval) clearInterval(this.ringtoneInterval)
      this.ringtoneInterval = setInterval(playChime, 2500)
    } catch {}
  }

  private stopRing() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval)
      this.ringtoneInterval = null
    }
  }

  /**
   * Doctor initiates a call to the patient
   */
  initiateCall(callInfo: Partial<IncomingCallData>): IncomingCallData {
    const call: IncomingCallData = {
      callId: `call-${Date.now()}`,
      doctorName: callInfo.doctorName || 'Dr. Priya Sharma',
      doctorSpecialty: callInfo.doctorSpecialty || 'General Telemedicine Officer',
      patientId: callInfo.patientId || 'pat-001',
      patientName: callInfo.patientName || 'Ramesh Patil',
      appointmentId: callInfo.appointmentId || 'apt-101',
      roomId: callInfo.roomId || 'room-apt-101',
      tokenNumber: callInfo.tokenNumber || '#A-14',
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(CALL_STORAGE_KEY, JSON.stringify(call))
    } catch {}

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'INCOMING_CALL', call })
      } catch {}
    }

    window.dispatchEvent(new CustomEvent('swasthyasetu:incoming_call', { detail: call }))
    return call
  }

  /**
   * Patient accepts or dismisses the call
   */
  dismissCall() {
    this.handleDismissCall()
    try {
      localStorage.removeItem(CALL_STORAGE_KEY)
    } catch {}

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'DISMISS_CALL' })
      } catch {}
    }

    window.dispatchEvent(new CustomEvent('swasthyasetu:call_dismissed'))
  }

  getActiveCall(): IncomingCallData | null {
    return this.activeCall
  }

  subscribe(listener: CallListener): () => void {
    this.listeners.add(listener)
    listener(this.activeCall)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export const callNotificationService = new CallNotificationService()
