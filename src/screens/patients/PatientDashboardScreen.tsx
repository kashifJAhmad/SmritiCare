import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  background: '#FCF9F8',
  surface: '#FCF9F8',
  white: '#FFFFFF',

  surfaceContainerLow: '#F6F3F2',
  surfaceContainer: '#F0EDED',
  surfaceContainerHigh: '#EAE7E7',
  surfaceContainerHighest: '#E5E2E1',

  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#90D689',

  primaryFixed: '#ACF4A4',
  primaryFixedDim: '#91D78A',
  onPrimaryFixed: '#002203',

  secondary: '#556158',
  secondaryFixed: '#D9E6DA',
  onSecondaryFixedVariant: '#3E4A41',

  tertiary: '#721900',
  tertiaryContainer: '#9B2500',

  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',

  outline: '#717A6D',
  outlineVariant: '#C0C9BB',

  onSurface: '#1B1C1C',
  onSurfaceVariant: '#41493E',

  successBackground: '#EAF6EA',
  successBorder: '#C8DEC8',

  warningBackground: '#FFF4D6',
  warningBorder: '#E5C76B',

  dangerBackground: '#FFF0EE',
  dangerBorder: '#F0BDB7',
};

type PatientStatus = 'Active' | 'Alert' | 'Stable';

type Patient = {
  id: string;
  name: string;
  initials: string;
  room: string;
  status: PatientStatus;
  age?: string;
  condition?: string;
  lastVisit?: string;
};

type FilterType = 'All' | 'Alert' | 'Stable' | 'Active';

type PatientDashboardScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'RB',
    name: 'Ramani Barman',
    initials: 'RB',
    room: 'Room 102',
    status: 'Active',
    age: '72',
    condition: 'Memory care',
    lastVisit: 'Today, 9:30 AM',
  },
  {
    id: 'AS',
    name: 'Anand Sharma',
    initials: 'AS',
    room: 'Room 105',
    status: 'Alert',
    age: '68',
    condition: 'Requires observation',
    lastVisit: 'Today, 10:15 AM',
  },
  {
    id: 'ND',
    name: 'Nirmala Devi',
    initials: 'ND',
    room: 'Room 108',
    status: 'Stable',
    age: '75',
    condition: 'Routine care',
    lastVisit: 'Yesterday, 4:20 PM',
  },
];

const getInitials = (name: string) => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'PT';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

export default function PatientDashboardScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: PatientDashboardScreenProps) {
  const searchInputRef = useRef<TextInput>(null);

  const [patients, setPatients] =
    useState<Patient[]>(INITIAL_PATIENTS);

  const [search, setSearch] = useState('');
  const [filter, setFilter] =
    useState<FilterType>('All');

  const [showNewPatient, setShowNewPatient] =
    useState(false);

  const [showReports, setShowReports] =
    useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [showPatientDetails, setShowPatientDetails] =
    useState(false);

  const [showPatientMenu, setShowPatientMenu] =
    useState(false);

  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newCondition, setNewCondition] =
    useState('');
  const [newStatus, setNewStatus] =
    useState<PatientStatus>('Stable');

  // ---------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------

  const statistics = useMemo(() => {
    return {
      total: patients.length,

      active: patients.filter(
        (patient) => patient.status === 'Active',
      ).length,

      alerts: patients.filter(
        (patient) => patient.status === 'Alert',
      ).length,

      stable: patients.filter(
        (patient) => patient.status === 'Stable',
      ).length,
    };
  }, [patients]);

  // ---------------------------------------------------------
  // FILTERED PATIENTS
  // ---------------------------------------------------------

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        query.length === 0 ||
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.room.toLowerCase().includes(query) ||
        patient.condition
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === 'All' ||
        patient.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [patients, search, filter]);

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------

  const handleSearch = () => {
    searchInputRef.current?.focus();
  };

  // ---------------------------------------------------------
  // PATIENT DETAILS
  // ---------------------------------------------------------

  const handlePatientPress = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  // ---------------------------------------------------------
  // MORE MENU
  // ---------------------------------------------------------

  const handleMoreOptions = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientMenu(true);
  };

  // ---------------------------------------------------------
  // CHANGE STATUS
  // ---------------------------------------------------------

  const updatePatientStatus = (
    patientId: string,
    status: PatientStatus,
  ) => {
    setPatients((currentPatients) =>
      currentPatients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              status,
            }
          : patient,
      ),
    );

    setShowPatientMenu(false);
    setShowPatientDetails(false);
  };

  // ---------------------------------------------------------
  // DELETE PATIENT
  // ---------------------------------------------------------

  const deletePatient = (patientId: string) => {
    const patient = patients.find(
      (item) => item.id === patientId,
    );

    if (!patient) {
      return;
    }

    const removePatient = () => {
      setPatients((currentPatients) =>
        currentPatients.filter(
          (item) => item.id !== patientId,
        ),
      );

      setShowPatientMenu(false);
      setShowPatientDetails(false);
      setSelectedPatient(null);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Remove ${patient.name} from the dashboard?`,
      );

      if (confirmed) {
        removePatient();
      }

      return;
    }

    Alert.alert(
      'Remove Patient',
      `Are you sure you want to remove ${patient.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: removePatient,
        },
      ],
    );
  };

  // ---------------------------------------------------------
  // REPORTS
  // ---------------------------------------------------------

  const handleReports = () => {
    setShowReports(true);
  };

  // ---------------------------------------------------------
  // ADD PATIENT
  // ---------------------------------------------------------

  const resetNewPatientForm = () => {
    setNewName('');
    setNewId('');
    setNewRoom('');
    setNewAge('');
    setNewCondition('');
    setNewStatus('Stable');
  };

  const handleNewPatient = () => {
    resetNewPatientForm();
    setShowNewPatient(true);
  };

  const handleCreatePatient = () => {
    const name = newName.trim();
    const id = newId.trim().toUpperCase();
    const room = newRoom.trim();

    if (!name) {
      Alert.alert(
        'Missing Name',
        'Please enter the patient name.',
      );
      return;
    }

    if (!id) {
      Alert.alert(
        'Missing Patient ID',
        'Please enter a patient ID.',
      );
      return;
    }

    if (!room) {
      Alert.alert(
        'Missing Room',
        'Please enter the room number.',
      );
      return;
    }

    const duplicateId = patients.some(
      (patient) =>
        patient.id.toLowerCase() === id.toLowerCase(),
    );

    if (duplicateId) {
      Alert.alert(
        'Patient ID Exists',
        'Please use a different patient ID.',
      );
      return;
    }

    const newPatient: Patient = {
      id,
      name,
      initials: getInitials(name),
      room: room.toLowerCase().startsWith('room')
        ? room
        : `Room ${room}`,
      status: newStatus,
      age: newAge.trim() || undefined,
      condition:
        newCondition.trim() || 'Routine care',
      lastVisit: 'Just added',
    };

    setPatients((currentPatients) => [
      newPatient,
      ...currentPatients,
    ]);

    setShowNewPatient(false);
    resetNewPatientForm();

    Alert.alert(
      'Patient Added',
      `${name} has been added successfully.`,
    );
  };

  // ---------------------------------------------------------
  // MENU
  // ---------------------------------------------------------

  const handleMenu = () => {
    Alert.alert(
      'SmritiCare Portal',
      'Use the bottom navigation to move between sections.',
    );
  };

  // ---------------------------------------------------------
  // STATUS HELPERS
  // ---------------------------------------------------------

  const getStatusStripeStyle = (
    status: PatientStatus,
  ) => {
    if (status === 'Alert') {
      return styles.alertStripe;
    }

    if (status === 'Active') {
      return styles.activeStripe;
    }

    return styles.stableStripe;
  };

  const getAvatarStyle = (
    status: PatientStatus,
  ) => {
    if (status === 'Alert') {
      return styles.patientAvatarAlert;
    }

    if (status === 'Active') {
      return styles.patientAvatarActive;
    }

    return styles.patientAvatarStable;
  };

  const getInitialsStyle = (
    status: PatientStatus,
  ) => {
    if (status === 'Alert') {
      return styles.initialsAlert;
    }

    if (status === 'Active') {
      return styles.initialsActive;
    }

    return styles.initialsStable;
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={({ pressed }) => [
                styles.headerIconButton,
                pressed &&
                  styles.headerIconButtonPressed,
              ]}
              onPress={handleMenu}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={8}
            >
              <MaterialIcons
                name="menu"
                size={30}
                color={COLORS.primary}
              />
            </Pressable>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              SmritiCare Portal
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [
                styles.headerIconButton,
                pressed &&
                  styles.headerIconButtonPressed,
              ]}
              onPress={handleSearch}
              accessibilityRole="button"
              accessibilityLabel="Search patients"
              hitSlop={8}
            >
              <MaterialIcons
                name="search"
                size={29}
                color={COLORS.primary}
              />
            </Pressable>

            <View
              style={styles.avatar}
              accessibilityLabel="SmritiCare medical portal"
            >
              <MaterialIcons
                name="medical-services"
                size={25}
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>

        {/* =====================================================
            MAIN SCROLL
        ====================================================== */}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ===================================================
              PAGE TITLE
          ==================================================== */}

          <View style={styles.titleSection}>
            <View style={styles.titleText}>
              <Text style={styles.pageTitle}>
                Patient Dashboard
              </Text>

              <Text style={styles.pageSubtitle}>
                Manage and monitor patient status.
              </Text>
            </View>

            <View style={styles.pageActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.reportsButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={handleReports}
                accessibilityRole="button"
                accessibilityLabel="Open patient reports"
              >
                <MaterialIcons
                  name="analytics"
                  size={24}
                  color={COLORS.primary}
                />

                <Text style={styles.reportsText}>
                  Reports
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.newPatientButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={handleNewPatient}
                accessibilityRole="button"
                accessibilityLabel="Add new patient"
              >
                <MaterialIcons
                  name="person-add"
                  size={24}
                  color={COLORS.white}
                />

                <Text style={styles.newPatientText}>
                  New Patient
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ===================================================
              STATISTICS
          ==================================================== */}

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons
                  name="groups"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>
                  {statistics.total}
                </Text>

                <Text style={styles.statLabel}>
                  Total Patients
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons
                  name="check-circle"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>
                  {statistics.active}
                </Text>

                <Text style={styles.statLabel}>
                  Active
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  styles.alertStatIcon,
                ]}
              >
                <MaterialIcons
                  name="warning"
                  size={25}
                  color={COLORS.error}
                />
              </View>

              <View style={styles.statTextContainer}>
                <Text
                  style={[
                    styles.statNumber,
                    statistics.alerts > 0 &&
                      styles.alertNumber,
                  ]}
                >
                  {statistics.alerts}
                </Text>

                <Text style={styles.statLabel}>
                  Alerts
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons
                  name="favorite"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>
                  {statistics.stable}
                </Text>

                <Text style={styles.statLabel}>
                  Stable
                </Text>
              </View>
            </View>
          </View>

          {/* ===================================================
              SEARCH & FILTERS
          ==================================================== */}

          <View style={styles.searchFilterContainer}>
            <View style={styles.searchBox}>
              <MaterialIcons
                name="search"
                size={27}
                color={COLORS.onSurfaceVariant}
              />

              <TextInput
                ref={searchInputRef}
                value={search}
                onChangeText={setSearch}
                placeholder="Search patients by name, ID, room..."
                placeholderTextColor={
                  COLORS.onSurfaceVariant
                }
                style={styles.searchInput}
                accessibilityLabel="Search patients"
                returnKeyType="search"
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() => setSearch('')}
                  style={styles.clearSearch}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={COLORS.onSurfaceVariant}
                  />
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <Pressable
                style={[
                  styles.filterButton,
                  filter === 'All' &&
                    styles.filterButtonActive,
                ]}
                onPress={() => setFilter('All')}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'All' &&
                      styles.filterTextActive,
                  ]}
                >
                  All ({statistics.total})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterButton,
                  filter === 'Alert' &&
                    styles.filterButtonAlertActive,
                ]}
                onPress={() => setFilter('Alert')}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'Alert' &&
                      styles.filterTextAlertActive,
                  ]}
                >
                  Alerts ({statistics.alerts})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterButton,
                  filter === 'Active' &&
                    styles.filterButtonActive,
                ]}
                onPress={() => setFilter('Active')}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'Active' &&
                      styles.filterTextActive,
                  ]}
                >
                  Active ({statistics.active})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterButton,
                  filter === 'Stable' &&
                    styles.filterButtonActive,
                ]}
                onPress={() => setFilter('Stable')}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'Stable' &&
                      styles.filterTextActive,
                  ]}
                >
                  Stable ({statistics.stable})
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* ===================================================
              PATIENT LIST HEADER
          ==================================================== */}

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                Patients
              </Text>

              <Text style={styles.listSubtitle}>
                {filteredPatients.length} patient
                {filteredPatients.length === 1
                  ? ''
                  : 's'} shown
              </Text>
            </View>

            <Pressable
              style={styles.sortButton}
              onPress={() => {
                setPatients((currentPatients) =>
                  [...currentPatients].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  ),
                );
              }}
              accessibilityRole="button"
              accessibilityLabel="Sort patients alphabetically"
            >
              <MaterialIcons
                name="sort-by-alpha"
                size={23}
                color={COLORS.primary}
              />

              <Text style={styles.sortText}>
                Sort
              </Text>
            </Pressable>
          </View>

          {/* ===================================================
              PATIENT LIST
          ==================================================== */}

          <View style={styles.patientList}>
            {filteredPatients.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="person-search"
                  size={55}
                  color={COLORS.onSurfaceVariant}
                />

                <Text style={styles.emptyTitle}>
                  No patients found
                </Text>

                <Text style={styles.emptyText}>
                  Try a different name, ID, room, or
                  filter.
                </Text>

                {search.length > 0 && (
                  <Pressable
                    style={styles.emptyAction}
                    onPress={() => setSearch('')}
                  >
                    <Text style={styles.emptyActionText}>
                      Clear Search
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredPatients.map((patient) => (
                <View
                  key={patient.id}
                  style={styles.patientCard}
                >
                  {/* Status Stripe */}
                  <View
                    style={[
                      styles.statusStripe,
                      getStatusStripeStyle(
                        patient.status,
                      ),
                    ]}
                  />

                  {/* =================================================
                      PATIENT TOP
                  ================================================== */}

                  <View style={styles.patientCardTop}>
                    <Pressable
                      style={styles.patientIdentity}
                      onPress={() =>
                        handlePatientPress(patient)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${patient.name}`}
                    >
                      <View
                        style={[
                          styles.patientAvatar,
                          getAvatarStyle(
                            patient.status,
                          ),
                        ]}
                      >
                        <Text
                          style={[
                            styles.initials,
                            getInitialsStyle(
                              patient.status,
                            ),
                          ]}
                        >
                          {patient.initials}
                        </Text>
                      </View>

                      <View style={styles.patientInfo}>
                        <Text
                          style={styles.patientName}
                          numberOfLines={1}
                        >
                          {patient.name}
                        </Text>

                        <View style={styles.roomRow}>
                          <MaterialIcons
                            name="meeting-room"
                            size={20}
                            color={
                              COLORS.onSurfaceVariant
                            }
                          />

                          <Text style={styles.roomText}>
                            {patient.room}
                          </Text>

                          <Text style={styles.idText}>
                            ID: {patient.id}
                          </Text>
                        </View>

                        {patient.condition && (
                          <Text
                            style={styles.conditionText}
                            numberOfLines={1}
                          >
                            {patient.condition}
                          </Text>
                        )}
                      </View>
                    </Pressable>

                    {/* More button is now NOT nested
                        inside another Pressable. */}
                    <Pressable
                      style={styles.moreButton}
                      onPress={() =>
                        handleMoreOptions(patient)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`More options for ${patient.name}`}
                      hitSlop={8}
                    >
                      <MaterialIcons
                        name="more-vert"
                        size={27}
                        color={COLORS.onSurfaceVariant}
                      />
                    </Pressable>
                  </View>

                  {/* =================================================
                      PATIENT BOTTOM
                  ================================================== */}

                  <View style={styles.patientCardBottom}>
                    <View
                      style={[
                        styles.statusBadge,
                        patient.status === 'Alert'
                          ? styles.alertBadge
                          : patient.status ===
                              'Active'
                            ? styles.activeBadge
                            : styles.stableBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          patient.status === 'Alert'
                            ? styles.alertDot
                            : patient.status ===
                                'Active'
                              ? styles.activeDot
                              : styles.stableDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.statusText,
                          patient.status === 'Alert'
                            ? styles.alertStatusText
                            : patient.status ===
                                'Active'
                              ? styles.activeStatusText
                              : styles.stableStatusText,
                        ]}
                      >
                        {patient.status}
                      </Text>
                    </View>

                    <Pressable
                      style={styles.detailsButton}
                      onPress={() =>
                        handlePatientPress(patient)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`View details for ${patient.name}`}
                    >
                      <Text style={styles.detailsText}>
                        View Details
                      </Text>

                      <MaterialIcons
                        name="arrow-forward"
                        size={21}
                        color={COLORS.secondary}
                      />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* =========================================================
            BOTTOM NAVIGATION
        ========================================================== */}

        <View style={styles.bottomNav}>
          <Pressable
            style={[
              styles.navItem,
              styles.navItemActive,
            ]}
            onPress={onHome}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <MaterialIcons
              name="home"
              size={27}
              color={COLORS.primary}
            />

            <Text style={styles.navTextActive}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onGames}
            accessibilityRole="button"
            accessibilityLabel="Games"
          >
            <MaterialIcons
              name="sports-esports"
              size={27}
              color={
                COLORS.onSecondaryFixedVariant
              }
            />

            <Text style={styles.navText}>
              Games
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onSchedule}
            accessibilityRole="button"
            accessibilityLabel="Reminders"
          >
            <MaterialIcons
              name="notifications-active"
              size={27}
              color={
                COLORS.onSecondaryFixedVariant
              }
            />

            <Text style={styles.navText}>
              Remind
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onMemory}
            accessibilityRole="button"
            accessibilityLabel="Memory"
          >
            <MaterialIcons
              name="psychology"
              size={27}
              color={
                COLORS.onSecondaryFixedVariant
              }
            />

            <Text style={styles.navText}>
              Memory
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onProfile}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <MaterialIcons
              name="person"
              size={27}
              color={
                COLORS.onSecondaryFixedVariant
              }
            />

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>
        </View>

        {/* =========================================================
            NEW PATIENT MODAL
        ========================================================== */}

        <Modal
          visible={showNewPatient}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setShowNewPatient(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      Add New Patient
                    </Text>

                    <Text
                      style={styles.modalSubtitle}
                    >
                      Create a patient profile.
                    </Text>
                  </View>

                  <Pressable
                    style={styles.modalClose}
                    onPress={() =>
                      setShowNewPatient(false)
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Close new patient form"
                  >
                    <MaterialIcons
                      name="close"
                      size={26}
                      color={COLORS.onSurface}
                    />
                  </Pressable>
                </View>

                {/* Name */}
                <Text style={styles.fieldLabel}>
                  Patient Name *
                </Text>

                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Enter full name"
                  placeholderTextColor={
                    COLORS.onSurfaceVariant
                  }
                  style={styles.formInput}
                />

                {/* ID */}
                <Text style={styles.fieldLabel}>
                  Patient ID *
                </Text>

                <TextInput
                  value={newId}
                  onChangeText={setNewId}
                  placeholder="Example: AB"
                  placeholderTextColor={
                    COLORS.onSurfaceVariant
                  }
                  style={styles.formInput}
                  autoCapitalize="characters"
                />

                {/* Room */}
                <Text style={styles.fieldLabel}>
                  Room *
                </Text>

                <TextInput
                  value={newRoom}
                  onChangeText={setNewRoom}
                  placeholder="Example: 110"
                  placeholderTextColor={
                    COLORS.onSurfaceVariant
                  }
                  style={styles.formInput}
                />

                {/* Age */}
                <Text style={styles.fieldLabel}>
                  Age
                </Text>

                <TextInput
                  value={newAge}
                  onChangeText={setNewAge}
                  placeholder="Example: 70"
                  placeholderTextColor={
                    COLORS.onSurfaceVariant
                  }
                  style={styles.formInput}
                  keyboardType="number-pad"
                />

                {/* Condition */}
                <Text style={styles.fieldLabel}>
                  Care / Condition
                </Text>

                <TextInput
                  value={newCondition}
                  onChangeText={setNewCondition}
                  placeholder="Example: Memory care"
                  placeholderTextColor={
                    COLORS.onSurfaceVariant
                  }
                  style={styles.formInput}
                />

                {/* Status */}
                <Text style={styles.fieldLabel}>
                  Patient Status
                </Text>

                <View style={styles.statusSelector}>
                  {(
                    [
                      'Active',
                      'Alert',
                      'Stable',
                    ] as PatientStatus[]
                  ).map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.statusOption,
                        newStatus === status &&
                          styles.statusOptionSelected,
                      ]}
                      onPress={() =>
                        setNewStatus(status)
                      }
                    >
                      <View
                        style={[
                          styles.statusDot,
                          status === 'Alert'
                            ? styles.alertDot
                            : status === 'Active'
                              ? styles.activeDot
                              : styles.stableDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.statusOptionText,
                          newStatus === status &&
                            styles.statusOptionTextSelected,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Buttons */}
                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() =>
                      setShowNewPatient(false)
                    }
                  >
                    <Text style={styles.cancelText}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.createButton}
                    onPress={handleCreatePatient}
                  >
                    <MaterialIcons
                      name="person-add"
                      size={22}
                      color={COLORS.white}
                    />

                    <Text style={styles.createText}>
                      Add Patient
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* =========================================================
            REPORTS MODAL
        ========================================================== */}

        <Modal
          visible={showReports}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowReports(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.reportModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Patient Reports
                  </Text>

                  <Text
                    style={styles.modalSubtitle}
                  >
                    Current dashboard overview.
                  </Text>
                </View>

                <Pressable
                  style={styles.modalClose}
                  onPress={() =>
                    setShowReports(false)
                  }
                >
                  <MaterialIcons
                    name="close"
                    size={26}
                    color={COLORS.onSurface}
                  />
                </Pressable>
              </View>

              <View style={styles.reportRow}>
                <View style={styles.reportIcon}>
                  <MaterialIcons
                    name="groups"
                    size={25}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.reportInfo}>
                  <Text style={styles.reportNumber}>
                    {statistics.total}
                  </Text>

                  <Text style={styles.reportLabel}>
                    Total Patients
                  </Text>
                </View>
              </View>

              <View style={styles.reportRow}>
                <View
                  style={[
                    styles.reportIcon,
                    styles.alertStatIcon,
                  ]}
                >
                  <MaterialIcons
                    name="warning"
                    size={25}
                    color={COLORS.error}
                  />
                </View>

                <View style={styles.reportInfo}>
                  <Text
                    style={[
                      styles.reportNumber,
                      statistics.alerts > 0 &&
                        styles.alertNumber,
                    ]}
                  >
                    {statistics.alerts}
                  </Text>

                  <Text style={styles.reportLabel}>
                    Patients Requiring Attention
                  </Text>
                </View>
              </View>

              <View style={styles.reportRow}>
                <View style={styles.reportIcon}>
                  <MaterialIcons
                    name="check-circle"
                    size={25}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.reportInfo}>
                  <Text style={styles.reportNumber}>
                    {statistics.stable}
                  </Text>

                  <Text style={styles.reportLabel}>
                    Stable Patients
                  </Text>
                </View>
              </View>

              <View style={styles.reportNote}>
                <MaterialIcons
                  name="info-outline"
                  size={22}
                  color={COLORS.primary}
                />

                <Text style={styles.reportNoteText}>
                  Reports are currently generated
                  from the patients stored in this
                  dashboard session.
                </Text>
              </View>

              <Pressable
                style={styles.fullButton}
                onPress={() =>
                  setShowReports(false)
                }
              >
                <Text style={styles.fullButtonText}>
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* =========================================================
            PATIENT DETAILS MODAL
        ========================================================== */}

        <Modal
          visible={showPatientDetails}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setShowPatientDetails(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModal}>
              {selectedPatient && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      Patient Details
                    </Text>

                    <Pressable
                      style={styles.modalClose}
                      onPress={() =>
                        setShowPatientDetails(false)
                      }
                    >
                      <MaterialIcons
                        name="close"
                        size={26}
                        color={COLORS.onSurface}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.detailsIdentity}>
                    <View
                      style={[
                        styles.largeAvatar,
                        getAvatarStyle(
                          selectedPatient.status,
                        ),
                      ]}
                    >
                      <Text
                        style={[
                          styles.largeInitials,
                          getInitialsStyle(
                            selectedPatient.status,
                          ),
                        ]}
                      >
                        {selectedPatient.initials}
                      </Text>
                    </View>

                    <Text style={styles.detailsName}>
                      {selectedPatient.name}
                    </Text>

                    <Text
                      style={styles.detailsId}
                    >
                      Patient ID: {selectedPatient.id}
                    </Text>
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailBox}>
                      <Text
                        style={styles.detailLabel}
                      >
                        Room
                      </Text>

                      <Text
                        style={styles.detailValue}
                      >
                        {selectedPatient.room}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text
                        style={styles.detailLabel}
                      >
                        Age
                      </Text>

                      <Text
                        style={styles.detailValue}
                      >
                        {selectedPatient.age ||
                          'Not set'}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text
                        style={styles.detailLabel}
                      >
                        Status
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          selectedPatient.status ===
                            'Alert' &&
                            styles.alertNumber,
                        ]}
                      >
                        {selectedPatient.status}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text
                        style={styles.detailLabel}
                      >
                        Last Visit
                      </Text>

                      <Text
                        style={styles.detailValue}
                      >
                        {selectedPatient.lastVisit ||
                          'Not recorded'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.conditionBox}>
                    <Text
                      style={styles.detailLabel}
                    >
                      Care / Condition
                    </Text>

                    <Text
                      style={styles.conditionValue}
                    >
                      {selectedPatient.condition ||
                        'No condition recorded'}
                    </Text>
                  </View>

                  <View style={styles.detailActions}>
                    <Pressable
                      style={styles.secondaryAction}
                      onPress={() => {
                        setShowPatientDetails(false);
                        setShowPatientMenu(true);
                      }}
                    >
                      <MaterialIcons
                        name="edit"
                        size={21}
                        color={COLORS.primary}
                      />

                      <Text
                        style={
                          styles.secondaryActionText
                        }
                      >
                        Manage
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.primaryAction}
                      onPress={() =>
                        setShowPatientDetails(false)
                      }
                    >
                      <Text
                        style={styles.primaryActionText}
                      >
                        Done
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* =========================================================
            MORE OPTIONS MODAL
        ========================================================== */}

        <Modal
          visible={showPatientMenu}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowPatientMenu(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.menuModal}>
              {selectedPatient && (
                <>
                  <Text style={styles.menuTitle}>
                    {selectedPatient.name}
                  </Text>

                  <Text style={styles.menuSubtitle}>
                    {selectedPatient.room} •{' '}
                    {selectedPatient.status}
                  </Text>

                  <Text style={styles.menuSectionTitle}>
                    Change Status
                  </Text>

                  <Pressable
                    style={styles.menuOption}
                    onPress={() =>
                      updatePatientStatus(
                        selectedPatient.id,
                        'Active',
                      )
                    }
                  >
                    <View
                      style={[
                        styles.menuOptionIcon,
                        styles.activeMenuIcon,
                      ]}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={23}
                        color={COLORS.primary}
                      />
                    </View>

                    <Text style={styles.menuOptionText}>
                      Mark Active
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuOption}
                    onPress={() =>
                      updatePatientStatus(
                        selectedPatient.id,
                        'Alert',
                      )
                    }
                  >
                    <View
                      style={[
                        styles.menuOptionIcon,
                        styles.alertMenuIcon,
                      ]}
                    >
                      <MaterialIcons
                        name="warning"
                        size={23}
                        color={COLORS.error}
                      />
                    </View>

                    <Text style={styles.menuOptionText}>
                      Mark Alert
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuOption}
                    onPress={() =>
                      updatePatientStatus(
                        selectedPatient.id,
                        'Stable',
                      )
                    }
                  >
                    <View
                      style={[
                        styles.menuOptionIcon,
                        styles.stableMenuIcon,
                      ]}
                    >
                      <MaterialIcons
                        name="favorite"
                        size={23}
                        color={COLORS.primary}
                      />
                    </View>

                    <Text style={styles.menuOptionText}>
                      Mark Stable
                    </Text>
                  </Pressable>

                  <View style={styles.menuDivider} />

                  <Pressable
                    style={styles.menuOption}
                    onPress={() => {
                      setShowPatientMenu(false);
                      setShowPatientDetails(true);
                    }}
                  >
                    <View style={styles.menuOptionIcon}>
                      <MaterialIcons
                        name="visibility"
                        size={23}
                        color={COLORS.primary}
                      />
                    </View>

                    <Text style={styles.menuOptionText}>
                      View Details
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuOption}
                    onPress={() =>
                      deletePatient(
                        selectedPatient.id,
                      )
                    }
                  >
                    <View
                      style={[
                        styles.menuOptionIcon,
                        styles.deleteMenuIcon,
                      ]}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={23}
                        color={COLORS.error}
                      />
                    </View>

                    <Text
                      style={[
                        styles.menuOptionText,
                        styles.deleteText,
                      ]}
                    >
                      Remove Patient
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuCancel}
                    onPress={() =>
                      setShowPatientMenu(false)
                    }
                  >
                    <Text style={styles.menuCancelText}>
                      Cancel
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  // -----------------------------------------------------------
  // HEADER
  // -----------------------------------------------------------

  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconButtonPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  headerTitle: {
    flexShrink: 1,
    marginLeft: 6,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.primary,
  },

  avatar: {
    width: 44,
    height: 44,
    marginLeft: 4,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryFixed,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -----------------------------------------------------------
  // MAIN
  // -----------------------------------------------------------

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },

  titleSection: {
    marginBottom: 22,
  },

  titleText: {
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  pageSubtitle: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  pageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportsButton: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportsText: {
    marginLeft: 7,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.primary,
  },

  newPatientButton: {
    flex: 1.25,
    minHeight: 56,
    marginLeft: 10,
    paddingHorizontal: 10,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newPatientText: {
    marginLeft: 6,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.white,
  },

  buttonPressed: {
    opacity: 0.78,
  },

  // -----------------------------------------------------------
  // STATISTICS
  // -----------------------------------------------------------

  statsGrid: {
    marginBottom: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  statCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 82,
    padding: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertStatIcon: {
    backgroundColor: COLORS.errorContainer,
  },

  statTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  statNumber: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.primary,
  },

  alertNumber: {
    color: COLORS.error,
  },

  statLabel: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
  },

  // -----------------------------------------------------------
  // SEARCH
  // -----------------------------------------------------------

  searchFilterContainer: {
    marginBottom: 24,
    padding: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  searchBox: {
    minHeight: 56,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.outline,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    marginLeft: 8,
    fontSize: 18,
    color: COLORS.onSurface,
    outlineStyle: 'none',
  } as any,

  clearSearch: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterRow: {
    paddingTop: 14,
    paddingRight: 4,
  },

  filterButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    marginRight: 9,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: COLORS.secondaryFixed,
    borderColor: COLORS.secondaryFixed,
  },

  filterButtonAlertActive: {
    backgroundColor: COLORS.errorContainer,
    borderColor: COLORS.error,
  },

  filterText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  filterTextActive: {
    color: COLORS.onSecondaryFixedVariant,
  },

  filterTextAlertActive: {
    color: COLORS.onErrorContainer,
  },

  // -----------------------------------------------------------
  // LIST HEADER
  // -----------------------------------------------------------

  listHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listTitle: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  listSubtitle: {
    marginTop: 2,
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
  },

  sortButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sortText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // -----------------------------------------------------------
  // PATIENT CARDS
  // -----------------------------------------------------------

  patientList: {
    width: '100%',
  },

  patientCard: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    padding: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 16,
  },

  statusStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
  },

  stableStripe: {
    backgroundColor: COLORS.primaryFixedDim,
  },

  activeStripe: {
    backgroundColor: COLORS.primary,
  },

  alertStripe: {
    backgroundColor: COLORS.tertiaryContainer,
  },

  patientCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  patientIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  patientAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  patientAvatarStable: {
    backgroundColor: COLORS.primaryFixed,
  },

  patientAvatarActive: {
    backgroundColor: COLORS.secondaryFixed,
  },

  patientAvatarAlert: {
    backgroundColor: COLORS.errorContainer,
  },

  initials: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
  },

  initialsStable: {
    color: COLORS.onPrimaryFixed,
  },

  initialsActive: {
    color: COLORS.primary,
  },

  initialsAlert: {
    color: COLORS.onErrorContainer,
  },

  patientInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },

  patientName: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  roomRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomText: {
    marginLeft: 5,
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.onSurfaceVariant,
  },

  idText: {
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },

  conditionText: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.secondary,
  },

  moreButton: {
    width: 46,
    height: 46,
    marginLeft: 6,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  patientCardBottom: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBadge: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
  },

  stableBadge: {
    backgroundColor: COLORS.successBackground,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },

  activeBadge: {
    backgroundColor: COLORS.secondaryFixed,
    borderWidth: 1,
    borderColor: COLORS.primaryFixedDim,
  },

  alertBadge: {
    backgroundColor: COLORS.dangerBackground,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  stableDot: {
    backgroundColor: COLORS.primary,
  },

  activeDot: {
    backgroundColor: COLORS.primaryContainer,
  },

  alertDot: {
    backgroundColor: COLORS.error,
  },

  statusText: {
    marginLeft: 7,
    fontSize: 15,
    fontWeight: '600',
  },

  stableStatusText: {
    color: COLORS.primaryContainer,
  },

  activeStatusText: {
    color: COLORS.primaryContainer,
  },

  alertStatusText: {
    color: COLORS.onErrorContainer,
  },

  detailsButton: {
    minHeight: 48,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  // -----------------------------------------------------------
  // EMPTY STATE
  // -----------------------------------------------------------

  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  emptyText: {
    maxWidth: 330,
    marginTop: 8,
    fontSize: 18,
    lineHeight: 27,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  emptyAction: {
    minHeight: 48,
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  bottomSpace: {
    height: 90,
  },

  // -----------------------------------------------------------
  // BOTTOM NAV
  // -----------------------------------------------------------

  bottomNav: {
    minHeight: 76,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  navItem: {
    minWidth: 62,
    minHeight: 64,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navItemActive: {
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primary,
  },

  navText: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSecondaryFixedVariant,
  },

  navTextActive: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // -----------------------------------------------------------
  // MODALS
  // -----------------------------------------------------------

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },

  reportModal: {
    width: '100%',
    maxWidth: 500,
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },

  detailsModal: {
    width: '100%',
    maxWidth: 520,
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },

  menuModal: {
    width: '100%',
    maxWidth: 440,
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },

  modalHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
  },

  modalClose: {
    width: 46,
    height: 46,
    marginLeft: 10,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -----------------------------------------------------------
  // FORM
  // -----------------------------------------------------------

  fieldLabel: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  formInput: {
    minHeight: 54,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    fontSize: 17,
    color: COLORS.onSurface,
  },

  statusSelector: {
    marginTop: 2,
    gap: 8,
  },

  statusOption: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryFixed,
  },

  statusOptionText: {
    marginLeft: 9,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  statusOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  modalActions: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  cancelButton: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  createButton: {
    minHeight: 54,
    marginLeft: 8,
    paddingHorizontal: 20,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createText: {
    marginLeft: 7,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },

  // -----------------------------------------------------------
  // REPORTS
  // -----------------------------------------------------------

  reportRow: {
    minHeight: 72,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportInfo: {
    marginLeft: 13,
  },

  reportNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.primary,
  },

  reportLabel: {
    marginTop: 2,
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
  },

  reportNote: {
    marginTop: 8,
    padding: 13,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryFixed,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  reportNoteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.onSecondaryFixedVariant,
  },

  fullButton: {
    minHeight: 54,
    marginTop: 20,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },

  // -----------------------------------------------------------
  // PATIENT DETAILS
  // -----------------------------------------------------------

  detailsIdentity: {
    alignItems: 'center',
    marginBottom: 20,
  },

  largeAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeInitials: {
    fontSize: 28,
    fontWeight: '700',
  },

  detailsName: {
    marginTop: 12,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },

  detailsId: {
    marginTop: 4,
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  detailBox: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 76,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  detailValue: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  conditionBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryFixed,
  },

  conditionValue: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.onSurface,
  },

  detailActions: {
    marginTop: 20,
    flexDirection: 'row',
  },

  secondaryAction: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryActionText: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  primaryAction: {
    flex: 1,
    minHeight: 52,
    marginLeft: 10,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  // -----------------------------------------------------------
  // MORE MENU
  // -----------------------------------------------------------

  menuTitle: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },

  menuSectionTitle: {
    marginTop: 22,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  menuOption: {
    minHeight: 58,
    marginBottom: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeMenuIcon: {
    backgroundColor: COLORS.secondaryFixed,
  },

  alertMenuIcon: {
    backgroundColor: COLORS.errorContainer,
  },

  stableMenuIcon: {
    backgroundColor: COLORS.primaryFixed,
  },

  deleteMenuIcon: {
    backgroundColor: COLORS.errorContainer,
  },

  menuOptionText: {
    marginLeft: 12,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  deleteText: {
    color: COLORS.error,
  },

  menuDivider: {
    height: 1,
    marginVertical: 9,
    backgroundColor: COLORS.outlineVariant,
  },

  menuCancel: {
    minHeight: 52,
    marginTop: 8,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuCancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});