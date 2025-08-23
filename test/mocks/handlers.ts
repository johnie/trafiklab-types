import { HttpResponse, http } from 'msw';
import {
  createArrivalsResponse,
  createDeparturesResponse,
  createNationalStopGroupResponse,
  createStopGroup,
} from './mock-data';

export const handlers = [
  http.get('https://realtime-api.trafiklab.se/v1/stops/name/:searchValue', ({ request, params }) => {
    const url = new URL(request.url);
    const { searchValue } = params;
    const key = url.searchParams.get('key');

    if (!key) {
      return HttpResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const response = createNationalStopGroupResponse({
      queryDetails: {
        queryTime: new Date().toISOString(),
        query: searchValue as string,
      },
      stopGroups: [
        createStopGroup({
          name: searchValue as string,
        }),
      ],
    });

    return HttpResponse.json(response);
  }),

  http.get('https://realtime-api.trafiklab.se/v1/stops/list', ({ request }) => {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return HttpResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const response = createNationalStopGroupResponse({
      stopGroups: [
        createStopGroup({ name: 'Stockholm' }),
        createStopGroup({ name: 'Göteborg' }),
        createStopGroup({ name: 'Malmö' }),
      ],
    });

    return HttpResponse.json(response);
  }),

  http.get('https://realtime-api.trafiklab.se/v1/departures/:stopId', ({ request, params }) => {
    const url = new URL(request.url);
    const { stopId } = params;
    const key = url.searchParams.get('key');

    if (!key) {
      return HttpResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const response = createDeparturesResponse({
      queryDetails: {
        queryTime: new Date().toISOString(),
        query: stopId as string,
      },
    });

    return HttpResponse.json(response);
  }),

  http.get('https://realtime-api.trafiklab.se/v1/departures/:stopId/:dateTime', ({ request, params }) => {
    const url = new URL(request.url);
    const { stopId, dateTime } = params;
    const key = url.searchParams.get('key');

    if (!key) {
      return HttpResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const response = createDeparturesResponse({
      queryDetails: {
        queryTime: dateTime as string,
        query: stopId as string,
      },
    });

    return HttpResponse.json(response);
  }),

  http.get('https://realtime-api.trafiklab.se/v1/arrivals/:stopId', ({ request, params }) => {
    const url = new URL(request.url);
    const { stopId } = params;
    const key = url.searchParams.get('key');

    if (!key) {
      return HttpResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const response = createArrivalsResponse({
      queryDetails: {
        queryTime: new Date().toISOString(),
        query: stopId as string,
      },
    });

    return HttpResponse.json(response);
  }),

  http.get('https://realtime-api.trafiklab.se/v1/arrivals/:stopId/:dateTime', ({ request, params }) => {
    const url = new URL(request.url);
    const { stopId, dateTime } = params;
    const key = url.searchParams.get('key');

    if (!key) {
      return HttpResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const response = createArrivalsResponse({
      queryDetails: {
        queryTime: dateTime as string,
        query: stopId as string,
      },
    });

    return HttpResponse.json(response);
  }),
];
