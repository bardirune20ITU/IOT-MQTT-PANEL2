import './App.css'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConnectionForm from '@/components/ConnectionForm'
import Dashboard from '@/components/Dashboard'
import DashboardManager from '@/components/DashboardManager'
import ThemeSettings from '@/components/ThemeSettings'
import ExportImport from '@/components/ExportImport'
import { useMqttStore } from '@/mqtt/MqttManager'
import { useDashboardStore } from '@/stores/dashboardStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Settings, Plus, Layout, Wifi, WifiOff } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'connections' | 'settings'>('dashboard')
  const [showDashboardManager, setShowDashboardManager] = useState(false)
  
  const connections = useMqttStore((s) => s.connections)
  const connect = useMqttStore((s) => s.connect)
  const addConnection = useMqttStore((s) => s.addConnection)
  const { currentDashboard, dashboards } = useDashboardStore()
  
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

  const connectionStatus = connections[defaultConnId]?.state?.status || 'disconnected'
  const isConnected = connectionStatus === 'connected'

  return (
    <ThemeProvider>
      <div className="min-h-screen text-sm bg-background text-foreground">
        <header className="p-4 border-b border-border bg-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Layout className="w-6 h-6" />
                <span className="hidden sm:inline">IoT MQTT Panel</span>
                <span className="sm:hidden">IoT Panel</span>
              </h1>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {connectionStatus}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDashboardManager(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Dashboard</span>
                <span className="sm:hidden">New</span>
              </button>
              <div className="flex border rounded-md">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-l-md transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </button>
                <button
                  onClick={() => setActiveTab('connections')}
                  className={`px-3 py-2 transition-colors ${
                    activeTab === 'connections' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="hidden sm:inline">Connections</span>
                  <span className="sm:hidden">Conn</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 rounded-r-md transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard />
              </motion.div>
            )}
            
            {activeTab === 'connections' && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ConnectionForm />
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-lg font-semibold mb-4">Settings</h2>
                  <div className="space-y-6">
                    <ThemeSettings />
                    
                    <ExportImport />
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Dashboard Management</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create, edit, and manage your dashboards.
                      </p>
                      <button
                        onClick={() => setShowDashboardManager(true)}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Open Dashboard Manager
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {showDashboardManager && (
          <DashboardManager onClose={() => setShowDashboardManager(false)} />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
