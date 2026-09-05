import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type GamesScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
  onGuessFood?: () => void;
  onTraditionalDress?: () => void;
  onFestivalMemory?: () => void;
  onBelongsTogether?: () => void;
  onSpotDifference?: () => void;
  onOddOneOut?: () => void;
  onColorSequence?: () => void;
  onSoundGames?: () => void;
  onWhatIsMissing?: () => void;
};

const COLORS = {
  background: '#F4FAFF', surface: '#F4FAFF', surfaceLowest: '#FFFFFF',
  surfaceLow: '#E9F6FD', surfaceVariant: '#D7E4EC', primary: '#00450D',
  primaryContainer: '#1B5E20', onPrimaryContainer: '#90D689',
  secondary: '#00629E', secondaryContainer: '#62B4FE',
  onSecondaryContainer: '#004470', tertiaryContainer: '#A70515',
  onTertiaryContainer: '#FFB2AA', onSurfaceVariant: '#41493E',
  outline: '#717A6D', outlineVariant: '#C0C9BB',
};

type Game = { title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap; bg: string; iconColor: string; bar: string; onPress?: () => void };

export default function GamesScreen({
  onBack, onHome, onSchedule, onMemory, onProfile,
  onGuessFood, onTraditionalDress, onFestivalMemory, onBelongsTogether,
  onSpotDifference, onOddOneOut, onColorSequence, onSoundGames, onWhatIsMissing,
}: GamesScreenProps) {
  const [activeTab, setActiveTab] = useState('Games');

  const games: Game[] = [
    { title: 'Guess the Food', description: 'Recognize familiar regional dishes.', icon: 'restaurant', bg: COLORS.secondaryContainer, iconColor: COLORS.onSecondaryContainer, bar: COLORS.primaryContainer, onPress: onGuessFood },
    { title: 'Traditional Dress Match', description: 'Match beautiful textiles and clothing.', icon: 'checkroom', bg: COLORS.tertiaryContainer, iconColor: COLORS.onTertiaryContainer, bar: COLORS.tertiaryContainer, onPress: onTraditionalDress },
    { title: 'Festival Memory', description: 'Remember vibrant local celebrations.', icon: 'celebration', bg: COLORS.primaryContainer, iconColor: COLORS.onPrimaryContainer, bar: COLORS.secondary, onPress: onFestivalMemory },
    { title: 'What Belongs Together?', description: 'Match related items from the North East.', icon: 'extension', bg: COLORS.surfaceVariant, iconColor: COLORS.onSurfaceVariant, bar: COLORS.outline, onPress: onBelongsTogether },
    { title: 'Spot the Difference', description: 'Find hidden changes between pictures.', icon: 'search', bg: COLORS.secondaryContainer, iconColor: COLORS.onSecondaryContainer, bar: COLORS.primaryContainer, onPress: onSpotDifference },
    { title: 'Odd One Out', description: 'Identify the unique item in local patterns.', icon: 'category', bg: COLORS.tertiaryContainer, iconColor: COLORS.onTertiaryContainer, bar: COLORS.tertiaryContainer, onPress: onOddOneOut },
    { title: 'Color Sequence', description: 'Remember and repeat the color patterns.', icon: 'palette', bg: COLORS.primaryContainer, iconColor: COLORS.onPrimaryContainer, bar: COLORS.secondary, onPress: onColorSequence },
    { title: 'Sound Games', description: 'Match the familiar daily sounds.', icon: 'music-note', bg: COLORS.surfaceVariant, iconColor: COLORS.onSurfaceVariant, bar: COLORS.outline, onPress: onSoundGames },
    { title: 'What is Missing', description: 'Find the missing piece of the picture.', icon: 'help-center', bg: COLORS.secondaryContainer, iconColor: COLORS.onSecondaryContainer, bar: COLORS.primaryContainer, onPress: onWhatIsMissing },
  ];

  const play = (g: Game) => g.onPress ? g.onPress() : Alert.alert(g.title, 'Game screen coming next.');

  const nav = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Home') onHome?.();
    if (tab === 'Remind') onSchedule?.();
    if (tab === 'Memory') onMemory?.();
    if (tab === 'Profile') onProfile?.();
  };

  const renderGame = (g: Game) => (
    <Pressable key={g.title} accessibilityRole="button" accessibilityLabel={`Play ${g.title}`}
      style={({ pressed }) => [styles.gameCard, pressed && styles.gamePressed]} onPress={() => play(g)}>
      <View style={[styles.patternBar, { backgroundColor: g.bar }]} />
      <View style={[styles.gameIcon, { backgroundColor: g.bg }]}>
        <MaterialIcons name={g.icon} size={40} color={g.iconColor} />
      </View>
      <View style={styles.gameText}>
        <Text style={styles.gameTitle}>{g.title}</Text>
        <Text style={styles.description}>{g.description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={32} color={COLORS.outlineVariant} />
    </Pressable>
  );

  const navItem = (tab: string, icon: keyof typeof MaterialIcons.glyphMap) => (
    <Pressable key={tab} style={[styles.navItem, activeTab === tab && styles.activeNavItem]} onPress={() => nav(tab)}>
      <MaterialIcons name={icon} size={28} color={activeTab === tab ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant} />
      <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>{tab}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack} accessibilityLabel="Go Back">
            <MaterialIcons name="arrow-back" size={32} color={COLORS.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.appTitle}>Brain Games</Text>
          <View style={styles.headerPattern}><View style={styles.red}/><View style={styles.white}/><View style={styles.red}/><View style={styles.white}/><View style={styles.red}/></View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeading}>North East Games</Text>
          <View style={styles.gameList}>{games.slice(0, 4).map(renderGame)}</View>
          <Text style={styles.selectText}>Select a game to exercise your mind.</Text>
          <View style={styles.gameList}>{games.slice(4).map(renderGame)}</View>
          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.bottomNav}>
          {navItem('Home', 'home')}
          {navItem('Games', 'extension')}
          {navItem('Remind', 'alarm')}
          {navItem('Memory', 'auto-stories')}
          {navItem('Profile', 'person')}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 104, paddingBottom: 20 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, backgroundColor: COLORS.surface, borderBottomWidth: 2, borderBottomColor: COLORS.outlineVariant, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  appTitle: { fontSize: 28, lineHeight: 36, fontWeight: '700', color: COLORS.primary },
  headerPattern: { marginLeft: 'auto', width: 120, height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', opacity: 0.8 },
  red: { flex: 1, backgroundColor: COLORS.tertiaryContainer }, white: { flex: 1, backgroundColor: COLORS.surfaceLowest },
  sectionHeading: { fontSize: 22, lineHeight: 32, color: COLORS.onSurfaceVariant, paddingHorizontal: 8, marginBottom: 16 },
  selectText: { fontSize: 22, lineHeight: 32, color: COLORS.onSurfaceVariant, paddingHorizontal: 8, marginTop: 32, marginBottom: 16 },
  gameList: { gap: 16 },
  gameCard: { width: '100%', minHeight: 116, backgroundColor: COLORS.surfaceLowest, borderWidth: 2, borderColor: COLORS.outlineVariant, borderRadius: 12, padding: 24, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  gamePressed: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceLow, transform: [{ scale: 0.99 }] },
  patternBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, opacity: 0.5 },
  gameIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginRight: 24 },
  gameText: { flex: 1 },
  gameTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  description: { fontSize: 18, lineHeight: 28, color: COLORS.onSurfaceVariant },
  bottomNav: { height: 88, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: COLORS.surface, borderTopWidth: 2, borderTopColor: COLORS.outlineVariant },
  navItem: { width: 72, minHeight: 60, padding: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activeNavItem: { backgroundColor: COLORS.primaryContainer, transform: [{ scale: 0.95 }] },
  navText: { marginTop: 4, fontSize: 14, lineHeight: 18, fontWeight: '700', color: COLORS.onSurfaceVariant },
  activeNavText: { color: COLORS.onPrimaryContainer },
  bottomSpacing: { height: 20 },
});
