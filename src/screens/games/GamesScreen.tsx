import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import QuickAssist from '../../components/QuickAssist';

type GamesScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
  onVoiceAssistant?: () => void;

  onGuessFood?: () => void;
  onTraditionalDress?: () => void;
  onFestivalMemory?: () => void;
  onBelongsTogether?: () => void;
  onSpotDifference?: () => void;
  onOddOneOut?: () => void;
  onColorSequence?: () => void;
  onSoundGames?: () => void;
  onWhatIsMissing?: () => void;
  onMemoryMatch?: () => void;
};

const COLORS = {
  background: '#FBF9F1',
  surface: '#FFFFFF',
  surfaceLow: '#F1F0E7',
  surfaceVariant: '#E7EFE3',

  primary: '#3F6F45',
  primaryContainer: '#315A36',
  onPrimaryContainer: '#D7E7D2',

  secondary: '#8A6040',
  secondaryContainer: '#E9D7C5',
  onSecondaryContainer: '#68472F',

  tertiary: '#A65D43',
  tertiaryContainer: '#E7C9B9',
  onTertiaryContainer: '#68472F',

  onSurface: '#1B1C17',
  onSurfaceVariant: '#565A52',

  outline: '#72766D',
  outlineVariant: '#CDD2C8',
};

type Game = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  bg: string;
  iconColor: string;
  bar: string;
  onPress?: () => void;
};

type NavButtonProps = {
  label: string;
  icon: string;
  active?: boolean;
  onPress?: () => void;
};

/* ====================================================
   BOTTOM NAVIGATION BUTTON
==================================================== */

function NavButton({
  label,
  icon,
  active = false,
  onPress,
}: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.navButton,
        active && styles.navButtonActive,
        pressed && styles.navButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navIconActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ====================================================
   GAMES SCREEN
==================================================== */

export default function GamesScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
  onVoiceAssistant,

  onGuessFood,
  onTraditionalDress,
  onFestivalMemory,
  onBelongsTogether,
  onSpotDifference,
  onOddOneOut,
  onColorSequence,
  onSoundGames,
  onWhatIsMissing,
  onMemoryMatch,
}: GamesScreenProps) {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1100;

  /* ====================================================
     GAMES
  ==================================================== */

  const games: Game[] = [
    {
      title: 'Guess the Food',
      description: 'Recognize familiar regional dishes.',
      icon: 'restaurant',
      bg: COLORS.secondaryContainer,
      iconColor: COLORS.onSecondaryContainer,
      bar: COLORS.secondary,
      onPress: onGuessFood,
    },

    {
      title: 'Traditional Dress Match',
      description: 'Match beautiful textiles and clothing.',
      icon: 'checkroom',
      bg: COLORS.tertiaryContainer,
      iconColor: COLORS.onTertiaryContainer,
      bar: COLORS.tertiary,
      onPress: onTraditionalDress,
    },

    {
      title: 'Festival Memory',
      description: 'Remember vibrant local celebrations.',
      icon: 'celebration',
      bg: COLORS.primaryContainer,
      iconColor: COLORS.onPrimaryContainer,
      bar: COLORS.primary,
      onPress: onFestivalMemory,
    },

    {
      title: 'What Belongs Together?',
      description: 'Match related items from the North East.',
      icon: 'extension',
      bg: COLORS.surfaceVariant,
      iconColor: COLORS.onSurfaceVariant,
      bar: COLORS.outline,
      onPress: onBelongsTogether,
    },

    {
      title: 'Spot the Difference',
      description: 'Find hidden changes between pictures.',
      icon: 'search',
      bg: COLORS.secondaryContainer,
      iconColor: COLORS.onSecondaryContainer,
      bar: COLORS.secondary,
      onPress: onSpotDifference,
    },

    {
      title: 'Odd One Out',
      description: 'Identify the unique item in local patterns.',
      icon: 'category',
      bg: COLORS.tertiaryContainer,
      iconColor: COLORS.onTertiaryContainer,
      bar: COLORS.tertiary,
      onPress: onOddOneOut,
    },

    {
      title: 'Color Sequence',
      description: 'Remember and repeat the color patterns.',
      icon: 'palette',
      bg: COLORS.primaryContainer,
      iconColor: COLORS.onPrimaryContainer,
      bar: COLORS.primary,
      onPress: onColorSequence,
    },

    {
      title: 'Sound Games',
      description: 'Match familiar daily sounds.',
      icon: 'music-note',
      bg: COLORS.surfaceVariant,
      iconColor: COLORS.onSurfaceVariant,
      bar: COLORS.outline,
      onPress: onSoundGames,
    },

    {
      title: 'What is Missing?',
      description: 'Find the missing piece of the picture.',
      icon: 'help-center',
      bg: COLORS.secondaryContainer,
      iconColor: COLORS.onSecondaryContainer,
      bar: COLORS.secondary,
      onPress: onWhatIsMissing,
    },

    {
      title: 'Memory Match',
      description: 'Find matching pairs of cards.',
      icon: 'grid-view',
      bg: COLORS.primaryContainer,
      iconColor: COLORS.onPrimaryContainer,
      bar: COLORS.primary,
      onPress: onMemoryMatch,
    },
  ];

  /* ====================================================
     PLAY GAME
  ==================================================== */

  const playGame = (game: Game) => {
    if (game.onPress) {
      game.onPress();
      return;
    }

    Alert.alert(
      game.title,
      'This game is not connected yet.'
    );
  };

  /* ====================================================
     GAME CARD
  ==================================================== */

  const renderGame = (game: Game) => (
    <Pressable
      key={game.title}
      accessibilityRole="button"
      accessibilityLabel={`Play ${game.title}`}
      onPress={() => playGame(game)}
      style={({ pressed }) => [
        styles.gameCard,

        isTablet && styles.gameCardTablet,

        pressed && styles.gameCardPressed,
      ]}
    >
      {/* TOP COLOR BAR */}
      <View
        style={[
          styles.patternBar,
          {
            backgroundColor: game.bar,
          },
        ]}
      />

      {/* ICON */}
      <View
        style={[
          styles.gameIcon,

          isTablet && styles.gameIconTablet,

          {
            backgroundColor: game.bg,
          },
        ]}
      >
        <MaterialIcons
          name={game.icon}
          size={isTablet ? 44 : 38}
          color={game.iconColor}
        />
      </View>

      {/* TEXT */}
      <View style={styles.gameText}>
        <Text
          style={[
            styles.gameTitle,

            isTablet && styles.gameTitleTablet,
          ]}
          numberOfLines={2}
        >
          {game.title}
        </Text>

        <Text
          style={[
            styles.description,

            isTablet && styles.descriptionTablet,
          ]}
        >
          {game.description}
        </Text>
      </View>

      {/* ARROW */}
      <View style={styles.arrowContainer}>
        <MaterialIcons
          name="chevron-right"
          size={32}
          color={COLORS.outline}
        />
      </View>
    </Pressable>
  );

  /* ====================================================
     SCREEN
  ==================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>

            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go Back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backPressed,
              ]}
            >
              <MaterialIcons
                name="arrow-back"
                size={30}
                color={COLORS.onSurfaceVariant}
              />
            </Pressable>

            <View>
              <Text style={styles.headerTitle}>
                Brain Games
              </Text>

              <Text style={styles.headerSubtitle}>
                Exercise your mind
              </Text>
            </View>

          </View>

          {/* HEADER PATTERN */}

          <View style={styles.headerPattern}>
            <View style={styles.redPattern} />
            <View style={styles.whitePattern} />
            <View style={styles.redPattern} />
            <View style={styles.whitePattern} />
            <View style={styles.redPattern} />
          </View>
        </View>

        {/* ====================================================
            SCROLL CONTENT
        ==================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,

            isTablet && styles.contentTablet,

            isLargeScreen && styles.contentLarge,
          ]}
          showsVerticalScrollIndicator={false}
        >

          {/* ====================================================
              INTRO CARD
          ==================================================== */}

          <View style={styles.introCard}>

            <View style={styles.introIcon}>
              <MaterialIcons
                name="psychology"
                size={38}
                color={COLORS.onPrimaryContainer}
              />
            </View>

            <View style={styles.introText}>
              <Text style={styles.introTitle}>
                Keep Your Mind Active
              </Text>

              <Text style={styles.introDescription}>
                Choose a game below and enjoy a simple
                activity designed to exercise your memory,
                attention and recognition.
              </Text>
            </View>

          </View>

          {/* ====================================================
              SECTION HEADER
          ==================================================== */}

          <View style={styles.sectionHeader}>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionHeading}>
                North East Games
              </Text>

              <Text style={styles.sectionSubtitle}>
                Familiar themes made for you
              </Text>
            </View>

            <View style={styles.gameCount}>

              <MaterialIcons
                name="extension"
                size={20}
                color={COLORS.primary}
              />

              <Text style={styles.gameCountText}>
                {games.length} Games
              </Text>

            </View>

          </View>

          {/* ====================================================
              FIRST GAMES
          ==================================================== */}

          <View
            style={[
              styles.gameList,

              isTablet && styles.gameGrid,
            ]}
          >
            {games
              .slice(0, 4)
              .map(renderGame)}
          </View>

          {/* ====================================================
              MORE GAMES
          ==================================================== */}

          <View style={styles.chooseSection}>

            <Text style={styles.selectText}>
              More Mind Games
            </Text>

            <Text style={styles.selectDescription}>
              Try different activities to keep your memory
              and attention engaged.
            </Text>

          </View>

          <View
            style={[
              styles.gameList,

              isTablet && styles.gameGrid,
            ]}
          >
            {games
              .slice(4)
              .map(renderGame)}
          </View>

          <View style={styles.bottomSpacing} />

        </ScrollView>

        {/* ====================================================
            BOTTOM NAVIGATION
        ==================================================== */}

        <View style={styles.bottomNav}>

          <NavButton
            label="Home"
            icon="⌂"
            onPress={onHome}
          />

          <NavButton
            label="Games"
            icon="🎮"
            active
            onPress={onGames}
          />

          <NavButton
            label="Schedule"
            icon="📅"
            onPress={onSchedule}
          />

          <NavButton
            label="Memories"
            icon="💚"
            onPress={onMemory}
          />

          <NavButton
            label="Profile"
            icon="👤"
            onPress={onProfile}
          />

        </View>

        {/* ====================================================
            QUICK ASSIST
        ==================================================== */}

        <QuickAssist
          bottomOffset={100}
          onVoiceAssistant={onVoiceAssistant}
        />

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

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',

    paddingHorizontal: 20,
    paddingTop: 106,
    paddingBottom: 25,
  },

  contentTablet: {
    paddingHorizontal: 32,
    paddingTop: 116,
  },

  contentLarge: {
    maxWidth: 1100,
    paddingHorizontal: 40,
  },

  /* ====================================================
     HEADER
  ==================================================== */

  header: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    zIndex: 50,

    minHeight: 86,

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,

    backgroundColor: COLORS.surface,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    flexShrink: 1,
  },

  backButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  backPressed: {
    backgroundColor: COLORS.surfaceLow,
  },

  headerTitle: {
    fontSize: 25,
    lineHeight: 31,

    fontWeight: '800',

    color: COLORS.primary,
  },

  headerSubtitle: {
    marginTop: 2,

    fontSize: 15,
    lineHeight: 20,

    color: COLORS.onSurfaceVariant,
  },

  headerPattern: {
    width: 90,
    height: 7,

    marginLeft: 12,

    borderRadius: 4,

    overflow: 'hidden',

    flexDirection: 'row',

    opacity: 0.8,
  },

  redPattern: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },

  whitePattern: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* ====================================================
     INTRO CARD
  ==================================================== */

  introCard: {
    backgroundColor: COLORS.primaryContainer,

    borderRadius: 20,

    padding: 20,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 28,

    shadowOpacity: 0.06,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  introIcon: {
    width: 68,
    height: 68,

    borderRadius: 34,

    backgroundColor: 'rgba(255,255,255,0.15)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  introText: {
    flex: 1,
  },

  introTitle: {
    fontSize: 21,
    lineHeight: 28,

    fontWeight: '800',

    color: '#FFFFFF',

    marginBottom: 5,
  },

  introDescription: {
    fontSize: 15,
    lineHeight: 22,

    color: '#F1F0E7',
  },

  /* ====================================================
     SECTION
  ==================================================== */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 16,

    paddingHorizontal: 4,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionHeading: {
    fontSize: 23,
    lineHeight: 30,

    fontWeight: '800',

    color: COLORS.onSurface,
  },

  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 21,

    color: COLORS.onSurfaceVariant,

    marginTop: 2,
  },

  gameCount: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.surfaceLow,

    borderRadius: 20,

    paddingHorizontal: 12,
    paddingVertical: 8,

    marginLeft: 8,
  },

  gameCountText: {
    marginLeft: 5,

    fontSize: 14,

    fontWeight: '700',

    color: COLORS.primary,
  },

  /* ====================================================
     GAME LIST
  ==================================================== */

  gameList: {
    gap: 14,
  },

  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',
  },

  gameCard: {
    width: '100%',
    minHeight: 112,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,

    borderRadius: 18,

    padding: 18,

    flexDirection: 'row',
    alignItems: 'center',

    overflow: 'hidden',

    shadowOpacity: 0.04,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  gameCardTablet: {
    width: '48.5%',
    minHeight: 130,

    padding: 20,
  },

  gameCardPressed: {
    borderColor: COLORS.primary,

    backgroundColor: COLORS.surfaceLow,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  patternBar: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    height: 4,

    opacity: 0.8,
  },

  gameIcon: {
    width: 68,
    height: 68,

    borderRadius: 34,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  gameIconTablet: {
    width: 76,
    height: 76,

    borderRadius: 38,

    marginRight: 18,
  },

  gameText: {
    flex: 1,
    minWidth: 0,
  },

  gameTitle: {
    fontSize: 20,
    lineHeight: 26,

    fontWeight: '800',

    color: COLORS.primary,

    marginBottom: 5,
  },

  gameTitleTablet: {
    fontSize: 21,
    lineHeight: 28,
  },

  description: {
    fontSize: 15,
    lineHeight: 21,

    color: COLORS.onSurfaceVariant,
  },

  descriptionTablet: {
    fontSize: 16,
    lineHeight: 23,
  },

  arrowContainer: {
    width: 34,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 6,
  },

  /* ====================================================
     MORE GAMES
  ==================================================== */

  chooseSection: {
    marginTop: 30,
    marginBottom: 16,

    paddingHorizontal: 4,
  },

  selectText: {
    fontSize: 22,
    lineHeight: 30,

    fontWeight: '800',

    color: COLORS.onSurface,
  },

  selectDescription: {
    fontSize: 15,
    lineHeight: 22,

    color: COLORS.onSurfaceVariant,

    marginTop: 3,
  },

  bottomSpacing: {
    height: 25,
  },

  /* ====================================================
     BOTTOM NAVIGATION
  ==================================================== */

  bottomNav: {
    height: 88,
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingHorizontal: 8,
    paddingVertical: 8,

    backgroundColor: COLORS.surface,

    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,

    shadowOpacity: 0.06,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: -2,
    },

    elevation: 8,
  },

  navButton: {
    width: 72,
    minHeight: 64,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 6,
  },

  navButtonActive: {
    backgroundColor: COLORS.primaryContainer,
  },

  navButtonPressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  navIcon: {
    fontSize: 25,
    lineHeight: 30,

    color: COLORS.onSurfaceVariant,
  },

  navIconActive: {
    color: COLORS.onPrimaryContainer,
  },

  navLabel: {
    marginTop: 3,

    fontSize: 13,
    lineHeight: 18,

    fontWeight: '700',

    color: COLORS.onSurfaceVariant,
  },

  navLabelActive: {
    color: COLORS.onPrimaryContainer,
  },
});
