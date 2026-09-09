import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OfflineSyncStatusScreenProps = {
    onBack?: () => void;
    onHome?: () => void;
    onGames?: () => void;
    onSchedule?: () => void;
    onMemory?: () => void;
    onProfile?: () => void;
};

const COLORS = {
    background: '#F4FAFF',
    surface: '#FFFFFF',
    surfaceLowest: '#FFFFFF',
    surfaceLow: '#F6F3F2',
    surfaceContainer: '#F0EDED',
    surfaceHigh: '#EAE7E7',
    surfaceHighest: '#E5E2E1',

    primary: '#00450D',
    primaryContainer: '#1B5E20',
    primaryFixedDim: '#91D78A',
    onPrimary: '#FFFFFF',

    secondary: '#556158',
    secondaryContainer: '#D9E6DA',
    onSecondaryContainer: '#5B675E',
    onSecondaryFixed: '#131E17',
    onSecondaryFixedVariant: '#3E4A41',

    onSurface: '#111D23',
    onSurfaceVariant: '#41493E',
};

const SYNC_HISTORY = [
    {
        time: '10:42 AM',
        icon: 'psychology' as const,
        text: '5 Cognitive Activities & Game Scores Synced',
    },
    {
        time: '10:41 AM',
        icon: 'medication' as const,
        text: '6 Medication & Hydration Acknowledgements Synced',
    },
    {
        time: '10:40 AM',
        icon: 'edit-calendar' as const,
        text: '2 Routine Changes & Notes Synced',
    },
    {
        time: '07:15 AM',
        icon: 'power-settings-new' as const,
        text: 'Morning Startup & Battery Telemetry Synced',
    },
];

export default function OfflineSyncStatusScreen({
    onBack,
    onHome,
    onGames,
    onSchedule,
    onMemory,
    onProfile,
}: OfflineSyncStatusScreenProps) {
    const insets = useSafeAreaInsets();

    const [syncing, setSyncing] = useState(false);
    const [syncComplete, setSyncComplete] = useState(false);
    const [lastSynced, setLastSynced] =
        useState('Today, 10:42 AM');

    useEffect(() => {
        if (!syncComplete) return;

        const timer = setTimeout(() => {
            setSyncComplete(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [syncComplete]);

    const triggerSync = () => {
        if (syncing) return;

        setSyncing(true);
        setSyncComplete(false);

        setTimeout(() => {
            setSyncing(false);
            setSyncComplete(true);
            setLastSynced('Today, just now');
        }, 1200);
    };

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: insets.top },
                ]}
            >
                <View style={styles.headerInner}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={onBack}
                        style={({ pressed }) => [
                            styles.headerButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={28}
                            color={COLORS.onSurface}
                        />
                    </Pressable>

                    <Text
                        numberOfLines={1}
                        style={styles.headerTitle}
                    >
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

            {/* Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingBottom: 120 + insets.bottom,
                    },
                ]}
            >
                {/* Page heading */}
                <View style={styles.headingBlock}>
                    <View style={styles.headingRow}>
                        <MaterialIcons
                            name="cloud-done"
                            size={22}
                            color={COLORS.primary}
                        />

                        <Text style={styles.pageTitle}>
                            Offline &amp; Data Synchronization
                        </Text>
                    </View>

                    <Text style={styles.subtitle}>
                        Telemetry &amp; synchronization bridge for Ramani Devi
                    </Text>
                </View>

                {/* Current sync status */}
                <View style={styles.card}>
                    <View style={styles.statusRow}>
                        <View style={styles.onlineBadge}>
                            <View style={styles.onlineDot} />

                            <Text style={styles.onlineText}>
                                ONLINE (Stable Cloud Sync)
                            </Text>
                        </View>

                        <MaterialIcons
                            name="cloud-done"
                            size={24}
                            color={COLORS.primary}
                        />
                    </View>

                    <Text style={styles.syncTime}>
                        {lastSynced}
                    </Text>

                    <Text style={styles.syncLabel}>
                        Last Synced to Cloud
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            All 18 activities and care logs are
                            synchronized between Ramani&apos;s device
                            and Caregiver portal.
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Force sync now"
                        disabled={syncing}
                        onPress={triggerSync}
                        style={({ pressed }) => [
                            styles.syncButton,
                            syncing &&
                            styles.syncButtonDisabled,
                            pressed &&
                            !syncing &&
                            styles.buttonPressed,
                        ]}
                    >
                        <MaterialIcons
                            name={
                                syncComplete
                                    ? 'check-circle'
                                    : 'sync'
                            }
                            size={24}
                            color={COLORS.onPrimary}
                        />

                        <Text style={styles.syncButtonText}>
                            {syncing
                                ? 'Syncing Records...'
                                : syncComplete
                                    ? 'All Records Synchronized!'
                                    : 'Force Sync Now'}
                        </Text>
                    </Pressable>
                </View>

                {/* Synchronization flow */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Synchronization Flow
                        </Text>

                        <MaterialIcons
                            name="hub"
                            size={20}
                            color={COLORS.primary}
                        />
                    </View>

                    <View style={styles.flowRow}>
                        <View style={styles.flowBox}>
                            <MaterialIcons
                                name="smartphone"
                                size={24}
                                color={COLORS.primary}
                            />

                            <Text style={styles.flowLabel}>
                                Patient Device
                            </Text>
                        </View>

                        <MaterialIcons
                            name="arrow-forward"
                            size={20}
                            color={COLORS.primary}
                        />

                        <View style={styles.flowBox}>
                            <MaterialIcons
                                name="enhanced-encryption"
                                size={24}
                                color={COLORS.primary}
                            />

                            <Text style={styles.flowLabel}>
                                Encrypted Cache
                            </Text>
                        </View>
                    </View>

                    <View style={styles.autoSyncRow}>
                        <View style={styles.autoSyncSpacer} />

                        <View style={styles.autoSyncBox}>
                            <MaterialIcons
                                name="sync-alt"
                                size={24}
                                color={COLORS.primary}
                            />

                            <Text style={styles.autoSyncText}>
                                Auto Sync
                            </Text>
                        </View>

                        <MaterialIcons
                            name="arrow-forward"
                            size={20}
                            color={COLORS.primary}
                        />
                    </View>

                    <View style={styles.dashboardBox}>
                        <MaterialIcons
                            name="dashboard"
                            size={22}
                            color={COLORS.primary}
                        />

                        <Text style={styles.dashboardText}>
                            Caregiver Dashboard (Web &amp; App)
                        </Text>
                    </View>

                    <Text style={styles.flowDescription}>
                        Activities, games, and reminders operate
                        100% offline and automatically sync once
                        network is restored.
                    </Text>
                </View>

                {/* Sync metrics */}
                <View style={styles.metricsSection}>
                    <Text style={styles.sectionTitle}>
                        Sync Metrics
                    </Text>

                    <View style={styles.metricsGrid}>
                        <MetricCard
                            label="Synced Today"
                            icon="fact-check"
                            value="18 Records"
                            detail="All up-to-date"
                            valueColor={COLORS.primary}
                        />

                        <MetricCard
                            label="Pending Sync"
                            icon="hourglass-empty"
                            value="0 Records"
                            detail="Cache clean"
                            valueColor={COLORS.onSurface}
                            detailColor={COLORS.primary}
                        />

                        <MetricCard
                            label="Connection"
                            icon="wifi"
                            value="Wi-Fi"
                            detail="Signal Strong"
                            valueColor={COLORS.onSurface}
                        />

                        <MetricCard
                            label="Patient Battery"
                            icon="battery-5-bar"
                            value="68%"
                            detail="Optimal Level"
                            valueColor={COLORS.primary}
                        />
                    </View>
                </View>

                {/* Offline resilience */}
                <View style={styles.resilienceCard}>
                    <MaterialIcons
                        name="shield"
                        size={26}
                        color={COLORS.primary}
                    />

                    <View style={styles.resilienceContent}>
                        <Text style={styles.resilienceTitle}>
                            Offline Resilience Active
                        </Text>

                        <Text style={styles.resilienceText}>
                            Even during rural network outages,
                            reminders and speech anchors will trigger
                            on time with zero delay.
                        </Text>
                    </View>
                </View>

                {/* Sync history */}
                <View style={styles.card}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>
                            Sync History Log
                        </Text>

                        <Text style={styles.todayText}>
                            Today
                        </Text>
                    </View>

                    <View style={styles.historyList}>
                        {SYNC_HISTORY.map((item, index) => (
                            <View
                                key={`${item.time}-${item.text}`}
                                style={styles.historyItem}
                            >
                                <View style={styles.timeline}>
                                    <View style={styles.checkCircle}>
                                        <MaterialIcons
                                            name="check"
                                            size={16}
                                            color={COLORS.onPrimary}
                                        />
                                    </View>

                                    {index <
                                        SYNC_HISTORY.length - 1 && (
                                            <View
                                                style={
                                                    styles.timelineLine
                                                }
                                            />
                                        )}
                                </View>

                                <View
                                    style={
                                        styles.historyContent
                                    }
                                >
                                    <View
                                        style={
                                            styles.historyTopRow
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.historyTime
                                            }
                                        >
                                            {item.time}
                                        </Text>

                                        <MaterialIcons
                                            name={item.icon}
                                            size={16}
                                            color={COLORS.primary}
                                        />
                                    </View>

                                    <Text
                                        style={
                                            styles.historyText
                                        }
                                    >
                                        {item.text}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom navigation */}
            <View
                style={[
                    styles.bottomNav,
                    {
                        paddingBottom: Math.max(
                            insets.bottom,
                            8,
                        ),
                    },
                ]}
            >
                <View style={styles.bottomNavInner}>
                    <NavItem
                        icon="home"
                        label="Home"
                        onPress={onHome}
                    />

                    <NavItem
                        icon="sports-esports"
                        label="Games"
                        onPress={onGames}
                    />

                    <NavItem
                        icon="notifications-active"
                        label="Remind"
                        onPress={onSchedule}
                    />

                    <NavItem
                        icon="psychology"
                        label="Memory"
                        active
                        onPress={onMemory}
                    />

                    <NavItem
                        icon="person"
                        label="Profile"
                        onPress={onProfile}
                    />
                </View>
            </View>
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Metric Card                                                                */
/* -------------------------------------------------------------------------- */

type MetricCardProps = {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    value: string;
    detail: string;
    valueColor: string;
    detailColor?: string;
};

function MetricCard({
    label,
    icon,
    value,
    detail,
    valueColor,
    detailColor,
}: MetricCardProps) {
    return (
        <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>
                    {label}
                </Text>

                <MaterialIcons
                    name={icon}
                    size={20}
                    color={COLORS.primary}
                />
            </View>

            <Text
                style={[
                    styles.metricValue,
                    { color: valueColor },
                ]}
            >
                {value}
            </Text>

            <Text
                style={[
                    styles.metricDetail,
                    detailColor
                        ? { color: detailColor }
                        : null,
                ]}
            >
                {detail}
            </Text>
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Bottom Navigation                                                          */
/* -------------------------------------------------------------------------- */

type NavItemProps = {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    active?: boolean;
    onPress?: () => void;
};

function NavItem({
    icon,
    label,
    active = false,
    onPress,
}: NavItemProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [
                styles.navItem,
                pressed && styles.pressed,
            ]}
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
                    active && styles.navLabelActive,
                ]}
            >
                {label}
            </Text>

            {active && (
                <View style={styles.activeIndicator} />
            )}
        </Pressable>
    );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

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
        zIndex: 20,
        backgroundColor: 'rgba(244, 250, 255, 0.96)',
        shadowColor: '#000000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        elevation: 3,
    },

    headerInner: {
        height: 64,
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
        marginHorizontal: 8,
        textAlign: 'center',
        color: COLORS.primary,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    profileCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Main */

    content: {
        width: '100%',
        maxWidth: 448,
        alignSelf: 'center',
        paddingTop: 88,
        paddingHorizontal: 20,
    },

    headingBlock: {
        marginBottom: 16,
    },

    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    pageTitle: {
        flex: 1,
        color: COLORS.onSurface,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
        letterSpacing: -0.4,
    },

    subtitle: {
        marginTop: 4,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '400',
    },

    /* Cards */

    card: {
        width: '100%',
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000000',
        shadowOpacity: 0.035,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.secondaryContainer,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        maxWidth: '88%',
    },

    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primaryFixedDim,
        marginRight: 6,
    },

    onlineText: {
        color: COLORS.onSecondaryContainer,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    syncTime: {
        color: COLORS.primary,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
    },

    syncLabel: {
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    infoBox: {
        marginTop: 12,
        backgroundColor: COLORS.surfaceLow,
        borderRadius: 8,
        padding: 12,
    },

    infoText: {
        color: COLORS.onSurface,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '400',
    },

    syncButton: {
        minHeight: 56,
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 2,
    },

    syncButtonDisabled: {
        opacity: 0.8,
    },

    syncButtonText: {
        color: COLORS.onPrimary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        textAlign: 'center',
    },

    buttonPressed: {
        transform: [{ scale: 0.98 }],
    },

    pressed: {
        opacity: 0.75,
    },

    /* Sections */

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    sectionTitle: {
        color: COLORS.onSurface,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '700',
    },

    /* Flow */

    flowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
    },

    flowBox: {
        flex: 1,
        minHeight: 82,
        backgroundColor: COLORS.surfaceLow,
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    flowLabel: {
        marginTop: 4,
        color: COLORS.onSurface,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '600',
        textAlign: 'center',
    },

    autoSyncRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },

    autoSyncSpacer: {
        flex: 1,
    },

    autoSyncBox: {
        flex: 1,
        backgroundColor: COLORS.secondaryContainer,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    autoSyncText: {
        marginTop: 4,
        color: COLORS.onSecondaryFixed,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
        textAlign: 'center',
    },

    dashboardBox: {
        marginTop: 12,
        backgroundColor: COLORS.surfaceHigh,
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dashboardText: {
        marginLeft: 8,
        color: COLORS.onSurface,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600',
        textAlign: 'center',
    },

    flowDescription: {
        marginTop: 12,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
        textAlign: 'center',
    },

    /* Metrics */

    metricsSection: {
        marginBottom: 20,
    },

    metricsGrid: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },

    metricCard: {
        width: '48%',
        flexGrow: 1,
        minHeight: 138,
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'space-between',
        shadowColor: '#000000',
        shadowOpacity: 0.035,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
    },

    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    metricLabel: {
        flex: 1,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600',
    },

    metricValue: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',
    },

    metricDetail: {
        marginTop: 2,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
    },

    /* Resilience */

    resilienceCard: {
        marginBottom: 20,
        backgroundColor: COLORS.secondaryContainer,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        shadowColor: '#000000',
        shadowOpacity: 0.035,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
    },

    resilienceContent: {
        flex: 1,
    },

    resilienceTitle: {
        color: COLORS.onSecondaryFixed,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
    },

    resilienceText: {
        marginTop: 4,
        color: COLORS.onSecondaryFixedVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '400',
    },

    /* History */

    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    todayText: {
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },

    historyList: {
        gap: 0,
    },

    historyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minHeight: 74,
    },

    timeline: {
        width: 28,
        alignItems: 'center',
    },

    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    timelineLine: {
        width: 2,
        height: 40,
        marginTop: 4,
        backgroundColor: COLORS.surfaceHighest,
    },

    historyContent: {
        flex: 1,
        marginLeft: 12,
        marginBottom: 12,
        backgroundColor: COLORS.surfaceLow,
        borderRadius: 8,
        padding: 12,
    },

    historyTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    historyTime: {
        color: COLORS.primary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '700',
    },

    historyText: {
        marginTop: 4,
        color: COLORS.onSurface,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '400',
    },

    /* Bottom Navigation */

    bottomNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        backgroundColor: 'rgba(244, 250, 255, 0.96)',
        shadowColor: '#000000',
        shadowOpacity: 0.04,
        shadowRadius: 16,
        shadowOffset: {
            width: 0,
            height: -4,
        },
        elevation: 8,
    },

    bottomNavInner: {
        height: 80,
        maxWidth: 448,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    navItem: {
        minWidth: 56,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },

    navLabel: {
        marginTop: 2,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '600',
    },

    navLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    activeIndicator: {
        width: 32,
        height: 4,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
        marginTop: 2,
    },
});