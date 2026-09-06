import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  healthRecordsService,
  Vaccination,
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
  Syringe,
  Search,
  Filter,
  Calendar,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Shield,
  Building2,
  User,
  FileText,
  QrCode,
  ExternalLink,
  CalendarDays,
  CalendarClock,
  Info,
  Plus,
  ChevronRight,
} from 'lucide-react'

export default function VaccinationRecords() {
  const { i18n } = useTranslation()
  const isMarathi = i18n.language === 'mr'

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [upcoming, setUpcoming] = useState<Vaccination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccination | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [vaccinationsData, upcomingData] = await Promise.all([
        healthRecordsService.getVaccinations('pat-001'),
        healthRecordsService.getUpcomingVaccinations('pat-001'),
      ])
      setVaccinations(vaccinationsData)
      setUpcoming(upcomingData)
    } catch (error) {
      console.error('Failed to load vaccinations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVaccinations = vaccinations.filter(vac => {
    const matchesSearch =
      searchTerm === '' ||
      vac.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.vaccineNameMr.includes(searchTerm) ||
      vac.disease.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || vac.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const completedVaccinations = filteredVaccinations.filter(v => v.status === 'completed')
  const pendingVaccinations = filteredVaccinations.filter(v => v.status !== 'completed')

  const getStatusBadge = (status: Vaccination['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {isMarathi ? 'पूर्ण' : 'Completed'}
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            <CalendarClock className="w-3 h-3 mr-1" />
            {isMarathi ? 'नियोजित' : 'Scheduled'}
          </Badge>
        )
      case 'due':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            {isMarathi ? 'देय' : 'Due'}
          </Badge>
        )
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {isMarathi ? 'विलंबित' : 'Overdue'}
          </Badge>
        )
      default:
        return null
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

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleViewDetails = (vaccine: Vaccination) => {
    setSelectedVaccine(vaccine)
    setShowDetailDialog(true)
  }

  // Calculate stats
  const stats = {
    total: vaccinations.length,
    completed: vaccinations.filter(v => v.status === 'completed').length,
    upcoming: upcoming.length,
    overdue: vaccinations.filter(v => v.status === 'overdue').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isMarathi ? 'लसीकरण नोंदी लोड होत आहेत...' : 'Loading vaccination records...'}
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
            <Syringe className="w-7 h-7 text-primary" />
            {isMarathi ? 'लसीकरण नोंदी' : 'Vaccination Records'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'संपूर्ण लसीकरण इतिहास आणि आगामी डोस'
              : 'Complete immunization history and upcoming doses'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            {isMarathi ? 'नोंद जोडा' : 'Add Record'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" />
            {isMarathi ? 'प्रमाणपत्र' : 'Certificate'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">
              {isMarathi ? 'एकूण लसी' : 'Total Vaccines'}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium">
              {isMarathi ? 'पूर्ण' : 'Completed'}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">
              {isMarathi ? 'आगामी' : 'Upcoming'}
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-800">{stats.upcoming}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-xs text-red-700 font-medium">
              {isMarathi ? 'विलंबित' : 'Overdue'}
            </span>
          </div>
          <p className="text-2xl font-bold text-red-800">{stats.overdue}</p>
        </Card>
      </div>

      {/* Upcoming Vaccinations Alert */}
      {upcoming.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800">
                {isMarathi ? 'आगामी लसीकरण' : 'Upcoming Vaccinations'}
              </h4>
              <div className="mt-2 space-y-2">
                {upcoming.map(vac => {
                  const daysUntil = getDaysUntil(vac.date)
                  return (
                    <div
                      key={vac.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-amber-200"
                    >
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-amber-900">
                          {isMarathi ? vac.vaccineNameMr : vac.vaccineName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            daysUntil < 0
                              ? 'bg-red-100 text-red-700'
                              : daysUntil <= 7
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {daysUntil < 0
                            ? isMarathi
                              ? `${Math.abs(daysUntil)} दिवस विलंब`
                              : `${Math.abs(daysUntil)} days overdue`
                            : daysUntil === 0
                            ? isMarathi
                              ? 'आज'
                              : 'Today'
                            : isMarathi
                            ? `${daysUntil} दिवसांत`
                            : `In ${daysUntil} days`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          onClick={() => handleViewDetails(vac)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="all" className="gap-1.5">
            <Syringe className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'सर्व' : 'All'}
            </span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {vaccinations.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'पूर्ण' : 'Completed'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isMarathi ? 'बाकी' : 'Pending'}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isMarathi ? 'लस किंवा आजार शोधा...' : 'Search vaccine or disease...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* All Vaccinations Tab */}
        <TabsContent value="all" className="mt-4">
          <VaccinationList
            vaccinations={filteredVaccinations}
            isMarathi={isMarathi}
            onViewDetails={handleViewDetails}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="mt-4">
          <VaccinationList
            vaccinations={completedVaccinations}
            isMarathi={isMarathi}
            onViewDetails={handleViewDetails}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-4">
          <VaccinationList
            vaccinations={pendingVaccinations}
            isMarathi={isMarathi}
            onViewDetails={handleViewDetails}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      {/* Vaccination Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          {selectedVaccine && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(selectedVaccine.status)}
                </div>
                <DialogTitle className="flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-primary" />
                  {isMarathi ? selectedVaccine.vaccineNameMr : selectedVaccine.vaccineName}
                </DialogTitle>
                <DialogDescription>
                  {isMarathi
                    ? `${selectedVaccine.diseaseMr} विरुद्ध लस`
                    : `Vaccine against ${selectedVaccine.disease}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Dose Info */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-sm font-medium">
                    {isMarathi ? 'डोस' : 'Dose'}
                  </span>
                  <Badge className="bg-primary/10 text-primary">
                    {selectedVaccine.doseNumber} / {selectedVaccine.totalDoses}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {isMarathi ? 'तारीख' : 'Date'}
                    </span>
                    <p className="font-medium mt-1">{formatDate(selectedVaccine.date)}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {isMarathi ? 'केंद्र' : 'Facility'}
                    </span>
                    <p className="font-medium mt-1 text-sm">
                      {isMarathi ? selectedVaccine.facilityNameMr : selectedVaccine.facilityName}
                    </p>
                  </div>

                  {selectedVaccine.administeredBy && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {isMarathi ? 'दिलेले' : 'Administered By'}
                      </span>
                      <p className="font-medium mt-1 text-sm">{selectedVaccine.administeredBy}</p>
                    </div>
                  )}

                  {selectedVaccine.manufacturer && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {isMarathi ? 'उत्पादक' : 'Manufacturer'}
                      </span>
                      <p className="font-medium mt-1 text-sm">{selectedVaccine.manufacturer}</p>
                    </div>
                  )}
                </div>

                {/* Batch Number */}
                {selectedVaccine.batchNumber && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground">
                      {isMarathi ? 'बॅच क्रमांक' : 'Batch Number'}
                    </span>
                    <p className="font-mono text-sm mt-1">{selectedVaccine.batchNumber}</p>
                  </div>
                )}

                {/* Next Due Date */}
                {selectedVaccine.nextDueDate && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-xs text-amber-700 flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {isMarathi ? 'पुढील डोस देय तारीख' : 'Next Dose Due'}
                    </span>
                    <p className="font-semibold text-amber-800 mt-1">
                      {formatDate(selectedVaccine.nextDueDate)}
                    </p>
                  </div>
                )}

                {/* Side Effects */}
                {selectedVaccine.sideEffects && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <span className="text-xs text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {isMarathi ? 'नोंदवलेले दुष्परिणाम' : 'Reported Side Effects'}
                    </span>
                    <p className="text-sm text-red-800 mt-1">{selectedVaccine.sideEffects}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedVaccine.certificateUrl && (
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <QrCode className="w-4 h-4" />
                    {isMarathi ? 'QR कोड' : 'QR Code'}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="w-4 h-4" />
                  {isMarathi ? 'प्रमाणपत्र' : 'Certificate'}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Share2 className="w-4 h-4" />
                  {isMarathi ? 'शेअर' : 'Share'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 h-fit">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">
              {isMarathi ? 'लसीकरण माहिती' : 'Vaccination Information'}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {isMarathi
                ? 'सर्व लसीकरण नोंदी CoWIN पोर्टलशी समक्रमित आहेत. आपले लसीकरण प्रमाणपत्र डाउनलोड करण्यासाठी किंवा शेअर करण्यासाठी तपशील पहा बटणावर क्लिक करा.'
                : 'All vaccination records are synced with CoWIN portal. Click on view details to download or share your vaccination certificate.'}
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="gap-1.5 bg-white">
                <ExternalLink className="w-4 h-4" />
                {isMarathi ? 'CoWIN वर जा' : 'Visit CoWIN'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommended Vaccines */}
      <Card className="p-4">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {isMarathi ? 'शिफारस केलेल्या लसी' : 'Recommended Vaccines'}
          </CardTitle>
          <CardDescription>
            {isMarathi
              ? 'आपल्या वयोगटासाठी शिफारस केलेले लसीकरण'
              : 'Recommended immunizations for your age group'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: isMarathi ? 'इन्फ्लुएंझा (फ्लू शॉट)' : 'Influenza (Flu Shot)',
                frequency: isMarathi ? 'वार्षिक' : 'Annually',
                status: 'recommended',
              },
              {
                name: isMarathi ? 'न्यूमोकोकल' : 'Pneumococcal',
                frequency: isMarathi ? 'एकदा (65+ साठी)' : 'Once (65+)',
                status: 'optional',
              },
              {
                name: isMarathi ? 'शिंगल्स (Zoster)' : 'Shingles (Zoster)',
                frequency: isMarathi ? '2 डोस (50+ साठी)' : '2 doses (50+)',
                status: 'optional',
              },
            ].map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{rec.name}</p>
                  <p className="text-xs text-muted-foreground">{rec.frequency}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    rec.status === 'recommended'
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                      : 'border-gray-300'
                  }
                >
                  {rec.status === 'recommended'
                    ? isMarathi
                      ? 'शिफारस'
                      : 'Recommended'
                    : isMarathi
                    ? 'वैकल्पिक'
                    : 'Optional'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Vaccination List Component
interface VaccinationListProps {
  vaccinations: Vaccination[]
  isMarathi: boolean
  onViewDetails: (vaccine: Vaccination) => void
  formatDate: (date: string) => string
  getStatusBadge: (status: Vaccination['status']) => React.ReactNode
}

function VaccinationList({
  vaccinations,
  isMarathi,
  onViewDetails,
  formatDate,
  getStatusBadge,
}: VaccinationListProps) {
  if (vaccinations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Syringe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          {isMarathi ? 'कोणत्याही लसीकरण नोंदी आढळल्या नाहीत' : 'No vaccination records found'}
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AnimatePresence>
        {vaccinations.map((vaccine, index) => (
          <motion.div
            key={vaccine.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewDetails(vaccine)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Syringe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {isMarathi ? vaccine.vaccineNameMr : vaccine.vaccineName}
                    </h3>
                    {getStatusBadge(vaccine.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {isMarathi ? vaccine.diseaseMr : vaccine.disease}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(vaccine.date)}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {isMarathi ? 'डोस' : 'Dose'} {vaccine.doseNumber}/{vaccine.totalDoses}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {isMarathi ? vaccine.facilityNameMr : vaccine.facilityName}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
