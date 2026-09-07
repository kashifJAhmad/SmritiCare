import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type HomeScreenProps = {
  onLogout?: () => void;
  onMedicalHelp?: () => void;
  onSchedule?: () => void;
  onCallFamily?: () => void;
  onCognitiveScore?: () => void;
  onProfile?: () => void;
  onGames?: () => void;
  onMemory?: () => void
  onPatientDashboard?: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  surface: '#F4FAFF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#E9F6FD',
  surfaceVariant: '#D7E4EC',
  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#90D689',
  secondary: '#00629E',
  secondaryContainer: '#62B4FE',
  onSecondaryContainer: '#004470',
  tertiary: '#7C000B',
  tertiaryContainer: '#A70515',
  onTertiary: '#FFFFFF',
  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',
  outline: '#717A6D',
  outlineVariant: '#C0C9BB',
};

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
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);

    // Navigation to other screens can be connected later.
    console.log('Selected tab:', tab);
  };

  const handleCardPress = (name: string) => {
    console.log('Selected:', name);
  };

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

            {/* Medical Help */}

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
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
                  size={48}
                  color={COLORS.onSecondaryContainer}
                />
              </View>

              <Text style={styles.cardTitle}>
                Medical{'\n'}Help
              </Text>
            </Pressable>

            {/* Cognitive Score */}

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
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
                  size={48}
                  color={COLORS.onPrimaryContainer}
                />
              </View>

              <Text style={styles.cardTitle}>
                Cognitive{'\n'}Score
              </Text>
            </Pressable>

            {/* My Schedule */}

            <Pressable
              style={styles.actionCard}
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
                  size={48}
                  color={COLORS.onSurfaceVariant}
                />
              </View>

              <Text style={styles.cardTitle}>
                My{'\n'}Schedule
              </Text>
            </Pressable>

            {/* Call Family */}

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
                  size={48}
                  color={COLORS.tertiary}
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
          <Pressable
            style={styles.dashboardCard}
            onPress={onPatientDashboard}
          >
            <View style={styles.dashboardIcon}>
              <MaterialIcons
                name="people"
                size={30}
                color="#00450D"
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
              size={30}
              color="#00450D"
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
                  size={48}
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
              size={36}
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
                  size={28}
                  color={COLORS.primary}
                />

                <Text style={styles.sectionTitle}>
                  Today's Schedule
                </Text>
              </View>

              {/* ===============================================
                  TASK 1
              =============================================== */}

              <View style={styles.taskCard}>

                <View style={styles.taskLeft}>

                  <MaterialIcons
                    name="medication"
                    size={32}
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
                    console.log('Morning Medicine completed')
                  }
                >
                  <Text style={styles.doneButtonText}>
                    Done
                  </Text>
                </Pressable>

              </View>

              {/* ===============================================
                  TASK 2
              =============================================== */}

              <View style={styles.taskCard}>

                <View style={styles.taskLeft}>

                  <MaterialIcons
                    name="local-drink"
                    size={32}
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
                    console.log('Drink Water marked')
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

          {/* Home */}
          <Pressable
            style={styles.navItem}
            onPress={() => {
              setActiveTab('Home');
            }}
          >
            <MaterialIcons name="home" size={24} color="#00450D" />
            <Text style={styles.navText}>Home</Text>
          </Pressable>

          {/* Games */}
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
              color="#41493E"
            />
            <Text style={styles.navText}>Games</Text>
          </Pressable>

          {/* Remind */}
          <Pressable
            style={styles.navItem}
            onPress={onSchedule}
          >
            <MaterialIcons name="notifications" size={24} color="#41493E" />
            <Text style={styles.navText}>Remind</Text>
          </Pressable>

          {/* Memory */}
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
              color="#41493E"
            />
            <Text style={styles.navText}>Memory</Text>
          </Pressable>

          {/* Profile */}
          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Profile' && styles.activeNavItem,
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
                activeTab === 'Profile' && styles.activeNavText,
              ]}
            >
              Profile
            </Text>
          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 20,
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
    paddingHorizontal: 24,
    paddingTop: 16,
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
    gap: 16,
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
    lineHeight: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },

  decorativeLine: {
    width: '100%',
    height: 8,
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
    paddingVertical: 16,
    marginBottom: 16,
  },

  greetingTitle: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  greetingSubtitle: {
    marginTop: 8,
    fontFamily: 'sans-serif',
    fontSize: 22,
    lineHeight: 32,
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
    gap: 20,
  },

  actionCard: {
    width: '47%',
    aspectRatio: 1,
    minHeight: 150,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  callFamilyCard: {
    backgroundColor: COLORS.tertiaryContainer,
    borderColor: COLORS.tertiary,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  medicalIconCircle: {
    backgroundColor: COLORS.secondaryContainer,
  },

  cognitiveIconCircle: {
    backgroundColor: COLORS.primaryContainer,
  },

  scheduleIconCircle: {
    backgroundColor: COLORS.surfaceVariant,
  },

  familyIconCircle: {
    backgroundColor: COLORS.onTertiary,
  },

  cardTitle: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.onSurface,
  },

  familyCardTitle: {
    color: COLORS.onTertiary,
  },

  // =========================================================
  // MY GAMES
  // =========================================================

  gamesCard: {
    width: '100%',
    marginTop: 32,
    padding: 24,
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
    gap: 16,
  },

  gamesIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gamesTextContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  // =========================================================
  // TODAY'S SCHEDULE
  // =========================================================

  scheduleCard: {
    width: '100%',
    marginTop: 32,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    overflow: 'hidden',
  },

  gamochaBorder: {
    width: '100%',
    height: 8,
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
    backgroundColor: COLORS.secondary,
  },

  scheduleContent: {
    padding: 24,
  },

  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },

  taskCard: {
    width: '100%',
    minHeight: 76,
    padding: 16,
    marginBottom: 16,
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
    gap: 16,
    flex: 1,
  },

  taskTitle: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  taskTime: {
    marginTop: 4,
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  doneButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneButtonText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },

  markButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  markButtonText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // =========================================================
  // BOTTOM NAVIGATION
  // =========================================================

  bottomNav: {
    height: 88,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
  },

  navItem: {
    width: 72,
    minHeight: 60,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },


  activeNavItem: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.95 }],
  },

  navText: {
    marginTop: 4,
    fontFamily: 'sans-serif',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  activeNavText: {
    color: COLORS.onPrimaryContainer,
  },

  bottomSpacing: {
    height: 20,
  },

  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 96,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C0C9BB',
    backgroundColor: '#FFFFFF',
  },

  dashboardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9E6DA',
    marginRight: 14,
  },

  dashboardContent: {
    flex: 1,
  },

  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111D23',
  },

  dashboardSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#41493E',
  },
  // =========================================================
  // PRESSED STATES
  // =========================================================

  pressed: {
    opacity: 0.75,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLow,
  },
});