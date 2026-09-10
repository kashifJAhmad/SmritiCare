import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type CaregiverAuthScreenProps = {
  onBack?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
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
  outline: "#72766D",
  outlineVariant: "#CDD2C8",

  greenSoft: "#E5F0E1",
  greenBorder: "#B9D2B3",

  error: "#9B3F32",
};

export default function CaregiverAuthScreen({
  onBack,
  onSignIn,
  onSignUp,
}: CaregiverAuthScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={27}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Caregiver
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

        {/* Introduction */}
        <Text style={styles.title}>
          Caregiver Access
        </Text>

        <Text style={styles.subtitle}>
          Sign in to manage the people you care for,
          or create a new caregiver account.
        </Text>

        {/* Caregiver Card */}
        <View style={styles.caregiverCard}>
          <View style={styles.cardIcon}>
            <MaterialIcons
              name="volunteer-activism"
              size={32}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              SmritiCare Caregiver
            </Text>

            <Text style={styles.cardText}>
              Connect with patients, view their care
              information, and support their daily
              routines.
            </Text>
          </View>
        </View>

        {/* Sign In */}
        <Pressable
          onPress={onSignIn}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign in as caregiver"
        >
          <MaterialIcons
            name="login"
            size={23}
            color={COLORS.onPrimary}
          />

          <Text style={styles.primaryButtonText}>
            Caregiver Sign In
          </Text>

          <MaterialIcons
            name="arrow-forward"
            size={21}
            color={COLORS.onPrimary}
          />
        </Pressable>

        {/* Sign Up */}
        <Pressable
          onPress={onSignUp}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Create caregiver account"
        >
          <MaterialIcons
            name="person-add"
            size={23}
            color={COLORS.primary}
          />

          <Text style={styles.secondaryButtonText}>
            Create Caregiver Account
          </Text>

          <MaterialIcons
            name="arrow-forward"
            size={21}
            color={COLORS.primary}
          />
        </Pressable>

        {/* Security Information */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <MaterialIcons
              name="verified-user"
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Secure caregiver access
            </Text>

            <Text style={styles.securityText}>
              Your caregiver account helps you safely
              manage connected patients through
              SmritiCare.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          SmritiCare • Care with confidence
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
    maxWidth: 520,
    height: 64,
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
  },

  headerTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: COLORS.primary,
  },

  headerSpacer: {
    width: 48,
  },

  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    overflow: "hidden",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },

      android: {
        elevation: 4,
      },

      default: {},
    }),
  },

  logo: {
    width: 112,
    height: 112,
  },

  title: {
    marginTop: 24,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 500,
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  caregiverCard: {
    width: "100%",
    maxWidth: 520,
    marginTop: 28,
    padding: 17,
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cardIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  cardContent: {
    flex: 1,
    marginLeft: 13,
  },

  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  cardText: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  primaryButton: {
    width: "100%",
    maxWidth: 520,
    minHeight: 58,
    marginTop: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },

      android: {
        elevation: 3,
      },

      default: {},
    }),
  },

  primaryButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  secondaryButton: {
    width: "100%",
    maxWidth: 520,
    minHeight: 58,
    marginTop: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  secondaryButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },

  securityCard: {
    width: "100%",
    maxWidth: 520,
    marginTop: 26,
    padding: 15,
    borderRadius: 17,
    backgroundColor: COLORS.secondaryContainer,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  securityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
    marginLeft: 11,
  },

  securityTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: COLORS.onSecondaryContainer,
  },

  securityText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  footerText: {
    marginTop: 28,
    fontSize: 12,
    color: COLORS.outline,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
});