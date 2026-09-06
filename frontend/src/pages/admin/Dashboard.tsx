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
  UserCheck,
  Building2,
  Stethoscope,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
  Database,
  Wifi,
  WifiOff,
  Bell,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Zap,
  ArrowRight,
  Video,
  MessageSquare,
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

// Real-time stats interface
interface SystemStats {
  totalPatients: number
  totalDoctors: number
  totalHealthWorkers: number
  totalFacilities: number
  activeConsultations: number
  pendingSyncs: number
  highRiskAlerts: number
  todayAppointments: number
}

interface RealtimeActivity {
  id: string
  type: 'registration' | 'appointment' | 'alert' | 'sync' | 'consultation' | 'vitals'
  message: string
  timestamp: Date
  severity?: 'info' | 'warning' | 'critical'
  district?: string
}

interface SystemHealth {
  api: 'operational' | 'degraded' | 'down'
  database: 'operational' | 'degraded' | 'down'
  aiService: 'operational' | 'degraded' | 'down'
  smsGateway: 'operational' | 'degraded' | 'down'
  webrtc: 'operational' | 'degraded' | 'down'
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isOnline, pendingCount, syncAll } = useOffline()

  const [stats, setStats] = useState<SystemStats>({
    totalPatients: 2456,
    totalDoctors: 48,
    totalHealthWorkers: 124,
    totalFacilities: 26,
    activeConsultations: 3,
    pendingSyncs: pendingCount,
    highRiskAlerts: 7,
    todayAppointments: 34,
  })

  const [activities, setActivities] = useState<RealtimeActivity[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: 'operational',
    database: 'operational',
    aiService: 'operational',
    smsGateway: 'degraded',
    webrtc: 'operational',
  })

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // District data for analytics
  const districtData = [
    { name: 'Pune', patients: 456, facilities: 6, workers: 28, growth: 12 },
    { name: 'Nashik', patients: 312, facilities: 4, workers: 18, growth: 8 },
    { name: 'Nagpur', patients: 289, facilities: 5, workers: 22, growth: -3 },
    { name: 'Aurangabad', patients: 245, facilities: 3, workers: 15, growth: 5 },
    { name: 'Kolhapur', patients: 198, facilities: 3, workers: 12, growth: 15 },
  ]

  // Connect to real-time updates
  useEffect(() => {
    if (!isOnline) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('[Admin] Connected to real-time updates')
      newSocket.emit('admin-subscribe')
    })

    // Listen for real-time stats updates
    newSocket.on('stats-update', (newStats: Partial<SystemStats>) => {
      setStats(prev => ({ ...prev, ...newStats }))
      setLastUpdated(new Date())
    })

    // Listen for real-time activity
    newSocket.on('activity', (activity: RealtimeActivity) => {
      setActivities(prev => [activity, ...prev].slice(0, 10))
    })

    // Listen for system health updates
    newSocket.on('system-health', (health: SystemHealth) => {
      setSystemHealth(health)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isOnline])

  // Simulate real-time activity for demo
  useEffect(() => {
    const activities: RealtimeActivity[] = [
      { id: '1', type: 'registration', message: 'New patient registered: Ramesh Patil from Shirur', timestamp: new Date(Date.now() - 300000), district: 'Pune' },
      { id: '2', type: 'consultation', message: 'Dr. Rajesh Kulkarni started teleconsultation with patient', timestamp: new Date(Date.now() - 600000), severity: 'info' },
      { id: '3', type: 'alert', message: 'High-risk alert: 3 patients flagged in Nashik district', timestamp: new Date(Date.now() - 1200000), severity: 'critical', district: 'Nashik' },
      { id: '4', type: 'sync', message: 'Health worker Sunil synced 15 offline records', timestamp: new Date(Date.now() - 1800000), district: 'Pune' },
      { id: '5', type: 'vitals', message: 'Vitals recorded for 8 patients in Kolhapur', timestamp: new Date(Date.now() - 2400000), district: 'Kolhapur' },
      { id: '6', type: 'appointment', message: '12 new appointments scheduled for tomorrow', timestamp: new Date(Date.now() - 3600000) },
    ]
    setActivities(activities)
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncAll()
    } finally {
      setIsSyncing(false)
    }
  }

  const getActivityIcon = (type: RealtimeActivity['type']) => {
    switch (type) {
      case 'registration': return <UserCheck className="w-4 h-4" />
      case 'appointment': return <Calendar className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'sync': return <RefreshCw className="w-4 h-4" />
      case 'consultation': return <Video className="w-4 h-4" />
      case 'vitals': return <Activity className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: RealtimeActivity['type'], severity?: string) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600'
    if (severity === 'warning') return 'bg-yellow-100 text-yellow-600'
    switch (type) {
      case 'registration': return 'bg-green-100 text-green-600'
      case 'appointment': return 'bg-blue-100 text-blue-600'
      case 'alert': return 'bg-red-100 text-red-600'
      case 'sync': return 'bg-purple-100 text-purple-600'
      case 'consultation': return 'bg-indigo-100 text-indigo-600'
      case 'vitals': return 'bg-teal-100 text-teal-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'down': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Offline Banner */}
      {!isOnline && (
        <Alert className="bg-amber-50 border-amber-300 text-amber-900">
          <WifiOff className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold">Offline Mode</AlertTitle>
          <AlertDescription>
            You're viewing cached data. Some features may be limited. Data will sync when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Admin Dashboard
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs">
                  {isOnline ? 'Live' : 'Offline'}
                </Badge>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                SwasthyaSetu Platform Overview • Government of Maharashtra
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
            <Button asChild className="bg-white text-slate-800 hover:bg-slate-100 font-semibold shadow-sm">
              <Link to="/admin/analytics">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* High Risk Alert Banner */}
      {stats.highRiskAlerts > 0 && (
        <Alert className="bg-rose-50 border-rose-300 text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <div className="flex-1">
            <AlertTitle className="font-bold flex items-center gap-2">
              High-Risk Patient Alerts
              <Badge variant="destructive" className="text-[10px]">
                {stats.highRiskAlerts} Alerts
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-xs mt-1">
              AI triage has flagged patients requiring immediate attention across multiple districts.
            </AlertDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="text-rose-700 border-rose-300">
            <Link to="/admin/patients?risk=HIGH">View Patients</Link>
          </Button>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: stats.totalPatients.toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50', change: '+12%', trend: 'up' },
          { label: 'Active Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-emerald-600 bg-emerald-50', change: '+3', trend: 'up' },
          { label: 'Health Workers', value: stats.totalHealthWorkers, icon: UserCheck, color: 'text-purple-600 bg-purple-50', change: '+8', trend: 'up' },
          { label: 'Facilities', value: stats.totalFacilities, icon: Building2, color: 'text-orange-600 bg-orange-50', change: '0', trend: 'neutral' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 border-border/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : stat.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      ) : null}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Consultations', value: stats.activeConsultations, icon: Video, color: 'text-indigo-600 bg-indigo-50', live: true },
          { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'text-teal-600 bg-teal-50' },
          { label: 'High Risk Alerts', value: stats.highRiskAlerts, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50', urgent: true },
          { label: 'Pending Syncs', value: pendingCount, icon: RefreshCw, color: 'text-amber-600 bg-amber-50' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 border-border/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    {stat.live && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    )}
                    {stat.urgent && stat.value > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px]">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Patients', icon: Users, path: '/admin/patients', color: 'bg-blue-500' },
          { label: 'Manage Doctors', icon: Stethoscope, path: '/admin/doctors', color: 'bg-emerald-500' },
          { label: 'Manage Facilities', icon: Building2, path: '/admin/facilities', color: 'bg-purple-500' },
          { label: 'System Settings', icon: Settings, path: '/admin/settings', color: 'bg-slate-500' },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <Link key={i} to={action.path}>
              <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group border-border/80">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-medium text-foreground">{action.label}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* District Distribution */}
        <div className="lg:col-span-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">District-wise Distribution</CardTitle>
                  <CardDescription className="text-xs">Healthcare coverage across Maharashtra</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                  <Link to="/admin/analytics">
                    View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {districtData.map((district, index) => (
                <div key={index} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{district.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {district.facilities} facilities • {district.workers} workers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{district.patients.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-1">
                        {district.growth > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : district.growth < 0 ? (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        ) : null}
                        <span className={`text-xs ${district.growth > 0 ? 'text-green-600' : district.growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {district.growth > 0 ? '+' : ''}{district.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Progress value={(district.patients / 500) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity Feed */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Live Activity
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Real-time
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  activity.severity === 'critical' ? 'bg-red-50' : 'bg-muted/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getActivityColor(activity.type, activity.severity)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                    {activity.district && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {activity.district}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Backend API', status: systemHealth.api, icon: Server },
              { name: 'Database', status: systemHealth.database, icon: Database },
              { name: 'AI Service', status: systemHealth.aiService, icon: Activity },
              { name: 'SMS Gateway', status: systemHealth.smsGateway, icon: MessageSquare },
              { name: 'WebRTC', status: systemHealth.webrtc, icon: Video },
            ].map((service, i) => {
              const Icon = service.icon
              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl text-center ${
                    service.status === 'operational' ? 'bg-green-50' :
                    service.status === 'degraded' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${getHealthColor(service.status)}`}>
                    {service.status === 'operational' ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : service.status === 'degraded' ? (
                      <Clock className="w-5 h-5 text-white" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <p className={`font-medium text-sm ${
                    service.status === 'operational' ? 'text-green-800' :
                    service.status === 'degraded' ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {service.name}
                  </p>
                  <p className={`text-xs capitalize ${
                    service.status === 'operational' ? 'text-green-600' :
                    service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {service.status}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
