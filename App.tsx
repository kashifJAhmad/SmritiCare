import React, { useState } from 'react';

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
  | 'odd-one-out';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

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
    />
  );
}