import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetCommonConfig } from '@/core/types'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'
import { evaluateState, buildEvaluateOptionsFromConfig } from '@/utils/stateMap'

export interface SwitchWidgetConfig extends WidgetCommonConfig {
  onValue?: string
  offValue?: string
  publishOnChange?: boolean
}

export default function SwitchWidget({ connectionId, config }: { connectionId: string; config: SwitchWidgetConfig }) {
  const [value, setValue] = useState<string>('')
  const [isOn, setIsOn] = useState(false)
  const publish = useMqttStore((s) => s.publish)
  const onMessage = useMqttStore((s) => s.onMessage)

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        try {
          const newValue = new TextDecoder().decode(payload)
          setValue(newValue)
          
          // Determine if switch is on based on state mapping or simple values
          if (config.stateMap) {
            const state = evaluateState(newValue, config.stateMap, buildEvaluateOptionsFromConfig(config))
            setIsOn(state.visual.label?.toLowerCase().includes('on') || false)
          } else {
            const onValue = config.onValue || 'ON'
            const offValue = config.offValue || 'OFF'
            setIsOn(newValue === onValue || newValue === '1' || newValue === 'true')
          }
        } catch {
          setValue('')
        }
      }
    })
    return () => {
      off?.()
      if (config.topicSubscribe) unsubscribeTopic(connectionId, config.topicSubscribe)
    }
  }, [connectionId, config.topicSubscribe, config.qos])

  const handleToggle = () => {
    if (!config.topicPublish) return
    
    const newState = !isOn
    setIsOn(newState)
    
    let publishValue = newState ? (config.onValue || 'ON') : (config.offValue || 'OFF')
    
    // Use value template if provided
    if (config.valueTemplate) {
      publishValue = config.valueTemplate.replace('{{value}}', publishValue)
    }
    
    publish(connectionId, config.topicPublish, publishValue, { 
      qos: config.qos ?? 0, 
      retain: !!config.retain 
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {config.name && (
        <h3 className="text-sm font-medium mb-3 text-center">{config.name}</h3>
      )}
      
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={handleToggle}
          className={`relative w-16 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            isOn ? 'bg-primary' : 'bg-muted'
          }`}
          whileTap={{ scale: 0.95 }}
          aria-label={`Toggle ${config.name || 'switch'}`}
        >
          <motion.div
            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
            animate={{ x: isOn ? 32 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
        
        <div className="text-xs text-muted-foreground text-center">
          {isOn ? 'ON' : 'OFF'}
        </div>
        
        {value && (
          <div className="text-xs text-muted-foreground text-center">
            Value: {value}
          </div>
        )}
      </div>
    </div>
  )
}