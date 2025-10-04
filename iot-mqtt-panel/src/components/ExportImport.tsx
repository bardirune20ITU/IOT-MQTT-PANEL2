import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, FileText, Copy, Check } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useMqttStore } from '@/mqtt/MqttManager'

export default function ExportImport() {
  const { dashboards } = useDashboardStore()
  const { connections } = useMqttStore()
  const [copied, setCopied] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')

  const exportData = {
    version: '2.0',
    timestamp: new Date().toISOString(),
    connections: Object.values(connections).map(conn => ({
      id: conn.config.id,
      name: conn.config.name,
      brokerUrl: conn.config.brokerUrl,
      protocol: conn.config.protocol,
      clientId: conn.config.clientId,
      username: conn.config.username,
      keepAlive: conn.config.keepAlive,
      clean: conn.config.clean,
      autoReconnect: conn.config.autoReconnect,
    })),
    dashboards: Object.values(dashboards),
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `iot-mqtt-panel-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)
      
      if (!data.version || !data.dashboards) {
        throw new Error('Invalid export format')
      }

      // Import connections
      if (data.connections) {
        data.connections.forEach((conn: any) => {
          useMqttStore.getState().addConnection(conn)
        })
      }

      // Import dashboards
      if (data.dashboards) {
        data.dashboards.forEach((dashboard: any) => {
          useDashboardStore.getState().addDashboard(dashboard)
        })
      }

      setImportData('')
      setImportError('')
      alert('Import successful!')
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Export Configuration</h3>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Export Summary</span>
              <span className="text-xs text-muted-foreground">
                {Object.keys(dashboards).length} dashboards, {Object.keys(connections).length} connections
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Includes all dashboard layouts, widget configurations, and MQTT connection settings.
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
            
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Import Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Import from File</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Or paste JSON data</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 px-3 py-2 border rounded-md bg-background font-mono text-sm"
              placeholder="Paste your exported configuration JSON here..."
            />
          </div>

          {importError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-sm text-destructive">{importError}</div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!importData.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Import Configuration
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Export Preview</h3>
        <div className="p-4 border rounded-lg bg-muted/20">
          <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
            {JSON.stringify(exportData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}