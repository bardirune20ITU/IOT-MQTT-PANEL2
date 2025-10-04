import mqtt from 'mqtt'
import type { MqttClient, IClientOptions, IClientPublishOptions } from 'mqtt'
import { create } from 'zustand'
import type { ConnectionConfig } from '@/core/types'

interface ConnectionState {
  id: string
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  lastMessageTs?: number
  error?: string
}

interface MqttStore {
  connections: Record<string, { config: ConnectionConfig; client?: MqttClient; state: ConnectionState }>
  subscribeHandlers: Record<string, (topic: string, payload: Uint8Array) => void>
  addConnection: (cfg: ConnectionConfig) => void
  connect: (id: string) => Promise<void>
  disconnect: (id: string) => void
  publish: (id: string, topic: string, payload: string, options?: IClientPublishOptions) => void
  onMessage: (id: string, handler: (topic: string, payload: Uint8Array) => void) => () => void
}

export const useMqttStore = create<MqttStore>((set, get) => ({
  connections: {},
  subscribeHandlers: {},
  addConnection: (cfg: ConnectionConfig) =>
    set((s: MqttStore) => ({
      connections: {
        ...s.connections,
        [cfg.id]: { config: cfg, state: { id: cfg.id, status: 'disconnected' } },
      },
    })),
  connect: async (id: string) => {
    const entry = get().connections[id]
    if (!entry) return
    set((s: MqttStore) => ({
      connections: {
        ...s.connections,
        [id]: { ...entry, state: { ...entry.state, status: 'connecting', error: undefined } },
      },
    }))

    const url = entry.config.brokerUrl
    const options: IClientOptions = {
      clientId: entry.config.clientId,
      username: entry.config.username,
      password: entry.config.password,
      keepalive: entry.config.keepAlive,
      clean: entry.config.clean ?? true,
      rejectUnauthorized: entry.config.tlsOptions?.rejectUnauthorized,
      reconnectPeriod: entry.config.autoReconnect === false ? 0 : undefined,
    }

    try {
      const client = mqtt.connect(url, options) as MqttClient
      client.on('connect', () => {
        set((s: MqttStore) => ({
          connections: {
            ...s.connections,
            [id]: { ...s.connections[id], client, state: { id, status: 'connected' } },
          },
        }))
      })
      client.on('reconnect', () => {
        set((s: MqttStore) => ({
          connections: {
            ...s.connections,
            [id]: { ...s.connections[id], client, state: { id, status: 'connecting' } },
          },
        }))
      })
      client.on('error', (err) => {
        set((s: MqttStore) => ({
          connections: {
            ...s.connections,
            [id]: { ...s.connections[id], client, state: { id, status: 'error', error: String(err) } },
          },
        }))
      })
      client.on('message', (topic, payload) => {
        const handler = get().subscribeHandlers[id]
        set((s: MqttStore) => ({
          connections: {
            ...s.connections,
            [id]: { ...s.connections[id], state: { ...s.connections[id].state, lastMessageTs: Date.now() } },
          },
        }))
        handler?.(topic, payload)
      })

      set((s: MqttStore) => ({
        connections: {
          ...s.connections,
          [id]: { ...s.connections[id], client },
        },
      }))
    } catch (e) {
      set((s: MqttStore) => ({
        connections: {
          ...s.connections,
          [id]: { ...s.connections[id], state: { id, status: 'error', error: String(e) } },
        },
      }))
    }
  },
  disconnect: (id: string) => {
    const entry = get().connections[id]
    if (entry?.client) {
      entry.client.end(true)
    }
    set((s: MqttStore) => ({
      connections: { ...s.connections, [id]: { ...entry, client: undefined, state: { id, status: 'disconnected' } } },
    }))
  },
  publish: (id: string, topic: string, payload: string, options?: IClientPublishOptions) => {
    const entry = get().connections[id]
    entry?.client?.publish(topic, payload, options)
  },
  onMessage: (id: string, handler: (topic: string, payload: Uint8Array) => void) => {
    const entry = get().connections[id]
    if (!entry?.client) {
      // attach temporarily until connect
      get().subscribeHandlers[id] = handler
      return () => delete get().subscribeHandlers[id]
    }
    get().subscribeHandlers[id] = handler
    return () => delete get().subscribeHandlers[id]
  },
}))

export function subscribeTopic(connectionId: string, topic: string, qos: 0 | 1 | 2 = 0) {
  const { connections } = useMqttStore.getState()
  const entry = connections[connectionId]
  entry?.client?.subscribe(topic, { qos })
}

export function unsubscribeTopic(connectionId: string, topic: string) {
  const { connections } = useMqttStore.getState()
  const entry = connections[connectionId]
  entry?.client?.unsubscribe(topic)
}
