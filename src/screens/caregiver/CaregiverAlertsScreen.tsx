import React, { useMemo, useState } from 'react';
import {
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
    primaryFixed: '#ACF4A4',
    onPrimaryFixed: '#002203',

    secondary: '#556158',
    secondaryFixed: '#D9E6DA',
    onSecondaryFixed: '#131E17',

    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onError: '#FFFFFF',
    onErrorContainer: '#93000A',

    tertiary: '#721900',
    tertiaryContainer: '#9B2500',
    tertiaryFixed: '#FFDBD1',
    onTertiaryFixed: '#3B0800',

    surface: '#FCF9F8',
    surfaceLowest: '#FFFFFF',
    surfaceContainer: '#F0EDED',
    surfaceContainerLow: '#F6F3F2',
    surfaceContainerHigh: '#EAE7E7',
    surfaceContainerHighest: '#E5E2E1',

    onSurface: '#1B1C1C',
    onSurfaceVariant: '#41493E',

    inverseSurface: '#303030',
    inverseOnSurface: '#F3F0EF',
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type AlertCategory = 'medication' | 'routine' | 'device';

type AlertItem = {
    id: string;
    category: AlertCategory;
    typeLabel: string;
    title: string;
    description: string;
    badge: string;
    icon: MaterialIconName;
};

type CaregiverAlertsScreenProps = {
    onBack?: () => void;
    onHome?: () => void;
    onGames?: () => void;
    onSchedule?: () => void;
    onMemory?: () => void;
    onProfile?: () => void;
};

const ALERTS: AlertItem[] = [
    {
        id: 'medication',
        category: 'medication',
        typeLabel: 'Urgent Action',
        title: 'Medication Not Acknowledged',
        description:
            'Night Calcium & Vitamin D (08:00 PM) scheduled 45 mins ago. Pillbox sensor did not register drawer opening.',
        badge: 'Unacknowledged',
        icon: 'emergency',
    },
    {
        id: 'routine',
        category: 'routine',
        typeLabel: 'Routine Follow-up',
        title: 'Hydration Behind Schedule',
        description:
            'Patient has completed 5 of 8 glasses today. Last logged at 3:00 PM (3 hours behind target pace for humid evening).',
        badge: '5 / 8 Cups',
        icon: 'water-drop',
    },
    {
        id: 'device',
        category: 'device',
        typeLabel: 'Brain Health',
        title: 'Daily Cognitive Session Remaining',
        description:
            '4 of 5 exercises done. 1 gentle Bihu memory match session pending before evening rest time.',
        badge: 'Pending',
        icon: 'psychology',
    },
];

const FILTERS = [
    { key: 'all', label: 'All Alerts (3)' },
    { key: 'medication', label: 'Medication (1)' },
    { key: 'routine', label: 'Routine (1)' },
    { key: 'device', label: 'Cognitive (1)' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function CaregiverAlertsScreen({
    onBack,
    onHome,
    onGames,
    onSchedule,
    onMemory,
    onProfile,
}: CaregiverAlertsScreenProps) {
    const insets = useSafeAreaInsets();

    const [selectedFilter, setSelectedFilter] =
        useState<FilterKey>('all');

    const [dismissedAlerts, setDismissedAlerts] =
        useState<string[]>([]);

    const [processingAlert, setProcessingAlert] =
        useState<string | null>(null);

    const [completedActions, setCompletedActions] =
        useState<Record<string, string>>({});

    const [toastMessage, setToastMessage] =
        useState<string | null>(null);

    const [refreshing, setRefreshing] =
        useState(false);

    const showToast = (message: string) => {
        setToastMessage(message);

        setTimeout(() => {
            setToastMessage(null);
        }, 2800);
    };

    const visibleAlerts = useMemo(() => {
        return ALERTS.filter((alert) => {
            if (dismissedAlerts.includes(alert.id)) {
                return false;
            }

            if (selectedFilter === 'all') {
                return true;
            }

            return alert.category === selectedFilter;
        });
    }, [selectedFilter, dismissedAlerts]);

    const handleRefresh = () => {
        if (refreshing) return;

        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
            showToast('Caregiver alerts refreshed.');
        }, 700);
    };

    const handleSettings = () => {
        showToast('Alert settings will be available here.');
    };

    const handleVoiceReminder = (alertId: string) => {
        if (processingAlert) return;

        setProcessingAlert(alertId);

        setTimeout(() => {
            setProcessingAlert(null);

            setCompletedActions((previous) => ({
                ...previous,
                [alertId]: 'Sent to Patient Unit',
            }));

            showToast(
                'Custom Assamese voice prompt delivered to device.'
            );

            setTimeout(() => {
                setCompletedActions((previous) => {
                    const updated = { ...previous };
                    delete updated[alertId];
                    return updated;
                });
            }, 3500);
        }, 900);
    };

    const handlePrompt = (
        alertId: string,
        message: string
    ) => {
        if (processingAlert) return;

        setProcessingAlert(alertId);

        setTimeout(() => {
            setProcessingAlert(null);

            setCompletedActions((previous) => ({
                ...previous,
                [alertId]: 'Prompt Delivered',
            }));

            showToast(message);

            setTimeout(() => {
                setCompletedActions((previous) => {
                    const updated = { ...previous };
                    delete updated[alertId];
                    return updated;
                });
            }, 3000);
        }, 700);
    };

    const handleDismiss = (alertId: string) => {
        setDismissedAlerts((previous) => [
            ...previous,
            alertId,
        ]);

        showToast('Alert marked as acknowledged.');
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
                        paddingTop: insets.top + 80,
                        paddingBottom: insets.bottom + 120,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Heading */}
                <View style={styles.headingRow}>
                    <View style={styles.headingText}>
                        <View style={styles.dashboardLabelRow}>
                            <View style={styles.pulseDot} />

                            <Text style={styles.dashboardLabel}>
                                Caregiver Dashboard
                            </Text>
                        </View>

                        <Text style={styles.pageTitle}>
                            Needs Attention
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        <Pressable
                            onPress={handleRefresh}
                            style={({ pressed }) => [
                                styles.smallActionButton,
                                pressed && styles.pressed,
                            ]}
                            accessibilityLabel="Refresh alerts"
                        >
                            <MaterialIcons
                                name="sync"
                                size={22}
                                color={COLORS.onSurfaceVariant}
                            />
                        </Pressable>

                        <Pressable
                            onPress={handleSettings}
                            style={({ pressed }) => [
                                styles.smallActionButton,
                                pressed && styles.pressed,
                            ]}
                            accessibilityLabel="Alert settings"
                        >
                            <MaterialIcons
                                name="tune"
                                size={22}
                                color={COLORS.onSurfaceVariant}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Patient Context */}
                <View style={styles.patientContext}>
                    <View style={styles.patientContextLeft}>
                        <View style={styles.patientAvatar}>
                            <MaterialIcons
                                name="person"
                                size={30}
                                color={COLORS.onPrimaryContainer}
                            />
                        </View>

                        <View style={styles.patientContextText}>
                            <Text
                                style={styles.patientName}
                                numberOfLines={1}
                            >
                                Ramani Barman (72)
                            </Text>

                            <Text
                                style={styles.patientSubtitle}
                                numberOfLines={1}
                            >
                                Active Alerts &amp; Care Reminders
                            </Text>
                        </View>
                    </View>

                    <View style={styles.linkedBadge}>
                        <MaterialIcons
                            name="verified-user"
                            size={16}
                            color={COLORS.primary}
                        />

                        <Text style={styles.linkedText}>
                            Linked
                        </Text>
                    </View>
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {FILTERS.map((filter) => {
                        const active =
                            selectedFilter === filter.key;

                        return (
                            <Pressable
                                key={filter.key}
                                onPress={() =>
                                    setSelectedFilter(filter.key)
                                }
                                style={({ pressed }) => [
                                    styles.filterButton,
                                    active
                                        ? styles.filterButtonActive
                                        : styles.filterButtonInactive,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        active
                                            ? styles.filterButtonTextActive
                                            : styles.filterButtonTextInactive,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Alerts */}
                <View style={styles.alertsStack}>
                    {visibleAlerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            processing={
                                processingAlert === alert.id
                            }
                            completedText={
                                completedActions[alert.id]
                            }
                            onVoiceReminder={() =>
                                handleVoiceReminder(alert.id)
                            }
                            onDismiss={() =>
                                handleDismiss(alert.id)
                            }
                            onPrompt={(message) =>
                                handlePrompt(alert.id, message)
                            }
                        />
                    ))}

                    {visibleAlerts.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <MaterialIcons
                                    name="check-circle"
                                    size={38}
                                    color={COLORS.primary}
                                />
                            </View>

                            <Text style={styles.emptyTitle}>
                                All Clear
                            </Text>

                            <Text style={styles.emptyText}>
                                There are no active alerts in this category.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Resolved Today */}
                <View style={styles.resolvedHeader}>
                    <Text style={styles.resolvedTitle}>
                        Resolved Today
                    </Text>

                    <Text style={styles.resolvedCount}>
                        1 Completed
                    </Text>
                </View>

                <View style={styles.resolvedCard}>
                    <View style={styles.resolvedLeft}>
                        <View style={styles.resolvedIcon}>
                            <MaterialIcons
                                name="check"
                                size={18}
                                color={COLORS.onPrimary}
                            />
                        </View>

                        <View style={styles.resolvedText}>
                            <Text style={styles.resolvedItemTitle}>
                                Morning Medication &amp; Breakfast
                            </Text>

                            <Text style={styles.resolvedDescription}>
                                Acknowledged at 9:15 AM by Ramani Barman
                            </Text>
                        </View>
                    </View>

                    <View style={styles.resolvedBadge}>
                        <MaterialIcons
                            name="task-alt"
                            size={16}
                            color={COLORS.primary}
                        />

                        <Text style={styles.resolvedBadgeText}>
                            Resolved
                        </Text>
                    </View>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <MaterialIcons
                        name="shield"
                        size={22}
                        color={COLORS.secondary}
                    />

                    <Text style={styles.disclaimerText}>
                        Caregiver alerts are non-diagnostic and designed
                        to assist with daily routine coordination. For
                        medical emergencies, consult your primary
                        physician immediately.
                    </Text>
                </View>
            </ScrollView>

            {/* Toast */}
            {toastMessage && (
                <View
                    style={[
                        styles.toast,
                        {
                            bottom: insets.bottom + 96,
                        },
                    ]}
                >
                    <MaterialIcons
                        name="check-circle"
                        size={18}
                        color={COLORS.primaryFixed}
                    />

                    <Text style={styles.toastText}>
                        {toastMessage}
                    </Text>
                </View>
            )}

            {/* Bottom Navigation */}
            <View
                style={[
                    styles.bottomNav,
                    {
                        paddingBottom: Math.max(
                            insets.bottom,
                            8
                        ),
                    },
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
                    active
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
/* Alert Card                                                                 */
/* -------------------------------------------------------------------------- */

type AlertCardProps = {
    alert: AlertItem;
    processing: boolean;
    completedText?: string;
    onVoiceReminder: () => void;
    onDismiss: () => void;
    onPrompt: (message: string) => void;
};

function AlertCard({
    alert,
    processing,
    completedText,
    onVoiceReminder,
    onDismiss,
    onPrompt,
}: AlertCardProps) {
    if (alert.category === 'medication') {
        return (
            <View style={styles.medicationAlert}>
                <View style={styles.medicationAccent} />

                <View style={styles.alertTopRow}>
                    <View style={styles.alertTitleRow}>
                        <View style={styles.medicationIcon}>
                            <MaterialIcons
                                name="emergency"
                                size={20}
                                color={COLORS.onError}
                            />
                        </View>

                        <View style={styles.alertTitleContainer}>
                            <Text style={styles.urgentLabel}>
                                Urgent Action
                            </Text>

                            <Text style={styles.medicationTitle}>
                                Medication Not Acknowledged
                            </Text>
                        </View>
                    </View>

                    <View style={styles.unacknowledgedBadge}>
                        <Text style={styles.unacknowledgedText}>
                            Unacknowledged
                        </Text>
                    </View>
                </View>

                <Text style={styles.medicationDescription}>
                    {alert.description}
                </Text>

                <View style={styles.alertButtonsRow}>
                    <Pressable
                        onPress={onVoiceReminder}
                        disabled={processing}
                        style={({ pressed }) => [
                            styles.primaryAlertButton,
                            processing && styles.processingButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialIcons
                            name={
                                processing
                                    ? 'sync'
                                    : completedText
                                        ? 'done-all'
                                        : 'record-voice-over'
                            }
                            size={22}
                            color={COLORS.onPrimary}
                        />

                        <Text style={styles.primaryAlertButtonText}>
                            {processing
                                ? 'Sending audio...'
                                : completedText ||
                                'Send Voice Reminder'}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onDismiss}
                        disabled={processing}
                        style={({ pressed }) => [
                            styles.dismissButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialIcons
                            name="check"
                            size={20}
                            color={COLORS.secondary}
                        />

                        <Text style={styles.dismissButtonText}>
                            Mark Acknowledged
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    if (alert.category === 'routine') {
        return (
            <View style={styles.routineAlert}>
                <View style={styles.routineAccent} />

                <View style={styles.alertTopRow}>
                    <View style={styles.alertTitleRow}>
                        <View style={styles.routineIcon}>
                            <MaterialIcons
                                name="water-drop"
                                size={20}
                                color={COLORS.onTertiaryFixed}
                            />
                        </View>

                        <View style={styles.alertTitleContainer}>
                            <Text style={styles.routineLabel}>
                                Routine Follow-up
                            </Text>

                            <Text style={styles.routineTitle}>
                                Hydration Behind Schedule
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cupsBadge}>
                        <Text style={styles.cupsBadgeText}>
                            5 / 8 Cups
                        </Text>
                    </View>
                </View>

                <Text style={styles.routineDescription}>
                    {alert.description}
                </Text>

                <Pressable
                    onPress={() =>
                        onPrompt(
                            'Hydration prompt sent to display'
                        )
                    }
                    disabled={processing}
                    style={({ pressed }) => [
                        styles.primaryAlertButton,
                        processing && styles.processingButton,
                        pressed && styles.pressed,
                    ]}
                >
                    <MaterialIcons
                        name={
                            processing
                                ? 'sync'
                                : completedText
                                    ? 'check'
                                    : 'notifications-active'
                        }
                        size={22}
                        color={COLORS.onPrimary}
                    />

                    <Text style={styles.primaryAlertButtonText}>
                        {processing
                            ? 'Transmitting...'
                            : completedText ||
                            'Prompt Hydration Reminder'}
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.deviceAlert}>
            <View style={styles.deviceAccent} />

            <View style={styles.alertTopRow}>
                <View style={styles.alertTitleRow}>
                    <View style={styles.deviceIcon}>
                        <MaterialIcons
                            name="psychology"
                            size={20}
                            color={COLORS.onPrimaryContainer}
                        />
                    </View>

                    <View style={styles.alertTitleContainer}>
                        <Text style={styles.deviceLabel}>
                            Brain Health
                        </Text>

                        <Text style={styles.deviceTitle}>
                            Daily Cognitive Session Remaining
                        </Text>
                    </View>
                </View>

                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>
                        Pending
                    </Text>
                </View>
            </View>

            <Text style={styles.deviceDescription}>
                {alert.description}
            </Text>

            <Pressable
                onPress={() =>
                    onPrompt(
                        'Activity reminder nudged to tablet'
                    )
                }
                disabled={processing}
                style={({ pressed }) => [
                    styles.primaryAlertButton,
                    processing && styles.processingButton,
                    pressed && styles.pressed,
                ]}
            >
                <MaterialIcons
                    name={
                        processing
                            ? 'sync'
                            : completedText
                                ? 'check'
                                : 'play-circle'
                    }
                    size={22}
                    color={COLORS.onPrimary}
                />

                <Text style={styles.primaryAlertButtonText}>
                    {processing
                        ? 'Transmitting...'
                        : completedText || 'Encourage Activity'}
                </Text>
            </Pressable>
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

    scrollView: {
        flex: 1,
    },

    content: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        paddingHorizontal: 20,
        gap: 16,
    },

    headingRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingTop: 4,
        paddingBottom: 12,
    },

    headingText: {
        flex: 1,
    },

    dashboardLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.tertiary,
    },

    dashboardLabel: {
        color: COLORS.tertiary,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
        letterSpacing: 0.7,
        textTransform: 'uppercase',
    },

    pageTitle: {
        color: COLORS.primary,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
        marginTop: 3,
    },

    headerActions: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 10,
    },

    smallActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },

    patientContext: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        padding: 16,
        minHeight: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

    patientContextLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        gap: 12,
    },

    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
    },

    patientContextText: {
        flex: 1,
        minWidth: 0,
    },

    patientName: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
    },

    patientSubtitle: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 20,
        marginTop: 2,
    },

    linkedBadge: {
        backgroundColor: 'rgba(0,69,13,0.10)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    linkedText: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
    },

    filterRow: {
        gap: 8,
        paddingBottom: 4,
    },

    filterButton: {
        minHeight: 46,
        paddingHorizontal: 16,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },

    filterButtonActive: {
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

    filterButtonInactive: {
        backgroundColor: COLORS.surfaceContainerHigh,
    },

    filterButtonText: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '700',
    },

    filterButtonTextActive: {
        color: COLORS.onPrimary,
    },

    filterButtonTextInactive: {
        color: COLORS.onSurfaceVariant,
    },

    alertsStack: {
        gap: 16,
    },

    alertTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },

    alertTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        minWidth: 0,
    },

    alertTitleContainer: {
        flex: 1,
        minWidth: 0,
    },

    medicationAlert: {
        backgroundColor: COLORS.errorContainer,
        borderRadius: 12,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
        gap: 12,
    },

    medicationAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 8,
        backgroundColor: COLORS.error,
    },

    medicationIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.error,
        alignItems: 'center',
        justifyContent: 'center',
    },

    urgentLabel: {
        color: COLORS.error,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    medicationTitle: {
        color: COLORS.onErrorContainer,
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '700',
        marginTop: 1,
    },

    unacknowledgedBadge: {
        backgroundColor: 'rgba(186,26,26,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },

    unacknowledgedText: {
        color: COLORS.error,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
    },

    medicationDescription: {
        color: COLORS.onErrorContainer,
        fontSize: 16,
        lineHeight: 23,
    },

    routineAlert: {
        backgroundColor: COLORS.tertiaryFixed,
        borderRadius: 12,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
        gap: 12,
    },

    routineAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 8,
        backgroundColor: COLORS.tertiaryContainer,
    },

    routineIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.tertiaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },

    routineLabel: {
        color: COLORS.tertiaryContainer,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    routineTitle: {
        color: COLORS.onTertiaryFixed,
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '700',
        marginTop: 1,
    },

    cupsBadge: {
        backgroundColor: 'rgba(155,37,0,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },

    cupsBadgeText: {
        color: COLORS.tertiaryContainer,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
    },

    routineDescription: {
        color: COLORS.onTertiaryFixed,
        fontSize: 16,
        lineHeight: 23,
    },

    deviceAlert: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },

    deviceAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 8,
        backgroundColor: COLORS.primary,
    },

    deviceIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },

    deviceLabel: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    deviceTitle: {
        color: COLORS.onSurface,
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '700',
        marginTop: 1,
    },

    pendingBadge: {
        backgroundColor: COLORS.surfaceContainerHigh,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },

    pendingBadgeText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
    },

    deviceDescription: {
        color: COLORS.onSurfaceVariant,
        fontSize: 16,
        lineHeight: 23,
    },

    alertButtonsRow: {
        gap: 10,
    },

    primaryAlertButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.10,
        shadowRadius: 5,
        elevation: 2,
    },

    primaryAlertButtonText: {
        color: COLORS.onPrimary,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    processingButton: {
        opacity: 0.75,
    },

    dismissButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceLowest,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    dismissButtonText: {
        color: COLORS.onSurface,
        fontSize: 17,
        lineHeight: 23,
        fontWeight: '600',
    },

    emptyState: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.secondaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        color: COLORS.onSurface,
        fontSize: 21,
        lineHeight: 28,
        fontWeight: '700',
        marginTop: 12,
    },

    emptyText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'center',
        marginTop: 4,
    },

    resolvedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        paddingBottom: 4,
    },

    resolvedTitle: {
        color: COLORS.secondary,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    resolvedCount: {
        color: COLORS.secondary,
        fontSize: 14,
        lineHeight: 19,
    },

    resolvedCard: {
        backgroundColor: COLORS.secondaryFixed,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
    },

    resolvedLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },

    resolvedIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },

    resolvedText: {
        flex: 1,
    },

    resolvedItemTitle: {
        color: COLORS.onSurfaceVariant,
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '700',
    },

    resolvedDescription: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 20,
        marginTop: 2,
    },

    resolvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingTop: 3,
    },

    resolvedBadgeText: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
    },

    disclaimer: {
        backgroundColor: COLORS.surfaceContainer,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginTop: 6,
    },

    disclaimerText: {
        flex: 1,
        color: COLORS.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 20,
    },

    toast: {
        position: 'absolute',
        left: 20,
        right: 20,
        maxWidth: 520,
        alignSelf: 'center',
        zIndex: 100,
        backgroundColor: COLORS.inverseSurface,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.20,
        shadowRadius: 12,
        elevation: 10,
    },

    toastText: {
        flex: 1,
        color: COLORS.inverseOnSurface,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600',
    },

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