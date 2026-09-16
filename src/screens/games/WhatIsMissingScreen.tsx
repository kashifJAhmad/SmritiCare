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

type WhatIsMissingScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Item = {
  id: number;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

type Level = {
  level: number;
  difficulty: string;
  allItems: Item[];
  missingItemIndex: number;
  options: Item[];
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    allItems: [
      { id: 0, name: 'Bihu Dhol (Drum)', icon: 'music-note', color: '#16A34A' },
      { id: 1, name: 'Assam Tea Cup', icon: 'local-cafe', color: '#B45309' },
      { id: 2, name: 'Golden Sun', icon: 'wb-sunny', color: '#EAB308' },
    ],
    missingItemIndex: 1, // Assam Tea Cup is removed
    options: [
      { id: 1, name: 'Assam Tea Cup', icon: 'local-cafe', color: '#B45309' },
      { id: 3, name: 'Water Jug', icon: 'water-drop', color: '#0284C7' },
      { id: 4, name: 'Book', icon: 'menu-book', color: '#7C3AED' },
    ],
    hint: 'Look for the warm beverage cup you saw earlier.',
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    allItems: [
      { id: 0, name: 'Silk Mekhela', icon: 'checkroom', color: '#D97706' },
      { id: 1, name: 'Bamboo Basket', icon: 'shopping-basket', color: '#059669' },
      { id: 2, name: 'Red Gamosa', icon: 'dry-cleaning', color: '#DC2626' },
      { id: 3, name: 'Clay Lamp', icon: 'flare', color: '#EA580C' },
    ],
    missingItemIndex: 2, // Red Gamosa is removed
    options: [
      { id: 2, name: 'Red Gamosa', icon: 'dry-cleaning', color: '#DC2626' },
      { id: 5, name: 'Wrist Watch', icon: 'watch', color: '#64748B' },
      { id: 6, name: 'Green Plant', icon: 'eco', color: '#15803D' },
    ],
    hint: 'The white cloth with red floral borders is missing.',
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    allItems: [
      { id: 0, name: 'Buffalo Horn Pepa', icon: 'audiotrack', color: '#854D0E' },
      { id: 1, name: 'River Boat', icon: 'sailing', color: '#0284C7' },
      { id: 2, name: 'Harvest Sheaf', icon: 'grass', color: '#65A30D' },
      { id: 3, name: 'Temple Diya', icon: 'lightbulb', color: '#F59E0B' },
    ],
    missingItemIndex: 0, // Pepa removed
    options: [
      { id: 0, name: 'Buffalo Horn Pepa', icon: 'audiotrack', color: '#854D0E' },
      { id: 7, name: 'Telephone', icon: 'phone', color: '#475569' },
      { id: 8, name: 'Umbrella', icon: 'umbrella', color: '#9333EA' },
    ],
    hint: 'The musical wind instrument played in Bihu is gone.',
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    allItems: [
      { id: 0, name: 'Rhino Silhouette', icon: 'pets', color: '#57534E' },
      { id: 1, name: 'Lush Hills', icon: 'terrain', color: '#15803D' },
      { id: 2, name: 'Lotus Flower', icon: 'local-florist', color: '#E11D48' },
      { id: 3, name: 'Rain Cloud', icon: 'wb-cloudy', color: '#38BDF8' },
      { id: 4, name: 'Fishing Net', icon: 'phishing', color: '#0D9488' },
    ],
    missingItemIndex: 2, // Lotus Flower removed
    options: [
      { id: 2, name: 'Lotus Flower', icon: 'local-florist', color: '#E11D48' },
      { id: 9, name: 'Radio', icon: 'radio', color: '#64748B' },
      { id: 10, name: 'Spectacles', icon: 'visibility', color: '#1E293B' },
    ],
    hint: 'A pink blooming flower was present in the center.',
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Master',
    allItems: [
      { id: 0, name: 'Silk Weaver Loom', icon: 'style', color: '#B45309' },
      { id: 1, name: 'Monastery Bell', icon: 'notifications-active', color: '#D97706' },
      { id: 2, name: 'Harvest Drum', icon: 'celebration', color: '#DC2626' },
      { id: 3, name: 'Majuli Clay Pot', icon: 'soup-kitchen', color: '#78350F' },
      { id: 4, name: 'Tea Garden Leaf', icon: 'spa', color: '#16A34A' },
    ],
    missingItemIndex: 3, // Majuli Clay Pot removed
    options: [
      { id: 3, name: 'Majuli Clay Pot', icon: 'soup-kitchen', color: '#78350F' },
      { id: 11, name: 'Key', icon: 'vpn-key', color: '#EAB308' },
      { id: 12, name: 'Bicycle', icon: 'pedal-bike', color: '#2563EB' },
    ],
    hint: 'The earthen cooking pot crafted on Majuli island is missing.',
    points: 100,
  },
];

export default function WhatIsMissingScreen({
  userId,
  onBack,
  onNextGame,
}: WhatIsMissingScreenProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [phase, setPhase] = useState<'MEMORIZE' | 'TEST'>('MEMORIZE');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completedScore, setCompletedScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];
  const missingItem = currentLevel.allItems[currentLevel.missingItemIndex];
  const isCorrect = selectedId === missingItem.id;
  const hasAnswered = selectedId !== null;

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
      const finalScore = completedScore;
      const maxScore = LEVELS.length * 100;
      const percentage = Math.min(100, Math.max(0, Math.round((finalScore / maxScore) * 100)));
      const targetUserId = userId || 'patient_local';

      saveGameResultLocally({
        userId: targetUserId,
        gameName: 'what-is-missing',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving game result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: Math.min(100, Math.round(percentage * 1.1)),
        attention: percentage,
        reaction: 88,
      }).catch((err) => console.warn('Failed saving cognitive score locally:', err));

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, userId]);

  const handleStartTesting = () => {
    setPhase('TEST');
  };

  const handleAnswer = (itemId: number) => {
    if (hasAnswered && isCorrect) return;
    setSelectedId(itemId);
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
      setPhase('MEMORIZE');
      setSelectedId(null);
      setShowHint(false);
      setAttempts(0);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentLevelIndex(0);
    setPhase('MEMORIZE');
    setSelectedId(null);
    setShowHint(false);
    setAttempts(0);
    setCompletedScore(0);
    setGameFinished(false);
  };

  if (gameFinished) {
    const finalScore = completedScore;
    const maxScore = LEVELS.length * 100;
    const percentage = Math.min(100, Math.max(0, Math.round((finalScore / maxScore) * 100)));

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.resultCard}>
            <View style={styles.trophyContainer}>
              <MaterialIcons name="help-center" size={64} color="#00629E" />
            </View>
            <Text style={styles.resultTitle}>Memory Champion!</Text>
            <Text style={styles.resultSubtitle}>
              You identified all missing items with great recollection!
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
            <Text style={styles.headerTitle}>What is Missing?</Text>
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
          {phase === 'MEMORIZE' ? (
            /* MEMORIZE PHASE */
            <View>
              <View style={styles.phaseBannerMemorize}>
                <MaterialIcons name="visibility" size={22} color={COLORS.primary} />
                <Text style={styles.phaseBannerTextMemorize}>
                  Step 1: Look and memorize all {currentLevel.allItems.length} items
                </Text>
              </View>

              {/* DISPLAY ALL ITEMS */}
              <View style={styles.itemsGrid}>
                {currentLevel.allItems.map((item) => (
                  <View key={item.id} style={styles.itemBox}>
                    <MaterialIcons name={item.icon} size={36} color={item.color} />
                    <Text style={styles.itemBoxLabel}>{item.name}</Text>
                  </View>
                ))}
              </View>

              <Pressable style={styles.readyButton} onPress={handleStartTesting}>
                <Text style={styles.readyButtonText}>I've Memorized Them (Continue)</Text>
                <MaterialIcons name="arrow-forward" size={22} color="#FFF" />
              </Pressable>
            </View>
          ) : (
            /* TEST PHASE: ONE ITEM REMOVED */
            <View>
              <View style={styles.phaseBannerTest}>
                <MaterialIcons name="help" size={22} color={COLORS.secondary} />
                <Text style={styles.phaseBannerTextTest}>
                  Step 2: One item was removed! Which one is missing?
                </Text>
              </View>

              {/* REMAINING ITEMS + BLANK SLOT */}
              <View style={styles.itemsGrid}>
                {currentLevel.allItems.map((item, idx) => {
                  const isMissing = idx === currentLevel.missingItemIndex;
                  if (isMissing) {
                    return (
                      <View key="missing-slot" style={styles.missingSlotBox}>
                        <MaterialIcons name="help-outline" size={36} color={COLORS.secondary} />
                        <Text style={styles.missingSlotLabel}>? Missing ?</Text>
                      </View>
                    );
                  }
                  return (
                    <View key={item.id} style={styles.itemBox}>
                      <MaterialIcons name={item.icon} size={36} color={item.color} />
                      <Text style={styles.itemBoxLabel}>{item.name}</Text>
                    </View>
                  );
                })}
              </View>

              {/* HINT BOX */}
              {showHint && (
                <View style={styles.hintContainer}>
                  <MaterialIcons name="lightbulb" size={20} color={COLORS.warningBorder} />
                  <Text style={styles.hintText}>{currentLevel.hint}</Text>
                </View>
              )}

              {/* OPTIONS */}
              <Text style={styles.optionsPrompt}>Tap the missing item:</Text>
              <View style={styles.optionsContainer}>
                {currentLevel.options.map((option) => {
                  const isOptionSelected = selectedId === option.id;
                  const isOptionCorrect = option.id === missingItem.id;
                  const showCorrect = hasAnswered && isOptionCorrect;
                  const showWrong = hasAnswered && isOptionSelected && !isOptionCorrect;

                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.optionButton,
                        showCorrect && styles.optionButtonCorrect,
                        showWrong && styles.optionButtonWrong,
                      ]}
                      onPress={() => handleAnswer(option.id)}
                    >
                      <View style={styles.optionIconContainer}>
                        <MaterialIcons name={option.icon} size={28} color={option.color} />
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          showCorrect && styles.optionTextCorrect,
                          showWrong && styles.optionTextWrong,
                        ]}
                      >
                        {option.name}
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
                        Correct! You found what was missing! +{currentScore} points
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.feedbackBannerWrong}>
                      <MaterialIcons name="close" size={24} color={COLORS.wrongText} />
                      <Text style={styles.feedbackTextWrong}>
                        That item was not removed. Try another one!
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
          )}
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
  phaseBannerMemorize: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  phaseBannerTextMemorize: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  phaseBannerTest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryContainer,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  phaseBannerTextTest: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    flex: 1,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemBox: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    minHeight: 90,
  },
  itemBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: 6,
    textAlign: 'center',
  },
  missingSlotBox: {
    width: '48%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
    borderStyle: 'dashed',
    minHeight: 90,
  },
  missingSlotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 6,
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  readyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  optionsPrompt: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
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
