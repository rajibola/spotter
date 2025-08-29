import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  Airport,
  FlightSearchResponse,
  FlightDetailsResponse,
  PriceCalendarResponse,
  FlightSearchParams,
  AirportSearchParams,
  PriceCalendarParams,
} from './types';

const API_BASE_URL = 'https://sky-scrapper.p.rapidapi.com/api';

// Get API key from Expo environment variables
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;

// Validate API key is available
if (!RAPIDAPI_KEY) {
  throw new Error('EXPO_PUBLIC_RAPIDAPI_KEY is not defined in environment variables. Please check your .env file and ensure the variable name starts with EXPO_PUBLIC_.');
}

// Log API key status (first few characters only for security)
console.log('API Key loaded:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 8)}...` : 'Not found');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API response error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please check your API key.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access forbidden. Please check your API subscription.');
    }
    if (error.response?.status === 400) {
      throw new Error(`Bad request: ${error.response?.data?.message || 'Invalid parameters'}`);
    }
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    throw new Error(error.response?.data?.message || `API Error (${error.response?.status})`);
  }
);

export const flightAPI = {
  // Search for airports
  searchAirports: async (params: AirportSearchParams): Promise<Airport[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Airport[]>> = await api.get('/v1/flights/searchAirport', {
        params: {
          query: params.query,
          locale: params.locale || 'en-US',
        },
      });
      
      if (!response.data.status) {
        throw new Error('Failed to search airports');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error searching airports:', error);
      throw error;
    }
  },

  // Search for flights
  searchFlights: async (params: FlightSearchParams): Promise<FlightSearchResponse> => {
    try {
      const requestParams = {
        originSkyId: params.originSkyId,
        destinationSkyId: params.destinationSkyId,
        originEntityId: params.originEntityId,
        destinationEntityId: params.destinationEntityId,
        date: params.date || '2025-12-25', // Add default date (updated year)
        cabinClass: params.cabinClass || 'economy',
        adults: params.adults || '1',
        sortBy: params.sortBy || 'best',
        currency: params.currency || 'USD',
        market: params.market || 'en-US',
        countryCode: params.countryCode || 'US',
      };
      
      console.log('Searching flights with params:', requestParams);
      
      const response: AxiosResponse<ApiResponse<FlightSearchResponse>> = await api.get('/v2/flights/searchFlights', {
        params: requestParams,
      });
      
      console.log('Flight search response status:', response.data.status);
      console.log('Flight search response data keys:', Object.keys(response.data.data || {}));
      console.log('Full response data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data.status) {
        throw new Error(`Failed to search flights - API returned status false. Response: ${JSON.stringify(response.data)}`);
      }
      
      if (!response.data.data) {
        throw new Error('No flight data returned from API');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  },

  // Get flight details
  getFlightDetails: async (
    legs: { destination: string; origin: string; date: string }[],
    adults: string = '1',
    currency: string = 'USD'
  ): Promise<FlightDetailsResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<FlightDetailsResponse>> = await api.get('/v1/flights/getFlightDetails', {
        params: {
          legs: JSON.stringify(legs),
          adults,
          currency,
          locale: 'en-US',
          market: 'en-US',
          cabinClass: 'economy',
          countryCode: 'US',
        },
      });
      
      if (!response.data.status) {
        throw new Error('Failed to get flight details');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting flight details:', error);
      throw error;
    }
  },

  // Get price calendar
  getPriceCalendar: async (params: PriceCalendarParams): Promise<PriceCalendarResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<PriceCalendarResponse>> = await api.get('/v1/flights/getPriceCalendar', {
        params: {
          originSkyId: params.originSkyId,
          destinationSkyId: params.destinationSkyId,
          fromDate: params.fromDate,
          currency: params.currency || 'USD',
        },
      });
      
      if (!response.data.status) {
        throw new Error('Failed to get price calendar');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting price calendar:', error);
      throw error;
    }
  },
};

export default flightAPI;