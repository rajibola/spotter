import { useState, useCallback } from 'react';
import { flightAPI } from '../services/flightAPI';
import {
  Airport,
  FlightSearchResponse,
  FlightDetailsResponse,
  FlightSearchParams,
  AirportSearchParams,
} from '../services/types';

interface UseFlightSearchReturn {
  // Loading states
  isLoadingAirports: boolean;
  isLoadingFlights: boolean;
  isLoadingDetails: boolean;
  
  // Data states
  airports: Airport[];
  flightResults: FlightSearchResponse | null;
  flightDetails: FlightDetailsResponse | null;
  
  // Error states
  airportsError: string | null;
  flightsError: string | null;
  detailsError: string | null;
  
  // Functions
  searchAirports: (params: AirportSearchParams) => Promise<void>;
  searchFlights: (params: FlightSearchParams) => Promise<FlightSearchResponse>;
  getFlightDetails: (legs: { destination: string; origin: string; date: string }[]) => Promise<void>;
  clearAirports: () => void;
  clearFlightResults: () => void;
  clearFlightDetails: () => void;
  clearErrors: () => void;
}

export const useFlightSearch = (): UseFlightSearchReturn => {
  // Loading states
  const [isLoadingAirports, setIsLoadingAirports] = useState<boolean>(false);
  const [isLoadingFlights, setIsLoadingFlights] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  
  // Data states
  const [airports, setAirports] = useState<Airport[]>([]);
  const [flightResults, setFlightResults] = useState<FlightSearchResponse | null>(null);
  const [flightDetails, setFlightDetails] = useState<FlightDetailsResponse | null>(null);
  
  // Error states
  const [airportsError, setAirportsError] = useState<string | null>(null);
  const [flightsError, setFlightsError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

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

  // Get flight details function
  const getFlightDetails = useCallback(async (legs: { destination: string; origin: string; date: string }[]): Promise<void> => {
    try {
      setIsLoadingDetails(true);
      setDetailsError(null);
      
      const details = await flightAPI.getFlightDetails(legs);
      setFlightDetails(details);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get flight details';
      setDetailsError(errorMessage);
      console.error('Flight details error:', error);
    } finally {
      setIsLoadingDetails(false);
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

  const clearFlightDetails = useCallback((): void => {
    setFlightDetails(null);
    setDetailsError(null);
  }, []);

  const clearErrors = useCallback((): void => {
    setAirportsError(null);
    setFlightsError(null);
    setDetailsError(null);
  }, []);

  return {
    // Loading states
    isLoadingAirports,
    isLoadingFlights,
    isLoadingDetails,
    
    // Data states
    airports,
    flightResults,
    flightDetails,
    
    // Error states
    airportsError,
    flightsError,
    detailsError,
    
    // Functions
    searchAirports,
    searchFlights,
    getFlightDetails,
    clearAirports,
    clearFlightResults,
    clearFlightDetails,
    clearErrors,
  };
};

export default useFlightSearch;