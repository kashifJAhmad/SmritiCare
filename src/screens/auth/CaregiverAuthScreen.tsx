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

type CaregiverAuthScreenProps = {
  onBack: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
};

const COLORS = {
  background: '#F4FAFF',

  primary: '#A85A24',
  navy: '#102A56',

  text: '#526477',

  peach: '#D9784B',
  lightPeach: '#FFF8EF',
  border: '#F1DDC8',

  iconBackground: '#FCEBD8',

  white: '#FFFFFF',
};

export default function CaregiverAuthScreen({
  onBack,
  onSignIn,
  onSignUp,
}: CaregiverAuthScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedSmall,
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            SmritiCare
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* ====================================================
            LOGO
        ==================================================== */}

        <View style={styles.logoCircle}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <Text style={styles.title}>
          Caregiver Account
        </Text>

        <Text style={styles.subtitle}>
          Welcome. Choose how you would like to continue
          supporting your loved one.
        </Text>

        {/* ====================================================
            SIGN IN
        ==================================================== */}

        <Pressable
          onPress={onSignIn}
          accessibilityRole="button"
          accessibilityLabel="Caregiver Sign In"
          style={({ pressed }) => [
            styles.authCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons
              name="login"
              size={34}
              color={COLORS.peach}
            />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>
              Sign In
            </Text>

            <Text style={styles.cardDescription}>
              Already have a SmritiCare caregiver account?
              Sign in to continue supporting your loved one.
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={36}
            color={COLORS.peach}
          />
        </Pressable>

        {/* ====================================================
            SIGN UP
        ==================================================== */}

        <Pressable
          onPress={onSignUp}
          accessibilityRole="button"
          accessibilityLabel="Create Caregiver Account"
          style={({ pressed }) => [
            styles.authCard,
            styles.signUpCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons
              name="person-add"
              size={34}
              color={COLORS.peach}
            />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>
              Sign Up
            </Text>

            <Text style={styles.cardDescription}>
              Create your caregiver account and stay
              connected with your loved one's care.
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={36}
            color={COLORS.peach}
          />
        </Pressable>

        {/* ====================================================
            CAREGIVER INFORMATION
        ==================================================== */}

        <View style={styles.infoBox}>
          <View style={styles.infoIconCircle}>
            <MaterialIcons
              name="people"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Caregiver Support
            </Text>

            <Text style={styles.infoText}>
              Your caregiver account helps you stay connected
              with your loved one's reminders, memories,
              activities, and daily well-being.
            </Text>
          </View>
        </View>

        {/* ====================================================
            PRIVACY INFORMATION
        ==================================================== */}

        <View style={styles.securityRow}>
          <MaterialIcons
            name="security"
            size={21}
            color={COLORS.primary}
          />

          <Text style={styles.securityText}>
            Your account information is kept secure and
            connected only to the care you are authorized
            to support.
          </Text>
        </View>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <Text style={styles.footer}>
          Brighter Minds • Warmer Tomorrows
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ====================================================
     MAIN
  ==================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,

    alignItems: 'center',

    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* ====================================================
     HEADER
  ==================================================== */

  header: {
    width: '100%',
    height: 64,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  pressedSmall: {
    backgroundColor: '#FFF0E3',
  },

  headerTitle: {
    fontSize: 21,

    fontWeight: '800',

    color: COLORS.primary,
  },

  headerSpacer: {
    width: 48,
  },

  /* ====================================================
     LOGO
  ==================================================== */

  logoCircle: {
    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 18,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.06,
    shadowRadius: 14,

    elevation: 4,

    overflow: 'hidden',
  },

  logo: {
    width: 130,
    height: 130,
  },

  /* ====================================================
     TITLE
  ==================================================== */

  title: {
    marginTop: 25,

    fontSize: 30,
    lineHeight: 38,

    fontWeight: '800',

    color: COLORS.navy,

    textAlign: 'center',
  },

  subtitle: {
    marginTop: 9,
    marginBottom: 30,

    maxWidth: 450,

    fontSize: 17,
    lineHeight: 25,

    color: COLORS.text,

    textAlign: 'center',
  },

  /* ====================================================
     AUTH CARDS
  ==================================================== */

  authCard: {
    width: '100%',

    minHeight: 145,

    borderRadius: 24,

    borderWidth: 1,

    borderColor: COLORS.border,

    backgroundColor: COLORS.white,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 20,
    paddingVertical: 20,

    marginBottom: 18,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.05,

    shadowRadius: 10,

    elevation: 2,
  },

  signUpCard: {
    backgroundColor: COLORS.lightPeach,

    borderColor: COLORS.border,
  },

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  /* ====================================================
     ICON
  ==================================================== */

  iconCircle: {
    width: 68,
    height: 68,

    borderRadius: 34,

    backgroundColor: COLORS.iconBackground,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 17,
  },

  /* ====================================================
     CARD TEXT
  ==================================================== */

  cardText: {
    flex: 1,

    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 23,
    lineHeight: 30,

    fontWeight: '800',

    color: COLORS.navy,
  },

  cardDescription: {
    marginTop: 7,

    fontSize: 15.5,
    lineHeight: 22,

    color: COLORS.text,
  },

  /* ====================================================
     CAREGIVER INFO
  ==================================================== */

  infoBox: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'flex-start',

    backgroundColor: '#FFF5EA',

    borderRadius: 18,

    padding: 17,

    marginTop: 8,

    borderWidth: 1,
    borderColor: '#F5E3CF',
  },

  infoIconCircle: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#FCEBD8',

    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,

    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 16,

    lineHeight: 22,

    fontWeight: '800',

    color: COLORS.navy,

    marginBottom: 4,
  },

  infoText: {
    fontSize: 14.5,

    lineHeight: 21,

    color: COLORS.text,
  },

  /* ====================================================
     SECURITY
  ==================================================== */

  securityRow: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'flex-start',

    marginTop: 16,

    paddingHorizontal: 5,
  },

  securityText: {
    flex: 1,

    marginLeft: 9,

    fontSize: 13.5,

    lineHeight: 20,

    color: '#687887',
  },

  /* ====================================================
     FOOTER
  ==================================================== */

  footer: {
    marginTop: 30,

    fontSize: 14,

    color: '#718090',

    textAlign: 'center',
  },
});