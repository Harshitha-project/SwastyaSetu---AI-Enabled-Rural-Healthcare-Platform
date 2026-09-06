import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
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
  Filter,
  Star,
  Building2,
  Heart,
  Baby,
  User,
  HelpCircle,
  Loader2,
  Award,
  ClipboardList,
} from 'lucide-react'
import governmentSchemesService, {
  type GovernmentScheme,
  type SchemeCategory,
  type SchemeApplication,
  type EligibilityCheckResult,
  type UserProfile,
} from '@/services/governmentSchemesService'

const GovernmentSchemes: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isMarathi = i18n.language === 'mr'

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([])
  const [applications, setApplications] = useState<SchemeApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | 'ALL'>('ALL')
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null)
  const [showSchemeDialog, setShowSchemeDialog] = useState(false)
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false)
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityCheckResult | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  // Mock user profile for eligibility check
  const userProfile: UserProfile = {
    age: 45,
    gender: 'MALE',
    annualIncome: 80000,
    rationCardType: 'BPL',
    category: 'OBC',
    state: 'Maharashtra',
    district: 'Pune',
    isBPL: true,
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [schemesData, applicationsData] = await Promise.all([
        governmentSchemesService.getAllSchemes(),
        governmentSchemesService.getMyApplications(),
      ])
      setSchemes(schemesData)
      setApplications(applicationsData)
    } catch (error) {
      console.error('Error loading schemes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await governmentSchemesService.searchSchemes(query)
      setSchemes(results)
    } else {
      const allSchemes = await governmentSchemesService.getAllSchemes()
      setSchemes(allSchemes)
    }
  }

  const handleCategoryFilter = async (category: SchemeCategory | 'ALL') => {
    setSelectedCategory(category)
    if (category === 'ALL') {
      const allSchemes = await governmentSchemesService.getAllSchemes()
      setSchemes(allSchemes)
    } else {
      const filteredSchemes = await governmentSchemesService.getSchemesByCategory(category)
      setSchemes(filteredSchemes)
    }
  }

  const handleCheckEligibility = async (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme)
    setCheckingEligibility(true)
    setShowEligibilityDialog(true)
    
    try {
      const result = await governmentSchemesService.checkEligibility(scheme.id, userProfile)
      setEligibilityResult(result)
    } catch (error) {
      console.error('Error checking eligibility:', error)
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleViewScheme = (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme)
    setShowSchemeDialog(true)
  }

  const getCategoryIcon = (category: SchemeCategory) => {
    const icons: Record<SchemeCategory, React.ElementType> = {
      NATIONAL: Shield,
      STATE: Building2,
      MATERNAL: Heart,
      CHILD: Baby,
      SENIOR: User,
      DISABILITY: HelpCircle,
      DISEASE_SPECIFIC: AlertCircle,
    }
    return icons[category] || FileText
  }

  const getCategoryColor = (category: SchemeCategory) => {
    const colors: Record<SchemeCategory, string> = {
      NATIONAL: 'bg-blue-100 text-blue-800',
      STATE: 'bg-purple-100 text-purple-800',
      MATERNAL: 'bg-pink-100 text-pink-800',
      CHILD: 'bg-green-100 text-green-800',
      SENIOR: 'bg-orange-100 text-orange-800',
      DISABILITY: 'bg-yellow-100 text-yellow-800',
      DISEASE_SPECIFIC: 'bg-red-100 text-red-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const categories = governmentSchemesService.getCategories()

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
          {isMarathi ? 'सरकारी आरोग्य योजना' : 'Government Health Schemes'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isMarathi 
            ? 'सरकारी आरोग्य योजना शोधा आणि अर्ज करा'
            : 'Discover and apply for government health schemes'}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{schemes.length}</p>
                <p className="text-sm text-blue-700">
                  {isMarathi ? 'उपलब्ध योजना' : 'Available Schemes'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {applications.filter(a => a.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-green-700">
                  {isMarathi ? 'सक्रिय लाभ' : 'Active Benefits'}
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
                <p className="text-2xl font-bold text-yellow-900">
                  {applications.filter(a => a.status === 'UNDER_REVIEW').length}
                </p>
                <p className="text-sm text-yellow-700">
                  {isMarathi ? 'प्रलंबित अर्ज' : 'Pending Applications'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">5L+</p>
                <p className="text-sm text-purple-700">
                  {isMarathi ? 'कमाल कव्हरेज' : 'Max Coverage'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {isMarathi ? 'योजना शोधा' : 'Browse Schemes'}
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              {isMarathi ? 'माझे अर्ज' : 'My Applications'}
            </TabsTrigger>
          </TabsList>

          {/* Browse Schemes Tab */}
          <TabsContent value="browse" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isMarathi ? 'योजना शोधा...' : 'Search schemes...'}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(v) => handleCategoryFilter(v as SchemeCategory | 'ALL')}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={isMarathi ? 'श्रेणी' : 'Category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isMarathi ? 'सर्व योजना' : 'All Schemes'}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {isMarathi ? cat.labelMarathi : cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schemes Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {schemes.map((scheme) => {
                const CategoryIcon = getCategoryIcon(scheme.category)
                const application = applications.find(a => a.schemeId === scheme.id)
                
                return (
                  <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(scheme.category)}`}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {isMarathi ? scheme.nameMarathi : scheme.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {scheme.ministry}
                            </CardDescription>
                          </div>
                        </div>
                        {application && (
                          <Badge className={governmentSchemesService.getStatusColor(application.status)}>
                            {governmentSchemesService.getStatusLabel(application.status, isMarathi)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {isMarathi ? scheme.descriptionMarathi : scheme.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <IndianRupee className="w-4 h-4" />
                          <span className="font-semibold">
                            {scheme.coverageAmount > 0 
                              ? `${(scheme.coverageAmount / 100000).toFixed(1)}L`
                              : isMarathi ? 'मोफत' : 'Free'}
                          </span>
                        </div>
                        <Badge variant="outline" className={getCategoryColor(scheme.category)}>
                          {isMarathi 
                            ? categories.find(c => c.value === scheme.category)?.labelMarathi
                            : categories.find(c => c.value === scheme.category)?.label}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewScheme(scheme)}
                        >
                          {isMarathi ? 'तपशील' : 'Details'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCheckEligibility(scheme)}
                        >
                          {isMarathi ? 'पात्रता तपासा' : 'Check Eligibility'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {schemes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isMarathi ? 'कोणतीही योजना सापडली नाही' : 'No schemes found'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => {
                  const scheme = schemes.find(s => s.id === application.schemeId)
                  
                  return (
                    <Card key={application.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{application.schemeName}</h3>
                              <Badge className={governmentSchemesService.getStatusColor(application.status)}>
                                {governmentSchemesService.getStatusLabel(application.status, isMarathi)}
                              </Badge>
                            </div>
                            
                            {application.applicationNumber && (
                              <p className="text-sm text-muted-foreground">
                                {isMarathi ? 'अर्ज क्र.' : 'Application No.'}: {application.applicationNumber}
                              </p>
                            )}
                            
                            {application.cardNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <Award className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-medium">
                                  {isMarathi ? 'कार्ड क्र.' : 'Card No.'}: {application.cardNumber}
                                </span>
                              </div>
                            )}

                            {application.validUntil && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {isMarathi ? 'वैध पर्यंत' : 'Valid until'}: {new Date(application.validUntil).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            )}

                            {application.remarks && (
                              <p className="text-sm text-orange-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {application.remarks}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {application.status === 'ACTIVE' && scheme?.helplineNumber && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`tel:${scheme.helplineNumber}`}>
                                  <Phone className="w-4 h-4 mr-1" />
                                  {scheme.helplineNumber}
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              {isMarathi ? 'तपशील पहा' : 'View Details'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {isMarathi ? 'तुम्ही अजून कोणत्याही योजनेसाठी अर्ज केलेला नाही' : 'You haven\'t applied for any schemes yet'}
                </p>
                <Button onClick={() => document.querySelector('[value="browse"]')?.dispatchEvent(new Event('click'))}>
                  {isMarathi ? 'योजना शोधा' : 'Browse Schemes'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Helpline Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8" />
                <div>
                  <p className="font-semibold">
                    {isMarathi ? 'आयुष्मान भारत हेल्पलाइन' : 'Ayushman Bharat Helpline'}
                  </p>
                  <p className="text-blue-100 text-sm">
                    {isMarathi ? '24x7 मोफत टोल-फ्री' : '24x7 Free Toll-Free'}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <a href="tel:14555">
                  <Phone className="w-5 h-5 mr-2" />
                  14555
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scheme Details Dialog */}
      <Dialog open={showSchemeDialog} onOpenChange={setShowSchemeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedScheme && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isMarathi ? selectedScheme.nameMarathi : selectedScheme.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedScheme.ministry}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Coverage */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {isMarathi ? 'कव्हरेज' : 'Coverage'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedScheme.coverageAmount > 0 
                      ? `Rs. ${selectedScheme.coverageAmount.toLocaleString('en-IN')}`
                      : isMarathi ? 'मोफत सेवा' : 'Free Services'}
                    {selectedScheme.coverageAmountMax && (
                      <span className="text-lg"> - Rs. {selectedScheme.coverageAmountMax.toLocaleString('en-IN')}</span>
                    )}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">
                    {isMarathi ? 'वर्णन' : 'Description'}
                  </h4>
                  <p className="text-muted-foreground">
                    {isMarathi ? selectedScheme.descriptionMarathi : selectedScheme.description}
                  </p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold mb-2">
                    {isMarathi ? 'फायदे' : 'Benefits'}
                  </h4>
                  <ul className="space-y-2">
                    {(isMarathi ? selectedScheme.benefitsMarathi : selectedScheme.benefits).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-2">
                    {isMarathi ? 'आवश्यक कागदपत्रे' : 'Required Documents'}
                  </h4>
                  <ul className="space-y-2">
                    {selectedScheme.documents.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          {isMarathi ? doc.nameMarathi : doc.name}
                        </span>
                        {doc.mandatory && (
                          <Badge variant="destructive" className="text-xs">
                            {isMarathi ? 'अनिवार्य' : 'Mandatory'}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => handleCheckEligibility(selectedScheme)}
                  >
                    {isMarathi ? 'पात्रता तपासा' : 'Check Eligibility'}
                  </Button>
                  {selectedScheme.applicationUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedScheme.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isMarathi ? 'अधिकृत वेबसाइट' : 'Official Website'}
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <a href={`tel:${selectedScheme.helplineNumber}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedScheme.helplineNumber}
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Eligibility Check Dialog */}
      <Dialog open={showEligibilityDialog} onOpenChange={setShowEligibilityDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isMarathi ? 'पात्रता तपासणी' : 'Eligibility Check'}
            </DialogTitle>
            <DialogDescription>
              {selectedScheme && (isMarathi ? selectedScheme.nameMarathi : selectedScheme.name)}
            </DialogDescription>
          </DialogHeader>

          {checkingEligibility ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {isMarathi ? 'पात्रता तपासत आहे...' : 'Checking eligibility...'}
              </p>
            </div>
          ) : eligibilityResult ? (
            <div className="space-y-6">
              {/* Result Banner */}
              <div className={`p-4 rounded-lg ${eligibilityResult.isEligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {eligibilityResult.isEligible ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <p className={`font-semibold ${eligibilityResult.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                      {eligibilityResult.isEligible 
                        ? (isMarathi ? 'तुम्ही पात्र आहात!' : 'You are Eligible!')
                        : (isMarathi ? 'तुम्ही पात्र नाही' : 'Not Eligible')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isMarathi ? 'पात्रता स्कोर' : 'Eligibility Score'}: {eligibilityResult.eligibilityScore}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Matched Criteria */}
              {eligibilityResult.matchedCriteria.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {isMarathi ? 'पूर्ण केलेले निकष' : 'Matched Criteria'}
                  </h4>
                  <ul className="space-y-1">
                    {eligibilityResult.matchedCriteria.map((criteria, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unmatched Criteria */}
              {eligibilityResult.unmatchedCriteria.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {isMarathi ? 'पूर्ण न केलेले निकष' : 'Unmatched Criteria'}
                  </h4>
                  <ul className="space-y-1">
                    {eligibilityResult.unmatchedCriteria.map((criteria, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                        <XCircle className="w-3 h-3" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {eligibilityResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {isMarathi ? 'शिफारसी' : 'Recommendations'}
                  </h4>
                  <ul className="space-y-1">
                    {eligibilityResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-600 flex items-center gap-2">
                        <ChevronRight className="w-3 h-3" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {eligibilityResult.isEligible && selectedScheme?.applicationUrl && (
                  <Button className="flex-1" asChild>
                    <a href={selectedScheme.applicationUrl} target="_blank" rel="noopener noreferrer">
                      {isMarathi ? 'आत्ता अर्ज करा' : 'Apply Now'}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowEligibilityDialog(false)}>
                  {isMarathi ? 'बंद करा' : 'Close'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default GovernmentSchemes
