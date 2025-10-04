import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/icons/IconRegistry'
import type { WidgetCommonConfig } from '@/core/types'
import { animationToStyle, buildEvaluateOptionsFromConfig, evaluateState } from '@/utils/stateMap'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'

export interface MultiStateIndicatorConfig extends WidgetCommonConfig {
  layout?: 'horizontal' | 'vertical' | 'grid'
  showLabels?: boolean
  showValues?: boolean
  compact?: boolean
}

export default function MultiStateIndicator({ connectionId, config }: { connectionId: string; config: MultiStateIndicatorConfig }) {
  const [value, setValue] = useState<string>('')
  const state = useMemo(() => evaluateState(value, config.stateMap, buildEvaluateOptionsFromConfig(config)), [value, config])
  const onMessage = useMqttStore((s) => s.onMessage)

  const layout = config.layout || 'horizontal'
  const showLabels = config.showLabels !== false
  const showValues = config.showValues !== false
  const compact = config.compact || false

  useEffect(() => {
    if (!config.topicSubscribe) return
    subscribeTopic(connectionId, config.topicSubscribe, config.qos ?? 0)
    const off = onMessage(connectionId, (topic: string, payload: Uint8Array) => {
      if (topic === config.topicSubscribe) {
        try {
          setValue(new TextDecoder().decode(payload))
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

  const color = state.visual.color ?? '#ffffff'
  const anim = state.visual.animation

  const containerClass = {
    horizontal: 'flex-row items-center gap-3',
    vertical: 'flex-col items-center gap-2',
    grid: 'grid grid-cols-2 gap-2',
  }[layout]

  const iconSize = compact ? 'w-6 h-6' : 'w-8 h-8'
  const textSize = compact ? 'text-xs' : 'text-sm'

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {config.name && !compact && (
        <h3 className="text-sm font-medium mb-3 text-center">{config.name}</h3>
      )}
      
      <div className={`flex ${containerClass} ${compact ? 'p-2' : 'p-3'}`}>
        <motion.div
          className="flex items-center justify-center"
          style={{ ['--icon-color' as any]: color, ...animationToStyle(anim) }}
          animate={{ scale: anim?.type === 'pulse' ? [1, 1.1, 1] : 1 }}
          transition={{ duration: anim?.speed || 1, repeat: anim?.type === 'pulse' ? Infinity : 0 }}
        >
          <Icon 
            name={state.visual.icon ?? 'circle'} 
            className={`${iconSize} ${
              anim?.type === 'blink' ? 'animate-pulse' :
              anim?.type === 'spin' ? 'animate-spin' :
              ''
            }`} 
          />
        </motion.div>
        
        <div className={`${textSize} text-center`}>
          {showLabels && (
            <div className="font-medium text-foreground">
              {state.visual.label || 'Unknown'}
            </div>
          )}
          {showValues && (
            <div className="text-muted-foreground">
              {value || 'No data'}
            </div>
          )}
          {config.name && compact && (
            <div className="text-xs text-muted-foreground mt-1">
              {config.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}