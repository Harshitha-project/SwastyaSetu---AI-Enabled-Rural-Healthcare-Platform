import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { educationService, type HealthArticle } from '../../services/educationService'
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
import {
  BookOpen,
  Heart,
  Baby,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

const HealthEducation: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>('art-01')

  const articles = educationService.getArticles(selectedCategory)
  const currentLang = (i18n.language === 'mr' ? 'mr' : i18n.language === 'hi' ? 'hi' : 'en') as 'mr' | 'hi' | 'en'
  const isMarathi = currentLang === 'mr'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary-600 mb-1">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isMarathi ? 'ग्रामीण आरोग्य साक्षरता पोर्टल' : 'Rural Health Literacy & Preventative Care'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {isMarathi ? '📚 आरोग्य मार्गदर्शन व जनजागृती' : 'Health Education & Awareness'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMarathi
            ? 'पावसाळी आजार, मातृत्व काळजी, उच्च रक्तदाब व प्रथमोपचाराविषयी सोप्या भाषेतील प्रमाणित मार्गदर्शक.'
            : 'Evidence-based preventative healthcare guides tailored for rural and semi-urban communities.'}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: isMarathi ? 'सर्व विषय' : 'All Topics' },
          { id: 'INFECTIOUS', label: isMarathi ? '🦟 डेंग्यू व ताप' : 'Dengue & Fevers' },
          { id: 'CHRONIC', label: isMarathi ? '🩸 बीपी व साखर' : 'BP & Diabetes' },
          { id: 'MATERNAL', label: isMarathi ? '🤰 माता पोषण' : 'Maternal Health' },
          { id: 'FIRST_AID', label: isMarathi ? '🚨 सर्पदंश प्रथमोपचार' : 'Snakebite & First Aid' },
        ].map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="text-xs rounded-full"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {articles.map(art => {
          const isExpanded = expandedId === art.id
          const title = art.title[currentLang]
          const summary = art.summary[currentLang]
          const content = art.content[currentLang]
          const points = art.keyPoints[currentLang]

          return (
            <Card
              key={art.id}
              className={`border-2 transition-all flex flex-col justify-between ${
                isExpanded ? 'border-primary-500 shadow-md' : 'border-border/80 shadow-xs hover:border-border'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{art.icon}</span>
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-1">
                        {art.category}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">
                        {title}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    <Clock className="w-3 h-3 mr-1" /> {art.readTime}
                  </Badge>
                </div>
                <CardDescription className="text-xs pt-1.5 leading-relaxed">
                  {summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs pt-0">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 leading-relaxed text-muted-foreground">
                  {content}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-foreground block">
                    {isMarathi ? 'महत्त्वाचे नियम (Key Rules):' : 'Essential Action Steps:'}
                  </span>
                  <ul className="space-y-1">
                    {points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground bg-muted/10">
                <span>Verified by SwasthyaSetu Health Board</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(isExpanded ? null : art.id)}
                  className="h-8 text-xs text-primary-600"
                >
                  {isExpanded ? (isMarathi ? 'संक्षिप्त करा' : 'Collapse') : (isMarathi ? 'अधिक वाचा' : 'Read More')}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default HealthEducation
