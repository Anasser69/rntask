# Event Management App - React Native

This README provides an overview of the Event Management mobile application built with React Native and Expo. The app allows users to browse events, register for them, and manage their profile settings.

## Technologies Used

### Core Technologies
- **React Native**: A framework for building native mobile applications using JavaScript and React
- **Expo**: A platform for making universal React applications, simplifying the development process
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript

### State Management
- **Zustand**: A small, fast and scalable state-management solution
- **AsyncStorage**: For persistent local storage of user data and preferences

### Navigation
- **React Navigation**: For handling navigation between screens
  - Native Stack Navigator: For main app navigation flow
  - Bottom Tab Navigator: For navigating between main app sections

### UI Components
- **React Native Safe Area Context**: For handling safe area insets
- **React Native Vector Icons**: For using Ionicons throughout the app
- **Custom UI Components**: Including error displays, loading indicators, and themed components

### Theming
- **Custom Theme Provider**: Implements a light/dark theme system
- **Theme Persistence**: Using Zustand with AsyncStorage

### Environment Configuration
- **React Native Dotenv**: For managing environment variables
- **Centralized API Configuration**: For easy switching between environments

## App Features

### Authentication
- User registration with validation
- User login with session management
- Persistent authentication state

### Event Management
- Browse upcoming events
- View detailed event information
- Register for events
- Track registered events

### User Profile
- View and manage user information
- Toggle between light and dark themes
- Sign out functionality

### UI/UX
- Responsive design that adapts to different screen sizes
- Loading states with activity indicators
- Error handling with retry options
- Dark/Light theme support

## Project Structure

Fold

rntask/
├── App.tsx                  # Main application component
├── babel.config.js          # Babel configuration
├── package.json             # Project dependencies
├── src/
│   ├── components/          # Reusable UI components
│   ├── config/              # Configuration files
│   ├── navigation/          # Navigation setup
│   ├── screens/             # App screens
│   ├── store/               # State management
│   └── theme/               # Theming system

## Key Components

### Screens
- **SignInScreen**: User login
- **SignUpScreen**: New user registration
- **HomeScreen**: Displays upcoming events
- **EventDetailsScreen**: Shows detailed event information and registration
- **ProfileScreen**: User profile and settings

### Navigation
- **AppNavigator**: Main navigation container
- **TabNavigator**: Bottom tab navigation for main app sections

### State Management
- **useAuthStore**: Manages authentication state
- **useThemeStore**: Manages theme preferences

### Theming
- **ThemeProvider**: Context provider for theme values
- **colors.ts**: Defines color schemes for light and dark themes

## Getting Started

1. Install dependencies:
```bash
npm install
3. Run on a device or emulator:
bash

Run

Open Folder

1

2

3

npm run android

# or

npm run ios

## Development Notes
- The app uses a custom theme system that can be toggled between light and dark modes
- Authentication state is persisted using AsyncStorage
- The app includes form validation for user inputs
- API calls are made using the Fetch API with a helper function for building URLs
