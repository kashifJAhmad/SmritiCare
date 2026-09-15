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
  background: "#FBF9F1",
  surface: "#FFFFFF",

  surfaceLow: "#F1F0E7",
  surfaceVariant: "#DDDCD3",
  surfaceHigh: "#E8E8DE",

  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",

  primarySoft: "#E2EDE0",
  primarySoftBorder: "#C5D8C0",

  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  onSecondaryContainer: "#68472F",

  tertiary: "#A65D43",
  tertiaryContainer: "#E7C9B9",

  error: "#9B3F32",
  errorContainer: "#F4DDD8",
  onErrorContainer: "#7F2F27",

  warning: "#8A6040",
  warningContainer: "#F4E7D7",

  onSurface: "#1B1C17",
  onSurfaceVariant: "#565A52",

  outline: "#72766D",
  outlineVariant: "#CDD2C8",

  muted: "#74786F",

  inverseSurface: "#293029",
  inverseOnSurface: "#F4F5EE",
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type AlertCategory =
  | "medication"
  | "routine"
  | "general";

type AlertItem = {
  id: string;
  category: AlertCategory;
  label: string;
  title: string;
  description: string;
  icon: MaterialIconName;
};

type CaregiverAlertsScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onSchedule?: () => void;
  onAlerts?: () => void;
  onProfile?: () => void;
};

const PLACEHOLDER_ALERTS: AlertItem[] = [
  {
    id: "placeholder-medication",
    category: "medication",
    label: "Medication",
    title: "Medication alert will appear here",
    description:
      "When a connected patient's medication reminder needs attention, the alert details will be shown here.",
    icon: "medication",
  },
  {
    id: "placeholder-routine",
    category: "routine",
    label: "Routine",
    title: "Routine alert will appear here",
    description:
      "Daily routine events such as missed reminders or follow-ups will appear in this section.",
    icon: "event-note",
  },
  {
    id: "placeholder-general",
    category: "general",
    label: "General",
    title: "Patient activity alert will appear here",
    description:
      "Important patient activity and care-related notifications will appear here when the alert system is connected.",
    icon: "notifications-active",
  },
];

const FILTERS = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "medication",
    label: "Medication",
  },
  {
    key: "routine",
    label: "Routine",
  },
  {
    key: "general",
    label: "General",
  },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function CaregiverAlertsScreen({
  onBack,
  onHome,
  onSchedule,
  onAlerts,
  onProfile,
}: CaregiverAlertsScreenProps) {
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] =
    useState<FilterKey>("all");

  const [acknowledged, setAcknowledged] =
    useState<string[]>([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const [processingAlert, setProcessingAlert] =
    useState<string | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const visibleAlerts = useMemo(() => {
    return PLACEHOLDER_ALERTS.filter((alert) => {
      if (acknowledged.includes(alert.id)) {
        return false;
      }

      if (selectedFilter === "all") {
        return true;
      }

      return alert.category === selectedFilter;
    });
  }, [selectedFilter, acknowledged]);

  const handleRefresh = () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
      showToast(
        "Alerts will refresh from the care system."
      );
    }, 700);
  };

  const handleAcknowledge = (alertId: string) => {
    setAcknowledged((previous) => [
      ...previous,
      alertId,
    ]);

    showToast("Alert acknowledged.");
  };

  const handleAction = (alertId: string) => {
    if (processingAlert) {
      return;
    }

    setProcessingAlert(alertId);

    setTimeout(() => {
      setProcessingAlert(null);

      showToast(
        "Patient action will be available when alerts are connected."
      );
    }, 800);
  };

  return (
    <View style={styles.screen}>
      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}

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
              styles.headerIconButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={23}
              color={COLORS.onSurface}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.brandName}>
              SmritiCare
            </Text>

            <Text style={styles.brandSubtitle}>
              Caregiver
            </Text>
          </View>

          <View style={styles.headerProfile}>
            <MaterialIcons
              name="person"
              size={19}
              color={COLORS.onPrimary}
            />
          </View>
        </View>
      </View>

      {/* ============================================================ */}
      {/* CONTENT                                                        */}
      {/* ============================================================ */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 78,
            paddingBottom: insets.bottom + 108,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================== */}
        {/* PAGE INTRO                                                   */}
        {/* ========================================================== */}

        <View style={styles.introRow}>
          <View style={styles.introText}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />

              <Text style={styles.eyebrow}>
                CAREGIVER ALERTS
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Alerts
            </Text>

            <Text style={styles.pageSubtitle}>
              Important updates about the people you care for,
              all in one place.
            </Text>
          </View>

          <Pressable
            onPress={handleRefresh}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Refresh alerts"
          >
            <MaterialIcons
              name={
                refreshing
                  ? "sync"
                  : "refresh"
              }
              size={22}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        {/* ========================================================== */}
        {/* OVERVIEW CARD                                                */}
        {/* ========================================================== */}

        <View style={styles.overviewCard}>
          <View style={styles.overviewIcon}>
            <MaterialIcons
              name="notifications-active"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>
              {visibleAlerts.length} active{" "}
              {visibleAlerts.length === 1
                ? "alert"
                : "alerts"}
            </Text>

            <Text style={styles.overviewText}>
              Review important updates and respond when
              your attention is needed.
            </Text>
          </View>

          <View style={styles.overviewStatus}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              Ready
            </Text>
          </View>
        </View>

        {/* ========================================================== */}
        {/* PATIENT PLACEHOLDER                                         */}
        {/* ========================================================== */}

        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <MaterialIcons
              name="person"
              size={27}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>
              CONNECTED PATIENT
            </Text>

            <Text style={styles.patientPlaceholder}>
              Patient information
            </Text>

            <Text style={styles.patientHint}>
              Connected patient details will appear here.
            </Text>
          </View>

          <View style={styles.connectedBadge}>
            <MaterialIcons
              name="link"
              size={15}
              color={COLORS.primary}
            />

            <Text style={styles.connectedText}>
              Connected
            </Text>
          </View>
        </View>

        {/* ========================================================== */}
        {/* FILTERS                                                      */}
        {/* ========================================================== */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              ALERT TYPES
            </Text>

            <Text style={styles.sectionTitle}>
              Filter alerts
            </Text>
          </View>
        </View>

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
                    styles.filterText,
                    active
                      ? styles.filterTextActive
                      : styles.filterTextInactive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ========================================================== */}
        {/* ALERT LIST                                                   */}
        {/* ========================================================== */}

        <View style={styles.alertList}>
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              processing={
                processingAlert === alert.id
              }
              onAction={() =>
                handleAction(alert.id)
              }
              onAcknowledge={() =>
                handleAcknowledge(alert.id)
              }
            />
          ))}
        </View>

        {/* ========================================================== */}
        {/* EMPTY STATE                                                  */}
        {/* ========================================================== */}

        {visibleAlerts.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialIcons
                name="check-circle"
                size={40}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              You're all caught up
            </Text>

            <Text style={styles.emptyText}>
              There are no active alerts in this category.
            </Text>
          </View>
        )}

        {/* ========================================================== */}
        {/* FUTURE SYSTEM PLACEHOLDER                                    */}
        {/* ========================================================== */}

        <View style={styles.systemCard}>
          <View style={styles.systemIcon}>
            <MaterialIcons
              name="auto-awesome"
              size={22}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.systemContent}>
            <Text style={styles.systemTitle}>
              Smart alert system
            </Text>

            <Text style={styles.systemText}>
              Real patient alerts, reminder status,
              acknowledgement history and care updates
              will appear here once the alert service is connected.
            </Text>

            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>
                SYSTEM PLACEHOLDER
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================== */}
        {/* CAREGIVER NOTE                                               */}
        {/* ========================================================== */}

        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <MaterialIcons
              name="shield"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              Caregiver support
            </Text>

            <Text style={styles.noteText}>
              Alerts are intended to help coordinate everyday
              care. They are not a replacement for professional
              medical advice or emergency services.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ============================================================ */}
      {/* TOAST                                                         */}
      {/* ============================================================ */}

      {toastMessage && (
        <View
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 88,
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

      {/* ============================================================ */}
      {/* BOTTOM NAVIGATION                                             */}
      {/* ============================================================ */}

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
          icon="notifications-active"
          label="Remind"
          onPress={onSchedule}
        />

        <BottomNavItem
          icon="warning"
          label="Alerts"
          active
          onPress={onAlerts}
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
/* ALERT CARD                                                                 */
/* ========================================================================== */

type AlertCardProps = {
  alert: AlertItem;
  processing: boolean;
  onAction: () => void;
  onAcknowledge: () => void;
};

function AlertCard({
  alert,
  processing,
  onAction,
  onAcknowledge,
}: AlertCardProps) {
  const isMedication =
    alert.category === "medication";

  const isRoutine =
    alert.category === "routine";

  const accentColor = isMedication
    ? COLORS.error
    : isRoutine
      ? COLORS.secondary
      : COLORS.primary;

  const iconBackground = isMedication
    ? COLORS.errorContainer
    : isRoutine
      ? COLORS.secondaryContainer
      : COLORS.primarySoft;

  const titleColor = isMedication
    ? COLORS.onErrorContainer
    : isRoutine
      ? COLORS.onSecondaryContainer
      : COLORS.onSurface;

  return (
    <View style={styles.alertCard}>
      {/* Accent */}
      <View
        style={[
          styles.alertAccent,
          {
            backgroundColor: accentColor,
          },
        ]}
      />

      <View style={styles.alertCardContent}>
        {/* Header */}

        <View style={styles.alertHeader}>
          <View style={styles.alertHeaderLeft}>
            <View
              style={[
                styles.alertIcon,
                {
                  backgroundColor: iconBackground,
                },
              ]}
            >
              <MaterialIcons
                name={alert.icon}
                size={22}
                color={accentColor}
              />
            </View>

            <View style={styles.alertHeading}>
              <Text
                style={[
                  styles.alertCategory,
                  {
                    color: accentColor,
                  },
                ]}
              >
                {alert.label.toUpperCase()}
              </Text>

              <Text
                style={[
                  styles.alertTitle,
                  {
                    color: titleColor,
                  },
                ]}
              >
                {alert.title}
              </Text>
            </View>
          </View>

          <View style={styles.placeholderBadge}>
            <Text style={styles.placeholderBadgeText}>
              PLACEHOLDER
            </Text>
          </View>
        </View>

        {/* Description */}

        <Text
          style={[
            styles.alertDescription,
            {
              color: isMedication
                ? COLORS.onErrorContainer
                : isRoutine
                  ? COLORS.onSecondaryContainer
                  : COLORS.onSurfaceVariant,
            },
          ]}
        >
          {alert.description}
        </Text>

        {/* Actions */}

        <View style={styles.alertActions}>
          <Pressable
            onPress={onAction}
            disabled={processing}
            style={({ pressed }) => [
              styles.mainAction,
              {
                backgroundColor: COLORS.primary,
              },
              processing &&
                styles.processingButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={
                processing
                  ? "sync"
                  : "notifications-active"
              }
              size={19}
              color={COLORS.onPrimary}
            />

            <Text style={styles.mainActionText}>
              {processing
                ? "Processing..."
                : "Take Action"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onAcknowledge}
            disabled={processing}
            style={({ pressed }) => [
              styles.acknowledgeButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name="check"
              size={19}
              color={COLORS.primary}
            />

            <Text style={styles.acknowledgeText}>
              Acknowledge
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* BOTTOM NAVIGATION                                                          */
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
          active &&
            styles.navIconContainerActive,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={22}
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
/* STYLES                                                                     */
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
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    color: COLORS.primary,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  brandSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },

  headerProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------------------------------------------------------------------- */
  /* Content                                                                */
  /* ---------------------------------------------------------------------- */

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    gap: 15,
  },

  /* ---------------------------------------------------------------------- */
  /* Intro                                                                  */
  /* ---------------------------------------------------------------------- */

  introRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  introText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },

  pageTitle: {
    color: COLORS.onSurface,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: 3,
  },

  pageSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
    maxWidth: 380,
  },

  refreshButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  /* ---------------------------------------------------------------------- */
  /* Overview                                                               */
  /* ---------------------------------------------------------------------- */

  overviewCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.onPrimaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  overviewContent: {
    flex: 1,
  },

  overviewTitle: {
    color: COLORS.onPrimary,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },

  overviewText: {
    color: COLORS.onPrimaryContainer,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  overviewStatus: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.onPrimaryContainer,
  },

  liveText: {
    color: COLORS.onPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  /* ---------------------------------------------------------------------- */
  /* Patient                                                                */
  /* ---------------------------------------------------------------------- */

  patientCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  patientInfo: {
    flex: 1,
    minWidth: 0,
  },

  patientLabel: {
    color: COLORS.primary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.9,
  },

  patientPlaceholder: {
    color: COLORS.onSurface,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    marginTop: 2,
  },

  patientHint: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },

  connectedBadge: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primarySoftBorder,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  connectedText: {
    color: COLORS.primary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },

  /* ---------------------------------------------------------------------- */
  /* Section                                                                */
  /* ---------------------------------------------------------------------- */

  sectionHeader: {
    marginTop: 2,
  },

  sectionEyebrow: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },

  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginTop: 1,
  },

  /* ---------------------------------------------------------------------- */
  /* Filters                                                                */
  /* ---------------------------------------------------------------------- */

  filterRow: {
    gap: 8,
    paddingVertical: 1,
  },

  filterButton: {
    minHeight: 42,
    paddingHorizontal: 17,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },

  filterButtonInactive: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  filterText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  filterTextActive: {
    color: COLORS.onPrimary,
  },

  filterTextInactive: {
    color: COLORS.onSurfaceVariant,
  },

  /* ---------------------------------------------------------------------- */
  /* Alert List                                                             */
  /* ---------------------------------------------------------------------- */

  alertList: {
    gap: 13,
  },

  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  alertAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },

  alertCardContent: {
    padding: 17,
    paddingLeft: 20,
    gap: 13,
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 9,
  },

  alertHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    minWidth: 0,
  },

  alertIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  alertHeading: {
    flex: 1,
    minWidth: 0,
  },

  alertCategory: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  alertTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    marginTop: 2,
  },

  placeholderBadge: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  placeholderBadgeText: {
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  alertDescription: {
    fontSize: 14,
    lineHeight: 21,
  },

  /* ---------------------------------------------------------------------- */
  /* Alert Actions                                                          */
  /* ---------------------------------------------------------------------- */

  alertActions: {
    gap: 8,
  },

  mainAction: {
    minHeight: 49,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mainActionText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },

  acknowledgeButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  acknowledgeText: {
    color: COLORS.primary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  processingButton: {
    opacity: 0.65,
  },

  /* ---------------------------------------------------------------------- */
  /* Empty                                                                  */
  /* ---------------------------------------------------------------------- */

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.onSurface,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 4,
  },

  /* ---------------------------------------------------------------------- */
  /* System Placeholder                                                     */
  /* ---------------------------------------------------------------------- */

  systemCard: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 19,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  systemIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  systemContent: {
    flex: 1,
  },

  systemTitle: {
    color: COLORS.onSecondaryContainer,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  systemText: {
    color: COLORS.onSecondaryContainer,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  comingSoonBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },

  comingSoonText: {
    color: COLORS.secondary,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  /* ---------------------------------------------------------------------- */
  /* Note                                                                   */
  /* ---------------------------------------------------------------------- */

  noteCard: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  noteIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },

  noteText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
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
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
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
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 76,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    zIndex: 50,
  },

  navItem: {
    minWidth: 65,
    minHeight: 61,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  navIconContainer: {
    width: 43,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainerActive: {
    backgroundColor: COLORS.primarySoft,
  },

  navLabel: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  navLabelInactive: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  navIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },

  /* ---------------------------------------------------------------------- */
  /* Interaction                                                            */
  /* ---------------------------------------------------------------------- */

  pressed: {
    opacity: 0.65,
  },
});