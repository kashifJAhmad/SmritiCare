import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type WelcomeScreenProps = {
  onPatient: () => void;
  onFamilyMember: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  navy: '#102A56',
  text: '#31445A',
  teal: '#197D87',
  green: '#4FA56A',
  patientBg: '#F0FBF6',
  patientBorder: '#D9F0E4',
  familyBg: '#FFF8EF',
  familyBorder: '#F8E8D2',
  peach: '#D9784B',
  white: '#FFFFFF',
};

export default function WelcomeScreen({
  onPatient,
  onFamilyMember,
}: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative leaves */}
        <View style={styles.leftLeafOne} />
        <View style={styles.leftLeafTwo} />
        <View style={styles.rightLeafOne} />
        <View style={styles.rightLeafTwo} />

        {/* Logo */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Brand */}
        <Text style={styles.brandName}>
          Smriti<Text style={styles.brandGreen}>Care</Text>
        </Text>

        <Text style={styles.tagline}>Brighter Minds</Text>
        <Text style={styles.tagline}>Warmer Tomorrows</Text>

        {/* Welcome heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Welcome to SmritiCare</Text>
          <Text style={styles.subtitle}>
            Support today for a brighter tomorrow
          </Text>
        </View>

        {/* Patient */}
        <Pressable
          onPress={onPatient}
          style={({ pressed }) => [
            styles.optionCard,
            styles.patientCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCirclePatient}>
            <MaterialIcons
              name="elderly"
              size={64}
              color={COLORS.green}
            />
          </View>

          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>I’m a Patient</Text>

            <Text style={styles.optionDescription}>
              Take care of your cognitive health and daily well-being
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={38}
            color={COLORS.green}
          />
        </Pressable>

        {/* Family Member */}
        <Pressable
          onPress={onFamilyMember}
          style={({ pressed }) => [
            styles.optionCard,
            styles.familyCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircleFamily}>
            <MaterialIcons
              name="people"
              size={62}
              color={COLORS.peach}
            />
          </View>

          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>
              I’m a Family Member
            </Text>

            <Text style={styles.optionDescription}>
              Support and stay connected with your loved one
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={38}
            color={COLORS.peach}
          />
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialIcons
            name="favorite"
            size={34}
            color="#E96B7A"
          />

          <Text style={styles.footerText}>
            Together for a healthier,{'\n'}
            happier tomorrow
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 45,
  },

  /* ---------------- LOGO ---------------- */

  logoCircle: {
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,

    overflow: 'hidden',
  },

  logo: {
    width: 205,
    height: 205,
  },

  brandName: {
    marginTop: 14,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    color: '#176B88',
    letterSpacing: -1.2,
  },

  brandGreen: {
    color: '#4FA56A',
  },

  tagline: {
    fontSize: 18,
    lineHeight: 24,
    color: '#647586',
    fontWeight: '500',
    textAlign: 'center',
  },

  /* ---------------- HEADING ---------------- */

  headingContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 34,
    marginBottom: 24,
  },

  heading: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 26,
    color: '#607284',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  /* ---------------- CARDS ---------------- */

  optionCard: {
    width: '100%',
    minHeight: 170,

    borderRadius: 24,
    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 22,
    paddingHorizontal: 18,

    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  patientCard: {
    backgroundColor: COLORS.patientBg,
    borderColor: COLORS.patientBorder,
  },

  familyCard: {
    backgroundColor: COLORS.familyBg,
    borderColor: COLORS.familyBorder,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  iconCirclePatient: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#DDF4E8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  iconCircleFamily: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FCEBD8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  optionTextContainer: {
    flex: 1,
    paddingRight: 5,
  },

  optionTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    color: COLORS.navy,
  },

  optionDescription: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.text,
  },

  /* ---------------- FOOTER ---------------- */

  footer: {
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 12,
  },

  footerText: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 25,
    color: '#687887',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  /* ---------------- DECORATION ---------------- */

  leftLeafOne: {
    position: 'absolute',
    left: -28,
    top: 90,
    width: 100,
    height: 45,
    borderRadius: 100,
    backgroundColor: 'rgba(92, 190, 164, 0.10)',
    transform: [{ rotate: '-25deg' }],
  },

  leftLeafTwo: {
    position: 'absolute',
    left: -35,
    top: 145,
    width: 90,
    height: 38,
    borderRadius: 100,
    backgroundColor: 'rgba(92, 190, 164, 0.08)',
    transform: [{ rotate: '20deg' }],
  },

  rightLeafOne: {
    position: 'absolute',
    right: -32,
    top: 150,
    width: 105,
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(92, 190, 164, 0.10)',
    transform: [{ rotate: '35deg' }],
  },

  rightLeafTwo: {
    position: 'absolute',
    right: -28,
    top: 215,
    width: 85,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(92, 190, 164, 0.08)',
    transform: [{ rotate: '-20deg' }],
  },
});