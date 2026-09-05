import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type MedicalHelpScreenProps = {
  onBack?: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  surface: '#F4FAFF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#E9F6FD',
  surfaceContainer: '#E3F0F8',
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
  onTertiaryContainer: '#FFB2AA',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',
  outline: '#717A6D',
  outlineVariant: '#C0C9BB',
};

export default function MedicalHelpScreen({
  onBack,
}: MedicalHelpScreenProps) {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Health');

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    Alert.alert(
      'SmritiCare Assistant',
      `You said:\n\n${message}`,
    );

    setMessage('');
  };

  const handleCallHospital = () => {
    Alert.alert(
      'Call Hospital',
      'Calling City General Hospital...',
    );
  };

  const handleNearbyCenters = () => {
    Alert.alert(
      'Nearby Care Centers',
      'Nearby care centers will be shown here.',
    );
  };

  const handleSOS = () => {
    Alert.alert(
      'SOS Emergency',
      'Are you sure you want to contact emergency services?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => {
            console.log('Emergency call requested');
          },
        },
      ],
    );
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log('Selected tab:', tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {/* =====================================================
            TOP APP BAR
        ====================================================== */}

        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={30}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Medical Help
          </Text>
        </View>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ===================================================
              ASSISTANT GREETING
          ==================================================== */}

          <View style={styles.assistantCard}>

            <View style={styles.mekhelaBorder} />

            <View style={styles.assistantIcon}>
              <MaterialIcons
                name="smart-toy"
                size={28}
                color={COLORS.onPrimaryContainer}
              />
            </View>

            <View style={styles.assistantText}>
              <Text style={styles.assistantTitle}>
                SmritiCare Assistant
              </Text>

              <Text style={styles.assistantMessage}>
                Hello! How are you feeling today? I'm here
                to help with any health concerns.
              </Text>
            </View>

          </View>

          {/* Emergency warning */}

          <Text style={styles.emergencyWarning}>
            For emergencies, please contact your caregiver
            or emergency services.
          </Text>

          {/* ===================================================
              QUICK ACTIONS
          ==================================================== */}

          <View style={styles.quickActionsSection}>

            <Text style={styles.quickActionsTitle}>
              Quick Actions:
            </Text>

            <View style={styles.chipsContainer}>

              {/* Headache */}

              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() =>
                  handleQuickAction('I have a headache')
                }
              >
                <MaterialIcons
                  name="sick"
                  size={24}
                  color={COLORS.primary}
                />

                <Text style={styles.chipText}>
                  I have a headache
                </Text>
              </Pressable>

              {/* Dizziness */}

              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() =>
                  handleQuickAction('Feeling dizzy')
                }
              >
                <MaterialIcons
                  name="screen-rotation"
                  size={24}
                  color={COLORS.primary}
                />

                <Text style={styles.chipText}>
                  Feeling dizzy
                </Text>
              </Pressable>

              {/* Medication */}

              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() =>
                  handleQuickAction('Medication reminder')
                }
              >
                <MaterialIcons
                  name="medication"
                  size={24}
                  color={COLORS.primary}
                />

                <Text style={styles.chipText}>
                  Medication reminder
                </Text>
              </Pressable>

            </View>
          </View>

          {/* ===================================================
              HOSPITAL CARD
          ==================================================== */}

          <View style={styles.hospitalCard}>

            <View style={styles.gamochaBorder}>
              <View style={styles.gamochaRed} />
              <View style={styles.gamochaRedTransparent} />
            </View>

            <View style={styles.hospitalHeader}>

              <View style={styles.hospitalIcon}>
                <MaterialIcons
                  name="local-hospital"
                  size={32}
                  color={COLORS.onTertiaryContainer}
                />
              </View>

              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalTitle}>
                  City General Hospital
                </Text>

                <View style={styles.locationRow}>
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={COLORS.onSurfaceVariant}
                  />

                  <Text style={styles.locationText}>
                    1.2 km away
                  </Text>
                </View>
              </View>

            </View>

            <Pressable
              style={({ pressed }) => [
                styles.callHospitalButton,
                pressed && styles.callButtonPressed,
              ]}
              onPress={handleCallHospital}
            >
              <MaterialIcons
                name="call"
                size={26}
                color={COLORS.onPrimary}
              />

              <Text style={styles.callHospitalText}>
                Call Hospital
              </Text>
            </Pressable>

          </View>

          {/* ===================================================
              SECONDARY ACTIONS
          ==================================================== */}

          <View style={styles.secondaryGrid}>

            {/* Nearby Care Centers */}

            <Pressable
              style={({ pressed }) => [
                styles.secondaryCard,
                pressed && styles.secondaryPressed,
              ]}
              onPress={handleNearbyCenters}
            >
              <MaterialIcons
                name="map"
                size={40}
                color={COLORS.primary}
              />

              <Text style={styles.secondaryCardText}>
                Nearby Care Centers
              </Text>
            </Pressable>

            {/* SOS */}

            <Pressable
              style={({ pressed }) => [
                styles.secondaryCard,
                styles.sosCard,
                pressed && styles.sosPressed,
              ]}
              onPress={handleSOS}
            >
              <MaterialIcons
                name="sos"
                size={40}
                color={COLORS.error}
              />

              <Text style={styles.sosText}>
                SOS Emergency
              </Text>
            </Pressable>

          </View>

          <View style={styles.bottomContentSpace} />

        </ScrollView>

        {/* =====================================================
            CHAT INPUT
        ====================================================== */}

        <View style={styles.chatArea}>

          <View style={styles.chatRow}>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your health concern here..."
              placeholderTextColor={COLORS.onSurfaceVariant}
              style={styles.chatInput}
              multiline
              maxLength={500}
              accessibilityLabel="Health concern"
            />

            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendPressed,
              ]}
              onPress={handleSend}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <MaterialIcons
                name="send"
                size={30}
                color={COLORS.onPrimary}
              />
            </Pressable>

          </View>

        </View>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <View style={styles.bottomNav}>

          {/* Home */}

          <Pressable
            style={styles.navItem}
            onPress={() => handleTabPress('Home')}
          >
            <MaterialIcons
              name="home"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          {/* Chat */}

          <Pressable
            style={styles.navItem}
            onPress={() => handleTabPress('Chat')}
          >
            <MaterialIcons
              name="chat-bubble"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Chat
            </Text>
          </Pressable>

          {/* Health */}

          <Pressable
            style={[
              styles.navItem,
              styles.activeNavItem,
            ]}
            onPress={() => handleTabPress('Health')}
          >
            <MaterialIcons
              name="medical-services"
              size={28}
              color={COLORS.onPrimaryContainer}
            />

            <Text
              style={[
                styles.navText,
                styles.activeNavText,
              ]}
            >
              Health
            </Text>
          </Pressable>

          {/* Profile */}

          <Pressable
            style={styles.navItem}
            onPress={() => handleTabPress('Profile')}
          >
            <MaterialIcons
              name="person"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>

        </View>

      </KeyboardAvoidingView>
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
    paddingTop: 24,
    paddingBottom: 180,
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    height: 72,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.outlineVariant,
    zIndex: 10,
  },

  backButton: {
    width: 48,
    height: 48,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // =========================================================
  // ASSISTANT
  // =========================================================

  assistantCard: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  mekhelaBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },

  assistantIcon: {
    width: 48,
    height: 48,
    marginTop: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
  },

  assistantText: {
    flex: 1,
  },

  assistantTitle: {
    marginBottom: 8,
    fontFamily: 'sans-serif',
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  assistantMessage: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurface,
  },

  emergencyWarning: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.error,
  },

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  quickActionsSection: {
    marginTop: 4,
  },

  quickActionsTitle: {
    marginBottom: 12,
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  chip: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 28,
  },

  chipPressed: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.98 }],
  },

  chipText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // =========================================================
  // HOSPITAL
  // =========================================================

  hospitalCard: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 20,
    width: '100%',
    padding: 24,
    gap: 16,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  gamochaBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },

  gamochaRed: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },

  gamochaRedTransparent: {
    flex: 1,
    backgroundColor: COLORS.surfaceLowest,
  },

  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  hospitalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.tertiaryContainer,
  },

  hospitalInfo: {
    flex: 1,
  },

  hospitalTitle: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  locationRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  locationText: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  callHospitalButton: {
    width: '100%',
    minHeight: 60,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 4,
    borderBottomColor: '#0C5216',
  },

  callButtonPressed: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.98 }],
  },

  callHospitalText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },

  // =========================================================
  // SECONDARY GRID
  // =========================================================

  secondaryGrid: {
    width: '100%',
    marginTop: 16,
    flexDirection: 'row',
    gap: 20,
  },

  secondaryCard: {
    flex: 1,
    height: 120,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },

  secondaryPressed: {
    backgroundColor: COLORS.surfaceContainer,
  },

  secondaryCardText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.onSurface,
  },

  sosCard: {
    backgroundColor: COLORS.errorContainer,
    borderColor: COLORS.error,
  },

  sosPressed: {
    backgroundColor: COLORS.errorContainer,
    transform: [{ scale: 0.98 }],
  },

  sosText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.onErrorContainer,
  },

  bottomContentSpace: {
    height: 20,
  },

  // =========================================================
  // CHAT INPUT
  // =========================================================

  chatArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 88,
    zIndex: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
  },

  chatRow: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },

  chatInput: {
    flex: 1,
    minHeight: 60,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLowest,
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurface,
  },

  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  sendPressed: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.95 }],
  },

  // =========================================================
  // BOTTOM NAVIGATION
  // =========================================================

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: 88,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surfaceLowest,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
  },

  navItem: {
    minWidth: 60,
    minHeight: 48,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavItem: {
    minWidth: 72,
    backgroundColor: COLORS.primaryContainer,
  },

  navText: {
    marginTop: 4,
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  activeNavText: {
    color: COLORS.onPrimaryContainer,
  },

  // =========================================================
  // PRESSED
  // =========================================================

  pressed: {
    opacity: 0.7,
    transform: [{ translateY: 2 }],
  },
});