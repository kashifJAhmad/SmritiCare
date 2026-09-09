import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './src/screens/WelcomeScreen';
import PatientAuthScreen from './src/screens/auth/PatientAuthScreen';
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
import VoiceAssistantScreen from './src/screens/home/VoiceAssistantScreen';

import {
  getCurrentPatient,
  type PatientUser,
} from './src/services/api';

import {
  getToken,
  removeToken,
} from './src/services/authStorage';

type Screen =
  | 'welcome'
  | 'patient-auth'
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
  | 'patient-dashboard'
  | 'voice-assistant';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('welcome');

  // ---------------------------------------------------------
  // PATIENT AUTHENTICATION
  // ---------------------------------------------------------

  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ---------------------------------------------------------
  // OFFLINE DETECTION
  // ---------------------------------------------------------

  const [isOffline, setIsOffline] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);

  // ---------------------------------------------------------
  // RESTORE PATIENT SESSION
  // ---------------------------------------------------------

  useEffect(() => {
    restorePatientSession();
  }, []);

  async function restorePatientSession() {
    try {
      console.log('SmritiCare: checking saved patient session...');

      const token = await getToken();

      if (!token) {
        console.log('SmritiCare: no saved login found');

        setPatient(null);
        setScreen('welcome');
        return;
      }

      console.log('SmritiCare: saved token found');

      const result = await getCurrentPatient(token);

      if (result.success && result.user) {
        console.log(
          'SmritiCare: patient session restored:',
          result.user.fullName,
        );

        setPatient(result.user);
        setScreen('home');
      } else {
        console.log('SmritiCare: saved session is invalid');

        await removeToken();
        setPatient(null);
        setScreen('welcome');
      }
    } catch (error) {
      console.log(
        'SmritiCare: unable to restore patient session:',
        error,
      );

      await removeToken();
      setPatient(null);
      setScreen('welcome');
    } finally {
      setIsCheckingAuth(false);
    }
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  async function handleLogout() {
    try {
      console.log('SmritiCare: logging out patient...');

      await removeToken();

      setPatient(null);
      setScreen('welcome');

      console.log('SmritiCare: logout successful');
    } catch (error) {
      console.log('SmritiCare: logout error:', error);

      // Even if storage fails, don't keep the user inside
      // the authenticated part of the app.
      setPatient(null);
      setScreen('welcome');
    }
  }

  // ---------------------------------------------------------
  // AUTH SUCCESS
  // ---------------------------------------------------------

  async function handleAuthenticationSuccess() {
    console.log('SmritiCare: authentication successful');

    // The Signup/Login screen has already saved the token.
    // We now load the complete patient from /api/auth/me.
    try {
      const token = await getToken();

      if (!token) {
        console.log('SmritiCare: no token after authentication');
        setPatient(null);
        setScreen('welcome');
        return;
      }

      const result = await getCurrentPatient(token);

      if (result.success && result.user) {
        setPatient(result.user);
        setScreen('home');

        console.log(
          'SmritiCare: logged in as:',
          result.user.fullName,
        );
      } else {
        await removeToken();
        setPatient(null);
        setScreen('welcome');
      }
    } catch (error) {
      console.log(
        'SmritiCare: unable to load current patient:',
        error,
      );

      await removeToken();
      setPatient(null);
      setScreen('welcome');
    }
  }

  // ---------------------------------------------------------
  // OFFLINE DETECTION
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!mounted) return;

      const offline =
        state.isConnected === false ||
        state.isInternetReachable === false;

      setIsOffline(offline);
      setConnectionChecked(true);
    });

    // Extra support for Expo Web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
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
  // WAIT FOR AUTHENTICATION CHECK
  // ---------------------------------------------------------

  if (isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#F4FAFF',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 30,
        }}
      >
        <ActivityIndicator
          size="large"
          color="#00450D"
        />

        <Text
          style={{
            marginTop: 18,
            fontSize: 18,
            fontWeight: '600',
            color: '#00450D',
            textAlign: 'center',
          }}
        >
          Loading SmritiCare...
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: '#41493E',
            textAlign: 'center',
          }}
        >
          Checking your patient account
        </Text>
      </View>
    );
  }

  // ---------------------------------------------------------
  // WAIT UNTIL CONNECTION STATUS IS CHECKED
  // ---------------------------------------------------------

  if (!connectionChecked) {
    return null;
  }

  // ---------------------------------------------------------
  // OFFLINE SCREEN
  // ---------------------------------------------------------

  if (isOffline) {
    return (
      <OfflineScreen
        onBack={() => {
          if (
            Platform.OS === 'web' &&
            typeof window !== 'undefined' &&
            window.navigator.onLine
          ) {
            setIsOffline(false);
          }
        }}
        onHome={() => {
          if (
            Platform.OS === 'web' &&
            typeof window !== 'undefined' &&
            window.navigator.onLine
          ) {
            setScreen('home');
            setIsOffline(false);
          }
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // WELCOME
  // ---------------------------------------------------------

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onPatient={() => setScreen('patient-auth')}
        onFamilyMember={() => setScreen('login')}
      />
    );
  }

  // ---------------------------------------------------------
  // PATIENT AUTH
  // ---------------------------------------------------------

  if (screen === 'patient-auth') {
    return (
      <PatientAuthScreen
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('login')}
        onSignUp={() => setScreen('signup')}
      />
    );
  }

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={handleAuthenticationSuccess}
        onSignup={() => setScreen('signup')}
        onBack={() => setScreen('patient-auth')}
      />
    );
  }

  // ---------------------------------------------------------
  // SIGNUP
  // ---------------------------------------------------------

  if (screen === 'signup') {
    return (
      <SignupScreen
        onSignup={handleAuthenticationSuccess}
        onLogin={() => setScreen('login')}
        onBack={() => setScreen('patient-auth')}
      />
    );
  }

  // ---------------------------------------------------------
  // MEDICAL HELP
  // ---------------------------------------------------------

  if (screen === 'medical-help') {
    return (
      <MedicalHelpScreen
        onBack={() => setScreen('home')}
      />
    );
  }

  // ---------------------------------------------------------
  // SCHEDULE
  // ---------------------------------------------------------

  if (screen === 'schedule') {
  return (
    <ScheduleScreen
      onBack={() => setScreen('home')}
      onHome={() => setScreen('home')}
      onGames={() => setScreen('games')}
      onSchedule={() => setScreen('schedule')}
      onMemory={() => setScreen('memory')}
      onProfile={() => setScreen('profile')}
    />
  );
}
  // ---------------------------------------------------------
  // CALL FAMILY
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // COGNITIVE SCORE
  // ---------------------------------------------------------

  if (screen === 'cognitive-score') {
    return (
      <CognitiveScoreScreen
        onBack={() => setScreen('home')}
      />
    );
  }

  // ---------------------------------------------------------
  // PROFILE
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // GAMES
  // ---------------------------------------------------------

  if (screen === 'games') {
    return (
      <GamesScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
        onOddOneOut={() => setScreen('odd-one-out')}
        onGuessFood={() => setScreen('guess-food')}
      />
    );
  }

  // ---------------------------------------------------------
  // GUESS FOOD
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // MEMORY
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // ODD ONE OUT
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // PATIENT DASHBOARD
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // VOICE ASSISTANT
  // ---------------------------------------------------------

  if (screen === 'voice-assistant') {
    return (
      <VoiceAssistantScreen
        onBack={() => setScreen('home')}

        // Remind me to take my medicine
        onMedicine={() => {
          setScreen('schedule');
        }}

        // Open profile
        onProfile={() => {
          setScreen('profile');
        }}

        // Call my family
        onFamily={() => {
          setScreen('call-family');
        }}

        // Start a memory game
        onGame={() => {
          setScreen('games');
        }}

        // Show my schedule
        onSchedule={() => {
          setScreen('schedule');
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // HOME
  // ---------------------------------------------------------

  return (
    <HomeScreen
      onLogout={handleLogout}
      onMedicalHelp={() => setScreen('medical-help')}
      onSchedule={() => setScreen('schedule')}
      onCallFamily={() => setScreen('call-family')}
      onCognitiveScore={() => setScreen('cognitive-score')}
      onProfile={() => setScreen('profile')}
      onGames={() => setScreen('games')}
      onMemory={() => setScreen('memory')}
      // onPatientDashboard={() => setScreen('patient-dashboard')}
      onVoiceAssistant={() => setScreen('voice-assistant')}
    />
  );
}

// ---------------------------------------------------------
// APP ROOT
// SafeAreaProvider must wrap the entire application.
// ---------------------------------------------------------

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}