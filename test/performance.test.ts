import { describe, expect, it } from 'vitest';
import { createDeparturesResponse, createRoute, createTimetableEntry, createTrip } from './mocks/mock-data';

describe('Performance Tests', () => {
  it('should handle large response datasets efficiently', () => {
    const startTime = performance.now();

    // Create a large dataset
    const largeDepartures = Array.from({ length: 1000 }, (_, i) =>
      createTimetableEntry({
        trip: createTrip({
          trip_id: `trip_${i}`,
        }),
        route: createRoute({
          designation: (i % 10).toString(),
        }),
      }),
    );

    const response = createDeparturesResponse({
      departures: largeDepartures,
    });

    const endTime = performance.now();

    expect(response.departures).toHaveLength(1000);
    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should efficiently validate large datasets', () => {
    const largeDepartures = Array.from({ length: 500 }, () => createTimetableEntry());

    const startTime = performance.now();

    largeDepartures.forEach((departure) => {
      expect(departure.scheduled).toBeDefined();
      expect(departure.realtime).toBeDefined();
      expect(typeof departure.delay).toBe('number');
    });

    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(50); // Should validate quickly
  });
});
