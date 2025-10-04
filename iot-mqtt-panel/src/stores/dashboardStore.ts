import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Dashboard, PanelInstanceBase, PanelType } from '@/core/types'

interface DashboardStore {
  dashboards: Record<string, Dashboard>
  currentDashboardId: string | null
  addDashboard: (dashboard: Dashboard) => void
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void
  deleteDashboard: (id: string) => void
  setCurrentDashboard: (id: string) => void
  addPanel: (dashboardId: string, panel: PanelInstanceBase) => void
  updatePanel: (dashboardId: string, panelId: string, updates: Partial<PanelInstanceBase>) => void
  deletePanel: (dashboardId: string, panelId: string) => void
  getCurrentDashboard: () => Dashboard | null
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      dashboards: {},
      currentDashboardId: null,

      addDashboard: (dashboard: Dashboard) =>
        set((state) => ({
          dashboards: {
            ...state.dashboards,
            [dashboard.id]: dashboard,
          },
          currentDashboardId: dashboard.id,
        })),

      updateDashboard: (id: string, updates: Partial<Dashboard>) =>
        set((state) => ({
          dashboards: {
            ...state.dashboards,
            [id]: { ...state.dashboards[id], ...updates },
          },
        })),

      deleteDashboard: (id: string) =>
        set((state) => {
          const newDashboards = { ...state.dashboards }
          delete newDashboards[id]
          return {
            dashboards: newDashboards,
            currentDashboardId: state.currentDashboardId === id ? null : state.currentDashboardId,
          }
        }),

      setCurrentDashboard: (id: string) =>
        set({ currentDashboardId: id }),

      addPanel: (dashboardId: string, panel: PanelInstanceBase) =>
        set((state) => ({
          dashboards: {
            ...state.dashboards,
            [dashboardId]: {
              ...state.dashboards[dashboardId],
              panels: [...state.dashboards[dashboardId].panels, panel],
            },
          },
        })),

      updatePanel: (dashboardId: string, panelId: string, updates: Partial<PanelInstanceBase>) =>
        set((state) => ({
          dashboards: {
            ...state.dashboards,
            [dashboardId]: {
              ...state.dashboards[dashboardId],
              panels: state.dashboards[dashboardId].panels.map((panel) =>
                panel.id === panelId ? { ...panel, ...updates } : panel
              ),
            },
          },
        })),

      deletePanel: (dashboardId: string, panelId: string) =>
        set((state) => ({
          dashboards: {
            ...state.dashboards,
            [dashboardId]: {
              ...state.dashboards[dashboardId],
              panels: state.dashboards[dashboardId].panels.filter((panel) => panel.id !== panelId),
            },
          },
        })),

      getCurrentDashboard: () => {
        const state = get()
        return state.currentDashboardId ? state.dashboards[state.currentDashboardId] : null
      },
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Initialize with a default dashboard if none exist
const initializeDefaultDashboard = () => {
  const store = useDashboardStore.getState()
  if (Object.keys(store.dashboards).length === 0) {
    const defaultDashboard: Dashboard = {
      id: 'default-dashboard',
      connectionId: 'demo-mosquitto',
      name: 'Default Dashboard',
      layout: { cols: 12, rows: 8 },
      panels: [
        {
          id: 'light-indicator',
          type: 'led_indicator',
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          config: {
            name: 'Ceiling Light',
            topicSubscribe: 'home/livingroom/light1/state',
            parseAsJson: false,
            stateMap: [
              { match: 'ON', icon: 'bulb', color: '#FFD700', label: 'On', ariaLabel: 'Light on', animation: { type: 'pulse', speed: 1.2 } },
              { match: '1', icon: 'bulb', color: '#FFD700', label: 'On', ariaLabel: 'Light on', animation: { type: 'pulse', speed: 1.2 } },
              { match: 'OFF', icon: 'bulb_off', color: '#FFFFFF', label: 'Off', ariaLabel: 'Light off', animation: { type: 'none' } },
              { match: '0', icon: 'bulb_off', color: '#FFFFFF', label: 'Off', ariaLabel: 'Light off', animation: { type: 'none' } },
            ],
            defaultState: { icon: 'bulb_off', color: '#DDDDDD', label: 'Unknown', ariaLabel: 'Unknown state' },
          },
        },
        {
          id: 'toggle-button',
          type: 'button',
          x: 2,
          y: 0,
          w: 2,
          h: 2,
          config: {
            name: 'Toggle',
            topicPublish: 'home/livingroom/light1/set',
            valueTemplate: 'TOGGLE',
            qos: 0,
          },
        },
        {
          id: 'temperature-gauge',
          type: 'gauge',
          x: 4,
          y: 0,
          w: 4,
          h: 4,
          config: {
            name: 'Temperature',
            topicSubscribe: 'home/livingroom/temp',
            qos: 0,
          },
        },
        {
          id: 'temp-chart',
          type: 'line_graph',
          x: 8,
          y: 0,
          w: 4,
          h: 4,
          config: {
            name: 'Temp Trend',
            topicSubscribe: 'home/livingroom/temp',
            qos: 0,
          },
        },
        {
          id: 'text-log',
          type: 'text_log',
          x: 0,
          y: 2,
          w: 12,
          h: 2,
          config: {
            name: 'Log',
            topicSubscribe: 'home/+',
            qos: 0,
          },
        },
      ],
    }
    store.addDashboard(defaultDashboard)
  }
}

// Initialize on store creation
initializeDefaultDashboard()