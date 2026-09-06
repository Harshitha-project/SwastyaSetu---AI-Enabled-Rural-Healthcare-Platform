import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useOffline } from '../../hooks/useOffline'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserPlus,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  MapPin,
  Calendar,
  Heart,
  Thermometer,
  ClipboardList,
  ArrowRight,
  FileText,
  Phone,
  Stethoscope,
  TrendingUp,
  Download,
  Upload,
  Smartphone,
  Signal,
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface PatientScreening {
  id: string
  patientName: string
  age: number
  gender: 'M' | 'F'
  village: string
  date: string
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  vitalsRecorded: boolean
  lastVitals?: {
    bp: string
    pulse: number
    temp: number
    spo2: number
  }
}

interface FollowUp {
  id: string
  patientName: string
  dueDate: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  village: string
}

interface WorkerStats {
  assignedPatients: number
  screeningsToday: number
  pendingReferrals: number
  pendingSync: number
  followUpsToday: number
  highRiskPatients: number
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const WorkerDashboard: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { isOnline, pendingCount, syncAll } = useOffline()

  const [stats, setStats] = useState<WorkerStats>({
    assignedPatients: 45,
    screeningsToday: 8,
    pendingReferrals: 3,
    pendingSync: pendingCount,
    followUpsToday: 5,
    highRiskPatients: 4,
  })

  const [recentScreenings, setRecentScreenings] = useState<PatientScreening[]>([])
  const [pendingFollowUps, setPendingFollowUps] = useState<FollowUp[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  const isMarathi = i18n.language === 'mr'
  const userName = user?.firstName || 'Sunil'

  // Load mock data
  useEffect(() => {
    const screenings: PatientScreening[] = [
      {
        id: '1',
        patientName: 'Kavita Pawar',
        age: 35,
        gender: 'F',
        village: 'Shirur',
        date: new Date().toISOString().split('T')[0],
        riskLevel: 'LOW',
        vitalsRecorded: true,
        lastVitals: { bp: '120/80', pulse: 72, temp: 98.4, spo2: 98 },
      },
      {
        id: '2',
        patientName: 'Suresh Gaikwad',
        age: 62,
        gender: 'M',
        village: 'Khed',
        date: new Date().toISOString().split('T')[0],
        riskLevel: 'HIGH',
        vitalsRecorded: true,
        lastVitals: { bp: '160/100', pulse: 88, temp: 99.2, spo2: 94 },
      },
      {
        id: '3',
        patientName: 'Meena Bhosle',
        age: 28,
        gender: 'F',
        village: 'Junnar',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        riskLevel: 'MODERATE',
        vitalsRecorded: true,
        lastVitals: { bp: '130/85', pulse: 76, temp: 98.6, spo2: 97 },
      },
      {
        id: '4',
        patientName: 'Ramesh Deshmukh',
        age: 55,
        gender: 'M',
        village: 'Shirur',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        riskLevel: 'CRITICAL',
        vitalsRecorded: true,
        lastVitals: { bp: '180/110', pulse: 95, temp: 100.4, spo2: 91 },
      },
    ]
    setRecentScreenings(screenings)

    const followUps: FollowUp[] = [
      { id: '1', patientName: 'Raju Deshmukh', dueDate: new Date().toISOString().split('T')[0], reason: 'Blood pressure check', priority: 'high', village: 'Shirur' },
      { id: '2', patientName: 'Lakshmi Kulkarni', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], reason: 'Diabetes follow-up', priority: 'medium', village: 'Khed' },
      { id: '3', patientName: 'Ganesh More', dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], reason: 'Post-delivery checkup', priority: 'medium', village: 'Junnar' },
      { id: '4', patientName: 'Sunita Jadhav', dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], reason: 'Vaccination due', priority: 'low', village: 'Shirur' },
    ]
    setPendingFollowUps(followUps)
  }, [])

  // Connect to real-time updates when online
  useEffect(() => {
    if (!isOnline) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('[HealthWorker] Connected to real-time updates')
    })

    newSocket.on('patient-update', (data: any) => {
      console.log('[HealthWorker] Patient update received:', data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isOnline])

  // Update pending sync count
  useEffect(() => {
    setStats(prev => ({ ...prev, pendingSync: pendingCount }))
  }, [pendingCount])

  const handleSync = async () => {
    if (!isOnline) return

    setIsSyncing(true)
    setSyncProgress(0)

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      await syncAll()
      setLastSyncTime(new Date())
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 500)
    }
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MODERATE': return 'default'
      case 'LOW': return 'secondary'
      default: return 'outline'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'low': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Offline Banner */}
      {!isOnline && (
        <Alert className="bg-amber-50 border-amber-300 text-amber-900">
          <WifiOff className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold flex items-center gap-2">
            {isMarathi ? 'ऑफलाइन मोड' : 'Offline Mode'}
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              <Signal className="w-3 h-3 mr-1" />
              No Connection
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-sm">
            {isMarathi
              ? 'तुम्ही ऑफलाइन आहात. डेटा स्थानिक पातळीवर जतन केला जाईल आणि इंटरनेट उपलब्ध झाल्यावर सिंक होईल.'
              : 'Data will be saved locally and synced when connection is restored.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-emerald-700 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/20 shadow-inner">
              🏥
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {isMarathi ? `नमस्कार, ${userName}!` : `Namaste, ${userName}!`}
              </h1>
              <p className="text-primary-100 text-sm mt-1">
                {isMarathi
                  ? 'आरोग्य सेवक डॅशबोर्ड - ग्रामीण समुदायांची सेवा'
                  : 'Healthcare Worker Dashboard - Serving rural communities'}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${isOnline ? 'bg-emerald-500/30 text-emerald-100' : 'bg-amber-500/30 text-amber-100'} border-0`}>
                  {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
                {lastSyncTime && (
                  <span className="text-xs text-primary-200">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={!isOnline || isSyncing || pendingCount === 0}
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1.5" />
                  {isMarathi ? 'सिंक करा' : 'Sync'} ({pendingCount})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sync Progress */}
        {isSyncing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-primary-200 mb-1">
              <span>Syncing data...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-1.5 bg-white/20" />
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: isMarathi ? 'नेमून दिलेले रुग्ण' : 'Assigned Patients', value: stats.assignedPatients, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: isMarathi ? 'आजचे स्क्रीनिंग' : 'Screenings Today', value: stats.screeningsToday, icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
          { label: isMarathi ? 'आजचे फॉलो-अप' : 'Follow-ups Today', value: stats.followUpsToday, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
          { label: isMarathi ? 'प्रलंबित रेफरल' : 'Pending Referrals', value: stats.pendingReferrals, icon: FileText, color: 'text-orange-600 bg-orange-50' },
          { label: isMarathi ? 'उच्च जोखीम' : 'High Risk', value: stats.highRiskPatients, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: isMarathi ? 'प्रलंबित सिंक' : 'Pending Sync', value: pendingCount, icon: RefreshCw, color: 'text-indigo-600 bg-indigo-50' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 border-border/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isMarathi ? 'रुग्ण नोंदणी' : 'Register Patient', icon: UserPlus, path: '/worker/register', color: 'bg-emerald-500', desc: 'Add new patient' },
          { label: isMarathi ? 'रुग्ण शोधा' : 'Search Patient', icon: Search, path: '/worker/search', color: 'bg-blue-500', desc: 'Find records' },
          { label: isMarathi ? 'व्हायटल्स नोंदवा' : 'Record Vitals', icon: Activity, path: '/worker/vitals', color: 'bg-purple-500', desc: 'Health check' },
          { label: isMarathi ? 'डॉक्टरांना पाठवा' : 'Refer to Doctor', icon: Stethoscope, path: '/worker/referrals', color: 'bg-orange-500', desc: 'Teleconsult' },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <Link key={i} to={action.path}>
              <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group border-border/80 h-full">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Screenings */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">
                  {isMarathi ? 'अलीकडील स्क्रीनिंग' : 'Recent Screenings'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isMarathi ? 'आजचे आणि कालचे स्क्रीनिंग' : "Today's and yesterday's screenings"}
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                <Link to="/worker/screenings">
                  {isMarathi ? 'सर्व पहा' : 'View All'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentScreenings.map((screening) => (
              <div
                key={screening.id}
                className={`p-3 rounded-xl border ${getRiskColor(screening.riskLevel)} transition-colors`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {screening.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{screening.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {screening.age} yrs, {screening.gender} • {screening.village}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(screening.riskLevel)} className="text-[10px]">
                    {screening.riskLevel}
                  </Badge>
                </div>

                {/* Vitals Display */}
                {screening.lastVitals && (
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-current/10">
                    <div className="text-center">
                      <Heart className="w-3.5 h-3.5 mx-auto text-red-500 mb-0.5" />
                      <p className="text-xs font-semibold">{screening.lastVitals.bp}</p>
                      <p className="text-[9px] text-muted-foreground">BP</p>
                    </div>
                    <div className="text-center">
                      <Activity className="w-3.5 h-3.5 mx-auto text-blue-500 mb-0.5" />
                      <p className="text-xs font-semibold">{screening.lastVitals.pulse}</p>
                      <p className="text-[9px] text-muted-foreground">Pulse</p>
                    </div>
                    <div className="text-center">
                      <Thermometer className="w-3.5 h-3.5 mx-auto text-orange-500 mb-0.5" />
                      <p className="text-xs font-semibold">{screening.lastVitals.temp}°F</p>
                      <p className="text-[9px] text-muted-foreground">Temp</p>
                    </div>
                    <div className="text-center">
                      <Activity className="w-3.5 h-3.5 mx-auto text-teal-500 mb-0.5" />
                      <p className="text-xs font-semibold">{screening.lastVitals.spo2}%</p>
                      <p className="text-[9px] text-muted-foreground">SpO2</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-3">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                    <Link to={`/worker/vitals/${screening.id}`}>
                      {isMarathi ? 'व्हायटल्स अपडेट करा' : 'Update Vitals'}
                    </Link>
                  </Button>
                  {(screening.riskLevel === 'HIGH' || screening.riskLevel === 'CRITICAL') && (
                    <Button asChild size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600">
                      <Link to={`/worker/referrals?patient=${screening.id}`}>
                        {isMarathi ? 'रेफर करा' : 'Refer'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Follow-ups */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {isMarathi ? 'प्रलंबित फॉलो-अप' : 'Pending Follow-ups'}
                  {pendingFollowUps.filter(f => f.priority === 'high').length > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {pendingFollowUps.filter(f => f.priority === 'high').length} Urgent
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isMarathi ? 'आगामी रुग्ण भेटी' : 'Upcoming patient visits'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className={`p-3 rounded-xl border ${getPriorityColor(followUp.priority)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {followUp.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{followUp.patientName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {followUp.village}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${
                      followUp.dueDate === new Date().toISOString().split('T')[0]
                        ? 'text-red-600'
                        : 'text-foreground'
                    }`}>
                      {followUp.dueDate === new Date().toISOString().split('T')[0]
                        ? (isMarathi ? 'आज' : 'Today')
                        : new Date(followUp.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <Badge
                      variant={followUp.priority === 'high' ? 'destructive' : followUp.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-[9px] mt-0.5"
                    >
                      {followUp.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {followUp.reason}
                </p>
                <div className="flex justify-end gap-2 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Phone className="w-3 h-3 mr-1" />
                    {isMarathi ? 'कॉल करा' : 'Call'}
                  </Button>
                  <Button asChild size="sm" className="h-7 text-xs">
                    <Link to={`/worker/vitals/${followUp.id}`}>
                      {isMarathi ? 'भेट द्या' : 'Visit'}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Card */}
      {pendingCount > 0 && (
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Download className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 text-lg">
                  {isMarathi ? 'प्रलंबित डेटा सिंक' : 'Pending Data Sync'}
                </h3>
                <p className="text-sm text-indigo-700">
                  {pendingCount} {isMarathi ? 'रेकॉर्ड्स सर्व्हरवर अपलोड करायचे आहेत' : 'records waiting to sync'}
                </p>
                {!isOnline && (
                  <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    {isMarathi ? 'इंटरनेट उपलब्ध झाल्यावर आपोआप सिंक होईल' : 'Will auto-sync when online'}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {isMarathi ? 'सिंक होत आहे...' : 'Syncing...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {isMarathi ? 'आता सिंक करा' : 'Sync Now'}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Offline Data Info */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {isMarathi ? 'ऑफलाइन-प्रथम अॅप' : 'Offline-First App'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMarathi
                ? 'हे अॅप इंटरनेटशिवाय काम करते. सर्व डेटा तुमच्या फोनवर सेव्ह होतो आणि नंतर सिंक होतो.'
                : 'This app works without internet. All data is saved locally and synced when online.'}
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
      </Card>
    </div>
  )
}

export default WorkerDashboard
