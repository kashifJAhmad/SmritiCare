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
import { MaterialIcons } from "@expo/vector-icons";

import { patientSignup } from "../../services/api";
import { saveToken } from "../../services/authStorage";

const COLORS = {
  primary: "#00450D",
  primaryContainer: "#1B5E20",
  background: "#F4FAFF",
  surface: "#FFFFFF",
  text: "#1B1C1C",
  textSecondary: "#41493E",
  outline: "#717A6D",
  lightBorder: "#C0C9BB",
  error: "#BA1A1A",
};

type SignupScreenProps = {
  onSignup: () => void;
  onLogin: () => void;
  onBack?: () => void;
};

export default function SignupScreen({
  onSignup,
  onLogin,
  onBack,
}: SignupScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("English");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
  if (!fullName.trim()) {
    Alert.alert("Missing information", "Please enter your full name.");
    return;
  }

  if (!email.trim()) {
    Alert.alert("Missing information", "Please enter your email address.");
    return;
  }

  if (!password) {
    Alert.alert("Missing information", "Please enter a password.");
    return;
  }

  if (password.length < 6) {
    Alert.alert(
      "Password too short",
      "Your password must be at least 6 characters long.",
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

  const parsedAge = age.trim() ? Number(age.trim()) : undefined;

  if (
    parsedAge !== undefined &&
    (!Number.isInteger(parsedAge) || parsedAge < 1)
  ) {
    Alert.alert("Invalid age", "Please enter a valid age.");
    return;
  }

  try {
    setLoading(true);

    console.log("1. Starting signup request...");

    const result = await patientSignup({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      age: parsedAge,
      language,
    });

    console.log("2. Signup API succeeded");
    console.log("3. Token received:", !!result.token);

    if (result.token) {
      console.log("4. Saving token...");
      await saveToken(result.token);
      console.log("5. Token saved successfully");
    }

    setLoading(false);

    Alert.alert(
      "Account created",
      "Your SmritiCare patient account has been created successfully.",
      [
        {
          text: "Continue",
          onPress: onSignup,
        },
      ],
    );
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    setLoading(false);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create your account. Please try again.";

    Alert.alert("Signup failed", message);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={styles.backButton}
              hitSlop={10}
              disabled={loading}
            >
              <MaterialIcons
                name="arrow-back"
                size={27}
                color={COLORS.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Patient Account</Text>
          <Text style={styles.subtitle}>
            Create your SmritiCare account to get started.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Your Information</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#8A9187"
            style={styles.input}
            editable={!loading}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#8A9187"
            style={styles.input}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor="#8A9187"
            style={styles.input}
            editable={!loading}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Preferred Language</Text>

          <Pressable
            style={styles.languageButton}
            disabled={loading}
            onPress={() =>
              Alert.alert(
                "Preferred Language",
                "Language selection will be added soon.",
              )
            }
          >
            <Text style={styles.languageText}>{language}</Text>

            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color={COLORS.textSecondary}
            />
          </Pressable>

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#8A9187"
              style={styles.passwordInput}
              editable={!loading}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              onPress={() => setShowPassword((value) => !value)}
              disabled={loading}
              hitSlop={10}
              style={styles.eyeButton}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={22}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          <Text style={styles.passwordHint}>
            Password must contain at least 6 characters.
          </Text>

          <Text style={styles.label}>Confirm Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#8A9187"
              style={styles.passwordInput}
              editable={!loading}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              onPress={() => setShowConfirmPassword((value) => !value)}
              disabled={loading}
              hitSlop={10}
              style={styles.eyeButton}
            >
              <MaterialIcons
                name={
                  showConfirmPassword ? "visibility" : "visibility-off"
                }
                size={22}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={loading}
            style={({ pressed }) => [
              styles.signupButton,
              pressed && !loading && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.signupButtonText}>Create Account</Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={22}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account?</Text>

          <Pressable onPress={onLogin} disabled={loading}>
            <Text style={styles.loginLink}>Sign In</Text>
          </Pressable>
        </View>

        <View style={styles.securityCard}>
          <MaterialIcons
            name="lock"
            size={22}
            color={COLORS.primary}
          />

          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Your information is secure</Text>
            <Text style={styles.securityText}>
              Your password is securely protected and your personal information
              is kept private.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 40,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  backPlaceholder: {
    width: 48,
    height: 48,
  },

  logo: {
    width: 55,
    height: 55,
  },

  titleSection: {
    marginTop: 24,
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
  },

  languageButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  languageText: {
    fontSize: 16,
    color: COLORS.text,
  },

  passwordContainer: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  passwordInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },

  eyeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  passwordHint: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  signupButton: {
    marginTop: 26,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  loginSection: {
    alignItems: "center",
    marginTop: 22,
    gap: 5,
  },

  loginText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  loginLink: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  securityCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#EAF4EA",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  securityTextContainer: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },

  securityText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
});