import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Itinerary } from "../services/types";

interface FlightDetailsProps {
  itinerary: Itinerary;
  onBack?: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ itinerary, onBack }) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleBookingPress = async () => {
    try {
      Alert.alert(
        "Booking",
        "Please visit the airline or travel website to complete your booking."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to open booking link");
    }
  };

  const renderSegmentDetails = (segment: any, isLast: boolean) => (
    <View style={styles.segmentContainer} key={segment.id}>
      <View style={styles.flightInfo}>
        <View style={styles.airportSection}>
          <Text style={styles.airportCode}>{segment.origin.displayCode}</Text>
          <Text style={styles.cityName}>
            {segment.origin.parent?.name || segment.origin.name}
          </Text>
          <Text style={styles.timeText}>{formatTime(segment.departure)}</Text>
          <Text style={styles.dateText}>
            {formatShortDate(segment.departure)}
          </Text>
        </View>

        <View style={styles.flightPath}>
          <View style={styles.carrierInfo}>
            <Text style={styles.flightNumber}>
              {segment.marketingCarrier.displayCode} {segment.flightNumber}
            </Text>
          </View>
          <Text style={styles.durationText}>
            {formatDuration(segment.durationInMinutes)}
          </Text>
          <View style={styles.flightLine} />
        </View>

        <View style={styles.airportSection}>
          <Text style={styles.airportCode}>
            {segment.destination.displayCode}
          </Text>
          <Text style={styles.cityName}>
            {segment.destination.parent?.name || segment.destination.name}
          </Text>
          <Text style={styles.timeText}>{formatTime(segment.arrival)}</Text>
          <Text style={styles.dateText}>
            {formatShortDate(segment.arrival)}
          </Text>
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

  const renderLegDetails = (leg: any, legIndex: number) => (
    <View style={styles.legContainer} key={leg.id}>
      <View style={styles.legHeader}>
        <Text style={styles.legTitle}>
          {legIndex === 0 ? "Outbound Flight" : "Return Flight"}
        </Text>
        <Text style={styles.legDuration}>
          {formatDuration(leg.durationInMinutes)}
        </Text>
      </View>

      <View style={styles.routeSummary}>
        <Text style={styles.routeText}>
          {leg.origin.displayCode} → {leg.destination.displayCode}
        </Text>
        <Text style={styles.stopsText}>
          {leg.stopCount === 0
            ? "Direct"
            : `${leg.stopCount} stop${leg.stopCount > 1 ? "s" : ""}`}
        </Text>
      </View>

      {leg.segments.map((segment: any, index: number) =>
        renderSegmentDetails(segment, index === leg.segments.length - 1)
      )}
    </View>
  );

  const renderBookingOption = () => (
    <TouchableOpacity
      style={[styles.agentCard, styles.bestDealCard]}
      onPress={handleBookingPress}
    >
      <View style={styles.bestDealBadge}>
        <Text style={styles.bestDealText}>Best Price</Text>
      </View>

      <View style={styles.agentHeader}>
        <Text style={styles.agentName}>Booking Available</Text>
        <Text style={styles.agentPrice}>{itinerary.price.formatted}</Text>
      </View>

      <View style={styles.agentInfo}>
        <Text style={styles.updateStatus}>Price from search results</Text>
      </View>

      <View style={styles.agentFooter}>
        <Text style={styles.carrierBadge}>
          🏢 Multiple booking options available
        </Text>
        <Text style={styles.bookNowText}>Tap to book →</Text>
      </View>
    </TouchableOpacity>
  );

  if (!itinerary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No flight details available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backText}>← Back to Results</Text>
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
              <Text
                style={[
                  styles.policyValue,
                  {
                    color: itinerary.farePolicy.isChangeAllowed
                      ? "#10B981"
                      : "#EF4444",
                  },
                ]}
              >
                {itinerary.farePolicy.isChangeAllowed
                  ? "✓ Allowed"
                  : "✗ Not allowed"}
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>Refunds:</Text>
              <Text
                style={[
                  styles.policyValue,
                  {
                    color: itinerary.farePolicy.isCancellationAllowed
                      ? "#10B981"
                      : "#EF4444",
                  },
                ]}
              >
                {itinerary.farePolicy.isCancellationAllowed
                  ? "✓ Refundable"
                  : "✗ Non-refundable"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Itinerary</Text>
          {itinerary.legs.map((leg, index) => renderLegDetails(leg, index))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Options</Text>
          <Text style={styles.sectionSubtitle}>
            Booking available from search results
          </Text>
          {renderBookingOption()}
        </View>

        {itinerary.isSelfTransfer && (
          <View style={styles.transferWarning}>
            <Text style={styles.transferText}>
              ⚠️ Self-transfer required - You may need to collect and re-check
              baggage
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerPrice: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 16,
  },
  destinationImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  policySection: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    padding: 20,
  },
  policyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  policyItem: {
    flex: 1,
  },
  policyLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  policyValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  legContainer: {
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  legHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  legTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  legDuration: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  routeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  stopsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  segmentContainer: {
    marginBottom: 16,
  },
  flightInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  airportSection: {
    flex: 1,
    alignItems: "center",
  },
  airportCode: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  cityName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 6,
  },
  dateText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  dayChangeText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 2,
  },
  flightPath: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  carrierInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  airlineLogo: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  durationText: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
  },
  flightLine: {
    width: 60,
    height: 2,
    backgroundColor: "#D1D5DB",
  },
  carrierDetails: {
    alignItems: "center",
  },
  carrierName: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  operatedBy: {
    fontSize: 10,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 2,
  },
  layover: {
    alignItems: "center",
    marginVertical: 12,
  },
  layoverText: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  agentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  bestDealCard: {
    borderColor: "#10B981",
    borderWidth: 2,
  },
  bestDealBadge: {
    position: "absolute",
    top: -8,
    left: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestDealText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  agentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 8,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  agentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563EB",
  },
  agentInfo: {
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  updateStatus: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  agentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carrierBadge: {
    fontSize: 11,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookNowText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  safetyCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  safetyCarrier: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  safetyItems: {
    gap: 4,
  },
  safetyItem: {
    fontSize: 12,
    color: "#6B7280",
  },
  safetyUrl: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 8,
  },
  transferWarning: {
    backgroundColor: "#FEF3C7",
    margin: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  transferText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
  },
});

export default FlightDetails;
