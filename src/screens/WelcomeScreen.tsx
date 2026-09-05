import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function WelcomeScreen({
  onGetStarted,
  onSignIn,
}: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ================================
            TOP DECORATIVE AREA
        ================================= */}

        <View style={styles.pattern}>
          <View style={[styles.diagonalLine, { left: -80 }]} />
          <View style={[styles.diagonalLine, { left: -45 }]} />
          <View style={[styles.diagonalLine, { left: -10 }]} />
          <View style={[styles.diagonalLine, { left: 25 }]} />
          <View style={[styles.diagonalLine, { left: 60 }]} />
        </View>


        {/* ================================
            CENTER CONTENT
        ================================= */}

        <View style={styles.content}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
              accessibilityLabel="SmritiCare logo"
            />
          </View>


          {/* App Name */}
          <Text style={styles.title}>
            SmritiCare
          </Text>


          {/* Description */}
          <Text style={styles.subtitle}>
            Your Daily Memory & Cognitive{'\n'}Companion
          </Text>

        </View>


        {/* ================================
            BOTTOM ACTION AREA
        ================================= */}

        <View style={styles.bottomArea}>

          {/* Get Started */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            onPress={onGetStarted}
            style={({ pressed }) => [
              styles.getStartedButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>

            <Ionicons
              name="arrow-forward"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>


          {/* Sign In */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              onPress={onSignIn}
              hitSlop={8}
            >
              <Text style={styles.signInLink}>
                Sign In
              </Text>
            </Pressable>
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  /* ========================================
     SCREEN
  ======================================== */

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,

    width: '100%',

    backgroundColor: colors.background,

    alignItems: 'center',

    justifyContent: 'space-between',

    overflow: 'hidden',
  },


  /* ========================================
     DECORATIVE TOP PATTERN
  ======================================== */

  pattern: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    height: 114,

    backgroundColor: colors.background,

    borderBottomWidth: 3,

    borderBottomColor: '#E3F0E8',

    overflow: 'hidden',
  },

  diagonalLine: {
    position: 'absolute',

    top: -50,

    width: 2,

    height: 180,

    backgroundColor: '#E3F0F8',

    transform: [
      {
        rotate: '-45deg',
      },
    ],
  },


  /* ========================================
     CENTER CONTENT
  ======================================== */

  content: {
    flex: 1,

    width: '100%',

    maxWidth: 448,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 24,

    /*
     * This keeps the content in the
     * same vertical position as Figma.
     */
    paddingTop: 40,

    paddingBottom: 20,
  },


  /* ========================================
     LOGO
  ======================================== */

  logoContainer: {
    width: 128,
    height: 128,

    borderRadius: 64,

    backgroundColor: colors.surfaceContainerHighest,

    borderWidth: 4,

    borderColor: colors.outlineVariant,

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',

    marginBottom: 32,

    elevation: 3,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 3,
  },

  logo: {
    width: '100%',
    height: '100%',
  },


  /* ========================================
     TITLE
  ======================================== */

  title: {
    /*
     * Use a safe fallback until the
     * custom Work Sans font is loaded.
     */
    fontFamily: 'sans-serif',

    fontSize: 20,

    lineHeight: 26,

    fontWeight: '700',

    color: colors.primary,

    textAlign: 'center',

    marginBottom: 12,
  },


  /* ========================================
     SUBTITLE
  ======================================== */

  subtitle: {
    fontFamily: 'sans-serif',

    fontSize: 16,

    lineHeight: 24,

    fontWeight: '400',

    color: colors.onSurfaceVariant,

    textAlign: 'center',

    maxWidth: 250,
  },


  /* ========================================
     BOTTOM
  ======================================== */

  bottomArea: {
    width: '100%',

    maxWidth: 448,

    paddingHorizontal: 12,

    paddingBottom: 32,
  },


  /* ========================================
     GET STARTED BUTTON
  ======================================== */

  getStartedButton: {
    width: '100%',

    height: 54,

    backgroundColor: colors.primary,

    borderRadius: 8,

    borderBottomWidth: 3,

    borderBottomColor: '#002203',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 12,

    elevation: 2,
  },

  buttonPressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  buttonText: {
    fontFamily: 'sans-serif',

    fontSize: 14,

    lineHeight: 20,

    fontWeight: '700',

    color: '#FFFFFF',
  },


  /* ========================================
     SIGN IN
  ======================================== */

  signInRow: {
    marginTop: 26,

    minHeight: 30,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    flexWrap: 'wrap',
  },

  signInText: {
    fontFamily: 'sans-serif',

    fontSize: 12,

    lineHeight: 18,

    color: colors.onSurfaceVariant,
  },

  signInLink: {
    fontFamily: 'sans-serif',

    fontSize: 12,

    lineHeight: 18,

    fontWeight: '700',

    color: colors.primary,

    textDecorationLine: 'underline',
  },
});