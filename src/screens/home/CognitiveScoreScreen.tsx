import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type CognitiveScoreScreenProps = {
  onBack?: () => void;
  onMemoryGame?: () => void;
  onFamilyPhotos?: () => void;
  onStartExercise?: () => void;
};

const weeklyScores = [
  { day: 'Mon', score: 60 },
  { day: 'Tue', score: 75 },
  { day: 'Wed', score: 85 },
  { day: 'Thu', score: 82, current: true },
  { day: 'Fri', score: 20, muted: true },
  { day: 'Sat', score: 20, muted: true },
  { day: 'Sun', score: 20, muted: true },
];

export default function CognitiveScoreScreen({
  onBack,
  onMemoryGame,
  onFamilyPhotos,
  onStartExercise,
}: CognitiveScoreScreenProps) {
  const handleMemoryGame = () => {
    if (onMemoryGame) {
      onMemoryGame();
      return;
    }

    Alert.alert(
      'Memory Game',
      'The memory game will be connected next.'
    );
  };

  const handleFamilyPhotos = () => {
    if (onFamilyPhotos) {
      onFamilyPhotos();
      return;
    }

    Alert.alert(
      'Family Photos',
      'Family photos will be connected next.'
    );
  };

  const handleExercise = () => {
    if (onStartExercise) {
      onStartExercise();
      return;
    }

    Alert.alert(
      'Daily Exercise',
      'Daily exercise will be connected next.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color="#00450D"
            />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SmritiCare</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>Cognitive Score</Text>

          {/* Score Gauge */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreIntro}>
              <Text style={styles.scoreHeading}>
                Doing Great, Aita!
              </Text>
              <Text style={styles.scoreDescription}>
                Your mind is active and engaged today.
              </Text>
            </View>

            <View style={styles.gaugeContainer}>
              <View style={styles.gauge}>
                <View
                  style={[
                    styles.gaugeProgress,
                    {
                      transform: [
                        { rotate: '-90deg' },
                      ],
                    },
                  ]}
                />
                <View style={styles.gaugeCenter}>
                  <Text style={styles.scoreNumber}>82</Text>
                  <Text style={styles.scoreOutOf}>/ 100</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyCard}>
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
                    {item.current && (
                      <View style={styles.scoreTooltip}>
                        <Text style={styles.tooltipText}>
                          82
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${item.score}%`,
                        },
                        item.current && styles.currentBar,
                        item.muted && styles.mutedBar,
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.dayLabel,
                      item.current && styles.currentDayLabel,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Daily Insights */}
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
                  size={26}
                  color="#90D689"
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
                size={28}
                color="#41493E"
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
              <View style={styles.blueInsightIcon}>
                <MaterialIcons
                  name="auto-stories"
                  size={26}
                  color="#004470"
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
                size={28}
                color="#41493E"
              />
            </Pressable>
          </View>

          {/* Start Daily Exercise */}
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
              size={27}
              color="#FFFFFF"
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
    backgroundColor: '#F4FAFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4FAFF',
  },

  // Header
  header: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: '#F4FAFF',
    borderBottomWidth: 2,
    borderBottomColor: '#C0C9BB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  backText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#00450D',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: '#00450D',
  },
  headerSpacer: {
    width: 72,
  },

  // Main
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  pageTitle: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    color: '#111D23',
    marginBottom: 16,
  },

  // Score
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    padding: 24,
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  scoreIntro: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreHeading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#00450D',
    textAlign: 'center',
  },
  scoreDescription: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
    textAlign: 'center',
  },
  gaugeContainer: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  gauge: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 15,
    borderColor: '#DDEAF2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gaugeProgress: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 15,
    borderColor: '#00450D',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transformOrigin: 'center',
  },
  gaugeCenter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 46,
    lineHeight: 54,
    fontWeight: '700',
    color: '#00450D',
  },
  scoreOutOf: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
  },

  // Weekly progress
  weeklyCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    padding: 24,
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#111D23',
    marginBottom: 22,
  },
  chart: {
    height: 190,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barArea: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '100%',
    backgroundColor: '#DDEAF2',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  currentBar: {
    backgroundColor: '#00450D',
  },
  mutedBar: {
    opacity: 0.5,
  },
  scoreTooltip: {
    position: 'absolute',
    top: -2,
    alignSelf: 'center',
    backgroundColor: '#263238',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    zIndex: 2,
  },
  tooltipText: {
    fontSize: 14,
    color: '#E6F3FB',
    fontWeight: '400',
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
  },
  currentDayLabel: {
    color: '#00450D',
    fontWeight: '700',
  },

  // Insights
  insightsSection: {
    marginTop: 16,
  },
  insightCard: {
    minHeight: 100,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  greenInsightIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  blueInsightIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#62B4FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
    color: '#111D23',
  },
  insightDescription: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
  },

  // Exercise
  exerciseButton: {
    minHeight: 60,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  exerciseButtonText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.78,
  },
  cardPressed: {
    backgroundColor: '#DDEAF2',
  },
});
