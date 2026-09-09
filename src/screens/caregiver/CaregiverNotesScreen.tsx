import React, { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CaregiverNotesScreenProps = {
    onBack?: () => void;
    onHome?: () => void;
    onGames?: () => void;
    onSchedule?: () => void;
    onMemory?: () => void;
    onProfile?: () => void;
    onPatientInfo?: () => void;
    onAddObservation?: () => void;
};

type FilterType = 'all' | 'cognitive' | 'routine' | 'sleep';

const COLORS = {
    background: '#FCF9F8',
    surface: '#FCF9F8',
    surfaceLowest: '#FFFFFF',
    surfaceLow: '#F6F3F2',
    surfaceContainer: '#F0EDED',
    surfaceHigh: '#EAE7E7',

    primary: '#00450D',
    primaryContainer: '#1B5E20',
    primaryFixed: '#ACF4A4',
    primaryFixedDim: '#91D78A',
    onPrimary: '#FFFFFF',
    onPrimaryFixed: '#002203',
    onPrimaryContainer: '#90D689',

    secondary: '#556158',
    secondaryContainer: '#D9E6DA',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#5B675E',
    onSecondaryFixed: '#131E17',

    tertiary: '#721900',
    tertiaryContainer: '#9B2500',
    tertiaryFixed: '#FFDBD1',
    onTertiaryFixed: '#3B0800',

    onSurface: '#1B1C1C',
    onSurfaceVariant: '#41493E',

    outline: '#717A6D',
    outlineVariant: '#C0C9BB',
};

const PATIENT_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAwz6FxdcVdztw0Vu4s1rCodd2LL6gZhb_Q2Ou8k4UJhppjTcSKjG5luO_zgQct2Rdxg2xVJStWiXc1dWw6KXGoaNyEbLyOEoG3gtWxLvzTRKswx8jC0VTvpoIwOZgZURusuzjdJ98weVBSM8aHbsHyAGiwweWfanGEkcQQERj9eWHN1OTExquBdIDAEacVBJ9x2_aDk72-FU0TnV9T7mO_8l2aqW4eoAIUWpNL-OAIC9yUqpmkJ0g';

const PRIYA_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBisEyi6TvY9Dl1KWdNAGu1SxwuphMQguPjk88zn-raDf9UTw_AGF1EQrsECgCop366AFzd7UUxl1YjRxK0iygaams3bnzQSPJo3r6ABK_HWvN1rm5egBNy8cmvbpBA2fTdAMU4TNYUSr9XQ5vvWJ7oN70igqdNw99gxNZNoqtK4gYoBkGV4Xo52Yard3jmvTmaLVxjnS4pwJSBoAmwffUyc08ojYdsNHBZGcQm0e1Bca--o9uD2gg';

const MEENA_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqXBkKxkxgtzNKyV2nwQJA_WLWUSfAcuwBXTOCKafOjglU7iSvldiWzUTcofxj2Kbh3eNOpmYarl4A53T4Zv9UYDW2Vylu9Y6XFiaptolKZOULZadyZd4G9DT7VC1snneXyQ8m6T0-NTQQyZEzMJrZpr-2U5GLoTPG1wQfdCWJxg2jLGtvYOlliQFD0SYzp3fKLilXCPx94qe0EwjaTXZXrWwOOn2P6GUTPOP1QYfopF3Q5fkH0q4';

type Note = {
    id: number;
    category: FilterType;
    accent: string;
    time: string;
    tag: string;
    tagBackground: string;
    tagText: string;
    text: string;
    author: string;
    role: string;
    image?: string;
    initials?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
};

const NOTES: Note[] = [
    {
        id: 1,
        category: 'cognitive',
        accent: COLORS.primary,
        time: 'Today, 10:15 AM',
        tag: 'Cognitive Engagement',
        tagBackground: COLORS.secondaryContainer,
        tagText: COLORS.onSecondaryContainer,
        text:
            'Ramani completed the tea garden memory activity with great enthusiasm. Recalled childhood stories about Jorhat estate without prompting.',
        author: 'Priya Sharma',
        role: 'Daughter',
        image: PRIYA_IMAGE,
    },
    {
        id: 2,
        category: 'routine',
        accent: COLORS.primaryFixedDim,
        time: 'Today, 08:30 AM',
        tag: 'Daily Routine',
        tagBackground: COLORS.surfaceHigh,
        tagText: COLORS.onSurfaceVariant,
        text:
            'Ate full breakfast (poha and warm Assam cardamom tea). Took morning medication promptly with warm water.',
        author: 'Meena Das',
        role: 'Companion',
        image: MEENA_IMAGE,
    },
    {
        id: 3,
        category: 'routine',
        accent: COLORS.tertiaryContainer,
        time: 'Yesterday, 07:45 PM',
        tag: 'Physical Well-being',
        tagBackground: COLORS.tertiaryFixed,
        tagText: COLORS.onTertiaryFixed,
        text:
            'Blood pressure normal (125/82). Recommended keeping evening hydration routine consistent before 7 PM.',
        author: 'Dr. B. Sharma',
        role: 'Visiting Nurse',
        initials: 'BS',
        icon: 'medical-services',
    },
];

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Notes' },
    { key: 'cognitive', label: 'Cognitive Mood' },
    { key: 'routine', label: 'Daily Routine' },
    { key: 'sleep', label: 'Sleep & Rest' },
];

export default function CaregiverNotesScreen({
    onBack,
    onHome,
    onGames,
    onSchedule,
    onMemory,
    onProfile,
    onPatientInfo,
    onAddObservation,
}: CaregiverNotesScreenProps) {
    const insets = useSafeAreaInsets();

    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>('all');

    const [likedNotes, setLikedNotes] = useState<number[]>([]);
    const [acknowledgedNotes, setAcknowledgedNotes] =
        useState<number[]>([]);
    const [addingNote, setAddingNote] = useState(false);

    const filteredNotes = useMemo(() => {
        if (selectedFilter === 'all') {
            return NOTES;
        }

        return NOTES.filter(
            note => note.category === selectedFilter,
        );
    }, [selectedFilter]);

    const handleAddObservation = () => {
        setAddingNote(true);

        setTimeout(() => {
            setAddingNote(false);

            if (onAddObservation) {
                onAddObservation();
            } else {
                Alert.alert(
                    'Add Caregiver Observation',
                    'Observation entry will be connected to the caregiver notes system later.',
                );
            }
        }, 300);
    };

    const toggleLike = (noteId: number) => {
        setLikedNotes(current =>
            current.includes(noteId)
                ? current.filter(id => id !== noteId)
                : [...current, noteId],
        );
    };

    const acknowledge = (noteId: number) => {
        setAcknowledgedNotes(current =>
            current.includes(noteId)
                ? current.filter(id => id !== noteId)
                : [...current, noteId],
        );
    };

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                    },
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

            {/* Main content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingBottom: 120 + insets.bottom,
                    },
                ]}
            >
                {/* Patient Profile Chip */}
                <View style={styles.patientChip}>
                    <View style={styles.patientInfo}>
                        <View style={styles.patientAvatarWrapper}>
                            <Image
                                source={{ uri: PATIENT_IMAGE }}
                                style={styles.patientAvatar}
                            />

                            <View style={styles.onlineIndicator} />
                        </View>

                        <View style={styles.patientTextContainer}>
                            <View style={styles.patientNameRow}>
                                <Text style={styles.patientName}>
                                    Ramani Barman
                                </Text>

                                <Text style={styles.patientAge}>
                                    (72 yrs)
                                </Text>
                            </View>

                            <View style={styles.monitoringRow}>
                                <MaterialIcons
                                    name="verified-user"
                                    size={16}
                                    color={COLORS.primary}
                                />

                                <Text style={styles.monitoringText}>
                                    Caregiver Active Monitoring
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="View Ramani Barman full care summary"
                        onPress={onPatientInfo}
                        style={({ pressed }) => [
                            styles.infoButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialIcons
                            name="info"
                            size={20}
                            color={COLORS.onSurfaceVariant}
                        />
                    </Pressable>
                </View>

                {/* Add Observation */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add caregiver observation"
                    disabled={addingNote}
                    onPress={handleAddObservation}
                    style={({ pressed }) => [
                        styles.addObservationButton,
                        addingNote &&
                        styles.addObservationButtonPressed,
                        pressed &&
                        !addingNote &&
                        styles.buttonPressed,
                    ]}
                >
                    <MaterialIcons
                        name="add-circle"
                        size={24}
                        color={COLORS.onPrimary}
                    />

                    <Text style={styles.addObservationText}>
                        {addingNote
                            ? 'Opening Observation...'
                            : '+ Add Caregiver Observation'}
                    </Text>
                </Pressable>

                {/* Filter chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {FILTERS.map(filter => {
                        const active =
                            selectedFilter === filter.key;

                        return (
                            <Pressable
                                key={filter.key}
                                accessibilityRole="button"
                                accessibilityState={{
                                    selected: active,
                                }}
                                onPress={() =>
                                    setSelectedFilter(filter.key)
                                }
                                style={({ pressed }) => [
                                    styles.filterChip,
                                    active
                                        ? styles.filterChipActive
                                        : styles.filterChipInactive,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        active
                                            ? styles.filterTextActive
                                            : styles.filterTextInactive,
                                    ]}
                                >
                                    {filter.label}
                                </Text>

                                {filter.key === 'all' && active && (
                                    <View style={styles.filterDot} />
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Micro metrics */}
                <View style={styles.metricsRow}>
                    <View style={styles.microMetric}>
                        <View style={styles.metricIconSecondary}>
                            <MaterialIcons
                                name="psychology"
                                size={22}
                                color={COLORS.primary}
                            />
                        </View>

                        <View style={styles.metricText}>
                            <Text style={styles.metricLabel}>
                                Cognitive Alertness
                            </Text>

                            <Text style={styles.metricValue}>
                                Steady &amp; Vocal
                            </Text>
                        </View>
                    </View>

                    <View style={styles.microMetric}>
                        <View style={styles.metricIconPrimary}>
                            <MaterialIcons
                                name="check-circle"
                                size={22}
                                color={COLORS.primary}
                            />
                        </View>

                        <View style={styles.metricText}>
                            <Text style={styles.metricLabel}>
                                Medication Adherence
                            </Text>

                            <Text
                                style={[
                                    styles.metricValue,
                                    styles.metricValuePrimary,
                                ]}
                            >
                                100% on track
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Timeline */}
                <View style={styles.timelineSection}>
                    <View style={styles.timelineHeader}>
                        <Text style={styles.timelineTitle}>
                            Timeline Log
                        </Text>

                        <Text style={styles.observationCount}>
                            {filteredNotes.length} observations logged
                        </Text>
                    </View>

                    {filteredNotes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons
                                name="event-note"
                                size={38}
                                color={COLORS.secondary}
                            />

                            <Text style={styles.emptyTitle}>
                                No observations in this category
                            </Text>

                            <Text style={styles.emptyText}>
                                Caregiver notes matching this filter
                                will appear here.
                            </Text>
                        </View>
                    ) : (
                        filteredNotes.map(note => (
                            <TimelineCard
                                key={note.id}
                                note={note}
                                liked={likedNotes.includes(note.id)}
                                acknowledged={acknowledgedNotes.includes(
                                    note.id,
                                )}
                                onLike={() =>
                                    toggleLike(note.id)
                                }
                                onAcknowledge={() =>
                                    acknowledge(note.id)
                                }
                            />
                        ))
                    )}
                </View>

                {/* Privacy */}
                <View style={styles.privacyCard}>
                    <View style={styles.lockCircle}>
                        <MaterialIcons
                            name="lock"
                            size={18}
                            color={COLORS.primary}
                        />
                    </View>

                    <Text style={styles.privacyText}>
                        Notes are shared privately between authorized
                        care team members to track qualitative changes
                        in day-to-day well-being.
                    </Text>
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
/* Timeline Card                                                              */
/* -------------------------------------------------------------------------- */

type TimelineCardProps = {
    note: Note;
    liked: boolean;
    acknowledged: boolean;
    onLike: () => void;
    onAcknowledge: () => void;
};

function TimelineCard({
    note,
    liked,
    acknowledged,
    onLike,
    onAcknowledge,
}: TimelineCardProps) {
    return (
        <View style={styles.timelineCard}>
            <View
                style={[
                    styles.timelineAccent,
                    { backgroundColor: note.accent },
                ]}
            />

            <View style={styles.noteContent}>
                {/* Time + category */}
                <View style={styles.noteTopRow}>
                    <View style={styles.noteTimeRow}>
                        {note.id === 1 && (
                            <View style={styles.pulseDot} />
                        )}

                        <Text style={styles.noteTime}>
                            {note.time}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.noteTag,
                            {
                                backgroundColor:
                                    note.tagBackground,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.noteTagText,
                                {
                                    color: note.tagText,
                                },
                            ]}
                        >
                            {note.tag}
                        </Text>
                    </View>
                </View>

                {/* Observation */}
                <Text style={styles.noteText}>
                    {note.text}
                </Text>

                {/* Author + action */}
                <View style={styles.noteFooter}>
                    <View style={styles.authorRow}>
                        {note.image ? (
                            <Image
                                source={{ uri: note.image }}
                                style={styles.authorAvatar}
                            />
                        ) : (
                            <View style={styles.initialAvatar}>
                                <Text style={styles.initialText}>
                                    {note.initials}
                                </Text>
                            </View>
                        )}

                        <Text
                            numberOfLines={2}
                            style={styles.authorText}
                        >
                            By {note.author}{' '}
                            <Text style={styles.authorRole}>
                                ({note.role})
                            </Text>
                        </Text>
                    </View>

                    {note.id === 1 && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                liked
                                    ? 'Remove heart from observation'
                                    : 'Heart observation'
                            }
                            onPress={onLike}
                            style={({ pressed }) => [
                                styles.actionButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <MaterialIcons
                                name="favorite"
                                size={18}
                                color={
                                    liked
                                        ? COLORS.tertiaryContainer
                                        : COLORS.primary
                                }
                            />
                        </Pressable>
                    )}

                    {note.id === 2 && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                acknowledged
                                    ? 'Remove acknowledgement'
                                    : 'Acknowledge observation'
                            }
                            onPress={onAcknowledge}
                            style={({ pressed }) => [
                                styles.actionButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <MaterialIcons
                                name="thumb-up"
                                size={18}
                                color={
                                    acknowledged
                                        ? COLORS.primary
                                        : COLORS.secondary
                                }
                            />
                        </Pressable>
                    )}

                    {note.icon && (
                        <MaterialIcons
                            name={note.icon}
                            size={18}
                            color={COLORS.tertiary}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
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

            {active && <View style={styles.activeIndicator} />}
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
        backgroundColor: 'rgba(252, 249, 248, 0.96)',
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

    /* Content */
    content: {
        width: '100%',
        maxWidth: 448,
        alignSelf: 'center',
        paddingTop: 84,
        paddingHorizontal: 20,
    },

    /* Patient chip */
    patientChip: {
        minHeight: 82,
        padding: 16,
        backgroundColor: COLORS.surfaceLow,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000000',
        shadowOpacity: 0.035,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
        marginBottom: 20,
    },

    patientInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    patientAvatarWrapper: {
        position: 'relative',
        marginRight: 12,
    },

    patientAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },

    onlineIndicator: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.surfaceLow,
    },

    patientTextContainer: {
        flex: 1,
    },

    patientNameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
    },

    patientName: {
        color: COLORS.onSurface,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '700',
    },

    patientAge: {
        marginLeft: 5,
        color: COLORS.secondary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },

    monitoringRow: {
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },

    monitoringText: {
        marginLeft: 4,
        color: COLORS.secondary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },

    infoButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    /* Add observation */
    addObservationButton: {
        width: '100%',
        minHeight: 56,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        gap: 10,
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 2,
        marginBottom: 12,
    },

    addObservationButtonPressed: {
        backgroundColor: COLORS.primaryContainer,
    },

    addObservationText: {
        color: COLORS.onPrimary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
    },

    buttonPressed: {
        transform: [{ scale: 0.98 }],
    },

    /* Filters */
    filterContainer: {
        paddingVertical: 4,
        gap: 10,
        paddingRight: 4,
        marginBottom: 12,
    },

    filterChip: {
        minHeight: 40,
        borderRadius: 999,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    filterChipActive: {
        backgroundColor: COLORS.primary,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        elevation: 1,
    },

    filterChipInactive: {
        backgroundColor: COLORS.surfaceContainer,
    },

    filterText: {
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '600',
    },

    filterTextActive: {
        color: COLORS.onPrimary,
    },

    filterTextInactive: {
        color: COLORS.onSurfaceVariant,
    },

    filterDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primaryFixed,
        marginLeft: 6,
    },

    /* Metrics */
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },

    microMetric: {
        flex: 1,
        minHeight: 76,
        padding: 14,
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOpacity: 0.035,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
    },

    metricIconSecondary: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.secondaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    metricIconPrimary: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.primaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    metricText: {
        flex: 1,
    },

    metricLabel: {
        color: COLORS.secondary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600',
    },

    metricValue: {
        marginTop: 2,
        color: COLORS.onSurface,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 16,
        lineHeight: 21,
        fontWeight: '700',
    },

    metricValuePrimary: {
        color: COLORS.primary,
    },

    /* Timeline */
    timelineSection: {
        marginBottom: 20,
    },

    timelineHeader: {
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    timelineTitle: {
        color: COLORS.onSurface,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '700',
        letterSpacing: -0.2,
    },

    observationCount: {
        color: COLORS.secondary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },

    timelineCard: {
        width: '100%',
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.035,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
    },

    timelineAccent: {
        width: 8,
    },

    noteContent: {
        flex: 1,
        padding: 16,
    },

    noteTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 12,
    },

    noteTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },

    pulseDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginRight: 8,
    },

    noteTime: {
        color: COLORS.secondary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600',
    },

    noteTag: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
        maxWidth: '55%',
    },

    noteTagText: {
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600',
        textAlign: 'center',
    },

    noteText: {
        color: COLORS.onSurface,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        marginBottom: 12,
    },

    noteFooter: {
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    authorRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },

    authorAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
    },

    initialAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },

    initialText: {
        color: COLORS.onSecondary,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
    },

    authorText: {
        flex: 1,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },

    authorRole: {
        color: COLORS.secondary,
        fontWeight: '400',
    },

    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Empty state */
    emptyState: {
        backgroundColor: COLORS.surfaceLowest,
        borderRadius: 12,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    emptyTitle: {
        marginTop: 10,
        color: COLORS.onSurface,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '700',
        textAlign: 'center',
    },

    emptyText: {
        marginTop: 5,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'center',
    },

    /* Privacy */
    privacyCard: {
        padding: 16,
        backgroundColor: COLORS.surfaceLow,
        borderRadius: 12,
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

    lockCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.secondaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },

    privacyText: {
        flex: 1,
        color: COLORS.onSurfaceVariant,
        fontFamily: 'Atkinson Hyperlegible Next',
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
    },

    /* Bottom nav */
    bottomNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        backgroundColor: 'rgba(252, 249, 248, 0.96)',
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

    pressed: {
        opacity: 0.75,
    },
});