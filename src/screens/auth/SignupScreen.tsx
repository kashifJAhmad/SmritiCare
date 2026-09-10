import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { patientSignup } from "../../services/api";
import { saveToken } from "../../services/authStorage";

type SignupScreenProps = {
  onSignup: (token?: string) => void;
  onLogin: () => void;
  onBack?: () => void;
};

const COLORS = {
  background: "#FBF9F1",

  text: "#1B1C17",
  textSecondary: "#565A52",

  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",

  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  onSecondaryContainer: "#68472F",

  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",

  border: "#CDD2C8",
  outline: "#72766D",

  greenSoft: "#E5F0E1",
  greenBorder: "#B9D2B3",

  error: "#9B3F32",
};

export default function SignupScreen({
  onSignup,
  onLogin,
  onBack,
}: SignupScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanLanguage = language.trim();

    if (!cleanName) {
      Alert.alert(
        "Missing information",
        "Please enter your full name.",
      );
      return;
    }

    if (!cleanEmail) {
      Alert.alert(
        "Missing information",
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Missing information",
        "Please enter a password.",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid password",
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure both passwords are the same.",
      );
      return;
    }

    let numericAge: number | undefined;

    if (age.trim()) {
      numericAge = Number(age.trim());

      if (
        !Number.isInteger(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
      ) {
        Alert.alert(
          "Invalid age",
          "Please enter a valid age between 1 and 120.",
        );
        return;
      }
    }

    try {
      setLoading(true);

      const result = await patientSignup({
        fullName: cleanName,
        email: cleanEmail,
        password,
        age: numericAge,
        language:
          cleanLanguage || undefined,
      });

      await saveToken(result.token);

      setLoading(false);

      Alert.alert(
        "Account Created",
        "Your SmritiCare patient account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () => onSignup(result.token),
          },
        ],
      );
    } catch (error) {
      setLoading(false);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your account.";

      Alert.alert(
        "Sign Up Failed",
        message,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
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
            disabled={loading}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Patient Sign Up
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Logo */}
        <View style={styles.logoCircle}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Create Your Account
        </Text>

        <Text style={styles.subtitle}>
          Create your personal SmritiCare account
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="person"
              size={23}
              color={COLORS.primary}
            />

            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#8A8D84"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />
          </View>

          {/* Email */}
          <Text
            style={[
              styles.label,
              styles.nextLabel,
            ]}
          >
            Email Address
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={23}
              color={COLORS.primary}
            />

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#8A8D84"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />
          </View>

          {/* Age */}
          <Text
            style={[
              styles.label,
              styles.nextLabel,
            ]}
          >
            Age
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="cake"
              size={23}
              color={COLORS.primary}
            />

            <TextInput
              value={age}
              onChangeText={(value) =>
                setAge(
                  value.replace(/[^0-9]/g, ""),
                )
              }
              placeholder="Enter your age"
              placeholderTextColor="#8A8D84"
              keyboardType="number-pad"
              editable={!loading}
              maxLength={3}
              style={styles.input}
            />
          </View>

          {/* Language */}
          <Text
            style={[
              styles.label,
              styles.nextLabel,
            ]}
          >
            Preferred Language
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="language"
              size={23}
              color={COLORS.primary}
            />

            <TextInput
              value={language}
              onChangeText={setLanguage}
              placeholder="e.g. English"
              placeholderTextColor="#8A8D84"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />
          </View>

          {/* Password */}
          <Text
            style={[
              styles.label,
              styles.nextLabel,
            ]}
          >
            Password
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={23}
              color={COLORS.primary}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#8A8D84"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />

            <Pressable
              onPress={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              disabled={loading}
              hitSlop={10}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              <MaterialIcons
                name={
                  showPassword
                    ? "visibility"
                    : "visibility-off"
                }
                size={23}
                color={COLORS.outline}
              />
            </Pressable>
          </View>

          {/* Confirm Password */}
          <Text
            style={[
              styles.label,
              styles.nextLabel,
            ]}
          >
            Confirm Password
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock-outline"
              size={23}
              color={COLORS.primary}
            />

            <TextInput
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              placeholder="Confirm your password"
              placeholderTextColor="#8A8D84"
              secureTextEntry={
                !showConfirmPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(
                  (value) => !value,
                )
              }
              disabled={loading}
              hitSlop={10}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <MaterialIcons
                name={
                  showConfirmPassword
                    ? "visibility"
                    : "visibility-off"
                }
                size={23}
                color={COLORS.outline}
              />
            </Pressable>
          </View>

          {/* Create Account */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              loading &&
                styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create patient account"
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.onPrimary}
              />
            ) : (
              <>
                <MaterialIcons
                  name="person-add"
                  size={23}
                  color={COLORS.onPrimary}
                />

                <Text
                  style={styles.primaryButtonText}
                >
                  Create Patient Account
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Login */}
        <View style={styles.loginRow}>
          <Text style={styles.accountText}>
            Already have an account?
          </Text>

          <Pressable
            onPress={onLogin}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {" "}Sign In
            </Text>
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
            Your patient account is protected by
            SmritiCare authentication.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.primary,
  },

  headerSpacer: {
    width: 48,
  },

  logoCircle: {
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    overflow: "hidden",
    elevation: 4,
  },

  logo: {
    width: 110,
    height: 110,
  },

  title: {
    marginTop: 22,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 27,
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  form: {
    width: "100%",
    maxWidth: 520,
  },

  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  nextLabel: {
    marginTop: 18,
  },

  inputContainer: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    minHeight: 54,
    fontSize: 16,
    color: COLORS.text,

    ...(Platform.OS === "web"
      ? ({ outlineStyle: "none" } as any)
      : {}),
  },

  eyeButton: {
    width: 42,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    paddingHorizontal: 18,
    elevation: 3,
  },

  primaryButtonText: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  pressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    flexWrap: "wrap",
  },

  accountText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  loginText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  securityBox: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    borderRadius: 16,
    padding: 15,
    marginTop: 28,
  },

  securityText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
});