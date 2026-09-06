import { openDB, type IDBPDatabase } from 'idb'
import api from './api'

const DB_NAME = 'swasthyasetu_offline'
const DB_VERSION = 1
const STORE_NAME = 'pending_sync'

interface PendingItem {
  id: string
  type: string
  data: unknown
  timestamp: number
  endpoint?: string
  method?: 'POST' | 'PUT' | 'DELETE'
}

interface SwasthyaSetuDB {
  pending_sync: {
    key: string
    value: PendingItem
    indexes: { byType: string; byTimestamp: number }
  }
}

class OfflineService {
  private db: IDBPDatabase<SwasthyaSetuDB> | null = null

  async initDB(): Promise<IDBPDatabase<SwasthyaSetuDB>> {
    if (this.db) return this.db

    this.db = await openDB<SwasthyaSetuDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('byType', 'type')
          store.createIndex('byTimestamp', 'timestamp')
        }
      },
    })

    return this.db
  }

  async addPendingItem(type: string, data: unknown, endpoint?: string, method?: 'POST' | 'PUT' | 'DELETE'): Promise<string> {
    const db = await this.initDB()
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const item: PendingItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      endpoint,
      method,
    }

    await db.put(STORE_NAME, item)
    return id
  }

  async getPendingItems(): Promise<PendingItem[]> {
    const db = await this.initDB()
    return db.getAllFromIndex(STORE_NAME, 'byTimestamp')
  }

  async getPendingItemsByType(type: string): Promise<PendingItem[]> {
    const db = await this.initDB()
    return db.getAllFromIndex(STORE_NAME, 'byType', type)
  }

  async removePendingItem(id: string): Promise<void> {
    const db = await this.initDB()
    await db.delete(STORE_NAME, id)
  }

  async syncItem(item: PendingItem): Promise<boolean> {
    if (!item.endpoint || !item.method) {
      console.warn('Item missing endpoint or method, skipping:', item.id)
      return false
    }

    try {
      switch (item.method) {
        case 'POST':
          await api.post(item.endpoint, item.data)
          break
        case 'PUT':
          await api.put(item.endpoint, item.data)
          break
        case 'DELETE':
          await api.delete(item.endpoint)
          break
      }
      
      await this.removePendingItem(item.id)
      return true
    } catch (error) {
      console.error('Failed to sync item:', item.id, error)
      return false
    }
  }

  async syncAll(): Promise<{ success: number; failed: number }> {
    const items = await this.getPendingItems()
    let success = 0
    let failed = 0

    for (const item of items) {
      const result = await this.syncItem(item)
      if (result) {
        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  }

  async clearAll(): Promise<void> {
    const db = await this.initDB()
    await db.clear(STORE_NAME)
  }

  async getPendingCount(): Promise<number> {
    const db = await this.initDB()
    return db.count(STORE_NAME)
  }

  // Specific offline operations for healthcare worker
  async savePatientOffline(patientData: unknown): Promise<string> {
    return this.addPendingItem('PATIENT_REGISTRATION', patientData, '/health-workers/register-patient', 'POST')
  }

  async saveVitalsOffline(patientId: string, vitalsData: unknown): Promise<string> {
    return this.addPendingItem('VITALS_ENTRY', vitalsData, `/health/vitals/${patientId}`, 'POST')
  }

  async saveScreeningOffline(screeningData: unknown): Promise<string> {
    return this.addPendingItem('SCREENING', screeningData, '/health-workers/screening', 'POST')
  }
}

export const offlineService = new OfflineService()
