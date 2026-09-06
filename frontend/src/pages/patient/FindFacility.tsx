import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { facilityService } from '../../services/facilityService'
import type { Facility } from '../../types'
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
  Bed,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Stethoscope,
  Truck,
  AlertTriangle,
} from 'lucide-react'

const FindFacility: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTaluka, setSelectedTaluka] = useState<string>('all')

  useEffect(() => {
    facilityService.getFacilities().then(setFacilities)
  }, [])

  const isMarathi = i18n.language === 'mr'

  const filtered = facilities.filter(f => {
    const matchesType = selectedType === 'all' || f.type === selectedType
    const matchesTaluka = selectedTaluka === 'all' || f.address.taluka.toLowerCase() === selectedTaluka.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesTaluka && matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-600" />
            {isMarathi ? '🏥 जवळचे प्राथमिक आरोग्य केंद्र व रुग्णालय' : 'Nearby Healthcare Facilities'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'महाराष्ट्र शासनाचे प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय व खाटांची उपलब्धता शोधा.'
              : 'Locate certified Primary Health Centres (PHC), Community Health Centres, and emergency beds in your district.'}
          </p>
        </div>

        <Button
          asChild
          variant="destructive"
          className="gap-2 shrink-0 font-bold shadow-md animate-pulse"
        >
          <a href="tel:108">
            <Truck className="w-4 h-4" />
            {isMarathi ? '१०८ रुग्णवाहिका (Emergency)' : 'Call 108 Ambulance'}
          </a>
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border-border/70 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'नाव, गाव किंवा सेवा शोधा (उदा. प्रसूती, एक्स-रे, खेड)...' : 'Search facility name, village, or service (e.g. X-Ray, Maternity)...'}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="h-10 text-xs px-3 rounded-md border border-input bg-background"
            >
              <option value="all">{isMarathi ? 'सर्व प्रकार' : 'All Facility Types'}</option>
              <option value="PHC">PHC / प्राथमिक आरोग्य केंद्र</option>
              <option value="CHC">CHC / समुदाय आरोग्य केंद्र</option>
              <option value="RURAL_HOSPITAL">Rural Hospital / ग्रामीण रुग्णालय</option>
              <option value="DISTRICT_HOSPITAL">District Hospital / जिल्हा रुग्णालय</option>
            </select>

            <select
              value={selectedTaluka}
              onChange={e => setSelectedTaluka(e.target.value)}
              className="h-10 text-xs px-3 rounded-md border border-input bg-background"
            >
              <option value="all">{isMarathi ? 'सर्व तालुके' : 'All Talukas (Pune)'}</option>
              <option value="Shirur">Shirur / शिरूर</option>
              <option value="Velhe">Velhe / वेल्हे</option>
              <option value="Haveli">Haveli / हवेली</option>
              <option value="Bhor">Bhor / भोर</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(fac => (
          <Card key={fac.id || fac._id} className="border-border/80 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1.5 font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300 border-primary-300">
                    {fac.type.replace('_', ' ')}
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground">
                    {fac.name}
                  </CardTitle>
                </div>
                {fac.operatingHours.is24x7 && (
                  <Badge className="bg-emerald-500 text-white text-[10px] px-2 shrink-0">
                    24x7 OPEN
                  </Badge>
                )}
              </div>

              <CardDescription className="flex items-center gap-1.5 text-xs pt-1">
                <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                {fac.address.street}, {fac.address.village}, {fac.address.taluka}, {fac.address.district}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Vitals Beds & Staff */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{isMarathi ? 'उपलब्ध खाटा' : 'Available Beds'}</span>
                    <span className="font-bold text-foreground">{fac.bedCapacity.available} / {fac.bedCapacity.total}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{isMarathi ? 'डॉक्टरांची संख्या' : 'Medical Staff'}</span>
                    <span className="font-bold text-foreground">{fac.staff.doctorsCount} Doctors, {fac.staff.nursesCount} Nurses</span>
                  </div>
                </div>
              </div>

              {/* Services Badges */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {isMarathi ? 'उपलब्ध मोफत सेवा व सुविधा:' : 'Available Clinical Services:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {fac.services.map((svc, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] bg-muted/70">
                      ✓ {svc}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between gap-3 bg-muted/10">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {fac.operatingHours.open} - {fac.operatingHours.close}
              </span>

              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                  <a href={`tel:${fac.contact.phone}`}>
                    <Phone className="w-3.5 h-3.5 text-primary-600" />
                    {isMarathi ? 'कॉल करा' : 'Call'}
                  </a>
                </Button>
                <Button
                  size="sm"
                  onClick={() => alert(`Directions initiated for ${fac.name}. Navigation coordinates: ${fac.location.coordinates.join(', ')}`)}
                  className="text-xs gap-1.5 h-8 bg-gradient-to-r from-primary-600 to-indigo-600 text-white"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {isMarathi ? 'नकाशा (Map)' : 'Directions'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FindFacility
