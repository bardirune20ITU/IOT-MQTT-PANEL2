import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetCommonConfig } from '@/core/types'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'

export interface ColorPickerWidgetConfig extends WidgetCommonConfig {
  format?: 'hex' | 'rgb' | 'hsv'
  showPreview?: boolean
  showInput?: boolean
  presetColors?: string[]
}

export default function ColorPickerWidget({ connectionId, config }: { connectionId: string; config: ColorPickerWidgetConfig }) {
  const [value, setValue] = useState<string>('#000000')
  const [currentColor, setCurrentColor] = useState<string>('#000000')
  const publish = useMqttStore((s) => s.publish)
  const onMessage = useMqttStore((s) => s.onMessage)

  const format = config.format || 'hex'
  const showPreview = config.showPreview !== false
  const showInput = config.showInput !== false
  const presetColors = config.presetColors || [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#000000',
    '#FFFFFF', '#808080', '#C0C0C0', '#FFD700'
  ]

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        try {
          const newValue = new TextDecoder().decode(payload)
          setValue(newValue)
          setCurrentColor(newValue)
        } catch {
          setValue('#000000')
        }
      }
    })
    return () => {
      off?.()
      if (config.topicSubscribe) unsubscribeTopic(connectionId, config.topicSubscribe)
    }
  }, [connectionId, config.topicSubscribe, config.qos])

  const handleColorChange = (color: string) => {
    setCurrentColor(color)
    
    if (config.topicPublish) {
      let publishValue = color
      
      if (config.valueTemplate) {
        publishValue = config.valueTemplate.replace('{{value}}', color)
      }
      
      publish(connectionId, config.topicPublish, publishValue, { 
        qos: config.qos ?? 0, 
        retain: !!config.retain 
      })
    }
  }

  const formatColor = (color: string) => {
    switch (format) {
      case 'rgb':
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        return `rgb(${r}, ${g}, ${b})`
      case 'hsv':
        // Simple hex to HSV conversion
        return color
      default:
        return color
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {config.name && (
        <h3 className="text-sm font-medium mb-3 text-center">{config.name}</h3>
      )}
      
      <div className="w-full max-w-48 space-y-4">
        {showPreview && (
          <motion.div
            className="w-full h-16 rounded-lg border-2 border-border shadow-sm"
            style={{ backgroundColor: currentColor }}
            animate={{ backgroundColor: currentColor }}
            transition={{ duration: 0.2 }}
          />
        )}
        
        {showInput && (
          <div className="space-y-2">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 border rounded-md cursor-pointer"
            />
            <div className="text-xs text-center text-muted-foreground">
              {formatColor(currentColor)}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-2">
          {presetColors.map((color) => (
            <motion.button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-md border-2 transition-all ${
                currentColor === color ? 'border-primary scale-110' : 'border-border hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
          Current: {value}
        </div>
      </div>
    </div>
  )
}