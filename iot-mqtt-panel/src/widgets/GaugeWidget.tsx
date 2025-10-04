import { useEffect, useState } from 'react'
import type { WidgetCommonConfig } from '@/core/types'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

export default function GaugeWidget({ connectionId, config }: { connectionId: string; config: WidgetCommonConfig }) {
  const [value, setValue] = useState<number>(0)
  const onMessage = useMqttStore((s) => s.onMessage)

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        const s = new TextDecoder().decode(payload)
        const n = Number(s)
        if (!Number.isNaN(n)) setValue(n)
      }
    })
    return () => {
      off?.()
      if (config.topicSubscribe) unsubscribeTopic(connectionId, config.topicSubscribe)
    }
  }, [connectionId, config.topicSubscribe, config.qos])

  const clamped = Math.max(0, Math.min(100, value))
  const data = [{ name: 'value', value: clamped, fill: '#22c55e' }]

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={12} data={data} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}
