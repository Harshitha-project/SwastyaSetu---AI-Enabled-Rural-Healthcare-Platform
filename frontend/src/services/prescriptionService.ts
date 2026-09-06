/**
 * Prescription Service for SwasthyaSetu
 * Handles prescription creation, PDF generation, and QR codes
 */

import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import api from './api'

// Prescription medication interface
export interface PrescriptionMedication {
  id: string
  name: string
  genericName?: string
  dosage: string
  frequency: string
  duration: string
  route: string
  instructions?: string
  quantity?: number
}

// Full prescription interface
export interface Prescription {
  id: string
  prescriptionNumber: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  patientPhone: string
  patientAddress: string
  
  doctorId: string
  doctorName: string
  doctorQualification: string
  doctorSpecialization: string
  doctorRegistrationNumber: string
  doctorPhone?: string
  
  facilityName?: string
  facilityAddress?: string
  facilityPhone?: string
  
  consultationId?: string
  appointmentId?: string
  
  diagnosis: string
  symptoms: string[]
  medications: PrescriptionMedication[]
  
  advice?: string
  followUpDate?: string
  
  validUntil: string
  createdAt: string
  
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    spo2?: number
  }
  
  qrCode?: string
  verificationUrl?: string
}

// Create prescription interface (for API)
export interface CreatePrescriptionData {
  patientId: string
  consultationId?: string
  appointmentId?: string
  diagnosis: string
  symptoms: string[]
  medications: PrescriptionMedication[]
  advice?: string
  followUpDate?: string
  vitals?: Prescription['vitals']
}

class PrescriptionService {
  
  /**
   * Generate a unique prescription number
   */
  generatePrescriptionNumber(): string {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `RX${year}${month}${day}-${random}`
  }

  /**
   * Generate QR code for prescription verification
   */
  async generateQRCode(prescription: Prescription): Promise<string> {
    const verificationUrl = `${window.location.origin}/verify-prescription/${prescription.id}`
    const qrData = JSON.stringify({
      id: prescription.id,
      number: prescription.prescriptionNumber,
      patient: prescription.patientName,
      doctor: prescription.doctorName,
      date: prescription.createdAt,
      url: verificationUrl,
    })
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      return qrCodeDataUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      return ''
    }
  }

  /**
   * Generate prescription PDF
   */
  async generatePDF(prescription: Prescription): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPos = margin

    // Colors
    const primaryColor: [number, number, number] = [13, 148, 136] // Teal
    const textColor: [number, number, number] = [30, 30, 30]
    const lightGray: [number, number, number] = [240, 240, 240]

    // Helper functions
    const drawLine = (y: number) => {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
    }

    const addText = (text: string, x: number, y: number, options?: { 
      fontSize?: number, 
      fontStyle?: 'normal' | 'bold' | 'italic',
      color?: [number, number, number],
      align?: 'left' | 'center' | 'right'
    }) => {
      const { fontSize = 10, fontStyle = 'normal', color = textColor, align = 'left' } = options || {}
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', fontStyle)
      doc.setTextColor(...color)
      doc.text(text, x, y, { align })
    }

    // === HEADER SECTION ===
    // Clinic/Hospital Name
    addText(prescription.facilityName || 'SwasthyaSetu Healthcare', pageWidth / 2, yPos, {
      fontSize: 16,
      fontStyle: 'bold',
      color: primaryColor,
      align: 'center',
    })
    yPos += 6

    // Facility Address
    if (prescription.facilityAddress) {
      addText(prescription.facilityAddress, pageWidth / 2, yPos, {
        fontSize: 9,
        align: 'center',
      })
      yPos += 4
    }

    // Facility Phone
    if (prescription.facilityPhone) {
      addText(`Tel: ${prescription.facilityPhone}`, pageWidth / 2, yPos, {
        fontSize: 9,
        align: 'center',
      })
      yPos += 4
    }

    yPos += 2
    drawLine(yPos)
    yPos += 6

    // === DOCTOR SECTION ===
    addText(prescription.doctorName, margin, yPos, {
      fontSize: 12,
      fontStyle: 'bold',
      color: primaryColor,
    })
    
    // Prescription number on right
    addText(`Rx No: ${prescription.prescriptionNumber}`, pageWidth - margin, yPos, {
      fontSize: 9,
      align: 'right',
    })
    yPos += 5

    addText(prescription.doctorQualification, margin, yPos, { fontSize: 9 })
    addText(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-IN')}`, pageWidth - margin, yPos, {
      fontSize: 9,
      align: 'right',
    })
    yPos += 4

    addText(prescription.doctorSpecialization, margin, yPos, { fontSize: 9 })
    yPos += 4

    addText(`Reg. No: ${prescription.doctorRegistrationNumber}`, margin, yPos, { fontSize: 9 })
    yPos += 6

    drawLine(yPos)
    yPos += 6

    // === PATIENT SECTION ===
    // Patient info box
    doc.setFillColor(...lightGray)
    doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 20, 'F')

    addText('Patient Details', margin + 3, yPos + 2, { fontSize: 9, fontStyle: 'bold' })
    yPos += 6

    const patientCol1 = margin + 3
    const patientCol2 = pageWidth / 2

    addText(`Name: ${prescription.patientName}`, patientCol1, yPos, { fontSize: 10 })
    addText(`Age/Gender: ${prescription.patientAge} yrs / ${prescription.patientGender}`, patientCol2, yPos, { fontSize: 10 })
    yPos += 5

    addText(`Phone: ${prescription.patientPhone}`, patientCol1, yPos, { fontSize: 10 })
    if (prescription.patientAddress) {
      const shortAddr = prescription.patientAddress.length > 40 
        ? prescription.patientAddress.substring(0, 40) + '...' 
        : prescription.patientAddress
      addText(`Address: ${shortAddr}`, patientCol2, yPos, { fontSize: 10 })
    }
    yPos += 8

    // === VITALS SECTION (if available) ===
    if (prescription.vitals && Object.keys(prescription.vitals).some(k => prescription.vitals?.[k as keyof typeof prescription.vitals])) {
      yPos += 2
      addText('Vitals:', margin, yPos, { fontSize: 9, fontStyle: 'bold' })
      yPos += 4

      const vitalsText: string[] = []
      if (prescription.vitals.bloodPressure) vitalsText.push(`BP: ${prescription.vitals.bloodPressure} mmHg`)
      if (prescription.vitals.heartRate) vitalsText.push(`Pulse: ${prescription.vitals.heartRate} bpm`)
      if (prescription.vitals.temperature) vitalsText.push(`Temp: ${prescription.vitals.temperature}°F`)
      if (prescription.vitals.weight) vitalsText.push(`Weight: ${prescription.vitals.weight} kg`)
      if (prescription.vitals.spo2) vitalsText.push(`SpO2: ${prescription.vitals.spo2}%`)
      
      addText(vitalsText.join('  |  '), margin, yPos, { fontSize: 9 })
      yPos += 6
    }

    // === DIAGNOSIS SECTION ===
    yPos += 2
    addText('Diagnosis:', margin, yPos, { fontSize: 10, fontStyle: 'bold' })
    yPos += 5
    addText(prescription.diagnosis, margin, yPos, { fontSize: 10 })
    yPos += 6

    // Symptoms
    if (prescription.symptoms && prescription.symptoms.length > 0) {
      addText('Chief Complaints:', margin, yPos, { fontSize: 10, fontStyle: 'bold' })
      yPos += 5
      addText(prescription.symptoms.join(', '), margin, yPos, { fontSize: 10 })
      yPos += 8
    }

    drawLine(yPos)
    yPos += 6

    // === PRESCRIPTION SYMBOL ===
    addText('℞', margin, yPos + 2, { fontSize: 20, fontStyle: 'bold', color: primaryColor })
    yPos += 8

    // === MEDICATIONS TABLE ===
    const colWidths = {
      sno: 10,
      medicine: 55,
      dosage: 25,
      frequency: 30,
      duration: 25,
      instructions: 35,
    }

    // Table header
    doc.setFillColor(...primaryColor)
    doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 8, 'F')

    let xPos = margin + 2
    const headerY = yPos + 2
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')

    doc.text('#', xPos, headerY)
    xPos += colWidths.sno
    doc.text('Medicine', xPos, headerY)
    xPos += colWidths.medicine
    doc.text('Dosage', xPos, headerY)
    xPos += colWidths.dosage
    doc.text('Frequency', xPos, headerY)
    xPos += colWidths.frequency
    doc.text('Duration', xPos, headerY)
    xPos += colWidths.duration
    doc.text('Instructions', xPos, headerY)

    yPos += 8

    // Table rows
    doc.setTextColor(...textColor)
    doc.setFont('helvetica', 'normal')

    prescription.medications.forEach((med, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage()
        yPos = margin
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 10, 'F')
      }

      xPos = margin + 2
      const rowY = yPos + 2

      doc.setFontSize(9)
      doc.text((index + 1).toString(), xPos, rowY)
      xPos += colWidths.sno

      // Medicine name (bold) + generic name
      doc.setFont('helvetica', 'bold')
      doc.text(med.name, xPos, rowY)
      if (med.genericName) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7)
        doc.text(`(${med.genericName})`, xPos, rowY + 3)
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      xPos += colWidths.medicine

      doc.text(med.dosage, xPos, rowY)
      xPos += colWidths.dosage

      doc.text(med.frequency, xPos, rowY)
      xPos += colWidths.frequency

      doc.text(med.duration, xPos, rowY)
      xPos += colWidths.duration

      if (med.instructions) {
        const shortInstr = med.instructions.length > 20 
          ? med.instructions.substring(0, 20) + '...' 
          : med.instructions
        doc.text(shortInstr, xPos, rowY)
      }

      yPos += 10
    })

    yPos += 5
    drawLine(yPos)
    yPos += 6

    // === ADVICE SECTION ===
    if (prescription.advice) {
      addText('Advice:', margin, yPos, { fontSize: 10, fontStyle: 'bold' })
      yPos += 5
      
      // Word wrap for advice
      const adviceLines = doc.splitTextToSize(prescription.advice, pageWidth - 2 * margin)
      doc.setFontSize(9)
      doc.text(adviceLines, margin, yPos)
      yPos += adviceLines.length * 4 + 4
    }

    // === FOLLOW-UP ===
    if (prescription.followUpDate) {
      addText(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString('en-IN')}`, margin, yPos, {
        fontSize: 10,
        fontStyle: 'bold',
        color: primaryColor,
      })
      yPos += 8
    }

    // === QR CODE ===
    if (prescription.qrCode) {
      try {
        doc.addImage(prescription.qrCode, 'PNG', pageWidth - margin - 25, yPos, 25, 25)
        addText('Scan to verify', pageWidth - margin - 12.5, yPos + 28, {
          fontSize: 7,
          align: 'center',
        })
      } catch (e) {
        console.error('Error adding QR code to PDF:', e)
      }
    }

    // === VALIDITY ===
    addText(`Valid until: ${new Date(prescription.validUntil).toLocaleDateString('en-IN')}`, margin, yPos, {
      fontSize: 9,
    })
    yPos += 5

    // === SIGNATURE SECTION ===
    yPos = Math.max(yPos + 10, pageHeight - 40)
    
    addText('____________________', pageWidth - margin - 40, yPos, { fontSize: 10 })
    yPos += 5
    addText(prescription.doctorName, pageWidth - margin - 40, yPos, { fontSize: 9, fontStyle: 'bold' })
    yPos += 4
    addText('(Signature & Stamp)', pageWidth - margin - 40, yPos, { fontSize: 8 })

    // === FOOTER ===
    yPos = pageHeight - 15
    drawLine(yPos - 3)
    
    addText('This is a digitally generated prescription from SwasthyaSetu Healthcare Platform.', pageWidth / 2, yPos, {
      fontSize: 7,
      align: 'center',
    })
    yPos += 3
    addText('For verification, scan the QR code or visit: swasthyasetu.gov.in/verify', pageWidth / 2, yPos, {
      fontSize: 7,
      align: 'center',
    })
    yPos += 3
    addText('In case of emergency, call 112 or 108', pageWidth / 2, yPos, {
      fontSize: 7,
      align: 'center',
      color: [150, 150, 150],
    })

    return doc.output('blob')
  }

  /**
   * Download prescription as PDF
   */
  async downloadPDF(prescription: Prescription): Promise<void> {
    // Generate QR code if not present
    if (!prescription.qrCode) {
      prescription.qrCode = await this.generateQRCode(prescription)
    }

    const pdfBlob = await this.generatePDF(prescription)
    const url = URL.createObjectURL(pdfBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `Prescription_${prescription.prescriptionNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Print prescription
   */
  async printPrescription(prescription: Prescription): Promise<void> {
    if (!prescription.qrCode) {
      prescription.qrCode = await this.generateQRCode(prescription)
    }

    const pdfBlob = await this.generatePDF(prescription)
    const url = URL.createObjectURL(pdfBlob)
    
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print()
      })
    }
  }

  // === API METHODS ===

  /**
   * Create a new prescription
   */
  async createPrescription(data: CreatePrescriptionData): Promise<Prescription> {
    try {
      const response = await api.post('/prescriptions', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating prescription:', error)
      throw error
    }
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(id: string): Promise<Prescription | null> {
    try {
      const response = await api.get(`/prescriptions/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching prescription:', error)
      return null
    }
  }

  /**
   * Get prescriptions for patient
   */
  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error)
      return []
    }
  }

  /**
   * Get prescriptions by doctor
   */
  async getDoctorPrescriptions(doctorId: string, limit?: number): Promise<Prescription[]> {
    try {
      const response = await api.get(`/prescriptions/doctor/${doctorId}`, {
        params: { limit },
      })
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching doctor prescriptions:', error)
      return []
    }
  }

  /**
   * Verify prescription (public endpoint)
   */
  async verifyPrescription(id: string): Promise<{ valid: boolean; prescription?: Partial<Prescription> }> {
    try {
      const response = await api.get(`/prescriptions/verify/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error verifying prescription:', error)
      return { valid: false }
    }
  }
}

export const prescriptionService = new PrescriptionService()
export default prescriptionService
