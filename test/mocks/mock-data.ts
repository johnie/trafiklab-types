import { expect } from 'vitest';
import type {
  Agency,
  Alert,
  ArrivalsResponse,
  DeparturesResponse,
  EndpointParams,
  EndpointResponse,
  NationalStopGroupResponse,
  Platform,
  RealtimeStop,
  Route,
  Stop,
  StopGroup,
  TimetableEntry,
  TrafikLabApiEndpoints,
  Trip,
} from '../../src/index';

// ============================================================================
// Mock Data Factory Functions
// ============================================================================

export function createStop(overrides: Partial<Stop> = {}): Stop {
  return {
    id: '12799',
    name: 'Slussen',
    lat: 59.319522,
    lon: 18.072027,
    ...overrides,
  };
}

export function createRealtimeStop(overrides: Partial<RealtimeStop> = {}): RealtimeStop {
  return {
    id: '12799',
    name: 'Slussen',
    lat: 59.319522,
    lon: 18.072027,
    transport_modes: ['BUS', 'METRO'],
    alerts: [],
    ...overrides,
  };
}

export function createAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    type: 'MAINTENANCE',
    title: 'HÃ¥llplats FMV och Malmen Vakten lÃ¤ggs ner frÃ¥n 20 mars',
    text: 'Detta gÃ¤ller 20 mars - tillsvidare: buss linje 232 trafikerar inte hÃ¥llplats FMV ...',
    ...overrides,
  };
}

export function createPlatform(overrides: Partial<Platform> = {}): Platform {
  return {
    id: '9022050012799016',
    designation: 'H',
    ...overrides,
  };
}

export function createAgency(overrides: Partial<Agency> = {}): Agency {
  return {
    id: '505000000000000001',
    name: 'AB Storstockholms Lokaltrafik',
    operator: 'Keolis',
    ...overrides,
  };
}

export function createTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    trip_id: '14010000664236480',
    start_date: '2025-03-31',
    technical_number: 1810,
    ...overrides,
  };
}

export function createRoute(overrides: Partial<Route> = {}): Route {
  return {
    name: null,
    designation: '3',
    transport_mode_code: 700,
    transport_mode: 'BUS',
    direction: 'Karolinska sjukhuset',
    origin: createStop({ id: '1', name: 'Origin' }),
    destination: createStop({
      id: '2',
      name: 'Destination',
    }),
    ...overrides,
  };
}

export function createTimetableEntry(overrides: Partial<TimetableEntry> = {}): TimetableEntry {
  const baseTime = '2025-03-31T16:30:00';
  const realtimeTime = '2025-03-31T16:29:14';

  return {
    scheduled: baseTime,
    realtime: realtimeTime,
    delay: -46,
    canceled: false,
    route: createRoute(),
    trip: createTrip(),
    agency: createAgency(),
    stop: createStop(),
    scheduled_platform: createPlatform(),
    realtime_platform: createPlatform(),
    alerts: [],
    is_realtime: true,
    ...overrides,
  };
}

export function createDeparturesResponse(overrides: Partial<DeparturesResponse> = {}): DeparturesResponse {
  return {
    timestamp: '2025-03-31T16:30:00',
    queryDetails: {
      queryTime: '2025-03-31T16:30:00',
      query: '740020101',
    },
    stops: [createRealtimeStop()],
    departures: [createTimetableEntry()],
    ...overrides,
  };
}

export function createArrivalsResponse(overrides: Partial<ArrivalsResponse> = {}): ArrivalsResponse {
  return {
    timestamp: '2025-03-31T16:30:00',
    queryDetails: {
      queryTime: '2025-03-31T16:30:00',
      query: '740020101',
    },
    stops: [createRealtimeStop()],
    arrivals: [createTimetableEntry()],
    ...overrides,
  };
}

export function createStopGroup(overrides: Partial<StopGroup> = {}): StopGroup {
  return {
    id: '740098000',
    name: 'Stockholm',
    group_type: 'META_STOP',
    transport_modes: ['BUS', 'METRO'],
    stops: [createStop()],
    ...overrides,
  };
}

export function createNationalStopGroupResponse(
  overrides: Partial<NationalStopGroupResponse> = {},
): NationalStopGroupResponse {
  return {
    timestamp: '2025-03-31T16:30:00',
    queryDetails: {
      queryTime: '2025-03-31T16:30:00',
      query: 'Stockholm',
    },
    stopGroups: [createStopGroup()],
    ...overrides,
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function isValidDateTimeString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidStopId(value: string): boolean {
  return typeof value === 'string' && value.length > 0;
}

export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function validateStop(stop: Stop): void {
  expect(stop.id).toBeDefined();
  expect(stop.name).toBeDefined();
  expect(stop.lat).toBeTypeOf('number');
  expect(stop.lon).toBeTypeOf('number');
  expect(isValidCoordinate(stop.lat, stop.lon)).toBe(true);
}

export function validateTimetableEntry(entry: TimetableEntry): void {
  expect(isValidDateTimeString(entry.scheduled)).toBe(true);
  expect(isValidDateTimeString(entry.realtime)).toBe(true);
  expect(entry.delay).toBeTypeOf('number');
  expect(entry.canceled).toBeTypeOf('boolean');
  expect(entry.is_realtime).toBeTypeOf('boolean');

  validateStop(entry.stop);
  expect(entry.route).toBeDefined();
  expect(entry.trip).toBeDefined();
  expect(entry.agency).toBeDefined();
}

// ============================================================================
// Mock Client Factory Function
// ============================================================================

export interface MockTrafikLabClient {
  setMockResponse<T extends keyof TrafikLabApiEndpoints>(endpoint: T, response: EndpointResponse<T>): void;
  request<T extends keyof TrafikLabApiEndpoints>(endpoint: T, params: EndpointParams<T>): Promise<EndpointResponse<T>>;
  clear(): void;
}

export function createMockTrafikLabClient(): MockTrafikLabClient {
  const mockResponses = new Map<string, unknown>();

  return {
    setMockResponse<T extends keyof TrafikLabApiEndpoints>(endpoint: T, response: EndpointResponse<T>): void {
      mockResponses.set(endpoint, response);
    },

    async request<T extends keyof TrafikLabApiEndpoints>(
      endpoint: T,
      _params: EndpointParams<T>,
    ): Promise<EndpointResponse<T>> {
      const response = mockResponses.get(endpoint);
      if (!response) {
        throw new Error(`No mock response set for endpoint: ${endpoint}`);
      }
      return response as EndpointResponse<T>;
    },

    clear(): void {
      mockResponses.clear();
    },
  };
}

// ============================================================================
// API Client Factory Function
// ============================================================================

export interface TrafikLabApiClient {
  getDepartures(stopId: string, apiKey?: string): Promise<DeparturesResponse>;
  getDeparturesAtTime(stopId: string, dateTime: string, apiKey?: string): Promise<DeparturesResponse>;
  getArrivals(stopId: string, apiKey?: string): Promise<ArrivalsResponse>;
  getArrivalsAtTime(stopId: string, dateTime: string, apiKey?: string): Promise<ArrivalsResponse>;
  searchStops(searchValue: string, apiKey?: string): Promise<NationalStopGroupResponse>;
  getAllStops(apiKey?: string): Promise<NationalStopGroupResponse>;
}

export function createTrafikLabApiClient(
  baseUrl: string = 'https://realtime-api.trafiklab.se/v1',
  defaultApiKey?: string,
): TrafikLabApiClient {
  async function request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${baseUrl}${endpoint}`);

    // Add API key
    if (defaultApiKey) {
      url.searchParams.set('key', defaultApiKey);
    }

    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  return {
    async getDepartures(stopId: string, apiKey?: string): Promise<DeparturesResponse> {
      const params: Record<string, string> = apiKey ? { key: apiKey } : {};
      return request<DeparturesResponse>(`/departures/${stopId}`, params);
    },

    async getDeparturesAtTime(stopId: string, dateTime: string, apiKey?: string): Promise<DeparturesResponse> {
      const params: Record<string, string> = apiKey ? { key: apiKey } : {};
      return request<DeparturesResponse>(`/departures/${stopId}/${dateTime}`, params);
    },

    async getArrivals(stopId: string, apiKey?: string): Promise<ArrivalsResponse> {
      const params: Record<string, string> = apiKey ? { key: apiKey } : {};
      return request<ArrivalsResponse>(`/arrivals/${stopId}`, params);
    },

    async getArrivalsAtTime(stopId: string, dateTime: string, apiKey?: string): Promise<ArrivalsResponse> {
      const params: Record<string, string> = apiKey ? { key: apiKey } : {};
      return request<ArrivalsResponse>(`/arrivals/${stopId}/${dateTime}`, params);
    },

    async searchStops(searchValue: string, apiKey?: string): Promise<NationalStopGroupResponse> {
      const params: Record<string, string> = apiKey ? { key: apiKey } : {};
      return request<NationalStopGroupResponse>(`/stops/name/${searchValue}`, params);
    },

    async getAllStops(apiKey?: string): Promise<NationalStopGroupResponse> {
      const params: Record<string, string> = apiKey ? { key: apiKey } : {};
      return request<NationalStopGroupResponse>(`/stops/list`, params);
    },
  };
}
