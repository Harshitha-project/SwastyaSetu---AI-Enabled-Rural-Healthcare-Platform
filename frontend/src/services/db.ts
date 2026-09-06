/**
 * IndexedDB Database Service for SwasthyaSetu
 * Provides offline-first data storage with automatic sync
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Database schema definition
interface SwasthyaSetuDB extends DBSchema {
  // Pending sync queue for offline operations
  pendingSync: {
    key: string
    value: {
      id: string
      type: string
      action: 'create' | 'update' | 'delete'
      endpoint: string
      method: 'POST' | 'PUT' | 'DELETE'
      data: unknown
      timestamp: number
      retryCount: number
      lastError?: string
    }
    indexes: {
      byType: string
      byTimestamp: number
    }
  }

  // Cached patients for health workers
  patients: {
    key: string
    value: {
      id: string
      firstName: string
      lastName: string
      phone: string
      dateOfBirth: string
      gender: string
      village: string
      taluka: string
      district: string
      bloodGroup?: string
      allergies?: string[]
      chronicConditions?: string[]
      riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
      lastUpdated: number
      syncStatus: 'synced' | 'pending' | 'error'
    }
    indexes: {
      byVillage: string
      byRiskLevel: string
      bySyncStatus: string
    }
  }

  // Cached vitals records
  vitals: {
    key: string
    value: {
      id: string
      patientId: string
      bloodPressureSystolic: number
      bloodPressureDiastolic: number
      heartRate: number
      temperature: number
      oxygenSaturation: number
      weight?: number
      bloodGlucose?: number
      notes?: string
      recordedAt: number
      recordedBy: string
      syncStatus: 'synced' | 'pending' | 'error'
    }
    indexes: {
      byPatientId: string
      byRecordedAt: number
      bySyncStatus: string
    }
  }

  // Cached appointments
  appointments: {
    key: string
    value: {
      id: string
      patientId: string
      doctorId: string
      scheduledDate: string
      scheduledTime: string
      type: 'VIDEO' | 'IN_PERSON'
      status: string
      reason?: string
      lastUpdated: number
      syncStatus: 'synced' | 'pending' | 'error'
    }
    indexes: {
      byPatientId: string
      byDoctorId: string
      byDate: string
      bySyncStatus: string
    }
  }

  // Cached health articles for education
  articles: {
    key: string
    value: {
      id: string
      title: string
      titleMarathi?: string
      content: string
      contentMarathi?: string
      category: string
      imageUrl?: string
      publishedAt: number
      cachedAt: number
    }
    indexes: {
      byCategory: string
      byCachedAt: number
    }
  }

  // User preferences and settings
  settings: {
    key: string
    value: {
      key: string
      value: unknown
      updatedAt: number
    }
  }

  // Offline notifications queue
  notifications: {
    key: string
    value: {
      id: string
      title: string
      body: string
      type: 'appointment' | 'reminder' | 'alert' | 'sync'
      data?: Record<string, unknown>
      createdAt: number
      read: boolean
    }
    indexes: {
      byType: string
      byRead: number
    }
  }
}

const DB_NAME = 'swasthyasetu-db'
const DB_VERSION = 2

class DatabaseService {
  private db: IDBPDatabase<SwasthyaSetuDB> | null = null
  private initPromise: Promise<IDBPDatabase<SwasthyaSetuDB>> | null = null

  async init(): Promise<IDBPDatabase<SwasthyaSetuDB>> {
    if (this.db) return this.db

    if (this.initPromise) return this.initPromise

    this.initPromise = openDB<SwasthyaSetuDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`[DB] Upgrading from version ${oldVersion} to ${newVersion}`)

        // Pending sync store
        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id' })
          syncStore.createIndex('byType', 'type')
          syncStore.createIndex('byTimestamp', 'timestamp')
        }

        // Patients store
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' })
          patientStore.createIndex('byVillage', 'village')
          patientStore.createIndex('byRiskLevel', 'riskLevel')
          patientStore.createIndex('bySyncStatus', 'syncStatus')
        }

        // Vitals store
        if (!db.objectStoreNames.contains('vitals')) {
          const vitalsStore = db.createObjectStore('vitals', { keyPath: 'id' })
          vitalsStore.createIndex('byPatientId', 'patientId')
          vitalsStore.createIndex('byRecordedAt', 'recordedAt')
          vitalsStore.createIndex('bySyncStatus', 'syncStatus')
        }

        // Appointments store
        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id' })
          appointmentStore.createIndex('byPatientId', 'patientId')
          appointmentStore.createIndex('byDoctorId', 'doctorId')
          appointmentStore.createIndex('byDate', 'scheduledDate')
          appointmentStore.createIndex('bySyncStatus', 'syncStatus')
        }

        // Articles store
        if (!db.objectStoreNames.contains('articles')) {
          const articleStore = db.createObjectStore('articles', { keyPath: 'id' })
          articleStore.createIndex('byCategory', 'category')
          articleStore.createIndex('byCachedAt', 'cachedAt')
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }

        // Notifications store
        if (!db.objectStoreNames.contains('notifications')) {
          const notifStore = db.createObjectStore('notifications', { keyPath: 'id' })
          notifStore.createIndex('byType', 'type')
          notifStore.createIndex('byRead', 'read')
        }
      },
    })

    this.db = await this.initPromise
    console.log('[DB] Database initialized')
    return this.db
  }

  // ============ Pending Sync Operations ============

  async addPendingSync(item: Omit<SwasthyaSetuDB['pendingSync']['value'], 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const db = await this.init()
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    await db.put('pendingSync', {
      ...item,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    })

    return id
  }

  async getPendingSyncs(): Promise<SwasthyaSetuDB['pendingSync']['value'][]> {
    const db = await this.init()
    return db.getAllFromIndex('pendingSync', 'byTimestamp')
  }

  async getPendingSyncCount(): Promise<number> {
    const db = await this.init()
    return db.count('pendingSync')
  }

  async removePendingSync(id: string): Promise<void> {
    const db = await this.init()
    await db.delete('pendingSync', id)
  }

  async updatePendingSyncRetry(id: string, error: string): Promise<void> {
    const db = await this.init()
    const item = await db.get('pendingSync', id)
    if (item) {
      item.retryCount++
      item.lastError = error
      await db.put('pendingSync', item)
    }
  }

  async clearAllPendingSyncs(): Promise<void> {
    const db = await this.init()
    await db.clear('pendingSync')
  }

  // ============ Patient Operations ============

  async savePatient(patient: SwasthyaSetuDB['patients']['value']): Promise<void> {
    const db = await this.init()
    await db.put('patients', patient)
  }

  async getPatient(id: string): Promise<SwasthyaSetuDB['patients']['value'] | undefined> {
    const db = await this.init()
    return db.get('patients', id)
  }

  async getAllPatients(): Promise<SwasthyaSetuDB['patients']['value'][]> {
    const db = await this.init()
    return db.getAll('patients')
  }

  async getPatientsByVillage(village: string): Promise<SwasthyaSetuDB['patients']['value'][]> {
    const db = await this.init()
    return db.getAllFromIndex('patients', 'byVillage', village)
  }

  async getHighRiskPatients(): Promise<SwasthyaSetuDB['patients']['value'][]> {
    const db = await this.init()
    const high = await db.getAllFromIndex('patients', 'byRiskLevel', 'HIGH')
    const critical = await db.getAllFromIndex('patients', 'byRiskLevel', 'CRITICAL')
    return [...critical, ...high]
  }

  async searchPatients(query: string): Promise<SwasthyaSetuDB['patients']['value'][]> {
    const db = await this.init()
    const all = await db.getAll('patients')
    const lowerQuery = query.toLowerCase()
    return all.filter(p => 
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query) ||
      p.village.toLowerCase().includes(lowerQuery)
    )
  }

  // ============ Vitals Operations ============

  async saveVitals(vitals: SwasthyaSetuDB['vitals']['value']): Promise<void> {
    const db = await this.init()
    await db.put('vitals', vitals)
  }

  async getVitalsByPatient(patientId: string): Promise<SwasthyaSetuDB['vitals']['value'][]> {
    const db = await this.init()
    return db.getAllFromIndex('vitals', 'byPatientId', patientId)
  }

  async getLatestVitals(patientId: string): Promise<SwasthyaSetuDB['vitals']['value'] | undefined> {
    const db = await this.init()
    const vitals = await db.getAllFromIndex('vitals', 'byPatientId', patientId)
    return vitals.sort((a, b) => b.recordedAt - a.recordedAt)[0]
  }

  // ============ Appointment Operations ============

  async saveAppointment(appointment: SwasthyaSetuDB['appointments']['value']): Promise<void> {
    const db = await this.init()
    await db.put('appointments', appointment)
  }

  async getAppointmentsByPatient(patientId: string): Promise<SwasthyaSetuDB['appointments']['value'][]> {
    const db = await this.init()
    return db.getAllFromIndex('appointments', 'byPatientId', patientId)
  }

  async getAppointmentsByDate(date: string): Promise<SwasthyaSetuDB['appointments']['value'][]> {
    const db = await this.init()
    return db.getAllFromIndex('appointments', 'byDate', date)
  }

  // ============ Article Operations ============

  async saveArticle(article: SwasthyaSetuDB['articles']['value']): Promise<void> {
    const db = await this.init()
    await db.put('articles', article)
  }

  async getArticles(category?: string): Promise<SwasthyaSetuDB['articles']['value'][]> {
    const db = await this.init()
    if (category) {
      return db.getAllFromIndex('articles', 'byCategory', category)
    }
    return db.getAll('articles')
  }

  // ============ Settings Operations ============

  async setSetting(key: string, value: unknown): Promise<void> {
    const db = await this.init()
    await db.put('settings', { key, value, updatedAt: Date.now() })
  }

  async getSetting<T>(key: string): Promise<T | undefined> {
    const db = await this.init()
    const setting = await db.get('settings', key)
    return setting?.value as T | undefined
  }

  // ============ Notification Operations ============

  async addNotification(notification: Omit<SwasthyaSetuDB['notifications']['value'], 'id' | 'createdAt' | 'read'>): Promise<string> {
    const db = await this.init()
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    await db.put('notifications', {
      ...notification,
      id,
      createdAt: Date.now(),
      read: false,
    })

    return id
  }

  async getUnreadNotifications(): Promise<SwasthyaSetuDB['notifications']['value'][]> {
    const db = await this.init()
    return db.getAllFromIndex('notifications', 'byRead', 0)
  }

  async markNotificationRead(id: string): Promise<void> {
    const db = await this.init()
    const notification = await db.get('notifications', id)
    if (notification) {
      notification.read = true
      await db.put('notifications', notification)
    }
  }

  // ============ Utility Operations ============

  async clearAllData(): Promise<void> {
    const db = await this.init()
    await Promise.all([
      db.clear('pendingSync'),
      db.clear('patients'),
      db.clear('vitals'),
      db.clear('appointments'),
      db.clear('articles'),
      db.clear('settings'),
      db.clear('notifications'),
    ])
    console.log('[DB] All data cleared')
  }

  async getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      }
    }
    return null
  }
}

export const db = new DatabaseService()
export type { SwasthyaSetuDB }
