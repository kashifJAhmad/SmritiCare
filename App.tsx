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
import CaregiverAuthScreen from './src/screens/auth/CaregiverAuthScreen';
import CaregiverLoginScreen from './src/screens/caregiver/CaregiverLoginScreen';
import CaregiverSignupScreen from './src/screens/caregiver/CaregiverSignupScreen';
import CaregiverDashboardScreen from './src/screens/caregiver/CaregiverDashboardScreen';
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
import { initDatabase } from './src/database/sqlite';
import { syncManager } from './src/services/syncManager';
import { getLocalProfile, saveLocalProfile } from './src/database/repositories/profileRepository';
import SyncStatusBadge from './src/components/SyncStatusBadge';

type Screen =
  | 'welcome'
  | 'patient-auth'
  | 'caregiver-auth'
  | 'caregiver-login'
  | 'caregiver-signup'
  | 'caregiver-dashboard'
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
  // RESTORE PATIENT SESSION & INITIALIZE SQLITE
  // ---------------------------------------------------------

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await initDatabase();
    } catch (e) {
      console.warn('SQLite init error:', e);
    }
    await restorePatientSession();
  }

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

      try {
        const result = await getCurrentPatient(token);

        if (result.success && result.user) {
          console.log(
            'SmritiCare: patient session restored:',
            result.user.fullName,
          );

          setPatient(result.user);
          syncManager.setUserId(result.user.id);
          await saveLocalProfile({
            userId: result.user.id,
            fullName: result.user.fullName,
            email: result.user.email,
            age: result.user.age,
            language: result.user.language,
            caregiverName: result.user.caregiverName,
            caregiverAccess: result.user.caregiverAccess,
            gpsSharing: result.user.gpsSharing,
            textSize: result.user.textSize,
            syncStatus: 'SYNCED',
          });
          setScreen('home');
          return;
        }
      } catch (netErr) {
        console.log('Network error restoring session online, checking local cache...');
      }

      // If offline or network unavailable, check if we have cached profile
      const cached = await getLocalProfile('patient_local');
      if (cached) {
        const localPatient: PatientUser = {
          id: cached.userId,
          fullName: cached.fullName,
          email: cached.email,
          role: 'PATIENT',
          age: cached.age ?? null,
          phone: cached.phone ?? null,
          dateOfBirth: cached.dateOfBirth ?? null,
          gender: cached.gender ?? null,
          address: cached.address ?? null,
          city: cached.city ?? null,
          bloodGroup: cached.bloodGroup ?? null,
          medicalNotes: cached.medicalNotes ?? null,
          profileImageUrl: cached.profileImageUrl ?? null,
          language: cached.language,
          caregiverName: cached.caregiverName ?? null,
          caregiverAccess: cached.caregiverAccess,
          gpsSharing: cached.gpsSharing,
          textSize: cached.textSize,
          createdAt: cached.updatedAt,
          updatedAt: cached.updatedAt,
        };
        setPatient(localPatient);
        syncManager.setUserId(cached.userId);
        setScreen('home');
        return;
      }

      setPatient(null);
      setScreen('welcome');
    } catch (error) {
      console.log(
        'SmritiCare: unable to restore patient session:',
        error,
      );

      setPatient(null);
      setScreen('welcome');
    } finally {
      setIsCheckingAuth(false);
    }
  }

  // ---------------------------------------------------------
  // PATIENT LOGOUT
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

      setPatient(null);
      setScreen('welcome');
    }
  }

  // ---------------------------------------------------------
  // PATIENT AUTH SUCCESS
  // ---------------------------------------------------------

  async function handleAuthenticationSuccess() {
    console.log('SmritiCare: authentication successful');

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
  // WELCOME
  // ---------------------------------------------------------

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onPatient={() => setScreen('patient-auth')}
        onFamilyMember={() => setScreen('caregiver-auth')}
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
  // CAREGIVER AUTH
  // ---------------------------------------------------------

  if (screen === 'caregiver-auth') {
    return (
      <CaregiverAuthScreen
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('caregiver-login')}
        onSignUp={() => setScreen('caregiver-signup')}
      />
    );
  }

  // ---------------------------------------------------------
  // PATIENT LOGIN
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
  // PATIENT SIGNUP
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
  // CAREGIVER LOGIN
  // ---------------------------------------------------------

  if (screen === 'caregiver-login') {
    return (
      <CaregiverLoginScreen
        onBack={() => setScreen('caregiver-auth')}
        onSignup={() => setScreen('caregiver-signup')}
        onLogin={() => setScreen('caregiver-dashboard')}
      />
    );
  }

  // ---------------------------------------------------------
  // CAREGIVER SIGNUP
  // ---------------------------------------------------------

  if (screen === "caregiver-signup") {
  return (
    <CaregiverSignupScreen
      onBack={() => setScreen("caregiver-auth")}
      onLogin={() => setScreen("caregiver-login")}
      onSignup={handleAuthenticationSuccess}
    />
  );
}

  // ---------------------------------------------------------
  // CAREGIVER DASHBOARD
  // ---------------------------------------------------------

  if (screen === 'caregiver-dashboard') {
    return (
      <CaregiverDashboardScreen
        onBack={() => setScreen('caregiver-auth')}
        onLogout={() => setScreen('caregiver-auth')}
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
        userId={patient?.id}
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
        userId={patient?.id}
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
        onVoiceAssistant={() => setScreen('voice-assistant')}
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
        userId={patient?.id}
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
        userId={patient?.id}
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onProfile={() => setScreen('profile')}
        onVoiceAssistant={() => setScreen('voice-assistant')}
      />
    );
  }

  // ---------------------------------------------------------
  // ODD ONE OUT
  // ---------------------------------------------------------

  if (screen === 'odd-one-out') {
    return (
      <OddOneOutScreen
        userId={patient?.id}
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
        onMedicine={() => {
          setScreen('schedule');
        }}
        onProfile={() => {
          setScreen('profile');
        }}
        onFamily={() => {
          setScreen('call-family');
        }}
        onGame={() => {
          setScreen('games');
        }}
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
      onVoiceAssistant={() => setScreen('voice-assistant')}
    />
  );
}

// ---------------------------------------------------------
// APP ROOT
// ---------------------------------------------------------

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}