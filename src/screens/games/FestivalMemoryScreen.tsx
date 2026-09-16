import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { saveGameResultLocally, saveCognitiveScoreLocally } from '../../database/repositories/gameRepository';
import { syncManager } from '../../services/syncManager';

const COLORS = {
  background: '#FBF9F1',
  surface: '#FFFFFF',
  white: '#FFFFFF',

  surfaceContainer: '#F1F0E7',
  surfaceContainerHigh: '#E7EFE3',
  surfaceContainerLow: '#F8F7EE',

  primary: '#3F6F45',
  primaryContainer: '#315A36',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#D7E7D2',

  secondary: '#8A6040',
  secondaryContainer: '#E9D7C5',

  outline: '#72766D',
  outlineVariant: '#CDD2C8',

  onSurface: '#1B1C17',
  onSurfaceVariant: '#565A52',

  correct: '#E2F3E0',
  correctBorder: '#2E7D32',
  correctText: '#1B5E20',

  wrong: '#FFDAD6',
  wrongBorder: '#BA1A1A',
  wrongText: '#93000A',

  warning: '#FFF3CD',
  warningBorder: '#A86B00',
  warningText: '#704600',
};

type FestivalMemoryScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Level = {
  level: number;
  difficulty: string;
  festivalName: string;
  subtitle: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  options: string[];
  correctIndex: number;
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    festivalName: 'Rongali Bihu (Spring Festival)',
    subtitle: 'Which musical instrument is primarily played to celebrate Rongali Bihu?',
    iconName: 'celebration',
    options: ['Dhol & Pepa (Assam)', 'Piano', 'Synthesizer'],
    correctIndex: 0,
    hint: 'Made from buffalo horn and wooden drums, ringing across fields in spring.',
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    festivalName: 'Durga Puja',
    subtitle: 'What traditional percussion dance is performed during Durga Puja evenings?',
    iconName: 'flare',
    options: ['Dhunuchi Dance & Dhaak', 'Salsa', 'Tap Dance'],
    correctIndex: 0,
    hint: 'Performed with earthen incense burners amidst rhythmic beating of large drums.',
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    festivalName: 'Hornbill Festival',
    subtitle: 'Which state celebrates the grand Hornbill Festival of heritage and unity?',
    iconName: 'sports-kabaddi',
    options: ['Nagaland', 'Gujarat', 'Punjab'],
    correctIndex: 0,
    hint: 'Known as the "Festival of Festivals" held at Kisama Heritage Village in December.',
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    festivalName: 'Wangala (100 Drums Festival)',
    subtitle: 'The Wangala festival is a harvest thanksgiving celebrated by which community?',
    iconName: 'groups',
    options: ['Garo Community (Meghalaya)', 'Rajasthani Folks', 'Goan Community'],
    correctIndex: 0,
    hint: 'Honoring Saljong (Sun God) with 100 synchronized drums beating together.',
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Master',
    festivalName: 'Losar (New Year)',
    subtitle: 'Losar is the vibrant New Year celebration observed primarily in:',
    iconName: 'temple-buddhist',
    options: ['Arunachal Pradesh & Sikkim', 'Kerala', 'Tamil Nadu'],
    correctIndex: 0,
    hint: 'Monastery prayers, masked Cham dances, and butter lamps welcoming the new year.',
    points: 100,
  },
];

export default function FestivalMemoryScreen({
  userId,
  onBack,
  onNextGame,
}: FestivalMemoryScreenProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completedScore, setCompletedScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];
  const isCorrect = selected === currentLevel.correctIndex;
  const hasAnswered = selected !== null;

  const currentScore = useMemo(() => {
    if (!hasAnswered) return 0;
    if (!isCorrect) return 0;
    let score = currentLevel.points;
    if (showHint) score -= 20;
    if (attempts > 1) score -= (attempts - 1) * 20;
    return Math.max(score, 20);
  }, [hasAnswered, isCorrect, showHint, attempts, currentLevel.points]);

  useEffect(() => {
    if (gameFinished) {
      const finalScore = completedScore + currentScore;
      const percentage = Math.round((finalScore / (LEVELS.length * 100)) * 100);
      const targetUserId = userId || 'patient_local';

      saveGameResultLocally({
        userId: targetUserId,
        gameName: 'festival-memory',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving game result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: percentage,
        attention: Math.min(100, Math.round(percentage * 1.05)),
        reaction: 90,
      }).catch((err) => console.warn('Failed saving cognitive score locally:', err));

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, currentScore, userId]);

  const handleAnswer = (index: number) => {
    if (hasAnswered && isCorrect) return;
    setSelected(index);
    setAttempts((prev) => prev + 1);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  const handleNext = () => {
    if (!isCorrect) return;
    setCompletedScore((prev) => prev + currentScore);

    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setSelected(null);
      setShowHint(false);
      setAttempts(0);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentLevelIndex(0);
    setSelected(null);
    setShowHint(false);
    setAttempts(0);
    setCompletedScore(0);
    setGameFinished(false);
  };

  if (gameFinished) {
    const finalScore = completedScore + currentScore;
    const maxScore = LEVELS.length * 100;
    const percentage = Math.round((finalScore / maxScore) * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.resultCard}>
            <View style={styles.trophyContainer}>
              <MaterialIcons name="celebration" size={64} color="#EAB308" />
            </View>
            <Text style={styles.resultTitle}>Festive Mastery!</Text>
            <Text style={styles.resultSubtitle}>
              You remembered our rich cultural festivals beautifully!
            </Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreStat}>
                <Text style={styles.statNumber}>{finalScore}</Text>
                <Text style={styles.statLabel}>Total Score</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreStat}>
                <Text style={styles.statNumber}>{percentage}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            <Pressable
              style={[styles.primaryButton, { marginTop: 24 }]}
              onPress={handleRestart}
            >
              <MaterialIcons name="replay" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { marginTop: 12 }]}
              onPress={onBack}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Back to Games</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Festival Memory</Text>
            <Text style={styles.headerSubtitle}>
              Level {currentLevel.level} of {LEVELS.length} ({currentLevel.difficulty})
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.scoreBadge}>
              {completedScore + (hasAnswered && isCorrect ? currentScore : 0)} pts
            </Text>
          </View>
        </View>

        {/* PROGRESS BAR */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentLevelIndex + 1) / LEVELS.length) * 100}%` },
            ]}
          />
        </View>

        {/* MAIN GAME CARD */}
        <View style={styles.card}>
          <Text style={styles.festivalHeading}>{currentLevel.festivalName}</Text>
          <Text style={styles.questionSubtitle}>{currentLevel.subtitle}</Text>

          {/* VISUAL ILLUSTRATION */}
          <View style={styles.visualBanner}>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name={currentLevel.iconName}
                size={48}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.visualTag}>Festival Memory & Tradition</Text>
          </View>

          {/* HINT BOX */}
          {showHint && (
            <View style={styles.hintContainer}>
              <MaterialIcons name="lightbulb" size={20} color={COLORS.warningBorder} />
              <Text style={styles.hintText}>{currentLevel.hint}</Text>
            </View>
          )}

          {/* OPTIONS */}
          <View style={styles.optionsContainer}>
            {currentLevel.options.map((option, index) => {
              const isOptionSelected = selected === index;
              const isOptionCorrect = index === currentLevel.correctIndex;
              const showCorrect = hasAnswered && isOptionCorrect;
              const showWrong = hasAnswered && isOptionSelected && !isOptionCorrect;

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.optionButton,
                    showCorrect && styles.optionButtonCorrect,
                    showWrong && styles.optionButtonWrong,
                  ]}
                  onPress={() => handleAnswer(index)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      showCorrect && styles.optionTextCorrect,
                      showWrong && styles.optionTextWrong,
                    ]}
                  >
                    {option}
                  </Text>
                  {hasAnswered && isOptionSelected && (
                    <MaterialIcons
                      name={isCorrect ? 'check-circle' : 'cancel'}
                      size={24}
                      color={isCorrect ? COLORS.correctBorder : COLORS.wrongBorder}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* FEEDBACK & ACTIONS */}
          {hasAnswered && (
            <View style={styles.feedbackContainer}>
              {isCorrect ? (
                <View style={styles.feedbackBannerCorrect}>
                  <MaterialIcons name="check" size={24} color={COLORS.correctText} />
                  <Text style={styles.feedbackTextCorrect}>
                    Correct! +{currentScore} points
                  </Text>
                </View>
              ) : (
                <View style={styles.feedbackBannerWrong}>
                  <MaterialIcons name="close" size={24} color={COLORS.wrongText} />
                  <Text style={styles.feedbackTextWrong}>
                    Not quite right. Try another option!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* FOOTER ACTIONS */}
          <View style={styles.actionsRow}>
            {!showHint && !isCorrect && (
              <Pressable style={styles.hintButton} onPress={handleHint}>
                <MaterialIcons name="lightbulb-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.hintButtonText}>Need a Hint?</Text>
              </Pressable>
            )}

            {isCorrect && (
              <Pressable style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentLevelIndex < LEVELS.length - 1 ? 'Next Level' : 'Finish Game'}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  headerRight: {
    marginLeft: 8,
  },
  scoreBadge: {
    backgroundColor: COLORS.primaryContainer,
    color: '#FFF',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  festivalHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryContainer,
    marginBottom: 6,
  },
  questionSubtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 22,
  },
  visualBanner: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  visualTag: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  hintContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warningBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  hintText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.warningText,
    flex: 1,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  optionButtonCorrect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.correct,
    borderWidth: 2,
    borderColor: COLORS.correctBorder,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  optionButtonWrong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.wrong,
    borderWidth: 2,
    borderColor: COLORS.wrongBorder,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  optionButtonHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
  },
  optionTextCorrect: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.correctText,
    flex: 1,
  },
  optionTextWrong: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.wrongText,
    flex: 1,
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackBannerCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.correct,
    padding: 12,
    borderRadius: 8,
  },
  feedbackTextCorrect: {
    marginLeft: 8,
    fontWeight: '700',
    color: COLORS.correctText,
    fontSize: 14,
  },
  feedbackBannerWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.wrong,
    padding: 12,
    borderRadius: 8,
  },
  feedbackTextWrong: {
    marginLeft: 8,
    fontWeight: '700',
    color: COLORS.wrongText,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.secondaryContainer,
  },
  hintButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  trophyContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  scoreStat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryContainer,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.outlineVariant,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
