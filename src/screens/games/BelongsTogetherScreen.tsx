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
  background: '#F4FAFF',
  surface: '#FFFFFF',
  white: '#FFFFFF',

  surfaceContainer: '#EAF3F7',
  surfaceContainerHigh: '#E2EEF4',
  surfaceContainerLow: '#E9F6FD',

  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#90D689',

  secondary: '#00629E',
  secondaryContainer: '#D7EEFF',

  outline: '#717A6D',
  outlineVariant: '#C0C9BB',

  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',

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

type BelongsTogetherScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Level = {
  level: number;
  difficulty: string;
  category: string;
  instruction: string;
  anchorIcon: keyof typeof MaterialIcons.glyphMap;
  anchorLabel: string;
  options: { label: string; icon: keyof typeof MaterialIcons.glyphMap }[];
  correctIndex: number;
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    category: 'Traditional Kitchen & Cooking',
    instruction: 'Which item naturally belongs in a traditional kitchen with the Clay Stove?',
    anchorIcon: 'outdoor-grill',
    anchorLabel: 'Clay Chulha (Cooking Stove)',
    options: [
      { label: 'Earthen Cooking Pot (Handi)', icon: 'soup-kitchen' },
      { label: 'Cricket Bat', icon: 'sports-cricket' },
      { label: 'Umbrella', icon: 'beach-access' },
    ],
    correctIndex: 0,
    hint: 'Think about traditional utensils used over wood fire.',
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    category: 'Tea Garden & Harvesting',
    instruction: 'Which tool belongs with picking fresh tea leaves in the garden?',
    anchorIcon: 'local-florist',
    anchorLabel: 'Fresh Green Tea Bushes',
    options: [
      { label: 'Woven Bamboo Basket (Japi/Pachi)', icon: 'shopping-basket' },
      { label: 'Tennis Racket', icon: 'sports-tennis' },
      { label: 'Paint Brush', icon: 'brush' },
    ],
    correctIndex: 0,
    hint: 'Pluckers carry this woven basket strapped to their foreheads.',
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    category: 'Traditional Music & Rhythm',
    instruction: 'Which instrument belongs with the festive Dhol in Bihu celebrations?',
    anchorIcon: 'music-note',
    anchorLabel: 'Bihu Dhol (Drum)',
    options: [
      { label: 'Buffalo Horn Pepa (Horn Pipe)', icon: 'audiotrack' },
      { label: 'Electric Drill', icon: 'handyman' },
      { label: 'Wrist Watch', icon: 'watch' },
    ],
    correctIndex: 0,
    hint: 'A melodic wind instrument crafted from horn and bamboo.',
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    category: 'Weaving & Handloom',
    instruction: 'Which tool belongs with the Traditional Wooden Loom (Taat Xaal)?',
    anchorIcon: 'precision-manufacturing',
    anchorLabel: 'Wooden Weaving Loom',
    options: [
      { label: 'Silk Shuttle & Spool (Maku)', icon: 'style' },
      { label: 'Steering Wheel', icon: 'directions-car' },
      { label: 'Keyboard', icon: 'keyboard' },
    ],
    correctIndex: 0,
    hint: 'Carries the weft thread back and forth across the warp on the loom.',
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Master',
    category: 'River Journey & Fishery',
    instruction: 'Which traditional bamboo trap belongs with catching fish in the river?',
    anchorIcon: 'water',
    anchorLabel: 'River Bank Fishing',
    options: [
      { label: 'Jakoi & Polo (Bamboo Fish Traps)', icon: 'phishing' },
      { label: 'Microphone', icon: 'mic' },
      { label: 'Calculator', icon: 'calculate' },
    ],
    correctIndex: 0,
    hint: 'Conical bamboo mesh traps woven skillfully by local artisans.',
    points: 100,
  },
];

export default function BelongsTogetherScreen({
  userId,
  onBack,
  onNextGame,
}: BelongsTogetherScreenProps) {
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
        gameName: 'belongs-together',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving game result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: percentage,
        attention: Math.min(100, Math.round(percentage * 1.05)),
        reaction: 88,
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
              <MaterialIcons name="extension" size={64} color="#00629E" />
            </View>
            <Text style={styles.resultTitle}>Great Association!</Text>
            <Text style={styles.resultSubtitle}>
              You connected all the related cultural items accurately!
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
            <Text style={styles.headerTitle}>What Belongs Together?</Text>
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
          <Text style={styles.categoryBadge}>{currentLevel.category}</Text>
          <Text style={styles.instructionText}>{currentLevel.instruction}</Text>

          {/* ANCHOR ITEM DISPLAY */}
          <View style={styles.anchorBox}>
            <View style={styles.anchorIconContainer}>
              <MaterialIcons
                name={currentLevel.anchorIcon}
                size={40}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.anchorTextContainer}>
              <Text style={styles.anchorLabel}>Target Item:</Text>
              <Text style={styles.anchorValue}>{currentLevel.anchorLabel}</Text>
            </View>
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
                  <View style={styles.optionIconContainer}>
                    <MaterialIcons
                      name={option.icon}
                      size={28}
                      color={isOptionSelected && isCorrect ? COLORS.correctText : COLORS.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      showCorrect && styles.optionTextCorrect,
                      showWrong && styles.optionTextWrong,
                    ]}
                  >
                    {option.label}
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
                    Matches perfectly! +{currentScore} points
                  </Text>
                </View>
              ) : (
                <View style={styles.feedbackBannerWrong}>
                  <MaterialIcons name="close" size={24} color={COLORS.wrongText} />
                  <Text style={styles.feedbackTextWrong}>
                    These don't belong together. Try again!
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
  categoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 16,
    lineHeight: 22,
  },
  anchorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.secondaryContainer,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  anchorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  anchorTextContainer: {
    flex: 1,
  },
  anchorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  anchorValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 2,
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
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    padding: 14,
    minHeight: 60,
  },
  optionButtonCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.correct,
    borderWidth: 2,
    borderColor: COLORS.correctBorder,
    borderRadius: 12,
    padding: 14,
    minHeight: 60,
  },
  optionButtonWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.wrong,
    borderWidth: 2,
    borderColor: COLORS.wrongBorder,
    borderRadius: 12,
    padding: 14,
    minHeight: 60,
  },
  optionButtonHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    padding: 14,
    minHeight: 60,
    opacity: 0.6,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
  },
  optionTextCorrect: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.correctText,
    flex: 1,
  },
  optionTextWrong: {
    fontSize: 15,
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
    backgroundColor: '#E0F2FE',
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
