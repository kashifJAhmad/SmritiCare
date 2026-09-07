import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  primary: '#B0005A',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#111D23',
  textSecondary: '#41493E',
  green: '#2E8B57',
  orange: '#F28C28',
  pink: '#F05A7E',
  lightSurface: '#F6F3F2',
};

type QuickAssistProps = {
  bottomOffset?: number;
  onVoiceAssistant?: () => void;
};
export default function QuickAssist({
  bottomOffset = 85,
  onVoiceAssistant,
}: QuickAssistProps) {
  const [open, setOpen] = useState(false);

  const handleVoiceAssistant = () => {
    setOpen(false);

    if (onVoiceAssistant) {
      onVoiceAssistant();
    } else {
      Alert.alert(
        'Voice Assistance',
        'Voice assistant will open here.',
      );
    }
  };

  const handleQuestion = () => {
    Alert.alert(
      'Ask a Question',
      'Voice questions will be available here.',
    );
  };

  const handleTodayPlan = () => {
    Alert.alert(
      "Today's Plan",
      'Your daily schedule will be read aloud here.',
    );
  };

  return (
    <>
      {/* Dark overlay when menu is open */}
      {open && (
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
        />
      )}

      {/* Voice Assistance floating menu */}
      {open && (
        <View
          style={[
            styles.assistPanel,
            {
              bottom: bottomOffset + 72,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.panelHeader}>
            <View style={styles.headerContent}>
              <MaterialIcons
                name="graphic-eq"
                size={28}
                color={COLORS.white}
              />

              <Text style={styles.panelTitle}>
                Voice Assistance
              </Text>
            </View>

            <Pressable
              onPress={() => setOpen(false)}
              style={styles.closeButton}
            >
              <MaterialIcons
                name="close"
                size={28}
                color={COLORS.white}
              />
            </Pressable>
          </View>

          {/* Options */}
          <View style={styles.options}>

            {/* Start Voice Assistant */}
            <Pressable
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
              onPress={handleVoiceAssistant}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: COLORS.pink },
                ]}
              >
                <MaterialIcons
                  name="mic"
                  size={30}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  Start Voice Assistant
                </Text>

                <Text style={styles.optionSubtitle}>
                  Tap and speak
                </Text>
              </View>
            </Pressable>

            {/* Ask a Question */}
            <Pressable
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
              onPress={handleQuestion}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: COLORS.orange },
                ]}
              >
                <MaterialIcons
                  name="chat"
                  size={30}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  Ask a Question
                </Text>

                <Text style={styles.optionSubtitle}>
                  Get instant help
                </Text>
              </View>
            </Pressable>

            {/* Hear Today's Plan */}
            <Pressable
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
              onPress={handleTodayPlan}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: COLORS.green },
                ]}
              >
                <MaterialIcons
                  name="volume-up"
                  size={30}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  Hear Today's Plan
                </Text>

                <Text style={styles.optionSubtitle}>
                  Listen to your schedule
                </Text>
              </View>
            </Pressable>

          </View>
        </View>
      )}

      {/* Floating button */}
      <Pressable
        onPress={() => setOpen((previous) => !previous)}
        style={[
          styles.floatingButton,
          {
            bottom: bottomOffset,
          },
        ]}
      >
        <MaterialIcons
          name={open ? 'close' : 'apps'}
          size={30}
          color={COLORS.white}
        />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor: 'rgba(0, 0, 0, 0.20)',

    zIndex: 20,
  },

  floatingButton: {
    position: 'absolute',

    right: 20,

    width: 60,
    height: 60,

    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primary,

    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    zIndex: 30,
  },

  assistPanel: {
    position: 'absolute',

    right: 20,

    width: 350,
    maxWidth: '88%',

    borderRadius: 20,

    backgroundColor: COLORS.surface,

    overflow: 'hidden',

    elevation: 15,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.30,
    shadowRadius: 14,

    zIndex: 30,
  },

  panelHeader: {
    minHeight: 70,

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: COLORS.primary,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: '700',

    color: COLORS.white,
  },

  closeButton: {
    width: 44,
    height: 44,

    alignItems: 'center',
    justifyContent: 'center',
  },

  options: {
    padding: 12,

    gap: 10,

    backgroundColor: COLORS.surface,
  },

  option: {
    minHeight: 82,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 16,

    backgroundColor: COLORS.lightSurface,
  },

  optionPressed: {
    transform: [{ scale: 0.98 }],
  },

  optionIcon: {
    width: 52,
    height: 52,

    borderRadius: 26,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 18,
    lineHeight: 24,

    fontWeight: '700',

    color: COLORS.text,
  },

  optionSubtitle: {
    marginTop: 3,

    fontSize: 15,
    lineHeight: 20,

    color: COLORS.textSecondary,
  },
});