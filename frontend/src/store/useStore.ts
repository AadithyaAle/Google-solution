import { create } from 'zustand';

interface Telemetry {
    vibration: number;
    temperature: number;
    weather: string;
}

interface AIAnalysis {
    risk_score: number;
    health_index: number; // 0-100 predictive health
    status: string;
    maintenance_alert: string | null;
    mitigation_plan: string[];
}

interface GPSPoint {
    lat: number;
    lng: number;
}

interface Shipment {
    shipment_id: string;
    location: string;
    gps: GPSPoint;
    history: GPSPoint[];
    telemetry: Telemetry;
    ai_analysis: AIAnalysis;
    timestamp: number;
}

interface Alert {
    id: string;
    shipment_id: string;
    location: string;
    ai_analysis: AIAnalysis;
    timestamp: string;
}

export interface Vehicle {
    id: string; // Asset UID
    type: string;
    model: string;
    vin: string;
    plate_number: string;
    manufacture_year: number;
    fuel_type: 'DIESEL' | 'ELECTRIC' | 'PETROL' | 'HYBRID';
    payload_capacity_kg: number;
    last_service_date: string;
    insurance_policy: string;
    status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
}

interface CopilotMessage {
    id: string;
    role: 'USER' | 'COPILOT';
    content: string;
    timestamp: string;
    sentiment?: 'NEUTRAL' | 'ALERT' | 'SUCCESS';
}

interface NetworkStats {
    node_count: number;
    link_count: number;
    avg_risk: number;
    critical_links: number;
    registered_vehicles: number;
    active_connections: number;
}

interface AppState {
    isAuthenticated: boolean;
    companyName: string | null;
    userEmail: string | null;
    shipments: Record<string, Shipment>;
    alerts: Alert[];
    vehicles: Vehicle[];
    networkState: any;
    networkStats: NetworkStats | null;
    copilotMessages: CopilotMessage[];

    login: (email: string, company: string) => void;
    logout: () => void;
    updateShipment: (update: any) => void;
    setNetworkState: (state: any) => void;
    setNetworkStats: (stats: NetworkStats) => void;
    addAlert: (alert: Alert) => void;
    addVehicle: (vehicle: Vehicle) => void;
    setVehicles: (vehicles: Vehicle[]) => void;
    deleteVehicle: (id: string) => void;
    addCopilotMessage: (msg: CopilotMessage) => void;
}

export const useStore = create<AppState>((set) => ({
    isAuthenticated: false,
    companyName: null,
    userEmail: null,
    shipments: {},
    alerts: [],
    vehicles: [],
    networkState: null,
    networkStats: null,
    copilotMessages: [
        {
            id: 'init',
            role: 'COPILOT',
            content: 'Neural Link Established. Copilot Ready. How can I assist with your orchestration today?',
            timestamp: new Date().toISOString(),
            sentiment: 'SUCCESS'
        }
    ],

    login: (email, company) => set({
        isAuthenticated: true,
        userEmail: email,
        companyName: company,
    }),

    logout: () => set({
        isAuthenticated: false,
        userEmail: null,
        companyName: null,
        vehicles: [],
        shipments: {},
        alerts: [],
        networkStats: null,
        copilotMessages: [],
    }),

    updateShipment: (update) => set((state) => {
        const { shipment, location, gps, ai_analysis, telemetry, timestamp } = update;
        const existing = state.shipments[shipment];
        const history = existing
            ? [...existing.history, gps].slice(-15)
            : [gps];
        return {
            shipments: {
                ...state.shipments,
                [shipment]: {
                    shipment_id: shipment,
                    location,
                    gps,
                    history,
                    ai_analysis,
                    telemetry,
                    timestamp,
                },
            },
        };
    }),

    setNetworkState: (networkState) => set({ networkState }),
    setNetworkStats: (networkStats) => set({ networkStats }),
    addAlert: (alert) => set((state) => ({
        alerts: [alert, ...state.alerts].slice(0, 50),
    })),
    addVehicle: (vehicle) => set((state) => ({
        vehicles: [...state.vehicles, vehicle],
    })),
    setVehicles: (vehicles) => set({ vehicles }),
    deleteVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
    })),
    addCopilotMessage: (msg) => set((state) => ({
        copilotMessages: [...state.copilotMessages, msg].slice(-30),
    })),
}));
