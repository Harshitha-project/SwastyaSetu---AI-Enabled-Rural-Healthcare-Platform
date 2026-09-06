import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Printer,
  Share2,
  Calendar,
  User,
  Stethoscope,
  AlertCircle,
  Heart,
  Activity,
  Thermometer,
  Scale,
  Phone,
  MapPin,
  FileText,
  Check,
} from 'lucide-react'
import { prescriptionService, type Prescription } from '@/services/prescriptionService'
import { frequencyOptions, durationOptions } from '@/services/medicineService'

interface PrescriptionViewProps {
  prescription: Prescription
  showActions?: boolean
  compact?: boolean
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescription,
  showActions = true,
  compact = false,
}) => {
  const [qrCode, setQrCode] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const generateQR = async () => {
      if (prescription.qrCode) {
        setQrCode(prescription.qrCode)
      } else {
        const qr = await prescriptionService.generateQRCode(prescription)
        setQrCode(qr)
      }
    }
    generateQR()
  }, [prescription])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const prescriptionWithQR = { ...prescription, qrCode }
      await prescriptionService.downloadPDF(prescriptionWithQR)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = async () => {
    const prescriptionWithQR = { ...prescription, qrCode }
    await prescriptionService.printPrescription(prescriptionWithQR)
  }

  const handleShare = async () => {
    const shareData = {
      title: `Prescription - ${prescription.prescriptionNumber}`,
      text: `Prescription for ${prescription.patientName} by ${prescription.doctorName}`,
      url: `${window.location.origin}/verify-prescription/${prescription.id}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getFrequencyLabel = (value: string) => {
    return frequencyOptions.find(f => f.value === value)?.label || value
  }

  const getDurationLabel = (value: string) => {
    return durationOptions.find(d => d.value === value)?.label || `${value} days`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const isExpired = new Date(prescription.validUntil) < new Date()

  if (compact) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{prescription.prescriptionNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(prescription.createdAt)} • {prescription.doctorName}
              </p>
            </div>
          </div>
          <Badge variant={isExpired ? 'destructive' : 'secondary'}>
            {isExpired ? 'Expired' : 'Valid'}
          </Badge>
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium">{prescription.diagnosis}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {prescription.medications.length} medication(s)
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      {showActions && (
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">Prescription</h2>
                    <Badge variant={isExpired ? 'destructive' : 'default'}>
                      {isExpired ? 'Expired' : 'Valid'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prescription.prescriptionNumber}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Share2 className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Share'}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
                <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
                  <Download className="w-4 h-4 mr-1" />
                  {isDownloading ? 'Generating...' : 'Download PDF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription Content */}
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6">
          {/* Facility Header */}
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold text-primary">
              {prescription.facilityName || 'SwasthyaSetu Healthcare'}
            </h1>
            {prescription.facilityAddress && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {prescription.facilityAddress}
              </p>
            )}
            {prescription.facilityPhone && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Phone className="w-3 h-3" />
                {prescription.facilityPhone}
              </p>
            )}
          </div>

          {/* Doctor & Date */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Stethoscope className="w-4 h-4" />
                {prescription.doctorName}
              </div>
              <p className="text-sm text-muted-foreground">{prescription.doctorQualification}</p>
              <p className="text-sm text-muted-foreground">{prescription.doctorSpecialization}</p>
              <p className="text-xs text-muted-foreground">
                Reg. No: {prescription.doctorRegistrationNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="text-muted-foreground">Date:</span>{' '}
                <span className="font-medium">{formatDate(prescription.createdAt)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Rx No:</span>{' '}
                <span className="font-medium">{prescription.prescriptionNumber}</span>
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Patient Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{prescription.patientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Age/Gender:</span>{' '}
                <span className="font-medium">
                  {prescription.patientAge} yrs / {prescription.patientGender}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{' '}
                <span className="font-medium">{prescription.patientPhone}</span>
              </div>
              {prescription.patientAddress && (
                <div>
                  <span className="text-muted-foreground">Address:</span>{' '}
                  <span className="font-medium">{prescription.patientAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vitals (if available) */}
          {prescription.vitals && Object.keys(prescription.vitals).some(k => prescription.vitals?.[k as keyof typeof prescription.vitals]) && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Vitals:</p>
              <div className="flex flex-wrap gap-3">
                {prescription.vitals.bloodPressure && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-sm">
                    <Heart className="w-3 h-3" />
                    BP: {prescription.vitals.bloodPressure}
                  </div>
                )}
                {prescription.vitals.heartRate && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm">
                    <Activity className="w-3 h-3" />
                    Pulse: {prescription.vitals.heartRate} bpm
                  </div>
                )}
                {prescription.vitals.temperature && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-orange-700 text-sm">
                    <Thermometer className="w-3 h-3" />
                    Temp: {prescription.vitals.temperature}°F
                  </div>
                )}
                {prescription.vitals.weight && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                    <Scale className="w-3 h-3" />
                    Weight: {prescription.vitals.weight} kg
                  </div>
                )}
                {prescription.vitals.spo2 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-teal-50 text-teal-700 text-sm">
                    <Activity className="w-3 h-3" />
                    SpO2: {prescription.vitals.spo2}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diagnosis */}
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground">Diagnosis:</p>
            <p className="font-semibold">{prescription.diagnosis}</p>
          </div>

          {/* Symptoms */}
          {prescription.symptoms && prescription.symptoms.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Chief Complaints:</p>
              <p className="text-sm">{prescription.symptoms.join(', ')}</p>
            </div>
          )}

          {/* Prescription Symbol */}
          <div className="flex items-center gap-2 mb-4 mt-6">
            <span className="text-3xl font-bold text-primary">℞</span>
            <span className="text-lg font-semibold">Medications</span>
          </div>

          {/* Medications Table */}
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Medicine</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Dosage</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Frequency</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications.map((med, index) => (
                  <tr key={med.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="px-3 py-2 text-sm">{index + 1}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-sm">{med.name}</p>
                      {med.genericName && (
                        <p className="text-xs text-muted-foreground italic">
                          ({med.genericName})
                        </p>
                      )}
                      {med.instructions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ⚠️ {med.instructions}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">{med.dosage}</td>
                    <td className="px-3 py-2 text-sm">{getFrequencyLabel(med.frequency)}</td>
                    <td className="px-3 py-2 text-sm">{getDurationLabel(med.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advice */}
          {prescription.advice && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-sm font-medium text-blue-800 mb-1">Advice:</p>
              <p className="text-sm text-blue-700">{prescription.advice}</p>
            </div>
          )}

          {/* Follow-up */}
          {prescription.followUpDate && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Follow-up Date</p>
                <p className="text-sm">{formatDate(prescription.followUpDate)}</p>
              </div>
            </div>
          )}

          {/* Validity & QR */}
          <div className="flex items-end justify-between mt-6 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">
                Valid until: <span className="font-medium">{formatDate(prescription.validUntil)}</span>
              </p>
              {isExpired && (
                <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  This prescription has expired
                </div>
              )}
            </div>
            {qrCode && (
              <div className="text-center">
                <img src={qrCode} alt="QR Code" className="w-20 h-20 mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">Scan to verify</p>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="text-right mt-6">
            <div className="inline-block">
              <div className="border-t-2 border-dashed border-gray-400 w-40 mb-1"></div>
              <p className="text-sm font-semibold">{prescription.doctorName}</p>
              <p className="text-xs text-muted-foreground">(Signature & Stamp)</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>This is a digitally generated prescription from SwasthyaSetu Healthcare Platform.</p>
            <p>For verification, scan the QR code or visit: swasthyasetu.gov.in/verify</p>
            <p className="mt-1">In case of emergency, call 112 or 108</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrescriptionView
