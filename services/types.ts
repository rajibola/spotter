// API Response Types based on the provided JSON responses

export interface ApiResponse<T> {
  status: boolean;
  timestamp: number;
  sessionId?: string;
  data: T;
}

// Airport Search Types
export interface Airport {
  skyId: string;
  entityId: string;
  presentation: {
    title: string;
    suggestionTitle: string;
    subtitle: string;
  };
  navigation: {
    entityId: string;
    entityType: string;
    localizedName: string;
    relevantFlightParams: {
      skyId: string;
      entityId: string;
      flightPlaceType: string;
      localizedName: string;
    };
  };
}

// Flight Search Types (v1 API)
export interface FlightSearchResponse {
  context: {
    status: string;
    totalResults: number;
  };
  itineraries: Itinerary[];
  messages: any[];
  filterStats: FilterStats;
}

export interface Itinerary {
  id: string;
  price: {
    raw: number;
    formatted: string;
  };
  legs: Leg[];
  isSelfTransfer: boolean;
  isProtectedSelfTransfer: boolean;
  farePolicy: {
    isChangeAllowed: boolean;
    isPartiallyChangeable: boolean;
    isCancellationAllowed: boolean;
    isPartiallyRefundable: boolean;
  };
  eco?: {
    ecoContenderDelta: number;
  };
  tags: string[];
  isMashUp: boolean;
  hasFlexibleOptions: boolean;
  score: number;
}

export interface Leg {
  id: string;
  origin: Location;
  destination: Location;
  durationInMinutes: number;
  stopCount: number;
  isSmallestStops: boolean;
  departure: string;
  arrival: string;
  timeDeltaInDays: number;
  carriers: {
    marketing: Carrier[];
    operating?: Carrier[];
    operationType: string;
  };
  segments: Segment[];
}

export interface Location {
  id: string;
  entityId: string;
  name: string;
  displayCode: string;
  city: string;
  country: string;
  isHighlighted: boolean;
}

export interface Carrier {
  id: number;
  logoUrl: string;
  name: string;
}

export interface Segment {
  id: string;
  origin: {
    flightPlaceId: string;
    displayCode: string;
    parent: {
      flightPlaceId: string;
      displayCode: string;
      name: string;
      type: string;
    };
    name: string;
    type: string;
    country: string;
  };
  destination: {
    flightPlaceId: string;
    displayCode: string;
    parent: {
      flightPlaceId: string;
      displayCode: string;
      name: string;
      type: string;
    };
    name: string;
    type: string;
    country: string;
  };
  departure: string;
  arrival: string;
  durationInMinutes: number;
  flightNumber: string;
  marketingCarrier: {
    id: number;
    name: string;
    alternateId: string;
    allianceId: number;
  };
  operatingCarrier: {
    id: number;
    name: string;
    alternateId: string;
    allianceId: number;
  };
  transportMode: string;
}

export interface FilterStats {
  duration: {
    min: number;
    max: number;
    multiCityMin: number;
    multiCityMax: number;
  };
  total: number;
  hasCityOpenJaw: boolean;
  multipleCarriers: {
    minPrice: string;
    rawMinPrice: number | null;
  };
  airports: {
    city: string;
    airports: {
      id: string;
      entityId: string;
      name: string;
    }[];
  }[];
  carriers: {
    id: number;
    logoUrl: string;
    name: string;
  }[];
  stopPrices: {
    direct: {
      isPresent: boolean;
      formattedPrice?: string;
      rawPrice?: number;
    };
    one: {
      isPresent: boolean;
      formattedPrice?: string;
      rawPrice?: number;
    };
    twoOrMore: {
      isPresent: boolean;
      formattedPrice?: string;
      rawPrice?: number;
    };
  };
  alliances: {
    id: number;
    name: string;
  }[];
}

// Flight Details Types
export interface FlightDetailsResponse {
  itinerary: {
    legs: Leg[];
    pricingOptions: PricingOption[];
    isTransferRequired: boolean;
    destinationImage: string;
    operatingCarrierSafetyAttributes: SafetyAttribute[];
    flexibleTicketPolicies: any[];
  };
  pollingCompleted: boolean;
}

export interface PricingOption {
  agents: Agent[];
  totalPrice: number;
}

export interface Agent {
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
  segments: Segment[];
  isDirectDBookUrl: boolean;
  quoteAge: number;
}

export interface SafetyAttribute {
  carrierID: string;
  carrierName: string;
  faceMasksCompulsory: boolean | null;
  aircraftDeepCleanedDaily: boolean | null;
  attendantsWearPPE: boolean | null;
  cleaningPacksProvided: boolean | null;
  foodServiceChanges: boolean | null;
  safetyUrl: string | null;
}

// Price Calendar Types
export interface PriceCalendarResponse {
  flights: {
    noPriceLabel: string;
    groups: {
      id: string;
      label: string;
    }[];
    days: {
      day: string;
      group: string;
      price: number;
    }[];
    currency: string;
  };
}

// Search Parameters
export interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date?: string;
  cabinClass?: string;
  adults?: string;
  sortBy?: string;
  currency?: string;
  market?: string;
  countryCode?: string;
}

export interface AirportSearchParams {
  query: string;
  locale?: string;
}

export interface PriceCalendarParams {
  originSkyId: string;
  destinationSkyId: string;
  fromDate: string;
  currency?: string;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}