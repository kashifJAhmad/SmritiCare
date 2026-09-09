import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import QuickAssist from "../../components/QuickAssist";

// ============================================================
// COLORS
// Matches the Patient Login / SmritiCare design system
// ============================================================

const COLORS = {
  background: "#F4FAFF",

  surface: "#FFFFFF",
  surfaceSoft: "#F6F3F2",

  primary: "#00450D",
  primaryContainer: "#1B5E20",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#90D689",

  secondary: "#556158",
  secondaryContainer: "#D9E6DA",

  outline: "#717A6D",
  outlineVariant: "#C0C9BB",

  text: "#1B1C1C",
  textSecondary: "#41493E",

  navy: "#102A56",

  medicalBlue: "#005B96",
  medicalBlueSoft: "#EAF4FB",

  cognitiveGreen: "#1B5E20",
  cognitiveGreenSoft: "#EAF5EA",

  scheduleGold: "#8A6500",
  scheduleGoldSoft: "#FFF6D9",

  familyRed: "#A00015",
  familyRedSoft: "#FDEBEC",
};

// ============================================================
// TYPES
// ============================================================

type HomeScreenProps = {
  onLogout: () => void;

  onMedicalHelp: () => void;
  onSchedule: () => void;
  onCallFamily: () => void;
  onCognitiveScore: () => void;

  onProfile?: () => void;
  onGames?: () => void;
  onMemory?: () => void;

  onVoiceAssistant?: () => void;
};

// ============================================================
// HOME SCREEN
// ============================================================

export default function HomeScreen({
  onLogout,
  onMedicalHelp,
  onSchedule,
  onCallFamily,
  onCognitiveScore,
  onProfile,
  onGames,
  onMemory,
  onVoiceAssistant,
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ======================================================
            HEADER
        ======================================================= */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>S</Text>
            </View>

            <View>
              <Text style={styles.appTitle}>SmritiCare</Text>
              <Text style={styles.appSubtitle}>Your care companion</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={onProfile}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <MaterialIcons
                name="person-outline"
                size={27}
                color={COLORS.primary}
              />
            </Pressable>

            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <MaterialIcons
                name="logout"
                size={25}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Decorative line */}

        <View style={styles.decorativeLine}>
          <View style={styles.linePrimary} />
          <View style={styles.lineSecondary} />
          <View style={styles.lineLight} />
        </View>

        {/* ======================================================
            MAIN CONTENT
        ======================================================= */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ====================================================
              WELCOME
          ===================================================== */}

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>

            <Text style={styles.welcomeSubtitle}>
              What would you like to do today?
            </Text>
          </View>

          {/* ====================================================
              MAIN ACTIONS
          ===================================================== */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionGrid}>
            {/* --------------------------------------------------
                MEDICAL HELP
            --------------------------------------------------- */}

            <Pressable
              onPress={onMedicalHelp}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Medical help"
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: COLORS.medicalBlueSoft,
                  },
                ]}
              >
                <MaterialIcons
                  name="medical-services"
                  size={36}
                  color={COLORS.medicalBlue}
                />
              </View>

              <Text style={styles.actionTitle}>Medical Help</Text>

              <Text style={styles.actionDescription}>
                Get help when you need it
              </Text>
            </Pressable>

            {/* --------------------------------------------------
                COGNITIVE SCORE
            --------------------------------------------------- */}

            <Pressable
              onPress={onCognitiveScore}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cognitive score"
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: COLORS.cognitiveGreenSoft,
                  },
                ]}
              >
                <MaterialIcons
                  name="assessment"
                  size={36}
                  color={COLORS.cognitiveGreen}
                />
              </View>

              <Text style={styles.actionTitle}>Cognitive Score</Text>

              <Text style={styles.actionDescription}>
                View your progress
              </Text>
            </Pressable>

            {/* --------------------------------------------------
                SCHEDULE
            --------------------------------------------------- */}

            <Pressable
              onPress={onSchedule}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="My schedule"
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: COLORS.scheduleGoldSoft,
                  },
                ]}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={36}
                  color={COLORS.scheduleGold}
                />
              </View>

              <Text style={styles.actionTitle}>My Schedule</Text>

              <Text style={styles.actionDescription}>
                View your reminders
              </Text>
            </Pressable>

            {/* --------------------------------------------------
                CALL FAMILY
            --------------------------------------------------- */}

            <Pressable
              onPress={onCallFamily}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Call family"
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: COLORS.familyRedSoft,
                  },
                ]}
              >
                <MaterialIcons
                  name="phone-in-talk"
                  size={36}
                  color={COLORS.familyRed}
                />
              </View>

              <Text style={styles.actionTitle}>Call Family</Text>

              <Text style={styles.actionDescription}>
                Stay connected
              </Text>
            </Pressable>
          </View>

          {/* ====================================================
              GAMES
          ===================================================== */}

          <Pressable
            onPress={onGames}
            style={({ pressed }) => [
              styles.featureCard,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open games"
          >
            <View style={styles.featureIcon}>
              <MaterialIcons
                name="psychology"
                size={31}
                color={COLORS.onPrimaryContainer}
              />
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Memory & Brain Games</Text>

              <Text style={styles.featureDescription}>
                Exercise your memory with simple activities
              </Text>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={30}
              color={COLORS.primary}
            />
          </Pressable>

          {/* ====================================================
              MEMORIES
          ===================================================== */}

          <Pressable
            onPress={onMemory}
            style={({ pressed }) => [
              styles.featureCard,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open memories"
          >
            <View style={styles.featureIcon}>
              <MaterialIcons
                name="auto-stories"
                size={31}
                color={COLORS.onPrimaryContainer}
              />
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>My Memories</Text>

              <Text style={styles.featureDescription}>
                Save and revisit special memories
              </Text>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={30}
              color={COLORS.primary}
            />
          </Pressable>

          {/* ====================================================
              SIMPLE SUPPORT CARD
          ===================================================== */}

          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <MaterialIcons
                name="favorite"
                size={26}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>
                We're here for you
              </Text>

              <Text style={styles.supportText}>
                SmritiCare helps you stay connected, organized,
                and supported throughout your day.
              </Text>
            </View>
          </View>

          {/* Bottom spacing */}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* ======================================================
            BOTTOM NAVIGATION
        ======================================================= */}

        <View style={styles.bottomNav}>
          {/* HOME */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === "Home" && styles.activeNavItem,
            ]}
            onPress={() => setActiveTab("Home")}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <MaterialIcons
              name="home"
              size={25}
              color={
                activeTab === "Home"
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === "Home" && styles.activeNavText,
              ]}
            >
              Home
            </Text>
          </Pressable>

          {/* GAMES */}

          <Pressable
            style={styles.navItem}
            onPress={() => {
              setActiveTab("Games");
              onGames?.();
            }}
            accessibilityRole="button"
            accessibilityLabel="Games"
          >
            <MaterialIcons
              name="sports-esports"
              size={25}
              color={COLORS.textSecondary}
            />

            <Text style={styles.navText}>Games</Text>
          </Pressable>

          {/* REMIND */}

          <Pressable
            style={styles.navItem}
            onPress={() => {
              setActiveTab("Remind");
              onSchedule();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reminders"
          >
            <MaterialIcons
              name="notifications-none"
              size={25}
              color={COLORS.textSecondary}
            />

            <Text style={styles.navText}>Remind</Text>
          </Pressable>

          {/* MEMORY */}

          <Pressable
            style={styles.navItem}
            onPress={() => {
              setActiveTab("Memory");
              onMemory?.();
            }}
            accessibilityRole="button"
            accessibilityLabel="Memories"
          >
            <MaterialIcons
              name="auto-stories"
              size={25}
              color={COLORS.textSecondary}
            />

            <Text style={styles.navText}>Memory</Text>
          </Pressable>

          {/* PROFILE */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === "Profile" && styles.activeNavItem,
            ]}
            onPress={() => {
              setActiveTab("Profile");
              onProfile?.();
            }}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <MaterialIcons
              name="person-outline"
              size={25}
              color={
                activeTab === "Profile"
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === "Profile" && styles.activeNavText,
              ]}
            >
              Profile
            </Text>
          </Pressable>
        </View>

        {/* ======================================================
            QUICK ASSIST
        ======================================================= */}

        <QuickAssist
          bottomOffset={88}
          onVoiceAssistant={onVoiceAssistant}
        />
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
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
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",

    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    width: "100%",
    minHeight: 72,

    paddingHorizontal: 20,

    backgroundColor: COLORS.surface,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoMark: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: COLORS.primaryContainer,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  logoLetter: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.onPrimaryContainer,
  },

  appTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },

  appSubtitle: {
    marginTop: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  headerButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  decorativeLine: {
    height: 5,
    width: "100%",

    flexDirection: "row",

    opacity: 0.18,
  },

  linePrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  lineSecondary: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  lineLight: {
    flex: 1,
    backgroundColor: COLORS.primaryContainer,
  },

  // ==========================================================
  // WELCOME
  // ==========================================================

  welcomeSection: {
    paddingTop: 10,
    paddingBottom: 22,
  },

  welcomeTitle: {
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "800",
    color: COLORS.navy,
  },

  welcomeSubtitle: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.textSecondary,
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: COLORS.text,
  },

  // ==========================================================
  // ACTION GRID
  // ==========================================================

  actionGrid: {
    width: "100%",

    flexDirection: "row",
    flexWrap: "wrap",

    gap: 14,
  },

  actionCard: {
    width: "48%",

    minHeight: 170,

    padding: 18,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,

    borderRadius: 20,

    alignItems: "flex-start",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,
  },

  actionIcon: {
    width: 58,
    height: 58,

    borderRadius: 29,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 13,
  },

  actionTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: COLORS.text,
  },

  actionDescription: {
    marginTop: 4,

    fontSize: 13.5,
    lineHeight: 19,

    color: COLORS.textSecondary,
  },

  // ==========================================================
  // FEATURE CARDS
  // ==========================================================

  featureCard: {
    width: "100%",

    minHeight: 92,

    marginTop: 16,

    padding: 16,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,

    borderRadius: 20,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,
  },

  featureIcon: {
    width: 56,
    height: 56,

    borderRadius: 28,

    backgroundColor: COLORS.primaryContainer,

    alignItems: "center",
    justifyContent: "center",
  },

  featureContent: {
    flex: 1,

    marginLeft: 14,
    marginRight: 8,
  },

  featureTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: COLORS.text,
  },

  featureDescription: {
    marginTop: 3,

    fontSize: 14,
    lineHeight: 20,

    color: COLORS.textSecondary,
  },

  // ==========================================================
  // SUPPORT
  // ==========================================================

  supportCard: {
    width: "100%",

    marginTop: 18,

    padding: 16,

    borderRadius: 20,

    backgroundColor: "#EDF7F0",

    flexDirection: "row",
    alignItems: "flex-start",
  },

  supportIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: COLORS.surface,

    alignItems: "center",
    justifyContent: "center",
  },

  supportContent: {
    flex: 1,
    marginLeft: 12,
  },

  supportTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  supportText: {
    marginTop: 4,

    fontSize: 13.5,
    lineHeight: 20,

    color: COLORS.textSecondary,
  },

  // ==========================================================
  // BOTTOM NAV
  // ==========================================================

  bottomNav: {
    width: "100%",
    minHeight: 76,

    paddingHorizontal: 4,
    paddingVertical: 7,

    backgroundColor: COLORS.surface,

    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    width: 64,
    minHeight: 58,

    paddingVertical: 6,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",
  },

  activeNavItem: {
    backgroundColor: "#EAF5EA",
  },

  navText: {
    marginTop: 3,

    fontSize: 12,
    lineHeight: 16,

    fontWeight: "700",

    color: COLORS.textSecondary,
  },

  activeNavText: {
    color: COLORS.primary,
  },

  // ==========================================================
  // OTHER
  // ==========================================================

  bottomSpacing: {
    height: 20,
  },

  pressed: {
    opacity: 0.75,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
});