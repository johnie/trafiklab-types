// Trafiklab Departure Board, Arrival Board and Stop lookup API Types

// ============================================================================
// Base Types and Schemas
// ============================================================================

export interface QueryDetails {
  /** The time which was queried was made. */
  queryTime: string; // date-time format
  /** The query parameter which was used for this request (e.g., stop ID or other identifier). */
  query: string;
}

export interface Platform {
  /** Platform ID. */
  id: string;
  /** Platform designation (e.g., A, B). */
  designation: string;
}

export interface Alert {
  /** The type/category of the alert. */
  type: string;
  /** The title or summary of the alert. */
  title: string;
  /** A detailed description of the alert. */
  text: string;
}

export interface Stop {
  /** Stop ID. */
  id: string;
  /** Stop name. */
  name: string;
  /** Latitude of the stop. */
  lat: number;
  /** Longitude of the stop. */
  lon: number;
}

export interface RealtimeStop {
  /** Stop ID. */
  id: string;
  /** Stop name. */
  name: string;
  /** Latitude of the stop. */
  lat: number;
  /** Longitude of the stop. */
  lon: number;
  /** Transport modes available at the stop. */
  transport_modes: string[];
  /** Alerts related to the stop. */
  alerts: Alert[];
}

export interface StopGroup {
  /** Stop group ID. */
  id: string;
  /** Stop name. */
  name: string;
  /** Describing if the stop group is a meta stop or rikshallplats. */
  group_type: string;
  /** Transport modes available at the stop. */
  transport_modes: string[];
  /** Stops within the stop group. */
  stops: Stop[];
}

export interface Agency {
  /** Agency ID. */
  id: string;
  /** Name of the agency. */
  name: string;
  /** Operator responsible for the trip. */
  operator: string;
}

export interface Trip {
  /** Unique identifier for the trip. */
  trip_id: string;
  /** Trip start date in YYYY-MM-DD format. */
  start_date: string; // date format
  /** Technical number associated with the trip. */
  technical_number: number;
}

export interface Route {
  /** Optional route name. */
  name: string | null;
  /** Route designation (e.g., line number or service). */
  designation: string;
  /** Code representing the mode of transport. */
  transport_mode_code: number;
  /** Type of transport (e.g., BUS, METRO). */
  transport_mode: string;
  /** Direction of the route. */
  direction: string;
  /** Origin stop. */
  origin: Stop;
  /** Destination stop. */
  destination: Stop;
}

export interface TimetableEntry {
  /** Scheduled departure or arrival time. */
  scheduled: string; // date-time format
  /** Real-time departure or arrival time, if available. */
  realtime: string; // date-time format
  /** Delay in seconds. A negative value indicates an early departure or arrival. */
  delay: number;
  /** Indicates whether the trip was canceled. */
  canceled: boolean;
  /** Route details. */
  route: Route;
  /** Trip details. */
  trip: Trip;
  /** Agency details. */
  agency: Agency;
  /** Stop details. */
  stop: Stop;
  /** Scheduled platform. */
  scheduled_platform: Platform;
  /** Real-time platform. */
  realtime_platform: Platform;
  /** List of alerts related to this timetable entry. */
  alerts: Alert[];
  /** Indicates if the data is based on real-time information. */
  is_realtime: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

export interface DeparturesResponse {
  /** The timestamp of the response. May be in the past for cached responses. */
  timestamp: string; // date-time format
  /** Query details. */
  queryDetails: QueryDetails;
  /** List of stops. */
  stops: RealtimeStop[];
  /** A list of departures. */
  departures: TimetableEntry[];
}

export interface ArrivalsResponse {
  /** The timestamp of the response. May be in the past for cached responses. */
  timestamp: string; // date-time format
  /** Query details. */
  queryDetails: QueryDetails;
  /** List of stops. */
  stops: RealtimeStop[];
  /** A list of arrivals. */
  arrivals: TimetableEntry[];
}

export interface NationalStopGroupResponse {
  /** The timestamp of the response. May be in the past for cached responses. */
  timestamp: string; // date-time format
  /** Query details. */
  queryDetails: QueryDetails;
  /** A list of stop groups. */
  stopGroups: StopGroup[];
}

// ============================================================================
// API Parameter Types
// ============================================================================

export interface StopIdParam {
  /** The ID of the stop (e.g., "740020101"). */
  stopId: string;
}

export interface DateTimeParam {
  /** The date and time of the query in ISO 8601 format (e.g., "2025-03-31T16:30"). */
  dateTime: string; // date-time format
}

export interface SearchValueParam {
  /** The name to search for (minimum 3 characters). */
  searchValue: string;
}

export interface ApiKeyParam {
  /** API key for authentication. */
  key: string;
}

// ============================================================================
// Endpoint Types
// ============================================================================

export namespace StopLookup {
  export interface GetStopsByNameParams extends SearchValueParam, ApiKeyParam {}
  export interface GetStopsByNameResponse extends NationalStopGroupResponse {}

  export interface GetAllStopsParams extends ApiKeyParam {}
  export interface GetAllStopsResponse extends NationalStopGroupResponse {}
}

export namespace DepartureBoard {
  export interface GetCurrentDeparturesParams
    extends StopIdParam,
      ApiKeyParam {}
  export interface GetCurrentDeparturesResponse extends DeparturesResponse {}

  export interface GetDeparturesAtTimeParams
    extends StopIdParam,
      DateTimeParam,
      ApiKeyParam {}
  export interface GetDeparturesAtTimeResponse extends DeparturesResponse {}
}

export namespace ArrivalBoard {
  export interface GetCurrentArrivalsParams extends StopIdParam, ApiKeyParam {}
  export interface GetCurrentArrivalsResponse extends ArrivalsResponse {}

  export interface GetArrivalsAtTimeParams
    extends StopIdParam,
      DateTimeParam,
      ApiKeyParam {}
  export interface GetArrivalsAtTimeResponse extends ArrivalsResponse {}
}

// ============================================================================
// API Client Types
// ============================================================================

export interface TrafikLabApiEndpoints {
  /** List stop groups (matching a name). */
  "GET /stops/name/{searchValue}": {
    params: StopLookup.GetStopsByNameParams;
    response: StopLookup.GetStopsByNameResponse;
  };

  /** List all stop groups. */
  "GET /stops/list": {
    params: StopLookup.GetAllStopsParams;
    response: StopLookup.GetAllStopsResponse;
  };

  /** Get Departure Information (Current). */
  "GET /departures/{stopId}": {
    params: DepartureBoard.GetCurrentDeparturesParams;
    response: DepartureBoard.GetCurrentDeparturesResponse;
  };

  /** Get Departure Information (Specific Time). */
  "GET /departures/{stopId}/{dateTime}": {
    params: DepartureBoard.GetDeparturesAtTimeParams;
    response: DepartureBoard.GetDeparturesAtTimeResponse;
  };

  /** Get Arrival Information (Current). */
  "GET /arrivals/{stopId}": {
    params: ArrivalBoard.GetCurrentArrivalsParams;
    response: ArrivalBoard.GetCurrentArrivalsResponse;
  };

  /** Get Arrival Information (Specific Time). */
  "GET /arrivals/{stopId}/{dateTime}": {
    params: ArrivalBoard.GetArrivalsAtTimeParams;
    response: ArrivalBoard.GetArrivalsAtTimeResponse;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/** Extract endpoint method and path from a route string */
export type ExtractMethod<T extends keyof TrafikLabApiEndpoints> =
  T extends `${infer Method} ${string}` ? Method : never;

/** Extract path from a route string */
export type ExtractPath<T extends keyof TrafikLabApiEndpoints> =
  T extends `${string} ${infer Path}` ? Path : never;

/** Get parameters type for a specific endpoint */
export type EndpointParams<T extends keyof TrafikLabApiEndpoints> =
  TrafikLabApiEndpoints[T]["params"];

/** Get response type for a specific endpoint */
export type EndpointResponse<T extends keyof TrafikLabApiEndpoints> =
  TrafikLabApiEndpoints[T]["response"];

// ============================================================================
// Configuration Types
// ============================================================================

export interface TrafikLabApiConfig {
  /** Base URL for the API */
  baseUrl?: string;
  /** Default API key */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

// ============================================================================
// Transport Mode Constants
// ============================================================================

export const TRANSPORT_MODES = {
  BUS: "BUS",
  METRO: "METRO",
  TRAIN: "TRAIN",
  TRAM: "TRAM",
  FERRY: "FERRY",
  SHIP: "SHIP",
} as const;

export type TransportMode =
  (typeof TRANSPORT_MODES)[keyof typeof TRANSPORT_MODES];

// ============================================================================
// Alert Type Constants
// ============================================================================

export const ALERT_TYPES = {
  MAINTENANCE: "MAINTENANCE",
  DISRUPTION: "DISRUPTION",
  INFORMATION: "INFORMATION",
  WARNING: "WARNING",
} as const;

export type AlertType = (typeof ALERT_TYPES)[keyof typeof ALERT_TYPES];
