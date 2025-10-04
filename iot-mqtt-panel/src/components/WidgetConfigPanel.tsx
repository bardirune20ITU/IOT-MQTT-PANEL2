import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, TestTube, Eye, EyeOff } from 'lucide-react'
import type { PanelInstanceBase, StateRule, AnimationType } from '@/core/types'
import { useMqttStore } from '@/mqtt/MqttManager'

interface WidgetConfigPanelProps {
  panel: PanelInstanceBase
  onSave: (updatedPanel: PanelInstanceBase) => void
  onClose: () => void
}

export default function WidgetConfigPanel({ panel, onSave, onClose }: WidgetConfigPanelProps) {
  const [config, setConfig] = useState(panel.config)
  const [showPreview, setShowPreview] = useState(false)
  const [testValue, setTestValue] = useState('')
  const connections = useMqttStore((s) => s.connections)

  const handleSave = () => {
    onSave({ ...panel, config })
    onClose()
  }

  const addStateRule = () => {
    const newRule: StateRule = {
      match: '',
      icon: 'circle',
      color: '#ffffff',
      label: '',
      ariaLabel: '',
      animation: { type: 'none' },
    }
    setConfig({
      ...config,
      stateMap: [...(config.stateMap || []), newRule],
    })
  }

  const updateStateRule = (index: number, updates: Partial<StateRule>) => {
    const newStateMap = [...(config.stateMap || [])]
    newStateMap[index] = { ...newStateMap[index], ...updates }
    setConfig({ ...config, stateMap: newStateMap })
  }

  const removeStateRule = (index: number) => {
    const newStateMap = [...(config.stateMap || [])]
    newStateMap.splice(index, 1)
    setConfig({ ...config, stateMap: newStateMap })
  }

  const testConnection = () => {
    if (config.topicPublish && testValue) {
      const connection = connections[panel.connectionId]
      if (connection?.client) {
        connection.client.publish(config.topicPublish, testValue, { qos: config.qos || 0 })
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Configure Widget: {panel.type}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Widget Name</label>
                    <input
                      type="text"
                      value={config.name || ''}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Enter widget name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">QoS Level</label>
                    <select
                      value={config.qos || 0}
                      onChange={(e) => setConfig({ ...config, qos: parseInt(e.target.value) as 0 | 1 | 2 })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value={0}>0 - At most once</option>
                      <option value={1}>1 - At least once</option>
                      <option value={2}>2 - Exactly once</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subscribe Topic</label>
                    <input
                      type="text"
                      value={config.topicSubscribe || ''}
                      onChange={(e) => setConfig({ ...config, topicSubscribe: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="home/sensor/temperature"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Topic</label>
                    <input
                      type="text"
                      value={config.topicPublish || ''}
                      onChange={(e) => setConfig({ ...config, topicPublish: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="home/device/command"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Value Template</label>
                    <input
                      type="text"
                      value={config.valueTemplate || ''}
                      onChange={(e) => setConfig({ ...config, valueTemplate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="ON/OFF or {{value}}"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="retain"
                      checked={config.retain || false}
                      onChange={(e) => setConfig({ ...config, retain: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="retain" className="text-sm font-medium">Retain Messages</label>
                  </div>
                </div>
              </div>

              {/* State Mapping */}
              {(panel.type === 'led_indicator' || panel.type === 'multi_state_indicator') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">State Mapping</h3>
                    <button
                      onClick={addStateRule}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Add State Rule
                    </button>
                  </div>

                  <div className="space-y-3">
                    {config.stateMap?.map((rule, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">State Rule {index + 1}</h4>
                          <button
                            onClick={() => removeStateRule(index)}
                            className="px-2 py-1 text-destructive hover:bg-destructive/20 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Match Value</label>
                            <input
                              type="text"
                              value={typeof rule.match === 'string' ? rule.match : ''}
                              onChange={(e) => updateStateRule(index, { match: e.target.value })}
                              className="w-full px-2 py-1 border rounded bg-background text-sm"
                              placeholder="ON, OFF, 1, 0, etc."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Icon</label>
                            <input
                              type="text"
                              value={rule.icon || ''}
                              onChange={(e) => updateStateRule(index, { icon: e.target.value })}
                              className="w-full px-2 py-1 border rounded bg-background text-sm"
                              placeholder="bulb, fan, power, etc."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Color</label>
                            <input
                              type="color"
                              value={rule.color || '#ffffff'}
                              onChange={(e) => updateStateRule(index, { color: e.target.value })}
                              className="w-full h-8 border rounded bg-background"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Label</label>
                            <input
                              type="text"
                              value={rule.label || ''}
                              onChange={(e) => updateStateRule(index, { label: e.target.value })}
                              className="w-full px-2 py-1 border rounded bg-background text-sm"
                              placeholder="On, Off, etc."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Animation</label>
                          <select
                            value={rule.animation?.type || 'none'}
                            onChange={(e) => updateStateRule(index, { 
                              animation: { 
                                type: e.target.value as AnimationType, 
                                speed: rule.animation?.speed || 1 
                              } 
                            })}
                            className="w-full px-2 py-1 border rounded bg-background text-sm"
                          >
                            <option value="none">None</option>
                            <option value="pulse">Pulse</option>
                            <option value="blink">Blink</option>
                            <option value="spin">Spin</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Widget-specific Configuration */}
              {panel.type === 'slider' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Slider Configuration</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Value</label>
                      <input
                        type="number"
                        value={(config as any).min || 0}
                        onChange={(e) => setConfig({ ...config, min: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Maximum Value</label>
                      <input
                        type="number"
                        value={(config as any).max || 100}
                        onChange={(e) => setConfig({ ...config, max: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Step</label>
                      <input
                        type="number"
                        step="0.1"
                        value={(config as any).step || 1}
                        onChange={(e) => setConfig({ ...config, step: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <input
                      type="text"
                      value={(config as any).unit || ''}
                      onChange={(e) => setConfig({ ...config, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="°C, %, V, etc."
                    />
                  </div>
                </div>
              )}

              {/* Test Section */}
              {config.topicPublish && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Publishing</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testValue}
                      onChange={(e) => setTestValue(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                      placeholder="Test value to publish"
                    />
                    <button
                      onClick={testConnection}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <TestTube className="w-4 h-4" />
                      Test Publish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-80 border-l bg-muted/20 p-4">
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              <div className="h-64 border rounded-lg bg-card p-4">
                {/* Widget preview would go here */}
                <div className="text-center text-muted-foreground">
                  Widget preview for {panel.type}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  )
}