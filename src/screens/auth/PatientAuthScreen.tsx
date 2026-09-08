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

type PatientAuthScreenProps = {
  onBack: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  primary: '#00450D',
  navy: '#102A56',
  text: '#526477',
  green: '#4FA56A',
  lightGreen: '#EAF8F0',
  border: '#D5EDE0',
  white: '#FFFFFF',
};

export default function PatientAuthScreen({
  onBack,
  onSignIn,
  onSignUp,
}: PatientAuthScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={styles.backButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>SmritiCare</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Logo */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Patient Account</Text>

        <Text style={styles.subtitle}>
          Welcome back. Choose how you would like to continue.
        </Text>

        {/* Sign In */}
        <Pressable
          onPress={onSignIn}
          style={({ pressed }) => [
            styles.authCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons
              name="login"
              size={34}
              color={COLORS.green}
            />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Sign In</Text>

            <Text style={styles.cardDescription}>
              Already have a SmritiCare patient account? Sign in
              to continue.
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={36}
            color={COLORS.green}
          />
        </Pressable>

        {/* Sign Up */}
        <Pressable
          onPress={onSignUp}
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
              color={COLORS.green}
            />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Sign Up</Text>

            <Text style={styles.cardDescription}>
              Create your patient account and start using
              SmritiCare.
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={36}
            color={COLORS.green}
          />
        </Pressable>

        {/* Information */}
        <View style={styles.infoBox}>
          <MaterialIcons
            name="security"
            size={24}
            color={COLORS.primary}
          />

          <Text style={styles.infoText}>
            Your patient account helps keep your health,
            reminders, memories, and cognitive information
            connected in one place.
          </Text>
        </View>

        <Text style={styles.footer}>
          Brighter Minds • Warmer Tomorrows
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.primary,
  },

  headerSpacer: {
    width: 48,
  },

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
    maxWidth: 430,
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.text,
    textAlign: 'center',
  },

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
    backgroundColor: COLORS.lightGreen,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DDF3E6',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 17,
  },

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

  infoBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',

    backgroundColor: '#EDF7F0',

    borderRadius: 18,
    padding: 17,

    marginTop: 8,
  },

  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14.5,
    lineHeight: 21,
    color: COLORS.text,
  },

  footer: {
    marginTop: 30,
    fontSize: 14,
    color: '#718090',
    textAlign: 'center',
  },
});