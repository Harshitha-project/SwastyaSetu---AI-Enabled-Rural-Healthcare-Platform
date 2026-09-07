import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  healthRecordsService,
  MedicalRecord,
  Allergy,
  ChronicCondition,
  HealthSummary,
} from '../../services/healthRecordsService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Stethoscope,
  Building2,
  Pill,
  Syringe,
  AlertTriangle,
  Activity,
  Download,
  Share2,
  Eye,
  Clock,
  User,
  MapPin,
  Heart,
  Thermometer,
  Scale,
  Droplets,
  ChevronRight,
  Plus,
  Upload,
  FolderOpen,
  AlertCircle,
  FileUp,
  FileCheck,
  Printer,
} from 'lucide-react'
import { downloadMedicalRecordPdf } from '../../utils/pdfGenerator'

export default function MedicalRecords() {
  const { i18n } = useTranslation()
  const isMarathi = i18n.language === 'mr'

  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [conditions, setConditions] = useState<ChronicCondition[]>([])
  const [summary, setSummary] = useState<HealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Upload Medical Record State
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    type: 'consultation' as MedicalRecord['type'],
    doctorName: '',
    facilityName: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [recordsData, allergiesData, conditionsData, summaryData] = await Promise.all([
        healthRecordsService.getMedicalRecords('pat-001'),
        healthRecordsService.getAllergies('pat-001'),
        healthRecordsService.getChronicConditions('pat-001'),
        healthRecordsService.getHealthSummary('pat-001'),
      ])
      setRecords(recordsData)
      setAllergies(allergiesData)
      setConditions(conditionsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load records:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      searchTerm === '' ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.titleMr.includes(searchTerm) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || record.type === typeFilter

    return matchesSearch && matchesType
  })

  const getRecordTypeIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4" />
      case 'hospitalization':
        return <Building2 className="w-4 h-4" />
      case 'surgery':
        return <Activity className="w-4 h-4" />
      case 'lab_report':
        return <FileText className="w-4 h-4" />
      case 'imaging':
        return <Eye className="w-4 h-4" />
      case 'prescription':
        return <Pill className="w-4 h-4" />
      case 'vaccination':
        return <Syringe className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getRecordTypeColor = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'hospitalization':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'surgery':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'lab_report':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'imaging':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300'
      case 'prescription':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'vaccination':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getRecordTypeLabel = (type: MedicalRecord['type']) => {
    const labels: Record<string, { en: string; mr: string }> = {
      consultation: { en: 'Consultation', mr: 'सल्लामसलत' },
      hospitalization: { en: 'Hospitalization', mr: 'रुग्णालय दाखल' },
      surgery: { en: 'Surgery', mr: 'शस्त्रक्रिया' },
      lab_report: { en: 'Lab Report', mr: 'प्रयोगशाळा अहवाल' },
      imaging: { en: 'Imaging', mr: 'इमेजिंग' },
      prescription: { en: 'Prescription', mr: 'प्रिस्क्रिप्शन' },
      vaccination: { en: 'Vaccination', mr: 'लसीकरण' },
    }
    return isMarathi ? labels[type]?.mr : labels[type]?.en
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-700'
      case 'moderate':
        return 'bg-amber-100 text-amber-700'
      case 'severe':
      case 'life_threatening':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadFile(file)
      if (!uploadFormData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        setUploadFormData(prev => ({ ...prev, title: nameWithoutExt }))
      }
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFormData.title.trim()) return

    setIsSubmitting(true)
    try {
      const attachments = uploadFile ? [
        {
          id: `att-${Date.now()}`,
          name: uploadFile.name,
          type: (uploadFile.type.includes('pdf') ? 'pdf' : (uploadFile.type.includes('image') ? 'image' : 'document')) as any,
          url: URL.createObjectURL(uploadFile),
          size: uploadFile.size,
          uploadedAt: new Date().toISOString(),
        }
      ] : []

      const newRecord = await healthRecordsService.addMedicalRecord({
        patientId: 'pat-001',
        title: uploadFormData.title,
        type: uploadFormData.type,
        doctorName: uploadFormData.doctorName || 'Attending Medical Officer',
        facilityName: uploadFormData.facilityName || 'Primary Health Center',
        date: uploadFormData.date,
        diagnosis: uploadFormData.diagnosis,
        description: uploadFormData.description || (uploadFile ? `Attached document: ${uploadFile.name}` : 'Document uploaded manually from local device'),
        attachments,
      })

      setRecords(prev => [newRecord, ...prev])
      setShowUploadDialog(false)
      setUploadFile(null)
      setUploadFormData({
        title: '',
        type: 'consultation',
        doctorName: '',
        facilityName: '',
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        description: '',
      })
    } catch (err) {
      console.error('Failed to add medical record:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isMarathi ? 'आरोग्य नोंदी लोड होत आहेत...' : 'Loading health records...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-primary" />
            {isMarathi ? 'माझ्या आरोग्य नोंदी' : 'My Health Records'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'संपूर्ण वैद्यकीय इतिहास, अहवाल डाउनलोड आणि संगणकावरून दस्तऐवज जोडा'
              : 'Complete medical history, export PDF reports, and upload records from PC'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUploadDialog(true)}
            size="sm"
            className="gap-1.5 bg-primary text-white shadow-sm hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" />
            {isMarathi ? 'नोंद अपलोड करा' : 'Upload Record from PC'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (records.length > 0) {
                downloadMedicalRecordPdf(records[0])
              }
            }}
          >
            <Download className="w-4 h-4 text-primary" />
            {isMarathi ? 'नवीनतम PDF' : 'Download Latest PDF'}
          </Button>
        </div>
      </div>

      {/* Health Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">
                {isMarathi ? 'रक्तगट' : 'Blood Group'}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{summary.bloodGroup || '--'}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">
                {isMarathi ? 'वजन' : 'Weight'}
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-800">{summary.weight || '--'}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">
                {isMarathi ? 'उंची' : 'Height'}
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{summary.height || '--'}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">BMI</span>
            </div>
            <p className="text-2xl font-bold text-amber-800">{summary.bmi?.toFixed(1) || '--'}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-red-700 font-medium">
                {isMarathi ? 'ऍलर्जी' : 'Allergies'}
              </span>
            </div>
            <p className="text-2xl font-bold text-red-800">{summary.activeAllergies}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-cyan-600" />
              <span className="text-xs text-cyan-700 font-medium">
                {isMarathi ? 'आजार' : 'Conditions'}
              </span>
            </div>
            <p className="text-2xl font-bold text-cyan-800">{summary.chronicConditions}</p>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="timeline" className="gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'टाइमलाइन' : 'Timeline'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="allergies" className="gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'ऍलर्जी' : 'Allergies'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="conditions" className="gap-1.5">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'आजार' : 'Conditions'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'कागदपत्रे' : 'Documents'}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isMarathi ? 'नोंदी शोधा...' : 'Search records...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={isMarathi ? 'सर्व प्रकार' : 'All Types'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isMarathi ? 'सर्व प्रकार' : 'All Types'}</SelectItem>
                <SelectItem value="consultation">{isMarathi ? 'सल्लामसलत' : 'Consultations'}</SelectItem>
                <SelectItem value="hospitalization">{isMarathi ? 'रुग्णालय दाखल' : 'Hospitalizations'}</SelectItem>
                <SelectItem value="surgery">{isMarathi ? 'शस्त्रक्रिया' : 'Surgeries'}</SelectItem>
                <SelectItem value="prescription">{isMarathi ? 'प्रिस्क्रिप्शन' : 'Prescriptions'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <AnimatePresence>
              {filteredRecords.length === 0 ? (
                <Card className="p-8 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {isMarathi ? 'कोणत्याही नोंदी आढळल्या नाहीत' : 'No records found'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-14"
                    >
                      {/* Timeline Dot */}
                      <div
                        className={`absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background ${getRecordTypeColor(record.type)}`}
                      >
                        {getRecordTypeIcon(record.type)}
                      </div>

                      <Card
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewDetails(record)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge className={`text-[10px] ${getRecordTypeColor(record.type)}`}>
                                {getRecordTypeLabel(record.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(record.date)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-foreground">
                              {isMarathi ? record.titleMr : record.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {isMarathi ? record.descriptionMr : record.description}
                            </p>
                            {record.diagnosis && (
                              <p className="text-sm mt-2">
                                <span className="font-medium text-foreground">
                                  {isMarathi ? 'निदान: ' : 'Diagnosis: '}
                                </span>
                                <span className="text-muted-foreground">
                                  {isMarathi ? record.diagnosisMr : record.diagnosis}
                                </span>
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {record.doctorName && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {record.doctorName}
                                </span>
                              )}
                              {record.facilityName && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {isMarathi ? record.facilityNameMr : record.facilityName}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isMarathi ? 'नोंदणीकृत ऍलर्जी' : 'Registered Allergies'}
            </h3>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              {isMarathi ? 'ऍलर्जी जोडा' : 'Add Allergy'}
            </Button>
          </div>

          {allergies.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isMarathi ? 'कोणतीही ऍलर्जी नोंदलेली नाही' : 'No allergies recorded'}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allergies.map(allergy => (
                <Card key={allergy.id} className="p-4 border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {isMarathi ? allergy.allergenMr : allergy.allergen}
                      </h4>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {allergy.type.charAt(0).toUpperCase() + allergy.type.slice(1)}
                      </Badge>
                    </div>
                    <Badge className={`text-[10px] ${getSeverityColor(allergy.severity)}`}>
                      {allergy.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">{isMarathi ? 'प्रतिक्रिया: ' : 'Reaction: '}</span>
                    {isMarathi ? allergy.reactionMr : allergy.reaction}
                  </p>
                  {allergy.diagnosedDate && (
                    <p className="text-xs text-muted-foreground">
                      {isMarathi ? 'निदान तारीख: ' : 'Diagnosed: '}
                      {formatDate(allergy.diagnosedDate)}
                      {allergy.diagnosedBy && ` by ${allergy.diagnosedBy}`}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Allergy Alert Card */}
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">
                  {isMarathi ? 'महत्त्वाची सूचना' : 'Important Notice'}
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {isMarathi
                    ? 'कृपया प्रत्येक डॉक्टरांच्या भेटीच्या वेळी आपल्या ऍलर्जीबद्दल माहिती द्या. आपत्कालीन परिस्थितीत हे जीव वाचवू शकते.'
                    : 'Please inform every doctor about your allergies during visits. This could be life-saving in emergencies.'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Chronic Conditions Tab */}
        <TabsContent value="conditions" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isMarathi ? 'दीर्घकालीन आजार' : 'Chronic Conditions'}
            </h3>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              {isMarathi ? 'आजार जोडा' : 'Add Condition'}
            </Button>
          </div>

          {conditions.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isMarathi ? 'कोणताही दीर्घकालीन आजार नोंदलेला नाही' : 'No chronic conditions recorded'}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {conditions.map(condition => (
                <Card key={condition.id} className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {isMarathi ? condition.conditionMr : condition.condition}
                        </h4>
                        {condition.icdCode && (
                          <Badge variant="outline" className="text-[10px]">
                            ICD: {condition.icdCode}
                          </Badge>
                        )}
                        <Badge
                          className={`text-[10px] ${
                            condition.status === 'managed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : condition.status === 'active'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {condition.status.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {isMarathi ? condition.notesMr : condition.notes}
                      </p>

                      {condition.medications && condition.medications.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-muted-foreground">
                            {isMarathi ? 'सध्याची औषधे: ' : 'Current Medications: '}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {condition.medications.map((med, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px]">
                                <Pill className="w-3 h-3 mr-1" />
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {isMarathi ? 'निदान: ' : 'Diagnosed: '}
                          {formatDate(condition.diagnosedDate)}
                        </span>
                        {condition.diagnosedBy && (
                          <span>{isMarathi ? 'डॉक्टर: ' : 'By: '}{condition.diagnosedBy}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`text-[10px] ${getSeverityColor(condition.severity)}`}>
                        {isMarathi ? 'तीव्रता: ' : 'Severity: '}
                        {condition.severity.toUpperCase()}
                      </Badge>
                      {condition.nextReviewDate && (
                        <div className="text-xs text-muted-foreground text-right">
                          <p className="font-medium">{isMarathi ? 'पुढील पुनरावलोकन' : 'Next Review'}</p>
                          <p>{formatDate(condition.nextReviewDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isMarathi ? 'वैद्यकीय कागदपत्रे' : 'Medical Documents'}
            </h3>
            <Button size="sm" className="gap-1.5">
              <Upload className="w-4 h-4" />
              {isMarathi ? 'अपलोड करा' : 'Upload'}
            </Button>
          </div>

          <Card className="p-8 text-center border-2 border-dashed">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground mb-1">
              {isMarathi ? 'फाइल्स ड्रॅग आणि ड्रॉप करा' : 'Drag and drop files here'}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {isMarathi
                ? 'किंवा ब्राउझ करण्यासाठी क्लिक करा'
                : 'or click to browse'}
            </p>
            <Button variant="outline" size="sm">
              {isMarathi ? 'फाइल्स निवडा' : 'Select Files'}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              {isMarathi
                ? 'PDF, JPG, PNG (जास्तीत जास्त 10MB)'
                : 'PDF, JPG, PNG (max 10MB)'}
            </p>
          </Card>

          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isMarathi
                ? 'येथे अपलोड केलेली कागदपत्रे दिसतील'
                : 'Uploaded documents will appear here'}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRecordTypeColor(selectedRecord.type)}>
                    {getRecordTypeIcon(selectedRecord.type)}
                    <span className="ml-1">{getRecordTypeLabel(selectedRecord.type)}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedRecord.date)}
                  </span>
                </div>
                <DialogTitle>
                  {isMarathi ? selectedRecord.titleMr : selectedRecord.title}
                </DialogTitle>
                <DialogDescription>
                  {isMarathi ? selectedRecord.descriptionMr : selectedRecord.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {selectedRecord.diagnosis && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isMarathi ? 'निदान' : 'Diagnosis'}
                    </span>
                    <p className="text-foreground mt-1">
                      {isMarathi ? selectedRecord.diagnosisMr : selectedRecord.diagnosis}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.doctorName && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {isMarathi ? 'डॉक्टर' : 'Doctor'}
                      </span>
                      <p className="text-foreground mt-1 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedRecord.doctorName}
                      </p>
                    </div>
                  )}
                  {selectedRecord.facilityName && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {isMarathi ? 'रुग्णालय' : 'Facility'}
                      </span>
                      <p className="text-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {isMarathi ? selectedRecord.facilityNameMr : selectedRecord.facilityName}
                      </p>
                    </div>
                  )}
                </div>

                {selectedRecord.metadata && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isMarathi ? 'अतिरिक्त माहिती' : 'Additional Details'}
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      {Object.entries(selectedRecord.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="ml-1 text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                  onClick={() => downloadMedicalRecordPdf(selectedRecord)}
                >
                  <Download className="w-4 h-4 text-primary" />
                  {isMarathi ? 'PDF डाउनलोड' : 'Download PDF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4" />
                  {isMarathi ? 'प्रिंट' : 'Print'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Medical Record Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Upload className="w-5 h-5 text-primary" />
              {isMarathi ? 'संगणकावरून वैद्यकीय नोंद जोडा' : 'Upload Medical Record from PC'}
            </DialogTitle>
            <DialogDescription>
              {isMarathi
                ? 'आपल्या संगणकावरून अहवाल, डिस्चार्ज सारांश किंवा स्कॅन निवडून जतन करा.'
                : 'Upload prescriptions, discharge summaries, hospital records, or scans from your PC.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
              <input
                type="file"
                id="medical-file-upload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />
              <label htmlFor="medical-file-upload" className="cursor-pointer block">
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
                    <FileCheck className="w-6 h-6 text-emerald-600" />
                    <span>{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-700">
                      {isMarathi ? 'येथे क्लिक करून फाइल निवडा' : 'Click to choose document from PC'}
                    </p>
                    <p className="text-xs text-gray-400">PDF, PNG, JPG (up to 10MB)</p>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'दस्तऐवजाचे नाव / शीर्षक *' : 'Document Title *'}
                </label>
                <Input
                  required
                  placeholder={isMarathi ? 'उदा. डिस्चार्ज सारांश' : 'e.g. Discharge Summary 2026'}
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'प्रकार' : 'Record Type'}
                </label>
                <Select
                  value={uploadFormData.type}
                  onValueChange={(val: any) => setUploadFormData(prev => ({ ...prev, type: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">{isMarathi ? 'सल्लामसलत' : 'Consultation'}</SelectItem>
                    <SelectItem value="hospitalization">{isMarathi ? 'रुग्णालय दाखल' : 'Hospitalization'}</SelectItem>
                    <SelectItem value="surgery">{isMarathi ? 'शस्त्रक्रिया' : 'Surgery'}</SelectItem>
                    <SelectItem value="prescription">{isMarathi ? 'प्रिस्क्रिप्शन' : 'Prescription'}</SelectItem>
                    <SelectItem value="imaging">{isMarathi ? 'इमेजिंग / स्कॅन' : 'Imaging / Scan'}</SelectItem>
                    <SelectItem value="lab_report">{isMarathi ? 'लॅब अहवाल' : 'Lab Report'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'डॉक्टरचे नाव' : 'Doctor Name'}
                </label>
                <Input
                  placeholder={isMarathi ? 'उदा. डॉ. शर्मा' : 'e.g. Dr. Priya Sharma'}
                  value={uploadFormData.doctorName}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'रुग्णालय / केंद्र' : 'Hospital / Facility'}
                </label>
                <Input
                  placeholder={isMarathi ? 'उदा. जिल्हा रुग्णालय' : 'e.g. District Hospital'}
                  value={uploadFormData.facilityName}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, facilityName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'तारीख' : 'Date'}
                </label>
                <Input
                  type="date"
                  value={uploadFormData.date}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'निदान (Diagnosis)' : 'Diagnosis (optional)'}
                </label>
                <Input
                  placeholder={isMarathi ? 'उदा. व्हायरल फिव्हर' : 'e.g. Acute Bronchitis'}
                  value={uploadFormData.diagnosis}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                {isMarathi ? 'तपशील / शेरा' : 'Clinical Summary / Notes'}
              </label>
              <Input
                placeholder={isMarathi ? 'महत्त्वाच्या सूचना किंवा संदर्भ' : 'Clinical findings, instructions, or notes'}
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting || !uploadFormData.title.trim()}>
                {isSubmitting
                  ? (isMarathi ? 'जतन करत आहे...' : 'Saving...')
                  : (isMarathi ? 'दस्तऐवज जतन करा' : 'Save Document')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
