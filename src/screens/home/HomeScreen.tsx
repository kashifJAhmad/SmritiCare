import React, { useState } from 'react';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MaterialIcons,
  Ionicons,
} from '@expo/vector-icons';

import QuickAssist from '../../components/QuickAssist';

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  background: '#F4FAFF',

  surface: '#FFFFFF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#F6F3F2',
  surfaceVariant: '#EAE7E7',

  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#90D689',

  secondary: '#556158',
  secondaryContainer: '#D9E6DA',

  tertiary: '#8B3A3A',
  tertiaryContainer: '#C40018',
  onTertiary: '#FFFFFF',

  outline: '#717A6D',
  outlineVariant: '#C0C9BB',

  onSurface: '#1B1C1C',
  onSurfaceVariant: '#41493E',
};

// =========================================================
// TYPES
// =========================================================

type HomeScreenProps = {
  onLogout: () => void;
  onMedicalHelp: () => void;
  onSchedule: () => void;
  onCallFamily: () => void;
  onCognitiveScore: () => void;

  onProfile?: () => void;
  onGames?: () => void;
  onMemory?: () => void;

  onPatientDashboard?: () => void;
  onVoiceAssistant?: () => void;
};

// =========================================================
// HOME SCREEN
// =========================================================

export default function HomeScreen({
  onLogout,
  onMedicalHelp,
  onSchedule,
  onCallFamily,
  onCognitiveScore,
  onProfile,
  onGames,
  onMemory,
  onPatientDashboard,
  onVoiceAssistant,
}: HomeScreenProps) {

  const [activeTab, setActiveTab] = useState('Home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* =====================================================
            TOP APP BAR
        ====================================================== */}

        <View style={styles.header}>

          <View style={styles.headerRow}>

            <View style={styles.headerLeft}>

              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
                onPress={onLogout}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >

                <Ionicons
                  name="arrow-back"
                  size={32}
                  color={COLORS.primary}
                />

              </Pressable>

              <Text style={styles.appTitle}>
                SmritiCare
              </Text>

            </View>

          </View>

          {/* Decorative line */}

          <View style={styles.decorativeLine}>

            <View style={styles.lineTertiary} />

            <View style={styles.linePrimary} />

            <View style={styles.lineSecondary} />

          </View>

        </View>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* ===================================================
              GREETING
          ==================================================== */}

          <View style={styles.greeting}>

            <Text style={styles.greetingTitle}>
              Hello, Aita
            </Text>

            <Text style={styles.greetingSubtitle}>
              What would you like to do today?
            </Text>

          </View>

          {/* ===================================================
              2 × 2 ACTION GRID
          ==================================================== */}

          <View style={styles.grid}>

            {/* =================================================
                MEDICAL HELP
            ================================================== */}

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.medicalHelpCard,
                pressed && styles.cardPressed,
              ]}
              onPress={onMedicalHelp}
            >

              <View
                style={[
                  styles.iconCircle,
                  styles.medicalIconCircle,
                ]}
              >

                <MaterialIcons
                  name="medical-services"
                  size={42}
                  color="#005B96"
                />

              </View>

              <Text
                style={[
                  styles.cardTitle,
                  styles.medicalCardTitle,
                ]}
              >
                Medical{'\n'}Help
              </Text>

            </Pressable>

            {/* =================================================
                COGNITIVE SCORE
            ================================================== */}

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.cognitiveScoreCard,
                pressed && styles.cardPressed,
              ]}
              onPress={onCognitiveScore}
            >

              <View
                style={[
                  styles.iconCircle,
                  styles.cognitiveIconCircle,
                ]}
              >

                <MaterialIcons
                  name="assessment"
                  size={42}
                  color="#1B5E20"
                />

              </View>

              <Text
                style={[
                  styles.cardTitle,
                  styles.cognitiveCardTitle,
                ]}
              >
                Cognitive{'\n'}Score
              </Text>

            </Pressable>

            {/* =================================================
                MY SCHEDULE
            ================================================== */}

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.scheduleActionCard,
                pressed && styles.cardPressed,
              ]}
              onPress={onSchedule}
            >

              <View
                style={[
                  styles.iconCircle,
                  styles.scheduleIconCircle,
                ]}
              >

                <MaterialIcons
                  name="calendar-today"
                  size={42}
                  color="#4A3500"
                />

              </View>

              <Text
                style={[
                  styles.cardTitle,
                  styles.scheduleCardTitle,
                ]}
              >
                My{'\n'}Schedule
              </Text>

            </Pressable>

            {/* =================================================
                CALL FAMILY
            ================================================== */}

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.callFamilyCard,
                pressed && styles.cardPressed,
              ]}
              onPress={onCallFamily}
            >

              <View
                style={[
                  styles.iconCircle,
                  styles.familyIconCircle,
                ]}
              >

                <MaterialIcons
                  name="phone-in-talk"
                  size={42}
                  color="#A00015"
                />

              </View>

              <Text
                style={[
                  styles.cardTitle,
                  styles.familyCardTitle,
                ]}
              >
                Call{'\n'}Family
              </Text>

            </Pressable>

          </View>

          {/* ===================================================
              PATIENT DASHBOARD
          ==================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.dashboardCard,
              pressed && styles.cardPressed,
            ]}
            onPress={onPatientDashboard}
          >

            <View style={styles.dashboardIcon}>

              <MaterialIcons
                name="people"
                size={30}
                color={COLORS.primary}
              />

            </View>

            <View style={styles.dashboardContent}>

              <Text style={styles.dashboardTitle}>
                Patient Dashboard
              </Text>

              <Text style={styles.dashboardSubtitle}>
                Manage and monitor patient status.
              </Text>

            </View>

            <MaterialIcons
              name="chevron-right"
              size={32}
              color={COLORS.primary}
            />

          </Pressable>

          {/* ===================================================
              MY GAMES
          ==================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.gamesCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {
              console.log('GAMES PRESSED');
              onGames?.();
            }}
          >

            <View style={styles.gamesLeft}>

              <View style={styles.gamesIconCircle}>

                <MaterialIcons
                  name="psychology"
                  size={34}
                  color={COLORS.onPrimaryContainer}
                />

              </View>

              <View style={styles.gamesTextContainer}>

                <Text style={styles.sectionTitle}>
                  My Games
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Personalized Challenges
                </Text>

              </View>

            </View>

            <MaterialIcons
              name="chevron-right"
              size={32}
              color={COLORS.primary}
            />

          </Pressable>

          {/* ===================================================
              TODAY'S SCHEDULE
          ==================================================== */}

          <View style={styles.scheduleCard}>

            {/* Gamocha-style top border */}

            <View style={styles.gamochaBorder}>

              <View style={styles.gamochaRed} />

              <View style={styles.gamochaGreen} />

              <View style={styles.gamochaBlue} />

            </View>

            <View style={styles.scheduleContent}>

              {/* Schedule Header */}

              <View style={styles.scheduleHeader}>

                <MaterialIcons
                  name="today"
                  size={26}
                  color={COLORS.primary}
                />

                <Text style={styles.sectionTitle}>
                  Today's Schedule
                </Text>

              </View>

              {/* =================================================
                  TASK 1
              ================================================== */}

              <View style={styles.taskCard}>

                <View style={styles.taskLeft}>

                  <MaterialIcons
                    name="medication"
                    size={30}
                    color={COLORS.primary}
                  />

                  <View>

                    <Text style={styles.taskTitle}>
                      Morning Medicine
                    </Text>

                    <Text style={styles.taskTime}>
                      9:00 AM
                    </Text>

                  </View>

                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.doneButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    console.log(
                      'Morning Medicine completed'
                    )
                  }
                >

                  <Text style={styles.doneButtonText}>
                    Done
                  </Text>

                </Pressable>

              </View>

              {/* =================================================
                  TASK 2
              ================================================== */}

              <View style={styles.taskCard}>

                <View style={styles.taskLeft}>

                  <MaterialIcons
                    name="local-drink"
                    size={30}
                    color={COLORS.primary}
                  />

                  <View>

                    <Text style={styles.taskTitle}>
                      Drink Water
                    </Text>

                    <Text style={styles.taskTime}>
                      11:00 AM
                    </Text>

                  </View>

                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.markButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    console.log(
                      'Drink Water marked'
                    )
                  }
                >

                  <Text style={styles.markButtonText}>
                    Mark
                  </Text>

                </Pressable>

              </View>

            </View>

          </View>

          {/* Bottom spacing */}

          <View style={styles.bottomSpacing} />

        </ScrollView>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <View style={styles.bottomNav}>

          {/* =================================================
              HOME
          ================================================== */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Home' &&
                styles.activeNavItem,
            ]}
            onPress={() => {
              setActiveTab('Home');
            }}
          >

            <MaterialIcons
              name="home"
              size={24}
              color={
                activeTab === 'Home'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Home' &&
                  styles.activeNavText,
              ]}
            >
              Home
            </Text>

          </Pressable>

          {/* =================================================
              GAMES
          ================================================== */}

          <Pressable
            style={styles.navItem}
            onPress={() => {
              console.log('GAMES PRESSED');
              onGames?.();
            }}
          >

            <MaterialIcons
              name="sports-esports"
              size={24}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Games
            </Text>

          </Pressable>

          {/* =================================================
              REMIND
          ================================================== */}

          <Pressable
            style={styles.navItem}
            onPress={onSchedule}
          >

            <MaterialIcons
              name="notifications"
              size={24}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Remind
            </Text>

          </Pressable>

          {/* =================================================
              MEMORY
          ================================================== */}

          <Pressable
            style={styles.navItem}
            onPress={() => {
              console.log('MEMORY PRESSED');
              onMemory?.();
            }}
          >

            <MaterialIcons
              name="auto-stories"
              size={24}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Memory
            </Text>

          </Pressable>

          {/* =================================================
              PROFILE
          ================================================== */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Profile' &&
                styles.activeNavItem,
            ]}
            onPress={() => {

              console.log('PROFILE PRESSED');

              setActiveTab('Profile');

              onProfile?.();

            }}
          >

            <MaterialIcons
              name="person"
              size={24}
              color={
                activeTab === 'Profile'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Profile' &&
                  styles.activeNavText,
              ]}
            >
              Profile
            </Text>

          </Pressable>

        </View>

        {/* =====================================================
            QUICK ASSIST
        ====================================================== */}

        <QuickAssist
          bottomOffset={100}
          onVoiceAssistant={onVoiceAssistant}
        />

      </View>
    </SafeAreaView>
  );
}
// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  // =========================================================
  // MAIN
  // =========================================================

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',

    paddingHorizontal: 22,
    paddingTop: 100,
    paddingBottom: 24,
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    zIndex: 50,

    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,

    backgroundColor: COLORS.surface,

    borderBottomWidth: 2,
    borderBottomColor: COLORS.outlineVariant,
  },

  headerRow: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,
  },

  backButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  appTitle: {
    fontFamily: 'sans-serif',

    fontSize: 28,
    lineHeight: 34,

    fontWeight: '700',

    color: COLORS.primary,
  },

  decorativeLine: {
    width: '100%',
    height: 7,

    marginTop: 8,

    borderRadius: 4,

    overflow: 'hidden',

    flexDirection: 'row',

    opacity: 0.2,
  },

  lineTertiary: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },

  linePrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  lineSecondary: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  // =========================================================
  // GREETING
  // =========================================================

  greeting: {
    paddingVertical: 10,
    marginBottom: 14,
  },

  greetingTitle: {
    fontFamily: 'sans-serif',

    fontSize: 26,
    lineHeight: 32,

    fontWeight: '700',

    color: COLORS.onSurface,
  },

  greetingSubtitle: {
    marginTop: 6,

    fontFamily: 'sans-serif',

    fontSize: 20,
    lineHeight: 28,

    fontWeight: '400',

    color: COLORS.onSurfaceVariant,
  },

  // =========================================================
  // ACTION GRID
  // =========================================================

  grid: {
    width: '100%',

    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 16,
  },

  actionCard: {
    width: '47%',

    aspectRatio: 1,

    minHeight: 140,

    borderWidth: 2,
    borderRadius: 12,

    padding: 12,

    alignItems: 'center',
    justifyContent: 'center',

    gap: 12,
  },

  // =========================================================
  // MEDICAL HELP - BLUE
  // =========================================================

  medicalHelpCard: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  medicalCardTitle: {
    color: '#FFFFFF',
  },

  // =========================================================
  // COGNITIVE SCORE - GREEN
  // =========================================================

  cognitiveScoreCard: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },

  cognitiveCardTitle: {
    color: '#FFFFFF',
  },

  // =========================================================
  // MY SCHEDULE - YELLOW
  // =========================================================

  scheduleActionCard: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },

  scheduleCardTitle: {
    color: '#000000',
  },

  // =========================================================
  // CALL FAMILY - RED
  // =========================================================

  callFamilyCard: {
    backgroundColor: '#C40018',
    borderColor: '#C40018',
  },

  familyCardTitle: {
    color: '#FFFFFF',
  },

  // =========================================================
  // ACTION CARD ICONS
  // =========================================================

  iconCircle: {
    width: 60,
    height: 60,

    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  medicalIconCircle: {
    backgroundColor: '#FFFFFF',
  },

  cognitiveIconCircle: {
    backgroundColor: '#FFFFFF',
  },

  scheduleIconCircle: {
    backgroundColor: '#FFFFFF',
  },

  familyIconCircle: {
    backgroundColor: '#FFFFFF',
  },

  cardTitle: {
    fontFamily: 'sans-serif',

    fontSize: 18,
    lineHeight: 22,

    fontWeight: '700',

    textAlign: 'center',

    color: '#FFFFFF',
  },

  // =========================================================
  // PATIENT DASHBOARD
  // =========================================================

  dashboardCard: {
    width: '100%',

    marginTop: 18,

    minHeight: 100,

    padding: 16,

    backgroundColor: COLORS.surfaceLowest,

    borderWidth: 2,
    borderColor: COLORS.outlineVariant,

    borderRadius: 12,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  dashboardIcon: {
    width: 56,
    height: 56,

    borderRadius: 28,

    backgroundColor: COLORS.primaryContainer,

    alignItems: 'center',
    justifyContent: 'center',
  },

  dashboardContent: {
    flex: 1,

    marginLeft: 14,
    marginRight: 8,
  },

  dashboardTitle: {
    fontFamily: 'sans-serif',

    fontSize: 20,
    lineHeight: 25,

    fontWeight: '700',

    color: COLORS.onSurface,
  },

  dashboardSubtitle: {
    marginTop: 3,

    fontFamily: 'sans-serif',

    fontSize: 14,
    lineHeight: 20,

    color: COLORS.onSurfaceVariant,
  },

  // =========================================================
  // MY GAMES
  // =========================================================

  gamesCard: {
    width: '100%',

    marginTop: 20,

    minHeight: 100,

    padding: 16,

    backgroundColor: COLORS.surfaceLowest,

    borderWidth: 2,
    borderColor: COLORS.outlineVariant,

    borderRadius: 12,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  gamesLeft: {
    flexDirection: 'row',

    alignItems: 'center',

    flex: 1,

    gap: 14,
  },

  gamesIconCircle: {
    width: 56,
    height: 56,

    borderRadius: 28,

    backgroundColor: COLORS.primaryContainer,

    alignItems: 'center',
    justifyContent: 'center',
  },

  gamesTextContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'sans-serif',

    fontSize: 20,
    lineHeight: 25,

    fontWeight: '700',

    color: COLORS.onSurface,
  },

  sectionSubtitle: {
    marginTop: 3,

    fontFamily: 'sans-serif',

    fontSize: 14,
    lineHeight: 20,

    color: COLORS.onSurfaceVariant,
  },

  // =========================================================
  // TODAY'S SCHEDULE
  // =========================================================

  scheduleCard: {
    width: '100%',

    marginTop: 20,

    backgroundColor: COLORS.surfaceLowest,

    borderWidth: 2,
    borderColor: COLORS.outlineVariant,

    borderRadius: 12,

    overflow: 'hidden',
  },

  gamochaBorder: {
    width: '100%',
    height: 7,

    flexDirection: 'row',
  },

  gamochaRed: {
    flex: 1,

    backgroundColor: COLORS.tertiaryContainer,
  },

  gamochaGreen: {
    flex: 1,

    backgroundColor: COLORS.primary,
  },

  gamochaBlue: {
    flex: 1,

    backgroundColor: '#2196F3',
  },

  scheduleContent: {
    padding: 16,
  },

  scheduleHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

    marginBottom: 18,
  },

  // =========================================================
  // TASK CARDS
  // =========================================================

  taskCard: {
    width: '100%',

    minHeight: 72,

    padding: 12,

    marginBottom: 12,

    backgroundColor: COLORS.surfaceLow,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,

    borderRadius: 8,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  taskLeft: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    flex: 1,
  },

  taskTitle: {
    fontFamily: 'sans-serif',

    fontSize: 17,
    lineHeight: 22,

    fontWeight: '700',

    color: COLORS.onSurface,
  },

  taskTime: {
    marginTop: 3,

    fontFamily: 'sans-serif',

    fontSize: 15,
    lineHeight: 20,

    color: COLORS.onSurfaceVariant,
  },

  // =========================================================
  // DONE BUTTON
  // =========================================================

  doneButton: {
    minHeight: 44,

    paddingHorizontal: 18,

    borderRadius: 22,

    backgroundColor: COLORS.primary,

    borderWidth: 2,
    borderColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  doneButtonText: {
    fontFamily: 'sans-serif',

    fontSize: 16,
    lineHeight: 20,

    fontWeight: '700',

    color: COLORS.onPrimary,
  },

  // =========================================================
  // MARK BUTTON
  // =========================================================

  markButton: {
    minHeight: 44,

    paddingHorizontal: 18,

    borderRadius: 22,

    backgroundColor: COLORS.surfaceLowest,

    borderWidth: 2,
    borderColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  markButtonText: {
    fontFamily: 'sans-serif',

    fontSize: 16,
    lineHeight: 20,

    fontWeight: '700',

    color: COLORS.primary,
  },

  // =========================================================
  // BOTTOM NAVIGATION
  // =========================================================

  bottomNav: {
    height: 78,

    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    paddingHorizontal: 4,
    paddingVertical: 8,

    backgroundColor: COLORS.surface,

    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
  },

  navItem: {
    width: 64,

    minHeight: 56,

    padding: 6,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavItem: {
    backgroundColor: COLORS.primaryContainer,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  navText: {
    marginTop: 3,

    fontFamily: 'sans-serif',

    fontSize: 12,
    lineHeight: 16,

    fontWeight: '700',

    color: COLORS.onSurfaceVariant,
  },

  activeNavText: {
    color: COLORS.onPrimaryContainer,
  },

  // =========================================================
  // BOTTOM SPACING
  // =========================================================

  bottomSpacing: {
    height: 24,
  },

  // =========================================================
  // PRESSED STATES
  // =========================================================

  pressed: {
    opacity: 0.75,
  },

  cardPressed: {
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

});