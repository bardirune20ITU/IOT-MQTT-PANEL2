# IoT MQTT Panel

A flexible, modern web-based IoT MQTT dashboard with drag-and-drop layout, fluid animations, and maximum configurability. Built with React, TypeScript, and Tailwind CSS.

![IoT MQTT Panel](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.14-blue) ![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)

## ✨ Features

### 🎛️ Flexible Dashboard System
- **Drag & Drop Layout**: Resize and reposition widgets with ease
- **Responsive Design**: Automatically adapts to different screen sizes
- **Multiple Dashboards**: Create and manage multiple dashboard instances
- **Real-time Updates**: Live MQTT data streaming with WebSocket support

### 🎨 Rich Widget Collection
- **LED Indicators**: Visual status indicators with custom icons and colors
- **Gauges**: Circular gauges for displaying numeric values
- **Line Charts**: Time-series data visualization
- **Switches**: Toggle controls for device commands
- **Sliders**: Range controls with custom min/max values
- **Progress Bars**: Animated progress displays
- **Multi-state Indicators**: Complex state visualization
- **Color Pickers**: RGB/HSV color selection widgets
- **Text Logs**: Real-time message logging
- **Buttons**: Custom action triggers

### 🎭 Advanced Animations
- **Framer Motion**: Smooth, fluid transitions and animations
- **Custom Animations**: Pulse, blink, spin, and scale effects
- **State-based Animations**: Different animations for different states
- **Performance Optimized**: Hardware-accelerated animations

### 🎨 Theme System
- **Dark/Light Modes**: Automatic theme switching
- **System Theme**: Follows OS preference
- **Custom Colors**: Customizable accent colors
- **CSS Variables**: Easy theme customization

### ⚙️ Maximum Configurability
- **State Mapping**: Define custom states with icons, colors, and animations
- **MQTT Configuration**: Full MQTT broker settings support
- **Widget Settings**: Comprehensive configuration for each widget type
- **JSON Templates**: Mustache template support for value formatting
- **QoS Levels**: Support for all MQTT QoS levels

### 📱 Responsive Design
- **Mobile First**: Optimized for mobile and tablet devices
- **Adaptive Layout**: Widgets automatically resize for different screens
- **Touch Friendly**: Optimized for touch interactions
- **Progressive Enhancement**: Works on all modern browsers

### 💾 Data Management
- **Export/Import**: Full configuration backup and restore
- **Local Storage**: Persistent dashboard and connection settings
- **JSON Format**: Human-readable configuration files
- **Version Control**: Configuration versioning support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iot-mqtt-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### Creating Your First Dashboard

1. **Add MQTT Connection**
   - Go to the "Connections" tab
   - Fill in your MQTT broker details
   - Test the connection

2. **Create Dashboard**
   - Click "New Dashboard" button
   - Choose a connection
   - Give your dashboard a name

3. **Add Widgets**
   - Click "Add Widget" in edit mode
   - Select widget type
   - Configure MQTT topics and settings

4. **Customize Layout**
   - Enable edit mode
   - Drag widgets to reposition
   - Resize widgets by dragging corners

### Widget Configuration

Each widget supports extensive configuration:

#### Basic Settings
- **Name**: Display name for the widget
- **Subscribe Topic**: MQTT topic to listen to
- **Publish Topic**: MQTT topic to send commands to
- **QoS Level**: Message quality of service
- **Retain**: Whether to retain messages

#### State Mapping (LED Indicators, Multi-state)
- **Match Value**: Value to match (ON, OFF, 1, 0, etc.)
- **Icon**: Icon to display (bulb, fan, power, etc.)
- **Color**: Custom color for the state
- **Label**: Text label for the state
- **Animation**: Animation type and speed

#### Advanced Features
- **Value Template**: Mustache template for formatting
- **JSON Path**: Extract specific values from JSON payloads
- **Custom Animations**: Define custom animation parameters

### MQTT Connection Setup

The panel supports various MQTT broker configurations:

#### Public Brokers (for testing)
- **Mosquitto Test**: `wss://test.mosquitto.org:8081`
- **Eclipse IoT**: `wss://mqtt.eclipse.org:443`

#### Private Brokers
- **WebSocket**: `ws://your-broker:8080`
- **Secure WebSocket**: `wss://your-broker:8081`
- **Authentication**: Username/password support
- **TLS**: SSL/TLS certificate validation

## 🎨 Customization

### Themes

The panel supports multiple theme options:

```typescript
// Available themes
type Theme = 'light' | 'dark' | 'system'

// Custom colors
const customColors = {
  primary: 'hsl(221.2 83.2% 53.3%)',
  secondary: 'hsl(210 40% 96%)',
  // ... more colors
}
```

### Custom Icons

Add custom SVG icons:

```typescript
import { registerCustomIcon } from '@/icons/IconRegistry'

registerCustomIcon('my-icon', '<svg>...</svg>')
```

### Widget Development

Create custom widgets by extending the base widget interface:

```typescript
interface CustomWidgetConfig extends WidgetCommonConfig {
  // Your custom properties
  customProperty?: string
}

export default function CustomWidget({ connectionId, config }: {
  connectionId: string
  config: CustomWidgetConfig
}) {
  // Your widget implementation
}
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── ThemeProvider.tsx
│   └── ...
├── widgets/            # Widget implementations
│   ├── LEDIndicator.tsx
│   ├── GaugeWidget.tsx
│   └── ...
├── stores/             # State management
│   └── dashboardStore.ts
├── mqtt/               # MQTT functionality
│   └── MqttManager.ts
├── utils/              # Utility functions
├── icons/              # Icon management
└── core/               # Type definitions
```

## 🔧 Configuration

### Environment Variables

```bash
# Default MQTT broker
VITE_DEFAULT_BROKER_WS=wss://test.mosquitto.org:8081

# Development settings
VITE_DEV_MODE=true
```

### Build Configuration

The project uses Vite for fast development and building:

- **Hot Module Replacement**: Instant updates during development
- **TypeScript**: Full type checking and IntelliSense
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code quality and consistency

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage

# Type checking
npm run typecheck
```

## 📦 Deployment

### Netlify (Recommended)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Static Hosting

The built application is a static SPA that can be hosted on any static hosting service:
- GitHub Pages
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MQTT.js](https://github.com/mqttjs/MQTT.js) - MQTT client
- [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout) - Drag and drop layout
- [Lucide React](https://lucide.dev/) - Icon library

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions
- **Email**: Contact the maintainers for enterprise support

---

**Built with ❤️ for the IoT community**