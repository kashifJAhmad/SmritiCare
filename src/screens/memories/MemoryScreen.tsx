import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type InputMode = 'photo' | 'voice' | 'text';

type TagType = 'People' | 'Place' | 'Decade / Year' | 'Event';

const COLORS = {
  background: '#FCF9F8',
  surface: '#FCF9F8',
  surfaceLowest: '#FFFFFF',

  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryFixed: '#002203',
  onPrimaryFixedVariant: '#0C5216',
  primaryFixed: '#ACF4A4',
  primaryFixedDim: '#91D78A',
  onPrimaryContainer: '#90D689',

  secondary: '#556158',
  secondaryContainer: '#D9E6DA',
  secondaryFixed: '#D9E6DA',
  secondaryFixedDim: '#BDCABE',
  onSecondaryContainer: '#5B675E',
  onSecondaryFixed: '#131E17',

  tertiary: '#721900',
  tertiaryFixed: '#FFDBD1',
  onTertiaryFixed: '#3B0800',

  surfaceContainer: '#F0EDED',
  surfaceContainerLow: '#F6F3F2',
  surfaceContainerHigh: '#EAE7E7',
  surfaceContainerHighest: '#E5E2E1',

  outlineVariant: '#C0C9BB',

  onSurface: '#1B1C1C',
  onSurfaceVariant: '#41493E',
};

const initialMemory =
  'He worked in a tea garden when he was young and loved the fresh morning air with his colleagues.';

export default function MemoryScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onProfile,
}: MemoryScreenProps) {
  const [activeTab, setActiveTab] = useState('Memory');

  const [inputMode, setInputMode] =
    useState<InputMode>('text');

  const [memoryStory, setMemoryStory] =
    useState(initialMemory);

  const [selectedTags, setSelectedTags] =
    useState<TagType[]>([]);

  const handleTab = (tab: string) => {
    setActiveTab(tab);

    if (tab === 'Home') {
      onHome?.();
    }

    if (tab === 'Games') {
      onGames?.();
    }

    if (tab === 'Remind') {
      onSchedule?.();
    }

    if (tab === 'Profile') {
      onProfile?.();
    }
  };

  const handleInputMode = (mode: InputMode) => {
    setInputMode(mode);

    if (mode === 'photo') {
      Alert.alert(
        'Photo Memory',
        'Camera/Gallery will open here.',
      );
    }

    if (mode === 'voice') {
      Alert.alert(
        'Voice Memory',
        'Voice recording will open here.',
      );
    }
  };

  const toggleTag = (tag: TagType) => {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter(
          (item) => item !== tag,
        );
      }

      return [...current, tag];
    });
  };

  const handleContinue = () => {
    Alert.alert(
      'AI Extraction',
      'Your memory is ready for AI extraction.',
    );
  };

  const isTagSelected = (tag: TagType) =>
    selectedTags.includes(tag);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={COLORS.onSurface}
            />
          </Pressable>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            SmritiCare
          </Text>

          <View style={styles.headerProfile}>
            <View style={styles.profileCircle}>
              <MaterialIcons
                name="person"
                size={18}
                color={COLORS.onPrimary}
              />
            </View>
          </View>

        </View>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* =================================================
              MEMORY INTRO
          ================================================= */}

          <View style={styles.introSection}>

            <View style={styles.archiveBadge}>
              <MaterialIcons
                name="psychology"
                size={18}
                color={COLORS.onSecondaryContainer}
              />

              <Text style={styles.archiveText}>
                Smriti Archive
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Add a Memory
            </Text>

            <Text style={styles.pageSubtitle}>
              Capture something meaningful from their life.
            </Text>

          </View>

          {/* =================================================
              INPUT MODES
          ================================================= */}

          <View style={styles.inputModes}>

            {/* PHOTO */}

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,

                inputMode === 'photo' &&
                  styles.modeCardActive,

                pressed &&
                  styles.modeCardPressed,
              ]}
              onPress={() =>
                handleInputMode('photo')
              }
              accessibilityRole="button"
              accessibilityLabel="Add photo"
            >
              {inputMode === 'photo' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={COLORS.onPrimaryFixed}
                  />
                </View>
              )}

              <View
                style={[
                  styles.modeIcon,
                  inputMode === 'photo' &&
                    styles.modeIconActive,
                ]}
              >
                <MaterialIcons
                  name="photo-camera"
                  size={26}
                  color={
                    inputMode === 'photo'
                      ? COLORS.primaryFixed
                      : COLORS.primary
                  }
                />
              </View>

              <Text
                style={[
                  styles.modeTitle,
                  inputMode === 'photo' &&
                    styles.modeTitleActive,
                ]}
              >
                Photo
              </Text>

              <Text
                style={[
                  styles.modeSubtitle,
                  inputMode === 'photo' &&
                    styles.modeSubtitleActive,
                ]}
              >
                Add photo
              </Text>
            </Pressable>

            {/* VOICE */}

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,

                inputMode === 'voice' &&
                  styles.modeCardActive,

                pressed &&
                  styles.modeCardPressed,
              ]}
              onPress={() =>
                handleInputMode('voice')
              }
              accessibilityRole="button"
              accessibilityLabel="Record story"
            >
              {inputMode === 'voice' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={COLORS.onPrimaryFixed}
                  />
                </View>
              )}

              <View
                style={[
                  styles.modeIcon,
                  styles.voiceIcon,
                  inputMode === 'voice' &&
                    styles.modeIconActive,
                ]}
              >
                <MaterialIcons
                  name="mic"
                  size={26}
                  color={
                    inputMode === 'voice'
                      ? COLORS.primaryFixed
                      : COLORS.tertiary
                  }
                />
              </View>

              <Text
                style={[
                  styles.modeTitle,
                  inputMode === 'voice' &&
                    styles.modeTitleActive,
                ]}
              >
                Voice
              </Text>

              <Text
                style={[
                  styles.modeSubtitle,
                  inputMode === 'voice' &&
                    styles.modeSubtitleActive,
                ]}
              >
                Record story
              </Text>
            </Pressable>

            {/* TEXT */}

            <Pressable
              style={({ pressed }) => [
                styles.modeCard,

                inputMode === 'text' &&
                  styles.modeCardActive,

                pressed &&
                  styles.modeCardPressed,
              ]}
              onPress={() =>
                handleInputMode('text')
              }
              accessibilityRole="button"
              accessibilityLabel="Write memory"
            >
              {inputMode === 'text' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={COLORS.onPrimaryFixed}
                  />
                </View>
              )}

              <View
                style={[
                  styles.modeIcon,
                  inputMode === 'text' &&
                    styles.modeIconActive,
                ]}
              >
                <MaterialIcons
                  name="edit-note"
                  size={26}
                  color={
                    inputMode === 'text'
                      ? COLORS.primaryFixed
                      : COLORS.primary
                  }
                />
              </View>

              <Text
                style={[
                  styles.modeTitle,
                  inputMode === 'text' &&
                    styles.modeTitleActive,
                ]}
              >
                Text
              </Text>

              <Text
                style={[
                  styles.modeSubtitle,
                  inputMode === 'text' &&
                    styles.modeSubtitleActive,
                ]}
              >
                Write memory
              </Text>
            </Pressable>

          </View>

          {/* =================================================
              VOICE DICTATION
          ================================================= */}

          <View style={styles.voiceBanner}>

            <View style={styles.voiceBannerIcon}>
              <MaterialIcons
                name="mic"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.voiceBannerText}>
              <Text style={styles.voiceBannerTitle}>
                Voice dictation available
              </Text>

              <Text style={styles.voiceBannerSubtitle}>
                Or tap mic to narrate in Assamese, Hindi, or English.
              </Text>
            </View>

          </View>

          {/* =================================================
              MEMORY TEXT
          ================================================= */}

          <View style={styles.storySection}>

            <Text style={styles.storyLabel}>
              Tell us something important about Arun...
            </Text>

            <View style={styles.textBox}>

              <TextInput
                value={memoryStory}
                onChangeText={setMemoryStory}
                multiline
                numberOfLines={4}
                placeholder="He worked in a tea garden when he was young and loved the fresh morning air with his colleagues."
                placeholderTextColor={COLORS.onSurfaceVariant}
                style={styles.textInput}
                textAlignVertical="top"
                accessibilityLabel="Memory story"
              />

              <View style={styles.textBoxFooter}>

                <Pressable
                  style={styles.languageButton}
                  onPress={() =>
                    Alert.alert(
                      'Language',
                      'Assamese / English selected.',
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Select language"
                >
                  <MaterialIcons
                    name="translate"
                    size={18}
                    color={COLORS.primary}
                  />

                  <Text style={styles.languageText}>
                    Assamese / English
                  </Text>
                </Pressable>

                <Text style={styles.charCount}>
                  {memoryStory.length} chars
                </Text>

              </View>

            </View>

          </View>

          {/* =================================================
              CONTEXTUAL DETAILS
          ================================================= */}

          <View style={styles.contextSection}>

            <View style={styles.contextHeader}>

              <Text style={styles.contextTitle}>
                Add Contextual Details
              </Text>

              <Text style={styles.contextSubtitle}>
                Helps AI reconstruct memories
              </Text>

            </View>

            <View style={styles.tagList}>

              {/* PEOPLE */}

              <Pressable
                style={[
                  styles.tagChip,
                  isTagSelected('People') &&
                    styles.tagChipSelected,
                ]}
                onPress={() =>
                  toggleTag('People')
                }
                accessibilityRole="button"
                accessibilityLabel="Add people"
              >
                <MaterialIcons
                  name="person-add"
                  size={20}
                  color={
                    isTagSelected('People')
                      ? COLORS.onPrimaryFixed
                      : COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.tagText,
                    isTagSelected('People') &&
                      styles.tagTextSelected,
                  ]}
                >
                  + People
                </Text>
              </Pressable>

              {/* PLACE */}

              <Pressable
                style={[
                  styles.tagChip,
                  isTagSelected('Place') &&
                    styles.tagChipSelected,
                ]}
                onPress={() =>
                  toggleTag('Place')
                }
                accessibilityRole="button"
                accessibilityLabel="Add place"
              >
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={
                    isTagSelected('Place')
                      ? COLORS.onPrimaryFixed
                      : COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.tagText,
                    isTagSelected('Place') &&
                      styles.tagTextSelected,
                  ]}
                >
                  + Place
                </Text>
              </Pressable>

              {/* YEAR */}

              <Pressable
                style={[
                  styles.tagChip,
                  isTagSelected('Decade / Year') &&
                    styles.tagChipSelected,
                ]}
                onPress={() =>
                  toggleTag('Decade / Year')
                }
                accessibilityRole="button"
                accessibilityLabel="Add decade or year"
              >
                <MaterialIcons
                  name="calendar-month"
                  size={20}
                  color={
                    isTagSelected('Decade / Year')
                      ? COLORS.onPrimaryFixed
                      : COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.tagText,
                    isTagSelected('Decade / Year') &&
                      styles.tagTextSelected,
                  ]}
                >
                  + Decade / Year
                </Text>
              </Pressable>

              {/* EVENT */}

              <Pressable
                style={[
                  styles.tagChip,
                  isTagSelected('Event') &&
                    styles.tagChipSelected,
                ]}
                onPress={() =>
                  toggleTag('Event')
                }
                accessibilityRole="button"
                accessibilityLabel="Add event"
              >
                <MaterialIcons
                  name="celebration"
                  size={20}
                  color={
                    isTagSelected('Event')
                      ? COLORS.onPrimaryFixed
                      : COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.tagText,
                    isTagSelected('Event') &&
                      styles.tagTextSelected,
                  ]}
                >
                  + Event
                </Text>
              </Pressable>

            </View>

          </View>

          {/* =================================================
              STORY ANCHOR
          ================================================= */}

          <View style={styles.storyAnchor}>

            <View style={styles.storyAnchorIcon}>
              <MaterialIcons
                name="local-florist"
                size={26}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.storyAnchorText}>
              <Text style={styles.storyAnchorTitle}>
                Story Anchor
              </Text>

              <Text style={styles.storyAnchorDescription}>
                Tea Gardens of Jorhat (1960s). Associated with aroma of CTC tea and morning whistles.
              </Text>
            </View>

          </View>

          {/* =================================================
              CONTINUE
          ================================================= */}

          <View style={styles.continueSection}>

            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed &&
                  styles.continueButtonPressed,
              ]}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to AI Extraction"
            >
              <Text style={styles.continueText}>
                Continue to AI Extraction
              </Text>

              <MaterialIcons
                name="arrow-forward"
                size={24}
                color={COLORS.onPrimary}
              />
            </Pressable>

            <View style={styles.privateNotice}>

              <MaterialIcons
                name="lock"
                size={16}
                color={COLORS.secondary}
              />

              <Text style={styles.privateText}>
                Memories stay encrypted & private to Arun's circle
              </Text>

            </View>

          </View>

          <View style={styles.bottomSpacing} />

        </ScrollView>

        {/* =================================================
            BOTTOM NAVIGATION
        ================================================= */}

        <View style={styles.bottomNav}>

          {/* HOME */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Home' &&
                styles.activeNavItem,
            ]}
            onPress={() => handleTab('Home')}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <MaterialIcons
              name="home"
              size={28}
              color={
                activeTab === 'Home'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Home' &&
                  styles.activeNavText,
              ]}
            >
              Home
            </Text>

          </Pressable>

          {/* GAMES */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Games' &&
                styles.activeNavItem,
            ]}
            onPress={() => handleTab('Games')}
            accessibilityRole="button"
            accessibilityLabel="Games"
          >
            <MaterialIcons
              name="sports-esports"
              size={28}
              color={
                activeTab === 'Games'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Games' &&
                  styles.activeNavText,
              ]}
            >
              Games
            </Text>

          </Pressable>

          {/* REMIND */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Remind' &&
                styles.activeNavItem,
            ]}
            onPress={() => handleTab('Remind')}
            accessibilityRole="button"
            accessibilityLabel="Reminders"
          >
            <MaterialIcons
              name="notifications-active"
              size={28}
              color={
                activeTab === 'Remind'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Remind' &&
                  styles.activeNavText,
              ]}
            >
              Remind
            </Text>

          </Pressable>

          {/* MEMORY */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Memory' &&
                styles.activeNavItem,
            ]}
            onPress={() => handleTab('Memory')}
            accessibilityRole="button"
            accessibilityLabel="Memory"
          >
            <MaterialIcons
              name="psychology"
              size={28}
              color={
                activeTab === 'Memory'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Memory' &&
                  styles.activeNavText,
              ]}
            >
              Memory
            </Text>

          </Pressable>

          {/* PROFILE */}

          <Pressable
            style={[
              styles.navItem,
              activeTab === 'Profile' &&
                styles.activeNavItem,
            ]}
            onPress={() => handleTab('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <MaterialIcons
              name="person"
              size={28}
              color={
                activeTab === 'Profile'
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.navText,
                activeTab === 'Profile' &&
                  styles.activeNavText,
              ]}
            >
              Profile
            </Text>

          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: 64,
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    backgroundColor: COLORS.surface,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,

    zIndex: 50,
  },

  backButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 10,
  },

  backButtonPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  headerTitle: {
    flex: 1,

    textAlign: 'center',

    fontSize: 28,
    lineHeight: 34,

    fontWeight: '700',

    color: COLORS.primary,

    marginHorizontal: 8,
  },

  headerProfile: {
    width: 48,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 10,
  },

  profileCircle: {
    width: 32,
    height: 32,

    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primary,
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 448,

    alignSelf: 'center',

    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 30,
  },

  /* =======================================================
     INTRO
  ======================================================= */

  introSection: {
    marginBottom: 24,
  },

  archiveBadge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: COLORS.secondaryContainer,

    marginBottom: 8,
  },

  archiveText: {
    fontSize: 18,
    lineHeight: 24,

    fontWeight: '600',

    color: COLORS.onSecondaryContainer,
  },

  pageTitle: {
    fontSize: 28,
    lineHeight: 34,

    fontWeight: '700',

    color: COLORS.primary,
  },

  pageSubtitle: {
    marginTop: 4,

    fontSize: 20,
    lineHeight: 28,

    color: COLORS.secondary,
  },

  /* =======================================================
     INPUT MODES
  ======================================================= */

  inputModes: {
    width: '100%',

    flexDirection: 'row',

    gap: 10,

    marginBottom: 20,
  },

  modeCard: {
    flex: 1,

    minHeight: 108,

    borderRadius: 12,

    backgroundColor:
      COLORS.surfaceContainer,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 10,

    position: 'relative',

    elevation: 1,
  },

  modeCardActive: {
    backgroundColor: COLORS.primary,

    elevation: 4,
  },

  modeCardPressed: {
    transform: [{ scale: 0.97 }],
  },

  checkBadge: {
    position: 'absolute',

    top: -6,
    right: -6,

    width: 24,
    height: 24,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      COLORS.primaryFixed,

    zIndex: 5,
  },

  modeIcon: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      COLORS.surfaceContainerHighest,

    marginBottom: 6,
  },

  voiceIcon: {
    backgroundColor:
      COLORS.surfaceContainerHighest,
  },

  modeIconActive: {
    backgroundColor:
      COLORS.primaryContainer,
  },

  modeTitle: {
    fontSize: 17,
    lineHeight: 22,

    fontWeight: '600',

    color: COLORS.onSurface,
  },

  modeTitleActive: {
    color: COLORS.onPrimary,
  },

  modeSubtitle: {
    fontSize: 13,
    lineHeight: 17,

    color: COLORS.secondary,

    textAlign: 'center',
  },

  modeSubtitleActive: {
    color: COLORS.primaryFixedDim,
  },

  /* =======================================================
     VOICE BANNER
  ======================================================= */

  voiceBanner: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    padding: 14,

    borderRadius: 12,

    backgroundColor:
      COLORS.secondaryContainer,

    marginBottom: 24,

    elevation: 1,
  },

  voiceBannerIcon: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.surface,

    marginRight: 12,
  },

  voiceBannerText: {
    flex: 1,
  },

  voiceBannerTitle: {
    fontSize: 18,
    lineHeight: 24,

    fontWeight: '600',

    color: COLORS.onSecondaryFixed,
  },

  voiceBannerSubtitle: {
    marginTop: 2,

    fontSize: 15,
    lineHeight: 20,

    color: COLORS.onSecondaryContainer,
  },

  /* =======================================================
     STORY
  ======================================================= */

  storySection: {
    marginBottom: 28,
  },

  storyLabel: {
    fontSize: 20,
    lineHeight: 26,

    fontWeight: '700',

    color: COLORS.onSurface,

    marginBottom: 10,
  },

  textBox: {
    width: '100%',

    borderRadius: 12,

    backgroundColor:
      COLORS.surfaceLowest,

    padding: 16,

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  textInput: {
    width: '100%',

    minHeight: 120,

    fontSize: 20,
    lineHeight: 28,

    color: COLORS.onSurface,

    padding: 0,
  },

  textBoxFooter: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',

    paddingTop: 12,

    marginTop: 8,

    borderTopWidth: 1,
    borderTopColor:
      COLORS.surfaceContainerHigh,
  },

  languageButton: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 999,

    backgroundColor:
      COLORS.surfaceContainer,
  },

  languageText: {
    fontSize: 15,

    fontWeight: '600',

    color: COLORS.primary,
  },

  charCount: {
    fontSize: 14,

    color: COLORS.secondary,
  },

  /* =======================================================
     CONTEXT
  ======================================================= */

  contextSection: {
    marginBottom: 28,
  },

  contextHeader: {
    marginBottom: 12,
  },

  contextTitle: {
    fontSize: 18,
    lineHeight: 24,

    fontWeight: '600',

    color: COLORS.onSurface,
  },

  contextSubtitle: {
    marginTop: 3,

    fontSize: 14,
    lineHeight: 20,

    color: COLORS.secondary,
  },

  tagList: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 10,
  },

  tagChip: {
    minHeight: 44,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 999,

    backgroundColor:
      COLORS.surfaceContainerHigh,

    elevation: 1,
  },

  tagChipSelected: {
    backgroundColor:
      COLORS.primaryFixed,
  },

  tagText: {
    fontSize: 17,
    lineHeight: 22,

    fontWeight: '600',

    color: COLORS.onSurface,
  },

  tagTextSelected: {
    color: COLORS.onPrimaryFixed,
  },

  /* =======================================================
     STORY ANCHOR
  ======================================================= */

  storyAnchor: {
    flexDirection: 'row',

    alignItems: 'center',

    padding: 16,

    borderRadius: 12,

    backgroundColor:
      COLORS.surfaceContainerLow,

    marginBottom: 24,

    elevation: 1,
  },

  storyAnchorIcon: {
    width: 64,
    height: 64,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      COLORS.secondaryContainer,

    marginRight: 14,
  },

  storyAnchorText: {
    flex: 1,
  },

  storyAnchorTitle: {
    fontSize: 18,
    lineHeight: 24,

    fontWeight: '600',

    color: COLORS.onSurface,
  },

  storyAnchorDescription: {
    marginTop: 3,

    fontSize: 15,
    lineHeight: 21,

    color: COLORS.secondary,
  },

  /* =======================================================
     CONTINUE
  ======================================================= */

  continueSection: {
    gap: 12,
  },

  continueButton: {
    width: '100%',

    minHeight: 56,

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 10,

    paddingHorizontal: 20,
    paddingVertical: 14,

    elevation: 5,
  },

  continueButtonPressed: {
    backgroundColor:
      COLORS.primaryContainer,

    transform: [{ scale: 0.98 }],
  },

  continueText: {
    fontSize: 18,
    lineHeight: 24,

    fontWeight: '600',

    color: COLORS.onPrimary,
  },

  privateNotice: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    paddingHorizontal: 10,
  },

  privateText: {
    flexShrink: 1,

    textAlign: 'center',

    fontSize: 13,
    lineHeight: 18,

    color: COLORS.secondary,
  },

  bottomSpacing: {
    height: 10,
  },

  /* =======================================================
     BOTTOM NAVIGATION
  ======================================================= */

  bottomNav: {
    height: 80,

    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-around',

    paddingHorizontal: 4,

    backgroundColor:
      COLORS.surface,

    borderTopWidth: 1,
    borderTopColor:
      COLORS.outlineVariant,

    zIndex: 50,
  },

  navItem: {
    width: 64,

    minHeight: 56,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    paddingVertical: 5,
  },

  activeNavItem: {
    backgroundColor:
      COLORS.primaryFixed,
  },

  navText: {
    marginTop: 2,

    fontSize: 14,
    lineHeight: 18,

    fontWeight: '600',

    color: COLORS.onSurfaceVariant,
  },

  activeNavText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});