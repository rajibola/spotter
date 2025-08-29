import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AirportPicker from '../../components/AirportPicker';
import FlightResults from '../../components/FlightResults';
import { useFlightSearch } from '../../hooks/useFlightSearch';
import { Airport, Itinerary } from '../../services/types';

export default function SearchScreen() {
  const { 
    searchFlights, 
    isLoadingFlights, 
    flightsError, 
    flightResults,
    searchAirports, 
    isLoadingAirports,
    clearFlightResults
  } = useFlightSearch();
  
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);

  // Validate search form
  const validateSearch = (): boolean => {
    if (!originAirport) {
      Alert.alert('Error', 'Please select origin airport');
      return false;
    }
    
    if (!destinationAirport) {
      Alert.alert('Error', 'Please select destination airport');
      return false;
    }
    
    if (originAirport.skyId === destinationAirport.skyId) {
      Alert.alert('Error', 'Origin and destination cannot be the same');
      return false;
    }
    
    return true;
  };

  // Handle search flights
  const handleSearchFlights = async (): Promise<void> => {
    if (!validateSearch()) {
      return;
    }

    console.log('Starting flight search...');
    console.log('Origin Airport:', originAirport);
    console.log('Destination Airport:', destinationAirport);

    try {
      const searchParams = {
        originSkyId: originAirport!.skyId,
        destinationSkyId: destinationAirport!.skyId,
        originEntityId: originAirport!.entityId,
        destinationEntityId: destinationAirport!.entityId,
        cabinClass: 'economy',
        adults: '1',
        sortBy: 'best',
        currency: 'USD',
        market: 'en-US',
        countryCode: 'QA',
      };
      
      console.log('Search params:', searchParams);
      
      await searchFlights(searchParams);
    } catch (error) {
      console.error('Flight search error:', error);
    }
  };

  // Swap origin and destination
  const swapAirports = (): void => {
    const temp = originAirport;
    setOriginAirport(destinationAirport);
    setDestinationAirport(temp);
  };

  // Handle flight selection
  const handleFlightSelect = (itinerary: Itinerary): void => {
    try {
      // Navigate to flight details page with the selected itinerary
      router.push({
        pathname: '/flight-details',
        params: {
          itinerary: JSON.stringify(itinerary)
        }
      });
    } catch (error) {
      console.error('Error navigating to flight details:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to open flight details. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Start new search
  const startNewSearch = (): void => {
    clearFlightResults();
  };

  // Test API connection
  const testApiConnection = async (): Promise<void> => {
    try {
      console.log('Testing flight search with known working parameters...');
      // Test with the exact same params as your curl sample
      const testParams = {
        originSkyId: 'LOND',
        destinationSkyId: 'NYCA',
        originEntityId: '27544008',
        destinationEntityId: '27537542',
        cabinClass: 'economy',
        adults: '1',
        sortBy: 'best',
        currency: 'USD',
        market: 'en-US',
        countryCode: 'US',
      };
      
      const results = await searchFlights(testParams);
      const flightCount = results?.itineraries?.length || 0;
      console.log('Test results structure:', {
        hasContext: !!results?.context,
        contextStatus: results?.context?.status,
        totalResults: results?.context?.totalResults,
        hasItineraries: !!results?.itineraries,
        itinerariesLength: results?.itineraries?.length,
        hasFilterStats: !!results?.filterStats,
      });
      
      if (flightCount > 0) {
        Alert.alert('API Test Success', `Found ${flightCount} flights with test parameters!`);
      } else {
        Alert.alert('API Working but No Flights', 
          `API responded successfully but found 0 flights.\nContext status: ${results?.context?.status || 'unknown'}\nTotal results: ${results?.context?.totalResults || 0}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'API test failed';
      Alert.alert('API Test Failed', errorMessage);
    }
  };

  // Show results if we have them
  if (flightResults || isLoadingFlights) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={startNewSearch}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← New Search</Text>
          </TouchableOpacity>
          <Text style={styles.resultsHeaderTitle}>Flight Results</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        <FlightResults
          results={flightResults}
          isLoading={isLoadingFlights}
          error={flightsError}
          onFlightSelect={handleFlightSelect}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Find Your Perfect Flight</Text>
            <Text style={styles.subtitle}>
              Search and compare flights from thousands of airlines
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.airportContainer}>
              <AirportPicker
                label="From"
                placeholder="Select origin airport"
                selectedAirport={originAirport}
                onAirportSelect={setOriginAirport}
                style={styles.airportPicker}
              />

              <TouchableOpacity
                style={styles.swapButton}
                onPress={swapAirports}
                activeOpacity={0.7}
              >
                <Text style={styles.swapButtonText}>⇅</Text>
              </TouchableOpacity>

              <AirportPicker
                label="To"
                placeholder="Select destination airport"
                selectedAirport={destinationAirport}
                onAirportSelect={setDestinationAirport}
                style={styles.airportPicker}
              />
            </View>


            <TouchableOpacity
              style={[
                styles.searchButton,
                isLoadingFlights && styles.searchButtonDisabled
              ]}
              onPress={handleSearchFlights}
              disabled={isLoadingFlights}
              activeOpacity={0.8}
            >
              {isLoadingFlights ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.searchButtonText}>Searching...</Text>
                </View>
              ) : (
                <Text style={styles.searchButtonText}>Search Flights</Text>
              )}
            </TouchableOpacity>

            {flightsError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{flightsError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.testButton}
              onPress={testApiConnection}
              activeOpacity={0.8}
            >
              <Text style={styles.testButtonText}>Test API Connection</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Why Choose Our Flight Search?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✈️</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Comprehensive Search</Text>
                  <Text style={styles.featureDescription}>
                    Search across multiple airlines and booking sites
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💰</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Best Prices</Text>
                  <Text style={styles.featureDescription}>
                    Compare prices to find the best deals available
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔍</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Detailed Information</Text>
                  <Text style={styles.featureDescription}>
                    View comprehensive flight details and booking options
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  airportContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  airportPicker: {
    marginBottom: 8,
  },
  swapButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: '#2563EB',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  swapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  resultsHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 80,
  },
});
