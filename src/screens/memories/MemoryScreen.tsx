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

type MemoryScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onProfile?: () => void;
};

const COLORS = {
  background: '#F4FAFF',
  surface: '#F4FAFF',
  surfaceLowest: '#FFFFFF',
  surfaceHigh: '#DDEAF2',
  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryFixedVariant: '#0C5216',
  onPrimaryContainer: '#90D689',
  secondary: '#00629E',
  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',
  outlineVariant: '#C0C9BB',
};

const memories = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOrECLU3BCmP2ZDVOfBnMYeE6Ngdxay0wFzfFlcZd0SeUxMZl3R1Iwm4AIzrBj1zu6CWW2UkChOx_LxnD360-ZIxMSXlc017zdD6FeRmqK__eQz_uS962kkx8Va2gOT63rqPozmLtdOAfxfFQSAI-ofQDVXb0A1QLE5nMvD49MmtYW7KHFKN2-sbIVDeMD4BZvjf4RNNb5OQqdpTjhC5WAwxSJ6UTEA8cy62dCIWLa92vc2bJ_ysX_Tg',
    text: 'Diwali at home with the grandchildren. Everyone was so happy.',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkz7VftxyjJbMLGM4fa503cFojfBQP3eevNDpSS9igcKcOX187vU_2nJ8YX4vjmnTb-CA0unKMnvRZ7x9hlJt_ybuNchqEC15TO_T8VoQVIjmO8F1qSRoxPGqR37pxaIIUCxcUJphbos4rxSmHVHU6r1DaszaMUfUKeYJilMd_XbhDel4-AL7ZGuFw0E6iWe5Ar2fEcOjjzVzHLrwmhJcuYuLY9Nzty3oYcQwu6axItyTFDEC1BJpTg',
    text: 'Morning walk near the tea gardens. Beautiful sunrise today.',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCy4mA0GnC38EQrGS2dLT5kck5-xBg_wlR3JXJSDvQkaxWhJCcG8VomWkY3en0olmL6-k0HWKg_YiRDFF8KpKFbUg0p8r6WQoE91A6fmsK0afoTeKe6g7QckVjGz2bfeGVEaV2MOMn_KMgUvV19kFGaUTOM7gM5bokTmldisSc4snot595ch2--79nl0l3NW4CGpxTsE-Vl2bq31pw63qN474LGS5mrDgOR4Ea8HnbSjzOBAMfjcV6peA',
    text: 'The beautiful new Mekhela I received for my birthday.',
  },
];

export default function MemoryScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onProfile,
}: MemoryScreenProps) {
  const [activeTab, setActiveTab] = useState('Memory');

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Home') onHome?.();
    if (tab === 'Games') onGames?.();
    if (tab === 'Remind') onSchedule?.();
    if (tab === 'Profile') onProfile?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={32} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>My Memories</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={({ pressed }) => [
              styles.addMemoryButton,
              pressed && styles.addMemoryPressed,
            ]}
            onPress={() => Alert.alert('Add a New Memory', 'Opening Camera/Gallery...')}
            accessibilityRole="button"
            accessibilityLabel="Add a New Memory"
          >
            <MaterialIcons name="add-a-photo" size={40} color={COLORS.onPrimary} />
            <Text style={styles.addMemoryText}>Add a New Memory</Text>
          </Pressable>

          <View style={styles.gallery}>
            <Text style={styles.sectionTitle}>Recent Photos</Text>

            {memories.map((memory, index) => (
              <View key={index} style={styles.memoryCard}>
                <View style={styles.topBorder} />
                <Image
                  source={{ uri: memory.image }}
                  style={styles.memoryImage}
                  resizeMode="cover"
                />
                <View style={styles.memoryTextContainer}>
                  <Text style={styles.memoryText}>{memory.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable
            style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]}
            onPress={() => handleTab('Home')}
          >
            <MaterialIcons
              name="home"
              size={28}
              color={activeTab === 'Home' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
            />
            <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navItem, activeTab === 'Games' && styles.activeNavItem]}
            onPress={() => handleTab('Games')}
          >
            <MaterialIcons
              name="extension"
              size={28}
              color={activeTab === 'Games' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
            />
            <Text style={[styles.navText, activeTab === 'Games' && styles.activeNavText]}>
              Games
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navItem, activeTab === 'Remind' && styles.activeNavItem]}
            onPress={() => handleTab('Remind')}
          >
            <MaterialIcons
              name="alarm"
              size={28}
              color={activeTab === 'Remind' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
            />
            <Text style={[styles.navText, activeTab === 'Remind' && styles.activeNavText]}>
              Remind
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navItem, activeTab === 'Memory' && styles.activeNavItem]}
            onPress={() => handleTab('Memory')}
          >
            <MaterialIcons
              name="auto-stories"
              size={28}
              color={activeTab === 'Memory' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
            />
            <Text style={[styles.navText, activeTab === 'Memory' && styles.activeNavText]}>
              Memory
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navItem, activeTab === 'Profile' && styles.activeNavItem]}
            onPress={() => handleTab('Profile')}
          >
            <MaterialIcons
              name="person"
              size={28}
              color={activeTab === 'Profile' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
            />
            <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>
              Profile
            </Text>
          </Pressable>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    minHeight: 72,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 104,
    paddingBottom: 20,
  },
  addMemoryButton: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.onPrimaryFixedVariant,
  },
  addMemoryPressed: {
    transform: [{ scale: 0.98 }],
  },
  addMemoryText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  gallery: {
    marginTop: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  memoryCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    overflow: 'hidden',
  },
  topBorder: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.secondary,
  },
  memoryImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surfaceHigh,
  },
  memoryTextContainer: {
    padding: 24,
  },
  memoryText: {
    fontSize: 22,
    lineHeight: 32,
    color: COLORS.onSurface,
  },
  bottomNav: {
    height: 88,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
  },
  navItem: {
    width: 72,
    minHeight: 60,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavItem: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.95 }],
  },
  navText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  activeNavText: {
    color: COLORS.onPrimaryContainer,
  },
  bottomSpacing: {
    height: 20,
  },
});
