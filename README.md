# Notra - AI-Powered Task Management App

A modern task management app built with React Native and Expo, featuring AI-powered task prioritization and smart task organization.

## Features

- **Task Management**: Create, edit, and organize tasks with titles, descriptions, priorities (low/medium/high), and due dates
- **Today View**: Dedicated screen showing tasks due today for focused daily planning
- **AI Assistant**: Smart parsing voice input to tasks
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Clean UI**: Minimal, card-based design with smooth animations

## Setup Instructions

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Expo Go app on your phone (for testing) or Android Studio/Xcode for emulators

### Installation Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Project Settings → API and copy your URL and anon key
   - Go to SQL Editor and run the SQL from `supabase/migrations/001_create_tasks.sql`

3. **Create environment variables**

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

   Note: The Anthropic API key is optional if you want to use AI features.

4. **Start the app**

   ```bash
   npx expo start
   ```

   Then scan the QR code with Expo Go app, or press `i` for iOS simulator or `a` for Android emulator.

## Third-Party Libraries

| Library                                    | Purpose                                                         |
| ------------------------------------------ | --------------------------------------------------------------- |
| **Expo SDK 54**                            | Cross-platform development framework for building the app       |
| **React Native 0.81.5**                    | Core mobile framework with New Architecture support             |
| **TypeScript 5.9**                         | Type-safe development and better code quality                   |
| **Expo Router 6.0**                        | File-based routing system for navigation between screens        |
| **Zustand 5.0**                            | Lightweight state management for managing app state             |
| **TanStack Query 5.99**                    | Server state management, data caching, and automatic refetching |
| **Supabase 2.103**                         | Backend database for storing tasks and real-time sync           |
| **Anthropic AI SDK 0.90**                  | Integration with Claude Sonnet 4 for AI-powered features        |
| **AsyncStorage 2.2**                       | Local data storage for offline support                          |
| **NativeWind 4.2**                         | Tailwind CSS utility classes for styling                        |
| **React Navigation 7.1**                   | Navigation library for tab and stack navigation                 |
| **React Native Reanimated 4.1**            | Smooth animations and transitions                               |
| **Expo Haptics**                           | Tactile feedback for button presses                             |
| **Expo Speech**                            | Text-to-speech for accessibility features                       |
| **Expo Secure Store**                      | Encrypted storage for sensitive data like API keys              |
| **@react-native-community/datetimepicker** | Native date and time picker for selecting task due dates        |
