import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useOffline } from '../../hooks/useOffline'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  Database,
  Smartphone,
  UploadCloud,
  HardDrive,
  FileCheck,
} from 'lucide-react'

interface PendingItem {
  id: string
  type: 'PATIENT_REGISTRATION' | 'VITALS_RECORDING' | 'REFERRAL'
  patientName: string
  timestamp: string
  details: string
  status: 'PENDING' | 'SYNCED'
}

const INITIAL_PENDING_ITEMS: PendingItem[] = [
  {
    id: 'sync-1',
    type: 'PATIENT_REGISTRATION',
    patientName: 'Sunita Tukaram Kadam',
    timestamp: 'Today, 11:20 AM',
    details: 'New ABHA patient registration from Shiroli hamlet (Offline)',
    status: 'PENDING',
  },
  {
    id: 'sync-2',
    type: 'VITALS_RECORDING',
    patientName: 'Suresh Gaikwad',
    timestamp: 'Today, 10:45 AM',
    details: 'BP: 168/102 mmHg, Pulse: 88, SpO2: 95% (High Risk flag)',
    status: 'PENDING',
  },
  {
    id: 'sync-3',
    type: 'REFERRAL',
    patientName: 'Kavita Pawar',
    timestamp: 'Today, 09:15 AM',
    details: 'Referred to Saswad Rural Hospital for antenatal sonography',
    status: 'PENDING',
  },
  {
    id: 'sync-4',
    type: 'VITALS_RECORDING',
    patientName: 'Meena Bhosle',
    timestamp: 'Yesterday, 04:30 PM',
    details: 'Pulse: 78, Glucose: 110 mg/dL, SpO2: 98% (Routine check)',
    status: 'PENDING',
  },
]

export default function PendingSync() {
  const { isOnline } = useOffline()
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(INITIAL_PENDING_ITEMS)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

  const pendingCount = pendingItems.filter(i => i.status === 'PENDING').length

  const handleSyncAll = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setPendingItems(prev => prev.map(i => ({ ...i, status: 'SYNCED' })))
      setIsSyncing(false)
      setSyncSuccess(true)
      setTimeout(() => setSyncSuccess(false), 4000)
    }, 1800)
  }

  const getTypeBadge = (type: PendingItem['type']) => {
    switch (type) {
      case 'PATIENT_REGISTRATION':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">New Registration</Badge>
      case 'VITALS_RECORDING':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Vitals & Screening</Badge>
      case 'REFERRAL':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Referral Request</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>🔄</span> Offline Data & Cloud Sync (ऑफलाइन डेटा समन्वय)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Store patient records locally in remote hamlets and sync to SwasthyaSetu cloud when connected
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={isSyncing || pendingCount === 0}
          className="bg-primary-600 hover:bg-primary-700 text-white gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing to Cloud...' : `Sync All (${pendingCount} Records)`}
        </Button>
      </div>

      {/* Network Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border ${isOnline ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isOnline ? <Cloud className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Connection State</p>
              <p className="text-lg font-bold text-gray-900">{isOnline ? 'Online (Connected)' : 'Offline (Field Mode)'}</p>
              <p className="text-xs text-gray-600">Local cache fully operational</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Pending Uploads</p>
              <p className="text-lg font-bold text-gray-900">{pendingCount} Records</p>
              <p className="text-xs text-gray-600">Queued in browser storage</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Offline Database</p>
              <p className="text-lg font-bold text-gray-900">4.2 MB Cached</p>
              <p className="text-xs text-gray-600">Encrypted AES-256 local store</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {syncSuccess && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <AlertTitle className="font-semibold">All Records Synced Successfully!</AlertTitle>
          <AlertDescription className="text-xs text-emerald-700">
            Records have been securely uploaded to the state health registry. Doctors and PHC dashboards can now view updated vitals.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Items Table / List */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Local Record Queue</CardTitle>
            <CardDescription className="text-xs">
              Actions taken in the field awaiting transmission
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pendingItems));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `swasthya_offline_backup_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="text-xs gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Export JSON Backup
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {pendingItems.map(item => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{item.patientName}</span>
                    {getTypeBadge(item.type)}
                    {item.status === 'SYNCED' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Synced
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                        Pending Sync
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{item.details}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{item.timestamp}</p>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPendingItems(prev =>
                          prev.map(i => (i.id === item.id ? { ...i, status: 'SYNCED' } : i))
                        )
                      }}
                      className="text-xs h-8 border-gray-200 text-primary-700 hover:bg-primary-50"
                    >
                      Sync Item
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
