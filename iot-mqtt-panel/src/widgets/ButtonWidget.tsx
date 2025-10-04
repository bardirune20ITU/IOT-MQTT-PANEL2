import type { WidgetCommonConfig } from '@/core/types'
import { useMqttStore } from '@/mqtt/MqttManager'

export default function ButtonWidget({ connectionId, config }: { connectionId: string; config: WidgetCommonConfig }) {
  const publish = useMqttStore((s) => s.publish)
  function handleClick() {
    if (!config.topicPublish) return
    publish(connectionId, config.topicPublish, String(config.valueTemplate ?? 'ON'), { qos: config.qos ?? 0, retain: !!config.retain })
  }
  return (
    <button className="px-3 py-2 rounded bg-primary text-white" onClick={handleClick} aria-label={config.defaultState?.ariaLabel ?? config.name}>
      {config.name ?? 'Button'}
    </button>
  )
}
