import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  healthAlertService,
  type HealthAlert,
  type DiseaseOutbreak,
  type HealthCamp,
  type WeatherHealthAdvisory,
  type AlertSeverity,
} from '@/services/healthAlertService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ExternalLink,
  Shield,
  Activity,
  Thermometer,
  CloudRain,
  Syringe,
  Heart,
  Users,
  Phone,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

const HealthAlerts: React.FC = () => {
  const { t, i18n } = useTranslation()
  
  const [activeTab, setActiveTab] = useState<'alerts' | 'outbreaks' | 'camps'>('alerts')
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [outbreaks, setOutbreaks] = useState<DiseaseOutbreak[]>([])
  const [camps, setCamps] = useState<HealthCamp[]>([])
  const [weatherAdvisory, setWeatherAdvisory] = useState<WeatherHealthAdvisory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null)
  const [selectedOutbreak, setSelectedOutbreak] = useState<DiseaseOutbreak | null>(null)
  const [selectedCamp, setSelectedCamp] = useState<HealthCamp | null>(null)

  const isMarathi = i18n.language === 'mr'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [alertsData, outbreaksData, campsData, weatherData] = await Promise.all([
        healthAlertService.getActiveAlerts(),
        healthAlertService.getOutbreaks(),
        healthAlertService.getHealthCamps(),
        healthAlertService.getWeatherAdvisory(),
      ])
      setAlerts(alertsData)
      setOutbreaks(outbreaksData)
      setCamps(campsData)
      setWeatherAdvisory(weatherData)
    } catch (error) {
      console.error('Error loading health alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'EMERGENCY':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: AlertSeverity) => {
    const variant = healthAlertService.getSeverityVariant(severity)
    const labels: Record<AlertSeverity, { en: string; mr: string }> = {
      EMERGENCY: { en: 'Emergency', mr: 'आणीबाणी' },
      ALERT: { en: 'Alert', mr: 'सतर्कता' },
      WARNING: { en: 'Warning', mr: 'इशारा' },
      INFO: { en: 'Info', mr: 'माहिती' },
    }
    return (
      <Badge variant={variant}>
        {isMarathi ? labels[severity].mr : labels[severity].en}
      </Badge>
    )
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
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
        <div className="flex items-center gap-2 mb-2">
          <Link to="/patient/emergency" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-muted-foreground text-sm">{isMarathi ? 'आणीबाणी' : 'Emergency'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" />
          {isMarathi ? 'आरोग्य सूचना व सतर्कता' : 'Health Alerts & Advisories'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'सरकारी आरोग्य सूचना, रोग प्रादुर्भाव आणि आरोग्य शिबीर माहिती'
            : 'Government health advisories, disease outbreaks, and health camp information'}
        </p>
      </motion.div>

      {/* Weather Advisory Banner */}
      {weatherAdvisory && (
        <motion.div variants={itemVariants}>
          <Card className={`border-2 ${
            weatherAdvisory.severity === 'EMERGENCY' ? 'border-red-500 bg-red-50' :
            weatherAdvisory.severity === 'ALERT' ? 'border-orange-500 bg-orange-50' :
            weatherAdvisory.severity === 'WARNING' ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  weatherAdvisory.severity === 'EMERGENCY' ? 'bg-red-100' :
                  weatherAdvisory.severity === 'ALERT' ? 'bg-orange-100' :
                  weatherAdvisory.severity === 'WARNING' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  <CloudRain className={`w-6 h-6 ${
                    weatherAdvisory.severity === 'EMERGENCY' ? 'text-red-600' :
                    weatherAdvisory.severity === 'ALERT' ? 'text-orange-600' :
                    weatherAdvisory.severity === 'WARNING' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getSeverityBadge(weatherAdvisory.severity)}
                    <Badge variant="outline" className="text-xs">IMD</Badge>
                  </div>
                  <h3 className="font-semibold">
                    {isMarathi ? weatherAdvisory.titleMarathi : weatherAdvisory.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isMarathi ? weatherAdvisory.messageMarathi : weatherAdvisory.message}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {weatherAdvisory.affectedAreas.join(', ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(weatherAdvisory.validFrom)} - {formatDate(weatherAdvisory.validTo)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'सक्रिय सूचना' : 'Active Alerts'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{outbreaks.length}</p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'प्रादुर्भाव' : 'Outbreaks'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{camps.length}</p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'आरोग्य शिबीर' : 'Health Camps'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="alerts" className="flex-1 sm:flex-initial">
              <AlertCircle className="w-4 h-4 mr-1" />
              {isMarathi ? 'सूचना' : 'Alerts'}
              {alerts.length > 0 && (
                <Badge variant="secondary" className="ml-2">{alerts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outbreaks" className="flex-1 sm:flex-initial">
              <Activity className="w-4 h-4 mr-1" />
              {isMarathi ? 'प्रादुर्भाव' : 'Outbreaks'}
            </TabsTrigger>
            <TabsTrigger value="camps" className="flex-1 sm:flex-initial">
              <Syringe className="w-4 h-4 mr-1" />
              {isMarathi ? 'शिबीर' : 'Camps'}
            </TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-4 space-y-4">
            {alerts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {isMarathi ? 'कोणतीही सक्रिय सूचना नाही' : 'No Active Alerts'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isMarathi 
                      ? 'तुमच्या क्षेत्रात सध्या कोणतीही आरोग्य सूचना नाही'
                      : 'There are no health alerts for your area at this time'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedAlert(alert)
                    healthAlertService.markAlertAsRead(alert.id)
                  }}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">
                        {healthAlertService.getCategoryIcon(alert.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline" className="text-xs">
                            {alert.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">
                          {isMarathi ? alert.titleMarathi : alert.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {isMarathi ? alert.messageMarathi : alert.message}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.affectedAreas.slice(0, 3).join(', ')}
                            {alert.affectedAreas.length > 3 && '...'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(alert.issueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {alert.viewCount} views
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Outbreaks Tab */}
          <TabsContent value="outbreaks" className="mt-4 space-y-4">
            {outbreaks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {isMarathi ? 'कोणताही प्रादुर्भाव नाही' : 'No Active Outbreaks'}
                  </h3>
                </CardContent>
              </Card>
            ) : (
              outbreaks.map((outbreak) => (
                <Card
                  key={outbreak.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedOutbreak(outbreak)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(outbreak.severity)}
                        </div>
                        <h3 className="font-semibold text-lg">
                          {isMarathi ? outbreak.diseaseNameMarathi : outbreak.diseaseName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isMarathi ? outbreak.descriptionMarathi : outbreak.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 p-3 rounded-lg bg-muted/50">
                          <div className="text-center">
                            <p className="text-xl font-bold text-red-600">{outbreak.confirmedCases}</p>
                            <p className="text-xs text-muted-foreground">
                              {isMarathi ? 'एकूण' : 'Confirmed'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-orange-600">{outbreak.activeCases}</p>
                            <p className="text-xs text-muted-foreground">
                              {isMarathi ? 'सक्रिय' : 'Active'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-green-600">{outbreak.recoveredCases}</p>
                            <p className="text-xs text-muted-foreground">
                              {isMarathi ? 'बरे' : 'Recovered'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {outbreak.affectedDistricts.join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {formatDate(outbreak.lastUpdated)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Health Camps Tab */}
          <TabsContent value="camps" className="mt-4 space-y-4">
            {camps.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Syringe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {isMarathi ? 'आगामी शिबीर नाही' : 'No Upcoming Camps'}
                  </h3>
                </CardContent>
              </Card>
            ) : (
              camps.map((camp) => (
                <Card
                  key={camp.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCamp(camp)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        camp.type === 'VACCINATION' ? 'bg-blue-100' :
                        camp.type === 'BLOOD_DONATION' ? 'bg-red-100' :
                        camp.type === 'EYE_CHECKUP' ? 'bg-purple-100' :
                        'bg-green-100'
                      }`}>
                        {camp.type === 'VACCINATION' ? <Syringe className="w-6 h-6 text-blue-600" /> :
                         camp.type === 'BLOOD_DONATION' ? <Heart className="w-6 h-6 text-red-600" /> :
                         <Activity className="w-6 h-6 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{camp.type.replace('_', ' ')}</Badge>
                          {camp.isFree && (
                            <Badge className="bg-green-500">{isMarathi ? 'मोफत' : 'FREE'}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">
                          {isMarathi ? camp.nameMarathi : camp.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isMarathi ? camp.descriptionMarathi : camp.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Calendar className="w-4 h-4" />
                            {formatDate(camp.date)}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {camp.time}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {isMarathi ? camp.venueMarathi : camp.venue}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  <Badge variant="outline">
                    {healthAlertService.getCategoryIcon(selectedAlert.category)}{' '}
                    {selectedAlert.category}
                  </Badge>
                </div>
                <DialogTitle>
                  {isMarathi ? selectedAlert.titleMarathi : selectedAlert.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {isMarathi ? selectedAlert.messageMarathi : selectedAlert.message}
                </p>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="font-normal">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedAlert.affectedAreas.join(', ')}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(selectedAlert.issueDate)}
                  </Badge>
                </div>

                {selectedAlert.symptoms && selectedAlert.symptoms.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {isMarathi ? 'लक्षणे' : 'Symptoms to Watch'}
                    </h4>
                    <ul className="space-y-1">
                      {(isMarathi ? selectedAlert.symptomsMarathi : selectedAlert.symptoms)?.map((symptom, idx) => (
                        <li key={idx} className="text-sm text-red-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAlert.precautions && selectedAlert.precautions.length > 0 && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      {isMarathi ? 'प्रतिबंधात्मक उपाय' : 'Preventive Measures'}
                    </h4>
                    <ul className="space-y-1">
                      {(isMarathi ? selectedAlert.precautionsMarathi : selectedAlert.precautions)?.map((precaution, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                          {precaution}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Source: {selectedAlert.source}</span>
                  {selectedAlert.sourceUrl && (
                    <a
                      href={selectedAlert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Outbreak Detail Dialog */}
      <Dialog open={!!selectedOutbreak} onOpenChange={() => setSelectedOutbreak(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedOutbreak && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityBadge(selectedOutbreak.severity)}
                </div>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  {isMarathi ? selectedOutbreak.diseaseNameMarathi : selectedOutbreak.diseaseName}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {isMarathi ? selectedOutbreak.descriptionMarathi : selectedOutbreak.description}
                </p>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-muted">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedOutbreak.confirmedCases}</p>
                    <p className="text-xs text-muted-foreground">{isMarathi ? 'पुष्टी' : 'Confirmed'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedOutbreak.activeCases}</p>
                    <p className="text-xs text-muted-foreground">{isMarathi ? 'सक्रिय' : 'Active'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedOutbreak.recoveredCases}</p>
                    <p className="text-xs text-muted-foreground">{isMarathi ? 'बरे' : 'Recovered'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium text-blue-700 mb-1">
                    {isMarathi ? 'प्रसाराचा मार्ग' : 'Mode of Transmission'}
                  </h4>
                  <p className="text-sm text-blue-600">
                    {isMarathi ? selectedOutbreak.transmissionModeMarathi : selectedOutbreak.transmissionMode}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <h4 className="font-medium text-red-700 mb-2">{isMarathi ? 'लक्षणे' : 'Symptoms'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(isMarathi ? selectedOutbreak.symptomsMarathi : selectedOutbreak.symptoms).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-red-600 border-red-300">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-medium text-green-700 mb-2">
                    {isMarathi ? 'प्रतिबंधात्मक उपाय' : 'Prevention'}
                  </h4>
                  <ul className="space-y-1">
                    {(isMarathi ? selectedOutbreak.preventiveMeasuresMarathi : selectedOutbreak.preventiveMeasures).map((p, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedOutbreak.hotspots && selectedOutbreak.hotspots.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{isMarathi ? 'हॉटस्पॉट्स' : 'Hotspots'}</h4>
                    <div className="space-y-2">
                      {selectedOutbreak.hotspots.map((spot, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted">
                          <span className="text-sm">{spot.location}</span>
                          <Badge variant="destructive">{spot.cases} cases</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {isMarathi ? 'शेवटचे अपडेट:' : 'Last Updated:'} {formatDate(selectedOutbreak.lastUpdated)}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Camp Detail Dialog */}
      <Dialog open={!!selectedCamp} onOpenChange={() => setSelectedCamp(null)}>
        <DialogContent className="max-w-lg">
          {selectedCamp && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedCamp.type.replace('_', ' ')}</Badge>
                  {selectedCamp.isFree && <Badge className="bg-green-500">FREE</Badge>}
                </div>
                <DialogTitle>
                  {isMarathi ? selectedCamp.nameMarathi : selectedCamp.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {isMarathi ? selectedCamp.descriptionMarathi : selectedCamp.description}
                </p>

                <div className="space-y-3 p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{formatDate(selectedCamp.date)}</p>
                      <p className="text-sm text-muted-foreground">{selectedCamp.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{isMarathi ? selectedCamp.venueMarathi : selectedCamp.venue}</p>
                      <p className="text-sm text-muted-foreground">{selectedCamp.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <p className="text-sm">{selectedCamp.organizer}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{isMarathi ? 'उपलब्ध सेवा' : 'Services Available'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(isMarathi ? selectedCamp.servicesMarathi : selectedCamp.services).map((s, i) => (
                      <Badge key={i} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>

                {selectedCamp.contactNumber && (
                  <Button
                    className="w-full"
                    onClick={() => window.location.href = `tel:${selectedCamp.contactNumber}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {isMarathi ? 'संपर्क करा:' : 'Contact:'} {selectedCamp.contactNumber}
                  </Button>
                )}

                {selectedCamp.registrationRequired && selectedCamp.registrationLink && (
                  <a
                    href={selectedCamp.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isMarathi ? 'नोंदणी करा' : 'Register Online'}
                    </Button>
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default HealthAlerts
