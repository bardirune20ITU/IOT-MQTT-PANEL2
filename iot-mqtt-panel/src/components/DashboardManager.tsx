import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useMqttStore } from '@/mqtt/MqttManager'
import { X, Plus, Edit3, Trash2, Copy, Settings } from 'lucide-react'

interface DashboardManagerProps {
  onClose: () => void
}

export default function DashboardManager({ onClose }: DashboardManagerProps) {
  const { dashboards, currentDashboardId, setCurrentDashboard, addDashboard, deleteDashboard } = useDashboardStore()
  const connections = useMqttStore((s) => s.connections)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<string | null>(null)

  const handleCreateDashboard = (name: string, connectionId: string) => {
    const newDashboard = {
      id: `dashboard-${Date.now()}`,
      connectionId,
      name,
      layout: { cols: 12, rows: 8 },
      panels: [],
    }
    addDashboard(newDashboard)
    setShowCreateForm(false)
  }

  const handleDeleteDashboard = (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      deleteDashboard(id)
    }
  }

  const handleDuplicateDashboard = (dashboard: any) => {
    const duplicatedDashboard = {
      ...dashboard,
      id: `dashboard-${Date.now()}`,
      name: `${dashboard.name} (Copy)`,
    }
    addDashboard(duplicatedDashboard)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Dashboard Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Your Dashboards</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(dashboards).map((dashboard) => {
              const connection = connections[dashboard.connectionId]
              const isActive = currentDashboardId === dashboard.id
              const isConnected = connection?.state?.status === 'connected'

              return (
                <motion.div
                  key={dashboard.id}
                  layout
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentDashboard(dashboard.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{dashboard.name}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateDashboard(dashboard)
                        }}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDashboard(dashboard.id)
                        }}
                        className="p-1 hover:bg-destructive/20 text-destructive rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{connection?.config?.name || dashboard.connectionId}</span>
                    </div>
                    <div>Widgets: {dashboard.panels.length}</div>
                    <div>Layout: {dashboard.layout.cols}×{dashboard.layout.rows}</div>
                  </div>

                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {Object.keys(dashboards).length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No dashboards yet</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Create your first dashboard
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <CreateDashboardForm
              connections={connections}
              onCreate={handleCreateDashboard}
              onClose={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function CreateDashboardForm({ 
  connections, 
  onCreate, 
  onClose 
}: { 
  connections: any
  onCreate: (name: string, connectionId: string) => void
  onClose: () => void 
}) {
  const [name, setName] = useState('')
  const [connectionId, setConnectionId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && connectionId) {
      onCreate(name.trim(), connectionId)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border rounded-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold mb-4">Create New Dashboard</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dashboard Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="My Dashboard"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">MQTT Connection</label>
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="">Select a connection</option>
              {Object.values(connections).map((conn: any) => (
                <option key={conn.config.id} value={conn.config.id}>
                  {conn.config.name} ({conn.state.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Dashboard
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}