import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { prescriptionService, type Prescription } from '@/services/prescriptionService'
import { PrescriptionView } from '@/components/prescription/PrescriptionView'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ClipboardList,
  Calendar,
  Pill,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  FileText,
  Stethoscope,
  X,
  Eye,
  QrCode,
  ArrowLeft,
  Bell,
  Building2,
  Filter,
  SortDesc,
  ChevronRight,
  Loader2,
} from 'lucide-react'

// Mock data for demonstration - will be replaced with API calls
const mockPrescriptions: Prescription[] = [
  {
    id: 'rx-001',
    prescriptionNumber: 'RX260815-ABC123',
    patientId: 'patient-001',
    patientName: 'Ramesh Patil',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+91 9876543210',
    patientAddress: 'Satara, Maharashtra',
    doctorId: 'doctor-001',
    doctorName: 'Dr. Rajesh Kulkarni',
    doctorQualification: 'MBBS, MD (Medicine)',
    doctorSpecialization: 'General Medicine',
    doctorRegistrationNumber: 'MCI-2015-84920',
    facilityName: 'SwasthyaSetu Primary Health Center',
    facilityAddress: 'Main Road, Satara, Maharashtra 415001',
    facilityPhone: '+91 2162 234567',
    diagnosis: 'Seasonal Viral Fever with Upper Respiratory Tract Infection',
    symptoms: ['Fever', 'Body ache', 'Sore throat', 'Runny nose'],
    medications: [
      {
        id: 'med-1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        dosage: '500mg',
        frequency: 'three_times',
        duration: '5',
        route: 'Oral',
        instructions: 'Take with food. Avoid if allergic to paracetamol.',
      },
      {
        id: 'med-2',
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine Hydrochloride',
        dosage: '10mg',
        frequency: 'once_daily',
        duration: '5',
        route: 'Oral',
        instructions: 'Take at bedtime. May cause drowsiness.',
      },
      {
        id: 'med-3',
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        dosage: '500mg',
        frequency: 'once_daily',
        duration: '3',
        route: 'Oral',
        instructions: 'Take 1 hour before or 2 hours after meals.',
      },
    ],
    advice: 'Rest well. Drink plenty of warm fluids. Avoid cold foods and drinks. Gargle with warm salt water twice daily.',
    followUpDate: '2026-09-20',
    validUntil: '2026-10-15',
    createdAt: '2026-09-05T10:30:00Z',
    vitals: {
      bloodPressure: '120/80',
      heartRate: 88,
      temperature: 101.2,
      weight: 72,
      spo2: 97,
    },
  },
  {
    id: 'rx-002',
    prescriptionNumber: 'RX260801-DEF456',
    patientId: 'patient-001',
    patientName: 'Ramesh Patil',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+91 9876543210',
    patientAddress: 'Satara, Maharashtra',
    doctorId: 'doctor-002',
    doctorName: 'Dr. Sunita Deshpande',
    doctorQualification: 'MBBS, DM (Cardiology)',
    doctorSpecialization: 'Cardiology',
    doctorRegistrationNumber: 'MCI-2010-65432',
    facilityName: 'District Hospital Satara',
    facilityAddress: 'Civil Lines, Satara, Maharashtra 415001',
    diagnosis: 'Hypertension Stage 1 - Well Controlled',
    symptoms: ['Routine checkup', 'Mild headache occasionally'],
    medications: [
      {
        id: 'med-4',
        name: 'Amlodipine 5mg',
        genericName: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'once_daily',
        duration: '30',
        route: 'Oral',
        instructions: 'Take in the morning. Monitor BP regularly.',
      },
      {
        id: 'med-5',
        name: 'Ecosprin 75mg',
        genericName: 'Aspirin',
        dosage: '75mg',
        frequency: 'once_daily',
        duration: '30',
        route: 'Oral',
        instructions: 'Take after breakfast.',
      },
    ],
    advice: 'Reduce salt intake. Exercise regularly. Monitor blood pressure daily. Avoid stress.',
    followUpDate: '2026-09-01',
    validUntil: '2026-09-01',
    createdAt: '2026-08-01T09:00:00Z',
    vitals: {
      bloodPressure: '138/88',
      heartRate: 76,
      weight: 72,
    },
  },
  {
    id: 'rx-003',
    prescriptionNumber: 'RX260720-GHI789',
    patientId: 'patient-001',
    patientName: 'Ramesh Patil',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+91 9876543210',
    patientAddress: 'Satara, Maharashtra',
    doctorId: 'doctor-003',
    doctorName: 'Dr. Amit Sharma',
    doctorQualification: 'MBBS, MS (Orthopedics)',
    doctorSpecialization: 'Orthopedics',
    doctorRegistrationNumber: 'MCI-2012-78901',
    diagnosis: 'Lower Back Pain - Muscle Strain',
    symptoms: ['Lower back pain', 'Stiffness', 'Difficulty in bending'],
    medications: [
      {
        id: 'med-6',
        name: 'Diclofenac 50mg',
        genericName: 'Diclofenac Sodium',
        dosage: '50mg',
        frequency: 'twice_daily',
        duration: '7',
        route: 'Oral',
        instructions: 'Take after meals. Do not take on empty stomach.',
      },
      {
        id: 'med-7',
        name: 'Thiocolchicoside 4mg',
        genericName: 'Thiocolchicoside',
        dosage: '4mg',
        frequency: 'twice_daily',
        duration: '7',
        route: 'Oral',
        instructions: 'Take after meals. May cause drowsiness.',
      },
    ],
    advice: 'Apply hot fomentation. Avoid heavy lifting. Perform gentle stretching exercises.',
    validUntil: '2026-08-20',
    createdAt: '2026-07-20T14:30:00Z',
    vitals: {
      weight: 73,
    },
  },
]

const STORAGE_KEY = 'swasthyasetu_prescriptions'

// Merge localStorage prescriptions (from doctor) with the rich mock format
function loadFromStorage(): Prescription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const stored = JSON.parse(raw)
    // Get logged-in patient ID for filtering
    let userId = ''
    try {
      const auth = sessionStorage.getItem('swasthyasetu_auth') || localStorage.getItem('swasthyasetu_auth')
      if (auth) userId = JSON.parse(auth).user?.id || ''
    } catch {}
    return stored
      .filter((rx: any) => !userId || rx.patientId === userId || rx.patientId === 'pat-001')
      .map((rx: any): Prescription => ({
      id: rx.id || rx._id,
      prescriptionNumber: rx.prescriptionNumber || `RX-${(rx.id || rx._id || '').slice(-8).toUpperCase()}`,
      patientId: rx.patientId || '',
      patientName: rx.patientName || 'Patient',
      patientAge: rx.patientAge || 0,
      patientGender: rx.patientGender || '',
      patientPhone: rx.patientPhone || '',
      patientAddress: rx.patientAddress || '',
      doctorId: rx.doctorId || '',
      doctorName: rx.doctorName || 'Doctor',
      doctorQualification: rx.doctorQualification || 'MBBS',
      doctorSpecialization: rx.doctorSpecialization || 'General Medicine',
      doctorRegistrationNumber: rx.doctorRegistrationNumber || '',
      facilityName: rx.facilityName || 'SwasthyaSetu Healthcare',
      diagnosis: rx.diagnosis || 'Clinical consultation',
      symptoms: rx.symptoms || [],
      medications: (rx.medications || []).map((m: any, i: number) => ({
        id: m.id || `med-${i}`,
        name: m.name,
        genericName: m.genericName,
        dosage: m.dosage || '',
        frequency: m.frequency || 'once_daily',
        duration: m.duration || '',
        route: m.route || 'Oral',
        instructions: m.instructions,
      })),
      advice: rx.notes || rx.advice,
      followUpDate: rx.followUpDate,
      validUntil: rx.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: rx.createdAt || new Date().toISOString(),
      vitals: rx.vitals,
    }))
  } catch {
    return []
  }
}

const Prescriptions: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const isMarathi = i18n.language === 'mr'

  useEffect(() => {
    loadPrescriptions()

    // Real-time listener: update instantly when doctor issues a prescription
    const handleSync = () => loadPrescriptions()
    window.addEventListener('swasthyasetu:records_sync', handleSync)

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('swasthyasetu_records_bus')
      channel.onmessage = (e) => {
        if (e.data?.type === 'NEW_PRESCRIPTION') loadPrescriptions()
      }
    } catch {}

    return () => {
      window.removeEventListener('swasthyasetu:records_sync', handleSync)
      channel?.close()
    }
  }, [])

  // Check for prescription ID in URL to open view dialog
  useEffect(() => {
    const prescriptionId = searchParams.get('view')
    if (prescriptionId && prescriptions.length > 0) {
      const rx = prescriptions.find(p => p.id === prescriptionId)
      if (rx) {
        setSelectedPrescription(rx)
        setIsViewDialogOpen(true)
      }
    }
  }, [searchParams, prescriptions])

  const loadPrescriptions = async () => {
    setIsLoading(true)
    try {
      // 1. Always load from localStorage first (doctor-issued prescriptions)
      const localRx = loadFromStorage()

      // 2. Try API
      let apiRx: Prescription[] = []
      if (user?.patientId) {
        try {
          apiRx = await prescriptionService.getPatientPrescriptions(user.patientId)
        } catch {}
      }

      // 3. Merge: API first, then localStorage, then mock — deduplicate by id
      const seen = new Set<string>()
      const merged: Prescription[] = []
      for (const rx of [...apiRx, ...localRx, ...mockPrescriptions]) {
        const key = rx.id || rx.prescriptionNumber
        if (!seen.has(key)) { seen.add(key); merged.push(rx) }
      }
      setPrescriptions(merged)
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      setPrescriptions([...loadFromStorage(), ...mockPrescriptions])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setIsViewDialogOpen(true)
    setSearchParams({ view: prescription.id })
  }

  const handleCloseDialog = () => {
    setIsViewDialogOpen(false)
    setSelectedPrescription(null)
    setSearchParams({})
  }

  const handleDownload = async (prescription: Prescription, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setDownloadingId(prescription.id)
    try {
      await prescriptionService.downloadPDF(prescription)
    } finally {
      setDownloadingId(null)
    }
  }

  const isExpired = (rx: Prescription) => new Date(rx.validUntil) < new Date()

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(rx => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Tab filter
    const expired = isExpired(rx)
    if (activeTab === 'active' && expired) return false
    if (activeTab === 'expired' && !expired) return false

    return matchesSearch
  })

  // Sort by date (newest first)
  const sortedPrescriptions = [...filteredPrescriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-primary" />
              {isMarathi ? 'माझी प्रिस्क्रिप्शन्स' : 'My Prescriptions'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isMarathi
                ? 'डॉक्टरांनी दिलेली सर्व डिजिटल प्रिस्क्रिप्शन्स'
                : 'View and manage all your digital prescriptions from healthcare providers'}
            </p>
          </div>

          <Link to="/patient/pharmacies">
            <Button className="gap-2 shrink-0">
              <Building2 className="w-4 h-4" />
              {isMarathi ? 'फार्मसी शोधा' : 'Find Pharmacy'}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isMarathi ? 'निदान, डॉक्टर किंवा औषध शोधा...' : 'Search by diagnosis, doctor, or medicine...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                    {isMarathi ? 'सर्व' : 'All'}
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex-1 sm:flex-initial">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {isMarathi ? 'वैध' : 'Valid'}
                  </TabsTrigger>
                  <TabsTrigger value="expired" className="flex-1 sm:flex-initial">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {isMarathi ? 'कालबाह्य' : 'Expired'}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'एकूण' : 'Total'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {prescriptions.filter(rx => !isExpired(rx)).length}
                  </p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'वैध' : 'Valid'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {prescriptions.filter(rx => isExpired(rx)).length}
                  </p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'कालबाह्य' : 'Expired'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Prescription List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sortedPrescriptions.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? 
                  (isMarathi ? 'कोणतीही प्रिस्क्रिप्शन सापडली नाही' : 'No prescriptions found') :
                  (isMarathi ? 'अजून कोणतीही प्रिस्क्रिप्शन नाही' : 'No prescriptions yet')
                }
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ?
                  (isMarathi ? 'वेगळे शोध शब्द वापरून पहा' : 'Try different search terms') :
                  (isMarathi ? 'तुमची प्रिस्क्रिप्शन्स येथे दिसतील' : 'Your prescriptions will appear here after consultations')
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {sortedPrescriptions.map((rx, index) => {
            const expired = isExpired(rx)
            return (
              <motion.div key={rx.id} variants={itemVariants}>
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    expired ? 'border-amber-200 bg-amber-50/30' : 'hover:border-primary/40'
                  }`}
                  onClick={() => handleViewPrescription(rx)}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Prescription Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          expired ? 'bg-amber-100' : 'bg-primary/10'
                        }`}>
                          <span className={`text-xl font-bold ${expired ? 'text-amber-600' : 'text-primary'}`}>
                            ℞
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-base">{rx.diagnosis}</h3>
                            <Badge variant={expired ? 'outline' : 'default'} className={expired ? 'border-amber-400 text-amber-700' : ''}>
                              {expired ? (isMarathi ? 'कालबाह्य' : 'Expired') : (isMarathi ? 'वैध' : 'Valid')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {rx.doctorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(rx.createdAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {rx.medications.slice(0, 3).map((med, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs font-normal">
                                <Pill className="w-3 h-3 mr-1" />
                                {med.name}
                              </Badge>
                            ))}
                            {rx.medications.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{rx.medications.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDownload(rx, e)}
                          disabled={downloadingId === rx.id}
                        >
                          {downloadingId === rx.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">
                            {isMarathi ? 'डाउनलोड' : 'PDF'}
                          </span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                          <span className="ml-1 hidden sm:inline">
                            {isMarathi ? 'पहा' : 'View'}
                          </span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Follow-up Alert */}
                    {rx.followUpDate && !expired && new Date(rx.followUpDate) > new Date() && (
                      <div className="mt-4 pt-3 border-t flex items-center gap-2 text-sm text-primary">
                        <Bell className="w-4 h-4" />
                        <span>
                          {isMarathi ? 'पुनर्तपासणी तारीख:' : 'Follow-up scheduled:'}{' '}
                          <strong>{formatDate(rx.followUpDate)}</strong>
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* View Prescription Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0 sticky top-0 bg-background z-10 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {isMarathi ? 'प्रिस्क्रिप्शन तपशील' : 'Prescription Details'}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6">
            {selectedPrescription && (
              <PrescriptionView prescription={selectedPrescription} showActions={true} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default Prescriptions
