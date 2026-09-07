import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  background: '#FCF9F8',
  surface: '#FCF9F8',
  surfaceLowest: '#FFFFFF',

  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#90D689',

  secondary: '#556158',
  secondaryContainer: '#D9E6DA',
  secondaryFixedDim: '#BDCABE',

  tertiary: '#721900',
  tertiaryFixed: '#FFDBD1',
  onTertiaryFixed: '#3B0800',

  surfaceContainerLow: '#F6F3F2',
  surfaceContainerHigh: '#EAE7E7',
  surfaceVariant: '#E5E2E1',

  outlineVariant: '#C0C9BB',

  onSurface: '#1B1C1C',
  onSurfaceVariant: '#41493E',
};

type VoiceAssistantScreenProps = {
  onBack: () => void;
  onProfile: () => void;
  onMedicine?: () => void;
  onFamily?: () => void;
  onGame?: () => void;
  onSchedule?: () => void;
};

export default function VoiceAssistantScreen({
  onBack,
  onProfile,
  onMedicine,
  onFamily,
  onGame,
  onSchedule,
}: VoiceAssistantScreenProps) {
  const [isListening, setIsListening] = useState(false);

  const [message, setMessage] = useState(
    'How can I help you today?',
  );

  // ---------------------------------------------------------
  // PULSE ANIMATION
  // ---------------------------------------------------------

  const pulse1 = useRef(new Animated.Value(0.8)).current;
  const pulse2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, {
          toValue: 1.8,
          duration: 3000,
          useNativeDriver: true,
        }),

        Animated.timing(pulse1, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const animation2 = Animated.loop(
      Animated.sequence([
        Animated.delay(1500),

        Animated.timing(pulse2, {
          toValue: 1.8,
          duration: 3000,
          useNativeDriver: true,
        }),

        Animated.timing(pulse2, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation1.start();
    animation2.start();

    return () => {
      animation1.stop();
      animation2.stop();
    };
  }, [pulse1, pulse2]);

  // ---------------------------------------------------------
  // MICROPHONE
  // ---------------------------------------------------------

  const startListening = () => {
    setIsListening(true);
    setMessage('Listening... speak now');
  };

  const stopListening = () => {
    setIsListening(false);
    setMessage('I heard you. How can I help?');
  };

  // ---------------------------------------------------------
  // SUGGESTION ACTIONS
  // ---------------------------------------------------------

  const handleMedicine = () => {
    setMessage('Opening medicine reminder...');
    onMedicine?.();
  };

  const handleFamily = () => {
    setMessage('Opening family call...');
    onFamily?.();
  };

  const handleGame = () => {
    setMessage('Opening memory games...');
    onGame?.();
  };

  const handleSchedule = () => {
    setMessage('Opening your schedule...');
    onSchedule?.();
  };

  // ---------------------------------------------------------
  // SCREEN
  // ---------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>

        {/* BACK BUTTON */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <MaterialIcons
            name="arrow-back"
            size={28}
            color={COLORS.primary}
          />
        </Pressable>

        {/* TITLE */}

        <Text
          style={styles.headerTitle}
          pointerEvents="none"
        >
          SmritiCare
        </Text>

        {/* PROFILE BUTTON */}

        <Pressable
          onPress={onProfile}
          style={({ pressed }) => [
            styles.profilePlaceholder,
            pressed && styles.headerButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={10}
        >
          <MaterialIcons
            name="person"
            size={24}
            color={COLORS.onSurfaceVariant}
          />
        </Pressable>

      </View>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ===================================================
            STATUS
        =================================================== */}

        <View style={styles.statusArea}>

          <Text style={styles.statusTitle}>
            {isListening
              ? "I'm listening..."
              : 'Voice Assistant'}
          </Text>

          <Text style={styles.statusSubtitle}>
            {message}
          </Text>

        </View>

        {/* ===================================================
            MICROPHONE
        =================================================== */}

        <View style={styles.microphoneArea}>

          {/* OUTER PULSE */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                transform: [
                  {
                    scale: pulse1,
                  },
                ],

                opacity: isListening
                  ? 0.5
                  : 0.2,
              },
            ]}
          />

          {/* INNER PULSE */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRingSecond,
              {
                transform: [
                  {
                    scale: pulse2,
                  },
                ],

                opacity: isListening
                  ? 0.4
                  : 0.15,
              },
            ]}
          />

          {/* MICROPHONE BUTTON */}

          <Pressable
            onPressIn={startListening}
            onPressOut={stopListening}
            style={({ pressed }) => [
              styles.microphoneButton,

              isListening &&
                styles.microphoneListening,

              pressed &&
                styles.microphonePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hold to speak"
          >
            <MaterialIcons
              name={
                isListening
                  ? 'mic'
                  : 'mic-none'
              }
              size={64}
              color={COLORS.onPrimary}
            />
          </Pressable>

        </View>

        {/* HOLD MESSAGE */}

        <Text style={styles.holdText}>
          {isListening
            ? 'Release to stop'
            : 'Press and hold to speak'}
        </Text>

        {/* ===================================================
            SUGGESTIONS
        =================================================== */}

        <View style={styles.suggestionsSection}>

          <Text style={styles.tryText}>
            Try saying things like:
          </Text>

          {/* =================================================
              MEDICINE
          ================================================= */}

          <Pressable
            onPress={handleMedicine}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Remind me to take my medicine"
          >

            <View style={styles.commandIconGreen}>

              <MaterialIcons
                name="medication"
                size={28}
                color={COLORS.onPrimaryContainer}
              />

            </View>

            <Text style={styles.commandText}>
              "Remind me to take my medicine"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />

          </Pressable>

          {/* =================================================
              FAMILY
          ================================================= */}

          <Pressable
            onPress={handleFamily}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Call my family"
          >

            <View style={styles.commandIconSecondary}>

              <MaterialIcons
                name="call"
                size={28}
                color={COLORS.secondary}
              />

            </View>

            <Text style={styles.commandText}>
              "Call my family"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />

          </Pressable>

          {/* =================================================
              MEMORY GAME
          ================================================= */}

          <Pressable
            onPress={handleGame}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Start a memory game"
          >

            <View style={styles.commandIconTertiary}>

              <MaterialIcons
                name="extension"
                size={28}
                color={COLORS.onTertiaryFixed}
              />

            </View>

            <Text style={styles.commandText}>
              "Start a memory game"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />

          </Pressable>

          {/* =================================================
              SCHEDULE
          ================================================= */}

          <Pressable
            onPress={handleSchedule}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Show my schedule"
          >

            <View style={styles.commandIconPrimaryFixed}>

              <MaterialIcons
                name="calendar-month"
                size={28}
                color={COLORS.primary}
              />

            </View>

            <Text style={styles.commandText}>
              "Show my schedule"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />

          </Pressable>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =======================================================
     SCREEN
  ======================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: 64,
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    backgroundColor: COLORS.surface,

    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,

    position: 'relative',
  },

  headerButton: {
    width: 56,
    height: 56,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 28,

    zIndex: 10,
    elevation: 10,
  },

  headerButtonPressed: {
    backgroundColor:
      COLORS.surfaceContainerHigh,
  },

  headerTitle: {
    flex: 1,

    textAlign: 'center',

    fontSize: 28,
    lineHeight: 34,

    fontWeight: '700',

    color: COLORS.primary,

    marginHorizontal: 8,
  },

  profilePlaceholder: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      COLORS.surfaceContainerHigh,

    borderWidth: 2,
    borderColor: COLORS.outlineVariant,

    zIndex: 10,
    elevation: 10,
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  content: {
    flexGrow: 1,

    width: '100%',
    maxWidth: 1024,

    alignSelf: 'center',

    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,

    alignItems: 'center',
  },

  /* =======================================================
     STATUS
  ======================================================= */

  statusArea: {
    width: '100%',
    maxWidth: 500,

    alignItems: 'center',

    marginBottom: 30,
  },

  statusTitle: {
    textAlign: 'center',

    fontSize: 36,
    lineHeight: 44,

    fontWeight: '700',

    color: COLORS.primary,
  },

  statusSubtitle: {
    marginTop: 12,

    textAlign: 'center',

    fontSize: 22,
    lineHeight: 30,

    color: COLORS.onSurfaceVariant,
  },

  /* =======================================================
     MICROPHONE
  ======================================================= */

  microphoneArea: {
    width: 288,
    height: 288,

    alignItems: 'center',
    justifyContent: 'center',

    marginVertical: 10,
  },

  pulseRing: {
    position: 'absolute',

    width: 230,
    height: 230,

    borderRadius: 115,

    backgroundColor:
      COLORS.primaryContainer,
  },

  pulseRingSecond: {
    position: 'absolute',

    width: 210,
    height: 210,

    borderRadius: 105,

    backgroundColor:
      COLORS.primaryContainer,
  },

  microphoneButton: {
    width: 160,
    height: 160,

    borderRadius: 80,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primary,

    borderWidth: 4,
    borderColor: COLORS.surfaceLowest,

    elevation: 8,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.15,

    shadowRadius: 12,

    zIndex: 10,
  },

  microphoneListening: {
    backgroundColor:
      COLORS.primaryContainer,

    transform: [
      {
        scale: 1.05,
      },
    ],
  },

  microphonePressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  holdText: {
    marginTop: -10,
    marginBottom: 20,

    fontSize: 18,

    fontWeight: '600',

    color: COLORS.onSurfaceVariant,
  },

  /* =======================================================
     SUGGESTIONS
  ======================================================= */

  suggestionsSection: {
    width: '100%',
    maxWidth: 700,

    alignItems: 'center',

    marginTop: 20,

    gap: 16,
  },

  tryText: {
    marginBottom: 4,

    paddingHorizontal: 16,
    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,

    fontSize: 18,
    lineHeight: 24,

    fontWeight: '600',

    color: COLORS.onSurfaceVariant,
  },

  /* =======================================================
     COMMAND CARD
  ======================================================= */

  commandCard: {
    width: '100%',

    minHeight: 82,

    flexDirection: 'row',
    alignItems: 'center',

    padding: 16,

    borderRadius: 12,

    borderWidth: 2,

    borderColor:
      COLORS.secondaryFixedDim,

    backgroundColor:
      COLORS.surfaceLowest,

    elevation: 2,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,

    shadowRadius: 8,

    zIndex: 5,
  },

  commandPressed: {
    backgroundColor:
      COLORS.surfaceContainerLow,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  /* =======================================================
     MEDICINE ICON
  ======================================================= */

  commandIconGreen: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,

    backgroundColor:
      COLORS.primaryContainer,
  },

  /* =======================================================
     FAMILY ICON
  ======================================================= */

  commandIconSecondary: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,

    backgroundColor:
      COLORS.secondaryContainer,
  },

  /* =======================================================
     GAME ICON
  ======================================================= */

  commandIconTertiary: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,

    backgroundColor:
      COLORS.tertiaryFixed,
  },

  /* =======================================================
     SCHEDULE ICON
  ======================================================= */

  commandIconPrimaryFixed: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,

    backgroundColor: '#91D78A',
  },

  /* =======================================================
     COMMAND TEXT
  ======================================================= */

  commandText: {
    flex: 1,

    fontSize: 20,
    lineHeight: 28,

    color: COLORS.onSurface,
  },

});