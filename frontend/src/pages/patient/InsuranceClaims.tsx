import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Search,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  ExternalLink,
  ChevronRight,
  Shield,
  Users,
  IndianRupee,
  Calendar,
  AlertCircle,
  Building2,
  Loader2,
  QrCode,
  Activity,
  Clipboard,
  MapPin,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import insuranceService, {
  type InsuranceCard,
  type InsuranceClaim,
  type EmpaneledHospital,
  type ClaimStatus,
} from '@/services/insuranceService'

const InsuranceClaims: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isMarathi = i18n.language === 'mr'

  const [insuranceCards, setInsuranceCards] = useState<InsuranceCard[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [hospitals, setHospitals] = useState<EmpaneledHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyCardNumber, setVerifyCardNumber] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [selectedCard, setSelectedCard] = useState<InsuranceCard | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null)
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cardsData, claimsData, hospitalsData] = await Promise.all([
        insuranceService.getMyInsuranceCards(),
        insuranceService.getMyClaims(),
        insuranceService.getEmpaneledHospitals(),
      ])
      setInsuranceCards(cardsData)
      setClaims(claimsData)
      setHospitals(hospitalsData)
    } catch (error) {
      console.error('Error loading insurance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCard = async () => {
    if (!verifyCardNumber.trim()) return
    
    setVerifying(true)
    try {
      const result = await insuranceService.verifyCard(verifyCardNumber)
      setVerificationResult(result)
    } catch (error) {
      console.error('Error verifying card:', error)
    } finally {
      setVerifying(false)
    }
  }

  const handleViewCard = (card: InsuranceCard) => {
    setSelectedCard(card)
    setShowCardDialog(true)
  }

  const handleViewClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim)
    setShowClaimDialog(true)
  }

  const getUsagePercentage = (card: InsuranceCard) => {
    return Math.round((card.usedAmount / card.coverageAmount) * 100)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeClaims = claims.filter(c => 
    ['SUBMITTED', 'UNDER_REVIEW', 'PRE_AUTH_APPROVED', 'TREATMENT_ONGOING', 'CLAIM_SUBMITTED'].includes(c.status)
  )

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900">
          {isMarathi ? 'विमा आणि दावे' : 'Insurance & Claims'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isMarathi 
            ? 'तुमची आरोग्य विमा कार्डे आणि दावे व्यवस्थापित करा'
            : 'Manage your health insurance cards and claims'}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{insuranceCards.length}</p>
                <p className="text-sm text-blue-700">
                  {isMarathi ? 'सक्रिय कार्डे' : 'Active Cards'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500 text-white">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {insuranceService.formatCurrency(insuranceCards.reduce((sum, c) => sum + c.remainingAmount, 0))}
                </p>
                <p className="text-sm text-green-700">
                  {isMarathi ? 'उपलब्ध कव्हरेज' : 'Available Coverage'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">{activeClaims.length}</p>
                <p className="text-sm text-yellow-700">
                  {isMarathi ? 'सक्रिय दावे' : 'Active Claims'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{hospitals.length}+</p>
                <p className="text-sm text-purple-700">
                  {isMarathi ? 'नोंदणीकृत रुग्णालये' : 'Empaneled Hospitals'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card Verification */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              {isMarathi ? 'कार्ड सत्यापन' : 'Card Verification'}
            </CardTitle>
            <CardDescription>
              {isMarathi 
                ? 'आयुष्मान भारत किंवा MJPJAY कार्ड सत्यापित करा'
                : 'Verify Ayushman Bharat or MJPJAY card'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={isMarathi ? 'कार्ड नंबर प्रविष्ट करा' : 'Enter card number'}
                value={verifyCardNumber}
                onChange={(e) => setVerifyCardNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleVerifyCard} disabled={verifying}>
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {isMarathi ? 'सत्यापित करा' : 'Verify'}
              </Button>
            </div>

            {verificationResult && (
              <div className={`mt-4 p-4 rounded-lg ${verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {verificationResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {isMarathi ? verificationResult.messageMarathi : verificationResult.message}
                  </span>
                </div>
                {verificationResult.card && (
                  <div className="mt-3 text-sm space-y-1">
                    <p><strong>{isMarathi ? 'लाभार्थी:' : 'Beneficiary:'}</strong> {verificationResult.card.beneficiaryName}</p>
                    <p><strong>{isMarathi ? 'कव्हरेज:' : 'Coverage:'}</strong> {insuranceService.formatCurrency(verificationResult.card.coverageAmount)}</p>
                    <p><strong>{isMarathi ? 'शिल्लक:' : 'Remaining:'}</strong> {insuranceService.formatCurrency(verificationResult.card.remainingAmount)}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {isMarathi ? 'माझी कार्डे' : 'My Cards'}
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              {isMarathi ? 'दावे' : 'Claims'}
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {isMarathi ? 'रुग्णालये' : 'Hospitals'}
            </TabsTrigger>
          </TabsList>

          {/* My Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            {insuranceCards.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {insuranceCards.map((card) => (
                  <Card key={card.id} className="overflow-hidden">
                    <div className={`h-2 ${card.type === 'AYUSHMAN_BHARAT' ? 'bg-gradient-to-r from-orange-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} />
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={card.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {card.isActive ? (isMarathi ? 'सक्रिय' : 'Active') : (isMarathi ? 'निष्क्रिय' : 'Inactive')}
                          </Badge>
                          <h3 className="font-semibold mt-2">
                            {insuranceService.getInsuranceTypeLabel(card.type, isMarathi)}
                          </h3>
                          <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {insuranceService.formatCurrency(card.coverageAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isMarathi ? 'कव्हरेज' : 'Coverage'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isMarathi ? 'वापरलेले' : 'Used'}: {insuranceService.formatCurrency(card.usedAmount)}
                          </span>
                          <span className="font-medium text-green-600">
                            {isMarathi ? 'शिल्लक' : 'Remaining'}: {insuranceService.formatCurrency(card.remainingAmount)}
                          </span>
                        </div>
                        <Progress value={getUsagePercentage(card)} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          {getUsagePercentage(card)}% {isMarathi ? 'वापरलेले' : 'used'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {isMarathi ? 'वैध पर्यंत:' : 'Valid until:'} {new Date(card.validUntil).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {card.familyMembers && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{card.familyMembers.length} {isMarathi ? 'सदस्य' : 'members'}</span>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" className="w-full" onClick={() => handleViewCard(card)}>
                        {isMarathi ? 'तपशील पहा' : 'View Details'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isMarathi ? 'कोणतेही विमा कार्ड नाही' : 'No insurance cards found'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            {claims.length > 0 ? (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <Card key={claim.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{claim.claimNumber}</h3>
                            <Badge className={insuranceService.getStatusColor(claim.status)}>
                              {insuranceService.getStatusLabel(claim.status, isMarathi)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {claim.hospitalName} • {claim.diagnosis}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(claim.admissionDate).toLocaleDateString('en-IN')}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-primary">
                              <IndianRupee className="w-4 h-4" />
                              {claim.claimAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {claim.approvedAmount && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{isMarathi ? 'मंजूर रक्कम' : 'Approved'}</p>
                              <p className="font-semibold text-green-600">
                                {insuranceService.formatCurrency(claim.approvedAmount)}
                              </p>
                            </div>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleViewClaim(claim)}>
                            {isMarathi ? 'तपशील' : 'Details'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Timeline Toggle */}
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => setExpandedTimeline(expandedTimeline === claim.id ? null : claim.id)}
                        >
                          <span className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            {isMarathi ? 'दावा टाइमलाइन' : 'Claim Timeline'}
                          </span>
                          {expandedTimeline === claim.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>

                        {expandedTimeline === claim.id && (
                          <div className="mt-4 space-y-3">
                            {claim.timeline.map((event, index) => (
                              <div key={event.id} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
                                  {index < claim.timeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-200 my-1" />
                                  )}
                                </div>
                                <div className="flex-1 pb-3">
                                  <p className="text-sm font-medium">{event.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(event.timestamp).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clipboard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isMarathi ? 'कोणतेही दावे नाहीत' : 'No claims found'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {hospitals.map((hospital) => (
                <Card key={hospital.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{hospital.name}</h3>
                          {hospital.nabh && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              NABH
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hospital.address}, {hospital.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{hospital.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {hospital.supportedSchemes.map((scheme) => (
                        <Badge key={scheme} variant="secondary" className="text-xs">
                          {insuranceService.getInsuranceTypeLabel(scheme, isMarathi)}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {hospital.beds} {isMarathi ? 'बेड' : 'beds'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hospital.district}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`tel:${hospital.phone}`}>
                          <Phone className="w-4 h-4 mr-1" />
                          {isMarathi ? 'कॉल' : 'Call'}
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`https://maps.google.com/?q=${hospital.name},${hospital.city}`} target="_blank" rel="noopener noreferrer">
                          <MapPin className="w-4 h-4 mr-1" />
                          {isMarathi ? 'दिशा' : 'Directions'}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Helpline Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8" />
                <div>
                  <p className="font-semibold">
                    {isMarathi ? 'आयुष्मान भारत हेल्पलाइन' : 'Ayushman Bharat Helpline'}
                  </p>
                  <p className="text-green-100 text-sm">
                    {isMarathi ? 'दावे, कव्हरेज, रुग्णालये संबंधित माहिती' : 'Claims, coverage, hospital information'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" asChild>
                  <a href="tel:14555">
                    <Phone className="w-4 h-4 mr-2" />
                    14555
                  </a>
                </Button>
                <Button variant="secondary" asChild>
                  <a href="tel:155388">
                    <Phone className="w-4 h-4 mr-2" />
                    155388 (MJPJAY)
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card Details Dialog */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {insuranceService.getInsuranceTypeLabel(selectedCard.type, isMarathi)}
                </DialogTitle>
                <DialogDescription>
                  {selectedCard.cardNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Card Visual */}
                <div className={`p-6 rounded-xl text-white ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'bg-gradient-to-br from-orange-500 via-white to-green-500' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className={`text-sm ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-gray-800' : 'text-white/80'}`}>
                        {isMarathi ? 'लाभार्थी' : 'Beneficiary'}
                      </p>
                      <p className={`font-bold text-lg ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-gray-900' : 'text-white'}`}>
                        {selectedCard.beneficiaryName}
                      </p>
                    </div>
                    <Shield className={`w-8 h-8 ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-green-700' : 'text-white'}`} />
                  </div>
                  <div className={`text-2xl font-bold ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-blue-900' : 'text-white'}`}>
                    {selectedCard.cardNumber}
                  </div>
                  <div className="flex justify-between mt-4">
                    <div>
                      <p className={`text-xs ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-gray-600' : 'text-white/70'}`}>
                        {isMarathi ? 'वैध पर्यंत' : 'Valid Until'}
                      </p>
                      <p className={`font-semibold ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-gray-800' : 'text-white'}`}>
                        {new Date(selectedCard.validUntil).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-gray-600' : 'text-white/70'}`}>
                        {isMarathi ? 'कव्हरेज' : 'Coverage'}
                      </p>
                      <p className={`font-bold ${selectedCard.type === 'AYUSHMAN_BHARAT' ? 'text-gray-800' : 'text-white'}`}>
                        {insuranceService.formatCurrency(selectedCard.coverageAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold">{isMarathi ? 'कव्हरेज तपशील' : 'Coverage Details'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">{isMarathi ? 'एकूण कव्हरेज' : 'Total Coverage'}</p>
                      <p className="font-bold text-lg">{insuranceService.formatCurrency(selectedCard.coverageAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">{isMarathi ? 'वापरलेले' : 'Used'}</p>
                      <p className="font-bold text-lg text-orange-600">{insuranceService.formatCurrency(selectedCard.usedAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 col-span-2">
                      <p className="text-sm text-green-700">{isMarathi ? 'उपलब्ध शिल्लक' : 'Available Balance'}</p>
                      <p className="font-bold text-2xl text-green-600">{insuranceService.formatCurrency(selectedCard.remainingAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Family Members */}
                {selectedCard.familyMembers && selectedCard.familyMembers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {isMarathi ? 'कुटुंब सदस्य' : 'Family Members'} ({selectedCard.familyMembers.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedCard.familyMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.relation} • {member.age} {isMarathi ? 'वर्षे' : 'years'}
                            </p>
                          </div>
                          {member.isHead && (
                            <Badge variant="outline">{isMarathi ? 'प्रमुख' : 'Head'}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Claim Details Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedClaim && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedClaim.claimNumber}</DialogTitle>
                  <Badge className={insuranceService.getStatusColor(selectedClaim.status)}>
                    {insuranceService.getStatusLabel(selectedClaim.status, isMarathi)}
                  </Badge>
                </div>
                <DialogDescription>
                  {selectedClaim.hospitalName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Claim Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">{isMarathi ? 'दावा रक्कम' : 'Claim Amount'}</p>
                    <p className="font-bold text-lg">{insuranceService.formatCurrency(selectedClaim.claimAmount)}</p>
                  </div>
                  {selectedClaim.approvedAmount && (
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-sm text-green-700">{isMarathi ? 'मंजूर रक्कम' : 'Approved'}</p>
                      <p className="font-bold text-lg text-green-600">{insuranceService.formatCurrency(selectedClaim.approvedAmount)}</p>
                    </div>
                  )}
                </div>

                {/* Treatment Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold">{isMarathi ? 'उपचार तपशील' : 'Treatment Details'}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isMarathi ? 'निदान' : 'Diagnosis'}</span>
                      <span className="font-medium">{selectedClaim.diagnosis}</span>
                    </div>
                    {selectedClaim.procedure && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isMarathi ? 'प्रक्रिया' : 'Procedure'}</span>
                        <span className="font-medium">{selectedClaim.procedure}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isMarathi ? 'प्रवेश तारीख' : 'Admission Date'}</span>
                      <span className="font-medium">{new Date(selectedClaim.admissionDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    {selectedClaim.dischargeDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isMarathi ? 'सुटी तारीख' : 'Discharge Date'}</span>
                        <span className="font-medium">{new Date(selectedClaim.dischargeDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                {selectedClaim.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">{isMarathi ? 'कागदपत्रे' : 'Documents'}</h4>
                    <div className="space-y-2">
                      {selectedClaim.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          {doc.verified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {isMarathi ? 'सत्यापित' : 'Verified'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              <Clock className="w-3 h-3 mr-1" />
                              {isMarathi ? 'प्रलंबित' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="font-semibold">{isMarathi ? 'टाइमलाइन' : 'Timeline'}</h4>
                  <div className="space-y-3">
                    {selectedClaim.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
                          {index < selectedClaim.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default InsuranceClaims
