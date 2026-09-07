import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  healthRecordsService,
  LabReport,
  LabResult,
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
  Download,
  Share2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Beaker,
  Heart,
  Droplets,
  Activity,
  Thermometer,
  Pill,
  ChevronRight,
  ChevronDown,
  BarChart3,
  LineChart,
  ArrowUp,
  ArrowDown,
  Printer,
  ExternalLink,
  Upload,
  Plus,
  FileUp,
  FileCheck,
} from 'lucide-react'
import { downloadLabReportPdf } from '../../utils/pdfGenerator'

export default function LabReports() {
  const { i18n } = useTranslation()
  const isMarathi = i18n.language === 'mr'

  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set())
  const [trendData, setTrendData] = useState<{ date: string; value: number }[]>([])
  const [showTrendDialog, setShowTrendDialog] = useState(false)
  const [selectedParameter, setSelectedParameter] = useState<string>('')

  // Upload report state
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFormData, setUploadFormData] = useState({
    testName: '',
    category: 'blood' as LabReport['category'],
    labName: '',
    date: new Date().toISOString().split('T')[0],
    parameter: '',
    value: '',
    unit: '',
    normalRange: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const reportsData = await healthRecordsService.getLabReports('pat-001')
      setReports(reportsData)
    } catch (error) {
      console.error('Failed to load lab reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      searchTerm === '' ||
      report.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.testNameMr.includes(searchTerm) ||
      report.labName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryIcon = (category: LabReport['category']) => {
    switch (category) {
      case 'blood':
        return <Droplets className="w-4 h-4" />
      case 'urine':
        return <Beaker className="w-4 h-4" />
      case 'cardiac':
        return <Heart className="w-4 h-4" />
      case 'thyroid':
        return <Activity className="w-4 h-4" />
      case 'liver':
      case 'kidney':
        return <Pill className="w-4 h-4" />
      case 'diabetes':
        return <Thermometer className="w-4 h-4" />
      case 'lipid':
        return <BarChart3 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: LabReport['category']) => {
    switch (category) {
      case 'blood':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'urine':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'cardiac':
        return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'thyroid':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'liver':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'kidney':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300'
      case 'diabetes':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'lipid':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getCategoryLabel = (category: LabReport['category']) => {
    const labels: Record<string, { en: string; mr: string }> = {
      blood: { en: 'Blood Test', mr: 'रक्त तपासणी' },
      urine: { en: 'Urine Test', mr: 'लघवी तपासणी' },
      imaging: { en: 'Imaging', mr: 'इमेजिंग' },
      cardiac: { en: 'Cardiac', mr: 'हृदय' },
      thyroid: { en: 'Thyroid', mr: 'थायरॉइड' },
      liver: { en: 'Liver', mr: 'यकृत' },
      kidney: { en: 'Kidney', mr: 'मूत्रपिंड' },
      diabetes: { en: 'Diabetes', mr: 'मधुमेह' },
      lipid: { en: 'Lipid Profile', mr: 'लिपिड प्रोफाइल' },
      other: { en: 'Other', mr: 'इतर' },
    }
    return isMarathi ? labels[category]?.mr : labels[category]?.en
  }

  const getStatusBadge = (status: LabReport['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {isMarathi ? 'पूर्ण' : 'Completed'}
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            {isMarathi ? 'प्रतीक्षेत' : 'Pending'}
          </Badge>
        )
      case 'abnormal':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {isMarathi ? 'असामान्य' : 'Abnormal'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getResultStatusIcon = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case 'low':
        return <ArrowDown className="w-4 h-4 text-blue-600" />
      case 'high':
        return <ArrowUp className="w-4 h-4 text-amber-600" />
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getResultStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800'
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'high':
        return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
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

  const toggleExpanded = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reportId)) {
        newSet.delete(reportId)
      } else {
        newSet.add(reportId)
      }
      return newSet
    })
  }

  const handleViewTrend = async (parameter: string) => {
    setSelectedParameter(parameter)
    const data = await healthRecordsService.getLabTrends('pat-001', parameter)
    setTrendData(data)
    setShowTrendDialog(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadFile(file)
      if (!uploadFormData.testName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        setUploadFormData(prev => ({ ...prev, testName: nameWithoutExt }))
      }
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFormData.testName.trim()) return

    setIsSubmitting(true)
    try {
      const results: LabResult[] = uploadFormData.parameter ? [
        {
          parameter: uploadFormData.parameter,
          parameterMr: uploadFormData.parameter,
          value: uploadFormData.value || 'Normal',
          unit: uploadFormData.unit || '-',
          normalRange: uploadFormData.normalRange || 'Normal',
          status: 'normal',
        }
      ] : [
        {
          parameter: uploadFormData.testName,
          parameterMr: uploadFormData.testName,
          value: 'Report Attached',
          unit: '-',
          normalRange: 'Normal',
          status: 'normal',
        }
      ]

      const newReport = await healthRecordsService.addLabReport({
        patientId: 'pat-001',
        testName: uploadFormData.testName,
        category: uploadFormData.category,
        labName: uploadFormData.labName || 'Local Pathology Lab',
        date: uploadFormData.date,
        results,
        notes: uploadFormData.notes || (uploadFile ? `File attached: ${uploadFile.name}` : 'Manually recorded report'),
      })

      setReports(prev => [newReport, ...prev])
      setShowUploadDialog(false)
      setUploadFile(null)
      setUploadFormData({
        testName: '',
        category: 'blood',
        labName: '',
        date: new Date().toISOString().split('T')[0],
        parameter: '',
        value: '',
        unit: '',
        normalRange: '',
        notes: '',
      })
    } catch (err) {
      console.error('Failed to add lab report:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewDetails = (report: LabReport) => {
    setSelectedReport(report)
    setShowDetailDialog(true)
  }

  // Calculate stats
  const stats = {
    total: reports.length,
    normal: reports.filter(r => r.status === 'completed' && !r.results.some(res => res.status !== 'normal')).length,
    abnormal: reports.filter(r => r.status === 'abnormal').length,
    pending: reports.filter(r => r.status === 'pending').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isMarathi ? 'अहवाल लोड होत आहेत...' : 'Loading lab reports...'}
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
            <Beaker className="w-7 h-7 text-primary" />
            {isMarathi ? 'प्रयोगशाळा अहवाल' : 'Lab Reports'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'सर्व निदान चाचण्या, अहवाल डाउनलोड आणि मॅन्युअल अपलोड'
              : 'Diagnostic tests, instant PDF download & manual PC report uploads'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUploadDialog(true)}
            size="sm"
            className="gap-1.5 bg-primary text-white shadow-sm hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" />
            {isMarathi ? 'संगणकावरून अहवाल जोडा' : 'Add Report from PC'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (reports.length > 0) {
                downloadLabReportPdf(reports[0])
              }
            }}
          >
            <Download className="w-4 h-4 text-primary" />
            {isMarathi ? 'नवीनतम PDF' : 'Download Latest PDF'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">
              {isMarathi ? 'एकूण अहवाल' : 'Total Reports'}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium">
              {isMarathi ? 'सामान्य' : 'Normal'}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-800">{stats.normal}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-xs text-red-700 font-medium">
              {isMarathi ? 'असामान्य' : 'Abnormal'}
            </span>
          </div>
          <p className="text-2xl font-bold text-red-800">{stats.abnormal}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">
              {isMarathi ? 'प्रतीक्षेत' : 'Pending'}
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isMarathi ? 'चाचणी किंवा प्रयोगशाळा शोधा...' : 'Search test or lab...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={isMarathi ? 'श्रेणी' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isMarathi ? 'सर्व श्रेण्या' : 'All Categories'}</SelectItem>
            <SelectItem value="blood">{isMarathi ? 'रक्त तपासणी' : 'Blood Tests'}</SelectItem>
            <SelectItem value="lipid">{isMarathi ? 'लिपिड प्रोफाइल' : 'Lipid Profile'}</SelectItem>
            <SelectItem value="diabetes">{isMarathi ? 'मधुमेह' : 'Diabetes'}</SelectItem>
            <SelectItem value="thyroid">{isMarathi ? 'थायरॉइड' : 'Thyroid'}</SelectItem>
            <SelectItem value="kidney">{isMarathi ? 'मूत्रपिंड' : 'Kidney'}</SelectItem>
            <SelectItem value="liver">{isMarathi ? 'यकृत' : 'Liver'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={isMarathi ? 'स्थिती' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isMarathi ? 'सर्व' : 'All Status'}</SelectItem>
            <SelectItem value="completed">{isMarathi ? 'पूर्ण' : 'Completed'}</SelectItem>
            <SelectItem value="abnormal">{isMarathi ? 'असामान्य' : 'Abnormal'}</SelectItem>
            <SelectItem value="pending">{isMarathi ? 'प्रतीक्षेत' : 'Pending'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <AnimatePresence>
        {filteredReports.length === 0 ? (
          <Card className="p-8 text-center">
            <Beaker className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isMarathi ? 'कोणतेही अहवाल आढळले नाहीत' : 'No lab reports found'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report, index) => {
              const isExpanded = expandedReports.has(report.id)
              const hasAbnormalResults = report.results.some(r => r.status !== 'normal')

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`overflow-hidden ${hasAbnormalResults ? 'border-l-4 border-l-amber-500' : ''}`}>
                    {/* Report Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleExpanded(report.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${getCategoryColor(report.category)}`}>
                            {getCategoryIcon(report.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-foreground">
                                {isMarathi ? report.testNameMr : report.testName}
                              </h3>
                              {getStatusBadge(report.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(report.date)}
                              </span>
                              <span>{isMarathi ? report.labNameMr : report.labName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasAbnormalResults && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
                              {report.results.filter(r => r.status !== 'normal').length}{' '}
                              {isMarathi ? 'असामान्य' : 'abnormal'}
                            </Badge>
                          )}
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Results */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t"
                        >
                          <div className="p-4 bg-muted/20">
                            {/* Results Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                                      {isMarathi ? 'मापदंड' : 'Parameter'}
                                    </th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                      {isMarathi ? 'मूल्य' : 'Value'}
                                    </th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                      {isMarathi ? 'एकक' : 'Unit'}
                                    </th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                      {isMarathi ? 'सामान्य श्रेणी' : 'Normal Range'}
                                    </th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                      {isMarathi ? 'स्थिती' : 'Status'}
                                    </th>
                                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                                      {isMarathi ? 'ट्रेंड' : 'Trend'}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.results.map((result, idx) => (
                                    <tr
                                      key={idx}
                                      className={`border-b last:border-0 ${getResultStatusColor(result.status)}`}
                                    >
                                      <td className="py-2.5 px-3 font-medium">
                                        {isMarathi ? result.parameterMr : result.parameter}
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-semibold">
                                        {result.value}
                                      </td>
                                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                                        {result.unit}
                                      </td>
                                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                                        {result.normalRange}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center justify-center gap-1">
                                          {getResultStatusIcon(result.status)}
                                          <span className="text-xs capitalize">{result.status}</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 px-2"
                                          onClick={e => {
                                            e.stopPropagation()
                                            handleViewTrend(result.parameter)
                                          }}
                                        >
                                          <LineChart className="w-4 h-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Notes */}
                            {report.notes && (
                              <div className="mt-4 p-3 rounded-lg bg-background border">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {isMarathi ? 'टिप्पणी:' : 'Notes:'}
                                </span>
                                <p className="text-sm text-foreground mt-1">
                                  {isMarathi ? report.notesMr : report.notes}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadLabReportPdf(report)
                                }}
                              >
                                <Download className="w-4 h-4 text-primary" />
                                {isMarathi ? 'अहवाल PDF डाउनलोड' : 'Download Report PDF'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.print()
                                }}
                              >
                                <Printer className="w-4 h-4" />
                                {isMarathi ? 'प्रिंट' : 'Print'}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Trend Dialog */}
      <Dialog open={showTrendDialog} onOpenChange={setShowTrendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              {selectedParameter} {isMarathi ? 'ट्रेंड' : 'Trend'}
            </DialogTitle>
            <DialogDescription>
              {isMarathi ? 'मागील मूल्यांचा आलेख' : 'Historical values chart'}
            </DialogDescription>
          </DialogHeader>

          {trendData.length > 0 ? (
            <div className="py-4">
              {/* Simple Bar Chart Visualization */}
              <div className="space-y-3">
                {trendData.map((point, idx) => {
                  const maxValue = Math.max(...trendData.map(d => d.value))
                  const percentage = (point.value / maxValue) * 100

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">
                        {formatDate(point.date)}
                      </span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-end pr-2"
                        >
                          <span className="text-[10px] text-white font-medium">
                            {point.value}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Trend Summary */}
              <div className="mt-6 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isMarathi ? 'ट्रेंड:' : 'Trend:'}
                  </span>
                  {trendData[trendData.length - 1].value > trendData[0].value ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <TrendingUp className="w-4 h-4" />
                      {isMarathi ? 'वाढत आहे' : 'Increasing'}
                    </span>
                  ) : trendData[trendData.length - 1].value < trendData[0].value ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <TrendingDown className="w-4 h-4" />
                      {isMarathi ? 'कमी होत आहे' : 'Decreasing'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Minus className="w-4 h-4" />
                      {isMarathi ? 'स्थिर' : 'Stable'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isMarathi ? 'या मापदंडासाठी ट्रेंड डेटा उपलब्ध नाही' : 'No trend data available for this parameter'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Health Tips Card */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 h-fit">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">
              {isMarathi ? 'आरोग्य टिप्स' : 'Health Tips'}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {isMarathi
                ? 'नियमित तपासणीसाठी दर 6 महिन्यांनी सर्वसमावेशक रक्त चाचणी करणे चांगले आहे. असामान्य परिणामांसाठी आपल्या डॉक्टरांचा सल्ला घ्या.'
                : 'For regular monitoring, it\'s recommended to get a comprehensive blood test every 6 months. Consult your doctor for any abnormal results.'}
            </p>
          </div>
        </div>
      </Card>
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Upload className="w-5 h-5 text-primary" />
              {isMarathi ? 'संगणकावरून लॅब अहवाल जोडा' : 'Upload Lab Report from PC'}
            </DialogTitle>
            <DialogDescription>
              {isMarathi
                ? 'आपल्या संगणकावरून PDF किंवा इमेज फाइल निवडा आणि अहवाल तपशील भरा.'
                : 'Select a PDF or image file from your PC and enter the diagnostic parameters.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
              <input
                type="file"
                id="lab-file-upload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />
              <label htmlFor="lab-file-upload" className="cursor-pointer block">
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
                    <FileCheck className="w-6 h-6 text-emerald-600" />
                    <span>{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-700">
                      {isMarathi ? 'येथे क्लिक करून फाइल निवडा' : 'Click to choose file from PC'}
                    </p>
                    <p className="text-xs text-gray-400">PDF, PNG, JPG (up to 10MB)</p>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'चाचणीचे नाव *' : 'Test Name *'}
                </label>
                <Input
                  required
                  placeholder={isMarathi ? 'उदा. Complete Blood Count' : 'e.g. Complete Blood Count'}
                  value={uploadFormData.testName}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, testName: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'प्रवर्ग' : 'Category'}
                </label>
                <Select
                  value={uploadFormData.category}
                  onValueChange={(val: any) => setUploadFormData(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood">{isMarathi ? 'रक्त चाचणी' : 'Blood Test'}</SelectItem>
                    <SelectItem value="urine">{isMarathi ? 'लघवी चाचणी' : 'Urine Test'}</SelectItem>
                    <SelectItem value="imaging">{isMarathi ? 'इमेजिंग / एक्स-रे' : 'Imaging / X-Ray'}</SelectItem>
                    <SelectItem value="cardiac">{isMarathi ? 'हृदय (कार्डियाक)' : 'Cardiac'}</SelectItem>
                    <SelectItem value="thyroid">{isMarathi ? 'थायरॉइड' : 'Thyroid'}</SelectItem>
                    <SelectItem value="diabetes">{isMarathi ? 'मधुमेह' : 'Diabetes'}</SelectItem>
                    <SelectItem value="other">{isMarathi ? 'इतर' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'लॅब / रुग्णालयाचे नाव' : 'Lab / Diagnostic Center'}
                </label>
                <Input
                  placeholder={isMarathi ? 'उदा. Suburban Diagnostics' : 'e.g. City Pathology Lab'}
                  value={uploadFormData.labName}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, labName: e.target.value }))}
                />
              </div>

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
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'मापदंड (Parameter)' : 'Parameter'}
                </label>
                <Input
                  placeholder="e.g. Hemoglobin"
                  value={uploadFormData.parameter}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, parameter: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'मूल्य (Value)' : 'Value'}
                </label>
                <Input
                  placeholder="e.g. 13.5"
                  value={uploadFormData.value}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  {isMarathi ? 'एकक (Unit)' : 'Unit'}
                </label>
                <Input
                  placeholder="e.g. g/dL"
                  value={uploadFormData.unit}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                {isMarathi ? 'टिप्पणी / शेरा' : 'Clinical Notes / Summary'}
              </label>
              <Input
                placeholder={isMarathi ? 'वैद्यकीय शेरा किंवा संदर्भ' : 'Observations, doctor notes, or findings'}
                value={uploadFormData.notes}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting || !uploadFormData.testName.trim()}>
                {isSubmitting
                  ? (isMarathi ? 'जतन करत आहे...' : 'Saving...')
                  : (isMarathi ? 'अहवाल जतन करा' : 'Save Report')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
