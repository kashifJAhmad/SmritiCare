import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { API_BASE_URL } from "../../constants/api";
import { getToken } from "../../services/authStorage";
import CaregiverPatientTasks from "./CaregiverPatientTasks";

const COLORS = {
  background: "#FBF9F1",
  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",
  surfaceHigh: "#E3E2D9",
  greenSoft: "#E7EFE3",
  greenBorder: "#C5D8C1",
  onSurface: "#1B1C17",
  onSurfaceVariant: "#565A52",
  outline: "#72766D",
  outlineVariant: "#CDD2C8",
  error: "#9B3F32",
};

type ConnectedPatient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
};

type Props = {
  onBack?: () => void;
  onHome?: () => void;
  onSchedule?: () => void;
  onAlerts?: () => void;
  onProfile?: () => void;
};

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

function extractPatients(result: any): ConnectedPatient[] {
  const candidates = [
    result?.patients,
    result?.data,
    result?.data?.patients,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    return candidate
      .map((item: any) => {
        const patient = item?.patient || item;

        if (!patient?.id) {
          return null;
        }

        return {
          id: String(patient.id),
          name:
            patient.fullName ||
            patient.name ||
            "Connected Patient",
          email: patient.email || undefined,
          phone: patient.phone || undefined,
          profileImageUrl:
            patient.profileImageUrl || undefined,
        };
      })
      .filter(Boolean) as ConnectedPatient[];
  }

  return [];
}

export default function CaregiverRemindersScreen({
  onBack,
  onHome,
  onSchedule,
  onAlerts,
  onProfile,
}: Props) {
  const [patients, setPatients] = useState<ConnectedPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token = await getToken();

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/caregiver-connections/patients`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load your connected patients."
          );
        }

        const loadedPatients = extractPatients(result);

        setPatients(loadedPatients);

        setSelectedPatientId((current) => {
          if (
            current &&
            loadedPatients.some(
              (patient) => patient.id === current
            )
          ) {
            return current;
          }

          return loadedPatients.length > 0
            ? loadedPatients[0].id
            : null;
        });
      } catch (error) {
        showMessage(
          "Patient reminders",
          error instanceof Error
            ? error.message
            : "Unable to load connected patients."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const selectedPatient =
    patients.find(
      (patient) => patient.id === selectedPatientId
    ) || null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.container}>
        {/* ======================================================
            HEADER
        ====================================================== */}

        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={23}
              color={COLORS.onSurface}
            />
          </Pressable>

          <View style={styles.topBarText}>
            <Text style={styles.eyebrow}>
              CAREGIVER
            </Text>

            <Text style={styles.screenTitle}>
              Patient Reminders
            </Text>
          </View>

          <Pressable
            onPress={() => loadPatients(true)}
            disabled={refreshing}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
            ]}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />
            ) : (
              <MaterialIcons
                name="refresh"
                size={21}
                color={COLORS.primary}
              />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ====================================================
              INTRO
          ==================================================== */}

          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <MaterialIcons
                name="notifications-active"
                size={27}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>
                Care schedule
              </Text>

              <Text style={styles.introText}>
                View and manage reminders for your
                connected patients. These are the
                patient's tasks, not your own reminders.
              </Text>
            </View>
          </View>

          {/* ====================================================
              PATIENT SELECTOR
          ==================================================== */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                CONNECTED PATIENTS
              </Text>

              <Text style={styles.sectionTitle}>
                Select a patient
              </Text>
            </View>

            <View style={styles.patientCountBadge}>
              <Text style={styles.patientCountText}>
                {patients.length}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.loadingText}>
                Loading connected patients...
              </Text>
            </View>
          ) : patients.length === 0 ? (
            <View style={styles.emptyPatientsCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons
                  name="person-outline"
                  size={32}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No connected patients
              </Text>

              <Text style={styles.emptyText}>
                Connect a patient from the caregiver
                dashboard first. Their reminders will
                appear here.
              </Text>

              <Pressable
                onPress={onHome}
                style={({ pressed }) => [
                  styles.homeButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name="home"
                  size={19}
                  color={COLORS.onPrimary}
                />

                <Text style={styles.homeButtonText}>
                  Go to Dashboard
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.patientList}>
              {patients.map((patient) => {
                const selected =
                  patient.id === selectedPatientId;

                return (
                  <Pressable
                    key={patient.id}
                    onPress={() =>
                      setSelectedPatientId(patient.id)
                    }
                    style={({ pressed }) => [
                      styles.patientCard,
                      selected &&
                        styles.patientCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.patientAvatar,
                        selected &&
                          styles.patientAvatarSelected,
                      ]}
                    >
                      <MaterialIcons
                        name="person"
                        size={23}
                        color={
                          selected
                            ? COLORS.onPrimary
                            : COLORS.primary
                        }
                      />
                    </View>

                    <View style={styles.patientInfo}>
                      <Text
                        style={styles.patientName}
                        numberOfLines={1}
                      >
                        {patient.name}
                      </Text>

                      {patient.email ? (
                        <Text
                          style={styles.patientDetail}
                          numberOfLines={1}
                        >
                          {patient.email}
                        </Text>
                      ) : patient.phone ? (
                        <Text
                          style={styles.patientDetail}
                          numberOfLines={1}
                        >
                          {patient.phone}
                        </Text>
                      ) : (
                        <Text style={styles.patientDetail}>
                          Connected patient
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                      ]}
                    >
                      {selected ? (
                        <MaterialIcons
                          name="check"
                          size={16}
                          color={COLORS.onPrimary}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ====================================================
              SELECTED PATIENT TASKS
          ==================================================== */}

          {selectedPatient ? (
            <View style={styles.tasksSection}>
              <View style={styles.selectedPatientBanner}>
                <View style={styles.selectedPatientIcon}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.selectedPatientText}>
                  <Text style={styles.selectedLabel}>
                    MANAGING REMINDERS FOR
                  </Text>

                  <Text
                    style={styles.selectedName}
                    numberOfLines={1}
                  >
                    {selectedPatient.name}
                  </Text>
                </View>

                <View style={styles.connectedBadge}>
                  <View
                    style={styles.connectedDot}
                  />

                  <Text
                    style={styles.connectedText}
                  >
                    Connected
                  </Text>
                </View>
              </View>

              <CaregiverPatientTasks
                patientId={selectedPatient.id}
                patientName={selectedPatient.name}
              />
            </View>
          ) : null}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* ======================================================
            CAREGIVER FOOTER
        ====================================================== */}

        <View style={styles.bottomNav}>
          <BottomNavItem
            icon="home"
            label="Home"
            onPress={onHome}
          />

          <BottomNavItem
            icon="notifications-active"
            label="Remind"
            active
            onPress={onSchedule}
          />

          <BottomNavItem
            icon="warning"
            label="Alerts"
            onPress={onAlerts}
          />

          <BottomNavItem
            icon="person"
            label="Profile"
            onPress={onProfile}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.navIconWrap,
          active && styles.navIconWrapActive,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={21}
          color={
            active
              ? COLORS.primary
              : COLORS.onSurfaceVariant
          }
        />
      </View>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  topBar: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  topBarText: {
    flex: 1,
    marginLeft: 11,
  },

  eyebrow: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  screenTitle: {
    marginTop: 2,
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: "800",
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    padding: 16,
  },

  introCard: {
    backgroundColor: COLORS.greenSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: "800",
  },

  introText: {
    marginTop: 4,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  sectionTitle: {
    marginTop: 3,
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: "800",
  },

  patientCountBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  patientCountText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "900",
  },

  patientList: {
    gap: 9,
  },

  patientCard: {
    minHeight: 72,
    padding: 11,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  patientCardSelected: {
    backgroundColor: COLORS.greenSoft,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },

  patientAvatar: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  patientAvatarSelected: {
    backgroundColor: COLORS.primary,
  },

  patientInfo: {
    flex: 1,
    marginLeft: 11,
  },

  patientName: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: "800",
  },

  patientDetail: {
    marginTop: 3,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },

  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  loadingCard: {
    minHeight: 150,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "700",
  },

  emptyPatientsCard: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 13,
    color: COLORS.onSurface,
    fontSize: 17,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 7,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  homeButton: {
    marginTop: 17,
    minHeight: 45,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  homeButtonText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "800",
  },

  tasksSection: {
    marginTop: 22,
  },

  selectedPatientBanner: {
    marginBottom: 13,
    padding: 11,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedPatientIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedPatientText: {
    flex: 1,
    marginLeft: 9,
  },

  selectedLabel: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  selectedName: {
    marginTop: 2,
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: "800",
  },

  connectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  connectedText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 25,
  },

  bottomNav: {
    minHeight: 72,
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: Platform.OS === "ios" ? 8 : 6,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconWrap: {
    width: 38,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconWrapActive: {
    backgroundColor: COLORS.greenSoft,
  },

  navLabel: {
    marginTop: 2,
    color: COLORS.onSurfaceVariant,
    fontSize: 9,
    fontWeight: "700",
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.68,
  },
});