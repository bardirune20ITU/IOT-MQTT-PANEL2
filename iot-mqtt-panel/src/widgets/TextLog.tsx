import { useEffect, useState } from 'react'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'
import type { WidgetCommonConfig } from '@/core/types'

export default function TextLog({ connectionId, config }: { connectionId: string; config: WidgetCommonConfig }) {
  const [lines, setLines] = useState<string[]>([])
  const onMessage = useMqttStore((s) => s.onMessage)

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        try {
          const s = new TextDecoder().decode(payload)
          setLines((prev) => [...prev.slice(-99), s])
        } catch {}
      }
    })
    return () => {
      off?.()
      if (config.topicSubscribe) unsubscribeTopic(connectionId, config.topicSubscribe)
    }
  }, [connectionId, config.topicSubscribe, config.qos])

  return (
    <div className="p-2 border rounded h-48 overflow-auto text-xs font-mono bg-black/50 text-green-400">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  )
}
