import React, { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type OddOneOutScreenProps = {
  onBack?: () => void;
  onNextGame?: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  surface: '#F4FAFF',
  white: '#FFFFFF',
  surfaceHigh: '#DDEAF2',
  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimaryContainer: '#90D689',
  secondary: '#00629E',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',
  outlineVariant: '#C0C9BB',
};

const ITEMS = [
  {
    name: 'Japi',
    correct: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RCf0aIlddQrW0qAA0zh_ww8C8hnrf57NjgejCfmJg6xCwMXGYM8stRcclpf0AlBwAXxLr1_c7dQAK23xdur4eL-72xGblWYlklqmZpFF4WVT76jJPiIQJJ1KaKlwrgy1i2cvdKwmZGBG4vR-L1CqJD54qD7mHgmE6EiXfHVq3QhtIO8DZemYk8qsrUcyNWlUENJl47VyiKAQdREHBbjbUn8hjPWb2RJOcx9wTKeOBV97T_OxE2fPRg',
  },
  {
    name: 'Mekhela Pattern',
    correct: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA2samXy6OvSLObtVBzi5tBWssQARzabgU_qihl24vMHVRaz9rIbmoRnD7DluxGqf7xkkpuzNi6GlU1H23mhRghyU1KwNKgHAwi5l6d1MM8GWJsnrtclwaoUAGMSVVT-cn-AkdPPlhglo0AZNQFxSGpQlzpUfg1c5XLXbPsyUL2XHh2GFfmm4zszX5bTHvv5PKVT1MnI31Xlc6j6k07anyIuPJvYYUFDGtq7hQsHONpWi_msucCALjUw',
  },
  {
    name: 'Computer Mouse',
    correct: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa4MKzj7z4GZeSauCw6PZSxg3I2FIPl5VAKANcnV46BfFCI5Bk62lSvF6_IPXtOoY4_erNSYE5M9MV9l5t2K7Jr3i_k2oCRPgwWR7eb-NI29SDu07odVp1ZKTLnr5nofPehVLZcXVyvZjHpJ2aKI9L_UGWtcmGcEAHeOD1Urkb9Wf0lUWfndZBUGG5uKAlB6nMO5ZHqrlHJemv9tCEyMQVOY5Gd3_Vvkc9pFnbrO1sC8pb-kEshH4qGA',
  },
  {
    name: 'Gamocha',
    correct: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATfNI38nw8qqgsjrNwYqfr5YcUAdXCkxWLMMHtzcrzO6uzGD5xotIYCaHGXarmY_2WSIODlo2QmATeS8App58sbnhN-Av_aQcnneOZ0bc6K3ut5c7yEfmmkbMXqAXHCrd2qmv7FmvNniOGNxW1mSSGcZJgiIcYN63a03HCtABu1Z20bEGman_Trfj75kI1Hn8X_7Lmi2k63TYy9pJOc4Ey8A3K1agg3__mQf0IUhdzWFdqXSwSdhDxkg',
  },
];

export default function OddOneOutScreen({ onBack, onNextGame }: OddOneOutScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const chooseAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
  };

  const isFinished = selected !== null;
  const isCorrect = selected !== null && ITEMS[selected].correct;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack} accessibilityLabel="Go back to Games Hub">
            <MaterialIcons name="arrow-back" size={30} color={COLORS.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.brand}>SmritiCare</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Odd One Out</Text>

          <Text style={styles.instruction}>
            Which one is different? Tap the picture that does not belong.
          </Text>

          <View style={styles.grid}>
            {ITEMS.map((item, index) => {
              const selectedWrong = isFinished && selected === index && !item.correct;
              const correctAnswer = isFinished && item.correct;

              return (
                <Pressable
                  key={item.name}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && !isFinished && styles.cardPressed,
                    selectedWrong && styles.wrongCard,
                    correctAnswer && styles.correctCard,
                  ]}
                  onPress={() => chooseAnswer(index)}
                  disabled={isFinished}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  <View style={styles.imageBox}>
                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                  </View>
                  <Text
                    style={[
                      styles.itemText,
                      correctAnswer && styles.correctText,
                      selectedWrong && styles.wrongText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isFinished && (
            <>
              <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                <MaterialIcons
                  name={isCorrect ? 'check-circle' : 'error'}
                  size={36}
                  color={isCorrect ? COLORS.onPrimaryContainer : COLORS.onErrorContainer}
                />
                <Text
                  style={[
                    styles.feedbackText,
                    isCorrect ? styles.correctFeedbackText : styles.wrongFeedbackText,
                  ]}
                >
                  {isCorrect
                    ? 'Correct! It is not traditional.'
                    : 'Not quite. The mouse is different.'}
                </Text>
              </View>

              <Pressable style={styles.nextButton} onPress={onNextGame}>
                <Text style={styles.nextText}>Next Game</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
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
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    minWidth: 72,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brand: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 72,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    width: '100%',
    fontSize: 22,
    lineHeight: 32,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    backgroundColor: COLORS.surfaceHigh,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    minHeight: 220,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  cardPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: COLORS.surfaceHigh,
  },
  correctCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryContainer,
  },
  wrongCard: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorContainer,
  },
  imageBox: {
    width: '100%',
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceHigh,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  correctText: {
    color: COLORS.onPrimaryContainer,
  },
  wrongText: {
    color: COLORS.onErrorContainer,
  },
  feedback: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  feedbackCorrect: {
    backgroundColor: COLORS.primaryContainer,
  },
  feedbackWrong: {
    backgroundColor: COLORS.errorContainer,
  },
  feedbackText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
  correctFeedbackText: {
    color: COLORS.onPrimaryContainer,
  },
  wrongFeedbackText: {
    color: COLORS.onErrorContainer,
  },
  nextButton: {
    marginTop: 20,
    minHeight: 52,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 4,
    borderBottomColor: '#0C5216',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
});
