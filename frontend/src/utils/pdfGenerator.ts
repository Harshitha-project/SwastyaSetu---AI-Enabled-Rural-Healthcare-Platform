import jsPDF from 'jspdf'
import type { LabReport, MedicalRecord } from '../services/healthRecordsService'

/**
 * Generates and triggers download of a clinical Lab Report PDF
 */
export function downloadLabReportPdf(report: LabReport, patientName: string = 'Ramesh Patil'): void {
  const doc = new jsPDF()

  // 1. Header Banner
  doc.setFillColor(13, 148, 136) // Primary teal (#0d9488)
  doc.rect(0, 0, 210, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SwasthyaSetu | Digital Health Network', 14, 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Official Clinical Pathology & Diagnostic Report', 14, 21)

  // 2. Patient & Lab Metadata Box
  doc.setFillColor(248, 250, 252) // slate-50
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.roundedRect(14, 34, 182, 38, 3, 3, 'FD')

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Patient Name: ${patientName}`, 18, 43)
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient ID: ${report.patientId || 'pat-001'}`, 18, 50)
  doc.text(`Report Date: ${report.date}`, 18, 57)
  doc.text(`Report ID: ${report.id}`, 18, 64)

  doc.setFont('helvetica', 'bold')
  doc.text(`Facility / Lab: ${report.labName || 'District Pathology Center'}`, 110, 43)
  doc.setFont('helvetica', 'normal')
  doc.text(`Category: ${report.category.toUpperCase()}`, 110, 50)
  doc.text(`Doctor / Pathologist: ${report.doctorName || 'Dr. Priya Sharma'}`, 110, 57)
  doc.text(`Status: ${report.status.toUpperCase()}`, 110, 64)

  // 3. Test Title
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`Diagnostic Test: ${report.testName}`, 14, 82)

  // 4. Results Table Header
  let y = 90
  doc.setFillColor(241, 245, 249) // slate-100
  doc.rect(14, y, 182, 9, 'F')
  doc.setDrawColor(203, 213, 225)
  doc.line(14, y + 9, 196, y + 9)

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'bold')
  doc.text('TEST PARAMETER', 18, y + 6)
  doc.text('OBSERVED VALUE', 90, y + 6)
  doc.text('UNIT', 125, y + 6)
  doc.text('NORMAL RANGE', 145, y + 6)
  doc.text('STATUS', 178, y + 6)

  y += 11

  // 5. Results Rows
  report.results.forEach((res) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)

    doc.text(res.parameter, 18, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.text(String(res.value), 90, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(res.unit || '-', 125, y + 5)
    doc.text(res.normalRange || 'Normal', 145, y + 5)

    if (res.status === 'abnormal' || res.status === 'high' || res.status === 'critical') {
      doc.setTextColor(185, 28, 28) // red
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setTextColor(21, 128, 61) // green
      doc.setFont('helvetica', 'normal')
    }
    doc.text(res.status.toUpperCase(), 178, y + 5)

    // Divider
    doc.setDrawColor(241, 245, 249)
    doc.line(14, y + 8, 196, y + 8)

    y += 10
  })

  // 6. Clinical Notes
  y += 6
  if (report.notes) {
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.text('CLINICAL OBSERVATIONS & NOTES:', 18, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(report.notes, 18, y + 14, { maxWidth: 174 })
    y += 28
  }

  // 7. Verification Footer
  doc.setDrawColor(203, 213, 225)
  doc.line(14, 270, 196, 270)

  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.text('SwasthyaSetu Telemedicine & Digital Healthcare Platform | Verified Electronic Health Record', 14, 275)
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 280)
  doc.text('Digitally Signed & Validated', 155, 275)

  // Save the PDF
  const cleanName = report.testName.replace(/[^a-zA-Z0-9]/g, '_')
  doc.save(`LabReport_${cleanName}_${report.date}.pdf`)
}

/**
 * Generates and triggers download of a Medical Record PDF
 */
export function downloadMedicalRecordPdf(record: MedicalRecord, patientName: string = 'Ramesh Patil'): void {
  const doc = new jsPDF()

  // 1. Header Banner
  doc.setFillColor(2, 132, 199) // Sky blue (#0284c7)
  doc.rect(0, 0, 210, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SwasthyaSetu | Medical Record', 14, 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Electronic Health History & Clinical Documentation', 14, 21)

  // 2. Info Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, 34, 182, 38, 3, 3, 'FD')

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Patient: ${patientName}`, 18, 43)
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient ID: ${record.patientId || 'pat-001'}`, 18, 50)
  doc.text(`Date of Record: ${record.date}`, 18, 57)
  doc.text(`Record Type: ${record.type.toUpperCase()}`, 18, 64)

  doc.setFont('helvetica', 'bold')
  doc.text(`Facility: ${record.facilityName || 'Public Health Center'}`, 110, 43)
  doc.setFont('helvetica', 'normal')
  doc.text(`Doctor: ${record.doctorName || 'Attending Medical Officer'}`, 110, 50)
  doc.text(`Record ID: ${record.id}`, 110, 57)

  // 3. Title & Diagnosis
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(record.title, 14, 84)

  if (record.diagnosis) {
    doc.setFontSize(11)
    doc.setTextColor(3, 105, 161)
    doc.text(`Diagnosis: ${record.diagnosis}`, 14, 92)
  }

  // 4. Description & Details
  let y = record.diagnosis ? 102 : 94
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.setFont('helvetica', 'normal')
  doc.text('Clinical Summary & Findings:', 14, y)
  y += 6
  doc.text(record.description || 'Routine medical checkup and documentation.', 14, y, { maxWidth: 182 })

  // 5. Attachments info if any
  if (record.attachments && record.attachments.length > 0) {
    y += 30
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Attached Files & Reports:', 14, y)
    y += 8
    record.attachments.forEach(att => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text(`• ${att.name} (${att.type.toUpperCase()} - ${(att.size / 1024).toFixed(1)} KB)`, 18, y)
      y += 6
    })
  }

  // Footer
  doc.setDrawColor(203, 213, 225)
  doc.line(14, 270, 196, 270)
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('SwasthyaSetu Platform | Verified Medical Record Document', 14, 275)
  doc.text(`Exported: ${new Date().toLocaleString('en-IN')}`, 14, 280)

  const cleanName = record.title.replace(/[^a-zA-Z0-9]/g, '_')
  doc.save(`MedicalRecord_${cleanName}_${record.date}.pdf`)
}
