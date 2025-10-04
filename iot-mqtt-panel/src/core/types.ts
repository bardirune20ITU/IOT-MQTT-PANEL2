export type MqttProtocol = 'ws' | 'wss'

export interface LastWillConfig {
  topic: string
  payload: string
  qos?: 0 | 1 | 2
  retain?: boolean
}

export interface ConnectionConfig {
  id: string
  name: string
  brokerUrl: string // e.g., wss://test.mosquitto.org:8081
  protocol: MqttProtocol
  clientId?: string
  username?: string
  password?: string // encrypted or plaintext depending on settings
  keepAlive?: number
  clean?: boolean
  lastWill?: LastWillConfig
  autoReconnect?: boolean
  backoffInitialMs?: number
  backoffMaxMs?: number
  tlsOptions?: {
    rejectUnauthorized?: boolean
  }
  savePassword?: boolean
  encryptWithPassphrase?: boolean
}

export type AnimationType = 'none' | 'pulse' | 'blink' | 'spin'

export interface AnimationSpec {
  type: AnimationType
  speed?: number
}

export interface StateRule {
  match: string | number | { regex: string; flags?: string }
  icon?: string
  color?: string
  label?: string
  ariaLabel?: string
  animation?: AnimationSpec
  brightness?: number
  tooltip?: string
}

export interface VisualState {
  icon?: string
  color?: string
  label?: string
  ariaLabel?: string
  animation?: AnimationSpec
}

export interface WidgetCommonConfig {
  name?: string
  topicSubscribe?: string
  topicPublish?: string
  qos?: 0 | 1 | 2
  retain?: boolean
  parseAsJson?: boolean
  jsonPath?: string
  minRateMs?: number
  valueTemplate?: string // mustache template
  valueTransformJs?: string // executed in sandbox if enabled
  sandboxEnabled?: boolean
  stateMap?: StateRule[]
  defaultState?: VisualState
}

export type PanelType =
  | 'button'
  | 'switch'
  | 'slider'
  | 'text_input'
  | 'text_log'
  | 'node_status'
  | 'combo_box'
  | 'radio_buttons'
  | 'led_indicator'
  | 'multi_state_indicator'
  | 'progress'
  | 'gauge'
  | 'color_picker'
  | 'date_time_picker'
  | 'line_graph'
  | 'bar_graph'
  | 'chart'
  | 'image'
  | 'barcode_scanner'
  | 'uri_launcher'
  | 'layout_decorator'

export interface PanelInstanceBase<TConfig extends WidgetCommonConfig = WidgetCommonConfig> {
  id: string
  type: PanelType
  x: number
  y: number
  w: number
  h: number
  config: TConfig
}

export interface DashboardLayout {
  cols: number
  rows: number
}

export interface Dashboard {
  id: string
  connectionId: string
  name: string
  layout: DashboardLayout
  panels: PanelInstanceBase[]
}

export interface ExportBundleV1 {
  version: '1.0'
  connections: Array<{
    id: string
    name: string
    broker: string
    port?: number
    protocol: MqttProtocol
    clientId?: string
    username?: string
    password?: string
    keepAlive?: number
    clean?: boolean
    lastWill?: LastWillConfig
  }>
  dashboards: Dashboard[]
}
