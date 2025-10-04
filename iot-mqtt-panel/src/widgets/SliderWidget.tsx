import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetCommonConfig } from '@/core/types'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'

export interface SliderWidgetConfig extends WidgetCommonConfig {
  min?: number
  max?: number
  step?: number
  unit?: string
  publishOnChange?: boolean
}

export default function SliderWidget({ connectionId, config }: { connectionId: string; config: SliderWidgetConfig }) {
  const [value, setValue] = useState<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const publish = useMqttStore((s) => s.publish)
  const onMessage = useMqttStore((s) => s.onMessage)

  const min = config.min ?? 0
  const max = config.max ?? 100
  const step = config.step ?? 1
  const unit = config.unit ?? ''

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

  const handleSliderChange = (newValue: number) => {
    setValue(newValue)
    
    if (config.topicPublish && config.publishOnChange !== false) {
      let publishValue = String(newValue)
      
      if (config.valueTemplate) {
        publishValue = config.valueTemplate.replace('{{value}}', String(newValue))
      }
      
      publish(connectionId, config.topicPublish, publishValue, { 
        qos: config.qos ?? 0, 
        retain: !!config.retain 
      })
    }
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {config.name && (
        <h3 className="text-sm font-medium mb-3 text-center">{config.name}</h3>
      )}
      
      <div className="w-full max-w-48 space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {value.toFixed(step < 1 ? 1 : 0)}
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </div>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`
            }}
          />
          
          <motion.div
            className="absolute top-1/2 w-4 h-4 bg-primary rounded-full shadow-md pointer-events-none"
            style={{ left: `calc(${percentage}% - 8px)`, transform: 'translateY(-50%)' }}
            animate={{ scale: isDragging ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  )
}