import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  background: "#FCF9F8",
  surface: "#FCF9F8",
  surfaceContainer: "#F0EDED",
  surfaceContainerLow: "#F6F3F2",
  surfaceVariant: "#E5E2E1",
  surfaceContainerLowest: "#FFFFFF",

  primary: "#00450D",
  primaryContainer: "#1B5E20",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#90D689",
  primaryFixed: "#ACF4A4",
  primaryFixedDim: "#91D78A",

  secondary: "#556158",
  secondaryContainer: "#D9E6DA",
  secondaryFixed: "#D9E6DA",

  onBackground: "#1B1C1C",
  onSurface: "#1B1C1C",
  onSurfaceVariant: "#41493E",
  outline: "#717A6D",
  outlineVariant: "#C0C9BB",

  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
};

type OfflineModeScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type FeatureStatusProps = {
  icon: MaterialIconName;
  title: string;
  status: string;
  available: boolean;
};

function FeatureStatus({
  icon,
  title,
  status,
  available,
}: FeatureStatusProps) {
  return (
    <View
      style={[
        styles.featureCard,
        available
          ? styles.featureCardAvailable
          : styles.featureCardPending,
      ]}
    >
      <View
        style={[
          styles.featureIcon,
          available
            ? styles.featureIconAvailable
            : styles.featureIconPending,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={25}
          color={
            available
              ? COLORS.onPrimaryContainer
              : COLORS.onSurfaceVariant
          }
        />
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>

        <Text
          style={[
            styles.featureStatus,
            available
              ? styles.featureStatusAvailable
              : styles.featureStatusPending,
          ]}
        >
          {status}
        </Text>
      </View>

      <MaterialIcons
        name={available ? "check-circle" : "pending"}
        size={25}
        color={available ? COLORS.primary : COLORS.outline}
      />
    </View>
  );
}

export default function OfflineModeScreen({
  onBack,
  onHome,
}: OfflineModeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* Top App Bar */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={25}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>SmritiCare</Text>

          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Offline Mode</Text>
        </View>

        {/* Connectivity Banner */}
        <View style={styles.connectivityBanner}>
          <View style={styles.connectivityIcon}>
            <MaterialIcons
              name="wifi-off"
              size={30}
              color={COLORS.onSurfaceVariant}
            />
          </View>

          <Text style={styles.connectivityText}>
            Offline - Activities are being saved locally.
          </Text>
        </View>

        {/* Feature Status */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionLabel}>FEATURE STATUS</Text>

          <FeatureStatus
            icon="sports-esports"
            title="Games"
            status="Available"
            available
          />

          <FeatureStatus
            icon="notifications-active"
            title="Reminders"
            status="Working"
            available
          />

          <FeatureStatus
            icon="cloud-sync"
            title="Sync"
            status="Pending"
            available={false}
          />
        </View>

        {/* Pending Synchronization */}
        <View style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <Text style={styles.syncTitle}>
              Pending Synchronization
            </Text>

            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>4 items</Text>
            </View>
          </View>

          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Progress: 0 out of 4 synced"
            style={styles.progressTrack}
          >
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.syncWaitingText}>
            Waiting for connection...
          </Text>
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoAccent} />

          <MaterialIcons
            name="info"
            size={23}
            color={COLORS.primary}
            style={styles.infoIcon}
          />

          <Text style={styles.infoText}>
            Your activities will sync automatically when you
            reconnect to the internet. No manual action is
            needed.
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <View style={styles.disabledSyncButton}>
            <MaterialIcons
              name="sync"
              size={24}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.disabledSyncText}>
              Manual Sync
            </Text>
          </View>

          <Pressable
            onPress={onHome}
            style={({ pressed }) => [
              styles.homeButton,
              pressed && styles.pressedButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <MaterialIcons
              name="home"
              size={24}
              color={COLORS.primary}
            />

            <Text style={styles.homeButtonText}>
              Back to Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    zIndex: 20,
  },

  headerInner: {
    height: 56,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -4,
  },

  headerTitle: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -58 }],
    color: COLORS.primary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    fontFamily: "sans-serif",
  },

  headerRightSpacer: {
    width: 40,
    height: 40,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    gap: 16,
  },

  pageHeader: {
    marginBottom: 4,
  },

  pageTitle: {
    color: COLORS.onSurface,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },

  connectivityBanner: {
    minHeight: 72,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  connectivityIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  connectivityText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "400",
  },

  featureSection: {
    gap: 12,
    marginTop: 4,
  },

  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    marginBottom: 1,
  },

  featureCard: {
    minHeight: 82,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  featureCardAvailable: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },

  featureCardPending: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    opacity: 0.8,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconAvailable: {
    backgroundColor: COLORS.primaryContainer,
  },

  featureIconPending: {
    backgroundColor: COLORS.surfaceVariant,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    color: COLORS.onSurface,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },

  featureStatus: {
    fontSize: 20,
    lineHeight: 28,
    marginTop: 1,
  },

  featureStatusAvailable: {
    color: COLORS.primary,
  },

  featureStatusPending: {
    color: COLORS.outline,
  },

  syncCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },

  syncHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },

  syncTitle: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },

  itemBadge: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  itemBadgeText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceVariant,
    overflow: "hidden",
  },

  progressFill: {
    width: "25%",
    height: "100%",
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
  },

  syncWaitingText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    opacity: 0.8,
  },

  infoCard: {
    minHeight: 82,
    backgroundColor: COLORS.surfaceContainer,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 16,
    gap: 12,
    overflow: "hidden",
  },

  infoAccent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: COLORS.primary,
  },

  infoIcon: {
    marginTop: 17,
  },

  infoText: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 20,
    lineHeight: 28,
    paddingVertical: 15,
  },

  spacer: {
    flex: 1,
    minHeight: 40,
  },

  actions: {
    gap: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },

  disabledSyncButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    opacity: 0.5,
  },

  disabledSyncText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },

  homeButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },

  homeButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  pressedButton: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
