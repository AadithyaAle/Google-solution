import { create } from 'zustand';

interface Telemetry {
    vibration: number;
    temperature: number;
    weather: string;
}

interface AIAnalysis {
    risk_score: number;
    status: string;
    mitigation_plan: string[];
}

interface Shipment {
    shipment_id: string;
    location: string;
    gps: { lat: number; lng: number };
    telemetry: Telemetry;
    ai_analysis: AIAnalysis;
}

interface Alert {
    id: string;
    shipment_id: string;
    location: string;
    ai_analysis: AIAnalysis;
    timestamp: string;
}

interface Vehicle {
    id: string;
    type: string;
    model: string;
    status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
}

interface AppState {
    // Auth State
    isAuthenticated: boolean;
    companyName: string | null;
    userEmail: string | null;

    // Logistics State
    shipments: Record<string, Shipment>;
    alerts: Alert[];
    vehicles: Vehicle[];
    networkState: any;

    // Actions
    login: (email: string, company: string) => void;
    logout: () => void;
    updateShipment: (update: any) => void;
    setNetworkState: (state: any) => void;
    addAlert: (alert: Alert) => void;
    addVehicle: (vehicle: Vehicle) => void;
}

export const useStore = create<AppState>((set) => ({
    isAuthenticated: false,
    companyName: null,
    userEmail: null,

    shipments: {},
    alerts: [],
    vehicles: [],
    networkState: null,

    login: (email, company) => set({
        isAuthenticated: true,
        userEmail: email,
        companyName: company
    }),

    logout: () => set({
        isAuthenticated: false,
        userEmail: null,
        companyName: null
    }),

    updateShipment: (update) => set((state) => {
        const { shipment, location, gps, ai_analysis, telemetry } = update;
        return {
            shipments: {
                ...state.shipments,
                [shipment]: {
                    shipment_id: shipment,
                    location,
                    gps,
                    ai_analysis,
                    telemetry,
                },
            },
        };
    }),

    setNetworkState: (networkState) => set({ networkState }),

    addAlert: (alert) => set((state) => ({
        alerts: [alert, ...state.alerts].slice(0, 50),
    })),

    addVehicle: (vehicle) => set((state) => ({
        vehicles: [...state.vehicles, vehicle],
    })),
}));
