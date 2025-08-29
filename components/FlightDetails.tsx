import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Itinerary, FlightDetailsResponse, Agent, Leg } from '../services/types';
import { flightAPI } from '../services/flightAPI';

interface FlightDetailsProps {
  itinerary: Itinerary;
  onBack?: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ itinerary, onBack }) => {
  const [detailsData, setDetailsData] = useState<FlightDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlightDetails();
  }, [itinerary]);

  const fetchFlightDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const legs = itinerary.legs.map(leg => ({
        destination: leg.destination.id,
        origin: leg.origin.id,
        date: leg.departure.split('T')[0],
      }));

      const details = await flightAPI.getFlightDetails(legs);
      setDetailsData(details);
    } catch (err) {
      console.error('Error fetching flight details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load flight details');
    } finally {
      setIsLoading(false);
    }
  };

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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBookingPress = async (agent: Agent) => {
    try {
      const supported = await Linking.canOpenURL(agent.url);
      if (supported) {
        await Linking.openURL(agent.url);
      } else {
        Alert.alert('Error', 'Cannot open booking URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open booking link');
    }
  };

  const renderSegmentDetails = (leg: Leg) => (
    <View style={styles.segmentContainer} key={leg.id}>
      <View style={styles.segmentHeader}>
        <Text style={styles.segmentTitle}>Flight Details</Text>
        <Text style={styles.segmentDuration}>{formatDuration(leg.durationInMinutes)}</Text>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.airportSection}>
          <Text style={styles.airportCode}>{leg.origin.displayCode}</Text>
          <Text style={styles.cityName}>{leg.origin.city}</Text>
          <Text style={styles.timeText}>{formatTime(leg.departure)}</Text>
          <Text style={styles.dateText}>{formatDate(leg.departure)}</Text>
        </View>
        
        <View style={styles.flightPath}>
          <View style={styles.flightLine} />
          <Text style={styles.stopsText}>
            {leg.stopCount === 0 ? 'Direct' : `${leg.stopCount} stop${leg.stopCount > 1 ? 's' : ''}`}
          </Text>
        </View>
        
        <View style={styles.airportSection}>
          <Text style={styles.airportCode}>{leg.destination.displayCode}</Text>
          <Text style={styles.cityName}>{leg.destination.city}</Text>
          <Text style={styles.timeText}>{formatTime(leg.arrival)}</Text>
          <Text style={styles.dateText}>{formatDate(leg.arrival)}</Text>
        </View>
      </View>
      
      <View style={styles.carrierSection}>
        <Text style={styles.carrierLabel}>Airlines:</Text>
        <Text style={styles.carrierText}>
          {leg.carriers.marketing.map(carrier => carrier.name).join(', ')}
        </Text>
      </View>
      
      {leg.segments && leg.segments.length > 0 && (
        <View style={styles.segmentsList}>
          <Text style={styles.segmentsTitle}>Flight Numbers:</Text>
          {leg.segments.map((segment, index) => (
            <Text key={index} style={styles.flightNumber}>
              {segment.marketingCarrier.alternateId} {segment.flightNumber}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderPricingOption = (agent: Agent, index: number) => (
    <TouchableOpacity
      key={agent.id}
      style={[styles.agentCard, index === 0 && styles.bestDealCard]}
      onPress={() => handleBookingPress(agent)}
    >
      {index === 0 && (
        <View style={styles.bestDealBadge}>
          <Text style={styles.bestDealText}>Best Deal</Text>
        </View>
      )}
      
      <View style={styles.agentHeader}>
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentPrice}>${agent.price}</Text>
      </View>
      
      <View style={styles.agentInfo}>
        <Text style={styles.bookingText}>{agent.bookingProposition}</Text>
        {agent.rating && (
          <Text style={styles.ratingText}>
            ⭐ {agent.rating.value.toFixed(1)} ({agent.rating.count} reviews)
          </Text>
        )}
      </View>
      
      <View style={styles.agentFooter}>
        <Text style={styles.carrierBadge}>
          {agent.isCarrier ? 'Direct from airline' : 'Travel agency'}
        </Text>
        <Text style={styles.bookNowText}>Tap to book →</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading flight details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFlightDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Flight Details</Text>
        <Text style={styles.headerPrice}>{itinerary.price.formatted}</Text>
      </View>

      <View style={styles.policySection}>
        <Text style={styles.sectionTitle}>Fare Policy</Text>
        <View style={styles.policyContainer}>
          <View style={styles.policyItem}>
            <Text style={styles.policyLabel}>Changes:</Text>
            <Text style={[
              styles.policyValue,
              { color: itinerary.farePolicy.isChangeAllowed ? '#10B981' : '#EF4444' }
            ]}>
              {itinerary.farePolicy.isChangeAllowed ? 'Allowed' : 'Not allowed'}
            </Text>
          </View>
          <View style={styles.policyItem}>
            <Text style={styles.policyLabel}>Cancellation:</Text>
            <Text style={[
              styles.policyValue,
              { color: itinerary.farePolicy.isCancellationAllowed ? '#10B981' : '#EF4444' }
            ]}>
              {itinerary.farePolicy.isCancellationAllowed ? 'Refundable' : 'Non-refundable'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flight Information</Text>
        {itinerary.legs.map((leg, index) => (
          <View key={leg.id}>
            {index > 0 && <View style={styles.legSeparator} />}
            <Text style={styles.legLabel}>
              {index === 0 ? 'Outbound Flight' : 'Return Flight'}
            </Text>
            {renderSegmentDetails(leg)}
          </View>
        ))}
      </View>

      {detailsData?.itinerary?.pricingOptions && detailsData.itinerary.pricingOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Options</Text>
          <Text style={styles.sectionSubtitle}>
            Choose from {detailsData.itinerary.pricingOptions[0]?.agents?.length || 0} available options
          </Text>
          {detailsData.itinerary.pricingOptions[0]?.agents
            ?.sort((a, b) => a.price - b.price)
            ?.map((agent, index) => renderPricingOption(agent, index))}
        </View>
      )}

      {detailsData?.itinerary?.operatingCarrierSafetyAttributes && 
       detailsData.itinerary.operatingCarrierSafetyAttributes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Information</Text>
          {detailsData.itinerary.operatingCarrierSafetyAttributes.map((safety, index) => (
            <View key={index} style={styles.safetyCard}>
              <Text style={styles.safetyCarrier}>{safety.carrierName}</Text>
              <View style={styles.safetyItems}>
                {safety.faceMasksCompulsory !== null && (
                  <Text style={styles.safetyItem}>
                    Face masks: {safety.faceMasksCompulsory ? '✓ Required' : '✗ Not required'}
                  </Text>
                )}
                {safety.aircraftDeepCleanedDaily !== null && (
                  <Text style={styles.safetyItem}>
                    Daily cleaning: {safety.aircraftDeepCleanedDaily ? '✓ Yes' : '✗ No'}
                  </Text>
                )}
                {safety.attendantsWearPPE !== null && (
                  <Text style={styles.safetyItem}>
                    Crew PPE: {safety.attendantsWearPPE ? '✓ Yes' : '✗ No'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  policySection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  policyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyItem: {
    flex: 1,
  },
  policyLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  policyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  legLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  legSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  segmentContainer: {
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginBottom: 12,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  segmentDuration: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  airportSection: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cityName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  flightPath: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flightLine: {
    width: 80,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 8,
  },
  stopsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  carrierSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carrierLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  carrierText: {
    fontSize: 14,
    color: '#6B7280',
  },
  segmentsList: {
    marginTop: 8,
  },
  segmentsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  agentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  bestDealCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  bestDealBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestDealText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  agentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  agentInfo: {
    marginBottom: 12,
  },
  bookingText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  agentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carrierBadge: {
    fontSize: 10,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookNowText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  safetyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  safetyCarrier: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  safetyItems: {
    gap: 4,
  },
  safetyItem: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default FlightDetails;