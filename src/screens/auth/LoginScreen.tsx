import React, { useState } from 'react';
import {
  Image,
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type LoginScreenProps = {
  onLogin: () => void;
  onSignup: () => void;
  onBack?: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  primary: '#00450D',
  navy: '#102A56',
  text: '#526477',
  border: '#CBD9E5',
  green: '#4FA56A',
  lightGreen: '#EAF8F0',
  white: '#FFFFFF',
  error: '#BA1A1A',
};

export default function LoginScreen({
  onLogin,
  onSignup,
  onBack,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    // Backend authentication will be connected here next.
    onLogin();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
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

            <Text style={styles.headerTitle}>Patient Sign In</Text>

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

          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Sign in to your SmritiCare patient account
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <Text style={styles.label}>Email Address</Text>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={23}
                color={COLORS.green}
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#8A98A6"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            {/* Password */}
            <Text style={[styles.label, styles.passwordLabel]}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={23}
                color={COLORS.green}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#8A98A6"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={23}
                  color="#718090"
                />
              </Pressable>
            </View>

            {/* Forgot Password */}
            <Pressable
              style={styles.forgotButton}
              onPress={() => {}}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </Pressable>

            {/* Sign In */}
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons
                name="login"
                size={23}
                color={COLORS.white}
              />

              <Text style={styles.primaryButtonText}>
                Sign In
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Signup */}
          <View style={styles.signupRow}>
            <Text style={styles.accountText}>
              Don't have a patient account?
            </Text>

            <Pressable onPress={onSignup}>
              <Text style={styles.signupText}> Sign Up</Text>
            </Pressable>
          </View>

          {/* Security */}
          <View style={styles.securityBox}>
            <MaterialIcons
              name="verified-user"
              size={25}
              color={COLORS.primary}
            />

            <Text style={styles.securityText}>
              Your information is protected and only used to
              provide your SmritiCare services.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
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
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },

  logo: {
    width: 118,
    height: 118,
  },

  title: {
    marginTop: 23,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 28,
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.text,
    textAlign: 'center',
  },

  form: {
    width: '100%',
    maxWidth: 520,
  },

  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },

  passwordLabel: {
    marginTop: 19,
  },

  inputContainer: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.white,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    minHeight: 54,
    fontSize: 16,
    color: '#1B2D42',
    outlineStyle: 'none' as any,
  },

  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
  },

  forgotText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  primaryButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: COLORS.primary,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  primaryButtonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  dividerRow: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D6E0E8',
  },

  orText: {
    marginHorizontal: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#7B8997',
  },

  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },

  accountText: {
    fontSize: 15,
    color: COLORS.text,
  },

  signupText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },

  securityBox: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'flex-start',

    backgroundColor: '#EDF7F0',

    borderRadius: 16,
    padding: 15,

    marginTop: 28,
  },

  securityText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.text,
  },
});