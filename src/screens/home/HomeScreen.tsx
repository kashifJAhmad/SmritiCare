import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import QuickAssist from '../../components/QuickAssist';

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

type NavButtonProps = {
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
};

function NavButton({
  label,
  icon,
  active = false,
  onPress,
}: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        active && styles.navButtonActive,
        pressed && styles.navButtonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navIconActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type ActionCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  wide?: boolean;
};

function ActionCard({
  title,
  subtitle,
  icon,
  onPress,
  wide = false,
}: ActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        wide && styles.actionCardWide,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.actionIconContainer}>
        <MaterialIcons
          name={icon}
          size={30}
          color={COLORS.green}
        />
      </View>

      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>

        <Text style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={26}
        color={COLORS.secondaryText}
      />
    </Pressable>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
};

function FeatureCard({
  title,
  description,
  icon,
  onPress,
}: FeatureCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.featureIconContainer}>
        <MaterialIcons
          name={icon}
          size={30}
          color={COLORS.green}
        />
      </View>

      <Text style={styles.featureTitle}>{title}</Text>

      <Text style={styles.featureDescription}>
        {description}
      </Text>

      <View style={styles.featureArrow}>
        <MaterialIcons
          name="arrow-forward"
          size={20}
          color={COLORS.green}
        />
      </View>
    </Pressable>
  );
}

const COLORS = {
  background: '#FBF9F1',
  surface: '#FFFFFF',
  text: '#1B1C17',
  secondaryText: '#62655E',
  green: '#3F6F45',
  greenDark: '#315A36',
  greenSoft: '#E7EFE3',
  greenBorder: '#D5E2D0',
  peach: '#B96F43',
  peachSoft: '#F7E9DC',
  peachBorder: '#EBD8C5',
  border: '#D9DDD4',
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
  onVoiceAssistant,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;

  const [showQuickAssist, setShowQuickAssist] =
    useState(false);

  const handleLogout = () => {
    if (isMobile) {
      Alert.alert(
        'Sign out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign out',
            style: 'destructive',
            onPress: onLogout,
          },
        ],
      );
    } else {
      onLogout();
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.screen}>
        {/* SUBTLE BOTANICAL TEXTURE */}
        <View style={styles.leftLeafOne} />
        <View style={styles.leftLeafTwo} />
        <View style={styles.rightLeafOne} />
        <View style={styles.rightLeafTwo} />

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <View>
              <Text style={styles.brandName}>
                SmritiCare
              </Text>

              <Text style={styles.brandSubtitle}>
                Your care companion
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={onProfile}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <Ionicons
                name="person-outline"
                size={23}
                color={COLORS.text}
              />
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Ionicons
                name="log-out-outline"
                size={23}
                color={COLORS.text}
              />
            </Pressable>
          </View>
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            isMobile && styles.contentMobile,
            isTablet && styles.contentTablet,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* WELCOME */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              Welcome back
            </Text>

            <Text style={styles.welcomeText}>
              What would you like to do today?
            </Text>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>

            <Text style={styles.sectionSubtitle}>
              Easy access to the things you need most
            </Text>

            <View
              style={[
                styles.actionsGrid,
                isMobile && styles.actionsGridMobile,
              ]}
            >
              <ActionCard
                title="Medical Help"
                subtitle="Get help when you need it"
                icon="medical-services"
                onPress={onMedicalHelp}
              />

              <ActionCard
                title="Cognitive Score"
                subtitle="Check your progress"
                icon="psychology"
                onPress={onCognitiveScore}
              />

              <ActionCard
                title="My Schedule"
                subtitle="See your reminders"
                icon="calendar-today"
                onPress={onSchedule}
              />

              <ActionCard
                title="Call Family"
                subtitle="Stay connected"
                icon="call"
                onPress={onCallFamily}
              />
            </View>
          </View>

          {/* FEATURES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Explore
            </Text>

            <Text style={styles.sectionSubtitle}>
              Keep your mind active and your memories close
            </Text>

            <View
              style={[
                styles.featureGrid,
                isMobile && styles.featureGridMobile,
              ]}
            >
              <FeatureCard
                title="Games"
                description="Fun activities to keep your mind active."
                icon="sports-esports"
                onPress={onGames || (() => {})}
              />

              <FeatureCard
                title="Memories"
                description="Save and revisit your special moments."
                icon="favorite"
                onPress={onMemory || (() => {})}
              />
            </View>
          </View>

          {/* QUICK ASSIST */}
          <View style={styles.assistCard}>
            <View style={styles.assistIconContainer}>
              <Ionicons
                name="sparkles-outline"
                size={30}
                color={COLORS.green}
              />
            </View>

            <View style={styles.assistTextContainer}>
              <Text style={styles.assistTitle}>
                Need a little help?
              </Text>

              <Text style={styles.assistDescription}>
                SmritiCare can guide you to the right
                feature.
              </Text>
            </View>

            <Pressable
              onPress={() => {
                if (onVoiceAssistant) {
                  onVoiceAssistant();
                } else {
                  setShowQuickAssist(true);
                }
              }}
              style={({ pressed }) => [
                styles.assistButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.assistButtonText}>
                Get Help
              </Text>
            </Pressable>
          </View>

          {/* SAFETY MESSAGE */}
          <View style={styles.safetyCard}>
            <View style={styles.safetyIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={25}
                color={COLORS.peach}
              />
            </View>

            <View style={styles.safetyText}>
              <Text style={styles.safetyTitle}>
                Your wellbeing matters
              </Text>

              <Text style={styles.safetyDescription}>
                SmritiCare is here to make everyday
                activities easier and more comfortable.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* BOTTOM NAVIGATION - KEPT EXACTLY AS REQUESTED */}
        <View style={styles.bottomNav}>
          <NavButton
            label="Home"
            icon="⌂"
            active
            onPress={() => {}}
          />

          <NavButton
            label="Games"
            icon="🎮"
            onPress={onGames || (() => {})}
          />

          <NavButton
            label="Schedule"
            icon="📅"
            onPress={onSchedule}
          />

          <NavButton
            label="Memories"
            icon="💚"
            onPress={onMemory || (() => {})}
          />

          <NavButton
            label="Profile"
            icon="👤"
            onPress={onProfile || (() => {})}
          />
        </View>

        <QuickAssist
          bottomOffset={100}
          onVoiceAssistant={onVoiceAssistant}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* SUBTLE BOTANICAL TEXTURE */

  leftLeafOne: {
    position: 'absolute',
    left: -38,
    top: 105,
    width: 110,
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(63, 111, 69, 0.07)',
    transform: [{ rotate: '-25deg' }],
  },

  leftLeafTwo: {
    position: 'absolute',
    left: -42,
    top: 160,
    width: 95,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(63, 111, 69, 0.05)',
    transform: [{ rotate: '20deg' }],
  },

  rightLeafOne: {
    position: 'absolute',
    right: -38,
    top: 180,
    width: 115,
    height: 50,
    borderRadius: 100,
    backgroundColor: 'rgba(63, 111, 69, 0.07)',
    transform: [{ rotate: '35deg' }],
  },

  rightLeafTwo: {
    position: 'absolute',
    right: -32,
    top: 240,
    width: 90,
    height: 42,
    borderRadius: 100,
    backgroundColor: 'rgba(63, 111, 69, 0.05)',
    transform: [{ rotate: '-20deg' }],
  },

  /* HEADER */

  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoText: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.green,
  },

  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },

  brandSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* CONTENT */

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
  },

  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },

  contentTablet: {
    paddingHorizontal: 24,
  },

  /* WELCOME */

  welcomeSection: {
    marginBottom: 28,
  },

  welcomeTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: COLORS.text,
  },

  welcomeText: {
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.secondaryText,
    marginTop: 5,
  },

  /* SECTIONS */

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondaryText,
    marginTop: 3,
    marginBottom: 15,
  },

  /* QUICK ACTION GRID */

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  actionsGridMobile: {
    flexDirection: 'column',
    gap: 12,
  },

  actionCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  actionCardWide: {
    flexBasis: '100%',
  },

  actionIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: COLORS.text,
  },

  actionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondaryText,
    marginTop: 3,
  },

  /* FEATURE GRID */

  featureGrid: {
    flexDirection: 'row',
    gap: 16,
  },

  featureGridMobile: {
    flexDirection: 'column',
  },

  featureCard: {
    flex: 1,
    minHeight: 190,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.peachBorder,
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  featureIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  featureTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
    color: COLORS.text,
  },

  featureDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondaryText,
    marginTop: 6,
    paddingRight: 20,
  },

  featureArrow: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* QUICK ASSIST */

  assistCard: {
    backgroundColor: '#E4EEDF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDDCC7',
  },

  assistIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  assistTextContainer: {
    flex: 1,
  },

  assistTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  assistDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondaryText,
    marginTop: 3,
  },

  assistButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  assistButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* SAFETY */

  safetyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.peachBorder,
  },

  safetyIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.peachSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  safetyText: {
    flex: 1,
  },

  safetyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  safetyDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondaryText,
    marginTop: 3,
  },

  /* BOTTOM NAVIGATION - STRUCTURE UNCHANGED */

  bottomNav: {
    minHeight: 70,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  navButton: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 5,
  },

  navButtonActive: {
    backgroundColor: COLORS.greenSoft,
  },

  navButtonPressed: {
    opacity: 0.65,
  },

  navIcon: {
    fontSize: 21,
    lineHeight: 25,
    color: COLORS.secondaryText,
  },

  navIconActive: {
    color: COLORS.green,
  },

  navLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.secondaryText,
    fontWeight: '600',
    marginTop: 2,
  },

  navLabelActive: {
    color: COLORS.green,
    fontWeight: '800',
  },

  /* GENERAL */

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  buttonPressed: {
    opacity: 0.8,
  },

  bottomSpacing: {
    height: 20,
  },
});
