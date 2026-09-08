// useVoiceRx.ts — Marathi/Hindi/English voice-to-prescription using Web Speech API
import { useState, useRef, useCallback } from 'react'

export interface ParsedRx {
  diagnosis?: string
  medicineName?: string
  dosage?: string
  frequency?: string
  duration?: string
  advice?: string
  rawText: string
}

// Marathi/Hindi → English medical term mappings
const FREQ_MAP: Record<string, string> = {
  'दोनदा': 'Twice daily', 'दोन वेळा': 'Twice daily', 'दोनवेळा': 'Twice daily',
  'तीनदा': 'Three times daily', 'तीन वेळा': 'Three times daily',
  'एकदा': 'Once daily', 'एक वेळा': 'Once daily',
  'सकाळी': 'Morning', 'रात्री': 'Night', 'संध्याकाळी': 'Evening',
  'जेवणानंतर': 'After meals', 'जेवणापूर्वी': 'Before meals',
  'दो बार': 'Twice daily', 'तीन बार': 'Three times daily', 'एक बार': 'Once daily',
  'twice': 'Twice daily', 'thrice': 'Three times daily', 'once': 'Once daily',
  'morning': 'Morning', 'night': 'Night', 'evening': 'Evening',
  'after meals': 'After meals', 'before meals': 'Before meals',
}

const DURATION_MAP: Record<string, string> = {
  'पाच दिवस': '5 days', 'सात दिवस': '7 days', 'तीन दिवस': '3 days',
  'दहा दिवस': '10 days', 'एक आठवडा': '7 days', 'दोन आठवडे': '14 days',
  'पाच': '5 days', 'सात': '7 days', 'तीन': '3 days',
  'पाच दिन': '5 days', 'सात दिन': '7 days', 'तीन दिन': '3 days',
  '5 days': '5 days', '7 days': '7 days', '3 days': '3 days', '10 days': '10 days',
}

const DOSAGE_MAP: Record<string, string> = {
  'एक गोळी': '1 tablet', 'दोन गोळ्या': '2 tablets', 'अर्धी गोळी': '½ tablet',
  'एक कॅप्सूल': '1 capsule', 'एक चमचा': '5ml syrup',
  'एक टैबलेट': '1 tablet', 'दो टैबलेट': '2 tablets',
  '1 tablet': '1 tablet', '2 tablets': '2 tablets', 'half tablet': '½ tablet',
}

function parseVoiceText(text: string): ParsedRx {
  const lower = text.toLowerCase()
  const result: ParsedRx = { rawText: text }

  // Detect diagnosis keywords
  const diagKeywords = ['निदान', 'आजार', 'diagnosis', 'condition', 'problem', 'तक्रार']
  for (const kw of diagKeywords) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) {
      result.diagnosis = text.slice(idx + kw.length).split(/[,।.]/)[0].trim()
      break
    }
  }

  // Detect medicine name (after औषध/medicine/दवा)
  const medKeywords = ['औषध', 'medicine', 'tablet', 'गोळी', 'दवा', 'syrup']
  for (const kw of medKeywords) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) {
      const after = text.slice(idx + kw.length).trim()
      result.medicineName = after.split(/[,।.\s]/)[0].trim() || after.split(' ').slice(0, 3).join(' ')
      break
    }
  }

  // Match frequency
  for (const [mr, en] of Object.entries(FREQ_MAP)) {
    if (lower.includes(mr.toLowerCase())) { result.frequency = en; break }
  }

  // Match duration
  for (const [mr, en] of Object.entries(DURATION_MAP)) {
    if (lower.includes(mr.toLowerCase())) { result.duration = en; break }
  }

  // Match dosage
  for (const [mr, en] of Object.entries(DOSAGE_MAP)) {
    if (lower.includes(mr.toLowerCase())) { result.dosage = en; break }
  }

  // Advice keywords
  const adviceKeywords = ['सल्ला', 'advice', 'सूचना', 'आराम', 'rest', 'पाणी', 'water']
  for (const kw of adviceKeywords) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) {
      result.advice = text.slice(idx).split(/[।.]/)[0].trim()
      break
    }
  }

  return result
}

export interface UseVoiceRxReturn {
  isListening: boolean
  transcript: string
  interimText: string
  parsed: ParsedRx | null
  supported: boolean
  startListening: (lang?: 'mr-IN' | 'hi-IN' | 'en-IN') => void
  stopListening: () => void
  clearTranscript: () => void
}

export function useVoiceRx(): UseVoiceRxReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [parsed, setParsed] = useState<ParsedRx | null>(null)
  const recognitionRef = useRef<any>(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback((lang: 'mr-IN' | 'hi-IN' | 'en-IN' = 'mr-IN') => {
    if (!supported) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + ' '
        else interim += t
      }
      if (final) {
        setTranscript(prev => {
          const updated = (prev + ' ' + final).trim()
          setParsed(parseVoiceText(updated))
          return updated
        })
      }
      setInterimText(interim)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => { setIsListening(false); setInterimText('') }

    recognition.start()
  }, [supported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimText('')
    setParsed(null)
  }, [])

  return { isListening, transcript, interimText, parsed, supported, startListening, stopListening, clearTranscript }
}
