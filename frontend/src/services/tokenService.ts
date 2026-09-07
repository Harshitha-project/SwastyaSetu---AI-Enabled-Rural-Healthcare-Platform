/**
 * Token & Doctor Availability Service
 * Manages live OPD token queues, doctor availability status, and cross-tab/cross-device sync.
 */

export type DoctorAvailabilityStatus = 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_BREAK' | 'OFFLINE'

export interface TokenQueueState {
  doctorStatus: DoctorAvailabilityStatus
  doctorName: string
  currentServingToken: number
  totalInQueue: number
  myToken: number
  lastUpdated: string
}

const STORAGE_KEY = 'swasthyasetu_token_state'
const CHANNEL_NAME = 'swasthyasetu_token_bus'

const DEFAULT_STATE: TokenQueueState = {
  doctorStatus: 'AVAILABLE',
  doctorName: 'Dr. Priya Sharma',
  currentServingToken: 12,
  totalInQueue: 18,
  myToken: 14,
  lastUpdated: new Date().toISOString(),
}

type TokenListener = (state: TokenQueueState) => void

class TokenService {
  private channel: BroadcastChannel | null = null
  private listeners: Set<TokenListener> = new Set()
  private currentState: TokenQueueState

  constructor() {
    this.currentState = this.loadState()
    this.initChannel()
  }

  private loadState(): TokenQueueState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {}
    return { ...DEFAULT_STATE }
  }

  private saveState(state: TokenQueueState) {
    this.currentState = state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}

    // Broadcast across tabs
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'TOKEN_STATE_UPDATE', state })
      } catch {}
    }

    // Local dispatch
    window.dispatchEvent(new CustomEvent('swasthyasetu:token_update', { detail: state }))
    this.notifyListeners()
  }

  private initChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME)
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'TOKEN_STATE_UPDATE' && event.data.state) {
            this.currentState = event.data.state
            this.notifyListeners()
          }
        }
      }

      // Storage event listener as additional fallback
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.currentState = JSON.parse(e.newValue)
            this.notifyListeners()
          } catch {}
        }
      })
    } catch {}
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentState))
  }

  getState(): TokenQueueState {
    return { ...this.currentState }
  }

  setDoctorStatus(status: DoctorAvailabilityStatus, doctorName?: string): TokenQueueState {
    const updated: TokenQueueState = {
      ...this.currentState,
      doctorStatus: status,
      doctorName: doctorName || this.currentState.doctorName,
      lastUpdated: new Date().toISOString(),
    }
    this.saveState(updated)
    return updated
  }

  nextPatient(): TokenQueueState {
    const nextToken = this.currentState.currentServingToken + 1
    const updated: TokenQueueState = {
      ...this.currentState,
      currentServingToken: nextToken,
      doctorStatus: 'IN_CONSULTATION',
      lastUpdated: new Date().toISOString(),
    }
    this.saveState(updated)
    return updated
  }

  finishConsultation(): TokenQueueState {
    const updated: TokenQueueState = {
      ...this.currentState,
      doctorStatus: 'AVAILABLE',
      lastUpdated: new Date().toISOString(),
    }
    this.saveState(updated)
    return updated
  }

  setPatientToken(tokenNum: number): TokenQueueState {
    const updated: TokenQueueState = {
      ...this.currentState,
      myToken: tokenNum,
      lastUpdated: new Date().toISOString(),
    }
    this.saveState(updated)
    return updated
  }

  subscribe(listener: TokenListener): () => void {
    this.listeners.add(listener)
    listener(this.currentState)
    return () => {
      this.listeners.delete(listener)
    }
  }

  formatToken(num: number): string {
    return `#A-${String(num).padStart(2, '0')}`
  }

  getPatientsAhead(myToken?: number, servingToken?: number): number {
    const mine = myToken ?? this.currentState.myToken
    const serving = servingToken ?? this.currentState.currentServingToken
    return Math.max(0, mine - serving)
  }

  getEstimatedWaitMinutes(patientsAhead: number): number {
    return patientsAhead * 7 // Avg 7 mins per consultation
  }
}

export const tokenService = new TokenService()
