import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Airport } from '../services/types';
import { useFlightSearch } from '../hooks/useFlightSearch';

interface AirportPickerProps {
  label: string;
  placeholder: string;
  selectedAirport: Airport | null;
  onAirportSelect: (airport: Airport) => void;
  style?: any;
}

const AirportPicker: React.FC<AirportPickerProps> = ({
  label,
  placeholder,
  selectedAirport,
  onAirportSelect,
  style,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { 
    airports, 
    isLoadingAirports, 
    airportsError, 
    searchAirports, 
    clearAirports 
  } = useFlightSearch();

  const searchInputRef = useRef<TextInput>(null);

  // Handle search input change with debounce
  const handleSearchChange = (text: string): void => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Clear results if search is too short
    if (text.length < 2) {
      clearAirports();
      return;
    }
    
    // Debounce search request
    const timeout = setTimeout(() => {
      searchAirports({ query: text });
    }, 500);
    
    setSearchTimeout(timeout as unknown as NodeJS.Timeout);
  };

  // Handle airport selection
  const handleAirportSelect = (airport: Airport): void => {
    onAirportSelect(airport);
    setIsVisible(false);
    setSearchQuery('');
    clearAirports();
  };

  // Open modal
  const openPicker = (): void => {
    setIsVisible(true);
    setSearchQuery('');
    clearAirports();
  };

  // Close modal
  const closePicker = (): void => {
    setIsVisible(false);
    setSearchQuery('');
    clearAirports();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };

  // Focus on search input when modal opens
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Render airport item
  const renderAirportItem = ({ item }: { item: Airport }) => (
    <TouchableOpacity
      style={styles.airportItem}
      onPress={() => handleAirportSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.airportInfo}>
        <Text style={styles.airportTitle}>{item.presentation.title}</Text>
        <Text style={styles.airportSubtitle}>
          {item.presentation.subtitle} • {item.skyId}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.container, style]}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={openPicker}
          activeOpacity={0.7}
        >
          {selectedAirport ? (
            <View style={styles.selectedAirportContainer}>
              <Text style={styles.selectedAirportTitle}>
                {selectedAirport.presentation.title}
              </Text>
              <Text style={styles.selectedAirportSubtitle}>
                {selectedAirport.presentation.subtitle} • {selectedAirport.skyId}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePicker}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closePicker}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <View style={{ flex: 1 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search airports or cities..."
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.resultsContainer}>
            {isLoadingAirports && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Searching airports...</Text>
              </View>
            )}

            {airportsError && !isLoadingAirports && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{airportsError}</Text>
              </View>
            )}

            {!isLoadingAirports && !airportsError && searchQuery.length > 0 && airports.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No airports found for "{searchQuery}"
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try searching with city names or airport codes
                </Text>
              </View>
            )}

            {searchQuery.length === 0 && !isLoadingAirports && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                  Start typing to search for airports
                </Text>
                <Text style={styles.instructionsSubtext}>
                  You can search by city name, airport name, or airport code
                </Text>
              </View>
            )}

            {airports.length > 0 && (
              <FlatList
                data={airports}
                keyExtractor={(item) => item.skyId}
                renderItem={renderAirportItem}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
    justifyContent: 'center',
  },
  selectedAirportContainer: {
    flex: 1,
  },
  selectedAirportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  selectedAirportSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  airportItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  airportInfo: {
    flex: 1,
  },
  airportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  airportSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  instructionsText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AirportPicker;