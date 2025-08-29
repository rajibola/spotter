import { useState, useCallback } from 'react';
import { flightAPI } from '../services/flightAPI';
import {
  Airport,
  FlightSearchResponse,
  FlightSearchParams,
  AirportSearchParams,
} from '../services/types';

interface UseFlightSearchReturn {
  // Loading states
  isLoadingAirports: boolean;
  isLoadingFlights: boolean;
  
  // Data states
  airports: Airport[];
  flightResults: FlightSearchResponse | null;
  
  // Error states
  airportsError: string | null;
  flightsError: string | null;
  
  // Functions
  searchAirports: (params: AirportSearchParams) => Promise<void>;
  searchFlights: (params: FlightSearchParams) => Promise<FlightSearchResponse>;
  clearAirports: () => void;
  clearFlightResults: () => void;
  clearErrors: () => void;
}

export const useFlightSearch = (): UseFlightSearchReturn => {
  // Loading states
  const [isLoadingAirports, setIsLoadingAirports] = useState<boolean>(false);
  const [isLoadingFlights, setIsLoadingFlights] = useState<boolean>(false);
  
  // Data states
  const [airports, setAirports] = useState<Airport[]>([]);
  const [flightResults, setFlightResults] = useState<FlightSearchResponse | null>(null);
  
  // Error states
  const [airportsError, setAirportsError] = useState<string | null>(null);
  const [flightsError, setFlightsError] = useState<string | null>(null);

  // Search airports function
  const searchAirports = useCallback(async (params: AirportSearchParams): Promise<void> => {
    try {
      setIsLoadingAirports(true);
      setAirportsError(null);
      
      const results = await flightAPI.searchAirports(params);
      setAirports(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search airports';
      setAirportsError(errorMessage);
      console.error('Airport search error:', error);
    } finally {
      setIsLoadingAirports(false);
    }
  }, []);

  // Search flights function
  const searchFlights = useCallback(async (params: FlightSearchParams): Promise<FlightSearchResponse> => {
    try {
      setIsLoadingFlights(true);
      setFlightsError(null);
      
      const results = await flightAPI.searchFlights(params);
      setFlightResults(results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search flights';
      setFlightsError(errorMessage);
      console.error('Flight search error:', error);
      throw error;
    } finally {
      setIsLoadingFlights(false);
    }
  }, []);


  // Clear functions
  const clearAirports = useCallback((): void => {
    setAirports([]);
    setAirportsError(null);
  }, []);

  const clearFlightResults = useCallback((): void => {
    setFlightResults(null);
    setFlightsError(null);
  }, []);

  const clearErrors = useCallback((): void => {
    setAirportsError(null);
    setFlightsError(null);
  }, []);

  return {
    // Loading states
    isLoadingAirports,
    isLoadingFlights,
    
    // Data states
    airports,
    flightResults,
    
    // Error states
    airportsError,
    flightsError,
    
    // Functions
    searchAirports,
    searchFlights,
    clearAirports,
    clearFlightResults,
    clearErrors,
  };
};

export default useFlightSearch;