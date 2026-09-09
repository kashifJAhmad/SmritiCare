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
    background: '#F4FAFF',

    primary: '#00450D',
    primaryContainer: '#1B5E20',
    onPrimary: '#FFFFFF',
    primaryFixed: '#ACF4A4',
    onPrimaryFixed: '#002203',
    onPrimaryContainer: '#90D689',

    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onError: '#FFFFFF',
    onErrorContainer: '#93000A',

    secondary: '#556158',
    secondaryFixed: '#D9E6DA',
    onSecondaryFixed: '#131E17',

    surface: '#FFFFFF',
    surfaceLowest: '#FFFFFF',
    surfaceContainer: '#EAF3F7',
    surfaceContainerLow: '#E9F6FD',
    surfaceContainerHigh: '#E2EEF4',
    surfaceContainerHighest: '#E5EEF3',

    onSurface: '#111D23',
    onSurfaceVariant: '#41493E',
    outline: '#717A6D',
    outlineVariant: '#C0C9BB',
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type LowBatteryAlertScreenProps = {
    onBack?: () => void;
    onHome?: () => void;
    onGames?: () => void;
    onSchedule?: () => void;
    onMemory?: () => void;
    onProfile?: () => void;
    onLocationDetails?: () => void;
    onCallCompanion?: () => void;
};

export default function LowBatteryAlertScreen({
    onBack,
    onHome,
    onGames,
    onSchedule,
    onMemory,
    onProfile,
    onLocationDetails,
    onCallCompanion,
}: LowBatteryAlertScreenProps) {
    const insets = useSafeAreaInsets();

    const [sendingReminder, setSendingReminder] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);

        setTimeout(() => {
            setToastMessage(null);
        }, 3500);
    };

    const handleVoiceReminder = () => {
        if (sendingReminder) return;

        setSendingReminder(true);

        showToast(
            'High-volume Assamese chime & voice reminder sent to Ramani’s tablet.',
        );

        setTimeout(() => {
            setSendingReminder(false);
        }, 500);
    };

    const handleCallCompanion = () => {
        if (onCallCompanion) {
            onCallCompanion();
            return;
        }

        Alert.alert(
            'Call Companion',
            'The companion / in-home caregiver call will be connected during integration.',
        );
    };

    const handleLocationDetails = () => {
        if (onLocationDetails) {
            onLocationDetails();
            return;
        }

        showToast('Opening live geolocation breadcrumb telemetry...');
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
                        accessibilityRole="button"
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
                {/* Urgent Alert Header */}
                <View style={styles.alertHeader}>
                    <View style={styles.alertHeaderLeft}>
                        <MaterialIcons
                            name="warning"
                            size={20}
                            color={COLORS.error}
                        />

                        <Text style={styles.alertHeaderText}>
                            URGENT CAREGIVER ALERT
                        </Text>
                    </View>

                    <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>Live</Text>
                    </View>
                </View>

                {/* Critical Battery Card */}
                <View style={styles.criticalCard}>
                    <View style={styles.criticalHeader}>
                        <View style={styles.criticalIconCircle}>
                            <MaterialIcons
                                name="battery-alert"
                                size={28}
                                color={COLORS.onError}
                            />
                        </View>

                        <View style={styles.criticalTextContainer}>
                            <Text style={styles.criticalTitle}>
                                Critical Battery: 9%
                            </Text>

                            <Text style={styles.criticalDescription}>
                                Ramani&apos;s tablet has dropped to 9% battery.
                                Voice assistance and scheduled reminders will
                                suspend if device powers down.
                            </Text>
                        </View>
                    </View>

                    {/* Status Grid */}
                    <View style={styles.statusGrid}>
                        <StatusCard
                            icon="battery-alert"
                            iconBackground={COLORS.errorContainer}
                            iconColor={COLORS.error}
                            label="Battery Level"
                            value="9% (Critical)"
                            valueColor={COLORS.error}
                        />

                        <StatusCard
                            icon="history"
                            iconBackground={COLORS.secondaryFixed}
                            iconColor={COLORS.onSecondaryFixed}
                            label="Last Active"
                            value="8 mins ago"
                        />

                        <StatusCard
                            icon="signal-cellular-alt"
                            iconBackground={COLORS.primaryFixed}
                            iconColor={COLORS.onPrimaryFixed}
                            label="Connectivity"
                            value="Online (4G)"
                        />

                        <StatusCard
                            icon="sync"
                            iconBackground={COLORS.surfaceContainerHigh}
                            iconColor={COLORS.onSurfaceVariant}
                            label="Last Sync"
                            value="10:42 AM"
                        />
                    </View>
                </View>

                {/* Last Known Location */}
                <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                        <View style={styles.locationTitleRow}>
                            <MaterialIcons
                                name="pin-drop"
                                size={24}
                                color={COLORS.primary}
                            />

                            <Text style={styles.locationTitle}>
                                Last Known Location
                            </Text>
                        </View>

                        <Text style={styles.updatedText}>
                            Updated 2m ago
                        </Text>
                    </View>

                    {/* Map Placeholder */}
                    <View style={styles.mapContainer}>
                        <View style={styles.mapBackground}>
                            <MaterialIcons
                                name="map"
                                size={48}
                                color={COLORS.primary}
                            />

                            <View style={styles.mapRoadOne} />
                            <View style={styles.mapRoadTwo} />
                            <View style={styles.mapRoadThree} />

                            <View style={styles.locationPin}>
                                <MaterialIcons
                                    name="location-on"
                                    size={42}
                                    color={COLORS.error}
                                />
                            </View>
                        </View>

                        <View style={styles.mapGradient} />

                        <View style={styles.mapBottomRow}>
                            <View style={styles.residenceRow}>
                                <MaterialIcons
                                    name="cottage"
                                    size={18}
                                    color={COLORS.primaryFixed}
                                />

                                <Text
                                    style={styles.residenceText}
                                    numberOfLines={1}
                                >
                                    Guwahati Residence (Living Room)
                                </Text>
                            </View>

                            <MaterialIcons
                                name="satellite-alt"
                                size={20}
                                color={COLORS.onPrimary}
                            />
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {/* Voice Reminder */}
                    <Pressable
                        onPress={handleVoiceReminder}
                        style={({ pressed }) => [
                            styles.voiceButton,
                            sendingReminder &&
                            styles.voiceButtonSending,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Send voice reminder to charge tablet"
                    >
                        <MaterialIcons
                            name="volume-up"
                            size={24}
                            color={COLORS.onPrimary}
                        />

                        <Text style={styles.voiceButtonText}>
                            {sendingReminder
                                ? 'Sending Reminder...'
                                : 'Send Voice Reminder to Charge'}
                        </Text>
                    </Pressable>

                    {/* Call */}
                    <Pressable
                        onPress={handleCallCompanion}
                        style={({ pressed }) => [
                            styles.callButton,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Call companion or in-home caregiver"
                    >
                        <MaterialIcons
                            name="call"
                            size={24}
                            color={COLORS.error}
                        />

                        <Text style={styles.callButtonText}>
                            Call Companion / In-Home Caregiver
                        </Text>
                    </Pressable>

                    {/* Location Details */}
                    <Pressable
                        onPress={handleLocationDetails}
                        style={({ pressed }) => [
                            styles.locationButton,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="View full location details"
                    >
                        <MaterialIcons
                            name="explore"
                            size={22}
                            color={COLORS.secondary}
                        />

                        <Text style={styles.locationButtonText}>
                            View Full Location Details
                        </Text>
                    </Pressable>
                </View>

                {/* Reserve Power Protocol */}
                <View style={styles.protocolCard}>
                    <MaterialIcons
                        name="verified-user"
                        size={24}
                        color={COLORS.primary}
                    />

                    <View style={styles.protocolContent}>
                        <Text style={styles.protocolTitle}>
                            Reserve Power Protocol Active
                        </Text>

                        <Text style={styles.protocolText}>
                            Pillbox reminder sensor and emergency audio SOS
                            remain queued offline for up to 3 hours on
                            emergency reserve power.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Toast */}
            {toastMessage && (
                <View
                    style={[
                        styles.toast,
                        {
                            top: insets.top + 76,
                        },
                    ]}
                >
                    <MaterialIcons
                        name="check-circle"
                        size={24}
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
/* Status Card                                                                */
/* -------------------------------------------------------------------------- */

type StatusCardProps = {
    icon: MaterialIconName;
    iconBackground: string;
    iconColor: string;
    label: string;
    value: string;
    valueColor?: string;
};

function StatusCard({
    icon,
    iconBackground,
    iconColor,
    label,
    value,
    valueColor = COLORS.onSurface,
}: StatusCardProps) {
    return (
        <View style={styles.statusCard}>
            <View
                style={[
                    styles.statusIconCircle,
                    {
                        backgroundColor: iconBackground,
                    },
                ]}
            >
                <MaterialIcons
                    name={icon}
                    size={18}
                    color={iconColor}
                />
            </View>

            <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>{label}</Text>

                <Text
                    style={[
                        styles.statusValue,
                        {
                            color: valueColor,
                        },
                    ]}
                    numberOfLines={1}
                >
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
        gap: 16,
    },

    /* Alert Header */

    alertHeader: {
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: COLORS.errorContainer,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    alertHeaderLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    alertHeaderText: {
        color: COLORS.onErrorContainer,
        fontSize: 16,
        lineHeight: 21,
        fontWeight: '700',
        letterSpacing: 0.7,
    },

    liveBadge: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },

    liveText: {
        color: COLORS.error,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '700',
    },

    /* Critical Card */

    criticalCard: {
        backgroundColor: 'rgba(255,218,214,0.4)',
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

    criticalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },

    criticalIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.error,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    criticalTextContainer: {
        flex: 1,
    },

    criticalTitle: {
        color: COLORS.error,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
    },

    criticalDescription: {
        color: COLORS.onSurface,
        fontSize: 17,
        lineHeight: 24,
        marginTop: 5,
    },

    /* Status Grid */

    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    statusCard: {
        width: '48%',
        flexGrow: 1,
        minWidth: 145,
        minHeight: 76,
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    statusIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    statusTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    statusLabel: {
        color: COLORS.secondary,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '600',
    },

    statusValue: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: '700',
        marginTop: 1,
    },

    /* Location */

    locationCard: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 16,
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

    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    locationTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    locationTitle: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
    },

    updatedText: {
        color: COLORS.secondary,
        fontSize: 14,
        lineHeight: 19,
    },

    /* Map */

    mapContainer: {
        width: '100%',
        height: 128,
        borderRadius: 9,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: COLORS.surfaceContainer,
    },

    mapBackground: {
        flex: 1,
        backgroundColor: '#DDE7D9',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    mapRoadOne: {
        position: 'absolute',
        width: '150%',
        height: 15,
        backgroundColor: '#FFFFFF',
        transform: [{ rotate: '24deg' }],
    },

    mapRoadTwo: {
        position: 'absolute',
        width: '150%',
        height: 11,
        backgroundColor: '#FFFFFF',
        transform: [{ rotate: '-28deg' }],
    },

    mapRoadThree: {
        position: 'absolute',
        width: '130%',
        height: 7,
        backgroundColor: '#EEF1EC',
        transform: [{ rotate: '65deg' }],
    },

    locationPin: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },

    mapGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 65,
        backgroundColor: 'rgba(0,0,0,0.38)',
    },

    mapBottomRow: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    residenceRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 10,
    },

    residenceText: {
        flex: 1,
        color: COLORS.onPrimary,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '600',
    },

    /* Actions */

    actions: {
        gap: 12,
        paddingTop: 4,
    },

    voiceButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },

    voiceButtonSending: {
        opacity: 0.75,
    },

    voiceButtonText: {
        color: COLORS.onPrimary,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
    },

    callButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.errorContainer,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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

    callButtonText: {
        color: COLORS.error,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
    },

    locationButton: {
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceContainer,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    locationButtonText: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    /* Reserve Power */

    protocolCard: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },

    protocolContent: {
        flex: 1,
    },

    protocolTitle: {
        color: COLORS.onSurface,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    protocolText: {
        color: COLORS.onSurfaceVariant,
        fontSize: 15,
        lineHeight: 22,
        marginTop: 4,
    },

    /* Toast */

    toast: {
        position: 'absolute',
        left: 16,
        right: 16,
        maxWidth: 560,
        alignSelf: 'center',
        zIndex: 100,
        backgroundColor: '#303030',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },

    toastText: {
        flex: 1,
        color: '#F3F0EF',
        fontSize: 16,
        lineHeight: 22,
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
});