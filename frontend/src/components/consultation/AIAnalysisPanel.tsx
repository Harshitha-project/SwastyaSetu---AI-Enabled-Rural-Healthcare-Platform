import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Heart,
  Wind,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Eye,
  Smile,
} from 'lucide-react'
import type { AIConsultationAnalysis } from '../../services/aiAnalysisService'

interface AIAnalysisPanelProps {
  analysis: AIConsultationAnalysis | null
  isAnalyzing: boolean
  compact?: boolean
  showHistory?: boolean
  analysisHistory?: AIConsultationAnalysis[]
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'critical': return 'bg-red-600 text-white'
    case 'high': return 'bg-orange-500 text-white'
    case 'moderate': return 'bg-yellow-500 text-black'
    case 'low': return 'bg-green-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

const getStatusColor = (status: string) => {
  if (status === 'normal' || status === 'good' || status === 'low' || status === 'relaxed') {
    return 'text-emerald-600'
  }
  if (status === 'mild' || status === 'moderate' || status === 'elevated' || status === 'possibly_elevated') {
    return 'text-amber-600'
  }
  return 'text-red-600'
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  isAnalyzing,
  compact = false,
  showHistory = false,
  analysisHistory = [],
}) => {
  if (!analysis && !isAnalyzing) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-4 text-center text-muted-foreground">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">AI Analysis will start when video connects</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">AI Analysis</span>
              {isAnalyzing && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {analysis && (
              <Badge className={`text-[10px] px-1.5 ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </div>

          {analysis && (
            <>
              {/* Risk Score Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-bold">{analysis.riskScore}/100</span>
                </div>
                <Progress value={analysis.riskScore} className="h-1.5" />
              </div>

              {/* Quick Vitals */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1 p-1.5 rounded bg-muted/50">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span className={getStatusColor(analysis.vitalsEstimate.heartRateStatus)}>
                    {analysis.vitalsEstimate.heartRate} bpm
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1.5 rounded bg-muted/50">
                  <Wind className="w-3 h-3 text-cyan-500" />
                  <span className={getStatusColor(analysis.vitalsEstimate.respiratoryStatus)}>
                    SpO₂ {analysis.vitalsEstimate.oxygenEstimate}%
                  </span>
                </div>
              </div>

              {/* Alert Flags */}
              {analysis.alertFlags.length > 0 && (
                <div className="space-y-1">
                  {analysis.alertFlags.slice(0, 2).map((flag, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      {flag}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full panel view
  return (
    <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span>Real-time AI Health Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Analyzing
              </span>
            )}
            {analysis && (
              <Badge className={`text-xs ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              key={analysis.timestamp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Risk Score */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Overall Risk Assessment</span>
                  <span className="text-sm font-bold">{analysis.riskScore}/100</span>
                </div>
                <Progress 
                  value={analysis.riskScore} 
                  className={`h-2 ${
                    analysis.riskScore > 60 ? '[&>div]:bg-red-500' :
                    analysis.riskScore > 40 ? '[&>div]:bg-orange-500' :
                    analysis.riskScore > 20 ? '[&>div]:bg-yellow-500' :
                    '[&>div]:bg-emerald-500'
                  }`}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Confidence: {Math.round(analysis.facialAnalysis.confidence * 100)}%
                </p>
              </div>

              {/* Vitals Estimation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Estimated Vitals
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[10px] text-muted-foreground">Heart Rate</span>
                    </div>
                    <p className={`text-sm font-bold ${getStatusColor(analysis.vitalsEstimate.heartRateStatus)}`}>
                      {analysis.vitalsEstimate.heartRate} <span className="text-[10px] font-normal">bpm</span>
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-[10px] text-muted-foreground">SpO₂ Estimate</span>
                    </div>
                    <p className={`text-sm font-bold ${analysis.vitalsEstimate.oxygenEstimate < 94 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {analysis.vitalsEstimate.oxygenEstimate}<span className="text-[10px] font-normal">%</span>
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] text-muted-foreground">Temperature</span>
                    </div>
                    <p className={`text-sm font-bold ${getStatusColor(analysis.vitalsEstimate.temperature)}`}>
                      {analysis.vitalsEstimate.temperature === 'normal' ? 'Normal' : 
                       analysis.vitalsEstimate.temperature === 'possibly_elevated' ? 'Elevated?' : 'Fever?'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-[10px] text-muted-foreground">Stress Level</span>
                    </div>
                    <p className={`text-sm font-bold ${getStatusColor(analysis.vitalsEstimate.stressLevel)}`}>
                      {analysis.vitalsEstimate.stressLevel.charAt(0).toUpperCase() + analysis.vitalsEstimate.stressLevel.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Facial Analysis */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Visual Assessment
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-1.5 rounded bg-muted/30 text-center">
                    <Smile className="w-3 h-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-[10px] font-medium">{analysis.facialAnalysis.facialExpression}</p>
                  </div>
                  <div className="p-1.5 rounded bg-muted/30 text-center">
                    <Droplets className="w-3 h-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-[10px] font-medium">
                      {analysis.facialAnalysis.hydrationLevel.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-1.5 rounded bg-muted/30 text-center">
                    <Wind className="w-3 h-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-[10px] font-medium">{analysis.facialAnalysis.respiratoryPattern}</p>
                  </div>
                </div>
              </div>

              {/* Detected Symptoms */}
              {analysis.detectedSymptoms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Detected Indicators
                  </h4>
                  <div className="space-y-1.5">
                    {analysis.detectedSymptoms.map((symptom, i) => (
                      <div 
                        key={i}
                        className={`p-2 rounded-lg border text-xs ${
                          symptom.severity === 'severe' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                          symptom.severity === 'moderate' ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' :
                          'border-border bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{symptom.symptom}</span>
                          <Badge variant="outline" className={`text-[9px] ${
                            symptom.severity === 'severe' ? 'text-red-600 border-red-300' :
                            symptom.severity === 'moderate' ? 'text-amber-600 border-amber-300' :
                            'text-muted-foreground'
                          }`}>
                            {symptom.severity}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {symptom.visualCues.join(' • ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> AI Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                        <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="text-[10px] text-amber-800 dark:text-amber-200 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>
                    <strong>AI-Assisted Assessment:</strong> These are preliminary indicators only. 
                    Clinical judgment and proper medical examination are required for diagnosis.
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Graph (if enabled) */}
        {showHistory && analysisHistory.length > 1 && (
          <div className="pt-2 border-t border-border/50">
            <h4 className="text-[10px] font-semibold text-muted-foreground mb-2">Risk Trend</h4>
            <div className="flex items-end gap-0.5 h-8">
              {analysisHistory.slice(-15).map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all ${
                    h.riskScore > 60 ? 'bg-red-500' :
                    h.riskScore > 40 ? 'bg-orange-500' :
                    h.riskScore > 20 ? 'bg-yellow-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ height: `${Math.max(4, h.riskScore / 100 * 32)}px` }}
                  title={`Risk: ${h.riskScore}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIAnalysisPanel
