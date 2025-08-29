# Spotter ✈️

A modern React Native flight search and booking application built with Expo. Spotter helps users find and compare flights from multiple airlines with a clean, intuitive interface.

## Features

- **Flight Search**: Search flights by origin and destination airports
- **Real-time Results**: Get live flight data with pricing and schedules
- **Flight Comparison**: Compare multiple flight options side by side
- **Detailed Flight Information**: View comprehensive flight details including duration, stops, and airline information
- **User Authentication**: Secure user registration and login system
- **Cross-platform**: Works on iOS, Android, and web

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with file-based routing
- **Language**: TypeScript
- **UI Components**: React Native Elements
- **State Management**: React Context API
- **Authentication**: Secure storage with expo-secure-store
- **HTTP Client**: Axios
- **Form Handling**: Formik with Yup validation
- **Date Handling**: date-fns
- **Icons**: Expo Vector Icons

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your device

## Project Structure

```
spotter/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   │   └── index.tsx      # Flight search screen
│   ├── AuthScreen.tsx     # Authentication screen
│   ├── flight-details.tsx # Flight details screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── AirportPicker.tsx  # Airport selection component
│   ├── FlightDetails.tsx  # Flight details component
│   └── FlightResults.tsx  # Flight search results
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication context
├── hooks/                 # Custom React hooks
│   └── useFlightSearch.tsx # Flight search hook
├── services/              # API services and utilities
│   ├── authAPI.ts         # Authentication API
│   ├── flightAPI.ts       # Flight search API
│   └── types.ts           # TypeScript type definitions
└── assets/                # Static assets (images, fonts)
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator
- `npm run ios` - Start the app on iOS simulator
- `npm run web` - Start the app in web browser
- `npm run lint` - Run ESLint for code quality checks
- `npm run reset-project` - Reset project to blank state

## API Integration

The app integrates with flight search APIs to provide real-time flight data. API configuration should be set up in environment variables:

```bash
# Create a .env file in the root directory
FLIGHT_API_URL=your_api_url_here
FLIGHT_API_KEY=your_api_key_here
```

## Authentication

The app includes a mock authentication system that:
- Stores user data securely using Expo Secure Store
- Provides registration and login functionality
- Maintains authentication state across app sessions
- Includes form validation for user inputs

## Key Components

### Flight Search
- **AirportPicker**: Autocomplete airport selection with search functionality
- **FlightResults**: Display search results with sorting and filtering options
- **FlightDetails**: Comprehensive flight information display

### Authentication
- **AuthScreen**: Combined login and registration interface
- **AuthContext**: Global authentication state management

## Development Notes

- The app uses file-based routing with Expo Router
- TypeScript is used throughout for type safety
- Context API manages global state for authentication and flight search
- Secure storage is used for sensitive data like authentication tokens
- The UI follows Material Design principles with custom styling

## Testing

To test the app:
1. Start the development server
2. Use various device simulators/emulators
3. Test authentication flows (register, login)
4. Test flight search with different airport combinations
5. Verify flight details display correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please refer to the development team or project maintainers.