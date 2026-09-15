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

type OddOneOutScreenProps = {
  userId?: string;
  onBack?: () => void;
  onNextGame?: () => void;
};

type LevelItem = {
  name: string;
  image: string;
  correct: boolean;
};

type Level = {
  level: number;
  difficulty: string;
  title: string;
  instruction: string;
  hint: string;
  items: LevelItem[];
  points: number;
};

const COLORS = {
  background: '#F4FAFF',
  surface: '#FFFFFF',
  white: '#FFFFFF',

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
};

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: 'Easy',
    title: 'Find the Odd One Out',
    instruction:
      'Three pictures belong together. Tap the one that is different.',
    hint: 'Look for the picture that is not a traditional Assamese item.',
    points: 100,
    items: [
      {
        name: 'Japi',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RCf0aIlddQrW0qAA0zh_ww8C8hnrf57NjgejCfmJg6xCwMXGYM8stRcclpf0AlBwAXxLr1_c7dQAK23xdur4eL-72xGblWYlklqmZpFF4WVT76jJPiIQJJ1KaKlwrgy1i2cvdKwmZGBG4vR-L1CqJD54qD7mHgmE6EiXfHVq3QhtIO8DZemYk8qsrUcyNWlUENJl47VyiKAQdREHBbjbUn8hjPWb2RJOcx9wTKeOBV97T_OxE2fPRg',
      },
      {
        name: 'Mekhela Pattern',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAA2samXy6OvSLObtVBzi5tBWssQARzabgU_qihl24vMHVRaz9rIbmoRnD7DluxGqf7xkkpuzNi6GlU1H23mhRghyU1KwNKgHAwi5l6d1MM8GWJsnrtclwaoUAGMSVVT-cn-AkdPPlhglo0AZNQFxSGpQlzpUfg1c5XLXbPsyUL2XHh2GFfmm4zszX5bTHvv5PKVT1MnI31Xlc6j6k07anyIuPJvYYUFDGtq7hQsHONpWi_msucCALjUw',
      },
      {
        name: 'Computer Mouse',
        correct: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBa4MKzj7z4GZeSauCw6PZSxg3I2FIPl5VAKANcnV46BfFCI5Bk62lSvF6_IPXtOoY4_erNSYE5M9MV9l5t2K7Jr3i_k2oCRPgwWR7eb-NI29SDu07odVp1ZKTLnr5nofPehVLZcXVyvZjHpJ2aKI9L_UGWtcmGcEAHeOD1Urkb9Wf0lUWfndZBUGG5uKAlB6nMO5ZHqrlHJemv9tCEyMQVOY5Gd3_Vvkc9pFnbrO1sC8pb-kEshH4qGA',
      },
      {
        name: 'Gamocha',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuATfNI38nw8qqgsjrNwYqfr5YcUAdXCkxWLMMHtzcrzO6uzGD5xotIYCaHGXarmY_2WSIODlo2QmATeS8App58sbnhN-Av_aQcnneOZ0bc6K3ut5c7yEfmmkbMXqAXHCrd2qmv7FmvNniOGNxW1mSSGcZJgiIcYN63a03HCtABu1Z20bEGman_Trfj75kI1Hn8X_7Lmi2k63TYy9pJOc4Ey8A3K1agg3__mQf0IUhdzWFdqXSwSdhDxkg',
      },
    ],
  },

  {
    level: 2,
    difficulty: 'Easy +',
    title: 'Find the Different Picture',
    instruction:
      'Look carefully at all four pictures and find the one that does not belong.',
    hint:
      'Three pictures are related to food. Find the picture that is not food.',
    points: 100,
    items: [
      {
        name: 'Til Pitha',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBo7HwLzT3J9MHMexrcDWNZebRpTQUOvu-OLLoc1UdaAdPEmAg3s4hDFHDgJqbHgGEw24uE9asnqHymmLCZ7-n0tbPUJiBsFHIz56XHs4dYLFtH7Nen-cNUhP7nBe5Jp-QPcKrR6UxYGWkRybCXliNFZg-3m0g168yDP1pzyl9sWgMftpse_pY6XVh9jr9RtO3DR6ZyC8Cq13EWFwP7WJYD6FSzmd9Id9CpuFiMDxKOEUIFyEbx_IwEnw',
      },
      {
        name: 'Masor Tenga',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuArDqK7kNSbVG7hVPScNDmyUDBl4a4HcMUVU13Kj2qeQvxP88V-yGj28hi6eyH2giSr1Xf_f9hTrPn21vtJZLHg42s6i1qXTOF5u-KOs4lGSpSyb58OsZREoT1r6e7jrMQIjyipLTwDQN6UHhnMnc7OU2sLd1ZiEdFja0-7QrVKUjwIp10BW6jdozb7uyfU5cuEs35Do6GXukNhufmmYU6nRvAR16kAlBEl65qyOywl2m1i241bxlHF7g',
      },
      {
        name: 'Jadoh',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuALMMCtPYoYzP9-53v5Ct4ZZQ3EohZfvFDHR0MA6Cv2FL13Aemk_SUYWEZFryFw2GRp2voKwcSdKmm5vphgYlmonqUWk8Ywn3whjpFZJSBYrdImX2Oh04QiqXGv_lfNFi_1BVxTJBb2A3PZGf7EDIuO19mwTlCGd_2iwZeDesHZnYTyewGDgi1fyQIdziZPrrSpzwbiLz3_WhgEjP1VLy1dKm_RU2QtgoWQ3V1qBl-Y7Hffm9eGctZmrg',
      },
      {
        name: 'Bamboo Basket',
        correct: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RCf0aIlddQrW0qAA0zh_ww8C8hnrf57NjgejCfmJg6xCwMXGYM8stRcclpf0AlBwAXxLr1_c7dQAK23xdur4eL-72xGblWYlklqmZpFF4WVT76jJPiIQJJ1KaKlwrgy1i2cvdKwmZGBG4vR-L1CqJD54qD7mHgmE6EiXfHVq3QhtIO8DZemYk8qsrUcyNWlUENJl47VyiKAQdREHBbjbUn8hjPWb2RJOcx9wTKeOBV97T_OxE2fPRg',
      },
    ],
  },

  {
    level: 3,
    difficulty: 'Medium',
    title: 'Think Carefully',
    instruction:
      'The pictures are becoming more similar. Which one does not belong?',
    hint:
      'Three pictures are traditional Northeast Indian foods. Find the object.',
    points: 100,
    items: [
      {
        name: 'Jadoh',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuALMMCtPYoYzP9-53v5Ct4ZZQ3EohZfvFDHR0MA6Cv2FL13Aemk_SUYWEZFryFw2GRp2voKwcSdKmm5vphgYlmonqUWk8Ywn3whjpFZJSBYrdImX2Oh04QiqXGv_lfNFi_1BVxTJBb2A3PZGf7EDIuO19mwTlCGd_2iwZeDesHZnYTyewGDgi1fyQIdziZPrrSpzwbiLz3_WhgEjP1VLy1dKm_RU2QtgoWQ3V1qBl-Y7Hffm9eGctZmrg',
      },
      {
        name: 'Iromba',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBrqMWBwBHhlSXS0mABk4Qe_ckHx-RjVfT6TI0PxRHZT1MX4Su5_ESrhEhIEcJUR0SixtabfDT70Wwk8g37X5CZ6FkIGYfDaMLJSuz16nsDXC9xoMukeMMQeE2Bcut2O4SEbNX8OPLH5SQGWRwEUqpgaHzPK6KTWaqKCVzLvxwCsUxAvEIC8KwfjpYMZ-PSe1tRchAEBONqHQnR1S1KhxkNQ4j_we0TU4gJG-tspgUxJ_sZQFAFiqzijA',
      },
      {
        name: 'Masor Tenga',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuArDqK7kNSbVG7hVPScNDmyUDBl4a4HcMUVU13Kj2qeQvxP88V-yGj28hi6eyH2giSr1Xf_f9hTrPn21vtJZLHg42s6i1qXTOF5u-KOs4lGSpSyb58OsZREoT1r6e7jrMQIjyipLTwDQN6UHhnMnc7OU2sLd1ZiEdFja0-7QrVKUjwIp10BW6jdozb7uyfU5cuEs35Do6GXukNhufmmYU6nRvAR16kAlBEl65qyOywl2m1i241bxlHF7g',
      },
      {
        name: 'Traditional Drum',
        correct: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RCf0aIlddQrW0qAA0zh_ww8C8hnrf57NjgejCfmJg6xCwMXGYM8stRcclpf0AlBwAXxLr1_c7dQAK23xdur4eL-72xGblWYlklqmZpFF4WVT76jJPiIQJJ1KaKlwrgy1i2cvdKwmZGBG4vR-L1CqJD54qD7mHgmE6EiXfHVq3QhtIO8DZemYk8qsrUcyNWlUENJl47VyiKAQdREHBbjbUn8hjPWb2RJOcx9wTKeOBV97T_OxE2fPRg',
      },
    ],
  },

  {
    level: 4,
    difficulty: 'Medium +',
    title: 'Challenge Round',
    instruction:
      'Take your time. One picture is different from the other three.',
    hint:
      'Three pictures are connected with traditional clothing or culture. Find the unrelated object.',
    points: 100,
    items: [
      {
        name: 'Mekhela Pattern',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAA2samXy6OvSLObtVBzi5tBWssQARzabgU_qihl24vMHVRaz9rIbmoRnD7DluxGqf7xkkpuzNi6GlU1H23mhRghyU1KwNKgHAwi5l6d1MM8GWJsnrtclwaoUAGMSVVT-cn-AkdPPlhglo0AZNQFxSGpQlzpUfg1c5XLXbPsyUL2XHh2GFfmm4zszX5bTHvv5PKVT1MnI31Xlc6j6k07anyIuPJvYYUFDGtq7hQsHONpWi_msucCALjUw',
      },
      {
        name: 'Gamocha',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuATfNI38nw8qqgsjrNwYqfr5YcUAdXCkxWLMMHtzcrzO6uzGD5xotIYCaHGXarmY_2WSIODlo2QmATeS8App58sbnhN-Av_aQcnneOZ0bc6K3ut5c7yEfmmkbMXqAXHCrd2qmv7FmvNniOGNxW1mSSGcZJgiIcYN63a03HCtABu1Z20bEGman_Trfj75kI1Hn8X_7Lmi2k63TYy9pJOc4Ey8A3K1agg3__mQf0IUhdzWFdqXSwSdhDxkg',
      },
      {
        name: 'Japi',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RCf0aIlddQrW0qAA0zh_ww8C8hnrf57NjgejCfmJg6xCwMXGYM8stRcclpf0AlBwAXxLr1_c7dQAK23xdur4eL-72xGblWYlklqmZpFF4WVT76jJPiIQJJ1KaKlwrgy1i2cvdKwmZGBG4vR-L1CqJD54qD7mHgmE6EiXfHVq3QhtIO8DZemYk8qsrUcyNWlUENJl47VyiKAQdREHBbjbUn8hjPWb2RJOcx9wTKeOBV97T_OxE2fPRg',
      },
      {
        name: 'Computer Mouse',
        correct: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBa4MKzj7z4GZeSauCw6PZSxg3I2FIPl5VAKANcnV46BfFCI5Bk62lSvF6_IPXtOoY4_erNSYE5M9MV9l5t2K7Jr3i_k2oCRPgwWR7eb-NI29SDu07odVp1ZKTLnr5nofPehVLZcXVyvZjHpJ2aKI9L_UGWtcmGcEAHeOD1Urkb9Wf0lUWfndZBUGG5uKAlB6nMO5ZHqrlHJemv9tCEyMQVOY5Gd3_Vvkc9pFnbrO1sC8pb-kEshH4qGA',
      },
    ],
  },

  {
    level: 5,
    difficulty: 'Challenge',
    title: 'Final Challenge',
    instruction:
      'This is the final level. Look carefully and choose the picture that does not belong.',
    hint:
      'Three pictures are connected with traditional food. Find the item that is not something you eat.',
    points: 100,
    items: [
      {
        name: 'Til Pitha',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBo7HwLzT3J9MHMexrcDWNZebRpTQUOvu-OLLoc1UdaAdPEmAg3s4hDFHDgJqbHgGEw24uE9asnqHymmLCZ7-n0tbPUJiBsFHIz56XHs4dYLFtH7Nen-cNUhP7nBe5Jp-QPcKrR6UxYGWkRybCXliNFZg-3m0g168yDP1pzyl9sWgMftpse_pY6XVh9jr9RtO3DR6ZyC8Cq13EWFwP7WJYD6FSzmd9Id9CpuFiMDxKOEUIFyEbx_IwEnw',
      },
      {
        name: 'Jadoh',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuALMMCtPYoYzP9-53v5Ct4ZZQ3EohZfvFDHR0MA6Cv2FL13Aemk_SUYWEZFryFw2GRp2voKwcSdKmm5vphgYlmonqUWk8Ywn3whjpFZJSBYrdImX2Oh04QiqXGv_lfNFi_1BVxTJBb2A3PZGf7EDIuO19mwTlCGd_2iwZeDesHZnYTyewGDgi1fyQIdziZPrrSpzwbiLz3_WhgEjP1VLy1dKm_RU2QtgoWQ3V1qBl-Y7Hffm9eGctZmrg',
      },
      {
        name: 'Iromba',
        correct: false,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBrqMWBwBHhlSXS0mABk4Qe_ckHx-RjVfT6TI0PxRHZT1MX4Su5_ESrhEhIEcJUR0SixtabfDT70Wwk8g37X5CZ6FkIGYfDaMLJSuz16nsDXC9xoMukeMMQeE2Bcut2O4SEbNX8OPLH5SQGWRwEUqpgaHzPK6KTWaqKCVzLvxwCsUxAvEIC8KwfjpYMZ-PSe1tRchAEBONqHQnR1S1KhxkNQ4j_we0TU4gJG-tspgUxJ_sZQFAFiqzijA',
      },
      {
        name: 'Japi',
        correct: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RCf0aIlddQrW0qAA0zh_ww8C8hnrf57NjgejCfmJg6xCwMXGYM8stRcclpf0AlBwAXxLr1_c7dQAK23xdur4eL-72xGblWYlklqmZpFF4WVT76jJPiIQJJ1KaKlwrgy1i2cvdKwmZGBG4vR-L1CqJD54qD7mHgmE6EiXfHVq3QhtIO8DZemYk8qsrUcyNWlUENJl47VyiKAQdREHBbjbUn8hjPWb2RJOcx9wTKeOBV97T_OxE2fPRg',
      },
    ],
  },
];

export default function OddOneOutScreen({
  userId,
  onBack,
  onNextGame,
}: OddOneOutScreenProps) {
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  const currentLevel = LEVELS[level];

  const hasAnswered = selected !== null;

  const isCorrect =
    selected !== null &&
    currentLevel.items[selected].correct;

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
      const finalScore = completedScore + currentScore;
      const percentage = Math.round(
        (finalScore / (LEVELS.length * 100)) * 100,
      );
      const targetUserId = userId || 'patient_local';

      saveGameResultLocally({
        userId: targetUserId,
        gameName: 'odd-one-out',
        score: finalScore,
      }).catch((err) => console.warn('Failed saving odd-one-out result locally:', err));

      saveCognitiveScoreLocally({
        userId: targetUserId,
        score: percentage,
        memory: Math.min(100, Math.round(percentage * 0.95)),
        attention: percentage,
        reaction: 90,
      }).catch((err) => console.warn('Failed saving cognitive score locally:', err));

      syncManager.triggerSync().catch(() => {});
    }
  }, [gameFinished, completedScore, currentScore, userId]);

  const chooseAnswer = (index: number) => {
    if (hasAnswered) {
      return;
    }

    setSelected(index);
    setAttempts((previous) => previous + 1);
  };

  const handleTryAgain = () => {
    setSelected(null);
  };

  const handleHint = () => {
    if (showHint || hasAnswered) {
      return;
    }

    setShowHint(true);
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
    const finalScore =
      completedScore + currentScore;

    const percentage = Math.round(
      (finalScore / (LEVELS.length * 100)) * 100,
    );

    let resultTitle = 'Good Work!';
    let resultMessage =
      'You completed all five levels. Keep practicing to strengthen your attention and recognition skills.';

    if (percentage >= 90) {
      resultTitle = 'Excellent!';
      resultMessage =
        'Amazing work! You showed excellent attention and recognition skills.';
    } else if (percentage >= 70) {
      resultTitle = 'Great Job!';
      resultMessage =
        'You did very well. Keep practicing to make your skills even stronger.';
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back to Games Hub"
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

            <Text style={styles.headerComplete}>
              Complete
            </Text>
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
                  name="visibility"
                  size={26}
                  color={COLORS.secondary}
                />

                <Text style={styles.performanceText}>
                  Attention and recognition practiced
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
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePlayAgain}
              accessibilityRole="button"
              accessibilityLabel="Play Odd One Out again"
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
                pressed && styles.buttonPressed,
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
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to Games Hub"
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

          <Text style={styles.headerProgress}>
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

          <Text style={styles.title}>
            {currentLevel.title}
          </Text>

          <Text style={styles.instruction}>
            {currentLevel.instruction}
          </Text>

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

          <View style={styles.grid}>
            {currentLevel.items.map((item, index) => {
              const selectedWrong =
                hasAnswered &&
                selected === index &&
                !item.correct;

              const correctAnswer =
                hasAnswered && item.correct;

              return (
                <Pressable
                  key={item.name}
                  style={({ pressed }) => [
                    styles.card,

                    pressed &&
                    !hasAnswered &&
                    styles.cardPressed,

                    selectedWrong &&
                    styles.wrongCard,

                    correctAnswer &&
                    styles.correctCard,
                  ]}
                  onPress={() =>
                    chooseAnswer(index)
                  }
                  disabled={hasAnswered}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  <View style={styles.imageBox}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.image}
                      resizeMode="cover"
                    />

                    {correctAnswer && (
                      <View style={styles.imageCheck}>
                        <MaterialIcons
                          name="check-circle"
                          size={34}
                          color={COLORS.correctBorder}
                        />
                      </View>
                    )}

                    {selectedWrong && (
                      <View style={styles.imageWrong}>
                        <MaterialIcons
                          name="cancel"
                          size={34}
                          color={COLORS.wrongBorder}
                        />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.itemText,
                      correctAnswer &&
                      styles.correctText,
                      selectedWrong &&
                      styles.wrongText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
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

          {hasAnswered && !isCorrect && (
            <View style={styles.feedbackWrong}>
              <MaterialIcons
                name="error"
                size={32}
                color={COLORS.wrongBorder}
              />

              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackWrongTitle}>
                  Not quite
                </Text>

                <Text style={styles.feedbackWrongText}>
                  Look again and try once more. You can
                  do it!
                </Text>
              </View>
            </View>
          )}

          {isCorrect && (
            <View style={styles.feedbackCorrect}>
              <MaterialIcons
                name="check-circle"
                size={32}
                color={COLORS.correctBorder}
              />

              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackCorrectTitle}>
                  Correct!
                </Text>

                <Text style={styles.feedbackCorrectText}>
                  Great attention. You found the odd one out.
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
                pressed && styles.buttonPressed,
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
                styles.nextButton,
                !isCorrect &&
                styles.nextButtonDisabled,
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
                  styles.nextButtonText,
                  !isCorrect &&
                  styles.nextButtonTextDisabled,
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

  backButton: {
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

  headerProgress: {
    minWidth: 105,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onPrimaryContainer,
  },

  headerComplete: {
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
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 130,
    alignItems: 'center',
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

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  instruction: {
    width: '100%',
    fontSize: 20,
    lineHeight: 29,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
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

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  card: {
    width: '47%',
    minHeight: 210,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.primary,
  },

  correctCard: {
    borderColor: COLORS.correctBorder,
    backgroundColor: COLORS.correct,
  },

  wrongCard: {
    borderColor: COLORS.wrongBorder,
    backgroundColor: COLORS.wrong,
  },

  imageBox: {
    width: '100%',
    height: 125,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerHigh,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageCheck: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageWrong: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemText: {
    marginTop: 12,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },

  correctText: {
    color: COLORS.correctText,
  },

  wrongText: {
    color: COLORS.wrongText,
  },

  hintBox: {
    width: '100%',
    marginTop: 18,
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

  feedbackCorrect: {
    width: '100%',
    marginTop: 18,
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.correct,
    borderWidth: 1,
    borderColor: COLORS.correctBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },

  feedbackWrong: {
    width: '100%',
    marginTop: 18,
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.wrong,
    borderWidth: 1,
    borderColor: COLORS.wrongBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },

  feedbackContent: {
    flex: 1,
    marginLeft: 11,
  },

  feedbackCorrectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.correctText,
    marginBottom: 2,
  },

  feedbackCorrectText: {
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.correctText,
  },

  feedbackWrongTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.wrongText,
    marginBottom: 2,
  },

  feedbackWrongText: {
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.wrongText,
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

  nextButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  nextButtonTextDisabled: {
    color: COLORS.outline,
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

  buttonPressed: {
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