import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Search,
  CheckCircle2,
  Navigation,
  Pill,
  ShoppingBag,
  Star,
  ExternalLink,
  ArrowLeft,
  Store,
  Truck,
  Shield,
  CreditCard,
  Package,
  Filter,
  Map,
  List,
  Heart,
  AlertCircle,
} from 'lucide-react'

// Pharmacy interface
interface Pharmacy {
  id: string
  name: string
  type: 'RETAIL' | 'HOSPITAL_ATTACHED' | 'JAN_AUSHADHI' | 'GENERIC' | 'CHAIN'
  address: {
    street: string
    village: string
    taluka: string
    district: string
    state: string
    pincode: string
  }
  phone: string
  whatsapp?: string
  email?: string
  location?: {
    latitude: number
    longitude: number
  }
  operatingHours: {
    open: string
    close: string
    is24x7: boolean
  }
  services: string[]
  acceptsDigitalPrescription: boolean
  hasHomeDelivery: boolean
  hasOnlinePayment: boolean
  rating: number
  totalRatings: number
  distance?: number // km from user
  isOpen?: boolean
}

// Mock pharmacy data for Maharashtra
const mockPharmacies: Pharmacy[] = [
  {
    id: 'ph-001',
    name: 'Jan Aushadhi Kendra - Satara',
    type: 'JAN_AUSHADHI',
    address: {
      street: 'Near Civil Hospital',
      village: 'Satara City',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
    },
    phone: '+91 2162 234567',
    whatsapp: '+91 9876543210',
    location: { latitude: 17.6805, longitude: 74.0183 },
    operatingHours: { open: '08:00', close: '21:00', is24x7: false },
    services: ['Generic Medicines', 'OTC Medicines', 'Surgical Items', 'Baby Products'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: true,
    hasOnlinePayment: true,
    rating: 4.5,
    totalRatings: 324,
    distance: 0.5,
    isOpen: true,
  },
  {
    id: 'ph-002',
    name: 'Apollo Pharmacy - Main Road',
    type: 'CHAIN',
    address: {
      street: 'Main Road, Mangalwar Peth',
      village: 'Satara City',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
    },
    phone: '+91 2162 245678',
    whatsapp: '+91 9876543211',
    location: { latitude: 17.6820, longitude: 74.0195 },
    operatingHours: { open: '00:00', close: '00:00', is24x7: true },
    services: ['All Medicines', 'Health Products', 'Diagnostics', 'Wellness Products', 'Digital Prescription'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: true,
    hasOnlinePayment: true,
    rating: 4.3,
    totalRatings: 567,
    distance: 1.2,
    isOpen: true,
  },
  {
    id: 'ph-003',
    name: 'Dhanwantari Medical Store',
    type: 'RETAIL',
    address: {
      street: 'Shaniwar Peth',
      village: 'Satara City',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415002',
    },
    phone: '+91 2162 256789',
    location: { latitude: 17.6790, longitude: 74.0210 },
    operatingHours: { open: '09:00', close: '22:00', is24x7: false },
    services: ['Prescription Medicines', 'OTC Medicines', 'Ayurvedic Products'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: false,
    hasOnlinePayment: true,
    rating: 4.6,
    totalRatings: 189,
    distance: 1.8,
    isOpen: true,
  },
  {
    id: 'ph-004',
    name: 'PHC Pharmacy - Phaltan',
    type: 'HOSPITAL_ATTACHED',
    address: {
      street: 'PHC Complex',
      village: 'Phaltan',
      taluka: 'Phaltan',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415523',
    },
    phone: '+91 2166 222333',
    operatingHours: { open: '08:00', close: '16:00', is24x7: false },
    services: ['Essential Medicines', 'Free Medicines under NHM', 'Immunization'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: false,
    hasOnlinePayment: false,
    rating: 4.0,
    totalRatings: 87,
    distance: 15.5,
    isOpen: false,
  },
  {
    id: 'ph-005',
    name: 'Generic Plus Pharmacy',
    type: 'GENERIC',
    address: {
      street: 'Bus Stand Road',
      village: 'Satara City',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
    },
    phone: '+91 2162 267890',
    whatsapp: '+91 9876543212',
    location: { latitude: 17.6815, longitude: 74.0175 },
    operatingHours: { open: '08:30', close: '21:30', is24x7: false },
    services: ['Generic Medicines', 'Affordable Prices', 'OTC Products'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: true,
    hasOnlinePayment: true,
    rating: 4.4,
    totalRatings: 256,
    distance: 0.8,
    isOpen: true,
  },
  {
    id: 'ph-006',
    name: 'MedPlus - Satara Station',
    type: 'CHAIN',
    address: {
      street: 'Railway Station Road',
      village: 'Satara City',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415003',
    },
    phone: '+91 2162 278901',
    operatingHours: { open: '07:00', close: '23:00', is24x7: false },
    services: ['All Medicines', 'Healthcare Products', 'Personal Care', 'Baby Care'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: true,
    hasOnlinePayment: true,
    rating: 4.2,
    totalRatings: 412,
    distance: 2.3,
    isOpen: true,
  },
  {
    id: 'ph-007',
    name: 'District Hospital Pharmacy',
    type: 'HOSPITAL_ATTACHED',
    address: {
      street: 'Civil Lines',
      village: 'Satara City',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
    },
    phone: '+91 2162 234000',
    operatingHours: { open: '00:00', close: '00:00', is24x7: true },
    services: ['Emergency Medicines', 'All Prescriptions', 'Free Medicines for BPL'],
    acceptsDigitalPrescription: true,
    hasHomeDelivery: false,
    hasOnlinePayment: false,
    rating: 3.9,
    totalRatings: 678,
    distance: 1.0,
    isOpen: true,
  },
  {
    id: 'ph-008',
    name: 'Shree Swami Samarth Medical',
    type: 'RETAIL',
    address: {
      street: 'Karad Road',
      village: 'Vaduj',
      taluka: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415506',
    },
    phone: '+91 2162 289012',
    operatingHours: { open: '09:00', close: '20:00', is24x7: false },
    services: ['Prescription Medicines', 'OTC Medicines', 'Ayurvedic'],
    acceptsDigitalPrescription: false,
    hasHomeDelivery: false,
    hasOnlinePayment: false,
    rating: 4.1,
    totalRatings: 45,
    distance: 8.5,
    isOpen: false,
  },
]

const PharmacyLocator: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(mockPharmacies)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const isMarathi = i18n.language === 'mr'

  // Check if pharmacy is currently open
  const isPharmacyOpen = (pharmacy: Pharmacy): boolean => {
    if (pharmacy.operatingHours.is24x7) return true
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [openHour, openMin] = pharmacy.operatingHours.open.split(':').map(Number)
    const [closeHour, closeMin] = pharmacy.operatingHours.close.split(':').map(Number)
    
    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin
    
    return currentTime >= openTime && currentTime <= closeTime
  }

  // Filter and sort pharmacies
  const filteredPharmacies = useMemo(() => {
    let result = pharmacies.filter(ph => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        ph.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ph.address.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ph.address.taluka.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ph.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))

      // Type filter
      const matchesType = selectedType === 'all' || ph.type === selectedType

      // Special filters
      let matchesFilter = true
      if (selectedFilter === 'open') {
        matchesFilter = isPharmacyOpen(ph)
      } else if (selectedFilter === 'digital') {
        matchesFilter = ph.acceptsDigitalPrescription
      } else if (selectedFilter === 'delivery') {
        matchesFilter = ph.hasHomeDelivery
      } else if (selectedFilter === '24x7') {
        matchesFilter = ph.operatingHours.is24x7
      }

      return matchesSearch && matchesType && matchesFilter
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance || 999) - (b.distance || 999)
      } else {
        return b.rating - a.rating
      }
    })

    return result
  }, [pharmacies, searchQuery, selectedType, selectedFilter, sortBy])

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; mr: string; color: string }> = {
      JAN_AUSHADHI: { en: 'Jan Aushadhi', mr: 'जन औषधी', color: 'bg-green-100 text-green-700 border-green-300' },
      GENERIC: { en: 'Generic', mr: 'जेनेरिक', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      CHAIN: { en: 'Chain Store', mr: 'चेन स्टोअर', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      HOSPITAL_ATTACHED: { en: 'Hospital', mr: 'रुग्णालय', color: 'bg-red-100 text-red-700 border-red-300' },
      RETAIL: { en: 'Retail', mr: 'रिटेल', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    }
    const label = labels[type] || labels.RETAIL
    return { text: isMarathi ? label.mr : label.en, color: label.color }
  }

  const openGoogleMaps = (pharmacy: Pharmacy) => {
    const query = encodeURIComponent(`${pharmacy.name}, ${pharmacy.address.village}, ${pharmacy.address.district}`)
    const url = pharmacy.location
      ? `https://www.google.com/maps/search/?api=1&query=${pharmacy.location.latitude},${pharmacy.location.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(url, '_blank')
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
            <Link to="/patient/prescriptions" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isMarathi ? 'प्रिस्क्रिप्शनकडे परत' : 'Back to Prescriptions'}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Store className="w-7 h-7 text-primary" />
              {isMarathi ? 'फार्मसी शोधा' : 'Find Pharmacy'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isMarathi
                ? 'जवळच्या फार्मसी, जन औषधी केंद्र आणि जेनेरिक मेडिकल स्टोअर शोधा'
                : 'Locate nearby pharmacies, Jan Aushadhi Kendras, and generic medicine stores'}
            </p>
          </div>

          <Link to="/patient/prescriptions">
            <Button variant="outline" className="gap-2 shrink-0">
              <Pill className="w-4 h-4" />
              {isMarathi ? 'माझी प्रिस्क्रिप्शन्स' : 'My Prescriptions'}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pharmacies.length}</p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'एकूण फार्मसी' : 'Total Pharmacies'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pharmacies.filter(p => isPharmacyOpen(p)).length}
                  </p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'सध्या सुरू' : 'Open Now'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pharmacies.filter(p => p.type === 'JAN_AUSHADHI').length}
                  </p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'जन औषधी' : 'Jan Aushadhi'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pharmacies.filter(p => p.hasHomeDelivery).length}
                  </p>
                  <p className="text-xs text-muted-foreground">{isMarathi ? 'होम डिलिव्हरी' : 'Home Delivery'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isMarathi ? 'फार्मसी नाव, गाव किंवा सेवा शोधा...' : 'Search pharmacy name, village, or service...'}
                  className="pl-9"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2">
                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="h-9 text-xs px-3 rounded-md border border-input bg-background"
                >
                  <option value="all">{isMarathi ? 'सर्व प्रकार' : 'All Types'}</option>
                  <option value="JAN_AUSHADHI">{isMarathi ? 'जन औषधी केंद्र' : 'Jan Aushadhi Kendra'}</option>
                  <option value="GENERIC">{isMarathi ? 'जेनेरिक फार्मसी' : 'Generic Pharmacy'}</option>
                  <option value="CHAIN">{isMarathi ? 'चेन स्टोअर' : 'Chain Store'}</option>
                  <option value="HOSPITAL_ATTACHED">{isMarathi ? 'रुग्णालय फार्मसी' : 'Hospital Pharmacy'}</option>
                  <option value="RETAIL">{isMarathi ? 'रिटेल' : 'Retail'}</option>
                </select>

                {/* Quick Filters */}
                <div className="flex gap-1 flex-wrap">
                  {[
                    { value: 'all', label: isMarathi ? 'सर्व' : 'All', icon: Filter },
                    { value: 'open', label: isMarathi ? 'सुरू आहे' : 'Open Now', icon: Clock },
                    { value: 'digital', label: isMarathi ? 'डिजिटल Rx' : 'Digital Rx', icon: Pill },
                    { value: 'delivery', label: isMarathi ? 'डिलिव्हरी' : 'Delivery', icon: Truck },
                    { value: '24x7', label: '24x7', icon: Clock },
                  ].map(filter => (
                    <Button
                      key={filter.value}
                      variant={selectedFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setSelectedFilter(filter.value)}
                    >
                      <filter.icon className="w-3 h-3 mr-1" />
                      {filter.label}
                    </Button>
                  ))}
                </div>

                {/* Sort */}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{isMarathi ? 'क्रमवारी:' : 'Sort:'}</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="h-8 text-xs px-2 rounded-md border border-input bg-background"
                  >
                    <option value="distance">{isMarathi ? 'अंतर' : 'Distance'}</option>
                    <option value="rating">{isMarathi ? 'रेटिंग' : 'Rating'}</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Jan Aushadhi Banner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">
                  {isMarathi ? 'जन औषधी केंद्र - ५०-९०% स्वस्त औषधे' : 'Jan Aushadhi Kendra - 50-90% Cheaper Medicines'}
                </h3>
                <p className="text-sm text-green-700">
                  {isMarathi
                    ? 'भारत सरकारची योजना - दर्जेदार जेनेरिक औषधे अत्यंत कमी किमतीत उपलब्ध'
                    : 'Government of India initiative - Quality generic medicines at highly affordable prices'}
                </p>
              </div>
              <a
                href="http://janaushadhi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {isMarathi ? 'अधिक माहिती' : 'Learn More'}
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Count */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isMarathi
            ? `${filteredPharmacies.length} फार्मसी सापडल्या`
            : `Found ${filteredPharmacies.length} pharmacies`}
        </p>
      </motion.div>

      {/* Pharmacy List */}
      {filteredPharmacies.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {isMarathi ? 'कोणतीही फार्मसी सापडली नाही' : 'No pharmacies found'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isMarathi ? 'फिल्टर बदलून पुन्हा प्रयत्न करा' : 'Try adjusting your filters or search query'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-4">
          {filteredPharmacies.map((pharmacy) => {
            const isOpen = isPharmacyOpen(pharmacy)
            const typeInfo = getTypeLabel(pharmacy.type)

            return (
              <motion.div key={pharmacy.id} variants={itemVariants}>
                <Card className={`transition-all hover:shadow-md ${!isOpen ? 'opacity-75' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Pharmacy Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          pharmacy.type === 'JAN_AUSHADHI' ? 'bg-green-100' : 'bg-primary/10'
                        }`}>
                          <Store className={`w-6 h-6 ${
                            pharmacy.type === 'JAN_AUSHADHI' ? 'text-green-600' : 'text-primary'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className={`text-[10px] ${typeInfo.color}`}>
                              {typeInfo.text}
                            </Badge>
                            {pharmacy.operatingHours.is24x7 && (
                              <Badge className="bg-emerald-500 text-white text-[10px]">24x7</Badge>
                            )}
                            <Badge variant={isOpen ? 'default' : 'secondary'} className="text-[10px]">
                              {isOpen ? (isMarathi ? 'सुरू' : 'Open') : (isMarathi ? 'बंद' : 'Closed')}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-base">{pharmacy.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {pharmacy.address.street}, {pharmacy.address.village}, {pharmacy.address.taluka}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              {pharmacy.phone}
                            </span>
                            {!pharmacy.operatingHours.is24x7 && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {pharmacy.operatingHours.open} - {pharmacy.operatingHours.close}
                              </span>
                            )}
                            {pharmacy.distance && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Navigation className="w-3.5 h-3.5" />
                                {pharmacy.distance} km
                              </span>
                            )}
                          </div>

                          {/* Services & Features */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {pharmacy.acceptsDigitalPrescription && (
                              <Badge variant="secondary" className="text-xs">
                                <Pill className="w-3 h-3 mr-1" />
                                {isMarathi ? 'डिजिटल Rx' : 'Digital Rx'}
                              </Badge>
                            )}
                            {pharmacy.hasHomeDelivery && (
                              <Badge variant="secondary" className="text-xs">
                                <Truck className="w-3 h-3 mr-1" />
                                {isMarathi ? 'होम डिलिव्हरी' : 'Delivery'}
                              </Badge>
                            )}
                            {pharmacy.hasOnlinePayment && (
                              <Badge variant="secondary" className="text-xs">
                                <CreditCard className="w-3 h-3 mr-1" />
                                {isMarathi ? 'ऑनलाइन पेमेंट' : 'Online Pay'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Rating & Actions */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{pharmacy.rating}</span>
                          <span className="text-xs text-muted-foreground">({pharmacy.totalRatings})</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGoogleMaps(pharmacy)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            {isMarathi ? 'दिशा' : 'Directions'}
                          </Button>
                          <a href={`tel:${pharmacy.phone}`}>
                            <Button size="sm">
                              <Phone className="w-4 h-4 mr-1" />
                              {isMarathi ? 'कॉल करा' : 'Call'}
                            </Button>
                          </a>
                        </div>
                        {pharmacy.whatsapp && (
                          <a
                            href={`https://wa.me/${pharmacy.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:underline flex items-center gap-1"
                          >
                            <Package className="w-3 h-3" />
                            {isMarathi ? 'WhatsApp वर ऑर्डर करा' : 'Order on WhatsApp'}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">{isMarathi ? 'उपलब्ध सेवा:' : 'Services:'}</p>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.services.map((service, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Emergency Info */}
      <motion.div variants={itemVariants}>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  {isMarathi ? 'आणीबाणी सेवा' : 'Emergency Services'}
                </h3>
                <p className="text-sm text-red-700">
                  {isMarathi
                    ? 'आपत्कालीन औषध आवश्यक असल्यास जवळच्या रुग्णालयाशी संपर्क साधा किंवा 108 वर कॉल करा'
                    : 'For emergency medicines, contact nearest hospital or call 108 for ambulance'}
                </p>
              </div>
              <a href="tel:108" className="shrink-0">
                <Button variant="destructive" size="sm">
                  <Phone className="w-4 h-4 mr-1" />
                  108
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default PharmacyLocator
