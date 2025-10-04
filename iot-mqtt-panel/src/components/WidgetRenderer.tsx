import { motion } from 'framer-motion'
import LEDIndicator from '@/widgets/LEDIndicator'
import ButtonWidget from '@/widgets/ButtonWidget'
import GaugeWidget from '@/widgets/GaugeWidget'
import LineChartWidget from '@/widgets/LineChartWidget'
import TextLog from '@/widgets/TextLog'
import SwitchWidget from '@/widgets/SwitchWidget'
import SliderWidget from '@/widgets/SliderWidget'
import ProgressWidget from '@/widgets/ProgressWidget'
import MultiStateIndicator from '@/widgets/MultiStateIndicator'
import ColorPickerWidget from '@/widgets/ColorPickerWidget'
import type { PanelInstanceBase } from '@/core/types'

interface WidgetRendererProps {
  panel: PanelInstanceBase
  connectionId: string
}

export default function WidgetRenderer({ panel, connectionId }: WidgetRendererProps) {
  const renderWidget = () => {
    const commonProps = {
      connectionId,
      config: panel.config,
    }

    switch (panel.type) {
      case 'led_indicator':
        return <LEDIndicator {...commonProps} />
      case 'button':
        return <ButtonWidget {...commonProps} />
      case 'gauge':
        return <GaugeWidget {...commonProps} />
      case 'line_graph':
        return <LineChartWidget {...commonProps} />
      case 'text_log':
        return <TextLog {...commonProps} />
      case 'switch':
        return <SwitchWidget {...commonProps} />
      case 'slider':
        return <SliderWidget {...commonProps} />
      case 'progress':
        return <ProgressWidget {...commonProps} />
      case 'multi_state_indicator':
        return <MultiStateIndicator {...commonProps} />
      case 'color_picker':
        return <ColorPickerWidget {...commonProps} />
      default:
        return (
          <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <div className="text-center text-muted-foreground">
              <div className="text-sm font-medium">Unknown Widget</div>
              <div className="text-xs">Type: {panel.type}</div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      layout
      className="h-full w-full bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="h-full w-full p-2">
        {renderWidget()}
      </div>
    </motion.div>
  )
}