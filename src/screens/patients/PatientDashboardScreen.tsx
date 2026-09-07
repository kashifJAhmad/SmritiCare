import React, { useMemo, useState } from 'react';
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

const COLORS = {
  background: '#FCF9F8',
  surface: '#FCF9F8',
  white: '#FFFFFF',

  surfaceContainerLow: '#F6F3F2',
  surfaceContainer: '#F0EDED',
  surfaceContainerHigh: '#EAE7E7',
  surfaceContainerHighest: '#E5E2E1',
  surfaceVariant: '#E5E2E1',

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
};

type PatientStatus = 'Active' | 'Alert' | 'Stable';

type Patient = {
  id: string;
  name: string;
  initials: string;
  room: string;
  status: PatientStatus;
};

const PATIENTS: Patient[] = [
  {
    id: 'RB',
    name: 'Ramani Barman',
    initials: 'RB',
    room: 'Room 102',
    status: 'Active',
  },
  {
    id: 'AS',
    name: 'Anand Sharma',
    initials: 'AS',
    room: 'Room 105',
    status: 'Alert',
  },
  {
    id: 'ND',
    name: 'Nirmala Devi',
    initials: 'ND',
    room: 'Room 108',
    status: 'Stable',
  },
];

type PatientDashboardScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

export default function PatientDashboardScreen({
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: PatientDashboardScreenProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Alert' | 'Stable'>('All');

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return PATIENTS.filter((patient) => {
      const matchesSearch =
        query.length === 0 ||
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.room.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || patient.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const handlePatientPress = (patient: Patient) => {
    Alert.alert(
      patient.name,
      `${patient.room}\nStatus: ${patient.status}`,
    );
  };

  const handleReports = () => {
    Alert.alert('Reports', 'Patient reports will open here.');
  };

  const handleNewPatient = () => {
    Alert.alert('New Patient', 'New patient form will open here.');
  };

  const handleMenu = () => {
    Alert.alert('Menu', 'Portal menu will open here.');
  };

  const handleSearch = () => {
    Alert.alert(
      'Search Patients',
      'Use the search field below to search by patient name, ID, or room.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={styles.headerIconButton}
              onPress={handleMenu}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
            >
              <MaterialIcons
                name="menu"
                size={30}
                color={COLORS.primary}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              SmritiCare Portal
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={styles.headerIconButton}
              onPress={handleSearch}
              accessibilityRole="button"
              accessibilityLabel="Search patients"
            >
              <MaterialIcons
                name="search"
                size={29}
                color={COLORS.primary}
              />
            </Pressable>

            <View style={styles.avatar}>
              <MaterialIcons
                name="medical-services"
                size={25}
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Title */}
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
                style={styles.reportsButton}
                onPress={handleReports}
              >
                <MaterialIcons
                  name="analytics"
                  size={25}
                  color={COLORS.primary}
                />

                <Text style={styles.reportsText}>
                  Reports
                </Text>
              </Pressable>

              <Pressable
                style={styles.newPatientButton}
                onPress={handleNewPatient}
              >
                <MaterialIcons
                  name="add"
                  size={27}
                  color={COLORS.white}
                />

                <Text style={styles.newPatientText}>
                  New Patient
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Search & Filters */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchBox}>
              <MaterialIcons
                name="search"
                size={27}
                color={COLORS.onSurfaceVariant}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search patients by name or ID..."
                placeholderTextColor={COLORS.onSurfaceVariant}
                style={styles.searchInput}
                accessibilityLabel="Search patients"
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() => setSearch('')}
                  style={styles.clearSearch}
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
                  filter === 'All' && styles.filterButtonActive,
                ]}
                onPress={() => setFilter('All')}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'All' &&
                      styles.filterTextActive,
                  ]}
                >
                  All Patients
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterButton,
                  filter === 'Alert' &&
                    styles.filterButtonAlertActive,
                ]}
                onPress={() => setFilter('Alert')}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'Alert' &&
                      styles.filterTextAlertActive,
                  ]}
                >
                  Alerts (1)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterButton,
                  filter === 'Stable' &&
                    styles.filterButtonActive,
                ]}
                onPress={() => setFilter('Stable')}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === 'Stable' &&
                      styles.filterTextActive,
                  ]}
                >
                  Stable (2)
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Patient List */}
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
                  Try a different name, ID, room, or filter.
                </Text>
              </View>
            ) : (
              filteredPatients.map((patient) => (
                <Pressable
                  key={patient.id}
                  style={({ pressed }) => [
                    styles.patientCard,
                    pressed && styles.patientCardPressed,
                  ]}
                  onPress={() => handlePatientPress(patient)}
                  accessibilityRole="button"
                  accessibilityLabel={`${patient.name}, ${patient.room}, ${patient.status}`}
                >
                  {/* Status stripe */}
                  <View
                    style={[
                      styles.statusStripe,
                      patient.status === 'Alert'
                        ? styles.alertStripe
                        : styles.stableStripe,
                    ]}
                  />

                  <View style={styles.patientCardTop}>
                    <View style={styles.patientIdentity}>
                      <View
                        style={[
                          styles.patientAvatar,
                          patient.status === 'Alert'
                            ? styles.patientAvatarAlert
                            : styles.patientAvatarStable,
                        ]}
                      >
                        <Text
                          style={[
                            styles.initials,
                            patient.status === 'Alert'
                              ? styles.initialsAlert
                              : styles.initialsStable,
                          ]}
                        >
                          {patient.initials}
                        </Text>
                      </View>

                      <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>
                          {patient.name}
                        </Text>

                        <View style={styles.roomRow}>
                          <MaterialIcons
                            name="meeting-room"
                            size={20}
                            color={COLORS.onSurfaceVariant}
                          />

                          <Text style={styles.roomText}>
                            {patient.room}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      style={styles.moreButton}
                      onPress={() =>
                        Alert.alert(
                          patient.name,
                          'More patient options will appear here.',
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`More options for ${patient.name}`}
                    >
                      <MaterialIcons
                        name="more-vert"
                        size={27}
                        color={COLORS.onSurfaceVariant}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.patientCardBottom}>
                    <View
                      style={[
                        styles.statusBadge,
                        patient.status === 'Alert'
                          ? styles.alertBadge
                          : styles.stableBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          patient.status === 'Alert'
                            ? styles.alertDot
                            : styles.stableDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.statusText,
                          patient.status === 'Alert'
                            ? styles.alertStatusText
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
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Mobile Bottom Navigation */}
        <View style={styles.bottomNav}>
          <Pressable
            style={[styles.navItem, styles.navItemActive]}
            onPress={onHome}
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
          >
            <MaterialIcons
              name="sports-esports"
              size={27}
              color={COLORS.onSecondaryFixedVariant}
            />

            <Text style={styles.navText}>
              Games
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onSchedule}
          >
            <MaterialIcons
              name="notifications-active"
              size={27}
              color={COLORS.onSecondaryFixedVariant}
            />

            <Text style={styles.navText}>
              Remind
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onMemory}
          >
            <MaterialIcons
              name="psychology"
              size={27}
              color={COLORS.onSecondaryFixedVariant}
            />

            <Text style={styles.navText}>
              Memory
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onProfile}
          >
            <MaterialIcons
              name="person"
              size={27}
              color={COLORS.onSecondaryFixedVariant}
            />

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* Header */

  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flex: 1,
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

  headerTitle: {
    marginLeft: 8,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.primary,
  },

  avatar: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryFixed,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Main */

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },

  titleSection: {
    marginBottom: 28,
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
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportsText: {
    marginLeft: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.primary,
  },

  newPatientButton: {
    flex: 1.25,
    minHeight: 56,
    marginLeft: 12,
    paddingHorizontal: 14,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newPatientText: {
    marginLeft: 6,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.white,
  },

  /* Search */

  searchFilterContainer: {
    marginBottom: 28,
    padding: 16,
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
  },

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
    paddingHorizontal: 20,
    marginRight: 10,
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
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  filterTextActive: {
    color: COLORS.onSecondaryFixedVariant,
  },

  filterTextAlertActive: {
    color: COLORS.onErrorContainer,
  },

  /* Patient cards */

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

  patientCardPressed: {
    backgroundColor: COLORS.surfaceContainerLow,
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

  alertStripe: {
    backgroundColor: COLORS.tertiaryContainer,
  },

  patientCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  patientIdentity: {
    flex: 1,
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

  patientAvatarAlert: {
    backgroundColor: COLORS.errorContainer,
  },

  initials: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },

  initialsStable: {
    color: COLORS.onPrimaryFixed,
  },

  initialsAlert: {
    color: COLORS.onErrorContainer,
  },

  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },

  patientName: {
    fontSize: 22,
    lineHeight: 29,
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
    fontSize: 18,
    lineHeight: 25,
    color: COLORS.onSurfaceVariant,
  },

  moreButton: {
    width: 46,
    height: 46,
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
    backgroundColor: '#EAF6EA',
    borderWidth: 1,
    borderColor: '#C8DEC8',
  },

  alertBadge: {
    backgroundColor: '#FFF0EE',
    borderWidth: 1,
    borderColor: '#F0BDB7',
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  stableDot: {
    backgroundColor: COLORS.primary,
  },

  alertDot: {
    backgroundColor: COLORS.error,
  },

  statusText: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: '600',
  },

  stableStatusText: {
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
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 27,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 90,
  },

  /* Bottom Navigation */

  bottomNav: {
    minHeight: 76,
    paddingHorizontal: 8,
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
});