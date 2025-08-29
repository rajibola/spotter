import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FlightSearchResponse, Itinerary, Leg } from '../services/types';

interface FlightResultsProps {
  results: FlightSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  onFlightSelect?: (itinerary: Itinerary) => void;
}

const FlightResults: React.FC<FlightResultsProps> = ({
  results,
  isLoading,
  error,
  onFlightSelect,
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStopsText = (stopCount: number): string => {
    if (stopCount === 0) return 'Direct';
    if (stopCount === 1) return '1 stop';
    return `${stopCount} stops`;
  };

  const renderFlightLeg = (leg: Leg, isReturn: boolean = false) => (
    <View style={styles.legContainer}>
      <View style={styles.legHeader}>
        <Text style={styles.legLabel}>{isReturn ? 'Return' : 'Outbound'}</Text>
        <Text style={styles.stopsText}>{getStopsText(leg.stopCount)}</Text>
      </View>
      
      <View style={styles.routeInfo}>
        <View style={styles.airportInfo}>
          <Text style={styles.airportCode}>{leg.origin.displayCode}</Text>
          <Text style={styles.cityName}>{leg.origin.city}</Text>
          <Text style={styles.timeText}>{formatTime(leg.departure)}</Text>
          <Text style={styles.dateText}>{formatDate(leg.departure)}</Text>
        </View>
        
        <View style={styles.flightDuration}>
          <Text style={styles.durationText}>{formatDuration(leg.durationInMinutes)}</Text>
          <View style={styles.flightLine} />
        </View>
        
        <View style={styles.airportInfo}>
          <Text style={styles.airportCode}>{leg.destination.displayCode}</Text>
          <Text style={styles.cityName}>{leg.destination.city}</Text>
          <Text style={styles.timeText}>{formatTime(leg.arrival)}</Text>
          <Text style={styles.dateText}>{formatDate(leg.arrival)}</Text>
        </View>
      </View>
      
      <View style={styles.carrierInfo}>
        <Text style={styles.carrierText}>
          {leg.carriers.marketing.map(carrier => carrier.name).join(', ')}
        </Text>
      </View>
    </View>
  );

  const renderItinerary = ({ item }: { item: Itinerary }) => (
    <TouchableOpacity
      style={styles.itineraryCard}
      onPress={() => onFlightSelect?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.priceText}>{item.price.formatted}</Text>
        <View style={styles.tagsContainer}>
          {item.tags?.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {item.legs.map((leg, index) => (
        <View key={index}>{renderFlightLeg(leg, index > 0)}</View>
      ))}
      
      <View style={styles.cardFooter}>
        <View style={styles.policyInfo}>
          <Text style={styles.policyText}>
            {item.farePolicy.isChangeAllowed ? '✓ Changeable' : '✗ No changes'}
          </Text>
          <Text style={styles.policyText}>
            {item.farePolicy.isCancellationAllowed ? '✓ Refundable' : '✗ Non-refundable'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Searching for flights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!results || !results.itineraries || results.itineraries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noResultsText}>No flights found</Text>
        <Text style={styles.noResultsSubtext}>
          Try adjusting your search criteria or check different dates
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {results.itineraries.length} flights found
        </Text>
        <Text style={styles.resultsSubtitle}>
          Status: {results.context.status} • Total: {results.context.totalResults}
        </Text>
      </View>
      
      <FlatList
        data={results.itineraries}
        keyExtractor={(item) => item.id}
        renderItem={renderItinerary}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultsHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  itineraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '500',
  },
  legContainer: {
    marginBottom: 16,
  },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  legLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  stopsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  airportInfo: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cityName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
  },
  dateText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  flightDuration: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  flightLine: {
    width: 60,
    height: 2,
    backgroundColor: '#D1D5DB',
    position: 'relative',
  },
  carrierInfo: {
    alignItems: 'center',
  },
  carrierText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 4,
  },
  policyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  policyText: {
    fontSize: 10,
    color: '#6B7280',
  },
});

export default FlightResults;