import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import FlightDetails from '../components/FlightDetails';
import { Itinerary } from '../services/types';

export default function FlightDetailsScreen() {
  const params = useLocalSearchParams();
  
  let itinerary: Itinerary;
  try {
    itinerary = JSON.parse(params.itinerary as string);
  } catch (error) {
    console.error('Error parsing itinerary:', error);
    router.back();
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <FlightDetails itinerary={itinerary} onBack={handleBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});