import { useEffect, useState } from 'react'
import type { WidgetCommonConfig } from '@/core/types'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'
import { ResponsiveContainer, LineChart, Line, YAxis, XAxis, Tooltip } from 'recharts'

interface Point { t: number; v: number }

export default function LineChartWidget({ connectionId, config }: { connectionId: string; config: WidgetCommonConfig }) {
  const [points, setPoints] = useState<Point[]>([])
  const onMessage = useMqttStore((s) => s.onMessage)

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        const s = new TextDecoder().decode(payload)
        const n = Number(s)
        if (!Number.isNaN(n)) setPoints((prev) => [...prev.slice(-199), { t: Date.now(), v: n }])
      }
    })
    return () => {
      off?.()
      if (config.topicSubscribe) unsubscribeTopic(connectionId, config.topicSubscribe)
    }
  }, [connectionId, config.topicSubscribe, config.qos])

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points.map((p) => ({ x: p.t, y: p.v }))}>
          <XAxis dataKey="x" hide />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#60a5fa" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
