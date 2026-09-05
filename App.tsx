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

type Screen = 'welcome' | 'login' | 'signup' | 'home' | 'medical-help' | 'schedule' | 'call-family' | 'cognitive-score' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setScreen('login')}
        onSignIn={() => setScreen('signup')}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onBack={() => setScreen('welcome')}
        onSignUp={() => setScreen('signup')}
        onLogin={() => setScreen('home')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignupScreen
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('login')}
        onCreateAccount={() => setScreen('home')}
      />
    );
  }
  if (screen === 'medical-help') {
    return (
      <MedicalHelpScreen
        onBack={() => setScreen('home')}
      />
    );
  }
  if (screen === 'schedule') {
    return (
      <ScheduleScreen
        onBack={() => setScreen('home')}
      />
    );
  }
  if (screen === 'call-family') {
    return (
      <CallFamilyScreen
        onBack={() => setScreen('home')}
      />
    );
  }
  if (screen === 'cognitive-score') {
    return (
      <CognitiveScoreScreen
        onBack={() => setScreen('home')}
      />
    );
  }
  if (screen === 'profile') {
  return (
    <ProfileScreen
      onBack={() => setScreen('home')}
      onHome={() => setScreen('home')}
      onSchedule={() => setScreen('schedule')}
      onProfile={() => setScreen('profile')}
    />
  );
}
  return (
   <HomeScreen
  onLogout={() => setScreen('welcome')}
  onMedicalHelp={() => setScreen('medical-help')}
  onSchedule={() => setScreen('schedule')}
  onCallFamily={() => setScreen('call-family')}
  onCognitiveScore={() => setScreen('cognitive-score')}
  onProfile={() => setScreen('profile')}
/>
  );
}