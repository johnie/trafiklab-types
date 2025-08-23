import { describe, expect, it } from 'vitest';
import { createTrafikLabApiClient } from './mocks/mock-data';

describe('TrafikLab API Integration Tests', () => {
  const client = createTrafikLabApiClient();
  const testApiKey = 'test-api-key';

  describe('Departures API', () => {
    it('should fetch current departures for a stop', async () => {
      const response = await client.getDepartures('740020101', testApiKey);

      expect(response).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(response.queryDetails).toBeDefined();
      expect(response.queryDetails.query).toBe('740020101');
      expect(Array.isArray(response.departures)).toBe(true);
      expect(Array.isArray(response.stops)).toBe(true);
    });

    it('should fetch departures for a specific time', async () => {
      const dateTime = '2025-03-31T16:30';
      const response = await client.getDeparturesAtTime('740020101', dateTime, testApiKey);

      expect(response).toBeDefined();
      expect(response.queryDetails.query).toBe('740020101');
    });

    it('should handle missing API key', async () => {
      await expect(client.getDepartures('740020101')).rejects.toThrow('HTTP 401');
    });
  });

  describe('Arrivals API', () => {
    it('should fetch current arrivals for a stop', async () => {
      const response = await client.getArrivals('740020101', testApiKey);

      expect(response).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(response.queryDetails).toBeDefined();
      expect(Array.isArray(response.arrivals)).toBe(true);
    });

    it('should fetch arrivals for a specific time', async () => {
      const dateTime = '2025-03-31T16:30';
      const response = await client.getArrivalsAtTime('740020101', dateTime, testApiKey);

      expect(response).toBeDefined();
      expect(response.queryDetails.query).toBe('740020101');
    });
  });

  describe('Stop Lookup API', () => {
    it('should search for stops by name', async () => {
      const response = await client.searchStops('Stockholm', testApiKey);

      expect(response).toBeDefined();
      expect(response.queryDetails.query).toBe('Stockholm');
      expect(Array.isArray(response.stopGroups)).toBe(true);
      expect(response.stopGroups.length).toBeGreaterThan(0);
      expect(response.stopGroups[0].name).toBe('Stockholm');
    });

    it('should fetch all stops', async () => {
      const response = await client.getAllStops(testApiKey);

      expect(response).toBeDefined();
      expect(Array.isArray(response.stopGroups)).toBe(true);
      expect(response.stopGroups.length).toBe(3); // Based on our mock
    });
  });
});
