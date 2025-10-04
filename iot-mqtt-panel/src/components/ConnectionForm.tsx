import { useState } from 'react'
import { useMqttStore } from '@/mqtt/MqttManager'
import { saveConnection } from '@/utils/idb'
import type { ConnectionConfig } from '@/core/types'

export default function ConnectionForm() {
  const addConnection = useMqttStore((s) => s.addConnection)
  const connect = useMqttStore((s) => s.connect)
  const defaultBroker = (import.meta as any).env?.VITE_DEFAULT_BROKER_WS || 'wss://test.mosquitto.org:8081'
  const [cfg, setCfg] = useState<ConnectionConfig>({
    id: crypto.randomUUID(),
    name: 'Public Mosquitto',
    brokerUrl: defaultBroker,
    protocol: 'wss',
    clientId: `web-${Math.random().toString(16).slice(2)}`,
    keepAlive: 60,
    clean: true,
    autoReconnect: true,
  })
  const [status, setStatus] = useState<string>('')

  async function handleTest() {
    addConnection(cfg)
    setStatus('Connecting...')
    await connect(cfg.id)
    setStatus('Connect initiated. Watch status in header.')
  }

  async function handleSave() {
    await saveConnection(cfg)
    addConnection(cfg)
    setStatus('Saved locally.')
  }

  return (
    <div className="space-y-2 p-4 border rounded-md">
      <h2 className="text-lg font-semibold">Add Connection</h2>
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-1">
          <span className="block text-sm">Name</span>
          <input className="w-full border p-2 rounded" value={cfg.name}
            onChange={(e) => setCfg({ ...cfg, name: e.target.value })} />
        </label>
        <label className="col-span-1">
          <span className="block text-sm">Broker URL (ws/wss)</span>
          <input className="w-full border p-2 rounded" value={cfg.brokerUrl}
            onChange={(e) => setCfg({ ...cfg, brokerUrl: e.target.value })} />
        </label>
        <label className="col-span-1">
          <span className="block text-sm">Client ID</span>
          <input className="w-full border p-2 rounded" value={cfg.clientId}
            onChange={(e) => setCfg({ ...cfg, clientId: e.target.value })} />
        </label>
        <label className="col-span-1">
          <span className="block text-sm">Username</span>
          <input className="w-full border p-2 rounded" value={cfg.username ?? ''}
            onChange={(e) => setCfg({ ...cfg, username: e.target.value })} />
        </label>
        <label className="col-span-1">
          <span className="block text-sm">Password</span>
          <input type="password" className="w-full border p-2 rounded" value={cfg.password ?? ''}
            onChange={(e) => setCfg({ ...cfg, password: e.target.value })} />
        </label>
        <label className="col-span-1">
          <span className="block text-sm">KeepAlive</span>
          <input type="number" className="w-full border p-2 rounded" value={cfg.keepAlive ?? 60}
            onChange={(e) => setCfg({ ...cfg, keepAlive: Number(e.target.value) })} />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded bg-primary text-white" onClick={handleTest}>Test Connect</button>
        <button className="px-3 py-1 rounded border" onClick={handleSave}>Save</button>
        <span className="text-sm opacity-70">{status}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Use ws:// or wss:// brokers. For raw TCP, see bridge docs.
      </p>
    </div>
  )
}
