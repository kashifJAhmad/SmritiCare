import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_BASE_URL } from "../../constants/api";
import { getToken } from "../../services/authStorage";

const COLORS = {
  background: "#FBF9F1",
  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",

  secondary: "#00629E",
  secondaryContainer: "#D7EEFF",
  secondaryFixed: "#E7EFE3",

  surface: "#FFFFFF",
  surfaceContainer: "#E7EFE3",
  surfaceContainerLow: "#F1F0E7",
  surfaceContainerHigh: "#E3E2D9",

  greenSoft: "#E2F3E0",
  greenBorder: "#B7DDB3",

  error: "#BA1A1A",
  errorContainer: "#FFE8E5",
  onErrorContainer: "#7A1010",

  onSurface: "#1B1C17",
  onSurfaceVariant: "#565A52",
  outline: "#72766D",
  outlineVariant: "#CDD2C8",
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
  onLogout?: () => void;
};

type PatientLocation = {
  available: boolean;
  message: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    updatedAt: string;
  } | null;
};

type ConnectedPatient = {
  id: string;
  name: string;
  email: string;
  age: string;
  phone: string;
  city: string;
  profileImageUrl: string | null;
  connectionId: string;
  connectedAt: string | null;
};

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

function confirmDisconnect(
  patientName: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      `Disconnect ${patientName}?\n\nThey will no longer appear in your connected patients.`
    );

    if (confirmed) {
      onConfirm();
    }

    return;
  }

  Alert.alert(
    "Disconnect Patient",
    `Are you sure you want to disconnect ${patientName}?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: onConfirm,
      },
    ]
  );
}

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "SC";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function getString(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function getPatientFromConnection(
  item: any
): ConnectedPatient | null {
  const patient =
    item?.patient ||
    item?.user ||
    item?.Patient ||
    item?.User ||
    item;

  if (!patient) {
    return null;
  }

  const id =
    getString(patient.id) ||
    getString(patient.userId) ||
    getString(item?.patientId);

  if (!id) {
    return null;
  }

  const name =
    getString(patient.fullName) ||
    getString(patient.name) ||
    "Patient";

  const email = getString(patient.email);

  const age =
    patient.age !== null &&
    patient.age !== undefined
      ? String(patient.age)
      : "";

  const connectionId =
    getString(item?.id) ||
    getString(item?.connectionId) ||
    id;

  return {
    id,
    name,
    email,
    age,
    phone: getString(patient.phone),
    city: getString(patient.city),
    profileImageUrl:
      getString(patient.profileImageUrl) || null,
    connectionId,
    connectedAt:
      getString(item?.createdAt) ||
      getString(item?.connectedAt) ||
      null,
  };
}

function extractPatients(result: any): ConnectedPatient[] {
  const possibleArrays = [
    result?.data,
    result?.data?.patients,
    result?.patients,
    result?.data?.connections,
    result?.connections,
  ];

  for (const candidate of possibleArrays) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(getPatientFromConnection)
        .filter(Boolean) as ConnectedPatient[];
    }
  }

  return [];
}

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
  onLogout,
}: CaregiverDashboardScreenProps) {
  const insets = useSafeAreaInsets();

  const [patients, setPatients] = useState<
    ConnectedPatient[]
  >([]);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [addPatientVisible, setAddPatientVisible] =
    useState(false);

  const [patientCode, setPatientCode] =
    useState("");

  const [connecting, setConnecting] =
    useState(false);

  const [disconnectingId, setDisconnectingId] =
    useState<string | null>(null);

  const loadPatients = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoadingPatients(true);
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
              "Unable to load connected patients."
          );
        }

        setPatients(extractPatients(result));
      } catch (error) {
        showMessage(
          "Patients",
          error instanceof Error
            ? error.message
            : "Unable to load connected patients."
        );
      } finally {
        setLoadingPatients(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const openAddPatient = () => {
    setPatientCode("");
    setAddPatientVisible(true);
  };

  const closeAddPatient = () => {
    if (connecting) {
      return;
    }

    setPatientCode("");
    setAddPatientVisible(false);
  };

  const connectPatient = async () => {
    const code = patientCode
      .trim()
      .toUpperCase();

    if (!code) {
      showMessage(
        "Patient Code Required",
        "Please enter the Patient Code shown in the patient's SmritiCare Profile."
      );
      return;
    }

    if (!code.startsWith("SC-PAT-")) {
      showMessage(
        "Invalid Patient Code",
        "Please enter the complete Patient Code. It should start with SC-PAT-."
      );
      return;
    }

    try {
      setConnecting(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/caregiver-connections/connect-patient`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            patientCode: code,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to connect this patient."
        );
      }

      setPatientCode("");
      setAddPatientVisible(false);

      await loadPatients();

      showMessage(
        "Patient Connected",
        "The patient has been successfully added to your care list."
      );
    } catch (error) {
      showMessage(
        "Unable to Connect",
        error instanceof Error
          ? error.message
          : "Something went wrong while connecting the patient."
      );
    } finally {
      setConnecting(false);
    }
  };

  const disconnectPatient = (
    patient: ConnectedPatient
  ) => {
    confirmDisconnect(patient.name, async () => {
      try {
        setDisconnectingId(
          patient.connectionId
        );

        const token = await getToken();

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/caregiver-connections/${patient.connectionId}`,
          {
            method: "DELETE",
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
              "Unable to disconnect this patient."
          );
        }

        setPatients((current) =>
          current.filter(
            (item) =>
              item.connectionId !==
              patient.connectionId
          )
        );

        showMessage(
          "Patient Removed",
          `${patient.name} has been removed from your connected patients.`
        );
      } catch (error) {
        showMessage(
          "Unable to Disconnect",
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setDisconnectingId(null);
      }
    });
  };

  const patientCountText = useMemo(() => {
    if (patients.length === 1) {
      return "1 connected patient";
    }

    return `${patients.length} connected patients`;
  }, [patients.length]);

  const handleLogout = () => {
    if (!onLogout) {
      showMessage(
        "Sign Out",
        "The sign-out action is not connected yet. Pass onLogout from App.tsx to finish the sign-out flow."
      );
      return;
    }

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Sign out of your caregiver account?"
      );

      if (confirmed) {
        onLogout();
      }
      return;
    }

    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your caregiver account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: onLogout,
        },
      ]
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
              size={25}
              color={COLORS.onSurface}
            />
          </Pressable>

          <View style={styles.headerBrand}>
            <Text style={styles.headerTitle}>
              SmritiCare
            </Text>

            <Text style={styles.headerSubtitle}>
              Caregiver
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <MaterialIcons
                name="logout"
                size={19}
                color={COLORS.error}
              />
            </Pressable>

            <Pressable
              onPress={onProfile}
              style={({ pressed }) => [
                styles.profileCircle,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open caregiver profile"
            >
              <MaterialIcons
                name="person"
                size={19}
                color={COLORS.onPrimary}
              />
            </Pressable>
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
            paddingBottom: insets.bottom + 115,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <View style={styles.headingSection}>
          <View style={styles.headingLabelRow}>
            <View style={styles.statusDot} />

            <Text style={styles.headingLabel}>
              CAREGIVER DASHBOARD
            </Text>
          </View>

          <Text style={styles.portalTitle}>
            Caregiver Portal
          </Text>

          <Text style={styles.headingDescription}>
            Manage the people connected to your care.
          </Text>
        </View>

        {/* Patients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionLabel}>
                YOUR CARE LIST
              </Text>

              <Text style={styles.sectionTitle}>
                Connected Patients
              </Text>

              <Text style={styles.sectionSubtitle}>
                {patientCountText}
              </Text>
            </View>

            <Pressable
              onPress={openAddPatient}
              style={({ pressed }) => [
                styles.addPatientButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add patient"
            >
              <MaterialIcons
                name="person-add"
                size={20}
                color={COLORS.onPrimary}
              />

              <Text
                style={styles.addPatientButtonText}
              >
                Add Patient
              </Text>
            </Pressable>
          </View>

          {loadingPatients ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.loadingTitle}>
                Loading patients...
              </Text>

              <Text style={styles.loadingText}>
                Getting your connected patients.
              </Text>
            </View>
          ) : patients.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons
                  name="people-outline"
                  size={38}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No patients connected yet
              </Text>

              <Text style={styles.emptyText}>
                Ask a patient for the permanent Patient
                Code shown in their SmritiCare Profile.
              </Text>

              <Pressable
                onPress={openAddPatient}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add your first patient"
              >
                <MaterialIcons
                  name="person-add"
                  size={21}
                  color={COLORS.onPrimary}
                />

                <Text style={styles.emptyButtonText}>
                  Add Your First Patient
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.patientList}>
              {patients.map((patient) => (
                <PatientCard
                  key={patient.connectionId}
                  patient={patient}
                  disconnecting={
                    disconnectingId ===
                    patient.connectionId
                  }
                  onDisconnect={() =>
                    disconnectPatient(patient)
                  }
                  onCognitiveProgress={
                    onCognitiveProgress
                  }
                />
              ))}
            </View>
          )}

          {!loadingPatients &&
          patients.length > 0 ? (
            <Pressable
              onPress={() => loadPatients(true)}
              disabled={refreshing}
              style={({ pressed }) => [
                styles.refreshButton,
                refreshing &&
                  styles.disabledButton,
                pressed &&
                  !refreshing &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh patient list"
            >
              {refreshing ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <MaterialIcons
                  name="refresh"
                  size={20}
                  color={COLORS.primary}
                />
              )}

              <Text style={styles.refreshButtonText}>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh Patient List"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Care Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            CARE TOOLS
          </Text>

          <Text style={styles.sectionTitle}>
            Patient Insights
          </Text>

          <Text style={styles.sectionSubtitle}>
            Open the available care tools for your
            connected patients.
          </Text>

          <CareToolCard
            icon="psychology"
            title="Cognitive Progress"
            description="Review cognitive activity and progress."
            onPress={onCognitiveProgress}
          />

          <CareToolCard
            icon="smart-toy"
            title="AI Adaptation"
            description="Review adaptive cognitive recommendations."
            onPress={onAIAdaptation}
          />

          <CareToolCard
            icon="water-drop"
            title="Daily Routine & Hydration"
            description="Review routine and hydration information."
            onPress={onRoutine}
          />
        </View>

        {/* Account / Navigation Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialIcons
              name="verified-user"
              size={23}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Connected care
            </Text>

            <Text style={styles.infoText}>
              Only patients connected through the
              caregiver connection system appear in your
              care list.
            </Text>
          </View>
        </View>
      </ScrollView>

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

      {/* Add Patient Modal */}
      <Modal
        visible={addPatientVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAddPatient}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View
                style={styles.modalTitleContainer}
              >
                <View style={styles.modalIcon}>
                  <MaterialIcons
                    name="person-add"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.modalTitleText}>
                  <Text style={styles.modalTitle}>
                    Add Patient
                  </Text>

                  <Text
                    style={styles.modalSubtitle}
                  >
                    Enter the Patient Code from their Profile
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={closeAddPatient}
                style={styles.closeButton}
                disabled={connecting}
                accessibilityRole="button"
                accessibilityLabel="Close add patient"
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={COLORS.onSurface}
                />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.instructionCard}>
                <MaterialIcons
                  name="info-outline"
                  size={22}
                  color={COLORS.secondary}
                />

                <Text
                  style={styles.instructionText}
                >
                  Ask the patient to open their SmritiCare
                  Profile. Their permanent Patient Code is
                  displayed there.
                </Text>
              </View>

              <Text style={styles.inputLabel}>
                Patient Code
              </Text>

              <TextInput
                value={patientCode}
                onChangeText={(value) =>
                  setPatientCode(
                    value.toUpperCase()
                  )
                }
                placeholder="SC-PAT-ABC123"
                placeholderTextColor={
                  COLORS.outline
                }
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!connecting}
                maxLength={20}
                style={[
                  styles.patientCodeInput,
                  connecting &&
                    styles.disabledInput,
                ]}
              />

              <Text style={styles.inputHint}>
                Enter the complete code exactly as shown
                in the patient's Profile.
              </Text>

              <View style={styles.exampleCard}>
                <MaterialIcons
                  name="verified-user"
                  size={19}
                  color={COLORS.primary}
                />

                <View style={styles.exampleContent}>
                  <Text
                    style={styles.exampleLabel}
                  >
                    Example
                  </Text>

                  <Text
                    style={styles.exampleCode}
                  >
                    SC-PAT-ABC123
                  </Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={closeAddPatient}
                  disabled={connecting}
                  style={[
                    styles.cancelButton,
                    connecting &&
                      styles.disabledButton,
                  ]}
                >
                  <Text
                    style={styles.cancelButtonText}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={connectPatient}
                  disabled={connecting}
                  style={[
                    styles.connectButton,
                    connecting &&
                      styles.disabledButton,
                  ]}
                >
                  {connecting ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <MaterialIcons
                      name="link"
                      size={21}
                      color={COLORS.onPrimary}
                    />
                  )}

                  <Text
                    style={styles.connectButtonText}
                  >
                    {connecting
                      ? "Connecting..."
                      : "Connect Patient"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ========================================================================== */
/* Patient Card                                                               */
/* ========================================================================== */

type PatientCardProps = {
  patient: ConnectedPatient;
  disconnecting: boolean;
  onDisconnect: () => void;
  onCognitiveProgress?: () => void;
};

function PatientCard({
  patient,
  disconnecting,
  onDisconnect,
  onCognitiveProgress,
}: PatientCardProps) {
  const initials = useMemo(
    () => getInitials(patient.name),
    [patient.name]
  );

  const [patientLocation, setPatientLocation] =
    useState<PatientLocation | null>(null);
  const [locationLoading, setLocationLoading] =
    useState(true);

  const loadPatientLocation = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        setPatientLocation(null);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/location/patient/${patient.id}`,
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
        setPatientLocation({
          available: false,
          message: result.message || "Unable to load location.",
          location: null,
        });
        return;
      }

      setPatientLocation({
        available: Boolean(result.available),
        message: result.message || "No location available.",
        location: result.location || null,
      });
    } catch {
      setPatientLocation({
        available: false,
        message: "Unable to load the patient's location.",
        location: null,
      });
    } finally {
      setLocationLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    loadPatientLocation();

    const interval = setInterval(() => {
      loadPatientLocation();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadPatientLocation]);

  const formatLocationTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Recently updated";
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openPatientLocation = async () => {
    if (!patientLocation?.location) {
      return;
    }

    const { latitude, longitude } = patientLocation.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      await Linking.openURL(url);
    } catch {
      showMessage(
        "Maps",
        "Unable to open the map on this device."
      );
    }
  };

  return (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        {patient.profileImageUrl ? (
          <Image
            source={{
              uri: patient.profileImageUrl,
            }}
            style={styles.patientAvatarImage}
          />
        ) : (
          <View style={styles.patientAvatar}>
            <Text style={styles.patientInitials}>
              {initials}
            </Text>
          </View>
        )}

        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>
            {patient.name}
          </Text>

          {patient.email ? (
            <Text
              style={styles.patientEmail}
              numberOfLines={1}
            >
              {patient.email}
            </Text>
          ) : null}

          <View style={styles.patientMetaRow}>
            {patient.age ? (
              <View style={styles.metaItem}>
                <MaterialIcons
                  name="cake"
                  size={15}
                  color={COLORS.secondary}
                />

                <Text style={styles.metaText}>
                  {patient.age} years
                </Text>
              </View>
            ) : null}

            {patient.city ? (
              <View style={styles.metaItem}>
                <MaterialIcons
                  name="location-city"
                  size={15}
                  color={COLORS.secondary}
                />

                <Text style={styles.metaText}>
                  {patient.city}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.connectedBadge}>
          <View style={styles.connectedDot} />

          <Text
            style={styles.connectedBadgeText}
          >
            Connected
          </Text>
        </View>
      </View>

      <View style={styles.patientDivider} />

      {/* GPS Location */}
      <View
        style={[
          styles.locationCard,
          patientLocation?.available &&
            styles.locationCardActive,
        ]}
      >
        <View
          style={[
            styles.locationIcon,
            patientLocation?.available &&
              styles.locationIconActive,
          ]}
        >
          {locationLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.secondary}
            />
          ) : (
            <MaterialIcons
              name={
                patientLocation?.available
                  ? "location-on"
                  : "location-off"
              }
              size={22}
              color={
                patientLocation?.available
                  ? COLORS.primary
                  : COLORS.outline
              }
            />
          )}
        </View>

        <View style={styles.locationContent}>
          <Text style={styles.locationTitle}>
            GPS Location
          </Text>

          {locationLoading ? (
            <Text style={styles.locationText}>
              Checking location sharing...
            </Text>
          ) : patientLocation?.available &&
            patientLocation.location ? (
            <>
              <Text style={styles.locationActiveText}>
                Live location available
              </Text>

              <Text style={styles.locationMetaText}>
                Updated {formatLocationTime(
                  patientLocation.location.updatedAt
                )}
                {patientLocation.location.accuracy !== null
                  ? ` • ±${Math.round(
                      patientLocation.location.accuracy
                    )} m`
                  : ""}
              </Text>
            </>
          ) : (
            <Text style={styles.locationText}>
              {patientLocation?.message ||
                "GPS location is not available."}
            </Text>
          )}
        </View>

        {patientLocation?.available &&
        patientLocation.location ? (
          <Pressable
            onPress={openPatientLocation}
            style={({ pressed }) => [
              styles.mapButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${patient.name} location in maps`}
          >
            <MaterialIcons
              name="map"
              size={18}
              color={COLORS.onPrimary}
            />

            <Text style={styles.mapButtonText}>
              Map
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.patientConnectionInfo}>
        <MaterialIcons
          name="verified-user"
          size={17}
          color={COLORS.primary}
        />

        <Text
          style={styles.patientConnectionInfoText}
        >
          Connected to your caregiver account
        </Text>
      </View>

      <View style={styles.patientActions}>
        <Pressable
          onPress={onCognitiveProgress}
          style={({ pressed }) => [
            styles.patientActionButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`View progress for ${patient.name}`}
        >
          <MaterialIcons
            name="psychology"
            size={19}
            color={COLORS.primary}
          />

          <Text
            style={styles.patientActionText}
          >
            Progress
          </Text>
        </Pressable>

        <Pressable
          onPress={onDisconnect}
          disabled={disconnecting}
          style={({ pressed }) => [
            styles.disconnectButton,
            disconnecting &&
              styles.disabledButton,
            pressed &&
              !disconnecting &&
              styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Disconnect ${patient.name}`}
        >
          {disconnecting ? (
            <ActivityIndicator
              size="small"
              color={COLORS.error}
            />
          ) : (
            <MaterialIcons
              name="person-remove"
              size={19}
              color={COLORS.error}
            />
          )}

          <Text style={styles.disconnectText}>
            {disconnecting
              ? "Removing..."
              : "Disconnect"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* Care Tool Card                                                             */
/* ========================================================================== */

type CareToolCardProps = {
  icon: MaterialIconName;
  title: string;
  description: string;
  onPress?: () => void;
};

function CareToolCard({
  icon,
  title,
  description,
  onPress,
}: CareToolCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.careToolCard,
        pressed && styles.reportPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.careToolIcon}>
        <MaterialIcons
          name={icon}
          size={24}
          color={COLORS.secondary}
        />
      </View>

      <View style={styles.careToolContent}>
        <Text style={styles.careToolTitle}>
          {title}
        </Text>

        <Text
          style={styles.careToolDescription}
        >
          {description}
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

/* ========================================================================== */
/* Bottom Navigation                                                          */
/* ========================================================================== */

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
      <View
        style={[
          styles.navIconContainer,
          active &&
            styles.navIconContainerActive,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={23}
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
          active
            ? styles.navLabelActive
            : styles.navLabelInactive,
        ]}
      >
        {label}
      </Text>

      {active ? (
        <View style={styles.navIndicator} />
      ) : null}
    </Pressable>
  );
}

/* ========================================================================== */
/* Styles                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: COLORS.background,
    shadowColor: "#000",
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
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBrand: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  signOutButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.primary,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    gap: 24,
  },

  headingSection: {
    gap: 5,
  },

  headingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 2,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  headingLabel: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  portalTitle: {
    color: COLORS.onSurface,
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "700",
  },

  headingDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 1,
  },

  section: {
    gap: 12,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },

  sectionHeadingText: {
    flex: 1,
  },

  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.9,
  },

  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },

  addPatientButton: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  addPatientButtonText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "800",
  },

  loadingCard: {
    minHeight: 190,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  loadingTitle: {
    marginTop: 14,
    color: COLORS.onSurface,
    fontSize: 17,
    fontWeight: "700",
  },

  loadingText: {
    marginTop: 4,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: "center",
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 25,
    alignItems: "center",
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 15,
    color: COLORS.onSurface,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    maxWidth: 410,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  emptyButton: {
    minHeight: 52,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  emptyButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "800",
  },

  patientList: {
    gap: 12,
  },

  patientCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
  },

  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  patientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  patientAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 13,
  },

  patientInitials: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: "800",
  },

  patientDetails: {
    flex: 1,
    minWidth: 0,
  },

  patientName: {
    color: COLORS.onSurface,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
  },

  patientEmail: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  patientMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },

  connectedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 11,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  connectedBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  patientDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainer,
    marginVertical: 14,
  },

  locationCard: {
    minHeight: 72,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },

  locationCardActive: {
    backgroundColor: COLORS.greenSoft,
    borderColor: COLORS.greenBorder,
  },

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  locationIconActive: {
    backgroundColor: COLORS.surface,
  },

  locationContent: {
    flex: 1,
    minWidth: 0,
  },

  locationTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: "800",
  },

  locationText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  locationActiveText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  locationMetaText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 1,
  },

  mapButton: {
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  mapButtonText: {
    color: COLORS.onPrimary,
    fontSize: 11,
    fontWeight: "800",
  },

  patientConnectionInfo: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  patientConnectionInfoText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  patientActions: {
    flexDirection: "row",
    gap: 9,
  },

  patientActionButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: COLORS.secondaryFixed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  patientActionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  disconnectButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: COLORS.errorContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  disconnectText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "800",
  },

  refreshButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  careToolCard: {
    minHeight: 82,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  careToolIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  careToolContent: {
    flex: 1,
  },

  careToolTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  careToolDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  reportPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  infoCard: {
    backgroundColor: COLORS.secondaryFixed,
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: COLORS.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  infoText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  /* Modal */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 28,
  },

  modalHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  modalTitleText: {
    flex: 1,
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    color: COLORS.onSurface,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  instructionCard: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  instructionText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },

  inputLabel: {
    marginTop: 20,
    marginBottom: 8,
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: "800",
  },

  patientCodeInput: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 16,
    color: COLORS.onSurface,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  inputHint: {
    marginTop: 7,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },

  exampleCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  exampleContent: {
    flex: 1,
  },

  exampleLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "700",
  },

  exampleCode: {
    marginTop: 2,
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  disabledInput: {
    opacity: 0.6,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  cancelButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "800",
  },

  connectButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  connectButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  /* Bottom Navigation */

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 80,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    zIndex: 50,
  },

  navItem: {
    minWidth: 56,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  navIconContainer: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainerActive: {
    backgroundColor: COLORS.greenSoft,
  },

  navLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  navLabelInactive: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },

  navIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});