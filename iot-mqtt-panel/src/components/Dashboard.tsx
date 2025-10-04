import { useState, useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { motion } from 'framer-motion'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useMqttStore } from '@/mqtt/MqttManager'
import WidgetRenderer from '@/components/WidgetRenderer'
import WidgetConfigPanel from '@/components/WidgetConfigPanel'
import { Edit3, Plus, Trash2, Settings } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function Dashboard() {
  const { currentDashboard, getCurrentDashboard } = useDashboardStore()
  const connections = useMqttStore((s) => s.connections)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [configuringPanel, setConfiguringPanel] = useState<PanelInstanceBase | null>(null)

  const dashboard = getCurrentDashboard()

  const handleLayoutChange = useCallback((layout: any) => {
    if (!dashboard) return
    
    const updatedPanels = dashboard.panels.map((panel) => {
      const layoutItem = layout.find((item: any) => item.i === panel.id)
      if (layoutItem) {
        return {
          ...panel,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        }
      }
      return panel
    })

    useDashboardStore.getState().updateDashboard(dashboard.id, { panels: updatedPanels })
  }, [dashboard])

  const handleDeletePanel = (panelId: string) => {
    if (!dashboard) return
    useDashboardStore.getState().deletePanel(dashboard.id, panelId)
  }

  const handleConfigurePanel = (panel: PanelInstanceBase) => {
    setConfiguringPanel(panel)
  }

  const handleSavePanelConfig = (updatedPanel: PanelInstanceBase) => {
    if (!dashboard) return
    useDashboardStore.getState().updatePanel(dashboard.id, updatedPanel.id, updatedPanel)
    setConfiguringPanel(null)
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No Dashboard Selected</h2>
          <p className="text-muted-foreground">Create a new dashboard to get started.</p>
        </div>
      </div>
    )
  }

  const connection = connections[dashboard.connectionId]
  const isConnected = connection?.state?.status === 'connected'

  const layout = dashboard.panels.map((panel) => ({
    i: panel.id,
    x: panel.x,
    y: panel.y,
    w: panel.w,
    h: panel.h,
    minW: 1,
    minH: 1,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{dashboard.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Connection: {connection?.config?.name || dashboard.connectionId}</span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{connection?.state?.status || 'disconnected'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isEditing 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Done Editing' : 'Edit Layout'}
          </button>
        </div>
      </div>

      <div className="relative">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ 
            lg: layout,
            md: layout.map(item => ({ ...item, w: Math.min(item.w, 6) })),
            sm: layout.map(item => ({ ...item, w: Math.min(item.w, 4) })),
            xs: layout.map(item => ({ ...item, w: Math.min(item.w, 2) })),
            xxs: layout.map(item => ({ ...item, w: 1 }))
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          transformScale={1}
        >
          {dashboard.panels.map((panel) => (
            <div key={panel.id} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                <WidgetRenderer
                  panel={panel}
                  connectionId={dashboard.connectionId}
                />
              </motion.div>
              
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-2 right-2 flex gap-1"
                >
                  <button
                    onClick={() => handleConfigurePanel(panel)}
                    className="p-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
                    title="Configure widget"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeletePanel(panel.id)}
                    className="p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                    title="Delete widget"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

        {showAddWidget && (
          <AddWidgetModal
            dashboardId={dashboard.id}
            onClose={() => setShowAddWidget(false)}
          />
        )}

        {configuringPanel && (
          <WidgetConfigPanel
            panel={configuringPanel}
            onSave={handleSavePanelConfig}
            onClose={() => setConfiguringPanel(null)}
          />
        )}
    </div>
  )
}

// Add Widget Modal Component
function AddWidgetModal({ dashboardId, onClose }: { dashboardId: string; onClose: () => void }) {
  const [selectedType, setSelectedType] = useState<string>('led_indicator')
  
  const widgetTypes = [
    { id: 'led_indicator', name: 'LED Indicator', description: 'Visual status indicator with icons and colors' },
    { id: 'button', name: 'Button', description: 'Control button for publishing MQTT messages' },
    { id: 'gauge', name: 'Gauge', description: 'Circular gauge for displaying numeric values' },
    { id: 'line_graph', name: 'Line Chart', description: 'Time-series line chart' },
    { id: 'text_log', name: 'Text Log', description: 'Text log for displaying messages' },
    { id: 'switch', name: 'Switch', description: 'Toggle switch control' },
    { id: 'slider', name: 'Slider', description: 'Range slider control' },
    { id: 'progress', name: 'Progress Bar', description: 'Progress bar display' },
  ]

  const handleAddWidget = () => {
    const newPanel = {
      id: `widget-${Date.now()}`,
      type: selectedType as any,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      config: {
        name: `New ${widgetTypes.find(w => w.id === selectedType)?.name}`,
        topicSubscribe: '',
        topicPublish: '',
        qos: 0,
      },
    }

    useDashboardStore.getState().addPanel(dashboardId, newPanel)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border rounded-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold mb-4">Add Widget</h3>
        
        <div className="space-y-3 mb-6">
          {widgetTypes.map((type) => (
            <label key={type.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="widgetType"
                value={type.id}
                checked={selectedType === type.id}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{type.name}</div>
                <div className="text-sm text-muted-foreground">{type.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddWidget}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Widget
          </button>
        </div>
      </motion.div>
    </div>
  )
}