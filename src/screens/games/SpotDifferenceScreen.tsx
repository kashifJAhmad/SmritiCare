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

type SpotDifferenceScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type PanelTile = {
  id: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  label: string;
};

type Level = {
  level: number;
  difficulty: string;
  title: string;
  instruction: string;
  panelA: PanelTile[];
  panelB: PanelTile[];
  diffTileIndex: number;
  hint: string;
  points: number;
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    title: 'Spot the Altered Item',
    instruction: 'Look at Panel A and Panel B. Tap the tile on Panel B that is different!',
    panelA: [
      { id: 0, icon: 'local-florist', color: '#16A34A', label: 'Leaf' },
      { id: 1, icon: 'wb-sunny', color: '#EAB308', label: 'Sun' },
      { id: 2, icon: 'eco', color: '#059669', label: 'Sprout' },
      { id: 3, icon: 'water-drop', color: '#0284C7', label: 'Water' },
    ],
    panelB: [
      { id: 0, icon: 'local-florist', color: '#16A34A', label: 'Leaf' },
      { id: 1, icon: 'wb-cloudy', color: '#94A3B8', label: 'Cloud' }, // Changed icon/color
      { id: 2, icon: 'eco', color: '#059669', label: 'Sprout' },
      { id: 3, icon: 'water-drop', color: '#0284C7', label: 'Water' },
    ],
    diffTileIndex: 1,
    hint: 'Look closely at the top right weather symbol in Panel B.',
    points: 100,
  },
  {
    level: 2,
    difficulty: 'Easy +',
    title: 'Color Variation',
    instruction: 'Find the tile where the color has changed on Panel B.',
    panelA: [
      { id: 0, icon: 'star', color: '#EAB308', label: 'Gold Star' },
      { id: 1, icon: 'favorite', color: '#E11D48', label: 'Red Heart' },
      { id: 2, icon: 'shield', color: '#2563EB', label: 'Blue Shield' },
      { id: 3, icon: 'diamond', color: '#9333EA', label: 'Purple Gem' },
    ],
    panelB: [
      { id: 0, icon: 'star', color: '#EAB308', label: 'Gold Star' },
      { id: 1, icon: 'favorite', color: '#E11D48', label: 'Red Heart' },
      { id: 2, icon: 'shield', color: '#94A3B8', label: 'Grey Shield' }, // Changed color
      { id: 3, icon: 'diamond', color: '#9333EA', label: 'Purple Gem' },
    ],
    diffTileIndex: 2,
    hint: 'Look at the bottom left shield in Panel B.',
    points: 100,
  },
  {
    level: 3,
    difficulty: 'Medium',
    title: 'Festival Symbols Grid',
    instruction: 'Inspect the 6 festive items. Which one is changed on Panel B?',
    panelA: [
      { id: 0, icon: 'celebration', color: '#D97706', label: 'Sparkler' },
      { id: 1, icon: 'music-note', color: '#059669', label: 'Melody' },
      { id: 2, icon: 'restaurant', color: '#DC2626', label: 'Feast' },
      { id: 3, icon: 'temple-buddhist', color: '#EA580C', label: 'Temple' },
      { id: 4, icon: 'auto-awesome', color: '#7C3AED', label: 'Glow' },
      { id: 5, icon: 'palette', color: '#2563EB', label: 'Colors' },
    ],
    panelB: [
      { id: 0, icon: 'celebration', color: '#D97706', label: 'Sparkler' },
      { id: 1, icon: 'music-note', color: '#059669', label: 'Melody' },
      { id: 2, icon: 'restaurant', color: '#DC2626', label: 'Feast' },
      { id: 3, icon: 'temple-buddhist', color: '#EA580C', label: 'Temple' },
      { id: 4, icon: 'hotel-class', color: '#64748B', label: 'Silver Star' }, // Changed item
      { id: 5, icon: 'palette', color: '#2563EB', label: 'Colors' },
    ],
    diffTileIndex: 4,
    hint: 'Compare the middle item on the bottom row of both panels.',
    points: 100,
  },
  {
    level: 4,
    difficulty: 'Medium +',
    title: 'Nature Scene Differences',
    instruction: 'Carefully compare the wildlife & landscape grid.',
    panelA: [
      { id: 0, icon: 'pets', color: '#854D0E', label: 'Tiger Paw' },
      { id: 1, icon: 'terrain', color: '#15803D', label: 'Hills' },
      { id: 2, icon: 'waves', color: '#0284C7', label: 'River' },
      { id: 3, icon: 'park', color: '#166534', label: 'Banyan Tree' },
      { id: 4, icon: 'wb-twilight', color: '#F97316', label: 'Sunrise' },
      { id: 5, icon: 'grass', color: '#65A30D', label: 'Meadow' },
    ],
    panelB: [
      { id: 0, icon: 'pets', color: '#854D0E', label: 'Tiger Paw' },
      { id: 1, icon: 'terrain', color: '#15803D', label: 'Hills' },
      { id: 2, icon: 'waves', color: '#0284C7', label: 'River' },
      { id: 3, icon: 'yard', color: '#D97706', label: 'Autumn Plant' }, // Changed
      { id: 4, icon: 'wb-twilight', color: '#F97316', label: 'Sunrise' },
      { id: 5, icon: 'grass', color: '#65A30D', label: 'Meadow' },
    ],
    diffTileIndex: 3,
    hint: 'Look at the tree in Panel B compared to the lush banyan tree in Panel A.',
    points: 100,
  },
  {
    level: 5,
    difficulty: 'Master',
    title: 'Subtle Pattern Spotting',
    instruction: 'Find the single altered symbol in this rich cultural grid.',
    panelA: [
      { id: 0, icon: 'checkroom', color: '#B45309', label: 'Silk' },
      { id: 1, icon: 'dry-cleaning', color: '#DC2626', label: 'Gamosa' },
      { id: 2, icon: 'audiotrack', color: '#059669', label: 'Pepa' },
      { id: 3, icon: 'emoji-events', color: '#EAB308', label: 'Prize' },
      { id: 4, icon: 'local-cafe', color: '#92400E', label: 'Assam Tea' },
      { id: 5, icon: 'wb-sunny', color: '#F59E0B', label: 'Bihu Sun' },
    ],
    panelB: [
      { id: 0, icon: 'checkroom', color: '#B45309', label: 'Silk' },
      { id: 1, icon: 'dry-cleaning', color: '#DC2626', label: 'Gamosa' },
      { id: 2, icon: 'volume-mute', color: '#64748B', label: 'Mute' }, // Changed
      { id: 3, icon: 'emoji-events', color: '#EAB308', label: 'Prize' },
      { id: 4, icon: 'local-cafe', color: '#92400E', label: 'Assam Tea' },
      { id: 5, icon: 'wb-sunny', color: '#F59E0B', label: 'Bihu Sun' },
    ],
    diffTileIndex: 2,
    hint: 'Check the musical audio symbol in the first row.',
    points: 100,
  },
];

export default function SpotDifferenceScreen({
  userId,
  onBack,
  onNextGame,
}: SpotDifferenceScreenProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completedScore, setCompletedScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];
  const isCorrect = selectedTile === currentLevel.diffTileIndex;
  const hasAnswered = selectedTile !== null;

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
        gameName: 'spot-difference',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving game result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: percentage,
        attention: Math.min(100, Math.round(percentage * 1.1)),
        reaction: 86,
      }).catch((err) => console.warn('Failed saving cognitive score locally:', err));

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, currentScore, userId]);

  const handleTilePress = (index: number) => {
    if (hasAnswered && isCorrect) return;
    setSelectedTile(index);
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
      setSelectedTile(null);
      setShowHint(false);
      setAttempts(0);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentLevelIndex(0);
    setSelectedTile(null);
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
              <MaterialIcons name="search" size={64} color="#00629E" />
            </View>
            <Text style={styles.resultTitle}>Eagle Eyes!</Text>
            <Text style={styles.resultSubtitle}>
              You spotted every difference across all levels!
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
            <Text style={styles.headerTitle}>Spot the Difference</Text>
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
          <Text style={styles.questionTitle}>{currentLevel.title}</Text>
          <Text style={styles.instructionText}>{currentLevel.instruction}</Text>

          {/* PANELS COMPARISON CONTAINER */}
          <View style={styles.panelsContainer}>
            {/* PANEL A (ORIGINAL) */}
            <View style={styles.panelBox}>
              <View style={styles.panelHeaderBadge}>
                <Text style={styles.panelHeaderText}>Panel A (Original)</Text>
              </View>
              <View style={styles.gridContainer}>
                {currentLevel.panelA.map((tile) => (
                  <View key={tile.id} style={styles.staticTile}>
                    <MaterialIcons name={tile.icon} size={30} color={tile.color} />
                    <Text style={styles.tileLabel}>{tile.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* PANEL B (FIND THE DIFFERENCE) */}
            <View style={styles.panelBoxActive}>
              <View style={styles.panelHeaderBadgeActive}>
                <Text style={styles.panelHeaderTextActive}>Panel B (Tap Difference)</Text>
              </View>
              <View style={styles.gridContainer}>
                {currentLevel.panelB.map((tile, idx) => {
                  const isSelected = selectedTile === idx;
                  const isDiff = idx === currentLevel.diffTileIndex;

                  let tileStyle = styles.interactiveTile;
                  if (hasAnswered && isSelected) {
                    tileStyle = isCorrect ? styles.tileCorrect : styles.tileWrong;
                  }

                  return (
                    <Pressable
                      key={tile.id}
                      style={tileStyle}
                      onPress={() => handleTilePress(idx)}
                    >
                      <MaterialIcons name={tile.icon} size={30} color={tile.color} />
                      <Text style={styles.tileLabel}>{tile.label}</Text>
                      {hasAnswered && isSelected && (
                        <View style={styles.indicatorBadge}>
                          <MaterialIcons
                            name={isCorrect ? 'check' : 'close'}
                            size={16}
                            color="#FFF"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* HINT BOX */}
          {showHint && (
            <View style={styles.hintContainer}>
              <MaterialIcons name="lightbulb" size={20} color={COLORS.warningBorder} />
              <Text style={styles.hintText}>{currentLevel.hint}</Text>
            </View>
          )}

          {/* FEEDBACK */}
          {hasAnswered && (
            <View style={styles.feedbackContainer}>
              {isCorrect ? (
                <View style={styles.feedbackBannerCorrect}>
                  <MaterialIcons name="check" size={24} color={COLORS.correctText} />
                  <Text style={styles.feedbackTextCorrect}>
                    Found it! Great eye! +{currentScore} points
                  </Text>
                </View>
              ) : (
                <View style={styles.feedbackBannerWrong}>
                  <MaterialIcons name="close" size={24} color={COLORS.wrongText} />
                  <Text style={styles.feedbackTextWrong}>
                    That tile is identical in both panels. Look again!
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
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 20,
  },
  panelsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  panelBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
  },
  panelBoxActive: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 12,
  },
  panelHeaderBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  panelHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  panelHeaderBadgeActive: {
    backgroundColor: COLORS.primaryContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  panelHeaderTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  staticTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    minHeight: 70,
  },
  interactiveTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    minHeight: 70,
  },
  tileCorrect: {
    width: '48%',
    backgroundColor: COLORS.correct,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.correctBorder,
    minHeight: 70,
  },
  tileWrong: {
    width: '48%',
    backgroundColor: COLORS.wrong,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.wrongBorder,
    minHeight: 70,
  },
  indicatorBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: 4,
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
