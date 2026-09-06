import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Building2,
  AlertTriangle,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const DISEASE_TRENDS = [
  { month: 'Jan', URTI: 340, VectorBorne: 80, Hypertension: 210 },
  { month: 'Feb', URTI: 300, VectorBorne: 60, Hypertension: 220 },
  { month: 'Mar', URTI: 280, VectorBorne: 90, Hypertension: 230 },
  { month: 'Apr', URTI: 250, VectorBorne: 110, Hypertension: 240 },
  { month: 'May', URTI: 220, VectorBorne: 140, Hypertension: 250 },
  { month: 'Jun', URTI: 390, VectorBorne: 310, Hypertension: 260 },
  { month: 'Jul', URTI: 480, VectorBorne: 450, Hypertension: 270 },
  { month: 'Aug', URTI: 510, VectorBorne: 520, Hypertension: 275 },
]

const DISTRICT_LOAD = [
  { district: 'Pune', patients: 2450, teleconsults: 1820 },
  { district: 'Nashik', patients: 1890, teleconsults: 1350 },
  { district: 'Nagpur', patients: 1650, teleconsults: 1140 },
  { district: 'Chh. Sambhajinagar', patients: 1420, teleconsults: 980 },
  { district: 'Kolhapur', patients: 1210, teleconsults: 890 },
]

const RISK_DISTRIBUTION = [
  { name: 'Low Risk', value: 68, color: '#10b981' },
  { name: 'Moderate Risk', value: 24, color: '#f59e0b' },
  { name: 'High Risk', value: 8, color: '#ef4444' },
]

const AdminAnalytics: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary-600" />
            {isMarathi ? 'महाराष्ट्र आरोग्य परिसंस्था विश्लेषण' : 'State Healthcare Analytics & Disease Surveillance'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'जिल्हानिहाय टेलीमेडिसिन मागणी, साथीचे आजार आणि प्राथमिक आरोग्य केंद्र कार्यक्षमता.'
              : 'Aggregated real-time epidemiological trends, rural telehealth adoption, and facility utilization.'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          {isMarathi ? 'अहवाल डाउनलोड' : 'Export State Report'}
        </Button>
      </div>

      {/* Top Stat Summary Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/80">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Active Telehealth Nodes</span>
          <p className="text-2xl font-black text-foreground mt-1">124 PHCs</p>
          <span className="text-[11px] text-emerald-600 font-medium">98.4% uptime</span>
        </Card>
        <Card className="p-4 border-border/80">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Rural Teleconsults</span>
          <p className="text-2xl font-black text-foreground mt-1">6,180</p>
          <span className="text-[11px] text-primary-600 font-medium">+28% this quarter</span>
        </Card>
        <Card className="p-4 border-border/80">
          <span className="text-xs text-muted-foreground font-semibold uppercase">AI Triage Screenings</span>
          <p className="text-2xl font-black text-foreground mt-1">14,920</p>
          <span className="text-[11px] text-indigo-600 font-medium">Avg risk score: 32</span>
        </Card>
        <Card className="p-4 border-border/80">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Field ASHA Screenings</span>
          <p className="text-2xl font-black text-foreground mt-1">8,430</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% synced</span>
        </Card>
      </div>

      {/* Disease Trends Chart */}
      <Card className="p-6 border-border/80 shadow-sm space-y-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            {isMarathi ? 'साथीच्या आजारांचे कल (Epidemiological Disease Surveillance)' : 'Seasonal Disease Trends (Maharashtra)'}
          </CardTitle>
          <CardDescription className="text-xs">
            Monthly cases of Acute Respiratory Infection (URTI), Vector-Borne fevers (Dengue/Malaria), and chronic Hypertension
          </CardDescription>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DISEASE_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="VectorBorne" stroke="#ef4444" strokeWidth={2.5} name="Vector-Borne (Dengue/Malaria)" />
              <Line type="monotone" dataKey="URTI" stroke="#3b82f6" strokeWidth={2.5} name="Respiratory Infections" />
              <Line type="monotone" dataKey="Hypertension" stroke="#10b981" strokeWidth={2.5} name="Chronic Hypertension" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Charts: District-wise Load & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Load Bar Chart (2 cols) */}
        <Card className="lg:col-span-2 p-6 border-border/80 shadow-sm space-y-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              {isMarathi ? 'जिल्हानिहाय रुग्णसंख्या व टेलिकन्सल्टेशन' : 'District-Wise Teleconsultation Demand'}
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison between registered rural patients and conducted teleconsultations
            </CardDescription>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_LOAD}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="patients" fill="#6366f1" name="Registered Patients" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teleconsults" fill="#10b981" name="Teleconsults Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Level Pie Chart (1 col) */}
        <Card className="p-6 border-border/80 shadow-sm space-y-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              {isMarathi ? 'जोखीम वर्गवारी (AI Risk Triage)' : 'AI Risk Triage Ratio'}
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of screened rural population
            </CardDescription>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RISK_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-1 text-xs">
            {RISK_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics
