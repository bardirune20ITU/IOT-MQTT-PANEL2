import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [showColorPicker, setShowColorPicker] = useState(false)

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ]

  const presetColors = [
    { name: 'Blue', value: 'hsl(221.2 83.2% 53.3%)' },
    { name: 'Green', value: 'hsl(142.1 76.2% 36.3%)' },
    { name: 'Purple', value: 'hsl(262.1 83.3% 57.8%)' },
    { name: 'Orange', value: 'hsl(24.6 95% 53.1%)' },
    { name: 'Red', value: 'hsl(0 84.2% 60.2%)' },
    { name: 'Pink', value: 'hsl(330.4 81.2% 60.4%)' },
  ]

  const handleColorChange = (color: string) => {
    document.documentElement.style.setProperty('--primary', color)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Appearance</label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${
                      theme === themeOption.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{themeOption.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Accent Color</label>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                <Palette className="w-4 h-4" />
                Customize
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                  className="flex flex-col items-center gap-1 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-border"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs text-muted-foreground">{color.name}</span>
                </button>
              ))}
            </div>

            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 border rounded-lg bg-muted/20"
              >
                <label className="block text-sm font-medium mb-2">Custom Color</label>
                <input
                  type="color"
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-10 border rounded-md cursor-pointer"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div className="p-4 border rounded-lg bg-card">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-sm">Primary color preview</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-secondary rounded-full" />
              <span className="text-sm">Secondary color preview</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-muted rounded-full" />
              <span className="text-sm">Muted color preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}