import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  getLocalCognitiveScores,
  LocalCognitiveScore,
} from "../../database/repositories/gameRepository";
import { syncManager } from "../../services/syncManager";

type CognitiveScoreScreenProps = {
  userId?: string;
  onBack?: () => void;
  onMemoryGame?: () => void;
  onFamilyPhotos?: () => void;
  onStartExercise?: () => void;
};

const COLORS = {
  background: "#FBF9F1",
  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",
  surfaceVariant: "#D9DDD4",

  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",

  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  onSecondaryContainer: "#68472F",

  tertiary: "#A65D43",

  text: "#1B1C17",
  textSecondary: "#565A52",

  outline: "#72766D",
  outlineVariant: "#CDD2C8",
};

const weeklyScores = [
  { day: "Mon", score: 60 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 85 },
  { day: "Thu", score: 82, current: true },
  { day: "Fri", score: 20, muted: true },
  { day: "Sat", score: 20, muted: true },
  { day: "Sun", score: 20, muted: true },
];

export default function CognitiveScoreScreen({
  userId,
  onBack,
  onMemoryGame,
  onFamilyPhotos,
  onStartExercise,
}: CognitiveScoreScreenProps) {
  const [latestScore, setLatestScore] = useState(82);
  const [scoresList, setScoresList] = useState<
    LocalCognitiveScore[]
  >([]);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const targetUserId = userId || "patient_local";

        const scores =
          await getLocalCognitiveScores(targetUserId);

        if (scores && scores.length > 0) {
          setScoresList(scores);
          setLatestScore(scores[0].score);
        }
      } catch (error) {
        console.log(
          "Error loading cognitive scores:",
          error,
        );
      }
    };

    loadScores();

    syncManager.triggerSync().catch(() => {});
  }, [userId]);

  const handleMemoryGame = () => {
    if (onMemoryGame) {
      onMemoryGame();
      return;
    }

    Alert.alert(
      "Memory Game",
      "The memory game is not available right now.",
    );
  };

  const handleFamilyPhotos = () => {
    if (onFamilyPhotos) {
      onFamilyPhotos();
      return;
    }

    Alert.alert(
      "Family Photos",
      "Family photos are not available right now.",
    );
  };

  const handleExercise = () => {
    if (onStartExercise) {
      onStartExercise();
      return;
    }

    Alert.alert(
      "Daily Exercise",
      "Daily exercise is not available right now.",
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back to home"
          >
            <Ionicons
              name="arrow-back"
              size={29}
              color={COLORS.primary}
            />

            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Cognitive Score
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Title */}
          <Text style={styles.pageTitle}>
            Your Cognitive Progress
          </Text>

          <Text style={styles.pageSubtitle}>
            A simple view of your recent mental exercise progress.
          </Text>

          {/* Score card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreHeading}>
              Doing Great!
            </Text>

            <Text style={styles.scoreDescription}>
              Your mind is active and engaged today.
            </Text>

            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeOuter}>
                <View style={styles.gaugeProgress} />

                <View style={styles.gaugeInner}>
                  <Text style={styles.scoreNumber}>
                    {latestScore}
                  </Text>

                  <Text style={styles.scoreOutOf}>
                    / 100
                  </Text>
                </View>
              </View>
            </View>

            {scoresList.length > 0 ? (
              <Text style={styles.updatedText}>
                Based on your latest recorded exercise
              </Text>
            ) : null}
          </View>

          {/* Weekly progress */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Weekly Progress
            </Text>

            <View style={styles.chart}>
              {weeklyScores.map((item) => (
                <View
                  key={item.day}
                  style={styles.barColumn}
                >
                  <View style={styles.barArea}>
                    {item.current ? (
                      <View style={styles.scoreTooltip}>
                        <Text style={styles.tooltipText}>
                          {latestScore}
                        </Text>
                      </View>
                    ) : null}

                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${item.score}%`,
                        },
                        item.current &&
                          styles.currentBar,
                        item.muted &&
                          styles.mutedBar,
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.dayLabel,
                      item.current &&
                        styles.currentDayLabel,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Insights */}
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>
              Daily Insights
            </Text>

            <Pressable
              onPress={handleMemoryGame}
              style={({ pressed }) => [
                styles.insightCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Try a Memory Game"
            >
              <View style={styles.greenInsightIcon}>
                <MaterialIcons
                  name="extension"
                  size={27}
                  color={COLORS.onPrimaryContainer}
                />
              </View>

              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>
                  Try a Memory Game
                </Text>

                <Text style={styles.insightDescription}>
                  A quick 5-minute puzzle to boost focus.
                </Text>
              </View>

              <MaterialIcons
                name="chevron-right"
                size={29}
                color={COLORS.outline}
              />
            </Pressable>

            <Pressable
              onPress={handleFamilyPhotos}
              style={({ pressed }) => [
                styles.insightCard,
                pressed && styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="View Family Photos"
            >
              <View style={styles.photoInsightIcon}>
                <MaterialIcons
                  name="auto-stories"
                  size={27}
                  color={COLORS.onSecondaryContainer}
                />
              </View>

              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>
                  View Family Photos
                </Text>

                <Text style={styles.insightDescription}>
                  Look at recent pictures shared by your family.
                </Text>
              </View>

              <MaterialIcons
                name="chevron-right"
                size={29}
                color={COLORS.outline}
              />
            </Pressable>
          </View>

          {/* Exercise */}
          <Pressable
            onPress={handleExercise}
            style={({ pressed }) => [
              styles.exerciseButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Start Daily Exercise"
          >
            <MaterialIcons
              name="play-arrow"
              size={28}
              color={COLORS.onPrimary}
            />

            <Text style={styles.exerciseButtonText}>
              Start Daily Exercise
            </Text>
          </Pressable>
        </ScrollView>
      </View>
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
    minHeight: 76,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    minWidth: 110,
    minHeight: 54,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  backText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  headerTitle: {
    flex: 1,
    marginLeft: 14,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "800",
    color: COLORS.text,
  },

  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 35,
  },

  pageTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: COLORS.text,
  },

  pageSubtitle: {
    marginTop: 5,
    marginBottom: 17,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },

  scoreCard: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
  },

  scoreHeading: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },

  scoreDescription: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  gaugeContainer: {
    width: 220,
    height: 220,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  gaugeOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 15,
    borderColor: COLORS.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  gaugeProgress: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 15,
    borderColor: COLORS.primary,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },

  gaugeInner: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreNumber: {
    fontSize: 47,
    lineHeight: 55,
    fontWeight: "900",
    color: COLORS.primary,
  },

  scoreOutOf: {
    marginTop: 1,
    fontSize: 17,
    color: COLORS.textSecondary,
  },

  updatedText: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.secondary,
  },

  card: {
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  sectionTitle: {
    marginBottom: 19,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: COLORS.text,
  },

  chart: {
    height: 190,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },

  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  barArea: {
    width: "100%",
    height: 145,
    justifyContent: "flex-end",
    position: "relative",
  },

  bar: {
    width: "100%",
    minHeight: 10,
    backgroundColor: COLORS.surfaceVariant,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  currentBar: {
    backgroundColor: COLORS.primary,
  },

  mutedBar: {
    opacity: 0.55,
  },

  scoreTooltip: {
    position: "absolute",
    top: -2,
    alignSelf: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },

  tooltipText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.surface,
  },

  dayLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  currentDayLabel: {
    color: COLORS.primary,
  },

  insightsSection: {
    marginTop: 20,
  },

  insightCard: {
    minHeight: 100,
    marginBottom: 12,
    padding: 15,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  greenInsightIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  photoInsightIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  insightText: {
    flex: 1,
    marginHorizontal: 13,
  },

  insightTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: COLORS.text,
  },

  insightDescription: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  exerciseButton: {
    minHeight: 60,
    marginTop: 7,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  exerciseButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  cardPressed: {
    backgroundColor: COLORS.surfaceLow,
  },
});