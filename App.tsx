import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import MedicalHelpScreen from './src/screens/medical/MedicalHelpScreen';
import ScheduleScreen from './src/screens/reminders/ScheduleScreen';
import CallFamilyScreen from './src/screens/home/CallFamilyScreen';
import CognitiveScoreScreen from './src/screens/home/CognitiveScoreScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import GamesScreen from './src/screens/games/GamesScreen';
import MemoryScreen from './src/screens/memories/MemoryScreen';
import OddOneOutScreen from './src/screens/games/OddOneOutScreen';
import GuessFoodScreen from './src/screens/games/GuessFoodScreen';
import PatientDashboardScreen from './src/screens/patients/PatientDashboardScreen';
import OfflineScreen from './src/screens/OfflineScreen';

type Screen =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'home'
  | 'medical-help'
  | 'schedule'
  | 'call-family'
  | 'cognitive-score'
  | 'profile'
  | 'games'
  | 'memory'
  | 'odd-one-out'
  | 'guess-food'
  | 'patient-dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

  // Keeps track of whether internet is unavailable.
  const [isOffline, setIsOffline] = useState(false);

  // Prevents the app from rendering before the first
  // connection check has completed.
  const [connectionChecked, setConnectionChecked] = useState(false);

  // ---------------------------------------------------------
  // INTERNET CONNECTION MONITOR
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    // NetInfo works for React Native and Expo.
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!mounted) return;

      const offline =
        state.isConnected === false ||
        state.isInternetReachable === false;

      setIsOffline(offline);
      setConnectionChecked(true);
    });

    // Extra handling for Expo Web.
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      const handleOffline = () => {
        console.log('SmritiCare: INTERNET OFFLINE');

        if (mounted) {
          setIsOffline(true);
          setConnectionChecked(true);
        }
      };

      const handleOnline = () => {
        console.log('SmritiCare: INTERNET ONLINE');

        if (mounted) {
          setIsOffline(false);
          setConnectionChecked(true);
        }
      };

      // Check browser connection immediately.
      setIsOffline(!window.navigator.onLine);
      setConnectionChecked(true);

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      return () => {
        mounted = false;

        unsubscribe();

        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      };
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // ---------------------------------------------------------
  // OFFLINE MODE
  // ---------------------------------------------------------

  // Wait for the first connection check.
  if (!connectionChecked) {
    return null;
  }

  // Show Offline Mode whenever the connection is lost.
  if (isOffline) {
    return (
      <OfflineScreen
        onBack={() => {
          // Don't leave Offline Mode while still offline.
          if (
            Platform.OS === 'web' &&
            typeof window !== 'undefined'
          ) {
            if (window.navigator.onLine) {
              setIsOffline(false);
            }
          }
        }}
        onHome={() => {
          // Only go Home if connection has returned.
          if (
            Platform.OS === 'web' &&
            typeof window !== 'undefined'
          ) {
            if (window.navigator.onLine) {
              setScreen('home');
              setIsOffline(false);
            }
          }
        }}
      />
    );
  }
  // =========================================================
  // WELCOME
  // =========================================================

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setScreen('login')}
        onSignIn={() => setScreen('signup')}
      />
    );
  }

  // =========================================================
  // LOGIN
  // =========================================================

  if (screen === 'login') {
    return (
      <LoginScreen
        onBack={() => setScreen('welcome')}
        onSignUp={() => setScreen('signup')}
        onLogin={() => setScreen('home')}
      />
    );
  }

  // =========================================================
  // SIGNUP
  // =========================================================

  if (screen === 'signup') {
    return (
      <SignupScreen
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('login')}
        onCreateAccount={() => setScreen('home')}
      />
    );
  }

  // =========================================================
  // MEDICAL HELP
  // =========================================================

  if (screen === 'medical-help') {
    return (
      <MedicalHelpScreen
        onBack={() => setScreen('home')}
      />
    );
  }

  // =========================================================
  // SCHEDULE
  // =========================================================

  if (screen === 'schedule') {
    return (
      <ScheduleScreen
        onBack={() => setScreen('home')}
      />
    );
  }

  // =========================================================
  // CALL FAMILY
  // =========================================================

  if (screen === 'call-family') {
    return (
      <CallFamilyScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // =========================================================
  // COGNITIVE SCORE
  // =========================================================

  if (screen === 'cognitive-score') {
    return (
      <CognitiveScoreScreen
        onBack={() => setScreen('home')}
      />
    );
  }

  // =========================================================
  // PROFILE
  // =========================================================

  if (screen === 'profile') {
    return (
      <ProfileScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // =========================================================
  // GAMES
  // =========================================================

  if (screen === 'games') {
    return (
      <GamesScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}

        // Game navigation
        onOddOneOut={() => setScreen('odd-one-out')}
        onGuessFood={() => setScreen('guess-food')}
      />
    );
  }

  // =========================================================
  // GUESS FOOD
  // =========================================================

  if (screen === 'guess-food') {
    return (
      <GuessFoodScreen
        onBack={() => setScreen('games')}
        onNextGame={() => {
          console.log('NEXT GAME PRESSED');
        }}
      />
    );
  }

  // =========================================================
  // MEMORY
  // =========================================================

  if (screen === 'memory') {
    return (
      <MemoryScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // =========================================================
  // ODD ONE OUT
  // =========================================================

  if (screen === 'odd-one-out') {
    return (
      <OddOneOutScreen
        onBack={() => setScreen('games')}
        onNextGame={() => {
          console.log('NEXT GAME PRESSED');
        }}
      />
    );
  }

  // =========================================================
  // PATIENT DASHBOARD
  // =========================================================

  if (screen === 'patient-dashboard') {
    return (
      <PatientDashboardScreen
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // =========================================================
  // HOME
  // =========================================================

  return (
    <HomeScreen
      onLogout={() => setScreen('welcome')}
      onMedicalHelp={() => setScreen('medical-help')}
      onSchedule={() => setScreen('schedule')}
      onCallFamily={() => setScreen('call-family')}
      onCognitiveScore={() => setScreen('cognitive-score')}
      onProfile={() => setScreen('profile')}
      onGames={() => setScreen('games')}
      onMemory={() => setScreen('memory')}
      onPatientDashboard={() => setScreen('patient-dashboard')}
    />
  );
}