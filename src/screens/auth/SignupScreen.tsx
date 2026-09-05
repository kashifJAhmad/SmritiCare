import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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

type SignupScreenProps = {
  onBack: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  surface: '#F4FAFF',
  input: '#FFFFFF',
  primary: '#00450D',
  text: '#111D23',
  secondaryText: '#41493E',
  border: '#717A6D',
  borderLight: '#C0C9BB',
  white: '#FFFFFF',
};

const languages = [
  'English',
  'Hindi',
  'Assamese',
  'Manipuri',
  'Khasi',
  'Garo',
];

export default function SignupScreen({
  onBack,
  onSignIn,
  onCreateAccount,
}: SignupScreenProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [caregiverName, setCaregiverName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [language, setLanguage] = useState('');
  const [password, setPassword] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);

  // ========================================
  // CREATE ACCOUNT
  // ========================================

  const handleCreateAccount = () => {
    console.log('CREATE ACCOUNT BUTTON PRESSED');

    // Temporary navigation test.
    // Validation can be added back after navigation is confirmed.
    onCreateAccount();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Create Your Profile
          </Text>
        </View>

        {/* FORM */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* DESCRIPTION */}

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Please fill in your details to create an
              account on SmritiCare.
            </Text>
          </View>

          {/* FULL NAME */}

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>

            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Anand Sharma"
              placeholderTextColor={COLORS.secondaryText}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* AGE */}

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>

            <TextInput
              value={age}
              onChangeText={(text) => {
                const numbersOnly = text.replace(/[^0-9]/g, '');
                setAge(numbersOnly);
              }}
              placeholder="e.g. 72"
              placeholderTextColor={COLORS.secondaryText}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          {/* CAREGIVER NAME */}

          <View style={styles.field}>
            <Text style={styles.label}>Caregiver Name</Text>

            <TextInput
              value={caregiverName}
              onChangeText={setCaregiverName}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={COLORS.secondaryText}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* EMERGENCY CONTACT */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Emergency Contact (Phone)
            </Text>

            <TextInput
              value={emergencyContact}
              onChangeText={(text) => {
                const numbersOnly = text.replace(/[^0-9]/g, '');
                setEmergencyContact(numbersOnly);
              }}
              placeholder="e.g. 9876543210"
              placeholderTextColor={COLORS.secondaryText}
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* PREFERRED LANGUAGE */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Preferred Language
            </Text>

            <Pressable
              style={styles.select}
              onPress={() => setShowLanguages(true)}
              accessibilityRole="button"
              accessibilityLabel="Select preferred language"
            >
              <Text
                style={[
                  styles.selectText,
                  !language && styles.placeholder,
                ]}
              >
                {language || 'Select your language'}
              </Text>

              <MaterialIcons
                name="keyboard-arrow-down"
                size={32}
                color={COLORS.border}
              />
            </Pressable>
          </View>

          {/* PASSWORD */}

          <View style={[styles.field, styles.passwordField]}>
            <Text style={styles.label}>Password</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter a secure password"
              placeholderTextColor={COLORS.secondaryText}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* CREATE ACCOUNT */}

          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCreateAccount}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
          >
            <MaterialIcons
              name="person-add"
              size={30}
              color={COLORS.white}
            />

            <Text style={styles.createButtonText}>
              Create Account
            </Text>
          </Pressable>

          {/* SIGN IN */}

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
            </Text>

            <Pressable
              onPress={onSignIn}
              style={styles.signInButton}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              hitSlop={8}
            >
              <Text style={styles.signInLink}>
                Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* LANGUAGE MODAL */}

        <Modal
          visible={showLanguages}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguages(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowLanguages(false)}
          >
            <Pressable
              style={styles.languageModal}
              onPress={(event) => event.stopPropagation()}
            >
              <Text style={styles.modalTitle}>
                Select Language
              </Text>

              {languages.map((item) => (
                <Pressable
                  key={item}
                  style={styles.languageOption}
                  onPress={() => {
                    setLanguage(item);
                    setShowLanguages(false);
                  }}
                >
                  <Text style={styles.languageText}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },

  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },

  headerTitle: {
    fontFamily: 'sans-serif',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 30,
    paddingTop: 48,
    paddingBottom: 60,
  },

  descriptionContainer: {
    marginBottom: 42,
  },

  description: {
    fontFamily: 'sans-serif',
    fontSize: 26,
    lineHeight: 40,
    fontWeight: '400',
    color: COLORS.secondaryText,
  },

  field: {
    marginBottom: 30,
  },

  label: {
    fontFamily: 'sans-serif',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },

  input: {
    height: 76,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.input,
    paddingHorizontal: 20,
    fontFamily: 'sans-serif',
    fontSize: 24,
    color: COLORS.text,
  },

  select: {
    height: 76,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.input,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontFamily: 'sans-serif',
    fontSize: 24,
    color: COLORS.text,
  },

  placeholder: {
    color: COLORS.secondaryText,
  },

  passwordField: {
    marginBottom: 38,
  },

  createButton: {
    minHeight: 74,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#0C5216',
  },

  buttonPressed: {
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  createButtonText: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.white,
  },

  signInContainer: {
    marginTop: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  signInText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.secondaryText,
  },

  signInButton: {
    minHeight: 48,
    justifyContent: 'center',
  },

  signInLink: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  languageModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },

  modalTitle: {
    fontFamily: 'sans-serif',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },

  languageOption: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  languageText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    color: COLORS.text,
  },
});