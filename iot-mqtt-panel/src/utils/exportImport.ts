import { loadConnections, loadDashboards, saveConnection, saveDashboard } from './idb'
import type { Dashboard, ExportBundleV1 } from '@/core/types'

export async function exportAll(): Promise<ExportBundleV1> {
  const [conns, dashes] = await Promise.all([
    loadConnections(),
    loadDashboards(),
  ])
  return {
    version: '1.0',
    connections: conns.map((c: any) => ({
      id: c.id,
      name: c.name,
      broker: c.brokerUrl,
      port: undefined,
      protocol: c.protocol,
      clientId: c.clientId,
      username: c.username,
      password: c.password ? 'ENCRYPTED_PLACEHOLDER' : undefined,
      keepAlive: c.keepAlive,
      clean: c.clean,
      lastWill: c.lastWill,
    })),
    dashboards: dashes as Dashboard[],
  }
}

export async function importAll(bundle: ExportBundleV1) {
  if (bundle.version !== '1.0') throw new Error('Unsupported version')
  for (const c of bundle.connections) {
    await saveConnection({
      id: c.id,
      name: c.name,
      brokerUrl: c.broker || `${c.protocol}://host:${c.port ?? 80}`,
      protocol: c.protocol,
      clientId: c.clientId,
      username: c.username,
      password: undefined,
      keepAlive: c.keepAlive,
      clean: c.clean,
      lastWill: c.lastWill,
    })
  }
  for (const d of bundle.dashboards) {
    await saveDashboard(d)
  }
  // icons optional; stored separately
}
