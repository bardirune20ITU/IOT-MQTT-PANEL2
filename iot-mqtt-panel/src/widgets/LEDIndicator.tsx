import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/icons/IconRegistry'
import type { WidgetCommonConfig } from '@/core/types'
import { animationToStyle, buildEvaluateOptionsFromConfig, evaluateState } from '@/utils/stateMap'
import { subscribeTopic, unsubscribeTopic, useMqttStore } from '@/mqtt/MqttManager'

export interface LEDIndicatorConfig extends WidgetCommonConfig {}

export default function LEDIndicator({ connectionId, config }: { connectionId: string; config: LEDIndicatorConfig }) {
  const [value, setValue] = useState<string>('')
  const state = useMemo(() => evaluateState(value, config.stateMap, buildEvaluateOptionsFromConfig(config)), [value, config])
  const onMessage = useMqttStore((s) => s.onMessage)

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

  return (
    <div className="flex flex-col items-center justify-center p-2" style={{ ['--icon-color' as any]: color, ...animationToStyle(anim) }}>
      <Icon name={state.visual.icon ?? 'circle'} className={
        anim?.type === 'pulse' ? 'w-10 h-10 animate-pulse' :
        anim?.type === 'blink' ? 'w-10 h-10 blink motion-reduce:animate-none' :
        anim?.type === 'spin' ? 'w-10 h-10 animate-spin' :
        'w-10 h-10'
      } />
      {config?.name && <div className="text-xs mt-1">{config.name}: {state.visual.label ?? ''}</div>}
    </div>
  )
}
