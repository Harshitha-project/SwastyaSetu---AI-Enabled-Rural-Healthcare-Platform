import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  emergencyService,
  emergencyTypes,
  emergencyContacts,
  type EmergencyType,
  type EmergencyAlert,
  type GeolocationData,
  type NearbyHospital,
  type EmergencyContact,
} from '@/services/emergencyService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  Phone,
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  Shield,
  Heart,
  AlertCircle,
  PhoneCall,
  Users,
  ChevronRight,
  Bell,
  Locate,
  Send,
  X,
} from 'lucide-react'

const EmergencySOS: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [location, setLocation] = useState<GeolocationData | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([])
  
  const [isSending, setIsSending] = useState(false)
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState('')
  
  const [showContactsDialog, setShowContactsDialog] = useState(false)
  const [familyContacts, setFamilyContacts] = useState<string[]>([])
  const [newContact, setNewContact] = useState('')

  const isMarathi = i18n.language === 'mr'

  // Get location on mount
  useEffect(() => {
    getLocation()
    loadNearbyHospitals()
  }, [])

  const getLocation = async () => {
    setIsLocating(true)
    setLocationError(null)
    try {
      const loc = await emergencyService.getCurrentLocation()
      setLocation(loc)
    } catch (error: any) {
      setLocationError(isMarathi 
        ? 'स्थान मिळवता आले नाही. कृपया GPS सक्षम करा.'
        : 'Could not get location. Please enable GPS.'
      )
    } finally {
      setIsLocating(false)
    }
  }

  const loadNearbyHospitals = async () => {
    const hospitals = await emergencyService.getNearbyHospitals()
    setNearbyHospitals(hospitals)
  }

  const handleSelectEmergencyType = (type: EmergencyType) => {
    setSelectedType(type)
    setShowConfirmDialog(true)
  }

  const handleSendSOS = async () => {
    if (!selectedType || !user) return
    
    setIsSending(true)
    try {
      const alert = await emergencyService.createSOSAlert(
        selectedType,
        user.id,
        {
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone || '',
          age: (user as any).age,
          gender: (user as any).gender,
        },
        additionalInfo,
        familyContacts
      )
      
      setActiveAlert(alert)
      setShowConfirmDialog(false)
      
      // Notify family contacts
      if (familyContacts.length > 0) {
        await emergencyService.notifyEmergencyContacts(
          alert.id,
          familyContacts,
          `EMERGENCY: ${user.firstName} has triggered an SOS alert. Location: ${location?.address || 'Unknown'}. Type: ${selectedType}`
        )
      }
    } catch (error) {
      console.error('Error sending SOS:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleCancelSOS = async () => {
    if (activeAlert) {
      await emergencyService.cancelAlert(activeAlert.id)
      setActiveAlert(null)
      setSelectedType(null)
    }
  }

  const handleCallEmergency = (number: string) => {
    emergencyService.callEmergencyNumber(number)
  }

  const addFamilyContact = () => {
    if (newContact && !familyContacts.includes(newContact)) {
      setFamilyContacts([...familyContacts, newContact])
      setNewContact('')
    }
  }

  const removeFamilyContact = (contact: string) => {
    setFamilyContacts(familyContacts.filter(c => c !== contact))
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

  // Active Alert View
  if (activeAlert) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center p-4"
      >
        <Card className="w-full max-w-md border-2 border-red-500 bg-red-50">
          <CardContent className="pt-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 mx-auto rounded-full bg-red-500 flex items-center justify-center mb-6"
            >
              <Truck className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              {isMarathi ? 'SOS सूचना पाठवली!' : 'SOS Alert Sent!'}
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span>Alert ID: {activeAlert.id.slice(0, 8).toUpperCase()}</span>
              </div>
              
              <Badge variant="destructive" className="text-base">
                {activeAlert.status === 'DISPATCHED' 
                  ? (isMarathi ? 'रुग्णवाहिका पाठवली' : 'Ambulance Dispatched')
                  : (isMarathi ? 'प्रक्रियेत...' : 'Processing...')
                }
              </Badge>
              
              {activeAlert.estimatedArrival && (
                <p className="text-lg font-semibold text-green-700">
                  {isMarathi ? 'अंदाजे वेळ:' : 'ETA:'} {activeAlert.estimatedArrival}
                </p>
              )}
              
              {activeAlert.assignedAmbulance && (
                <p className="text-gray-600">
                  {isMarathi ? 'रुग्णवाहिका:' : 'Ambulance:'} {activeAlert.assignedAmbulance}
                </p>
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-white border">
              <p className="text-sm text-gray-500 mb-2">
                {isMarathi ? 'तुमचे स्थान:' : 'Your Location:'}
              </p>
              <p className="font-medium">{location?.address || 'Getting location...'}</p>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleCallEmergency('108')}
              >
                <Phone className="w-4 h-4 mr-2" />
                {isMarathi ? '१०८ वर कॉल करा' : 'Call 108'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50"
                onClick={handleCancelSOS}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isMarathi ? 'SOS रद्द करा' : 'Cancel SOS'}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              {isMarathi 
                ? 'मदत येत आहे. शांत राहा आणि फोन जवळ ठेवा.'
                : 'Help is on the way. Stay calm and keep your phone nearby.'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Emergency Header */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {isMarathi ? '🆘 आणीबाणी SOS' : '🆘 Emergency SOS'}
                </h1>
                <p className="text-red-100 text-sm mt-1">
                  {isMarathi
                    ? 'आणीबाणी प्रकार निवडा आणि तात्काळ मदत मिळवा'
                    : 'Select emergency type to get immediate help'}
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-red-600 hover:bg-red-50"
                onClick={() => handleCallEmergency('112')}
              >
                <Phone className="w-5 h-5 mr-2" />
                112
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Emergency Calls */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { number: '112', label: isMarathi ? 'आणीबाणी' : 'Emergency', color: 'bg-red-500' },
            { number: '108', label: isMarathi ? 'रुग्णवाहिका' : 'Ambulance', color: 'bg-green-500' },
            { number: '100', label: isMarathi ? 'पोलीस' : 'Police', color: 'bg-blue-500' },
          ].map((item) => (
            <Button
              key={item.number}
              className={`${item.color} hover:opacity-90 h-auto py-4 flex flex-col gap-1`}
              onClick={() => handleCallEmergency(item.number)}
            >
              <PhoneCall className="w-6 h-6" />
              <span className="text-lg font-bold">{item.number}</span>
              <span className="text-xs opacity-90">{item.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Location Status */}
      <motion.div variants={itemVariants}>
        <Card className={location ? 'border-green-200 bg-green-50' : locationError ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isLocating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : location ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {isLocating 
                      ? (isMarathi ? 'स्थान शोधत आहे...' : 'Getting your location...')
                      : location 
                        ? (isMarathi ? 'स्थान मिळाले' : 'Location found')
                        : (isMarathi ? 'स्थान मिळाले नाही' : 'Location not available')
                    }
                  </p>
                  {location && (
                    <p className="text-xs text-muted-foreground">
                      {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                    </p>
                  )}
                  {locationError && (
                    <p className="text-xs text-red-600">{locationError}</p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={getLocation} disabled={isLocating}>
                <Locate className="w-4 h-4 mr-1" />
                {isMarathi ? 'रिफ्रेश' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Types */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          {isMarathi ? 'आणीबाणी प्रकार निवडा' : 'Select Emergency Type'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {emergencyTypes.map((emergency) => (
            <Card
              key={emergency.type}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-red-300 ${
                emergency.severity === 'CRITICAL' ? 'border-red-200' : ''
              }`}
              onClick={() => handleSelectEmergencyType(emergency.type)}
            >
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">{emergency.icon}</span>
                <p className="font-medium text-sm">
                  {isMarathi ? emergency.labelMarathi : emergency.label}
                </p>
                {emergency.severity === 'CRITICAL' && (
                  <Badge variant="destructive" className="mt-2 text-[10px]">
                    {isMarathi ? 'गंभीर' : 'CRITICAL'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Family Contacts */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {isMarathi ? 'कुटुंब संपर्क' : 'Family Emergency Contacts'}
            </CardTitle>
            <CardDescription>
              {isMarathi 
                ? 'SOS पाठवल्यावर या नंबरांना सूचित केले जाईल'
                : 'These contacts will be notified when you send SOS'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder={isMarathi ? 'फोन नंबर जोडा' : 'Add phone number'}
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                type="tel"
              />
              <Button onClick={addFamilyContact} disabled={!newContact}>
                {isMarathi ? 'जोडा' : 'Add'}
              </Button>
            </div>
            {familyContacts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {familyContacts.map((contact) => (
                  <Badge key={contact} variant="secondary" className="py-1 px-2">
                    {contact}
                    <button
                      onClick={() => removeFamilyContact(contact)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isMarathi 
                  ? 'कोणतेही कुटुंब संपर्क जोडलेले नाहीत'
                  : 'No family contacts added yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Nearby Hospitals */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {isMarathi ? 'जवळची रुग्णालये' : 'Nearby Hospitals'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyHospitals.slice(0, 3).map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{hospital.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {hospital.distance} km
                        {hospital.has24x7Emergency && (
                          <Badge variant="secondary" className="text-[10px]">24x7</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(emergencyService.getDirectionsUrl(hospital), '_blank')}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCallEmergency(hospital.emergencyPhone || hospital.phone)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/patient/facilities">
              <Button variant="ghost" className="w-full mt-3">
                {isMarathi ? 'सर्व रुग्णालये पहा' : 'View All Hospitals'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              {isMarathi ? 'आणीबाणी क्रमांक' : 'Emergency Helplines'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {emergencyContacts.slice(0, 6).map((contact) => (
                <Button
                  key={contact.id}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => handleCallEmergency(contact.number)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">
                      {contact.number.slice(0, 3)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">
                        {isMarathi ? contact.nameMarathi : contact.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contact.number}
                        {contact.tollFree && ' • Toll Free'}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setShowContactsDialog(true)}
            >
              {isMarathi ? 'सर्व आणीबाणी क्रमांक' : 'View All Emergency Numbers'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Alerts Link */}
      <motion.div variants={itemVariants}>
        <Link to="/patient/health-alerts">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {isMarathi ? 'आरोग्य सूचना व सतर्कता' : 'Health Alerts & Advisories'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isMarathi 
                        ? 'रोग प्रादुर्भाव, सरकारी योजना, आरोग्य शिबीर'
                        : 'Disease outbreaks, government schemes, health camps'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* SOS Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              {isMarathi ? 'SOS सूचना पाठवा?' : 'Send SOS Alert?'}
            </DialogTitle>
            <DialogDescription>
              {selectedType && (
                <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="font-medium text-red-700">
                    {emergencyTypes.find(e => e.type === selectedType)?.icon}{' '}
                    {isMarathi 
                      ? emergencyTypes.find(e => e.type === selectedType)?.labelMarathi
                      : emergencyTypes.find(e => e.type === selectedType)?.label
                    }
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isMarathi ? 'अतिरिक्त माहिती (पर्यायी)' : 'Additional Information (Optional)'}
              </label>
              <Input
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder={isMarathi ? 'लक्षणे किंवा परिस्थिती वर्णन करा' : 'Describe symptoms or situation'}
              />
            </div>

            {location && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {isMarathi ? 'तुमचे स्थान शेअर केले जाईल' : 'Your location will be shared'}
                </p>
                <p className="text-xs text-green-600 mt-1">{location.address}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {isMarathi 
                ? 'हे SOS जवळच्या रुग्णवाहिका आणि रुग्णालयाला पाठवले जाईल. खोटी सूचना पाठवणे गैर आहे.'
                : 'This SOS will be sent to nearby ambulance and hospital services. Sending false alerts is punishable.'}
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSendSOS}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isMarathi ? 'SOS पाठवा' : 'Send SOS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Emergency Contacts Dialog */}
      <Dialog open={showContactsDialog} onOpenChange={setShowContactsDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              {isMarathi ? 'सर्व आणीबाणी क्रमांक' : 'All Emergency Numbers'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <Button
                key={contact.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  handleCallEmergency(contact.number)
                  setShowContactsDialog(false)
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">
                      {isMarathi ? contact.nameMarathi : contact.name}
                    </p>
                    <p className="text-sm text-primary font-bold">{contact.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {isMarathi ? contact.descriptionMarathi : contact.description}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {contact.available24x7 && (
                        <Badge variant="secondary" className="text-[10px]">24x7</Badge>
                      )}
                      {contact.tollFree && (
                        <Badge variant="outline" className="text-[10px]">Toll Free</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default EmergencySOS
