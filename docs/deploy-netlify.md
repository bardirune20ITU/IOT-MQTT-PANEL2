# Deploying IoT MQTT Panel to Netlify

This explains deploying the client-side IoT MQTT Panel to Netlify and verifying the demo.

Important: Netlify cannot host persistent TCP brokers. If your broker lacks WebSocket support, deploy a TCP→WebSocket bridge elsewhere and set the app to use that bridge's wss:// URL.

Files required:
- netlify.toml (root)
- public/_redirects
- Optional scripts/deploy-netlify.sh

Build-time env (non-sensitive):
- VITE_DEFAULT_BROKER_WS (example default: wss://broker.hivemq.com:8000/mqtt)

Netlify UI (recommended):
- Netlify → New site → Import from Git → select repo
- Build command: npm run build
- Publish directory: dist
- Add build-time env vars in Site settings → Build & deploy → Environment
- Enable deploy previews

Netlify CLI:
- npm i -g netlify-cli
- netlify login
- netlify init (or netlify link)
- netlify deploy --prod --dir=dist

Verification:
1. Open deployed Netlify URL (HTTPS).
2. Open DevTools → Console → ensure no 404s for assets.
3. Open demo dashboard → confirm sample dashboard JSON loads.
4. Confirm client attempts to connect to VITE_DEFAULT_BROKER_WS (MQTT over WebSocket).
5. Publish test messages (HiveMQ web publisher or MQTT Explorer over WebSockets) to sample topic (e.g., home/livingroom/light1/state) and verify LED indicator updates (ON => bright yellow bulb, OFF => white/off bulb).

Bridge (if broker lacks WebSocket):
- Provide a small bridge (Node.js using mqtt + ws or aedes) and deploy it to Render, Fly.io, Heroku, or a VPS. Point app to the bridge's wss:// endpoint (VITE_BRIDGE_WS_URL).

Security notes:
- Do not commit credentials or secrets.
- Prefer wss:// endpoints.
- Recommend storing user device credentials in-browser (encrypted with passphrase) or in a secure backend under user control.
