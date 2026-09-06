import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { recordsService, type EHRTimelineItem } from '../../services/recordsService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
} from '@/components/ui/dialog'
import {
  FileText,
  Calendar,
  Search,
  Download,
  Filter,
  Stethoscope,
  Activity,
  ClipboardList,
  FlaskConical,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react'

const HealthRecords: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [records, setRecords] = useState<EHRTimelineItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<EHRTimelineItem | null>(null)

  useEffect(() => {
    recordsService.getEHRTimeline().then(setRecords)
  }, [])

  const isMarathi = i18n.language === 'mr'

  const filteredRecords = records.filter(r => {
    const matchesFilter = selectedFilter === 'ALL' || r.type === selectedFilter
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getTypeIcon = (type: EHRTimelineItem['type']) => {
    switch (type) {
      case 'CONSULTATION':
        return <Stethoscope className="w-5 h-5 text-primary-600" />
      case 'PRESCRIPTION':
        return <ClipboardList className="w-5 h-5 text-indigo-600" />
      case 'LAB_REPORT':
        return <FlaskConical className="w-5 h-5 text-cyan-600" />
      case 'AI_ASSESSMENT':
        return <Activity className="w-5 h-5 text-amber-600" />
      case 'VITALS_CHECK':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary-600" />
            {isMarathi ? 'माझे डिजिटल आरोग्य रेकॉर्ड्स (EHR)' : 'Digital Health Records'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'सर्व वैद्यकीय इतिहास, सल्लामसलत नोंदी, लॅब रिपोर्ट्स आणि डिजिटल प्रिस्क्रिप्शन एकाच ठिकाणी.'
              : 'Chronological electronic medical timeline uniting all consultations, prescriptions, and lab investigations.'}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2 shrink-0 text-xs"
        >
          <Printer className="w-4 h-4" />
          {isMarathi ? 'रेकॉर्ड्स प्रिंट करा' : 'Print / Export'}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/70 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'रेकॉर्ड्स शोधा (उदा. रक्त तपासणी, ताप, डॉ. पाटील)...' : 'Search records by keyword, doctor, or condition...'}
              className="pl-9 h-10 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {[
              { id: 'ALL', label: isMarathi ? 'सर्व' : 'All' },
              { id: 'CONSULTATION', label: isMarathi ? 'सल्लामसलत' : 'Consultations' },
              { id: 'PRESCRIPTION', label: isMarathi ? 'औषधचिठ्ठी' : 'Prescriptions' },
              { id: 'LAB_REPORT', label: isMarathi ? 'लॅब रिपोर्ट्स' : 'Lab Reports' },
              { id: 'AI_ASSESSMENT', label: isMarathi ? 'एआय तपासणी' : 'AI Triages' },
            ].map(f => (
              <Button
                key={f.id}
                size="sm"
                variant={selectedFilter === f.id ? 'default' : 'ghost'}
                onClick={() => setSelectedFilter(f.id)}
                className="text-xs h-8 px-3"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Medical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
        {filteredRecords.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-4 w-6 h-6 rounded-full bg-card border-2 border-primary-600 flex items-center justify-center z-10 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary-600" />
            </div>

            {/* Timeline Item Card */}
            <Card
              onClick={() => setSelectedRecord(item)}
              className="p-5 border-border/70 shadow-xs hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {item.details && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/30 p-2.5 rounded-lg">
                  {item.details}
                </p>
              )}

              {item.vitalHighlights && (
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {Object.entries(item.vitalHighlights).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="text-[11px] font-mono">
                      {k}: {v}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary-600 mb-1">
                {getTypeIcon(selectedRecord.type)}
                <span className="text-xs font-semibold uppercase">{selectedRecord.type}</span>
              </div>
              <DialogTitle className="text-lg">{selectedRecord.title}</DialogTitle>
              <DialogDescription>{selectedRecord.subtitle}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="flex justify-between p-3 rounded-lg bg-muted/40 text-muted-foreground">
                <span>Recorded On:</span>
                <span className="font-medium text-foreground">{new Date(selectedRecord.date).toLocaleString()}</span>
              </div>

              {selectedRecord.doctorName && (
                <div className="flex justify-between p-3 rounded-lg bg-muted/40 text-muted-foreground">
                  <span>Healthcare Provider:</span>
                  <span className="font-medium text-foreground">{selectedRecord.doctorName}</span>
                </div>
              )}

              {selectedRecord.details && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground block">Clinical Findings & Notes:</span>
                  <p className="p-3 rounded-xl bg-card border border-border text-muted-foreground leading-relaxed">
                    {selectedRecord.details}
                  </p>
                </div>
              )}

              {selectedRecord.vitalHighlights && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground block">Associated Vital Metrics:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedRecord.vitalHighlights).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-lg border border-border bg-muted/20 text-center">
                        <span className="text-[10px] text-muted-foreground block">{k}</span>
                        <span className="text-sm font-bold text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                <Printer className="w-3.5 h-3.5" />
                {isMarathi ? 'प्रिंट' : 'Print'}
              </Button>
              <Button size="sm" onClick={() => setSelectedRecord(null)} className="text-xs">
                {isMarathi ? 'बंद करा' : 'Close'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default HealthRecords
