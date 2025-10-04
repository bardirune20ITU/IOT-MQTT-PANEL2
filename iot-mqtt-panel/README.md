# IoT MQTT Panel (Web)

Modern, responsive, single-page web app to manage multiple MQTT connections and dashboards with configurable widgets. Runs in the browser over MQTT WebSocket.

## Features
- Multiple MQTT connections, test/save, auto-reconnect, status & last message time
- Dashboards with widgets: LED indicator, Button, Gauge, Line Chart, Text Log (more to come)
- State mapping: icon, color, label, animation per value (regex supported)
- Icon registry: lucide-react defaults; custom SVGs persisted locally
- IndexedDB persistence; export/import JSON (connections + dashboards)
- TailwindCSS + Framer Motion animations; accessible and keyboard friendly
- Vitest + RTL tests; GitHub Actions CI

## Quick start
```bash
npm install
npm run dev
```

Open the app, use the default Mosquitto demo connection, or add your own (ws/wss). For raw TCP brokers, use a WebSocket bridge (see docs/bridge.md).

## Scripts
- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build
- `npm run test`: Run unit tests
- `npm run coverage`: Coverage report
- `npm run typecheck`: TypeScript project references build

## Security & credentials
- Credentials are never logged. By default passwords are stored only if you toggle “Save Password”. Optionally encrypt with a passphrase (to be added). Web storage is not fully secure; prefer short-lived accounts and wss brokers.

## Export/Import
- Export to JSON includes `stateMap` and icon keys. Import restores dashboards and connections (passwords are not imported).

## Demo topics
- LED: subscribe `home/livingroom/light1/state`; publish `home/livingroom/light1/set` with `ON`/`OFF` or `TOGGLE`
- Gauge/Line: publish numeric to `home/livingroom/temp`
- Text Log: subscribe to `home/+`

## License
MIT
