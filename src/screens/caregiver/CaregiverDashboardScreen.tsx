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

    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#93000A',

    onSurface: '#1B1C1C',
    onSurfaceVariant: '#41493E',
    outline: '#717A6D',
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type CaregiverDashboardScreenProps = {
    onBack?: () => void;
    onHome?: () => void;
    onGames?: () => void;
    onSchedule?: () => void;
    onMemory?: () => void;
    onProfile?: () => void;
    onCognitiveProgress?: () => void;
    onAIAdaptation?: () => void;
    onRoutine?: () => void;
};

export default function CaregiverDashboardScreen({
    onBack,
    onHome,
    onGames,
    onSchedule,
    onMemory,
    onProfile,
    onCognitiveProgress,
    onAIAdaptation,
    onRoutine,
}: CaregiverDashboardScreenProps) {
    const insets = useSafeAreaInsets();

    const [syncing, setSyncing] = useState(false);
    const [reminderSent, setReminderSent] = useState(false);

    const handleSync = () => {
        if (syncing) return;

        setSyncing(true);

        setTimeout(() => {
            setSyncing(false);
            Alert.alert(
                'Sync Complete',
                'Ramani Barman’s tablet is now synchronized.'
            );
        }, 800);
    };

    const handleReminder = () => {
        if (reminderSent) return;

        setReminderSent(true);

        Alert.alert(
            'Reminder Sent',
            'A medication reminder has been sent to Ramani’s tablet.'
        );
    };

    const handleCallCompanion = () => {
        Alert.alert(
            'Call Companion',
            'The companion call feature will be connected during backend integration.'
        );
    };

    const handleCognitiveProgress = () => {
        if (onCognitiveProgress) {
            onCognitiveProgress();
        }
    };

    const handleAIAdaptation = () => {
        if (onAIAdaptation) {
            onAIAdaptation();
        }
    };

    const handleRoutine = () => {
        if (onRoutine) {
            onRoutine();
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

            {/* Main */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: insets.top + 82,
                        paddingBottom: insets.bottom + 120,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Portal Heading */}
                <View style={styles.headingSection}>
                    <Text style={styles.portalTitle}>Caregiver Portal</Text>

                    <View style={styles.locationRow}>
                        <MaterialIcons
                            name="location-on"
                            size={18}
                            color={COLORS.secondary}
                        />

                        <Text style={styles.locationText}>
                            Guwahati, Assam
                        </Text>
                    </View>
                </View>

                {/* Patient Card */}
                <View style={styles.patientCard}>
                    <View style={styles.patientHeader}>
                        <View style={styles.patientAvatar}>
                            <MaterialIcons
                                name="person"
                                size={38}
                                color={COLORS.onPrimaryContainer}
                            />

                            <View style={styles.onlineDot} />
                        </View>

                        <View style={styles.patientDetails}>
                            <View style={styles.nameRow}>
                                <Text style={styles.patientName}>
                                    Ramani Barman
                                </Text>

                                <View style={styles.primaryBadge}>
                                    <Text style={styles.primaryBadgeText}>
                                        Primary
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.patientAge}>
                                72 years old
                            </Text>

                            <View style={styles.activeRow}>
                                <View style={styles.activeDot} />

                                <Text style={styles.activeText}>
                                    Active now
                                </Text>

                                <Text style={styles.lastActive}>
                                    Last active 10m ago
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Sync Information */}
                    <View style={styles.syncInfoRow}>
                        <View style={styles.syncInfo}>
                            <MaterialIcons
                                name="cloud-done"
                                size={20}
                                color={COLORS.primary}
                            />

                            <View>
                                <Text style={styles.syncLabel}>
                                    Last Synced
                                </Text>

                                <Text style={styles.syncValue}>
                                    10:42 AM via Tab-Assam
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSync}
                            disabled={syncing}
                            style={({ pressed }) => [
                                styles.syncButton,
                                syncing && styles.disabledButton,
                                pressed && !syncing && styles.pressed,
                            ]}
                        >
                            <MaterialIcons
                                name={syncing ? 'sync' : 'sync'}
                                size={19}
                                color={COLORS.primary}
                            />

                            <Text style={styles.syncButtonText}>
                                {syncing ? 'Syncing...' : 'Sync Now'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.statusBanner}>
                        <MaterialIcons
                            name="verified"
                            size={19}
                            color={COLORS.primary}
                        />

                        <Text style={styles.statusBannerText}>
                            Biometrics &amp; Logs Up to Date
                        </Text>
                    </View>
                </View>

                {/* Action Required */}
                <View style={styles.section}>
                    <View style={styles.sectionHeadingRow}>
                        <Text style={styles.sectionTitle}>
                            Action Required
                        </Text>

                        <View style={styles.actionCountBadge}>
                            <Text style={styles.actionCountText}>1</Text>
                        </View>
                    </View>

                    <View style={styles.actionCard}>
                        <View style={styles.actionIconCircle}>
                            <MaterialIcons
                                name="medication"
                                size={25}
                                color={COLORS.error}
                            />
                        </View>

                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                Morning Donepezil
                            </Text>

                            <Text style={styles.actionDose}>
                                5mg Dose
                            </Text>

                            <View style={styles.actionTimeRow}>
                                <MaterialIcons
                                    name="schedule"
                                    size={16}
                                    color={COLORS.onSurfaceVariant}
                                />

                                <Text style={styles.actionTime}>
                                    11:00 AM
                                </Text>
                            </View>

                            <Text style={styles.actionDescription}>
                                Pending patient confirmation on tablet
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <Pressable
                            onPress={handleReminder}
                            disabled={reminderSent}
                            style={({ pressed }) => [
                                styles.reminderButton,
                                reminderSent && styles.reminderSentButton,
                                pressed && !reminderSent && styles.pressed,
                            ]}
                        >
                            <MaterialIcons
                                name={
                                    reminderSent
                                        ? 'check'
                                        : 'notifications-active'
                                }
                                size={21}
                                color={
                                    reminderSent
                                        ? COLORS.primary
                                        : COLORS.onPrimary
                                }
                            />

                            <Text
                                style={[
                                    styles.reminderButtonText,
                                    reminderSent && styles.reminderSentText,
                                ]}
                            >
                                {reminderSent
                                    ? 'Notification Sent'
                                    : 'Remind Ramani'}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleCallCompanion}
                            style={({ pressed }) => [
                                styles.callButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <MaterialIcons
                                name="phone"
                                size={21}
                                color={COLORS.onSurface}
                            />

                            <Text style={styles.callButtonText}>
                                Call Companion
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Today's Overview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeadingRow}>
                        <View>
                            <Text style={styles.sectionTitle}>
                                Today&apos;s Overview
                            </Text>

                            <Text style={styles.dateText}>
                                Wednesday, 24 Oct
                            </Text>
                        </View>
                    </View>

                    <View style={styles.overviewGrid}>
                        <OverviewCard
                            icon="psychology"
                            title="Cognitive Activity"
                            value="4/5"
                            subtitle="80%"
                            progress={80}
                        />

                        <OverviewCard
                            icon="checklist"
                            title="Daily Care"
                            value="6/7"
                            subtitle="Routine 85%"
                            progress={85}
                        />

                        <OverviewCard
                            icon="medication"
                            title="Medications"
                            value="2/3"
                            subtitle="1 Pending"
                            progress={67}
                            warning
                        />

                        <OverviewCard
                            icon="mood"
                            title="Engagement"
                            value="High"
                            subtitle="Calm & Vocal"
                            progress={90}
                        />
                    </View>

                    <View style={styles.positiveVibe}>
                        <MaterialIcons
                            name="favorite"
                            size={20}
                            color={COLORS.primary}
                        />

                        <View style={styles.positiveVibeContent}>
                            <Text style={styles.positiveVibeTitle}>
                                Positive Vibe
                            </Text>

                            <Text style={styles.positiveVibeText}>
                                Patient is showing positive engagement today.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Health & Cognitive Reports */}
                <View style={styles.section}>
                    <View style={styles.sectionHeadingRow}>
                        <Text style={styles.sectionTitle}>
                            Health &amp; Cognitive Reports
                        </Text>
                    </View>

                    {/* Cognitive Progress */}
                    <ReportCard
                        icon="psychology"
                        title="Cognitive Progress"
                        subtitle="Memory 82% • Attention 76%"
                        detail="Stable"
                        onPress={handleCognitiveProgress}
                    />

                    {/* AI Adaptation */}
                    <ReportCard
                        icon="smart-toy"
                        title="AI Adaptation"
                        subtitle="ADAPT-v2"
                        detail="Level 3 Assamese Lore Quiz Suggested"
                        onPress={handleAIAdaptation}
                    />

                    {/* Routine */}
                    <ReportCard
                        icon="water-drop"
                        title="Daily Routine & Hydration"
                        subtitle="Hydration 5/8 glasses"
                        detail="Routine on track"
                        onPress={handleRoutine}
                    />

                    {/* Device */}
                    <View style={styles.deviceCard}>
                        <View style={styles.reportIcon}>
                            <MaterialIcons
                                name="tablet-android"
                                size={24}
                                color={COLORS.onSecondaryFixed}
                            />
                        </View>

                        <View style={styles.deviceContent}>
                            <Text style={styles.reportTitle}>
                                Patient Device Status
                            </Text>

                            <View style={styles.deviceStats}>
                                <DeviceStat
                                    icon="wifi"
                                    label="Online"
                                    value="4G Strong"
                                />

                                <DeviceStat
                                    icon="battery-5-bar"
                                    label="Battery"
                                    value="68%"
                                />

                                <DeviceStat
                                    icon="pending-actions"
                                    label="Queue"
                                    value="0 Pending"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Assam Heritage Care Note */}
                <View style={styles.heritageCard}>
                    <View style={styles.heritageIcon}>
                        <MaterialIcons
                            name="music-note"
                            size={25}
                            color={COLORS.primary}
                        />
                    </View>

                    <View style={styles.heritageContent}>
                        <Text style={styles.heritageTitle}>
                            Assam Heritage Care Note
                        </Text>

                        <Text style={styles.heritageText}>
                            Dopamine stimulus: Ramani enjoyed listening to Borgeet
                            melodies at 9:15 AM today.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View
                style={[
                    styles.bottomNav,
                    {
                        paddingBottom: Math.max(insets.bottom, 8),
                    },
                ]}
            >
                <BottomNavItem
                    icon="home"
                    label="Home"
                    active
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

/* -------------------------------------------------------------------------- */
/* Overview Card                                                              */
/* -------------------------------------------------------------------------- */

type OverviewCardProps = {
    icon: MaterialIconName;
    title: string;
    value: string;
    subtitle: string;
    progress: number;
    warning?: boolean;
};

function OverviewCard({
    icon,
    title,
    value,
    subtitle,
    progress,
    warning = false,
}: OverviewCardProps) {
    return (
        <View style={styles.overviewCard}>
            <View style={styles.overviewIcon}>
                <MaterialIcons
                    name={icon}
                    size={23}
                    color={warning ? COLORS.error : COLORS.primary}
                />
            </View>

            <Text style={styles.overviewTitle}>
                {title}
            </Text>

            <Text style={styles.overviewValue}>
                {value}
            </Text>

            <Text
                style={[
                    styles.overviewSubtitle,
                    warning && styles.warningText,
                ]}
            >
                {subtitle}
            </Text>

            <View style={styles.overviewProgressTrack}>
                <View
                    style={[
                        styles.overviewProgressFill,
                        {
                            width: `${progress}%`,
                            backgroundColor: warning
                                ? COLORS.error
                                : COLORS.primary,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Report Card                                                                */
/* -------------------------------------------------------------------------- */

type ReportCardProps = {
    icon: MaterialIconName;
    title: string;
    subtitle: string;
    detail: string;
    onPress?: () => void;
};

function ReportCard({
    icon,
    title,
    subtitle,
    detail,
    onPress,
}: ReportCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.reportCard,
                pressed && styles.reportPressed,
            ]}
        >
            <View style={styles.reportIcon}>
                <MaterialIcons
                    name={icon}
                    size={24}
                    color={COLORS.onSecondaryFixed}
                />
            </View>

            <View style={styles.reportContent}>
                <Text style={styles.reportTitle}>
                    {title}
                </Text>

                <Text style={styles.reportSubtitle}>
                    {subtitle}
                </Text>

                <Text style={styles.reportDetail}>
                    {detail}
                </Text>
            </View>

            <MaterialIcons
                name="chevron-right"
                size={25}
                color={COLORS.secondary}
            />
        </Pressable>
    );
}

/* -------------------------------------------------------------------------- */
/* Device Stat                                                                */
/* -------------------------------------------------------------------------- */

type DeviceStatProps = {
    icon: MaterialIconName;
    label: string;
    value: string;
};

function DeviceStat({
    icon,
    label,
    value,
}: DeviceStatProps) {
    return (
        <View style={styles.deviceStat}>
            <MaterialIcons
                name={icon}
                size={17}
                color={COLORS.primary}
            />

            <View>
                <Text style={styles.deviceStatLabel}>
                    {label}
                </Text>

                <Text style={styles.deviceStatValue}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Bottom Navigation                                                          */
/* -------------------------------------------------------------------------- */

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
        width: '100%',
        maxWidth: 560,
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

    /* Main */

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

    headingSection: {
        gap: 5,
    },

    portalTitle: {
        color: COLORS.onSurface,
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    locationText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 16,
        lineHeight: 22,
    },

    /* Patient Card */

    patientCard: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 7,
        elevation: 2,
    },

    patientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    patientAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginRight: 14,
    },

    onlineDot: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        borderWidth: 3,
        borderColor: COLORS.surfaceLowest,
        right: 1,
        bottom: 1,
    },

    patientDetails: {
        flex: 1,
        minWidth: 0,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },

    patientName: {
        color: COLORS.onSurface,
        fontSize: 21,
        lineHeight: 28,
        fontWeight: '700',
    },

    primaryBadge: {
        backgroundColor: COLORS.secondaryFixed,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },

    primaryBadgeText: {
        color: COLORS.onSecondaryFixed,
        fontSize: 11,
        lineHeight: 15,
        fontWeight: '700',
    },

    patientAge: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 21,
        marginTop: 2,
    },

    activeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 5,
        flexWrap: 'wrap',
    },

    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },

    activeText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },

    lastActive: {
        color: COLORS.onSurfaceVariant,
        fontSize: 13,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.surfaceContainer,
        marginVertical: 16,
    },

    syncInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    syncInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },

    syncLabel: {
        color: COLORS.onSurfaceVariant,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600',
    },

    syncValue: {
        color: COLORS.onSurface,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600',
        marginTop: 1,
    },

    syncButton: {
        minHeight: 44,
        paddingHorizontal: 13,
        borderRadius: 22,
        backgroundColor: COLORS.secondaryFixed,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    syncButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },

    disabledButton: {
        opacity: 0.6,
    },

    statusBanner: {
        marginTop: 14,
        minHeight: 42,
        borderRadius: 9,
        backgroundColor: '#EAF5E9',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },

    statusBannerText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    /* Sections */

    section: {
        gap: 12,
    },

    sectionHeadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        color: COLORS.onSurface,
        fontSize: 23,
        lineHeight: 30,
        fontWeight: '700',
    },

    dateText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 2,
    },

    actionCountBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.errorContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },

    actionCountText: {
        color: COLORS.onErrorContainer,
        fontSize: 13,
        fontWeight: '700',
    },

    /* Action */

    actionCard: {
        backgroundColor: COLORS.errorContainer,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },

    actionIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.surfaceLowest,
        alignItems: 'center',
        justifyContent: 'center',
    },

    actionContent: {
        flex: 1,
    },

    actionTitle: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
    },

    actionDose: {
        color: COLORS.onErrorContainer,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '600',
        marginTop: 1,
    },

    actionTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },

    actionTime: {
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        fontWeight: '600',
    },

    actionDescription: {
        color: COLORS.onSurfaceVariant,
        fontSize: 13,
        lineHeight: 18,
        marginTop: 5,
    },

    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },

    reminderButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 11,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    reminderButtonText: {
        color: COLORS.onPrimary,
        fontSize: 15,
        fontWeight: '700',
    },

    reminderSentButton: {
        backgroundColor: COLORS.secondaryFixed,
    },

    reminderSentText: {
        color: COLORS.primary,
    },

    callButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 11,
        backgroundColor: COLORS.surfaceContainerHigh,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    callButtonText: {
        color: COLORS.onSurface,
        fontSize: 15,
        fontWeight: '700',
    },

    /* Overview */

    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    overviewCard: {
        width: '48%',
        flexGrow: 1,
        minWidth: 145,
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 14,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.035,
        shadowRadius: 4,
        elevation: 1,
    },

    overviewIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
    },

    overviewTitle: {
        color: COLORS.onSurfaceVariant,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },

    overviewValue: {
        color: COLORS.onSurface,
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',
    },

    overviewSubtitle: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },

    warningText: {
        color: COLORS.error,
    },

    overviewProgressTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.surfaceContainer,
        overflow: 'hidden',
        marginTop: 5,
    },

    overviewProgressFill: {
        height: '100%',
        borderRadius: 3,
    },

    positiveVibe: {
        backgroundColor: COLORS.secondaryFixed,
        borderRadius: 11,
        minHeight: 58,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    positiveVibeContent: {
        flex: 1,
    },

    positiveVibeTitle: {
        color: COLORS.primary,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '700',
    },

    positiveVibeText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 13,
        lineHeight: 18,
        marginTop: 1,
    },

    /* Reports */

    reportCard: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 15,
        minHeight: 86,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.035,
        shadowRadius: 4,
        elevation: 1,
    },

    reportPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.99 }],
    },

    reportIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
    },

    reportContent: {
        flex: 1,
        minWidth: 0,
    },

    reportTitle: {
        color: COLORS.onSurface,
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '700',
    },

    reportSubtitle: {
        color: COLORS.onSurfaceVariant,
        fontSize: 13,
        lineHeight: 18,
        marginTop: 2,
    },

    reportDetail: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
        marginTop: 2,
    },

    /* Device */

    deviceCard: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 15,
        minHeight: 100,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.035,
        shadowRadius: 4,
        elevation: 1,
    },

    deviceContent: {
        flex: 1,
    },

    deviceStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },

    deviceStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    deviceStatLabel: {
        color: COLORS.onSurfaceVariant,
        fontSize: 10,
        lineHeight: 13,
    },

    deviceStatValue: {
        color: COLORS.onSurface,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
    },

    /* Heritage */

    heritageCard: {
        backgroundColor: COLORS.secondaryFixed,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },

    heritageIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.surfaceLowest,
        alignItems: 'center',
        justifyContent: 'center',
    },

    heritageContent: {
        flex: 1,
    },

    heritageTitle: {
        color: COLORS.primary,
        fontSize: 17,
        lineHeight: 23,
        fontWeight: '700',
    },

    heritageText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 21,
        marginTop: 4,
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
});