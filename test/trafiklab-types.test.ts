import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { EndpointParams } from '../src/index';
import { ALERT_TYPES, TRANSPORT_MODES } from '../src/index';
import {
  createAlert,
  createArrivalsResponse,
  createDeparturesResponse,
  createMockTrafikLabClient,
  createNationalStopGroupResponse,
  createRoute,
  createStop,
  createStopGroup,
  createTimetableEntry,
  isValidCoordinate,
  isValidDateString,
  isValidDateTimeString,
  type MockTrafikLabClient,
  validateStop,
  validateTimetableEntry,
} from './mocks/mock-data';

describe('TrafikLab API Types', () => {
  describe('Mock Data Factory', () => {
    it('should create valid Stop objects', () => {
      const stop = createStop();

      expect(stop.id).toBe('12799');
      expect(stop.name).toBe('Slussen');
      expect(stop.lat).toBe(59.319522);
      expect(stop.lon).toBe(18.072027);

      validateStop(stop);
    });

    it('should create valid Stop objects with overrides', () => {
      const stop = createStop({
        id: 'custom-id',
        name: 'Custom Stop',
        lat: 60.0,
        lon: 15.0,
      });

      expect(stop.id).toBe('custom-id');
      expect(stop.name).toBe('Custom Stop');
      expect(stop.lat).toBe(60.0);
      expect(stop.lon).toBe(15.0);

      validateStop(stop);
    });

    it('should create valid TimetableEntry objects', () => {
      const entry = createTimetableEntry();

      validateTimetableEntry(entry);
      expect(entry.delay).toBe(-46);
      expect(entry.canceled).toBe(false);
      expect(entry.is_realtime).toBe(true);
    });

    it('should create valid DeparturesResponse objects', () => {
      const response = createDeparturesResponse();

      expect(isValidDateTimeString(response.timestamp)).toBe(true);
      expect(response.queryDetails).toBeDefined();
      expect(response.stops).toHaveLength(1);
      expect(response.departures).toHaveLength(1);

      response.departures.forEach((departure) => {
        validateTimetableEntry(departure);
      });
    });
  });

  describe('Type Validators', () => {
    it('should validate date-time strings correctly', () => {
      expect(isValidDateTimeString('2025-03-31T16:30:00')).toBe(true);
      expect(isValidDateTimeString('2025-03-31T16:30:00Z')).toBe(true);
      expect(isValidDateTimeString('invalid-date')).toBe(false);
      expect(isValidDateTimeString('')).toBe(false);
    });

    it('should validate date strings correctly', () => {
      expect(isValidDateString('2025-03-31')).toBe(true);
      expect(isValidDateString('2025-12-01')).toBe(true);
      expect(isValidDateString('25-03-31')).toBe(false);
      expect(isValidDateString('2025/03/31')).toBe(false);
    });

    it('should validate coordinates correctly', () => {
      expect(isValidCoordinate(59.319522, 18.072027)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(0, 181)).toBe(false);
    });
  });

  describe('Transport Modes and Alert Types', () => {
    it('should have correct transport mode constants', () => {
      expect(TRANSPORT_MODES.BUS).toBe('BUS');
      expect(TRANSPORT_MODES.METRO).toBe('METRO');
      expect(TRANSPORT_MODES.TRAIN).toBe('TRAIN');
      expect(TRANSPORT_MODES.TRAM).toBe('TRAM');
      expect(TRANSPORT_MODES.FERRY).toBe('FERRY');
      expect(TRANSPORT_MODES.SHIP).toBe('SHIP');
    });

    it('should have correct alert type constants', () => {
      expect(ALERT_TYPES.MAINTENANCE).toBe('MAINTENANCE');
      expect(ALERT_TYPES.DISRUPTION).toBe('DISRUPTION');
      expect(ALERT_TYPES.INFORMATION).toBe('INFORMATION');
      expect(ALERT_TYPES.WARNING).toBe('WARNING');
    });
  });

  describe('Mock API Client', () => {
    let client: MockTrafikLabClient;

    beforeEach(() => {
      client = createMockTrafikLabClient();
    });

    afterEach(() => {
      client.clear();
    });

    it('should handle departures endpoint correctly', async () => {
      const mockResponse = createDeparturesResponse();
      client.setMockResponse('GET /departures/{stopId}', mockResponse);

      const params: EndpointParams<'GET /departures/{stopId}'> = {
        stopId: '740020101',
        key: 'test-api-key',
      };

      const response = await client.request('GET /departures/{stopId}', params);

      expect(response).toEqual(mockResponse);
      expect(response.departures).toHaveLength(1);
      validateTimetableEntry(response.departures[0]);
    });

    it('should handle arrivals endpoint correctly', async () => {
      const mockResponse = createArrivalsResponse();
      client.setMockResponse('GET /arrivals/{stopId}/{dateTime}', mockResponse);

      const params: EndpointParams<'GET /arrivals/{stopId}/{dateTime}'> = {
        stopId: '740020101',
        dateTime: '2025-03-31T16:30:00',
        key: 'test-api-key',
      };

      const response = await client.request('GET /arrivals/{stopId}/{dateTime}', params);

      expect(response).toEqual(mockResponse);
      expect(response.arrivals).toHaveLength(1);
    });

    it('should handle stop lookup endpoint correctly', async () => {
      const mockResponse = createNationalStopGroupResponse();
      client.setMockResponse('GET /stops/name/{searchValue}', mockResponse);

      const params: EndpointParams<'GET /stops/name/{searchValue}'> = {
        searchValue: 'Stockholm',
        key: 'test-api-key',
      };

      const response = await client.request('GET /stops/name/{searchValue}', params);

      expect(response).toEqual(mockResponse);
      expect(response.stopGroups).toHaveLength(1);
      expect(response.stopGroups[0].stops).toHaveLength(1);
    });

    it('should throw error for unmocked endpoints', async () => {
      const params: EndpointParams<'GET /stops/list'> = {
        key: 'test-api-key',
      };

      await expect(client.request('GET /stops/list', params)).rejects.toThrow(
        'No mock response set for endpoint: GET /stops/list',
      );
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate complete departures response structure', () => {
      const response = createDeparturesResponse({
        departures: [
          createTimetableEntry(),
          createTimetableEntry({
            delay: 120,
            canceled: true,
            route: createRoute({
              transport_mode: 'METRO',
              designation: '1',
            }),
          }),
        ],
      });

      expect(response.departures).toHaveLength(2);
      expect(response.departures[0].delay).toBe(-46);
      expect(response.departures[1].delay).toBe(120);
      expect(response.departures[1].canceled).toBe(true);
      expect(response.departures[1].route.transport_mode).toBe('METRO');
    });

    it('should validate alerts structure', () => {
      const alert = createAlert({
        type: 'DISRUPTION',
        title: 'Service disruption',
        text: 'Temporary service disruption due to maintenance work.',
      });

      const entry = createTimetableEntry({
        alerts: [alert],
      });

      expect(entry.alerts).toHaveLength(1);
      expect(entry.alerts[0].type).toBe('DISRUPTION');
      expect(entry.alerts[0].title).toBe('Service disruption');
    });

    it('should validate stop group structure with multiple stops', () => {
      const stopGroup = createStopGroup({
        stops: [
          createStop({ id: '1', name: 'Stop 1' }),
          createStop({ id: '2', name: 'Stop 2' }),
          createStop({ id: '3', name: 'Stop 3' }),
        ],
      });

      expect(stopGroup.stops).toHaveLength(3);
      stopGroup.stops.forEach((stop, index) => {
        expect(stop.id).toBe((index + 1).toString());
        expect(stop.name).toBe(`Stop ${index + 1}`);
        validateStop(stop);
      });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty arrays gracefully', () => {
      const response = createDeparturesResponse({
        departures: [],
        stops: [],
      });

      expect(response.departures).toHaveLength(0);
      expect(response.stops).toHaveLength(0);
      expect(response.queryDetails).toBeDefined();
    });

    it('should handle null route name', () => {
      const route = createRoute({
        name: null,
      });

      expect(route.name).toBeNull();
      expect(route.designation).toBeDefined();
    });

    it('should handle extreme delay values', () => {
      const earlyDeparture = createTimetableEntry({
        delay: -300, // 5 minutes early
      });

      const lateDeparture = createTimetableEntry({
        delay: 1800, // 30 minutes late
      });

      expect(earlyDeparture.delay).toBe(-300);
      expect(lateDeparture.delay).toBe(1800);
    });

    it('should validate coordinates at boundaries', () => {
      const northPole = createStop({
        lat: 90,
        lon: 0,
      });

      const southPole = createStop({
        lat: -90,
        lon: 0,
      });

      validateStop(northPole);
      validateStop(southPole);
    });
  });
});
