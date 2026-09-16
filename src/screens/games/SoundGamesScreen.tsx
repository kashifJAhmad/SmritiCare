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

type SoundGamesScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Level = {
  level: number;
  difficulty: string;
  soundTitle: string;
  soundDescription: string;
  soundType: string;
  options: { label: string; icon: keyof typeof MaterialIcons.glyphMap }[];
  correctIndex: number;
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    soundTitle: 'Temple & Prayer Chime',
    soundDescription: 'Resonant bronze reverberations echoing during morning and evening prayers.',
    soundType: '“Tinnng... Tinnng... Tinnng...”',
    options: [
      { label: 'Temple Bell (Ghanta)', icon: 'notifications-active' },
      { label: 'Train Horn', icon: 'directions-transit' },
      { label: 'Drill Machine', icon: 'handyman' },
    ],
    correctIndex: 0,
    hint: 'Heard at places of worship, inviting calm and reverence.',
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    soundTitle: 'Monsoon Rhythm',
    soundDescription: 'Gentle rhythmic patter falling softly on tin roofs and green leaves.',
    soundType: '“Tip-tip... Patter-patter... Shhh...”',
    options: [
      { label: 'Gentle Rain on Leaves', icon: 'umbrella' },
      { label: 'Car Engine', icon: 'directions-car' },
      { label: 'Hammer on Steel', icon: 'build' },
    ],
    correctIndex: 0,
    hint: 'Brings coolness and fertile soil to the Brahmaputra valley.',
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    soundTitle: 'Morning Dawn Chorus',
    soundDescription: 'Sweet high-pitched melodic calls greeting the rising sun at dawn.',
    soundType: '“Chirp-chirp... Tweet-tweet... Koo-koo...”',
    options: [
      { label: 'Morning Songbirds (Kuku & Sparrows)', icon: 'flutter-dash' },
      { label: 'Traffic Siren', icon: 'emergency' },
      { label: 'Vacuum Cleaner', icon: 'cleaning-services' },
    ],
    correctIndex: 0,
    hint: 'Awakens villagers and tea garden workers before sunrise.',
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    soundTitle: 'Spring Festival Melody',
    soundDescription: 'Piercing, spirited horn tune signaling festive Bihu open-air dances.',
    soundType: '“Peeep-peee-roooo... Dha-dhin-ta!”',
    options: [
      { label: 'Buffalo Horn Pepa & Dhol Beat', icon: 'music-note' },
      { label: 'Airplane Roar', icon: 'flight' },
      { label: 'Telephone Ring', icon: 'phone' },
    ],
    correctIndex: 0,
    hint: 'Crafted from buffalo horn, played with boundless energy in Rongali Bihu.',
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Master',
    soundTitle: 'Mighty River Current',
    soundDescription: 'Deep rushing water swirling gently against wooden river boats and banks.',
    soundType: '“Chhal-chhal... Swish-swish... Whooosh...”',
    options: [
      { label: 'Flowing Brahmaputra River Water', icon: 'water' },
      { label: 'Electric Blender', icon: 'blender' },
      { label: 'Door Knocker', icon: 'sensor-door' },
    ],
    correctIndex: 0,
    hint: 'The lifeline of the North East, carrying ferries and fishing boats.',
    points: 100,
  },
];

export default function SoundGamesScreen({
  userId,
  onBack,
  onNextGame,
}: SoundGamesScreenProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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
        gameName: 'sound-games',
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
  }, [gameFinished, completedScore, currentScore, userId]);

  const handlePlaySound = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2000);
  };

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
      setIsPlayingAudio(false);
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
    setIsPlayingAudio(false);
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
              <MaterialIcons name="hearing" size={64} color="#00629E" />
            </View>
            <Text style={styles.resultTitle}>Auditory Acuity!</Text>
            <Text style={styles.resultSubtitle}>
              You identified all natural and cultural sounds with precision!
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
            <Text style={styles.headerTitle}>Sound Recognition Game</Text>
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
          <Text style={styles.soundTitle}>{currentLevel.soundTitle}</Text>
          <Text style={styles.soundDescription}>{currentLevel.soundDescription}</Text>

          {/* AUDIO PLAYER & SOUNDWAVE DISPLAY */}
          <Pressable
            style={[
              styles.audioPlayerBox,
              isPlayingAudio && styles.audioPlayerBoxPlaying,
            ]}
            onPress={handlePlaySound}
          >
            <View style={styles.speakerCircle}>
              <MaterialIcons
                name={isPlayingAudio ? 'volume-up' : 'play-circle-fill'}
                size={40}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.soundWaveContainer}>
              <Text style={styles.soundTypeText}>{currentLevel.soundType}</Text>
              <Text style={styles.tapToPlayPrompt}>
                {isPlayingAudio ? 'Playing sound cue...' : 'Tap to Listen to Sound'}
              </Text>
            </View>
          </Pressable>

          {/* QUESTION PROMPT */}
          <Text style={styles.questionPrompt}>
            What is the source of this familiar sound?
          </Text>

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
                  <View style={styles.optionIconCircle}>
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
                    Spot on! Sound matched! +{currentScore} points
                  </Text>
                </View>
              ) : (
                <View style={styles.feedbackBannerWrong}>
                  <MaterialIcons name="close" size={24} color={COLORS.wrongText} />
                  <Text style={styles.feedbackTextWrong}>
                    That is not the sound source. Try listening again!
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
  soundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  soundDescription: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 20,
  },
  audioPlayerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#93C5FD',
    marginBottom: 18,
  },
  audioPlayerBoxPlaying: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  speakerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  soundWaveContainer: {
    flex: 1,
  },
  soundTypeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  tapToPlayPrompt: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  questionPrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 14,
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
  optionIconCircle: {
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
