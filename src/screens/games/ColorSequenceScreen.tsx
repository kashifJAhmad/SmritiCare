import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const COLOR_PADS = [
  { id: 0, name: 'Emerald Green', hex: '#16A34A', lightHex: '#86EFAC', icon: 'eco' },
  { id: 1, name: 'Amber Gold', hex: '#D97706', lightHex: '#FDE68A', icon: 'wb-sunny' },
  { id: 2, name: 'Sky Blue', hex: '#0284C7', lightHex: '#7DD3FC', icon: 'water-drop' },
  { id: 3, name: 'Ruby Crimson', hex: '#DC2626', lightHex: '#FCA5A5', icon: 'favorite' },
] as const;

type ColorSequenceScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type Level = {
  level: number;
  difficulty: string;
  sequence: number[];
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    sequence: [0, 2], // Green -> Blue (2 steps)
    hint: 'Watch for Green then Blue.',
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    sequence: [1, 3, 0], // Amber -> Red -> Green (3 steps)
    hint: 'Starts with Gold, goes to Red, ends on Green.',
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    sequence: [2, 0, 1, 3], // Blue -> Green -> Gold -> Red (4 steps)
    hint: 'Water (Blue) -> Nature (Green) -> Sun (Gold) -> Heart (Red).',
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    sequence: [0, 3, 2, 1, 0], // Green -> Red -> Blue -> Gold -> Green (5 steps)
    hint: 'Starts and ends with Emerald Green.',
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Master',
    sequence: [1, 2, 0, 3, 1, 2], // Gold -> Blue -> Green -> Red -> Gold -> Blue (6 steps)
    hint: 'Gold and Blue appear twice in rhythm.',
    points: 100,
  },
];

export default function ColorSequenceScreen({
  userId,
  onBack,
  onNextGame,
}: ColorSequenceScreenProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'WATCH' | 'PLAY' | 'CORRECT' | 'WRONG'>('IDLE');
  const [attempts, setAttempts] = useState(0);
  const [completedScore, setCompletedScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const currentScore = useMemo(() => {
    if (status !== 'CORRECT') return 0;
    let score = currentLevel.points;
    if (showHint) score -= 20;
    if (attempts > 1) score -= (attempts - 1) * 20;
    return Math.max(score, 20);
  }, [status, showHint, attempts, currentLevel.points]);

  // Clear all pending playback timeouts on unmount or level change
  const clearTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // Start watching sequence automatically on level load
  useEffect(() => {
    playSequence();
  }, [currentLevelIndex]);

  const playSequence = () => {
    clearTimeouts();
    setUserSequence([]);
    setStatus('WATCH');
    setIsPlayingSequence(true);
    setActivePad(null);

    const sequence = currentLevel.sequence;
    const stepDelay = 800;
    const flashDuration = 450;

    sequence.forEach((padIndex, i) => {
      const onTimeout = setTimeout(() => {
        setActivePad(padIndex);
      }, (i + 1) * stepDelay);

      const offTimeout = setTimeout(() => {
        setActivePad(null);
      }, (i + 1) * stepDelay + flashDuration);

      timeoutsRef.current.push(onTimeout, offTimeout);
    });

    const finishTimeout = setTimeout(() => {
      setIsPlayingSequence(false);
      setStatus('PLAY');
    }, (sequence.length + 1) * stepDelay);

    timeoutsRef.current.push(finishTimeout);
  };

  useEffect(() => {
    if (gameFinished) {
      const finalScore = completedScore;
      const maxScore = LEVELS.length * 100;
      const percentage = Math.min(100, Math.max(0, Math.round((finalScore / maxScore) * 100)));
      const targetUserId = userId || 'patient_local';

      saveGameResultLocally({
        userId: targetUserId,
        gameName: 'color-sequence',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving game result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: Math.min(100, Math.round(percentage * 1.1)),
        attention: percentage,
        reaction: 92,
      }).catch((err) => console.warn('Failed saving cognitive score locally:', err));

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, userId]);

  const handlePadPress = (padId: number) => {
    if (isPlayingSequence || status === 'WATCH' || status === 'CORRECT') {
      return;
    }

    // Flash pressed pad
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 250);

    const nextUserSeq = [...userSequence, padId];
    setUserSequence(nextUserSeq);

    const stepIndex = nextUserSeq.length - 1;
    if (currentLevel.sequence[stepIndex] !== padId) {
      // Wrong tap
      setStatus('WRONG');
      setAttempts((prev) => prev + 1);
      return;
    }

    // Correct tap so far! Check if completed
    if (nextUserSeq.length === currentLevel.sequence.length) {
      setStatus('CORRECT');
    }
  };

  const handleNext = () => {
    if (status !== 'CORRECT') return;
    setCompletedScore((prev) => prev + currentScore);

    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setShowHint(false);
      setAttempts(0);
    } else {
      setGameFinished(true);
    }
  };

  const handleRetry = () => {
    playSequence();
  };

  const handleRestart = () => {
    setCurrentLevelIndex(0);
    setUserSequence([]);
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
              <MaterialIcons name="palette" size={64} color="#16A34A" />
            </View>
            <Text style={styles.resultTitle}>Sequence Master!</Text>
            <Text style={styles.resultSubtitle}>
              You remembered all color patterns with incredible focus!
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
            <Text style={styles.headerTitle}>Color Sequence</Text>
            <Text style={styles.headerSubtitle}>
              Level {currentLevel.level} of {LEVELS.length} ({currentLevel.sequence.length} steps)
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.scoreBadge}>
              {completedScore + (status === 'CORRECT' ? currentScore : 0)} pts
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
          {/* STATUS BANNER */}
          <View
            style={[
              styles.statusBanner,
              status === 'WATCH' && styles.statusWatch,
              status === 'PLAY' && styles.statusPlay,
              status === 'CORRECT' && styles.statusCorrect,
              status === 'WRONG' && styles.statusWrong,
            ]}
          >
            <MaterialIcons
              name={
                status === 'WATCH'
                  ? 'visibility'
                  : status === 'PLAY'
                  ? 'touch-app'
                  : status === 'CORRECT'
                  ? 'check-circle'
                  : 'error'
              }
              size={24}
              color={
                status === 'WATCH'
                  ? '#0284C7'
                  : status === 'PLAY'
                  ? COLORS.primary
                  : status === 'CORRECT'
                  ? COLORS.correctText
                  : COLORS.wrongText
              }
            />
            <Text
              style={[
                styles.statusText,
                status === 'WATCH' && { color: '#0284C7' },
                status === 'PLAY' && { color: COLORS.primary },
                status === 'CORRECT' && { color: COLORS.correctText },
                status === 'WRONG' && { color: COLORS.wrongText },
              ]}
            >
              {status === 'WATCH'
                ? 'Watch the glowing sequence...'
                : status === 'PLAY'
                ? `Your turn: Tap colors (${userSequence.length}/${currentLevel.sequence.length})`
                : status === 'CORRECT'
                ? `Perfect! +${currentScore} points`
                : 'Oops! Pattern missed. Tap Replay.'}
            </Text>
          </View>

          {/* COLOR PADS GRID */}
          <View style={styles.padsGrid}>
            {COLOR_PADS.map((pad) => {
              const isActive = activePad === pad.id;
              return (
                <Pressable
                  key={pad.id}
                  disabled={isPlayingSequence || status === 'CORRECT'}
                  style={[
                    styles.colorPad,
                    {
                      backgroundColor: isActive ? pad.lightHex : pad.hex,
                      transform: [{ scale: isActive ? 1.05 : 1 }],
                      borderColor: isActive ? '#FFFFFF' : 'transparent',
                    },
                  ]}
                  onPress={() => handlePadPress(pad.id)}
                >
                  <MaterialIcons
                    name={pad.icon as keyof typeof MaterialIcons.glyphMap}
                    size={38}
                    color="#FFFFFF"
                  />
                  <Text style={styles.padLabel}>{pad.name}</Text>
                </Pressable>
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

          {/* FOOTER ACTIONS */}
          <View style={styles.actionsRow}>
            {status !== 'CORRECT' && (
              <Pressable
                style={styles.replayButton}
                disabled={isPlayingSequence}
                onPress={handleRetry}
              >
                <MaterialIcons name="replay" size={20} color={COLORS.secondary} />
                <Text style={styles.replayButtonText}>Replay Sequence</Text>
              </Pressable>
            )}

            {!showHint && status !== 'CORRECT' && (
              <Pressable
                style={styles.hintButton}
                onPress={() => setShowHint(true)}
              >
                <MaterialIcons name="lightbulb-outline" size={20} color={COLORS.warningBorder} />
                <Text style={styles.hintButtonText}>Hint</Text>
              </Pressable>
            )}

            {status === 'CORRECT' && (
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusWatch: {
    backgroundColor: '#E0F2FE',
  },
  statusPlay: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  statusCorrect: {
    backgroundColor: COLORS.correct,
  },
  statusWrong: {
    backgroundColor: COLORS.wrong,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
  },
  padsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorPad: {
    width: '47%',
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  padLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.secondaryContainer,
  },
  replayButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.warning,
  },
  hintButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warningText,
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
    backgroundColor: '#DCFCE7',
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
