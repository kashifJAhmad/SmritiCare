import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  background: "#F4FAFF",

  primary: "#00450D",
  primaryContainer: "#1B5E20",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#90D689",

  secondary: "#00629E",
  secondaryContainer: "#D7EEFF",
  secondaryFixed: "#D9E6DA",
  onSecondaryFixed: "#131E17",

  surface: "#FFFFFF",
  surfaceContainer: "#EAF3F7",
  surfaceContainerLow: "#E9F6FD",
  surfaceContainerHigh: "#E2EEF4",

  greenSoft: "#E2F3E0",
  greenBorder: "#B7DDB3",

  onSurface: "#111D23",
  onSurfaceVariant: "#41493E",
  outline: "#717A6D",
  outlineVariant: "#C0C9BB",

  error: "#BA1A1A",
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type CognitiveProgressScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
  onActivityHistory?: () => void;
  onDownloadSummary?: () => void;
};

type Category = {
  title: string;
  score: number;
  icon: MaterialIconName;
  description: string;
};

const categories: Category[] = [
  {
    title: "Memory",
    score: 82,
    icon: "psychology",
    description:
      "Consistent recall of family members & daily tea routine.",
  },
  {
    title: "Attention / Concentration",
    score: 76,
    icon: "center-focus-strong",
    description:
      "Good focus during morning card match sessions.",
  },
  {
    title: "Pattern Recognition",
    score: 88,
    icon: "grid-view",
    description:
      "High accuracy in identifying traditional Assamese textile patterns.",
  },
  {
    title: "Object Recognition",
    score: 84,
    icon: "category",
    description:
      "Prompt recognition of household items like bell-metal utensils and hand fans.",
  },
  {
    title: "Routine Recall",
    score: 75,
    icon: "schedule",
    description:
      "Improving morning sequence recall with warm audio cues.",
  },
];

const filterOptions = ["7 Days", "30 Days", "All-Time"];

export default function CognitiveProgressScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
  onActivityHistory,
  onDownloadSummary,
}: CognitiveProgressScreenProps) {
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] =
    useState("7 Days");

  const handleHistory = () => {
    if (onActivityHistory) {
      onActivityHistory();
    } else {
      Alert.alert(
        "Activity History",
        "Activity history will be available here."
      );
    }
  };

  const handleDownload = () => {
    if (onDownloadSummary) {
      onDownloadSummary();
    } else {
      Alert.alert(
        "Care Summary",
        "Care summary download will be connected by the backend integration."
      );
    }
  };

  return (
    <View style={styles.screen}>
      {/* ================================================================ */}
      {/* Header                                                           */}
      {/* ================================================================ */}

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

      {/* ================================================================ */}
      {/* Main Content                                                     */}
      {/* ================================================================ */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 80,
            paddingBottom: insets.bottom + 115,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Context */}

        <View style={styles.patientStrip}>
          <View style={styles.patientInfo}>
            <View style={styles.patientIconCircle}>
              <MaterialIcons
                name="elderly"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.patientTextContainer}>
              <Text
                style={styles.patientName}
                numberOfLines={1}
              >
                Ramani Barman
              </Text>

              <View style={styles.performanceRow}>
                <View style={styles.performanceDot} />

                <Text style={styles.performanceText}>
                  72 years • 7-Day Performance
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.patientStatusIcon}>
            <MaterialIcons
              name="monitor-heart"
              size={23}
              color={COLORS.secondary}
            />
          </View>
        </View>

        {/* Page Title */}

        <View style={styles.titleSection}>
          <View style={styles.headingLabelRow}>
            <View style={styles.headingDot} />

            <Text style={styles.headingLabel}>
              PATIENT INSIGHTS
            </Text>
          </View>

          <Text style={styles.mainTitle}>
            Cognitive Progress & Insights
          </Text>

          <Text style={styles.subtitle}>
            Gentle daily tracking across culturally rooted
            engagement games.
          </Text>
        </View>

        {/* ============================================================ */}
        {/* Filters                                                       */}
        {/* ============================================================ */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterOptions.map((filter) => {
            const isSelected =
              selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() =>
                  setSelectedFilter(filter)
                }
                style={({ pressed }) => [
                  styles.filterPill,
                  isSelected
                    ? styles.filterPillSelected
                    : styles.filterPillUnselected,
                  pressed && styles.pressed,
                ]}
              >
                {isSelected && (
                  <MaterialIcons
                    name="check"
                    size={17}
                    color={COLORS.onPrimary}
                  />
                )}

                <Text
                  style={[
                    styles.filterText,
                    isSelected
                      ? styles.filterTextSelected
                      : styles.filterTextUnselected,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ============================================================ */}
        {/* Overall Score                                                */}
        {/* ============================================================ */}

        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreHeading}>
              <Text style={styles.scoreLabel}>
                OVERALL ENGAGEMENT
              </Text>

              <Text style={styles.scoreCardTitle}>
                Cognitive Score
              </Text>
            </View>

            <View style={styles.trendBadge}>
              <MaterialIcons
                name="trending-up"
                size={17}
                color={COLORS.primary}
              />

              <Text style={styles.trendText}>
                +4%
              </Text>
            </View>
          </View>

          <View style={styles.scoreMainRow}>
            {/* Score Circle */}

            <View style={styles.progressCircle}>
              <View style={styles.progressTrack} />

              <View
                style={[
                  styles.progressValue,
                  {
                    transform: [
                      {
                        rotate: `${(82 / 100) * 360}deg`,
                      },
                    ],
                  },
                ]}
              />

              <View style={styles.progressInner}>
                <Text style={styles.scoreNumber}>
                  82
                </Text>

                <Text style={styles.scoreOutOf}>
                  / 100
                </Text>
              </View>
            </View>

            {/* Description */}

            <View style={styles.scoreDescription}>
              <View style={styles.doingGreatRow}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.primary}
                />

                <Text style={styles.doingGreat}>
                  Doing Great
                </Text>
              </View>

              <Text style={styles.descriptionText}>
                Memory & attention scores are stable and
                responsive during routine hours.
              </Text>

              <Text style={styles.weekComparison}>
                4% higher than last week
              </Text>
            </View>
          </View>

          {/* Context Banner */}

          <View style={styles.contextBanner}>
            <View style={styles.contextIcon}>
              <MaterialIcons
                name="landscape"
                size={32}
                color={COLORS.onPrimaryContainer}
              />
            </View>

            <View style={styles.contextContent}>
              <Text style={styles.contextLabel}>
                CARE INSIGHT
              </Text>

              <Text style={styles.contextText}>
                Active play during calm morning hours
                strengthens daily recall.
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================================ */}
        {/* Category Breakdown                                            */}
        {/* ============================================================ */}

        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                PERFORMANCE
              </Text>

              <Text style={styles.sectionTitle}>
                Category Breakdown
              </Text>
            </View>

            <View style={styles.focusBadge}>
              <Text style={styles.focusAreas}>
                5 areas
              </Text>
            </View>
          </View>

          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              category={category}
            />
          ))}
        </View>

        {/* ============================================================ */}
        {/* AI Adaptive Difficulty                                        */}
        {/* ============================================================ */}

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTitleRow}>
              <View style={styles.aiIcon}>
                <MaterialIcons
                  name="smart-toy"
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.aiTitleContainer}>
                <Text style={styles.aiLabel}>
                  PERSONALIZED SUPPORT
                </Text>

                <Text style={styles.aiTitle}>
                  AI Adaptive Difficulty
                </Text>
              </View>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeBadgeDot} />

              <Text style={styles.activeBadgeText}>
                Active
              </Text>
            </View>
          </View>

          {/* Level Matrix */}

          <View style={styles.levelRow}>
            <View style={styles.levelCard}>
              <Text style={styles.levelLabel}>
                CURRENT LEVEL
              </Text>

              <Text style={styles.levelNumber}>
                Level 3
              </Text>

              <Text style={styles.levelDescription}>
                Moderate challenge
              </Text>
            </View>

            <View style={styles.levelCard}>
              <Text style={styles.levelLabel}>
                RECOMMENDED
              </Text>

              <Text
                style={[
                  styles.levelNumber,
                  styles.recommendedLevel,
                ]}
              >
                Level 3
              </Text>

              <Text style={styles.levelDescription}>
                Maintain current pace
              </Text>
            </View>
          </View>

          {/* AI Insights */}

          <View style={styles.insightsBox}>
            <View style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <MaterialIcons
                  name="insights"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.insightText}>
                Difficulty is automatically adapted based
                on recent accuracy (
                <Text style={styles.boldText}>
                  84% avg
                </Text>
                ) and response time (
                <Text style={styles.boldText}>
                  4.2s
                </Text>
                ).
              </Text>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <MaterialIcons
                  name="recommend"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.secondaryInsightText}>
                <Text style={styles.boldText}>
                  Recommendation:
                </Text>{" "}
                Continue Level 3 Memory activities.
                Patient maintains stable confidence.
              </Text>
            </View>

            <Text style={styles.nonDiagnosticText}>
              Non-diagnostic cognitive engagement insight.
            </Text>
          </View>
        </View>

        {/* ============================================================ */}
        {/* CTA Buttons                                                   */}
        {/* ============================================================ */}

        <View style={styles.ctaSection}>
          <Pressable
            onPress={handleHistory}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialIcons
              name="history"
              size={23}
              color={COLORS.onPrimary}
            />

            <Text style={styles.primaryButtonText}>
              View Activity History
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialIcons
              name="download"
              size={23}
              color={COLORS.primary}
            />

            <Text style={styles.secondaryButtonText}>
              Download Care Summary
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ================================================================ */}
      {/* Bottom Navigation                                                 */}
      {/* ================================================================ */}

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
          label="Remind"
          onPress={onSchedule}
        />

        <BottomNavItem
          icon="psychology"
          label="Memory"
          active
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
/* Category Card                                                              */
/* ========================================================================== */

function CategoryCard({
  category,
}: {
  category: Category;
}) {
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryTopRow}>
        <View style={styles.categoryTitleRow}>
          <View style={styles.categoryIcon}>
            <MaterialIcons
              name={category.icon}
              size={20}
              color={COLORS.primary}
            />
          </View>

          <Text
            style={styles.categoryTitle}
            numberOfLines={2}
          >
            {category.title}
          </Text>
        </View>

        <Text style={styles.categoryScore}>
          {category.score}%
        </Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${category.score}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.categoryDescription}>
        {category.description}
      </Text>
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
          active &&
            styles.navIconContainerActive,
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

  /* Header */

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: COLORS.background,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },

  headerInner: {
    height: 64,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Main */

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    gap: 20,
  },

  /* Patient Strip */

  patientStrip: {
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  patientInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  patientIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  patientTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  patientName: {
    color: COLORS.onSurface,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },

  performanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  performanceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },

  performanceText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },

  patientStatusIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Title */

  titleSection: {
    gap: 4,
  },

  headingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 2,
  },

  headingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  headingLabel: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  mainTitle: {
    color: COLORS.onSurface,
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },

  /* Filters */

  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },

  filterPill: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  filterPillSelected: {
    backgroundColor: COLORS.primary,
  },

  filterPillUnselected: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  filterText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  filterTextSelected: {
    color: COLORS.onPrimary,
  },

  filterTextUnselected: {
    color: COLORS.onSurfaceVariant,
  },

  /* Score Card */

  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    gap: 17,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  scoreHeading: {
    flex: 1,
  },

  scoreLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.9,
  },

  scoreCardTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    marginTop: 1,
  },

  trendBadge: {
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  trendText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },

  scoreMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 19,
  },

  /* Circle */

  progressCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  progressTrack: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 10,
    borderColor: COLORS.surfaceContainer,
  },

  progressValue: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 10,
    borderColor: COLORS.primary,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },

  progressInner: {
    alignItems: "center",
    justifyContent: "center",
  },

  scoreNumber: {
    color: COLORS.primary,
    fontSize: 29,
    lineHeight: 32,
    fontWeight: "700",
  },

  scoreOutOf: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  scoreDescription: {
    flex: 1,
    gap: 5,
  },

  doingGreatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  doingGreat: {
    color: COLORS.onSurface,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
  },

  descriptionText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },

  weekComparison: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },

  /* Context */

  contextBanner: {
    minHeight: 86,
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: COLORS.primaryContainer,
    flexDirection: "row",
    alignItems: "center",
  },

  contextIcon: {
    width: 78,
    alignItems: "center",
    justifyContent: "center",
  },

  contextContent: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
  },

  contextLabel: {
    color: COLORS.onPrimaryContainer,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  contextText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 2,
  },

  /* Categories */

  categorySection: {
    gap: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.9,
  },

  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "700",
  },

  focusBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  focusAreas: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  categoryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  categoryTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryTitle: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "600",
  },

  categoryScore: {
    color: COLORS.primary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },

  progressBarTrack: {
    width: "100%",
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.surfaceContainer,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  categoryDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },

  /* AI */

  aiCard: {
    backgroundColor: COLORS.secondaryFixed,
    borderRadius: 17,
    padding: 18,
    gap: 15,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  aiTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  aiTitleContainer: {
    flex: 1,
  },

  aiLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  aiTitle: {
    color: COLORS.onSurface,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 1,
  },

  activeBadge: {
    backgroundColor: "#ACF4A4",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  activeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  activeBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  levelRow: {
    flexDirection: "row",
    gap: 10,
  },

  levelCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 11,
    padding: 13,
    gap: 3,
  },

  levelLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  levelNumber: {
    color: COLORS.primary,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
  },

  recommendedLevel: {
    color: COLORS.primaryContainer,
  },

  levelDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },

  insightsBox: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 11,
    padding: 13,
    gap: 12,
  },

  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  insightText: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 13,
    lineHeight: 20,
  },

  secondaryInsightText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
  },

  boldText: {
    color: COLORS.onSurface,
    fontWeight: "700",
  },

  nonDiagnosticText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: "italic",
  },

  /* CTA */

  ctaSection: {
    gap: 10,
    paddingTop: 2,
  },

  primaryButton: {
    minHeight: 55,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 55,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  secondaryButtonText: {
    color: COLORS.onSurface,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  /* Bottom Navigation */

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 80,
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
    minWidth: 56,
    minHeight: 58,
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
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
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

  pressed: {
    opacity: 0.7,
  },
});