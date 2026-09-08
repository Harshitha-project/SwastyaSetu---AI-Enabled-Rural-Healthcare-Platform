// SMS Prescription Service
// Uses fast2sms API (free tier) when online, queues offline for later delivery

export interface SMSPrescription {
  patientName: string
  patientPhone: string
  doctorName: string
  diagnosis: string
  medications: { name: string; dosage: string; frequency: string; duration: string }[]
  followUpDate?: string
  rxId: string
}

const SMS_QUEUE_KEY = 'swasthyasetu_sms_queue'

function formatSMSText(rx: SMSPrescription): string {
  const medLines = rx.medications
    .slice(0, 4) // SMS character limit
    .map((m, i) => `${i + 1}.${m.name} ${m.dosage} ${m.frequency} x${m.duration}`)
    .join('\n')

  return `SwasthyaSetu Rx #${rx.rxId.slice(-6).toUpperCase()}
Dr: ${rx.doctorName}
Patient: ${rx.patientName}
Diagnosis: ${rx.diagnosis}
Medicines:
${medLines}${rx.followUpDate ? `\nFollow-up: ${rx.followUpDate}` : ''}
Helpline: 104`
}

function getQueue(): SMSPrescription[] {
  try { return JSON.parse(localStorage.getItem(SMS_QUEUE_KEY) || '[]') } catch { return [] }
}

function saveQueue(q: SMSPrescription[]) {
  localStorage.setItem(SMS_QUEUE_KEY, JSON.stringify(q))
}

export const smsService = {
  // Send SMS prescription — queues if offline, sends immediately if online
  async sendPrescriptionSMS(rx: SMSPrescription): Promise<{ success: boolean; queued: boolean; message: string }> {
    const text = formatSMSText(rx)

    // Try sending via fast2sms (requires VITE_FAST2SMS_KEY env var)
    const apiKey = import.meta.env.VITE_FAST2SMS_KEY
    if (apiKey && navigator.onLine) {
      try {
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: { authorization: apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            route: 'q',
            message: text,
            language: 'english',
            flash: 0,
            numbers: rx.patientPhone.replace(/\D/g, '').slice(-10),
          }),
        })
        const data = await res.json()
        if (data.return) {
          return { success: true, queued: false, message: `SMS sent to ${rx.patientPhone}` }
        }
      } catch {
        // Fall through to queue
      }
    }

    // Offline or API unavailable — queue for later
    const queue = getQueue()
    queue.push(rx)
    saveQueue(queue)

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready
        await (reg as any).sync.register('sync-sms-queue')
      } catch {}
    }

    return {
      success: false,
      queued: true,
      message: navigator.onLine
        ? 'SMS queued (API key not configured). Will send when configured.'
        : 'No internet. SMS queued — will auto-send when connection restores.',
    }
  },

  // Retry all queued SMS (called when back online)
  async flushQueue(): Promise<number> {
    const queue = getQueue()
    if (!queue.length || !navigator.onLine) return 0
    let sent = 0
    const remaining: SMSPrescription[] = []
    for (const rx of queue) {
      const result = await this.sendPrescriptionSMS(rx)
      if (result.success) sent++
      else if (!result.queued) remaining.push(rx) // permanent failure
    }
    saveQueue(remaining)
    return sent
  },

  getPendingCount(): number {
    return getQueue().length
  },

  // Format SMS text for preview (no API call)
  previewSMS(rx: SMSPrescription): string {
    return formatSMSText(rx)
  },
}
