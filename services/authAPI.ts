import * as SecureStore from 'expo-secure-store';
import { AuthResponse, LoginParams, RegisterParams, User } from './types';

// Mock authentication service - replace with your actual backend API
const MOCK_USERS_KEY = 'mock_users';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Utility functions for secure storage
const storeToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

const storeUserData = async (user: User): Promise<void> => {
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
};

const getUserData = async (): Promise<User | null> => {
  const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

const clearAuthData = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
};

// Mock storage functions
const getMockUsers = async (): Promise<User[]> => {
  const users = await SecureStore.getItemAsync(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const storeMockUsers = async (users: User[]): Promise<void> => {
  await SecureStore.setItemAsync(MOCK_USERS_KEY, JSON.stringify(users));
};

// Generate a simple mock token
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const authAPI = {
  // Register a new user
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    try {
      // Validate input
      if (!params.email || !params.password || !params.firstName || !params.lastName) {
        throw new Error('All fields are required');
      }

      if (!isValidEmail(params.email)) {
        throw new Error('Invalid email format');
      }

      if (params.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUsers = await getMockUsers();
      const userExists = existingUsers.find(user => user.email.toLowerCase() === params.email.toLowerCase());
      
      if (userExists) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: params.email.toLowerCase(),
        firstName: params.firstName,
        lastName: params.lastName,
      };

      // Store user
      const updatedUsers = [...existingUsers, newUser];
      await storeMockUsers(updatedUsers);

      // Generate token
      const token = generateMockToken(newUser.id);

      // Store auth data
      await storeToken(token);
      await storeUserData(newUser);

      return {
        user: newUser,
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (params: LoginParams): Promise<AuthResponse> => {
    try {
      // Validate input
      if (!params.email || !params.password) {
        throw new Error('Email and password are required');
      }

      if (!isValidEmail(params.email)) {
        throw new Error('Invalid email format');
      }

      // Find user
      const existingUsers = await getMockUsers();
      const user = existingUsers.find(u => u.email.toLowerCase() === params.email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In a real app, you would verify the password hash here
      // For this mock, we'll just simulate a successful login

      // Generate token
      const token = generateMockToken(user.id);

      // Store auth data
      await storeToken(token);
      await storeUserData(user);

      return {
        user,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = await getToken();
      if (!token) {
        return null;
      }

      const user = await getUserData();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await getToken();
      const user = await getUserData();
      return !!(token && user);
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },

  // Get auth token
  getAuthToken: async (): Promise<string | null> => {
    return await getToken();
  },
};

export default authAPI;