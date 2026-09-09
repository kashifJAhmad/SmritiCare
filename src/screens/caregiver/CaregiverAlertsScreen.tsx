import React, { useMemo, useState } from "react";
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
  // SmritiCare patient-app palette
  background: "#F4FAFF",
  surface: "#FFFFFF",
  surfaceContainerLow: "#E9F6FD",
  surfaceContainer: "#EAF3F7",
  surfaceContainerHigh: "#E2EEF4",
  surfaceContainerHighest: "#DCE9EF",

  primary: "#00450D",
  primaryContainer: "#1B5E20",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#90D689",

  secondary: "#00629E",
  secondaryContainer: "#D7EEFF",
  onSecondaryContainer: "#00344F",

  greenSoft: "#E2F3E0",
  greenBorder: "#B7DDB3",

  error: "#BA1A1A",
  errorContainer: "#FFE8E5",
  onErrorContainer: "#7A1010",

  warning: "#8A4B00",
  warningContainer: "#FFF1DC",

  onSurface: "#111D23",
  onSurfaceVariant: "#41493E",
  outline: "#717A6D",
  outlineVariant: "#C0C9BB",

  inverseSurface: "#263238",
  inverseOnSurface: "#F3F7F9",
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type AlertCategory = "medication" | "routine" | "device";

type AlertItem = {
  id: string;
  category: AlertCategory;
  typeLabel: string;
  title: string;
  description: string;
  badge: string;
  icon: MaterialIconName;
};

type CaregiverAlertsScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

const ALERTS: AlertItem[] = [
  {
    id: "medication",
    category: "medication",
    typeLabel: "Urgent Action",
    title: "Medication Not Acknowledged",
    description:
      "Night Calcium & Vitamin D (08:00 PM) scheduled 45 mins ago. Pillbox sensor did not register drawer opening.",
    badge: "Unacknowledged",
    icon: "emergency",
  },
  {
    id: "routine",
    category: "routine",
    typeLabel: "Routine Follow-up",
    title: "Hydration Behind Schedule",
    description:
      "Patient has completed 5 of 8 glasses today. Last logged at 3:00 PM (3 hours behind target pace for humid evening).",
    badge: "5 / 8 Cups",
    icon: "water-drop",
  },
  {
    id: "device",
    category: "device",
    typeLabel: "Brain Health",
    title: "Daily Cognitive Session Remaining",
    description:
      "4 of 5 exercises done. 1 gentle Bihu memory match session pending before evening rest time.",
    badge: "Pending",
    icon: "psychology",
  },
];

const FILTERS = [
  { key: "all", label: "All Alerts", count: 3 },
  { key: "medication", label: "Medication", count: 1 },
  { key: "routine", label: "Routine", count: 1 },
  { key: "device", label: "Cognitive", count: 1 },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function CaregiverAlertsScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: CaregiverAlertsScreenProps) {
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] =
    useState<FilterKey>("all");

  const [dismissedAlerts, setDismissedAlerts] =
    useState<string[]>([]);

  const [processingAlert, setProcessingAlert] =
    useState<string | null>(null);

  const [completedActions, setCompletedActions] =
    useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const visibleAlerts = useMemo(() => {
    return ALERTS.filter((alert) => {
      if (dismissedAlerts.includes(alert.id)) {
        return false;
      }

      if (selectedFilter === "all") {
        return true;
      }

      return alert.category === selectedFilter;
    });
  }, [selectedFilter, dismissedAlerts]);

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
      showToast("Caregiver alerts refreshed.");
    }, 700);
  };

  const handleSettings = () => {
    showToast("Alert settings will be available here.");
  };

  const handleVoiceReminder = (alertId: string) => {
    if (processingAlert) return;

    setProcessingAlert(alertId);

    setTimeout(() => {
      setProcessingAlert(null);

      setCompletedActions((previous) => ({
        ...previous,
        [alertId]: "Sent to Patient Unit",
      }));

      showToast(
        "Custom Assamese voice prompt delivered to device."
      );

      setTimeout(() => {
        setCompletedActions((previous) => {
          const updated = { ...previous };
          delete updated[alertId];
          return updated;
        });
      }, 3500);
    }, 900);
  };

  const handlePrompt = (
    alertId: string,
    message: string
  ) => {
    if (processingAlert) return;

    setProcessingAlert(alertId);

    setTimeout(() => {
      setProcessingAlert(null);

      setCompletedActions((previous) => ({
        ...previous,
        [alertId]: "Prompt Delivered",
      }));

      showToast(message);

      setTimeout(() => {
        setCompletedActions((previous) => {
          const updated = { ...previous };
          delete updated[alertId];
          return updated;
        });
      }, 3000);
    }, 700);
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((previous) => [
      ...previous,
      alertId,
    ]);

    showToast("Alert marked as acknowledged.");
  };

  return (
    <View style={styles.screen}>
      {/* ------------------------------------------------------------- */}
      {/* Header                                                        */}
      {/* ------------------------------------------------------------- */}

      <View
        style={[
          styles.header,
          { paddingTop: insets.top },
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
              color={COLORS.onSurface}
            />
          </Pressable>

          <View style={styles.headerBrand}>
            <Text style={styles.headerTitle}>
              SmritiCare
            </Text>

            <Text style={styles.headerSubtitle}>
              Caregiver
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <MaterialIcons
              name="person"
              size={19}
              color={COLORS.onPrimary}
            />
          </View>
        </View>
      </View>

      {/* ------------------------------------------------------------- */}
      {/* Main Content                                                  */}
      {/* ------------------------------------------------------------- */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 78,
            paddingBottom: insets.bottom + 112,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}

        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <View style={styles.dashboardLabelRow}>
              <View style={styles.statusDot} />

              <Text style={styles.dashboardLabel}>
                CAREGIVER DASHBOARD
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Needs Attention
            </Text>

            <Text style={styles.pageSubtitle}>
              Stay connected with your loved one's daily routine.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={handleRefresh}
              style={({ pressed }) => [
                styles.smallActionButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh alerts"
            >
              <MaterialIcons
                name={refreshing ? "sync" : "refresh"}
                size={22}
                color={COLORS.primary}
              />
            </Pressable>

            <Pressable
              onPress={handleSettings}
              style={({ pressed }) => [
                styles.smallActionButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Alert settings"
            >
              <MaterialIcons
                name="tune"
                size={22}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* ----------------------------------------------------------- */}
        {/* Patient Context                                              */}
        {/* ----------------------------------------------------------- */}

        <View style={styles.patientContext}>
          <View style={styles.patientContextLeft}>
            <View style={styles.patientAvatar}>
              <MaterialIcons
                name="person"
                size={29}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.patientContextText}>
              <Text
                style={styles.patientName}
                numberOfLines={1}
              >
                Ramani Barman
              </Text>

              <Text
                style={styles.patientAge}
                numberOfLines={1}
              >
                72 years old
              </Text>

              <Text
                style={styles.patientSubtitle}
                numberOfLines={1}
              >
                Active alerts & reminders
              </Text>
            </View>
          </View>

          <View style={styles.linkedBadge}>
            <MaterialIcons
              name="verified-user"
              size={16}
              color={COLORS.primary}
            />

            <Text style={styles.linkedText}>
              Linked
            </Text>
          </View>
        </View>

        {/* ----------------------------------------------------------- */}
        {/* Alert Summary                                                */}
        {/* ----------------------------------------------------------- */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialIcons
              name="notifications-active"
              size={23}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>
              {visibleAlerts.length}{" "}
              {visibleAlerts.length === 1
                ? "alert needs"
                : "alerts need"}{" "}
              attention
            </Text>

            <Text style={styles.summarySubtitle}>
              Review the items below and help keep the daily routine on track.
            </Text>
          </View>
        </View>

        {/* ----------------------------------------------------------- */}
        {/* Filters                                                      */}
        {/* ----------------------------------------------------------- */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => {
            const active =
              selectedFilter === filter.key;

            return (
              <Pressable
                key={filter.key}
                onPress={() =>
                  setSelectedFilter(filter.key)
                }
                style={({ pressed }) => [
                  styles.filterButton,
                  active
                    ? styles.filterButtonActive
                    : styles.filterButtonInactive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    active
                      ? styles.filterButtonTextActive
                      : styles.filterButtonTextInactive,
                  ]}
                >
                  {filter.label}
                </Text>

                <View
                  style={[
                    styles.filterCount,
                    active
                      ? styles.filterCountActive
                      : styles.filterCountInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      active
                        ? styles.filterCountTextActive
                        : styles.filterCountTextInactive,
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ----------------------------------------------------------- */}
        {/* Alerts                                                       */}
        {/* ----------------------------------------------------------- */}

        <View style={styles.alertsStack}>
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              processing={
                processingAlert === alert.id
              }
              completedText={
                completedActions[alert.id]
              }
              onVoiceReminder={() =>
                handleVoiceReminder(alert.id)
              }
              onDismiss={() =>
                handleDismiss(alert.id)
              }
              onPrompt={(message) =>
                handlePrompt(alert.id, message)
              }
            />
          ))}

          {visibleAlerts.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons
                  name="check-circle"
                  size={40}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                All Clear
              </Text>

              <Text style={styles.emptyText}>
                There are no active alerts in this category.
              </Text>
            </View>
          )}
        </View>

        {/* ----------------------------------------------------------- */}
        {/* Resolved Today                                               */}
        {/* ----------------------------------------------------------- */}

        <View style={styles.resolvedHeader}>
          <View>
            <Text style={styles.sectionLabel}>
              TODAY
            </Text>

            <Text style={styles.resolvedTitle}>
              Resolved
            </Text>
          </View>

          <View style={styles.resolvedCountBadge}>
            <MaterialIcons
              name="check-circle"
              size={17}
              color={COLORS.primary}
            />

            <Text style={styles.resolvedCount}>
              1 completed
            </Text>
          </View>
        </View>

        <View style={styles.resolvedCard}>
          <View style={styles.resolvedIcon}>
            <MaterialIcons
              name="check"
              size={19}
              color={COLORS.onPrimary}
            />
          </View>

          <View style={styles.resolvedText}>
            <Text style={styles.resolvedItemTitle}>
              Morning Medication & Breakfast
            </Text>

            <Text style={styles.resolvedDescription}>
              Acknowledged at 9:15 AM by Ramani Barman
            </Text>
          </View>

          <MaterialIcons
            name="task-alt"
            size={22}
            color={COLORS.primary}
          />
        </View>

        {/* ----------------------------------------------------------- */}
        {/* Disclaimer                                                   */}
        {/* ----------------------------------------------------------- */}

        <View style={styles.disclaimer}>
          <View style={styles.disclaimerIcon}>
            <MaterialIcons
              name="shield"
              size={21}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.disclaimerTextContainer}>
            <Text style={styles.disclaimerTitle}>
              Caregiver guidance
            </Text>

            <Text style={styles.disclaimerText}>
              Caregiver alerts are non-diagnostic and designed
              to assist with daily routine coordination. For
              medical emergencies, consult your primary
              physician immediately.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* Toast                                                          */}
      {/* ------------------------------------------------------------- */}

      {toastMessage && (
        <View
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 92,
            },
          ]}
        >
          <View style={styles.toastIcon}>
            <MaterialIcons
              name="check"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.toastText}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Bottom Navigation                                              */}
      {/* ------------------------------------------------------------- */}

      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: Math.max(
              insets.bottom,
              8
            ),
          },
        ]}
      >
        <BottomNavItem
          icon="home"
          label="Home"
          onPress={onHome}
        />

        <BottomNavItem
          icon="sports-esports"
          label="Games"
          onPress={onGames}
        />

        <BottomNavItem
          icon="notifications-active"
          label="Alerts"
          active
          onPress={onSchedule}
        />

        <BottomNavItem
          icon="psychology"
          label="Memory"
          onPress={onMemory}
        />

        <BottomNavItem
          icon="person"
          label="Profile"
          onPress={onProfile}
        />
      </View>
    </View>
  );
}

/* ========================================================================== */
/* Alert Card                                                                 */
/* ========================================================================== */

type AlertCardProps = {
  alert: AlertItem;
  processing: boolean;
  completedText?: string;
  onVoiceReminder: () => void;
  onDismiss: () => void;
  onPrompt: (message: string) => void;
};

function AlertCard({
  alert,
  processing,
  completedText,
  onVoiceReminder,
  onDismiss,
  onPrompt,
}: AlertCardProps) {
  if (alert.category === "medication") {
    return (
      <View style={styles.medicationAlert}>
        <View style={styles.alertAccentError} />

        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <View style={styles.medicationIcon}>
              <MaterialIcons
                name="medication"
                size={22}
                color={COLORS.error}
              />
            </View>

            <View style={styles.alertTitleContainer}>
              <Text style={styles.urgentLabel}>
                URGENT ACTION
              </Text>

              <Text style={styles.medicationTitle}>
                {alert.title}
              </Text>
            </View>
          </View>

          <View style={styles.unacknowledgedBadge}>
            <Text style={styles.unacknowledgedText}>
              {alert.badge}
            </Text>
          </View>
        </View>

        <Text style={styles.medicationDescription}>
          {alert.description}
        </Text>

        <View style={styles.alertButtonsRow}>
          <Pressable
            onPress={onVoiceReminder}
            disabled={processing}
            style={({ pressed }) => [
              styles.primaryAlertButton,
              processing && styles.processingButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={
                processing
                  ? "sync"
                  : completedText
                    ? "done-all"
                    : "record-voice-over"
              }
              size={21}
              color={COLORS.onPrimary}
            />

            <Text style={styles.primaryAlertButtonText}>
              {processing
                ? "Sending..."
                : completedText ||
                  "Send Voice Reminder"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onDismiss}
            disabled={processing}
            style={({ pressed }) => [
              styles.secondaryAlertButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name="check"
              size={20}
              color={COLORS.primary}
            />

            <Text style={styles.secondaryAlertButtonText}>
              Mark Acknowledged
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (alert.category === "routine") {
    return (
      <View style={styles.routineAlert}>
        <View style={styles.alertAccentBlue} />

        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <View style={styles.routineIcon}>
              <MaterialIcons
                name="water-drop"
                size={21}
                color={COLORS.secondary}
              />
            </View>

            <View style={styles.alertTitleContainer}>
              <Text style={styles.routineLabel}>
                ROUTINE FOLLOW-UP
              </Text>

              <Text style={styles.routineTitle}>
                {alert.title}
              </Text>
            </View>
          </View>

          <View style={styles.cupsBadge}>
            <Text style={styles.cupsBadgeText}>
              {alert.badge}
            </Text>
          </View>
        </View>

        <Text style={styles.routineDescription}>
          {alert.description}
        </Text>

        <Pressable
          onPress={() =>
            onPrompt(
              "Hydration prompt sent to display"
            )
          }
          disabled={processing}
          style={({ pressed }) => [
            styles.primaryAlertButton,
            processing && styles.processingButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons
            name={
              processing
                ? "sync"
                : completedText
                  ? "check"
                  : "notifications-active"
            }
            size={21}
            color={COLORS.onPrimary}
          />

          <Text style={styles.primaryAlertButtonText}>
            {processing
              ? "Sending..."
              : completedText ||
                "Prompt Hydration Reminder"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.deviceAlert}>
      <View style={styles.alertAccentGreen} />

      <View style={styles.alertHeader}>
        <View style={styles.alertTitleRow}>
          <View style={styles.deviceIcon}>
            <MaterialIcons
              name="psychology"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.alertTitleContainer}>
            <Text style={styles.deviceLabel}>
              BRAIN HEALTH
            </Text>

            <Text style={styles.deviceTitle}>
              {alert.title}
            </Text>
          </View>
        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>
            {alert.badge}
          </Text>
        </View>
      </View>

      <Text style={styles.deviceDescription}>
        {alert.description}
      </Text>

      <Pressable
        onPress={() =>
          onPrompt(
            "Activity reminder nudged to tablet"
          )
        }
        disabled={processing}
        style={({ pressed }) => [
          styles.primaryAlertButton,
          processing && styles.processingButton,
          pressed && styles.pressed,
        ]}
      >
        <MaterialIcons
          name={
            processing
              ? "sync"
              : completedText
                ? "check"
                : "play-circle"
          }
          size={21}
          color={COLORS.onPrimary}
        />

        <Text style={styles.primaryAlertButtonText}>
          {processing
            ? "Sending..."
            : completedText ||
              "Encourage Activity"}
        </Text>
      </Pressable>
    </View>
  );
}

/* ========================================================================== */
/* Bottom Navigation                                                          */
/* ========================================================================== */

type BottomNavItemProps = {
  icon: MaterialIconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.navIconContainer,
          active && styles.navIconContainerActive,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={23}
          color={
            active
              ? COLORS.primary
              : COLORS.onSurfaceVariant
          }
        />
      </View>

      <Text
        style={[
          styles.navLabel,
          active
            ? styles.navLabelActive
            : styles.navLabelInactive,
        ]}
      >
        {label}
      </Text>

      {active && (
        <View style={styles.navIndicator} />
      )}
    </Pressable>
  );
}

/* ========================================================================== */
/* Styles                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ---------------------------------------------------------------------- */
  /* Header                                                                 */
  /* ---------------------------------------------------------------------- */

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: COLORS.background,
  },

  headerInner: {
    height: 64,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBrand: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.primary,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },

  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------------------------------------------------------------------- */
  /* Main                                                                   */
  /* ---------------------------------------------------------------------- */

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    gap: 14,
  },

  /* ---------------------------------------------------------------------- */
  /* Heading                                                                */
  /* ---------------------------------------------------------------------- */

  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 2,
  },

  headingText: {
    flex: 1,
    paddingRight: 8,
  },

  dashboardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  dashboardLabel: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  pageTitle: {
    color: COLORS.onSurface,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "700",
    marginTop: 4,
  },

  pageSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
    maxWidth: 350,
  },

  headerActions: {
    flexDirection: "row",
    gap: 7,
    marginTop: 2,
  },

  smallActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------------------------------------------------------------------- */
  /* Patient Context                                                        */
  /* ---------------------------------------------------------------------- */

  patientContext: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  patientContextLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    gap: 12,
  },

  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  patientContextText: {
    flex: 1,
    minWidth: 0,
  },

  patientName: {
    color: COLORS.onSurface,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
  },

  patientAge: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 1,
  },

  patientSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  linkedBadge: {
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  linkedText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  /* ---------------------------------------------------------------------- */
  /* Summary                                                                */
  /* ---------------------------------------------------------------------- */

  summaryCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  summarySubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  /* ---------------------------------------------------------------------- */
  /* Filters                                                                */
  /* ---------------------------------------------------------------------- */

  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },

  filterButton: {
    minHeight: 44,
    paddingLeft: 15,
    paddingRight: 8,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },

  filterButtonInactive: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  filterButtonText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  filterButtonTextActive: {
    color: COLORS.onPrimary,
  },

  filterButtonTextInactive: {
    color: COLORS.onSurfaceVariant,
  },

  filterCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.20)",
  },

  filterCountInactive: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  filterCountText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  filterCountTextActive: {
    color: COLORS.onPrimary,
  },

  filterCountTextInactive: {
    color: COLORS.onSurfaceVariant,
  },

  /* ---------------------------------------------------------------------- */
  /* Alerts                                                                 */
  /* ---------------------------------------------------------------------- */

  alertsStack: {
    gap: 14,
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  alertTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
  },

  alertTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  /* Medication */

  medicationAlert: {
    backgroundColor: COLORS.errorContainer,
    borderRadius: 18,
    padding: 18,
    paddingLeft: 20,
    overflow: "hidden",
    position: "relative",
    gap: 13,
    borderWidth: 1,
    borderColor: "#F4C5C0",
  },

  alertAccentError: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: COLORS.error,
  },

  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD5D0",
    alignItems: "center",
    justifyContent: "center",
  },

  urgentLabel: {
    color: COLORS.error,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  medicationTitle: {
    color: COLORS.onErrorContainer,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
    marginTop: 2,
  },

  unacknowledgedBadge: {
    backgroundColor: "#FFD5D0",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },

  unacknowledgedText: {
    color: COLORS.error,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  medicationDescription: {
    color: COLORS.onErrorContainer,
    fontSize: 15,
    lineHeight: 22,
  },

  /* Routine */

  routineAlert: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 18,
    padding: 18,
    paddingLeft: 20,
    overflow: "hidden",
    position: "relative",
    gap: 13,
    borderWidth: 1,
    borderColor: "#B9DDF4",
  },

  alertAccentBlue: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: COLORS.secondary,
  },

  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  routineLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  routineTitle: {
    color: COLORS.onSecondaryContainer,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
    marginTop: 2,
  },

  cupsBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },

  cupsBadgeText: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  routineDescription: {
    color: COLORS.onSecondaryContainer,
    fontSize: 15,
    lineHeight: 22,
  },

  /* Cognitive */

  deviceAlert: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    paddingLeft: 20,
    overflow: "hidden",
    position: "relative",
    gap: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  alertAccentGreen: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: COLORS.primary,
  },

  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  deviceLabel: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  deviceTitle: {
    color: COLORS.onSurface,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
    marginTop: 2,
  },

  pendingBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },

  pendingBadgeText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  deviceDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
  },

  /* ---------------------------------------------------------------------- */
  /* Buttons                                                                */
  /* ---------------------------------------------------------------------- */

  alertButtonsRow: {
    gap: 9,
  },

  primaryAlertButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryAlertButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  processingButton: {
    opacity: 0.72,
  },

  secondaryAlertButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  secondaryAlertButtonText: {
    color: COLORS.onSurface,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  /* ---------------------------------------------------------------------- */
  /* Empty State                                                            */
  /* ---------------------------------------------------------------------- */

  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.onSurface,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "700",
    marginTop: 13,
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 5,
  },

  /* ---------------------------------------------------------------------- */
  /* Resolved                                                               */
  /* ---------------------------------------------------------------------- */

  resolvedHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 2,
  },

  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },

  resolvedTitle: {
    color: COLORS.onSurface,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    marginTop: 1,
  },

  resolvedCountBadge: {
    backgroundColor: COLORS.greenSoft,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  resolvedCount: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  resolvedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  resolvedIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  resolvedText: {
    flex: 1,
  },

  resolvedItemTitle: {
    color: COLORS.onSurface,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  resolvedDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  /* ---------------------------------------------------------------------- */
  /* Disclaimer                                                             */
  /* ---------------------------------------------------------------------- */

  disclaimer: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 2,
  },

  disclaimerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  disclaimerTextContainer: {
    flex: 1,
  },

  disclaimerTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    marginBottom: 2,
  },

  disclaimerText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },

  /* ---------------------------------------------------------------------- */
  /* Toast                                                                  */
  /* ---------------------------------------------------------------------- */

  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    maxWidth: 520,
    alignSelf: "center",
    zIndex: 100,
    backgroundColor: COLORS.inverseSurface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  toastText: {
    flex: 1,
    color: COLORS.inverseOnSurface,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  /* ---------------------------------------------------------------------- */
  /* Bottom Navigation                                                      */
  /* ---------------------------------------------------------------------- */

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 76,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    zIndex: 50,
  },

  navItem: {
    minWidth: 58,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  navIconContainer: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainerActive: {
    backgroundColor: COLORS.greenSoft,
  },

  navLabel: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  navLabelInactive: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },

  navIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },

  /* ---------------------------------------------------------------------- */
  /* Pressed                                                                */
  /* ---------------------------------------------------------------------- */

  pressed: {
    opacity: 0.65,
  },
});