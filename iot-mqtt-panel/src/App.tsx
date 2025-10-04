import './App.css'
import ConnectionForm from '@/components/ConnectionForm'
import LEDIndicator from '@/widgets/LEDIndicator'
import ButtonWidget from '@/widgets/ButtonWidget'
import GaugeWidget from '@/widgets/GaugeWidget'
import LineChartWidget from '@/widgets/LineChartWidget'
import TextLog from '@/widgets/TextLog'
import { useMqttStore } from '@/mqtt/MqttManager'
import { useEffect } from 'react'

function App() {
  const connections = useMqttStore((s) => s.connections)
  const connect = useMqttStore((s) => s.connect)
  const addConnection = useMqttStore((s) => s.addConnection)
  const defaultConnId = 'demo-mosquitto'
  const defaultBroker = (import.meta as any).env?.VITE_DEFAULT_BROKER_WS || 'wss://test.mosquitto.org:8081'

  useEffect(() => {
    // Seed a default demo connection and auto-connect
    if (!connections[defaultConnId]) {
      addConnection({
        id: defaultConnId,
        name: 'Mosquitto Demo',
        brokerUrl: defaultBroker,
        protocol: 'wss',
        clientId: `web-${Math.random().toString(16).slice(2)}`,
        keepAlive: 60,
        clean: true,
        autoReconnect: true,
      })
      connect(defaultConnId)
    }
  }, [connections])

  return (
    <div className="min-h-screen text-sm text-white bg-slate-950">
      <header className="p-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-semibold">IoT MQTT Panel</h1>
      </header>
      <main className="p-4 space-y-4">
        <ConnectionForm />
        <section>
          <h2 className="text-lg mb-2">Demo Dashboard (Mosquitto)</h2>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2">
              <LEDIndicator
                connectionId={defaultConnId}
                config={{
                  name: 'Ceiling Light',
                  topicSubscribe: 'home/livingroom/light1/state',
                  parseAsJson: false,
                  stateMap: [
                    { match: 'ON', icon: 'bulb', color: '#FFD700', label: 'On', ariaLabel: 'Light on', animation: { type: 'pulse', speed: 1.2 } },
                    { match: '1', icon: 'bulb', color: '#FFD700', label: 'On', ariaLabel: 'Light on', animation: { type: 'pulse', speed: 1.2 } },
                    { match: 'OFF', icon: 'bulb_off', color: '#FFFFFF', label: 'Off', ariaLabel: 'Light off', animation: { type: 'none' } },
                    { match: '0', icon: 'bulb_off', color: '#FFFFFF', label: 'Off', ariaLabel: 'Light off', animation: { type: 'none' } },
                  ],
                  defaultState: { icon: 'bulb_off', color: '#DDDDDD', label: 'Unknown', ariaLabel: 'Unknown state' },
                }}
              />
            </div>
            <div className="col-span-2 flex items-center">
              <ButtonWidget connectionId={defaultConnId} config={{ name: 'Toggle', topicPublish: 'home/livingroom/light1/set', valueTemplate: 'TOGGLE', qos: 0 }} />
            </div>
            <div className="col-span-4">
              <GaugeWidget connectionId={defaultConnId} config={{ name: 'Temperature', topicSubscribe: 'home/livingroom/temp', qos: 0 }} />
            </div>
            <div className="col-span-4">
              <LineChartWidget connectionId={defaultConnId} config={{ name: 'Temp Trend', topicSubscribe: 'home/livingroom/temp', qos: 0 }} />
            </div>
            <div className="col-span-12">
              <TextLog connectionId={defaultConnId} config={{ name: 'Log', topicSubscribe: 'home/+', qos: 0 }} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
