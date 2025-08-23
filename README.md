# trafiklab-types

TypeScript definitions for the Trafiklab public transport API, providing comprehensive type safety for Swedish public transport data.

## Features

- 🚌 **Complete API Coverage** - Types for Departure Board, Arrival Board, and Stop Lookup APIs
- 🔒 **Type Safety** - Full TypeScript support with strict typing
- 🧪 **Testing Utilities** - Mock data factories and test helpers included
- 📍 **Real-time Data** - Support for real-time departures, arrivals, and service alerts
- 🏗️ **Developer Friendly** - Clean, well-documented interfaces with utility types

## Installation

```bash
# npm
npm install trafiklab-types

# pnpm
pnpm add trafiklab-types

# bun
bun install trafiklab-types
```

## Quick Start

```typescript
import type { 
  DeparturesResponse, 
  ArrivalsResponse, 
  StopGroup,
  TimetableEntry 
} from 'trafiklab-types';

// Use types in your API calls
async function getDepartures(stopId: string): Promise<DeparturesResponse> {
  const response = await fetch(`https://api.trafiklab.se/v1/departures/${stopId}`);
  return response.json();
}

// Type-safe data handling
function processDeparture(departure: TimetableEntry) {
  console.log(`${departure.route.designation} to ${departure.route.destination.name}`);
  console.log(`Scheduled: ${departure.scheduled}, Delay: ${departure.delay}s`);
  
  if (departure.canceled) {
    console.log('⚠️ This departure is canceled');
  }
}
```

## API Coverage

### Departure Board API
- `GET /departures/{stopId}` - Current departures
- `GET /departures/{stopId}/{dateTime}` - Departures at specific time

### Arrival Board API  
- `GET /arrivals/{stopId}` - Current arrivals
- `GET /arrivals/{stopId}/{dateTime}` - Arrivals at specific time

### Stop Lookup API
- `GET /stops/name/{searchValue}` - Search stops by name
- `GET /stops/list` - Get all stops

## Key Types

```typescript
interface TimetableEntry {
  scheduled: string;        // ISO datetime
  realtime: string;         // ISO datetime  
  delay: number;           // Delay in seconds
  canceled: boolean;
  route: Route;
  trip: Trip;
  stop: Stop;
  alerts: Alert[];
  is_realtime: boolean;
}

interface StopGroup {
  id: string;
  name: string;
  group_type: string;
  transport_modes: string[];
  stops: Stop[];
}
```

## Transport Modes

```typescript
import { TRANSPORT_MODES, type TransportMode } from 'trafiklab-types';

// Available modes: BUS, METRO, TRAIN, TRAM, FERRY, SHIP
const mode: TransportMode = TRANSPORT_MODES.BUS;
```

## Testing Utilities

Perfect for testing your Trafiklab integrations:

```typescript
import { 
  createDeparturesResponse,
  createTimetableEntry,
  createMockTrafikLabClient 
} from 'trafiklab-types';

// Create mock data
const mockDeparture = createTimetableEntry({
  delay: 120,
  route: { designation: '3', transport_mode: 'BUS' }
});

// Use mock client in tests
const client = createMockTrafikLabClient();
client.setMockResponse('GET /departures/{stopId}', mockResponse);
```

## Utility Types

Extract endpoint information with utility types:

```typescript
import type { 
  EndpointParams, 
  EndpointResponse,
  ExtractMethod,
  ExtractPath 
} from 'trafiklab-types';

type DepartureParams = EndpointParams<'GET /departures/{stopId}'>;
// => { stopId: string; key: string }

type DepartureResponse = EndpointResponse<'GET /departures/{stopId}'>;  
// => DeparturesResponse
```

## Development

```bash
# Install dependencies
bun install

# Run tests  
bun test

# Build types
bun run build

# Lint and format
bun run check
```

## Contributing

Contributions are welcome! Please ensure all tests pass and follow the existing code style.

## License

MIT © [Johnie Hjelm](https://github.com/johnie)

## Related

- [Trafiklab API Documentation](https://www.trafiklab.se/)
- [Swedish Public Transport Data](https://www.trafiklab.se/api)
