import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    background: '#FCF9F8',
    primary: '#00450D',
    primaryContainer: '#1B5E20',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#90D689',

    surfaceContainer: '#F0EDED',
    surfaceContainerLow: '#F6F3F2',
    surfaceContainerHigh: '#EAE7E7',
    surfaceContainerHighest: '#E5E2E1',
    surfaceLowest: '#FFFFFF',

    secondary: '#556158',
    secondaryFixed: '#D9E6DA',
    onSecondaryFixed: '#131E17',

    onSurface: '#1B1C1C',
    onSurfaceVariant: '#41493E',
    outline: '#717A6D',
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type CognitiveProgressScreenProps = {
    onBack?: () => void;
    onHome?: () => void;
    onGames?: () => void;
    onSchedule?: () => void;
    onMemory?: () => void;
    onProfile?: () => void;
    onActivityHistory?: () => void;
    onDownloadSummary?: () => void;
};

type Category = {
    title: string;
    score: number;
    icon: MaterialIconName;
    description: string;
};

const categories: Category[] = [
    {
        title: 'Memory',
        score: 82,
        icon: 'psychology',
        description:
            'Consistent recall of family members & daily tea routine.',
    },
    {
        title: 'Attention / Concentration',
        score: 76,
        icon: 'center-focus-strong',
        description:
            'Good focus during morning card match sessions.',
    },
    {
        title: 'Pattern Recognition',
        score: 88,
        icon: 'grid-view',
        description:
            'High accuracy in identifying traditional Assamese textile patterns.',
    },
    {
        title: 'Object Recognition',
        score: 84,
        icon: 'category',
        description:
            'Prompt recognition of household items like bell-metal utensils and hand fans.',
    },
    {
        title: 'Routine Recall',
        score: 75,
        icon: 'schedule',
        description:
            'Improving morning sequence recall with warm audio cues.',
    },
];

const filterOptions = ['7 Days', '30 Days', 'All-Time'];

export default function CognitiveProgressScreen({
    onBack,
    onHome,
    onGames,
    onSchedule,
    onMemory,
    onProfile,
    onActivityHistory,
    onDownloadSummary,
}: CognitiveProgressScreenProps) {
    const insets = useSafeAreaInsets();
    const [selectedFilter, setSelectedFilter] = useState('7 Days');

    const handleFilterPress = (filter: string) => {
        setSelectedFilter(filter);
    };

    const handleHistory = () => {
        if (onActivityHistory) {
            onActivityHistory();
        } else {
            Alert.alert('Activity History', 'Activity history will be available here.');
        }
    };

    const handleDownload = () => {
        if (onDownloadSummary) {
            onDownloadSummary();
        } else {
            Alert.alert(
                'Care Summary',
                'Care summary download will be connected by the backend integration.'
            );
        }
    };

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerInner}>
                    <Pressable
                        onPress={onBack}
                        style={({ pressed }) => [
                            styles.headerButton,
                            pressed && styles.pressed,
                        ]}
                        accessibilityLabel="Go back"
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={28}
                            color={COLORS.onSurface}
                        />
                    </Pressable>

                    <Text style={styles.headerTitle} numberOfLines={1}>
                        SmritiCare
                    </Text>

                    <View style={styles.profileCircle}>
                        <MaterialIcons
                            name="person"
                            size={18}
                            color={COLORS.onPrimary}
                        />
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: insets.top + 80,
                        paddingBottom: insets.bottom + 120,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Patient Context Header Strip */}
                <View style={styles.patientStrip}>
                    <View style={styles.patientInfo}>
                        <View style={styles.patientIconCircle}>
                            <MaterialIcons
                                name="elderly"
                                size={24}
                                color={COLORS.onSecondaryFixed}
                            />
                        </View>

                        <View style={styles.patientTextContainer}>
                            <Text style={styles.patientName} numberOfLines={1}>
                                Ramani Barman (72)
                            </Text>

                            <View style={styles.performanceRow}>
                                <View style={styles.performanceDot} />

                                <Text style={styles.performanceText}>
                                    7-Day Performance Profile
                                </Text>
                            </View>
                        </View>
                    </View>

                    <MaterialIcons
                        name="monitor-heart"
                        size={24}
                        color={COLORS.secondary}
                    />
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>
                        Cognitive Progress &amp; Insights
                    </Text>

                    <Text style={styles.subtitle}>
                        Gentle daily tracking across culturally rooted engagement games.
                    </Text>
                </View>

                {/* Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {filterOptions.map((filter) => {
                        const isSelected = selectedFilter === filter;

                        return (
                            <Pressable
                                key={filter}
                                onPress={() => handleFilterPress(filter)}
                                style={({ pressed }) => [
                                    styles.filterPill,
                                    isSelected
                                        ? styles.filterPillSelected
                                        : styles.filterPillUnselected,
                                    pressed && styles.pressed,
                                ]}
                            >
                                {isSelected && (
                                    <MaterialIcons
                                        name="check"
                                        size={18}
                                        color={COLORS.onPrimary}
                                    />
                                )}

                                <Text
                                    style={[
                                        styles.filterText,
                                        isSelected
                                            ? styles.filterTextSelected
                                            : styles.filterTextUnselected,
                                    ]}
                                >
                                    {filter}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Overall Cognitive Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                        <Text style={styles.scoreLabel}>
                            Overall Engagement Score
                        </Text>

                        <View style={styles.trendBadge}>
                            <MaterialIcons
                                name="trending-up"
                                size={16}
                                color={COLORS.onSecondaryFixed}
                            />

                            <Text style={styles.trendText}>
                                ↑ 4% from last week
                            </Text>
                        </View>
                    </View>

                    <View style={styles.scoreMainRow}>
                        {/* Circular Progress */}
                        <View style={styles.progressCircle}>
                            <View style={styles.progressTrack} />

                            <View
                                style={[
                                    styles.progressValue,
                                    {
                                        transform: [{ rotate: `${(82 / 100) * 360}deg` }],
                                    },
                                ]}
                            />

                            <View style={styles.progressInner}>
                                <Text style={styles.scoreNumber}>82</Text>

                                <Text style={styles.scoreOutOf}>/ 100</Text>
                            </View>
                        </View>

                        {/* Score Description */}
                        <View style={styles.scoreDescription}>
                            <Text style={styles.doingGreat}>Doing Great</Text>

                            <Text style={styles.descriptionText}>
                                Memory &amp; attention scores are stable and responsive
                                during routine hours.
                            </Text>
                        </View>
                    </View>

                    {/* Visual Context Banner */}
                    <View style={styles.contextBanner}>
                        <View style={styles.contextImagePlaceholder}>
                            <MaterialIcons
                                name="landscape"
                                size={42}
                                color={COLORS.onPrimaryContainer}
                            />
                        </View>

                        <View style={styles.contextOverlay}>
                            <Text style={styles.contextText}>
                                Active play during calm morning hours strengthens daily recall.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Category Breakdown */}
                <View style={styles.categorySection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Category Breakdown
                        </Text>

                        <Text style={styles.focusAreas}>
                            5 Focus Areas
                        </Text>
                    </View>

                    {categories.map((category) => (
                        <CategoryCard
                            key={category.title}
                            category={category}
                        />
                    ))}
                </View>

                {/* AI Adaptive Difficulty */}
                <View style={styles.aiCard}>
                    <View style={styles.aiHeader}>
                        <View style={styles.aiTitleRow}>
                            <MaterialIcons
                                name="smart-toy"
                                size={26}
                                color={COLORS.primary}
                            />

                            <Text style={styles.aiTitle}>
                                AI Adaptive Difficulty
                            </Text>
                        </View>

                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>
                                Active
                            </Text>
                        </View>
                    </View>

                    {/* Level Matrix */}
                    <View style={styles.levelRow}>
                        <View style={styles.levelCard}>
                            <Text style={styles.levelLabel}>
                                Current Level
                            </Text>

                            <Text style={styles.levelNumber}>
                                Level 3
                            </Text>

                            <Text style={styles.levelDescription}>
                                Moderate challenge
                            </Text>
                        </View>

                        <View style={styles.levelCard}>
                            <Text style={styles.levelLabel}>
                                Recommended
                            </Text>

                            <Text
                                style={[
                                    styles.levelNumber,
                                    { color: COLORS.primaryContainer },
                                ]}
                            >
                                Level 3
                            </Text>

                            <Text style={styles.levelDescription}>
                                Maintain current pace
                            </Text>
                        </View>
                    </View>

                    {/* AI Insights */}
                    <View style={styles.insightsBox}>
                        <View style={styles.insightRow}>
                            <MaterialIcons
                                name="insights"
                                size={20}
                                color={COLORS.primary}
                            />

                            <Text style={styles.insightText}>
                                Difficulty is automatically adapted based on recent accuracy (
                                <Text style={styles.boldText}>84% avg</Text>) and response
                                time (<Text style={styles.boldText}>4.2s</Text>). Non-diagnostic
                                cognitive engagement.
                            </Text>
                        </View>

                        <View style={styles.insightRow}>
                            <MaterialIcons
                                name="recommend"
                                size={20}
                                color={COLORS.primary}
                            />

                            <Text style={styles.secondaryInsightText}>
                                <Text style={styles.boldText}>Recommendation:</Text>{' '}
                                Continue Level 3 Memory activities. Patient maintains stable
                                confidence.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaSection}>
                    <Pressable
                        onPress={handleHistory}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <MaterialIcons
                            name="history"
                            size={24}
                            color={COLORS.onPrimary}
                        />

                        <Text style={styles.primaryButtonText}>
                            View Activity History
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleDownload}
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <MaterialIcons
                            name="download"
                            size={24}
                            color={COLORS.onSurface}
                        />

                        <Text style={styles.secondaryButtonText}>
                            Download Care Summary
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View
                style={[
                    styles.bottomNav,
                    { paddingBottom: Math.max(insets.bottom, 8) },
                ]}
            >
                <BottomNavItem
                    icon="home"
                    label="Home"
                    onPress={onHome}
                />

                <BottomNavItem
                    icon="sports-esports"
                    label="Games"
                    onPress={onGames}
                />

                <BottomNavItem
                    icon="notifications-active"
                    label="Remind"
                    onPress={onSchedule}
                />

                <BottomNavItem
                    icon="psychology"
                    label="Memory"
                    active
                    onPress={onMemory}
                />

                <BottomNavItem
                    icon="person"
                    label="Profile"
                    onPress={onProfile}
                />
            </View>
        </View>
    );
}

function CategoryCard({ category }: { category: Category }) {
    return (
        <View style={styles.categoryCard}>
            <View style={styles.categoryTopRow}>
                <View style={styles.categoryTitleRow}>
                    <View style={styles.categoryIcon}>
                        <MaterialIcons
                            name={category.icon}
                            size={20}
                            color={COLORS.onSecondaryFixed}
                        />
                    </View>

                    <Text
                        style={styles.categoryTitle}
                        numberOfLines={1}
                    >
                        {category.title}
                    </Text>
                </View>

                <Text style={styles.categoryScore}>
                    {category.score}%
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${category.score}%` },
                    ]}
                />
            </View>

            <Text style={styles.categoryDescription}>
                {category.description}
            </Text>
        </View>
    );
}

type BottomNavItemProps = {
    icon: MaterialIconName;
    label: string;
    active?: boolean;
    onPress?: () => void;
};

function BottomNavItem({
    icon,
    label,
    active = false,
    onPress,
}: BottomNavItemProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.navItem,
                pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <MaterialIcons
                name={icon}
                size={28}
                color={
                    active
                        ? COLORS.primary
                        : COLORS.onSurfaceVariant
                }
            />

            <Text
                style={[
                    styles.navLabel,
                    active
                        ? styles.navLabelActive
                        : styles.navLabelInactive,
                ]}
            >
                {label}
            </Text>

            {active && <View style={styles.navIndicator} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    /* Header */
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: COLORS.background,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 3,
    },

    headerInner: {
        height: 64,
        maxWidth: 560,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 8,
        color: COLORS.primary,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
    },

    profileCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },

    /* Scroll */
    scrollView: {
        flex: 1,
    },

    content: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        paddingHorizontal: 20,
        gap: 24,
    },

    /* Patient Strip */
    patientStrip: {
        minHeight: 68,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceContainerHigh,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    patientInfo: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },

    patientIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    patientTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    patientName: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    performanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },

    performanceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginRight: 5,
    },

    performanceText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 18,
    },

    /* Title */
    titleSection: {
        gap: 4,
    },

    mainTitle: {
        color: COLORS.onSurface,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
    },

    subtitle: {
        color: COLORS.onSurfaceVariant,
        fontSize: 16,
        lineHeight: 24,
    },

    /* Filters */
    filterRow: {
        gap: 8,
        paddingVertical: 2,
    },

    filterPill: {
        minHeight: 48,
        paddingHorizontal: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },

    filterPillSelected: {
        backgroundColor: COLORS.primary,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    filterPillUnselected: {
        backgroundColor: COLORS.surfaceContainerHighest,
    },

    filterText: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '600',
    },

    filterTextSelected: {
        color: COLORS.onPrimary,
    },

    filterTextUnselected: {
        color: COLORS.onSurfaceVariant,
    },

    /* Score Card */
    scoreCard: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },

    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    scoreLabel: {
        flex: 1,
        color: COLORS.onSurfaceVariant,
        fontSize: 16,
        lineHeight: 21,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: COLORS.secondaryFixed,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },

    trendText: {
        color: COLORS.onSecondaryFixed,
        fontSize: 14,
        fontWeight: '600',
    },

    scoreMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },

    /* Circular Progress */
    progressCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    progressTrack: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 10,
        borderColor: COLORS.surfaceContainer,
    },

    progressValue: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 10,
        borderColor: COLORS.primary,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
    },

    progressInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    scoreNumber: {
        color: COLORS.primary,
        fontSize: 26,
        lineHeight: 29,
        fontWeight: '700',
    },

    scoreOutOf: {
        color: COLORS.onSurfaceVariant,
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '600',
    },

    scoreDescription: {
        flex: 1,
        gap: 4,
    },

    doingGreat: {
        color: COLORS.onSurface,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '700',
    },

    descriptionText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 22,
    },

    /* Context Banner */
    contextBanner: {
        height: 96,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },

    contextImagePlaceholder: {
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 32,
    },

    contextOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '72%',
        backgroundColor: 'rgba(0,69,13,0.82)',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    contextText: {
        color: COLORS.onPrimary,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },

    /* Category Section */
    categorySection: {
        gap: 12,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        color: COLORS.onSurface,
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',
    },

    focusAreas: {
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },

    categoryCard: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },

    categoryTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    categoryTitleRow: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
    },

    categoryTitle: {
        flex: 1,
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    categoryScore: {
        color: COLORS.primary,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '700',
    },

    progressBarTrack: {
        width: '100%',
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.surfaceContainer,
        overflow: 'hidden',
    },

    progressBarFill: {
        height: '100%',
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },

    categoryDescription: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 22,
    },

    /* AI Card */
    aiCard: {
        backgroundColor: COLORS.secondaryFixed,
        borderRadius: 12,
        padding: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },

    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    aiTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    aiTitle: {
        color: COLORS.onSurface,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '700',
    },

    activeBadge: {
        backgroundColor: '#ACF4A4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    activeBadgeText: {
        color: '#002203',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    levelRow: {
        flexDirection: 'row',
        gap: 12,
    },

    levelCard: {
        flex: 1,
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 8,
        padding: 14,
        gap: 3,
    },

    levelLabel: {
        color: COLORS.onSurfaceVariant,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
        textTransform: 'uppercase',
    },

    levelNumber: {
        color: COLORS.primary,
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',
    },

    levelDescription: {
        color: COLORS.onSurfaceVariant,
        fontSize: 12,
        lineHeight: 17,
    },

    insightsBox: {
        backgroundColor: 'rgba(255,255,255,0.80)',
        borderRadius: 8,
        padding: 14,
        gap: 14,
    },

    insightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },

    insightText: {
        flex: 1,
        color: COLORS.onSurface,
        fontSize: 14,
        lineHeight: 21,
    },

    secondaryInsightText: {
        flex: 1,
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 21,
    },

    boldText: {
        fontWeight: '700',
        color: COLORS.onSurface,
    },

    /* CTA */
    ctaSection: {
        gap: 12,
        paddingTop: 8,
    },

    primaryButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },

    primaryButtonText: {
        color: COLORS.onPrimary,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    secondaryButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceContainerHigh,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    secondaryButtonText: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    /* Bottom Navigation */
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 80,
        backgroundColor: COLORS.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 8,
        zIndex: 50,
    },

    navItem: {
        minWidth: 56,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },

    navLabel: {
        fontSize: 14,
        lineHeight: 18,
        marginTop: 2,
    },

    navLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    navLabelInactive: {
        color: COLORS.onSurfaceVariant,
        fontWeight: '500',
    },

    navIndicator: {
        width: 32,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        marginTop: 2,
    },

    pressed: {
        opacity: 0.7,
    },

    buttonPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.9,
    },
});