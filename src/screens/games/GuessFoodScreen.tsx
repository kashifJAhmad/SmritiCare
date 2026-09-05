import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  background: '#F4FAFF',
  surface: '#FFFFFF',
  white: '#FFFFFF',

  container: '#D7E4EC',
  high: '#D7E4EC',
  surfaceContainer: '#D7E4EC',
  surfaceContainerHigh: '#D7E4EC',

  primary: '#00450D',
  primaryContainer: '#D7E8D8',

  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#002E08',

  tertiary: '#7A1F1F',
  tertiaryContainer: '#F4D8D8',

  outlineVariant: '#C0C9BB',

  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',

  correct: '#C8E6C9',
  correctBorder: '#2E7D32',
  correctText: '#1B5E20',

  wrong: '#FFCDD2',
  wrongBorder: '#C62828',
  wrongText: '#B71C1C',
};

type GuessFoodScreenProps = {
  onBack?: () => void;
  onNextGame?: () => void;
};

type Level = {
  title: string;
  subtitle: string;
  image: string;
  options: string[];
  correctIndex: number;
  hint: string;
};

const LEVELS: Level[] = [
  // LEVEL 1
  {
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
    hint:
      'This traditional Assamese food is made with rice and sesame.',
  },

  // LEVEL 2 - MASOR TENGA
  {
    title: 'Guess the Food',
    subtitle:
      'Look carefully. Can you recognise this food?',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArDqK7kNSbVG7hVPScNDmyUDBl4a4HcMUVU13Kj2qeQvxP88V-yGj28hi6eyH2giSr1Xf_f9hTrPn21vtJZLHg42s6i1qXTOF5u-KOs4lGSpSyb58OsZREoT1r6e7jrMQIjyipLTwDQN6UHhnMnc7OU2sLd1ZiEdFja0-7QrVKUjwIp10BW6jdozb7uyfU5cuEs35Do6GXukNhufmmYU6nRvAR16kAlBEl65qyOywl2m1i241bxlHF7g',
    options: [
      'A. Masor Tenga',
      'B. Khar',
      'C. Pitha',
    ],
    correctIndex: 0,
    hint:
      'This is a traditional Assamese sour fish curry made with fish, tomatoes and elephant apple.',
  },

  // LEVEL 3 - JADOH
  {
    title: 'Guess the Food',
    subtitle:
      'Look carefully. Can you recognise this food?',
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
  },

  // LEVEL 4 - SMOKED PORK WITH BAMBOO SHOOT
  {
    title: 'Guess the Food',
    subtitle:
      'Look carefully. Can you recognise this food?',
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
  },

  // LEVEL 5 - IROMBA
  {
    title: 'Guess the Food',
    subtitle:
      'Look carefully. Can you recognise this food?',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrqMWBwBHhlSXS0mABk4Qe_ckHx-RjVfT6TI0PxRHZT1MX4Su5_ESrhEhIEcJUR0SixtabfDT70Wwk8g37X5CZ6FkIGYfDaMLJSuz16nsDXC9xoMukeMMQeE2Bcut2O4SEbNX8OPLH5SQGWRwEUqpgaHzPK6KTWaqKCVzLvxwCsUxAvEIC8KwfjpYMZ-PSe1tRchAEBONqHQnR1S1KhxkNQ4j_we0TU4gJG-tspgUxJ_sZQFAFiqzijA',
    options: [
      'A. Thukpa',
      'B. Iromba',
      'C. Galho',
    ],
    correctIndex: 1,
    hint:
      'This is a traditional Manipuri dish made with mashed vegetables, bamboo shoot and fermented fish.',
  },
];

export default function GuessFoodScreen({
  onBack,
  onNextGame,
}: GuessFoodScreenProps) {
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const currentLevel = LEVELS[level];

  const isCorrect = selected === currentLevel.correctIndex;
  const hasAnswered = selected !== null;

  const handleAnswer = (index: number) => {
    setSelected(index);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  const handleTryAgain = () => {
    setSelected(null);
    setShowHint(false);
  };

  const handleNext = () => {
    if (!isCorrect) {
      return;
    }

    if (level < LEVELS.length - 1) {
      setLevel((previousLevel) => previousLevel + 1);
      setSelected(null);
      setShowHint(false);
      return;
    }

    Alert.alert(
      'Well Done!',
      'You completed all the Guess the Food levels.',
      [
        {
          text: 'Play Again',
          onPress: () => {
            setLevel(0);
            setSelected(null);
            setShowHint(false);
          },
        },
        {
          text: 'Other Games',
          onPress: () => onNextGame?.(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
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

          <Text style={styles.progress}>
            Level {level + 1} of {LEVELS.length}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Game title */}
          <View style={styles.gameHeader}>
            <Text style={styles.title}>{currentLevel.title}</Text>

            <Text style={styles.subtitle}>
              {currentLevel.subtitle}
            </Text>
          </View>

          {/* Food image */}
          <View style={styles.imageBox}>
            <View style={styles.pattern}>
              <View style={styles.red} />
              <View style={styles.green} />
            </View>

            <Image
              source={{ uri: currentLevel.image }}
              style={styles.image}
              resizeMode="cover"
            />

            {isCorrect && (
              <View style={styles.successOverlay}>
                <MaterialIcons
                  name="check-circle"
                  size={70}
                  color={COLORS.correctBorder}
                />

                <Text style={styles.successTitle}>
                  Correct!
                </Text>

                <Text style={styles.successSubtitle}>
                  Great job! You identified the food correctly.
                </Text>
              </View>
            )}
          </View>

          {/* Hint */}
          {showHint && (
            <View style={styles.hintBox}>
              <MaterialIcons
                name="lightbulb"
                size={28}
                color={COLORS.primary}
              />

              <Text style={styles.hintBoxText}>
                Hint: {currentLevel.hint}
              </Text>
            </View>
          )}

          {/* Answer options */}
          <View style={styles.options}>
            {currentLevel.options.map((option, index) => {
              const isSelected = selected === index;
              const isOptionCorrect =
                index === currentLevel.correctIndex;

              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.option,

                    pressed && styles.optionPressed,

                    isSelected &&
                      (isOptionCorrect
                        ? styles.correct
                        : styles.wrong),
                  ]}
                  onPress={() => handleAnswer(index)}
                  accessibilityRole="button"
                  accessibilityLabel={option}
                >
                  <Text
                    style={[
                      styles.optionText,

                      isSelected &&
                        (isOptionCorrect
                          ? styles.correctText
                          : styles.wrongText),
                    ]}
                  >
                    {option}
                  </Text>

                  {isSelected && (
                    <MaterialIcons
                      name={
                        isOptionCorrect
                          ? 'check-circle'
                          : 'cancel'
                      }
                      size={30}
                      color={
                        isOptionCorrect
                          ? COLORS.correctBorder
                          : COLORS.wrongBorder
                      }
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Feedback */}
          {selected !== null && !isCorrect && (
            <View style={styles.wrongMessage}>
              <MaterialIcons
                name="info-outline"
                size={26}
                color={COLORS.wrongBorder}
              />

              <Text style={styles.wrongMessageText}>
                Not quite. Take another look and try again.
              </Text>
            </View>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={styles.hint}
            onPress={handleHint}
            accessibilityRole="button"
            accessibilityLabel="Show hint"
          >
            <MaterialIcons
              name="lightbulb-outline"
              size={28}
              color={COLORS.primary}
            />

            <Text style={styles.hintText}>
              {showHint ? 'Hint Shown' : 'Hint'}
            </Text>
          </Pressable>

          {hasAnswered && !isCorrect ? (
            <Pressable
              style={styles.tryAgain}
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
                  !isCorrect && styles.nextTextDisabled,
                ]}
              >
                {level < LEVELS.length - 1
                  ? 'Next'
                  : 'Finish'}
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
                    : COLORS.outlineVariant
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
    height: 72,
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

  scroll: {
    flex: 1,
  },

  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },

  gameHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 21,
    lineHeight: 31,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
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
    marginBottom: 24,
    position: 'relative',
  },

  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    zIndex: 2,
    opacity: 0.3,
    flexDirection: 'row',
  },

  red: {
    flex: 1,
    backgroundColor: COLORS.tertiaryContainer,
  },

  green: {
    flex: 1,
    backgroundColor: COLORS.primary,
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
    backgroundColor: 'rgba(227, 240, 248, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  successTitle: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.correctText,
    textAlign: 'center',
  },

  successSubtitle: {
    marginTop: 6,
    fontSize: 21,
    lineHeight: 30,
    color: COLORS.onSurface,
    textAlign: 'center',
  },

  options: {
    width: '100%',
    gap: 16,
  },

  option: {
    width: '100%',
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  correctText: {
    color: COLORS.correctText,
  },

  wrongText: {
    color: COLORS.wrongText,
  },

  hintBox: {
    width: '100%',
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.primaryContainer,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hintBoxText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '600',
    color: COLORS.onPrimaryContainer,
  },

  wrongMessage: {
    width: '100%',
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.wrong,
    borderWidth: 2,
    borderColor: COLORS.wrongBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },

  wrongMessageText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: COLORS.wrongText,
  },

  bottomSpace: {
    height: 40,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 88,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  hint: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hintText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  tryAgain: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tryAgainText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  next: {
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  nextText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },

  nextTextDisabled: {
    color: COLORS.outlineVariant,
  },
});