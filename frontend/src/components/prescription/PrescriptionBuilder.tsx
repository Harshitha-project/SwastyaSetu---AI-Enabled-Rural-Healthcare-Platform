import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Pill,
  Plus,
  Trash2,
  Search,
  FileText,
  Download,
  Printer,
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  X,
} from 'lucide-react'
import {
  searchMedicines,
  frequencyOptions,
  durationOptions,
  routeOptions,
  type Medicine,
} from '@/services/medicineService'
import {
  prescriptionService,
  type Prescription,
  type PrescriptionMedication,
} from '@/services/prescriptionService'

interface PatientInfo {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  address: string
}

interface DoctorInfo {
  id: string
  name: string
  qualification: string
  specialization: string
  registrationNumber: string
}

interface PrescriptionBuilderProps {
  patient: PatientInfo
  doctor: DoctorInfo
  consultationId?: string
  appointmentId?: string
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    spo2?: number
  }
  onSave?: (prescription: Prescription) => void
  onCancel?: () => void
  facilityName?: string
  facilityAddress?: string
  facilityPhone?: string
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  patient,
  doctor,
  consultationId,
  appointmentId,
  vitals,
  onSave,
  onCancel,
  facilityName = 'SwasthyaSetu Healthcare Center',
  facilityAddress,
  facilityPhone,
}) => {
  // State
  const [diagnosis, setDiagnosis] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState('')
  const [medications, setMedications] = useState<PrescriptionMedication[]>([])
  const [advice, setAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  
  // Medicine search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Medicine[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [showMedicineDialog, setShowMedicineDialog] = useState(false)
  
  // Medicine form
  const [medDosage, setMedDosage] = useState('')
  const [medFrequency, setMedFrequency] = useState('')
  const [medDuration, setMedDuration] = useState('')
  const [medRoute, setMedRoute] = useState('ORAL')
  const [medInstructions, setMedInstructions] = useState('')
  const [medQuantity, setMedQuantity] = useState<number | undefined>()
  
  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [savedPrescription, setSavedPrescription] = useState<Prescription | null>(null)
  const [error, setError] = useState('')

  // Search medicines
  const handleMedicineSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      const results = searchMedicines(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [])

  // Select medicine from search
  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setMedDosage(medicine.commonDosages[0] || '')
    setMedFrequency(medicine.frequency[0] || 'OD')
    setMedRoute(medicine.route || 'ORAL')
    setShowMedicineDialog(true)
    setSearchQuery('')
    setSearchResults([])
  }

  // Add medicine to prescription
  const handleAddMedicine = () => {
    if (!selectedMedicine || !medDosage || !medFrequency || !medDuration) {
      setError('Please fill all required fields')
      return
    }

    const newMed: PrescriptionMedication = {
      id: `med-${Date.now()}`,
      name: selectedMedicine.name,
      genericName: selectedMedicine.genericName,
      dosage: medDosage,
      frequency: medFrequency,
      duration: medDuration,
      route: medRoute,
      instructions: medInstructions,
      quantity: medQuantity,
    }

    setMedications([...medications, newMed])
    resetMedicineForm()
    setShowMedicineDialog(false)
  }

  // Reset medicine form
  const resetMedicineForm = () => {
    setSelectedMedicine(null)
    setMedDosage('')
    setMedFrequency('')
    setMedDuration('')
    setMedRoute('ORAL')
    setMedInstructions('')
    setMedQuantity(undefined)
    setError('')
  }

  // Remove medicine
  const handleRemoveMedicine = (id: string) => {
    setMedications(medications.filter(m => m.id !== id))
  }

  // Add symptom
  const handleAddSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput('')
    }
  }

  // Remove symptom
  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  // Build prescription object
  const buildPrescription = (): Prescription => {
    const prescriptionNumber = prescriptionService.generatePrescriptionNumber()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30) // Valid for 30 days

    return {
      id: `pres-${Date.now()}`,
      prescriptionNumber,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientAddress: patient.address,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorQualification: doctor.qualification,
      doctorSpecialization: doctor.specialization,
      doctorRegistrationNumber: doctor.registrationNumber,
      facilityName,
      facilityAddress,
      facilityPhone,
      consultationId,
      appointmentId,
      diagnosis,
      symptoms,
      medications,
      advice,
      followUpDate: followUpDate || undefined,
      validUntil: validUntil.toISOString(),
      createdAt: new Date().toISOString(),
      vitals,
    }
  }

  // Save prescription
  const handleSave = async () => {
    if (!diagnosis.trim()) {
      setError('Please enter a diagnosis')
      return
    }
    if (medications.length === 0) {
      setError('Please add at least one medication')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const prescription = buildPrescription()
      prescription.qrCode = await prescriptionService.generateQRCode(prescription)
      
      // In production, this would call the API
      // const saved = await prescriptionService.createPrescription(data)
      
      setSavedPrescription(prescription)
      onSave?.(prescription)
    } catch (err) {
      setError('Failed to save prescription. Please try again.')
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Download PDF
  const handleDownloadPDF = async () => {
    const prescription = savedPrescription || buildPrescription()
    setIsGeneratingPDF(true)
    
    try {
      if (!prescription.qrCode) {
        prescription.qrCode = await prescriptionService.generateQRCode(prescription)
      }
      await prescriptionService.downloadPDF(prescription)
    } catch (err) {
      setError('Failed to generate PDF. Please try again.')
      console.error('PDF error:', err)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Print prescription
  const handlePrint = async () => {
    const prescription = savedPrescription || buildPrescription()
    
    try {
      if (!prescription.qrCode) {
        prescription.qrCode = await prescriptionService.generateQRCode(prescription)
      }
      await prescriptionService.printPrescription(prescription)
    } catch (err) {
      setError('Failed to print. Please try again.')
      console.error('Print error:', err)
    }
  }

  const getFrequencyLabel = (value: string) => {
    return frequencyOptions.find(f => f.value === value)?.label || value
  }

  const getDurationLabel = (value: string) => {
    return durationOptions.find(d => d.value === value)?.label || `${value} days`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Digital Prescription</CardTitle>
                <CardDescription className="text-xs">
                  Create prescription for {patient.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={medications.length === 0}
              >
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={medications.length === 0 || isGeneratingPDF}
              >
                <Download className="w-4 h-4 mr-1" />
                {isGeneratingPDF ? 'Generating...' : 'PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Patient & Doctor Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Patient</span>
          </div>
          <p className="font-semibold text-sm">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            {patient.age} yrs, {patient.gender} • {patient.phone}
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Doctor</span>
          </div>
          <p className="font-semibold text-sm">{doctor.name}</p>
          <p className="text-xs text-muted-foreground">
            {doctor.specialization} • Reg: {doctor.registrationNumber}
          </p>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0"
            onClick={() => setError('')}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Diagnosis & Symptoms */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Diagnosis <span className="text-destructive">*</span>
            </label>
            <Input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis (e.g., Acute Upper Respiratory Infection)"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Chief Complaints / Symptoms
            </label>
            <div className="flex gap-2">
              <Input
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="Add symptom"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
              />
              <Button onClick={handleAddSymptom} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {symptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {symptom}
                    <button
                      onClick={() => handleRemoveSymptom(symptom)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Medications
            </CardTitle>
            <Badge variant="outline">{medications.length} added</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Medicine Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleMedicineSearch(e.target.value)}
              placeholder="Search medicine by name..."
              className="pl-9"
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((med) => (
                  <button
                    key={med.id}
                    className="w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between"
                    onClick={() => handleSelectMedicine(med)}
                  >
                    <div>
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.genericName} • {med.dosageForms.join(', ')}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Medications List */}
          <div className="space-y-2">
            {medications.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-muted/50 border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      <p className="font-semibold text-sm">{med.name}</p>
                      {med.genericName && (
                        <span className="text-xs text-muted-foreground">
                          ({med.genericName})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {med.dosage}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getFrequencyLabel(med.frequency)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getDurationLabel(med.duration)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {med.route}
                      </Badge>
                    </div>
                    {med.instructions && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: {med.instructions}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMedicine(med.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {medications.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No medications added yet</p>
                <p className="text-xs">Search and add medicines above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advice & Follow-up */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Advice / Instructions
            </label>
            <Textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Enter any additional advice or instructions for the patient..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Follow-up Date
            </label>
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving || medications.length === 0}
          className="bg-primary"
        >
          {isSaving ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Prescription
            </>
          )}
        </Button>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Add Medicine
            </DialogTitle>
            <DialogDescription>
              Configure dosage and duration for {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedMedicine && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-semibold">{selectedMedicine.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedMedicine.genericName}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedMedicine.dosageForms.map((form) => (
                    <Badge key={form} variant="outline" className="text-xs">
                      {form}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Dosage <span className="text-destructive">*</span>
                  </label>
                  <Select value={medDosage} onValueChange={setMedDosage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosage" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMedicine.strengths.map((strength) => (
                        <SelectItem key={strength} value={strength}>
                          {strength}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Route
                  </label>
                  <Select value={medRoute} onValueChange={setMedRoute}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {routeOptions.map((route) => (
                        <SelectItem key={route.value} value={route.value}>
                          {route.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Frequency <span className="text-destructive">*</span>
                  </label>
                  <Select value={medFrequency} onValueChange={setMedFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Duration <span className="text-destructive">*</span>
                  </label>
                  <Select value={medDuration} onValueChange={setMedDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((dur) => (
                        <SelectItem key={dur.value} value={dur.value}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Special Instructions
                </label>
                <Input
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  placeholder="e.g., Take with food, Avoid dairy"
                />
              </div>

              {/* Side effects warning */}
              {selectedMedicine.sideEffects.length > 0 && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                  <p className="text-xs font-medium text-amber-800 mb-1">
                    Common Side Effects:
                  </p>
                  <p className="text-xs text-amber-700">
                    {selectedMedicine.sideEffects.slice(0, 3).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMedicineDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedicine}>
              <Plus className="w-4 h-4 mr-1" />
              Add to Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {savedPrescription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 p-4 rounded-lg bg-green-50 border border-green-200 shadow-lg max-w-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">Prescription Saved!</p>
              <p className="text-sm text-green-700">
                Rx No: {savedPrescription.prescriptionNumber}
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrint}>
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PrescriptionBuilder
