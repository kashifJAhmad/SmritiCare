import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/* ====================================================
   COLORS — matches existing game palette
==================================================== */

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

  cardFace: '#FFFFFF',
  cardBack: '#1B5E20',
  cardMatched: '#E2F3E0',
  cardMatchedBorder: '#2E7D32',
};

/* ====================================================
   TYPES
==================================================== */

type MemoryMatchScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Card = {
  id: number;
  symbol: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
};

type LevelConfig = {
  level: number;
  difficulty: string;
  title: string;
  subtitle: string;
  pairs: number;
  columns: number;
  points: number;
};

/* ====================================================
   SYMBOLS — safe emoji set for all platforms
==================================================== */

const ALL_SYMBOLS = [
  '🍎', '🌺', '🏠', '🌙',
  '⭐', '🎵', '🌳', '🐦',
  '🔔', '☀️', '🐟', '💧',
  '🍳', '🎈', '🌻', '🍀',
];

/* ====================================================
   LEVEL CONFIGURATION
==================================================== */

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    difficulty: 'Easy',
    title: 'Memory Match',
    subtitle: 'Find 3 matching pairs. Take your time.',
    pairs: 3,
    columns: 3,
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    title: 'Memory Match',
    subtitle: 'Now try 4 pairs. Remember where each card is.',
    pairs: 4,
    columns: 4,
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    title: 'Memory Match',
    subtitle: '5 pairs to find. Focus and remember.',
    pairs: 5,
    columns: 5,
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    title: 'Memory Match',
    subtitle: '6 pairs. The grid is bigger now.',
    pairs: 6,
    columns: 4,
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Challenge',
    title: 'Final Challenge',
    subtitle: '8 pairs! Use your memory to find them all.',
    pairs: 8,
    columns: 4,
    points: 100,
  },
];

/* ====================================================
   HELPERS
==================================================== */

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(pairCount: number): Card[] {
  const symbols = shuffleArray(ALL_SYMBOLS).slice(0, pairCount);
  const cards: Card[] = [];

  symbols.forEach((symbol, index) => {
    cards.push({
      id: index * 2,
      symbol,
      pairId: index,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: index * 2 + 1,
      symbol,
      pairId: index,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

/* ====================================================
   MEMORY MATCH SCREEN
==================================================== */

export default function MemoryMatchScreen({
  userId,
  onBack,
  onNextGame,
}: MemoryMatchScreenProps) {
  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState<Card[]>(() =>
    createCards(LEVELS[0].pairs),
  );
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [lastMatchFeedback, setLastMatchFeedback] = useState<
    'correct' | 'wrong' | null
  >(null);

  const flipBackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLevel = LEVELS[level];

  /* ====================================================
     SCORING — matches GuessFood convention
  ==================================================== */

  const currentScore = useMemo(() => {
    let score = currentLevel.points;
    score -= wrongAttempts * 10;
    return Math.max(10, score);
  }, [wrongAttempts, currentLevel.points]);

  const completedScore = levelScores.reduce(
    (total, score) => total + score,
    0,
  );

  /* ====================================================
     CLEANUP TIMERS
  ==================================================== */

  useEffect(() => {
    return () => {
      if (flipBackTimer.current) {
        clearTimeout(flipBackTimer.current);
      }
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  /* ====================================================
     LEVEL COMPLETE CHECK
  ==================================================== */

  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === currentLevel.pairs) {
      setLevelComplete(true);
    }
  }, [matchedPairs, currentLevel.pairs]);

  /* ====================================================
     GAME FINISHED — SAVE RESULT
  ==================================================== */

  useEffect(() => {
    if (gameFinished) {
      const finalScore = completedScore;
      const maxScore = LEVELS.length * 100;
      const percentage = Math.min(
        100,
        Math.max(0, Math.round((finalScore / maxScore) * 100)),
      );
      const targetUserId = userId || 'patient_local';

      saveGameResultLocally({
        userId: targetUserId,
        gameName: 'memory-match',
        score: finalScore,
      }).catch((err) =>
        console.warn('Failed saving game result locally:', err),
      );

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: Math.min(100, Math.round(percentage * 1.1)),
        attention: Math.min(100, Math.round(percentage * 1.05)),
        reaction: 85,
      }).catch((err) =>
        console.warn('Failed saving cognitive score locally:', err),
      );

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, userId]);

  /* ====================================================
     CARD TAP HANDLER
  ==================================================== */

  const handleCardPress = useCallback(
    (cardIndex: number) => {
      if (isChecking || levelComplete || gameFinished) {
        return;
      }

      const card = cards[cardIndex];

      // Ignore already-flipped or matched cards
      if (card.isFlipped || card.isMatched) {
        return;
      }

      // Cannot flip more than 2 at a time
      if (flippedIndices.length >= 2) {
        return;
      }

      // Flip the card
      const updatedCards = [...cards];
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        isFlipped: true,
      };
      setCards(updatedCards);

      const newFlipped = [...flippedIndices, cardIndex];
      setFlippedIndices(newFlipped);

      // If this is the second card, check for match
      if (newFlipped.length === 2) {
        setIsChecking(true);
        setTotalAttempts((prev) => prev + 1);

        const firstCard = updatedCards[newFlipped[0]];
        const secondCard = updatedCards[newFlipped[1]];

        if (firstCard.pairId === secondCard.pairId) {
          // MATCH!
          setLastMatchFeedback('correct');

          if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
          }
          feedbackTimer.current = setTimeout(() => {
            setLastMatchFeedback(null);
          }, 1200);

          const matchedCards = [...updatedCards];
          matchedCards[newFlipped[0]] = {
            ...matchedCards[newFlipped[0]],
            isMatched: true,
          };
          matchedCards[newFlipped[1]] = {
            ...matchedCards[newFlipped[1]],
            isMatched: true,
          };

          setCards(matchedCards);
          setMatchedPairs((prev) => prev + 1);
          setFlippedIndices([]);
          setIsChecking(false);
        } else {
          // MISMATCH — show briefly, then flip back
          setLastMatchFeedback('wrong');
          setWrongAttempts((prev) => prev + 1);

          if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
          }
          feedbackTimer.current = setTimeout(() => {
            setLastMatchFeedback(null);
          }, 1200);

          flipBackTimer.current = setTimeout(() => {
            const flippedBack = [...updatedCards];
            flippedBack[newFlipped[0]] = {
              ...flippedBack[newFlipped[0]],
              isFlipped: false,
            };
            flippedBack[newFlipped[1]] = {
              ...flippedBack[newFlipped[1]],
              isFlipped: false,
            };

            setCards(flippedBack);
            setFlippedIndices([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIndices, isChecking, levelComplete, gameFinished],
  );

  /* ====================================================
     NEXT LEVEL
  ==================================================== */

  const handleNext = () => {
    if (!levelComplete) {
      return;
    }

    const updatedScores = [...levelScores];
    updatedScores[level] = currentScore;
    setLevelScores(updatedScores);

    if (level < LEVELS.length - 1) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setCards(createCards(LEVELS[nextLevel].pairs));
      setFlippedIndices([]);
      setMatchedPairs(0);
      setWrongAttempts(0);
      setTotalAttempts(0);
      setIsChecking(false);
      setLevelComplete(false);
      setLastMatchFeedback(null);
      return;
    }

    setGameFinished(true);
  };

  /* ====================================================
     RESTART LEVEL
  ==================================================== */

  const handleRestart = () => {
    if (flipBackTimer.current) {
      clearTimeout(flipBackTimer.current);
    }
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    setCards(createCards(currentLevel.pairs));
    setFlippedIndices([]);
    setMatchedPairs(0);
    setWrongAttempts(0);
    setTotalAttempts(0);
    setIsChecking(false);
    setLevelComplete(false);
    setLastMatchFeedback(null);
  };

  /* ====================================================
     PLAY AGAIN — full reset
  ==================================================== */

  const handlePlayAgain = () => {
    if (flipBackTimer.current) {
      clearTimeout(flipBackTimer.current);
    }
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    setLevel(0);
    setCards(createCards(LEVELS[0].pairs));
    setFlippedIndices([]);
    setMatchedPairs(0);
    setWrongAttempts(0);
    setTotalAttempts(0);
    setIsChecking(false);
    setLevelComplete(false);
    setLevelScores([]);
    setGameFinished(false);
    setLastMatchFeedback(null);
  };

  /* ====================================================
     GAME FINISHED SCREEN
  ==================================================== */

  if (gameFinished) {
    const finalScore = completedScore;
    const maxScore = LEVELS.length * 100;
    const percentage = Math.min(
      100,
      Math.max(0, Math.round((finalScore / maxScore) * 100)),
    );

    let resultTitle = 'Good Work!';
    let resultMessage =
      'You completed all five levels. Keep practicing to strengthen your memory.';

    if (percentage >= 90) {
      resultTitle = 'Excellent!';
      resultMessage =
        'Amazing work! Your memory is sharp and strong.';
    } else if (percentage >= 70) {
      resultTitle = 'Great Job!';
      resultMessage =
        'You did very well. A little more practice can make your memory even stronger.';
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={styles.back}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialIcons
                name="arrow-back"
                size={30}
                color={COLORS.onPrimaryContainer}
              />
            </Pressable>

            <Text style={styles.brand}>SmritiCare</Text>

            <Text style={styles.progress}>Complete</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.resultContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultIcon}>
              <MaterialIcons
                name="emoji-events"
                size={72}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.resultTitle}>
              {resultTitle}
            </Text>

            <Text style={styles.resultMessage}>
              {resultMessage}
            </Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>
                Your Final Score
              </Text>

              <Text style={styles.scoreValue}>
                {finalScore}
              </Text>

              <Text style={styles.scoreOutOf}>
                out of {LEVELS.length * 100} points
              </Text>
            </View>

            <View style={styles.performanceCard}>
              <View style={styles.performanceRow}>
                <MaterialIcons
                  name="check-circle"
                  size={26}
                  color={COLORS.correctBorder}
                />

                <Text style={styles.performanceText}>
                  {LEVELS.length} levels completed
                </Text>
              </View>

              <View style={styles.performanceRow}>
                <MaterialIcons
                  name="psychology"
                  size={26}
                  color={COLORS.secondary}
                />

                <Text style={styles.performanceText}>
                  Memory skills practiced
                </Text>
              </View>

              <View style={styles.performanceRow}>
                <MaterialIcons
                  name="trending-up"
                  size={26}
                  color={COLORS.primary}
                />

                <Text style={styles.performanceText}>
                  Overall performance: {percentage}%
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handlePlayAgain}
              accessibilityRole="button"
              accessibilityLabel="Play Memory Match again"
            >
              <MaterialIcons
                name="refresh"
                size={26}
                color={COLORS.white}
              />

              <Text style={styles.primaryButtonText}>
                Play Again
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={onNextGame}
              accessibilityRole="button"
              accessibilityLabel="Go to other games"
            >
              <MaterialIcons
                name="sports-esports"
                size={26}
                color={COLORS.primary}
              />

              <Text style={styles.secondaryButtonText}>
                Other Games
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  /* ====================================================
     GAME PLAY SCREEN
  ==================================================== */

  const progressPercentage =
    ((level + 1) / LEVELS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={30}
              color={COLORS.onPrimaryContainer}
            />
          </Pressable>

          <Text style={styles.brand}>
            SmritiCare
          </Text>

          <Text style={styles.progress}>
            Level {level + 1} of {LEVELS.length}
          </Text>
        </View>

        {/* PROGRESS BAR */}
        <View style={styles.progressSection}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressLabel}>
              Game Progress
            </Text>

            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* SCROLL CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* LEVEL BADGE */}
          <View style={styles.levelBadge}>
            <MaterialIcons
              name="star"
              size={24}
              color={COLORS.primary}
            />

            <Text style={styles.levelBadgeText}>
              Level {currentLevel.level} •{' '}
              {currentLevel.difficulty}
            </Text>
          </View>

          {/* GAME HEADER */}
          <View style={styles.gameHeader}>
            <Text style={styles.title}>
              {currentLevel.title}
            </Text>

            <Text style={styles.subtitle}>
              {currentLevel.subtitle}
            </Text>
          </View>

          {/* STATS ROW */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons
                name="stars"
                size={25}
                color={COLORS.primary}
              />

              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>
                  Level Score
                </Text>

                <Text style={styles.statValue}>
                  {currentScore}
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="touch-app"
                size={25}
                color={COLORS.secondary}
              />

              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>
                  Attempts
                </Text>

                <Text style={styles.statValue}>
                  {totalAttempts}
                </Text>
              </View>
            </View>
          </View>

          {/* MATCH FEEDBACK */}
          {lastMatchFeedback === 'correct' && (
            <View style={styles.correctMessage}>
              <MaterialIcons
                name="check-circle"
                size={27}
                color={COLORS.correctBorder}
              />

              <View style={styles.feedbackContent}>
                <Text style={styles.correctMessageTitle}>
                  Match found!
                </Text>

                <Text style={styles.correctMessageText}>
                  Great memory! Keep going.
                </Text>
              </View>
            </View>
          )}

          {lastMatchFeedback === 'wrong' && (
            <View style={styles.wrongMessage}>
              <MaterialIcons
                name="info-outline"
                size={27}
                color={COLORS.wrongBorder}
              />

              <View style={styles.feedbackContent}>
                <Text style={styles.wrongMessageTitle}>
                  Not a match
                </Text>

                <Text style={styles.wrongMessageText}>
                  Try to remember where each card is.
                </Text>
              </View>
            </View>
          )}

          {/* CARD GRID */}
          <View
            style={[
              styles.cardGrid,
              {
                maxWidth: currentLevel.columns * 90,
              },
            ]}
          >
            {cards.map((card, index) => {
              const isRevealed =
                card.isFlipped || card.isMatched;

              return (
                <Pressable
                  key={card.id}
                  onPress={() => handleCardPress(index)}
                  disabled={
                    isRevealed ||
                    isChecking ||
                    levelComplete
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    card.isMatched
                      ? `Matched card: ${card.symbol}`
                      : card.isFlipped
                        ? `Revealed card: ${card.symbol}`
                        : `Hidden card ${index + 1}`
                  }
                  style={({ pressed }) => [
                    styles.card,
                    {
                      width:
                        `${Math.floor(100 / currentLevel.columns) - 3}%` as any,
                    },
                    card.isMatched &&
                      styles.cardMatched,
                    card.isFlipped &&
                      !card.isMatched &&
                      styles.cardFlipped,
                    !isRevealed &&
                      pressed &&
                      styles.cardPressed,
                  ]}
                >
                  {isRevealed ? (
                    <View style={styles.cardFaceContainer}>
                      <Text
                        style={styles.cardSymbol}
                      >
                        {card.symbol}
                      </Text>

                      {card.isMatched && (
                        <View
                          style={
                            styles.matchedBadge
                          }
                        >
                          <MaterialIcons
                            name="check"
                            size={14}
                            color={COLORS.white}
                          />
                        </View>
                      )}
                    </View>
                  ) : (
                    <View
                      style={styles.cardBackContainer}
                    >
                      <MaterialIcons
                        name="help-outline"
                        size={32}
                        color="rgba(255,255,255,0.8)"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* LEVEL COMPLETE OVERLAY */}
          {levelComplete && (
            <View style={styles.levelCompleteCard}>
              <MaterialIcons
                name="check-circle"
                size={48}
                color={COLORS.correctBorder}
              />

              <Text style={styles.levelCompleteTitle}>
                Level {currentLevel.level} Complete!
              </Text>

              <Text style={styles.levelCompleteSubtitle}>
                You matched all {currentLevel.pairs}{' '}
                pairs. Score: {currentScore} points.
              </Text>
            </View>
          )}

          {/* PAIRS PROGRESS */}
          <View style={styles.pairsProgress}>
            <Text style={styles.pairsProgressText}>
              Pairs found: {matchedPairs} of{' '}
              {currentLevel.pairs}
            </Text>

            <View style={styles.pairsBar}>
              <View
                style={[
                  styles.pairsFill,
                  {
                    width: `${(matchedPairs / currentLevel.pairs) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Pressable
            style={styles.restartButton}
            onPress={handleRestart}
            accessibilityRole="button"
            accessibilityLabel="Restart this level"
          >
            <MaterialIcons
              name="refresh"
              size={28}
              color={COLORS.primary}
            />

            <Text style={styles.restartButtonText}>
              Restart
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.next,
              !levelComplete && styles.nextDisabled,
            ]}
            onPress={handleNext}
            disabled={!levelComplete}
            accessibilityRole="button"
            accessibilityLabel={
              level < LEVELS.length - 1
                ? 'Go to next level'
                : 'Finish game'
            }
          >
            <Text
              style={[
                styles.nextText,
                !levelComplete &&
                  styles.nextTextDisabled,
              ]}
            >
              {level < LEVELS.length - 1
                ? 'Next Level'
                : 'Finish Game'}
            </Text>

            <MaterialIcons
              name={
                level < LEVELS.length - 1
                  ? 'arrow-forward'
                  : 'check'
              }
              size={26}
              color={
                levelComplete
                  ? COLORS.white
                  : COLORS.outline
              }
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ====================================================
   STYLES
==================================================== */

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
    minHeight: 72,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryContainer,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
  },

  back: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },

  brand: {
    flex: 1,
    marginLeft: 8,
    fontSize: 27,
    fontWeight: '700',
    color: COLORS.onPrimaryContainer,
  },

  progress: {
    minWidth: 105,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onPrimaryContainer,
  },

  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  progressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  progressPercentage: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },

  progressTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 10,
  },

  resultContent: {
    padding: 24,
    alignItems: 'center',
  },

  /* LEVEL BADGE */

  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 14,
  },

  levelBadgeText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* GAME HEADER */

  gameHeader: {
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.onSurfaceVariant,
  },

  /* STATS ROW */

  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },

  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  statTextContainer: {
    marginLeft: 10,
  },

  statLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },

  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 2,
  },

  /* FEEDBACK MESSAGES */

  correctMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.correct,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.correctBorder,
  },

  correctMessageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.correctText,
  },

  correctMessageText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.correctText,
    marginTop: 2,
  },

  wrongMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.wrong,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.wrongBorder,
  },

  wrongMessageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.wrongText,
  },

  wrongMessageText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.wrongText,
    marginTop: 2,
  },

  feedbackContent: {
    flex: 1,
    marginLeft: 12,
  },

  /* CARD GRID */

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 10,
    marginBottom: 20,
  },

  card: {
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardFlipped: {
    backgroundColor: COLORS.cardFace,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },

  cardMatched: {
    backgroundColor: COLORS.cardMatched,
    borderWidth: 2,
    borderColor: COLORS.cardMatchedBorder,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  cardFaceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  cardSymbol: {
    fontSize: 36,
  },

  matchedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.correctBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: COLORS.cardBack,
    borderRadius: 14,
  },

  /* LEVEL COMPLETE */

  levelCompleteCard: {
    alignItems: 'center',
    backgroundColor: COLORS.correct,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.correctBorder,
  },

  levelCompleteTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.correctText,
    marginTop: 10,
  },

  levelCompleteSubtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.correctText,
    marginTop: 6,
    textAlign: 'center',
  },

  /* PAIRS PROGRESS */

  pairsProgress: {
    marginBottom: 10,
  },

  pairsProgressText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },

  pairsBar: {
    height: 10,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 5,
    overflow: 'hidden',
  },

  pairsFill: {
    height: '100%',
    backgroundColor: COLORS.correctBorder,
    borderRadius: 5,
  },

  bottomSpace: {
    height: 20,
  },

  /* FOOTER */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    gap: 12,
  },

  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    gap: 6,
  },

  restartButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },

  next: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    gap: 8,
  },

  nextDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  nextText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },

  nextTextDisabled: {
    color: COLORS.outline,
  },

  /* RESULT SCREEN */

  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },

  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },

  resultMessage: {
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  scoreCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
  },

  scoreValue: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.primary,
  },

  scoreOutOf: {
    fontSize: 16,
    color: COLORS.outline,
    marginTop: 4,
  },

  performanceCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: 14,
  },

  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  performanceText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    marginBottom: 14,
    gap: 10,
  },

  primaryButtonPressed: {
    opacity: 0.85,
  },

  primaryButtonText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.white,
  },

  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    gap: 10,
  },

  secondaryButtonPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  secondaryButtonText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
