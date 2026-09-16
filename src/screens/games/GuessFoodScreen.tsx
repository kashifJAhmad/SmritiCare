import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
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

type GuessFoodScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Level = {
  level: number;
  difficulty: string;
  title: string;
  subtitle: string;
  image: string;
  options: string[];
  correctIndex: number;
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    title: 'What is this food?',
    subtitle:
      'Look at the picture and choose the traditional food you recognize.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBo7HwLzT3J9MHMexrcDWNZebRpTQUOvu-OLLoc1UdaAdPEmAg3s4hDFHDgJqbHgGEw24uE9asnqHymmLCZ7-n0tbPUJiBsFHIz56XHs4dYLFtH7Nen-cNUhP7nBe5Jp-QPcKrR6UxYGWkRybCXliNFZg-3m0g168yDP1pzyl9sWgMftpse_pY6XVh9jr9RtO3DR6ZyC8Cq13EWFwP7WJYD6FSzmd9Id9CpuFiMDxKOEUIFyEbx_IwEnw',
    options: [
      'A. Til Pitha',
      'B. Bamboo Basket',
      'C. Traditional Drum',
    ],
    correctIndex: 0,
    hint: 'This traditional Assamese food is made with rice and sesame.',
    points: 100,
  },

  {
    level: 2,
    difficulty: 'Easy +',
    title: 'Guess the Food',
    subtitle: 'Look carefully. Can you recognize this traditional dish?',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArDqK7kNSbVG7hVPScNDmyUDBl4a4HcMUVU13Kj2qeQvxP88V-yGj28hi6eyH2giSr1Xf_f9hTrPn21vtJZLHg42s6i1qXTOF5u-KOs4lGSpSyb58OsZREoT1r6e7jrMQIjyipLTwDQN6UHhnMnc7OU2sLd1ZiEdFja0-7QrVKUjwIp10BW6jdozb7uyfU5cuEs35Do6GXukNhufmmYU6nRvAR16kAlBEl65qyOywl2m1i241bxlHF7g',
    options: [
      'A. Masor Tenga',
      'B. Khar',
      'C. Pitha',
    ],
    correctIndex: 0,
    hint:
      'This Assamese sour fish curry is made with fish, tomatoes and elephant apple.',
    points: 100,
  },

  {
    level: 3,
    difficulty: 'Medium',
    title: 'Guess the Food',
    subtitle: 'The choices are getting more similar. Take your time.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALMMCtPYoYzP9-53v5Ct4ZZQ3EohZfvFDHR0MA6Cv2FL13Aemk_SUYWEZFryFw2GRp2voKwcSdKmm5vphgYlmonqUWk8Ywn3whjpFZJSBYrdImX2Oh04QiqXGv_lfNFi_1BVxTJBb2A3PZGf7EDIuO19mwTlCGd_2iwZeDesHZnYTyewGDgi1fyQIdziZPrrSpzwbiLz3_WhgEjP1VLy1dKm_RU2QtgoWQ3V1qBl-Y7Hffm9eGctZmrg',
    options: [
      'A. Jadoh',
      'B. Smoked Pork',
      'C. Masor Tenga',
    ],
    correctIndex: 0,
    hint:
      'This is Jadoh, a traditional Khasi rice and meat dish from Northeast India.',
    points: 100,
  },

  {
    level: 4,
    difficulty: 'Medium +',
    title: 'Guess the Food',
    subtitle:
      'This one is more challenging. Look closely before choosing.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDptkpcQH5YBAkU9HWTZbC9awsKR4949P7NGDUtHaEZuoeTEY3g6e4U6mu-Gyhpd58UFHdvszWvQe5WqRPeSM1oiRkRwweDIiaLzmNiL8GOsrr_Z2lprIl8BbUXCIw-rEhjwV-gKW3XgyNKeSg7IerrtED1ddZFnpmYpX8dFJPKjDiaatwoyaAU3p5dlPCbmElZApHb7xMbntD6fPEvgOywQ7d5mYx4Re6Psv4EpkUYy6HPB1aO9UwwyA',
    options: [
      'A. Bai',
      'B. Zan',
      'C. Smoked Pork with Bamboo Shoot',
    ],
    correctIndex: 2,
    hint:
      'This is a popular Naga dish made with smoked pork and bamboo shoot.',
    points: 100,
  },

  {
    level: 5,
    difficulty: 'Challenge',
    title: 'Final Food Challenge',
    subtitle:
      'This is the hardest level. Think carefully before you answer.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrqMWBwBHhlSXS0mABk4Qe_ckHx-RjVfT6TI0PxRHZT1MX4Su5_ESrhEhIEcJUR0SixtabfDT70Wwk8g37X5CZ6FkIGYfDaMLJSuz16nsDXC9xoMukeMMQeE2Bcut2O4SEbNX8OPLH5SQGWRwEUqpgaHzPK6KTWaqKCVzLvxwCsUxAvEIC8KwfjpYMZ-PSe1tRchAEBONqHQnR1S1KhxkNQ4j_we0TU4gJG-tspgUxJ_sZQFAFiqzijA',
    options: [
      'A. Thukpa',
      'B. Iromba',
      'C. Galho',
    ],
    correctIndex: 1,
    hint:
      'This traditional Manipuri dish is made with mashed vegetables, bamboo shoot and fermented fish.',
    points: 100,
  },
];

export default function GuessFoodScreen({
  userId,
  onBack,
  onNextGame,
}: GuessFoodScreenProps) {
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  const currentLevel = LEVELS[level];

  const hasAnswered = selected !== null;

  const isCorrect =
    selected !== null && selected === currentLevel.correctIndex;

  const currentScore = useMemo(() => {
    let score = currentLevel.points;

    if (attempts > 1) {
      score -= (attempts - 1) * 20;
    }

    if (showHint) {
      score -= 10;
    }

    return Math.max(10, score);
  }, [attempts, showHint, currentLevel.points]);

  const completedScore = levelScores.reduce(
    (total, score) => total + score,
    0,
  );

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
        gameName: 'guess-food',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving game result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: percentage,
        attention: Math.min(100, Math.round(percentage * 1.05)),
        reaction: 85,
      }).catch((err) => console.warn('Failed saving cognitive score locally:', err));

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, userId]);

  const handleAnswer = (index: number) => {
    if (hasAnswered) {
      return;
    }

    setSelected(index);
    setAttempts((previous) => previous + 1);
  };

  const handleHint = () => {
    if (showHint || hasAnswered) {
      return;
    }

    setShowHint(true);
  };

  const handleTryAgain = () => {
    setSelected(null);
  };

  const handleNext = () => {
    if (!isCorrect) {
      return;
    }

    const updatedScores = [...levelScores];
    updatedScores[level] = currentScore;

    setLevelScores(updatedScores);

    if (level < LEVELS.length - 1) {
      setLevel((previous) => previous + 1);
      setSelected(null);
      setShowHint(false);
      setAttempts(0);
      return;
    }

    setGameFinished(true);
  };

  const handlePlayAgain = () => {
    setLevel(0);
    setSelected(null);
    setShowHint(false);
    setAttempts(0);
    setLevelScores([]);
    setGameFinished(false);
  };

  if (gameFinished) {
    const finalScore = completedScore;
    const maxScore = LEVELS.length * 100;
    const percentage = Math.min(
      100,
      Math.max(0, Math.round((finalScore / maxScore) * 100)),
    );

    let resultTitle = 'Good Work!';
    let resultMessage =
      'You completed all five levels. Keep practicing to improve your memory.';

    if (percentage >= 90) {
      resultTitle = 'Excellent!';
      resultMessage =
        'Amazing work! You showed excellent food recognition skills.';
    } else if (percentage >= 70) {
      resultTitle = 'Great Job!';
      resultMessage =
        'You did very well. A little more practice can make you even stronger.';
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
                out of 500 points
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
                  5 levels completed
                </Text>
              </View>

              <View style={styles.performanceRow}>
                <MaterialIcons
                  name="psychology"
                  size={26}
                  color={COLORS.secondary}
                />

                <Text style={styles.performanceText}>
                  Food recognition practiced
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
              accessibilityLabel="Play Guess the Food again"
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

  const progressPercentage =
    ((level + 1) / LEVELS.length) * 100;

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

          <Text style={styles.brand}>
            SmritiCare
          </Text>

          <Text style={styles.progress}>
            Level {level + 1} of {LEVELS.length}
          </Text>
        </View>

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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
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

          <View style={styles.gameHeader}>
            <Text style={styles.title}>
              {currentLevel.title}
            </Text>

            <Text style={styles.subtitle}>
              {currentLevel.subtitle}
            </Text>
          </View>

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
                  {attempts}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.imageBox}>
            <View style={styles.imageTopPattern}>
              <View style={styles.patternGreen} />
              <View style={styles.patternBlue} />
            </View>

            <Image
              source={{
                uri: currentLevel.image,
              }}
              style={styles.image}
              resizeMode="cover"
            />

            {isCorrect && (
              <View style={styles.successOverlay}>
                <MaterialIcons
                  name="check-circle"
                  size={72}
                  color={COLORS.correctBorder}
                />

                <Text style={styles.successTitle}>
                  Correct!
                </Text>

                <Text style={styles.successSubtitle}>
                  Excellent! You identified the food correctly.
                </Text>

                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>
                    +{currentScore} points
                  </Text>
                </View>
              </View>
            )}
          </View>

          {showHint && (
            <View style={styles.hintBox}>
              <MaterialIcons
                name="lightbulb"
                size={28}
                color={COLORS.primary}
              />

              <View style={styles.hintContent}>
                <Text style={styles.hintTitle}>
                  Hint
                </Text>

                <Text style={styles.hintText}>
                  {currentLevel.hint}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.options}>
            {currentLevel.options.map(
              (option, index) => {
                const isSelected =
                  selected === index;

                const isOptionCorrect =
                  index === currentLevel.correctIndex;

                const showCorrect =
                  hasAnswered &&
                  isOptionCorrect;

                const showWrong =
                  isSelected &&
                  !isOptionCorrect;

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.option,

                      pressed &&
                      !hasAnswered &&
                      styles.optionPressed,

                      showCorrect &&
                      styles.correct,

                      showWrong &&
                      styles.wrong,
                    ]}
                    onPress={() =>
                      handleAnswer(index)
                    }
                    disabled={hasAnswered}
                    accessibilityRole="button"
                    accessibilityLabel={option}
                  >
                    <Text
                      style={[
                        styles.optionText,

                        showCorrect &&
                        styles.correctText,

                        showWrong &&
                        styles.wrongText,
                      ]}
                    >
                      {option}
                    </Text>

                    {showCorrect && (
                      <MaterialIcons
                        name="check-circle"
                        size={30}
                        color={COLORS.correctBorder}
                      />
                    )}

                    {showWrong && (
                      <MaterialIcons
                        name="cancel"
                        size={30}
                        color={COLORS.wrongBorder}
                      />
                    )}
                  </Pressable>
                );
              },
            )}
          </View>

          {selected !== null && !isCorrect && (
            <View style={styles.wrongMessage}>
              <MaterialIcons
                name="info-outline"
                size={27}
                color={COLORS.wrongBorder}
              />

              <View style={styles.feedbackContent}>
                <Text style={styles.wrongMessageTitle}>
                  Not quite
                </Text>

                <Text style={styles.wrongMessageText}>
                  Take another look and try again. You can
                  do it!
                </Text>
              </View>
            </View>
          )}

          {isCorrect && (
            <View style={styles.correctMessage}>
              <MaterialIcons
                name="check-circle"
                size={27}
                color={COLORS.correctBorder}
              />

              <View style={styles.feedbackContent}>
                <Text style={styles.correctMessageTitle}>
                  Well done!
                </Text>

                <Text style={styles.correctMessageText}>
                  You are ready for the next level.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.hintButton}
            onPress={handleHint}
            disabled={showHint || hasAnswered}
            accessibilityRole="button"
            accessibilityLabel="Show hint"
          >
            <MaterialIcons
              name="lightbulb-outline"
              size={28}
              color={
                showHint || hasAnswered
                  ? COLORS.outline
                  : COLORS.primary
              }
            />

            <Text
              style={[
                styles.hintButtonText,
                (showHint || hasAnswered) &&
                styles.disabledText,
              ]}
            >
              {showHint ? 'Hint Used' : 'Hint'}
            </Text>
          </Pressable>

          {hasAnswered && !isCorrect ? (
            <Pressable
              style={({ pressed }) => [
                styles.tryAgain,
                pressed &&
                styles.secondaryButtonPressed,
              ]}
              onPress={handleTryAgain}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <MaterialIcons
                name="refresh"
                size={26}
                color={COLORS.primary}
              />

              <Text style={styles.tryAgainText}>
                Try Again
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.next,
                !isCorrect && styles.nextDisabled,
              ]}
              onPress={handleNext}
              disabled={!isCorrect}
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
                  !isCorrect &&
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
                  isCorrect
                    ? COLORS.white
                    : COLORS.outline
                }
              />
            </Pressable>
          )}
        </View>
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
    fontWeight: '700',
    color: COLORS.primary,
  },

  progressTrack: {
    height: 9,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  scroll: {
    flex: 1,
  },

  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 130,
  },

  levelBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryContainer,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 14,
  },

  levelBadgeText: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  gameHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 20,
    lineHeight: 29,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    minHeight: 68,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statTextContainer: {
    flex: 1,
  },

  statLabel: {
    marginLeft: 9,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },

  statValue: {
    marginLeft: 9,
    marginTop: 2,
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  imageBox: {
    width: '80%',
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },

  imageTopPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    zIndex: 2,
    flexDirection: 'row',
    opacity: 0.8,
  },

  patternGreen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  patternBlue: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244, 250, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  successTitle: {
    marginTop: 14,
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.correctText,
    textAlign: 'center',
  },

  successSubtitle: {
    marginTop: 6,
    fontSize: 19,
    lineHeight: 28,
    color: COLORS.onSurface,
    textAlign: 'center',
  },

  pointsBadge: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: COLORS.correct,
    borderWidth: 1,
    borderColor: COLORS.correctBorder,
  },

  pointsBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.correctText,
  },

  hintBox: {
    width: '100%',
    marginBottom: 18,
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.secondaryContainer,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  hintContent: {
    flex: 1,
    marginLeft: 11,
  },

  hintTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 2,
  },

  hintText: {
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.onSurface,
  },

  options: {
    width: '100%',
    gap: 13,
  },

  option: {
    width: '100%',
    minHeight: 72,
    paddingHorizontal: 19,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.primary,
  },

  correct: {
    backgroundColor: COLORS.correct,
    borderColor: COLORS.correctBorder,
  },

  wrong: {
    backgroundColor: COLORS.wrong,
    borderColor: COLORS.wrongBorder,
  },

  optionText: {
    flex: 1,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  correctText: {
    color: COLORS.correctText,
  },

  wrongText: {
    color: COLORS.wrongText,
  },

  wrongMessage: {
    width: '100%',
    marginTop: 15,
    padding: 14,
    borderRadius: 13,
    backgroundColor: COLORS.wrong,
    borderWidth: 1,
    borderColor: COLORS.wrongBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  correctMessage: {
    width: '100%',
    marginTop: 15,
    padding: 14,
    borderRadius: 13,
    backgroundColor: COLORS.correct,
    borderWidth: 1,
    borderColor: COLORS.correctBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  feedbackContent: {
    flex: 1,
    marginLeft: 10,
  },

  wrongMessageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.wrongText,
    marginBottom: 2,
  },

  wrongMessageText: {
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.wrongText,
  },

  correctMessageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.correctText,
    marginBottom: 2,
  },

  correctMessageText: {
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.correctText,
  },

  bottomSpace: {
    height: 30,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 88,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  hintButton: {
    minHeight: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hintButtonText: {
    marginLeft: 7,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  disabledText: {
    color: COLORS.outline,
  },

  tryAgain: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tryAgainText: {
    marginLeft: 7,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  next: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  nextText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  nextTextDisabled: {
    color: COLORS.outline,
  },

  secondaryButtonPressed: {
    opacity: 0.75,
  },

  resultContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
  },

  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  resultTitle: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },

  resultMessage: {
    marginTop: 10,
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  scoreCard: {
    width: '100%',
    marginTop: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  scoreValue: {
    marginTop: 5,
    fontSize: 54,
    lineHeight: 64,
    fontWeight: '800',
    color: COLORS.primary,
  },

  scoreOutOf: {
    fontSize: 17,
    color: COLORS.onSurfaceVariant,
  },

  performanceCard: {
    width: '100%',
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  performanceRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  performanceText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    lineHeight: 25,
    color: COLORS.onSurface,
    fontWeight: '600',
  },

  primaryButton: {
    width: '100%',
    minHeight: 58,
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonPressed: {
    opacity: 0.8,
  },

  primaryButtonText: {
    marginLeft: 9,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },

  secondaryButton: {
    width: '100%',
    minHeight: 58,
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    marginLeft: 9,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
});