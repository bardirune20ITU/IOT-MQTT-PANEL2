import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

interface IoTPanelDB extends DBSchema {
  connections: {
    key: string
    value: any
  }
  dashboards: {
    key: string
    value: any
  }
  icons: {
    key: string
    value: { key: string; svg: string }
  }
  settings: {
    key: string
    value: any
  }
  timeseries: {
    key: string // `${connectionId}|${topic}`
    value: { key: string; samples: Array<{ t: number; v: any }> }
  }
}

let dbPromise: Promise<IDBPDatabase<IoTPanelDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<IoTPanelDB>('iot-mqtt-panel', 1, {
      upgrade(db) {
        db.createObjectStore('connections')
        db.createObjectStore('dashboards')
        db.createObjectStore('icons')
        db.createObjectStore('settings')
        db.createObjectStore('timeseries')
      },
    })
  }
  return dbPromise
}

export async function saveConnection(conn: any) {
  const db = await getDB()
  await db.put('connections', conn, conn.id)
}

export async function loadConnections() {
  const db = await getDB()
  const tx = db.transaction('connections')
  const keys = await tx.store.getAllKeys()
  const values = await Promise.all(keys.map((k) => tx.store.get(k as string)))
  return values.filter(Boolean)
}

export async function saveDashboard(dash: any) {
  const db = await getDB()
  await db.put('dashboards', dash, dash.id)
}

export async function loadDashboards() {
  const db = await getDB()
  const tx = db.transaction('dashboards')
  const keys = await tx.store.getAllKeys()
  const values = await Promise.all(keys.map((k) => tx.store.get(k as string)))
  return values.filter(Boolean)
}

export async function saveIcon(key: string, svg: string) {
  const db = await getDB()
  await db.put('icons', { key, svg }, key)
}

export async function loadIcons() {
  const db = await getDB()
  const tx = db.transaction('icons')
  const keys = await tx.store.getAllKeys()
  const values = await Promise.all(keys.map((k) => tx.store.get(k as string)))
  return values.filter(Boolean) as Array<{ key: string; svg: string }>
}

export async function appendTimeseriesSamples(key: string, samples: Array<{ t: number; v: any }>, maxSamples = 5000) {
  const db = await getDB()
  const existing = (await db.get('timeseries', key)) ?? { key, samples: [] }
  existing.samples.push(...samples)
  if (existing.samples.length > maxSamples) {
    existing.samples.splice(0, existing.samples.length - maxSamples)
  }
  await db.put('timeseries', existing, key)
}

export async function getTimeseries(key: string) {
  const db = await getDB()
  return (await db.get('timeseries', key)) ?? { key, samples: [] }
}
