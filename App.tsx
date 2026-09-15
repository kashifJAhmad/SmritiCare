import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ============================================================
// WELCOME
// ============================================================

import WelcomeScreen from "./src/screens/WelcomeScreen";

// ============================================================
// PATIENT SCREENS
// ============================================================

import HomeScreen from "./src/screens/home/HomeScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import ScheduleScreen from "./src/screens/reminders/ScheduleScreen";
import MemoryScreen from "./src/screens/memories/MemoryScreen";

// ============================================================
// CAREGIVER AUTH
// ============================================================

import CaregiverAuthScreen from "./src/screens/auth/CaregiverAuthScreen";
import CaregiverLoginScreen from "./src/screens/caregiver/CaregiverLoginScreen";
import CaregiverSignupScreen from "./src/screens/caregiver/CaregiverSignupScreen";

// ============================================================
// CAREGIVER APP
// ============================================================

import CaregiverDashboardScreen from "./src/screens/caregiver/CaregiverDashboardScreen";
import CaregiverProfileScreen from "./src/screens/caregiver/CaregiverProfileScreen";
import CaregiverAlertsScreen from "./src/screens/caregiver/CaregiverAlertsScreen";
import CaregiverRemindersScreen from "./src/screens/caregiver/CaregiverRemindersScreen";

// ============================================================
// AUTH STORAGE
// ============================================================

import {
  clearAuthSession,
  getAuthRole,
  getToken,
  saveAuthSession,
} from "./src/services/authStorage";
import { initDatabase } from './src/database/sqlite';
import { syncManager } from './src/services/syncManager';
import { getLocalProfile, saveLocalProfile } from './src/database/repositories/profileRepository';
import SyncStatusBadge from './src/components/SyncStatusBadge';

// ============================================================
// SCREEN TYPE
// ============================================================

type Screen =
  // Welcome
  | "welcome"

  // Patient authentication
  | "login"
  | "signup"

  // Patient application
  | "home"
  | "profile"
  | "schedule"
  | "memory"

  // Caregiver authentication
  | "caregiver-auth"
  | "caregiver-login"
  | "caregiver-signup"

  // Caregiver application
  | "caregiver-dashboard"
  | "caregiver-profile"
  | "caregiver-alerts"
  | "caregiver-reminders";

// ============================================================
// APP CONTENT
// ============================================================

function AppContent() {
  const [screen, setScreen] =
    useState<Screen>("welcome");

  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ---------------------------------------------------------
  // OFFLINE DETECTION
  // ---------------------------------------------------------

  const [isOffline, setIsOffline] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // RESTORE PATIENT SESSION & INITIALIZE SQLITE
  // ---------------------------------------------------------

  // ============================================================
  // RESTORE AUTHENTICATION
  // ============================================================

  useEffect(() => {
    initializeApp();
  }, []);

<<<<<<< Updated upstream
  async function initializeApp() {
    try {
      await initDatabase();
    } catch (e) {
      console.warn('SQLite init error:', e);
    }

    await restorePatientSession();
  }

  async function restorePatientSession() {
=======
  const checkAuthentication = async () => {
>>>>>>> Stashed changes
    try {
      const token = await getToken();
      const role = await getAuthRole();

<<<<<<< Updated upstream
    try {
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
=======
      // No saved session
      if (!token) {
        setScreen("welcome");
        return;
      }

      // --------------------------------------------------------
      // CAREGIVER SESSION
      // --------------------------------------------------------

      if (role === "caregiver") {
        setScreen("caregiver-dashboard");
        return;
      }

      // --------------------------------------------------------
      // PATIENT SESSION
      // --------------------------------------------------------

      if (role === "patient") {
        setScreen("home");
        return;
      }

      /*
       * Backward compatibility:
       *
       * Older versions of the app only stored the token
       * without storing the role.
       *
       * We treat that old session as a patient session.
       */
      setScreen("home");
>>>>>>> Stashed changes
    } catch (error) {
      console.warn(
        "Unable to restore authentication:",
        error,
      );

<<<<<<< Updated upstream
      setPatient(null);
      setScreen('welcome');
=======
      // If the stored session is corrupted,
      // start cleanly from Welcome.
      try {
        await clearAuthSession();
      } catch (clearError) {
        console.warn(
          "Unable to clear invalid authentication:",
          clearError,
        );
      }

      setScreen("welcome");
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PATIENT LOGIN
  // ============================================================

  const handlePatientLogin = async (
    token?: string,
  ) => {
    /*
     * LoginScreen normally saves its token itself.
     *
     * Saving here as well makes App resilient if the
     * login screen only returns the token.
     */
    if (token) {
      await saveAuthSession(
        token,
        "patient",
      );
    }

    setScreen("home");
  };

  // ============================================================
  // PATIENT SIGNUP
  // ============================================================

  const handlePatientSignup = async (
    token?: string,
  ) => {
    if (token) {
      await saveAuthSession(
        token,
        "patient",
      );
    }

    setScreen("home");
  };

  // ============================================================
  // CAREGIVER LOGIN
  // ============================================================

  const handleCaregiverLogin = async (
    token?: string,
  ) => {
    /*
     * CaregiverLoginScreen saves the session itself.
     *
     * We also accept a returned token here so App remains
     * safe if the login screen returns the token.
     */
    if (token) {
      await saveAuthSession(
        token,
        "caregiver",
      );
    }

    setScreen("caregiver-dashboard");
  };

  // ============================================================
  // CAREGIVER SIGNUP
  // ============================================================

  const handleCaregiverSignup = async (
    token?: string,
  ) => {
    /*
     * If caregiver signup returns a JWT, save it as a
     * caregiver session.
     *
     * If the signup screen already saves it, this is harmless.
     */
    if (token) {
      await saveAuthSession(
        token,
        "caregiver",
      );
    }

    setScreen("caregiver-dashboard");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await clearAuthSession();
    } catch (error) {
      console.warn(
        "Unable to clear authentication session:",
        error,
      );
    }

    setScreen("welcome");
  };

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#3F6F45"
        />
      </View>
    );
  }

  // ============================================================
  // WELCOME
  // ============================================================

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        onPatient={() => {
          setScreen("login");
        }}
        onFamilyMember={() => {
          setScreen("caregiver-auth");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT LOGIN
  // ============================================================

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
        onLogin={handlePatientLogin}
        onSignup={() => {
          setScreen("signup");
        }}
        onBack={() => {
          setScreen("welcome");
        }}
        onCaregiver={() => {
          setScreen("caregiver-auth");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT SIGNUP
  // ============================================================

  if (screen === "signup") {
    return (
      <SignupScreen
        onSignup={handlePatientSignup}
        onLogin={() => {
          setScreen("login");
        }}
        onBack={() => {
          setScreen("login");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER AUTH LANDING
  // ============================================================

  if (screen === "caregiver-auth") {
    return (
      <CaregiverAuthScreen
        onBack={() => {
          setScreen("welcome");
        }}
        onSignIn={() => {
          /*
           * IMPORTANT:
           *
           * Do NOT go directly to caregiver-dashboard.
           * The caregiver must actually authenticate first.
           */
          setScreen("caregiver-login");
        }}
        onSignUp={() => {
          setScreen("caregiver-signup");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER LOGIN
  // ============================================================

  if (screen === "caregiver-login") {
    return (
      <CaregiverLoginScreen
        onBack={() => {
          setScreen("caregiver-auth");
        }}
        onSignup={() => {
          setScreen("caregiver-signup");
        }}
        onLogin={handleCaregiverLogin}
      />
    );
  }

  // ============================================================
  // CAREGIVER SIGNUP
  // ============================================================

  if (screen === "caregiver-signup") {
    return (
      <CaregiverSignupScreen
        onBack={() => {
          setScreen("caregiver-auth");
        }}
        onLogin={() => {
          /*
           * Going to the actual caregiver login screen,
           * not the caregiver landing page.
           */
          setScreen("caregiver-login");
        }}
        onSignup={handleCaregiverSignup}
      />
    );
  }

  // ============================================================
  // CAREGIVER DASHBOARD
  // ============================================================

  if (screen === "caregiver-dashboard") {
    return (
      <CaregiverDashboardScreen
<<<<<<< Updated upstream
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
=======
        onBack={() => {
          setScreen("welcome");
>>>>>>> Stashed changes
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
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ============================================================
  // CAREGIVER REMINDERS
  // ============================================================

  if (screen === "caregiver-reminders") {
    return (
      <CaregiverRemindersScreen
        onBack={() => {
          setScreen("caregiver-dashboard");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER ALERTS
  // ============================================================

  if (screen === "caregiver-alerts") {
    return (
      <CaregiverAlertsScreen
        onBack={() => {
          setScreen("caregiver-dashboard");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER PROFILE
  // ============================================================

  if (screen === "caregiver-profile") {
    return (
      <CaregiverProfileScreen
        onBack={() => {
          setScreen("caregiver-dashboard");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ============================================================
  // PATIENT HOME
  // ============================================================

  if (screen === "home") {
    return (
      <HomeScreen
        onProfile={() => {
          setScreen("profile");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
        onLogout={handleLogout}
        onMedicalHelp={() => {
          console.log(
            "Medical Help screen is not registered yet.",
          );
        }}
        onCallFamily={() => {
          console.log(
            "Call Family screen is not registered yet.",
          );
        }}
        onCognitiveScore={() => {
          console.log(
            "Cognitive Score screen is not registered yet.",
          );
        }}
      />
    );
  }

  // ============================================================
  // PATIENT SCHEDULE
  // ============================================================

  if (screen === "schedule") {
    return (
      <ScheduleScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onProfile={() => {
          setScreen("profile");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT MEMORY
  // ============================================================

  if (screen === "memory") {
    return (
      <MemoryScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onProfile={() => {
          setScreen("profile");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT PROFILE
  // ============================================================

  if (screen === "profile") {
    return (
      <ProfileScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ============================================================
  // FALLBACK
  // ============================================================

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color="#3F6F45"
      />
    </View>
  );
}

// ============================================================
// ROOT APP
// ============================================================

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FBF9F1",
    alignItems: "center",
    justifyContent: "center",
  },
});