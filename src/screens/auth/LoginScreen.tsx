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
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';
import { strings } from '../../constants/strings';
import CustomTextInput from '../../components/common/CustomTextInput';
import PrimaryButton from '../../components/common/PrimaryButton';

type LoginScreenProps = {
  onBack: () => void;
  onSignUp: () => void;
  onLogin: () => void;
};

export default function LoginScreen({
  onBack,
  onSignUp,
  onLogin,
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ================================
  // LOGIN
  // ================================

  const handleLogin = () => {
    // Validate username/email
    if (!username.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your username or email.',
      );
      return;
    }

    // Validate password
    if (!password.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your password.',
      );
      return;
    }

    // Backend authentication will be added later.
    // For now, successful login goes directly to Home.
    onLogin();
  };

  // ================================
  // FORGOT PASSWORD
  // ================================

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      strings.login.passwordResetMessage,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ================================
              HEADER
          ================================= */}

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
                color={colors.primary}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              {strings.appName}
            </Text>
          </View>

          {/* ================================
              MAIN CONTENT
          ================================= */}

          <View style={styles.content}>

            {/* Introduction */}

            <View style={styles.introduction}>
              <Text style={styles.welcome}>
                {strings.login.welcomeBack}
              </Text>

              <Text style={styles.subtitle}>
                {strings.login.signInMessage}
              </Text>
            </View>

            {/* ================================
                LOGIN FORM
            ================================= */}

            <View style={styles.form}>

              {/* Username / Email */}

              <CustomTextInput
                label={strings.login.usernameLabel}
                icon="person-outline"
                placeholder={strings.login.usernamePlaceholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              {/* Password */}

              <CustomTextInput
                label={strings.login.passwordLabel}
                icon="lock-closed-outline"
                placeholder={strings.login.passwordPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {/* Forgot Password */}

              <View style={styles.forgotContainer}>
                <Pressable
                  onPress={handleForgotPassword}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  hitSlop={8}
                >
                  <Text style={styles.link}>
                    {strings.login.forgotPassword}
                  </Text>
                </Pressable>
              </View>

              {/* ================================
                  LOGIN BUTTON
              ================================= */}

              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title={strings.login.signIn}
                  icon="log-in-outline"
                  onPress={handleLogin}
                />
              </View>
            </View>

            {/* ================================
                SIGN UP
            ================================= */}

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                {strings.login.noAccount}{' '}
              </Text>

              <Pressable
                onPress={onSignUp}
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                hitSlop={8}
              >
                <Text style={styles.link}>
                  {strings.login.signUp}
                </Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // ================================
  // HEADER
  // ================================

  header: {
    height: 72,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: sizes.pageMargin,

    backgroundColor: colors.surface,

    borderBottomWidth: 2,
    borderBottomColor: colors.outlineVariant,
  },

  backButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 8,
  },

  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.primary,
  },

  // ================================
  // CONTENT
  // ================================

  content: {
    width: '100%',
    maxWidth: 672,

    alignSelf: 'center',

    paddingHorizontal: sizes.pageMargin,
    paddingTop: 28,
    paddingBottom: 24,
  },

  // ================================
  // INTRODUCTION
  // ================================

  introduction: {
    alignItems: 'center',
    marginBottom: 32,
  },

  welcome: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.onSurface,

    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurfaceVariant,

    textAlign: 'center',
  },

  // ================================
  // FORM
  // ================================

  form: {
    width: '100%',

    backgroundColor: colors.surfaceContainerLowest,

    padding: 24,

    borderWidth: 2,
    borderColor: colors.outlineVariant,

    borderRadius: sizes.radiusXl,

    gap: sizes.stackGap,
  },

  // ================================
  // FORGOT PASSWORD
  // ================================

  forgotContainer: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },

  link: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',

    color: colors.primary,

    textDecorationLine: 'underline',
  },

  // ================================
  // LOGIN BUTTON
  // ================================

  buttonContainer: {
    paddingTop: 16,
  },

  // ================================
  // SIGN UP
  // ================================

  signupContainer: {
    marginTop: 32,

    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'center',
    alignItems: 'center',
  },

  signupText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',

    color: colors.onSurfaceVariant,
  },
});