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
  Image,
} from 'react-native';
import { Itinerary, FlightDetailsResponse } from '../services/types';
import { flightAPI } from '../services/flightAPI';

interface FlightDetailsProps {
  itinerary: Itinerary;
  onBack?: () => void;
}

interface DetailedLeg {
  id: string;
  origin: {
    id: string;
    name: string;
    displayCode: string;
    city: string;
  };
  destination: {
    id: string;
    name: string;
    displayCode: string;
    city: string;
  };
  segments: DetailedSegment[];
  duration: number;
  stopCount: number;
  departure: string;
  arrival: string;
  dayChange: number;
}

interface DetailedSegment {
  id: string;
  origin: {
    id: string;
    name: string;
    displayCode: string;
    city: string;
  };
  destination: {
    id: string;
    name: string;
    displayCode: string;
    city: string;
  };
  duration: number;
  dayChange: number;
  flightNumber: string;
  departure: string;
  arrival: string;
  marketingCarrier: {
    id: string;
    name: string;
    displayCode: string;
    displayCodeType: string;
    logo: string;
    altId: string;
  };
  operatingCarrier: {
    id: string;
    name: string;
    displayCode: string;
    displayCodeType: string;
    logo: string;
    altId: string;
  };
}

interface DetailedAgent {
  id: string;
  name: string;
  isCarrier: boolean;
  bookingProposition: string;
  url: string;
  price: number;
  rating: {
    value: number;
    count: number;
  };
  updateStatus: string;
  segments: DetailedSegment[];
  isDirectDBookUrl: boolean;
  quoteAge: number;
}

interface DetailedItinerary {
  legs: DetailedLeg[];
  pricingOptions: {
    agents: DetailedAgent[];
    totalPrice: number;
  }[];
  isTransferRequired: boolean;
  destinationImage: string;
  operatingCarrierSafetyAttributes: {
    carrierID: string;
    carrierName: string;
    faceMasksCompulsory: boolean | null;
    aircraftDeepCleanedDaily: boolean | null;
    attendantsWearPPE: boolean | null;
    cleaningPacksProvided: boolean | null;
    foodServiceChanges: boolean | null;
    safetyUrl: string | null;
  }[];
  flexibleTicketPolicies: any[];
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ itinerary, onBack }) => {
  const [detailsData, setDetailsData] = useState<{ itinerary: DetailedItinerary; pollingCompleted: boolean } | null>(null);
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
      setDetailsData(details as any);
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

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleBookingPress = async (agent: DetailedAgent) => {
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

  const renderSegmentDetails = (segment: DetailedSegment, isLast: boolean) => (
    <View style={styles.segmentContainer} key={segment.id}>
      <View style={styles.flightInfo}>
        <View style={styles.airportSection}>
          <Text style={styles.airportCode}>{segment.origin.displayCode}</Text>
          <Text style={styles.cityName}>{segment.origin.city}</Text>
          <Text style={styles.timeText}>{formatTime(segment.departure)}</Text>
          <Text style={styles.dateText}>{formatShortDate(segment.departure)}</Text>
        </View>
        
        <View style={styles.flightPath}>
          <View style={styles.carrierInfo}>
            <Image 
              source={{ uri: segment.marketingCarrier.logo }}
              style={styles.airlineLogo}
              onError={() => {}}
            />
            <Text style={styles.flightNumber}>
              {segment.marketingCarrier.displayCode} {segment.flightNumber}
            </Text>
          </View>
          <Text style={styles.durationText}>{formatDuration(segment.duration)}</Text>
          <View style={styles.flightLine} />
        </View>
        
        <View style={styles.airportSection}>
          <Text style={styles.airportCode}>{segment.destination.displayCode}</Text>
          <Text style={styles.cityName}>{segment.destination.city}</Text>
          <Text style={styles.timeText}>{formatTime(segment.arrival)}</Text>
          <Text style={styles.dateText}>{formatShortDate(segment.arrival)}</Text>
          {segment.dayChange > 0 && (
            <Text style={styles.dayChangeText}>+{segment.dayChange} day</Text>
          )}
        </View>
      </View>
      
      <View style={styles.carrierDetails}>
        <Text style={styles.carrierName}>{segment.marketingCarrier.name}</Text>
        {segment.operatingCarrier.id !== segment.marketingCarrier.id && (
          <Text style={styles.operatedBy}>
            Operated by {segment.operatingCarrier.name}
          </Text>
        )}
      </View>
      
      {!isLast && (
        <View style={styles.layover}>
          <Text style={styles.layoverText}>Layover</Text>
        </View>
      )}
    </View>
  );

  const renderLegDetails = (leg: DetailedLeg, legIndex: number) => (
    <View style={styles.legContainer} key={leg.id}>
      <View style={styles.legHeader}>
        <Text style={styles.legTitle}>
          {legIndex === 0 ? 'Outbound Flight' : 'Return Flight'}
        </Text>
        <Text style={styles.legDuration}>{formatDuration(leg.duration)}</Text>
      </View>
      
      <View style={styles.routeSummary}>
        <Text style={styles.routeText}>
          {leg.origin.displayCode} → {leg.destination.displayCode}
        </Text>
        <Text style={styles.stopsText}>
          {leg.stopCount === 0 ? 'Direct' : `${leg.stopCount} stop${leg.stopCount > 1 ? 's' : ''}`}
        </Text>
      </View>
      
      {leg.segments.map((segment, index) => 
        renderSegmentDetails(segment, index === leg.segments.length - 1)
      )}
    </View>
  );

  const renderPricingOption = (agent: DetailedAgent, index: number) => (
    <TouchableOpacity
      key={agent.id}
      style={[styles.agentCard, index === 0 && styles.bestDealCard]}
      onPress={() => handleBookingPress(agent)}
    >
      {index === 0 && (
        <View style={styles.bestDealBadge}>
          <Text style={styles.bestDealText}>Best Price</Text>
        </View>
      )}
      
      <View style={styles.agentHeader}>
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentPrice}>${agent.price}</Text>
      </View>
      
      <View style={styles.agentInfo}>
        {agent.rating && (
          <Text style={styles.ratingText}>
            ⭐ {agent.rating.value.toFixed(1)} ({agent.rating.count} reviews)
          </Text>
        )}
        <Text style={styles.updateStatus}>
          Updated {agent.quoteAge}m ago
        </Text>
      </View>
      
      <View style={styles.agentFooter}>
        <Text style={styles.carrierBadge}>
          {agent.isCarrier ? '✈️ Direct from airline' : '🏢 Travel agency'}
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

  if (!detailsData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No flight details available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back to Results</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Flight Details</Text>
        <Text style={styles.headerPrice}>{itinerary.price.formatted}</Text>
        
        {detailsData.itinerary.destinationImage && (
          <Image 
            source={{ uri: detailsData.itinerary.destinationImage }}
            style={styles.destinationImage}
          />
        )}
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
              {itinerary.farePolicy.isChangeAllowed ? '✓ Allowed' : '✗ Not allowed'}
            </Text>
          </View>
          <View style={styles.policyItem}>
            <Text style={styles.policyLabel}>Refunds:</Text>
            <Text style={[
              styles.policyValue,
              { color: itinerary.farePolicy.isCancellationAllowed ? '#10B981' : '#EF4444' }
            ]}>
              {itinerary.farePolicy.isCancellationAllowed ? '✓ Refundable' : '✗ Non-refundable'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flight Itinerary</Text>
        {detailsData.itinerary.legs.map((leg, index) => renderLegDetails(leg, index))}
      </View>

      {detailsData.itinerary.pricingOptions && detailsData.itinerary.pricingOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Options</Text>
          <Text style={styles.sectionSubtitle}>
            {detailsData.itinerary.pricingOptions[0]?.agents?.length || 0} booking options available
          </Text>
          {detailsData.itinerary.pricingOptions[0]?.agents
            ?.sort((a, b) => a.price - b.price)
            ?.map((agent, index) => renderPricingOption(agent, index))}
        </View>
      )}

      {detailsData.itinerary.operatingCarrierSafetyAttributes && 
       detailsData.itinerary.operatingCarrierSafetyAttributes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Information</Text>
          {detailsData.itinerary.operatingCarrierSafetyAttributes.map((safety, index) => (
            <View key={index} style={styles.safetyCard}>
              <Text style={styles.safetyCarrier}>{safety.carrierName}</Text>
              <View style={styles.safetyItems}>
                {safety.faceMasksCompulsory !== null && (
                  <Text style={styles.safetyItem}>
                    Face masks: {safety.faceMasksCompulsory ? '✓ Required' : '○ Not required'}
                  </Text>
                )}
                {safety.aircraftDeepCleanedDaily !== null && (
                  <Text style={styles.safetyItem}>
                    Daily deep cleaning: {safety.aircraftDeepCleanedDaily ? '✓ Yes' : '○ No'}
                  </Text>
                )}
                {safety.attendantsWearPPE !== null && (
                  <Text style={styles.safetyItem}>
                    Crew protective equipment: {safety.attendantsWearPPE ? '✓ Yes' : '○ No'}
                  </Text>
                )}
                {safety.cleaningPacksProvided !== null && (
                  <Text style={styles.safetyItem}>
                    Cleaning packs provided: {safety.cleaningPacksProvided ? '✓ Yes' : '○ No'}
                  </Text>
                )}
              </View>
              {safety.safetyUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(safety.safetyUrl!)}>
                  <Text style={styles.safetyUrl}>View safety details →</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {detailsData.itinerary.isTransferRequired && (
        <View style={styles.transferWarning}>
          <Text style={styles.transferText}>
            ⚠️ Self-transfer required - You may need to collect and re-check baggage
          </Text>
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
    marginBottom: 16,
  },
  destinationImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
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
  legContainer: {
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  legDuration: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  stopsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  segmentContainer: {
    marginBottom: 16,
  },
  flightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  airportSection: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 20,
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
    marginTop: 6,
  },
  dateText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dayChangeText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  flightPath: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  carrierInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  airlineLogo: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  durationText: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  flightLine: {
    width: 60,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  carrierDetails: {
    alignItems: 'center',
  },
  carrierName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  operatedBy: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  layover: {
    alignItems: 'center',
    marginVertical: 12,
  },
  layoverText: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  updateStatus: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  agentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carrierBadge: {
    fontSize: 11,
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
  safetyUrl: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 8,
  },
  transferWarning: {
    backgroundColor: '#FEF3C7',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  transferText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
});

export default FlightDetails;