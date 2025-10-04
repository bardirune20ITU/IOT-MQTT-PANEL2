import React from 'react'
import {
  Lightbulb,
  LightbulbOff,
  Power,
  Fan,
  Gauge,
  Activity,
  Circle,
} from 'lucide-react'

export type IconKey =
  | 'bulb'
  | 'bulb_off'
  | 'power'
  | 'fan'
  | 'gauge'
  | 'activity'
  | 'circle'

export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>

export interface CustomIcon {
  key: string
  svg: string // raw svg markup
}

const builtin: Record<IconKey, IconComponent> = {
  bulb: Lightbulb,
  bulb_off: LightbulbOff,
  power: Power,
  fan: Fan,
  gauge: Gauge,
  activity: Activity,
  circle: Circle,
}

let customIcons = new Map<string, string>()

export function registerCustomIcon(key: string, svg: string) {
  customIcons.set(key, svg)
}

export function getIconKeys(): string[] {
  return [...Object.keys(builtin), ...customIcons.keys()]
}

export function Icon({ name, className }: { name: string; className?: string }) {
  if ((builtin as Record<string, IconComponent>)[name]) {
    const Cmp = (builtin as Record<string, IconComponent>)[name]
    return <Cmp className={className} style={{ color: 'var(--icon-color)' }} />
  }
  if (customIcons.has(name)) {
    // Render raw SVG safely
    const svg = customIcons.get(name)!
    return (
      <span
        className={className}
        style={{ display: 'inline-flex', color: 'var(--icon-color)' }}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
  const Fallback = builtin.circle
  return <Fallback className={className} style={{ color: 'var(--icon-color)' }} />
}
