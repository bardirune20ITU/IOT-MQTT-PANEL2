import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetCommonConfig } from '@/core/types'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'

export interface ProgressWidgetConfig extends WidgetCommonConfig {
  min?: number
  max?: number
  unit?: string
  showPercentage?: boolean
  showValue?: boolean
  color?: string
  animated?: boolean
}

export default function ProgressWidget({ connectionId, config }: { connectionId: string; config: ProgressWidgetConfig }) {
  const [value, setValue] = useState<number>(0)
  const onMessage = useMqttStore((s) => s.onMessage)

  const min = config.min ?? 0
  const max = config.max ?? 100
  const unit = config.unit ?? ''
  const showPercentage = config.showPercentage !== false
  const showValue = config.showValue !== false
  const animated = config.animated !== false
  const color = config.color || 'hsl(var(--primary))'

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        try {
          const newValue = parseFloat(new TextDecoder().decode(payload))
          if (!Number.isNaN(newValue)) {
            setValue(Math.max(min, Math.min(max, newValue)))
          }
        } catch {
          setValue(min)
        }
      }
    })
    return () => {
      off?.()
      if (config.topicSubscribe) unsubscribeTopic(connectionId, config.topicSubscribe)
    }
  }, [connectionId, config.topicSubscribe, config.qos, min, max])

  const percentage = ((value - min) / (max - min)) * 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {config.name && (
        <h3 className="text-sm font-medium mb-3 text-center">{config.name}</h3>
      )}
      
      <div className="w-full max-w-48 space-y-3">
        <div className="text-center">
          {showValue && (
            <div className="text-xl font-bold text-primary mb-1">
              {value.toFixed(1)}{unit}
            </div>
          )}
          {showPercentage && (
            <div className="text-sm text-muted-foreground">
              {clampedPercentage.toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${clampedPercentage}%` }}
            transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
          />
          
          {/* Animated shimmer effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  )
}