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
import * as ImagePicker from "expo-image-picker";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  type UserProfile,
} from "../../services/profile.service";
import { getToken } from "../../services/authStorage";
import { API_BASE_URL } from "../../constants/api";

type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
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
};

type CaregiverProfileScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onSchedule?: () => void;
  onAlerts?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
};

const COLORS = {
  background: "#FBF9F1",
  text: "#1B1C17",

  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",
  surfaceVariant: "#D9DDD4",
  surfaceHigh: "#E3E2D9",

  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",
  primaryFixed: "#B9D2B3",

  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  onSecondaryContainer: "#68472F",

  tertiary: "#A65D43",
  tertiaryContainer: "#E7C9B9",

  onSurfaceVariant: "#565A52",
  outline: "#72766D",
  outlineVariant: "#CDD2C8",

  error: "#9B3F32",
  errorContainer: "#E7C9B9",
  onErrorContainer: "#7F2F27",
};

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }

    return;
  }

  Alert.alert(title, message, [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Delete",
      style: "destructive",
      onPress: onConfirm,
    },
  ]);
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

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPatientFromConnection(
  item: any,
): ConnectedPatient | null {
  const patient =
    item?.patient ||
    item?.user ||
    item;

  if (!patient) {
    return null;
  }

  const id =
    patient.id ||
    patient.userId ||
    item?.patientId;

  if (!id) {
    return null;
  }

  return {
    id: String(id),
    name:
      patient.fullName ||
      patient.name ||
      "Patient",
    email: patient.email || "",
    age:
      patient.age !== null &&
      patient.age !== undefined
        ? String(patient.age)
        : "",
    phone: patient.phone || "",
    city: patient.city || "",
    profileImageUrl:
      patient.profileImageUrl || null,
    connectionId:
      item?.id ||
      item?.connectionId ||
      String(id),
  };
}

function extractPatients(result: any): ConnectedPatient[] {
  const candidates = [
    result?.data,
    result?.data?.patients,
    result?.data?.connections,
    result?.patients,
    result?.connections,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(getPatientFromConnection)
        .filter(Boolean) as ConnectedPatient[];
    }
  }

  return [];
}

export default function CaregiverProfileScreen({
  onBack,
  onHome,
  onSchedule,
  onAlerts,
  onProfile,
  onLogout,
}: CaregiverProfileScreenProps) {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [contacts, setContacts] =
    useState<EmergencyContact[]>([]);

  const [patients, setPatients] =
    useState<ConnectedPatient[]>([]);

  const [patientCode, setPatientCode] =
    useState("");

  const [connectPatientVisible, setConnectPatientVisible] =
    useState(false);

  const [connectingPatient, setConnectingPatient] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [editVisible, setEditVisible] =
    useState(false);

  const [photoVisible, setPhotoVisible] =
    useState(false);

  const [contactVisible, setContactVisible] =
    useState(false);

  const [passwordVisible, setPasswordVisible] =
    useState(false);

  const [editingContact, setEditingContact] =
    useState<EmergencyContact | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Edit profile fields                                                    */
  /* ---------------------------------------------------------------------- */

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [age, setAge] =
    useState("");

  const [city, setCity] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [relationship, setRelationship] =
    useState("Caregiver");

  /* ---------------------------------------------------------------------- */
  /* Password                                                               */
  /* ---------------------------------------------------------------------- */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Emergency contact                                                      */
  /* ---------------------------------------------------------------------- */

  const [contactName, setContactName] =
    useState("");

  const [contactRelationship, setContactRelationship] =
    useState("");

  const [contactPhone, setContactPhone] =
    useState("");

  /* ---------------------------------------------------------------------- */
  /* Load profile                                                           */
  /* ---------------------------------------------------------------------- */

  const loadEmergencyContacts = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/emergency-contacts`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          return;
        }

        const data = result.data;

        if (Array.isArray(data)) {
          setContacts(data);
        } else if (Array.isArray(data?.contacts)) {
          setContacts(data.contacts);
        }
      } catch {
        // Keep profile usable if contacts cannot be loaded.
      }
    },
    [],
  );

  const loadPatients = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/caregiver-connections/patients`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          return;
        }

        setPatients(extractPatients(result));
      } catch {
        // Profile remains available if patients cannot be loaded.
      }
    },
    [],
  );

  const loadProfile = useCallback(
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

        const data = await getMyProfile();

        setProfile(data);

        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setAge(
          data.age !== null &&
          data.age !== undefined
            ? String(data.age)
            : "",
        );
        setCity(data.city || "");
        setAddress(data.address || "");

        await Promise.all([
          loadEmergencyContacts(token),
          loadPatients(token),
        ]);
      } catch (error) {
        showMessage(
          "Profile",
          error instanceof Error
            ? error.message
            : "Unable to load your profile.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadEmergencyContacts, loadPatients],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ---------------------------------------------------------------------- */
  /* Edit profile                                                           */
  /* ---------------------------------------------------------------------- */

  const openEditProfile = () => {
    if (!profile) {
      return;
    }

    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setAge(
      profile.age !== null &&
      profile.age !== undefined
        ? String(profile.age)
        : "",
    );
    setCity(profile.city || "");
    setAddress(profile.address || "");

    setEditVisible(true);
  };

  const saveProfile = async () => {
    if (!fullName.trim()) {
      showMessage(
        "Missing information",
        "Please enter your full name.",
      );
      return;
    }

    const parsedAge = age.trim()
      ? Number(age)
      : null;

    if (
      parsedAge !== null &&
      (!Number.isFinite(parsedAge) ||
        parsedAge < 1 ||
        parsedAge > 120)
    ) {
      showMessage(
        "Invalid age",
        "Please enter an age between 1 and 120.",
      );
      return;
    }

    try {
      setSaving(true);

      const updated = await updateMyProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        age: parsedAge,
        city: city.trim() || null,
        address: address.trim() || null,
      });

      setProfile(updated);
      setEditVisible(false);

      showMessage(
        "Profile updated",
        "Your caregiver profile has been saved successfully.",
      );
    } catch (error) {
      showMessage(
        "Unable to save",
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Caregiver ↔ Patient connections                                        */
  /* ---------------------------------------------------------------------- */

  const connectPatient = async () => {
    const code = patientCode.trim().toUpperCase();

    if (!code) {
      showMessage(
        "Missing patient code",
        "Please enter the patient's SmritiCare patient code.",
      );
      return;
    }

    try {
      setConnectingPatient(true);

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
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to connect this patient.",
        );
      }

      setPatientCode("");
      setConnectPatientVisible(false);

      await loadPatients(token);

      showMessage(
        "Patient connected",
        "The patient has been connected to your caregiver account.",
      );
    } catch (error) {
      showMessage(
        "Unable to connect patient",
        error instanceof Error
          ? error.message
          : "Something went wrong while connecting the patient.",
      );
    } finally {
      setConnectingPatient(false);
    }
  };

  const disconnectPatient = (
    patient: ConnectedPatient,
  ) => {
    confirmAction(
      "Disconnect patient",
      `Are you sure you want to disconnect ${patient.name} from your caregiver account?`,
      async () => {
        try {
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
            },
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message ||
                "Unable to disconnect this patient.",
            );
          }

          await loadPatients(token);

          showMessage(
            "Patient disconnected",
            `${patient.name} is no longer connected to your caregiver account.`,
          );
        } catch (error) {
          showMessage(
            "Unable to disconnect patient",
            error instanceof Error
              ? error.message
              : "Something went wrong while disconnecting the patient.",
          );
        }
      },
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Profile photo                                                          */
  /* ---------------------------------------------------------------------- */

  const uploadPhoto = async (uri: string) => {
    try {
      setUploadingPhoto(true);

      const imageUrl =
        await uploadProfileImage(uri);

      const updated =
        await updateMyProfile({
          profileImageUrl: imageUrl,
        });

      setProfile(updated);
      setPhotoVisible(false);

      showMessage(
        "Photo updated",
        "Your caregiver profile photo has been updated.",
      );
    } catch (error) {
      showMessage(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload the profile photo.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const choosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          "Permission required",
          "Please allow photo library access.",
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (
        result.canceled ||
        !result.assets?.[0]?.uri
      ) {
        return;
      }

      await uploadPhoto(
        result.assets[0].uri,
      );
    } catch (error) {
      showMessage(
        "Photo error",
        error instanceof Error
          ? error.message
          : "Unable to select the photo.",
      );
    }
  };

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          "Permission required",
          "Please allow camera access.",
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (
        result.canceled ||
        !result.assets?.[0]?.uri
      ) {
        return;
      }

      await uploadPhoto(
        result.assets[0].uri,
      );
    } catch (error) {
      showMessage(
        "Camera error",
        error instanceof Error
          ? error.message
          : "Unable to take the photo.",
      );
    }
  };

  const removePhoto = () => {
    if (!profile?.profileImageUrl) {
      setPhotoVisible(false);
      return;
    }

    confirmAction(
      "Remove profile photo",
      "Are you sure you want to remove your profile photo?",
      async () => {
        try {
          setUploadingPhoto(true);

          const updated =
            await updateMyProfile({
              profileImageUrl: null,
            });

          setProfile(updated);
          setPhotoVisible(false);

          showMessage(
            "Photo removed",
            "Your profile photo has been removed.",
          );
        } catch (error) {
          showMessage(
            "Unable to remove photo",
            error instanceof Error
              ? error.message
              : "Something went wrong.",
          );
        } finally {
          setUploadingPhoto(false);
        }
      },
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Emergency contacts                                                     */
  /* ---------------------------------------------------------------------- */

  const openAddContact = () => {
    setEditingContact(null);
    setContactName("");
    setContactRelationship("");
    setContactPhone("");
    setContactVisible(true);
  };

  const openEditContact = (
    contact: EmergencyContact,
  ) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactRelationship(
      contact.relationship,
    );
    setContactPhone(contact.phone);
    setContactVisible(true);
  };

  const saveContact = async () => {
    if (!contactName.trim()) {
      showMessage(
        "Missing information",
        "Please enter the contact name.",
      );
      return;
    }

    if (!contactRelationship.trim()) {
      showMessage(
        "Missing information",
        "Please enter the relationship.",
      );
      return;
    }

    if (!contactPhone.trim()) {
      showMessage(
        "Missing information",
        "Please enter the phone number.",
      );
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const payload = {
        name: contactName.trim(),
        relationship:
          contactRelationship.trim(),
        phone: contactPhone.trim(),
      };

      const url = editingContact
        ? `${API_BASE_URL}/api/emergency-contacts/${editingContact.id}`
        : `${API_BASE_URL}/api/emergency-contacts`;

      const response = await fetch(url, {
        method: editingContact
          ? "PUT"
          : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save emergency contact.",
        );
      }

      setContactVisible(false);

      await loadEmergencyContacts(token);

      showMessage(
        editingContact
          ? "Contact updated"
          : "Contact added",
        editingContact
          ? "The emergency contact was updated."
          : "The emergency contact was added.",
      );
    } catch (error) {
      showMessage(
        "Unable to save contact",
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    }
  };

  const deleteContact = (
    contact: EmergencyContact,
  ) => {
    confirmAction(
      "Delete emergency contact",
      `Remove ${contact.name} from your emergency contacts?`,
      async () => {
        try {
          const token = await getToken();

          if (!token) {
            throw new Error(
              "Please log in again.",
            );
          }

          const response = await fetch(
            `${API_BASE_URL}/api/emergency-contacts/${contact.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            },
          );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Unable to delete contact.",
            );
          }

          await loadEmergencyContacts(token);

          showMessage(
            "Contact removed",
            `${contact.name} has been removed.`,
          );
        } catch (error) {
          showMessage(
            "Unable to delete contact",
            error instanceof Error
              ? error.message
              : "Something went wrong.",
          );
        }
      },
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Change password                                                        */
  /* ---------------------------------------------------------------------- */

  const changePassword = async () => {
    if (!currentPassword) {
      showMessage(
        "Missing information",
        "Enter your current password.",
      );
      return;
    }

    if (newPassword.length < 6) {
      showMessage(
        "Password too short",
        "Your new password must contain at least 6 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "Passwords do not match",
        "Please make sure both new passwords are the same.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Please log in again.",
        );
      }

      /*
       * This endpoint should be added to your auth controller:
       *
       * PUT /api/auth/change-password
       *
       * body:
       * {
       *   currentPassword,
       *   newPassword
       * }
       */
      const response = await fetch(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to change your password.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordVisible(false);

      showMessage(
        "Password changed",
        "Your password has been changed successfully.",
      );
    } catch (error) {
      showMessage(
        "Unable to change password",
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* ---------------------------------------------------------------------- */

  const initials = useMemo(
    () =>
      getInitials(
        profile?.fullName ||
          fullName ||
          "SmritiCare",
      ),
    [profile?.fullName, fullName],
  );

  const connectedPatientText =
    patients.length === 1
      ? "1 connected patient"
      : `${patients.length} connected patients`;

  const callContact = async (
    phone: string,
  ) => {
    try {
      await Linking.openURL(
        `tel:${phone}`,
      );
    } catch {
      showMessage(
        "Unable to call",
        "Calling is not available on this device.",
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingTitle}>
          Loading caregiver profile...
        </Text>

        <Text style={styles.loadingText}>
          Please wait while we get your information.
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.emptyProfileIcon}>
          <MaterialIcons
            name="person-outline"
            size={48}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.emptyProfileTitle}>
          Profile unavailable
        </Text>

        <Text style={styles.emptyProfileText}>
          We couldn't load your caregiver profile.
        </Text>

        <Pressable
          onPress={() => loadProfile()}
          style={styles.primaryButton}
        >
          <MaterialIcons
            name="refresh"
            size={20}
            color={COLORS.onPrimary}
          />

          <Text style={styles.primaryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={26}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.topTitle}>
              Caregiver Profile
            </Text>

            <Text style={styles.topSubtitle}>
              Your SmritiCare account
            </Text>
          </View>

          <Pressable
            onPress={openEditProfile}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <MaterialIcons
              name="edit"
              size={24}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        {/* Profile hero */}
        <View style={styles.heroCard}>
          <Pressable
            onPress={() =>
              setPhotoVisible(true)
            }
            style={styles.avatarWrapper}
          >
            {profile.profileImageUrl ? (
              <Image
                source={{
                  uri: profile.profileImageUrl,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text
                  style={styles.avatarInitials}
                >
                  {initials}
                </Text>
              </View>
            )}

            <View style={styles.cameraBadge}>
              <MaterialIcons
                name="photo-camera"
                size={17}
                color={COLORS.onPrimary}
              />
            </View>
          </Pressable>

          <Text style={styles.heroName}>
            {profile.fullName}
          </Text>

          <Text style={styles.heroEmail}>
            {profile.email}
          </Text>

          <View style={styles.roleBadge}>
            <MaterialIcons
              name="volunteer-activism"
              size={17}
              color={COLORS.primary}
            />

            <Text style={styles.roleBadgeText}>
              Caregiver
            </Text>
          </View>
        </View>

        {/* 2, 3, 4, 5 — Personal information */}
        <View style={styles.card}>
          <SectionHeader
            icon="person"
            title="Personal Information"
            subtitle="Your caregiver details"
          />

          <View style={styles.divider} />

          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={profile.fullName}
          />

          <InfoRow
            icon="email"
            label="Email"
            value={profile.email}
          />

          <InfoRow
            icon="phone"
            label="Phone"
            value={
              profile.phone ||
              "Not provided"
            }
          />

          <InfoRow
            icon="badge"
            label="Role / Relationship"
            value={relationship}
          />

          <InfoRow
            icon="cake"
            label="Age"
            value={
              profile.age !== null &&
              profile.age !== undefined
                ? `${profile.age} years`
                : "Not provided"
            }
          />

          <InfoRow
            icon="location-city"
            label="City"
            value={
              profile.city ||
              "Not provided"
            }
          />

          <InfoRow
            icon="home"
            label="Address"
            value={
              profile.address ||
              "Not provided"
            }
          />
        </View>

        {/* 6 — Connected patients */}
        <View style={styles.card}>
          <SectionHeader
            icon="people"
            title="Connected Patients"
            subtitle={connectedPatientText}
          />

          <View style={styles.divider} />

          {patients.length === 0 ? (
            <View style={styles.emptyPatients}>
              <MaterialIcons
                name="people-outline"
                size={42}
                color={COLORS.outline}
              />

              <Text
                style={styles.emptyPatientsTitle}
              >
                No connected patients
              </Text>

              <Text
                style={styles.emptyPatientsText}
              >
                Patients connected through your
                caregiver account will appear here.
              </Text>
            </View>
          ) : (
            patients.map((patient) => (
              <View
                key={patient.connectionId}
                style={styles.patientRow}
              >
                {patient.profileImageUrl ? (
                  <Image
                    source={{
                      uri: patient.profileImageUrl,
                    }}
                    style={styles.patientAvatar}
                  />
                ) : (
                  <View
                    style={
                      styles.patientAvatarPlaceholder
                    }
                  >
                    <Text
                      style={
                        styles.patientAvatarText
                      }
                    >
                      {getInitials(
                        patient.name,
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.patientInfo}>
                  <Text
                    style={styles.patientName}
                  >
                    {patient.name}
                  </Text>

                  <Text
                    style={styles.patientEmail}
                    numberOfLines={1}
                  >
                    {patient.email ||
                      "Email not provided"}
                  </Text>

                  <View
                    style={styles.patientMeta}
                  >
                    {patient.age ? (
                      <Text
                        style={
                          styles.patientMetaText
                        }
                      >
                        {patient.age} years
                      </Text>
                    ) : null}

                    {patient.city ? (
                      <Text
                        style={
                          styles.patientMetaText
                        }
                      >
                        • {patient.city}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View
                  style={styles.patientActions}
                >
                  <View
                    style={styles.connectedIndicator}
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={19}
                      color={COLORS.primary}
                    />

                    <Text
                      style={
                        styles.connectedText
                      }
                    >
                      Connected
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      disconnectPatient(patient)
                    }
                    style={styles.disconnectButton}
                  >
                    <MaterialIcons
                      name="link-off"
                      size={16}
                      color={COLORS.error}
                    />

                    <Text
                      style={
                        styles.disconnectButtonText
                      }
                    >
                      Disconnect
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Pressable
            onPress={() =>
              loadProfile(true)
            }
            style={styles.outlineButton}
            disabled={refreshing}
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

            <Text
              style={styles.outlineButtonText}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh Patients"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setPatientCode("");
              setConnectPatientVisible(true);
            }}
            style={styles.addPatientButton}
          >
            <MaterialIcons
              name="person-add"
              size={21}
              color={COLORS.onPrimary}
            />

            <Text
              style={styles.addPatientButtonText}
            >
              Add Patient
            </Text>
          </Pressable>
        </View>

        {/* 7 — Edit profile */}
        <View style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <MaterialIcons
              name="edit"
              size={23}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Edit Profile
            </Text>

            <Text
              style={styles.actionDescription}
            >
              Update your name, phone, address and other
              personal information.
            </Text>
          </View>

          <Pressable
            onPress={openEditProfile}
            style={styles.actionButton}
          >
            <Text
              style={styles.actionButtonText}
            >
              Edit
            </Text>
          </Pressable>
        </View>

        {/* 8 — Change password */}
        <View style={styles.card}>
          <SectionHeader
            icon="lock"
            title="Security"
            subtitle="Protect your SmritiCare account"
          />

          <View style={styles.divider} />

          <Pressable
            onPress={() =>
              setPasswordVisible(true)
            }
            style={styles.securityButton}
          >
            <View style={styles.securityIcon}>
              <MaterialIcons
                name="lock-reset"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.securityContent}>
              <Text
                style={styles.securityTitle}
              >
                Change Password
              </Text>

              <Text
                style={styles.securityText}
              >
                Update your account password securely.
              </Text>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={26}
              color={COLORS.secondary}
            />
          </Pressable>
        </View>

        {/* 10 — Emergency contacts */}
        <View style={styles.card}>
          <SectionHeader
            icon="emergency"
            title="Emergency Contacts"
            subtitle="Trusted people who can help"
          />

          <View style={styles.divider} />

          {contacts.length === 0 ? (
            <View style={styles.emptyContacts}>
              <MaterialIcons
                name="contacts"
                size={40}
                color={COLORS.outline}
              />

              <Text
                style={styles.emptyContactsTitle}
              >
                No emergency contacts
              </Text>

              <Text
                style={styles.emptyContactsText}
              >
                Add a trusted person for quick access
                during an emergency.
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <View
                key={contact.id}
                style={styles.contactRow}
              >
                <View
                  style={styles.contactAvatar}
                >
                  <Text
                    style={
                      styles.contactInitials
                    }
                  >
                    {getInitials(
                      contact.name,
                    )}
                  </Text>
                </View>

                <View style={styles.contactInfo}>
                  <Text
                    style={styles.contactName}
                  >
                    {contact.name}
                  </Text>

                  <Text
                    style={
                      styles.contactRelationship
                    }
                  >
                    {contact.relationship}
                  </Text>

                  <Text
                    style={styles.contactPhone}
                  >
                    {contact.phone}
                  </Text>
                </View>

                <View
                  style={styles.contactActions}
                >
                  <Pressable
                    onPress={() =>
                      callContact(
                        contact.phone,
                      )
                    }
                    style={
                      styles.smallIconButton
                    }
                  >
                    <MaterialIcons
                      name="call"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      openEditContact(
                        contact,
                      )
                    }
                    style={
                      styles.smallIconButton
                    }
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      deleteContact(
                        contact,
                      )
                    }
                    style={
                      styles.smallIconButton
                    }
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={21}
                      color={COLORS.error}
                    />
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Pressable
            onPress={openAddContact}
            style={styles.outlineButton}
          >
            <MaterialIcons
              name="person-add"
              size={21}
              color={COLORS.primary}
            />

            <Text
              style={styles.outlineButtonText}
            >
              Add Emergency Contact
            </Text>
          </Pressable>
        </View>

        {/* Privacy & Trust */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <MaterialIcons
              name="verified-user"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>
              Privacy & Trust
            </Text>

            <Text style={styles.privacyText}>
              SmritiCare only shows patients connected
              to your caregiver account. Your account
              information is protected through authenticated
              access.
            </Text>
          </View>
        </View>

        {/* 9 — Logout */}
        <Pressable
          onPress={() => {
            if (!onLogout) {
              showMessage(
                "Sign Out",
                "The sign-out action is not connected yet.",
              );
              return;
            }

            confirmAction(
              "Sign Out",
              "Are you sure you want to sign out of your caregiver account?",
              onLogout,
            );
          }}
          style={styles.logoutButton}
        >
          <MaterialIcons
            name="logout"
            size={22}
            color={COLORS.error}
          />

          <Text style={styles.logoutText}>
            Sign Out
          </Text>
        </Pressable>

        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoTitle}>
            Account Information
          </Text>

          <InfoRow
            icon="email"
            label="Email"
            value={profile.email}
          />

          <InfoRow
            icon="calendar-month"
            label="Member Since"
            value={formatDate(
              profile.createdAt,
            )}
          />

          <InfoRow
            icon="update"
            label="Last Updated"
            value={formatDate(
              profile.updatedAt,
            )}
          />
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNavigation}>
        <BottomNavItem
          icon="home"
          label="Home"
          onPress={onHome}
        />

        <BottomNavItem
          icon="notifications-active"
          label="Remind"
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
          active
          onPress={onProfile}
        />
      </View>

      {/* ================================================================== */}
      {/* Edit Profile Modal                                                 */}
      {/* ================================================================== */}

      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setEditVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title="Edit Profile"
              subtitle="Update your caregiver information"
              onClose={() =>
                setEditVisible(false)
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.modalScroll
              }
            >
              <InputField
                label="Full Name *"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />

              <InputField
                label="Email"
                value={profile.email}
                onChangeText={() => {}}
                placeholder="Email"
                editable={false}
              />

              <InputField
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />

              <InputField
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="numeric"
              />

              <InputField
                label="Caregiver Relationship / Role"
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g. Daughter, Son, Nurse"
              />

              <InputField
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="Enter your city"
              />

              <InputField
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() =>
                    setEditVisible(false)
                  }
                  disabled={saving}
                  style={styles.cancelButton}
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveProfile}
                  disabled={saving}
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="save"
                        size={20}
                        color={COLORS.onPrimary}
                      />

                      <Text
                        style={
                          styles.saveButtonText
                        }
                      >
                        Save
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================================== */}
      {/* Connect Patient Modal                                              */}
      {/* ================================================================== */}

      <Modal
        visible={connectPatientVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setConnectPatientVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title="Add Patient"
              subtitle="Connect a patient using their SmritiCare patient code"
              onClose={() =>
                setConnectPatientVisible(false)
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <View style={styles.connectInfoCard}>
                <MaterialIcons
                  name="info-outline"
                  size={23}
                  color={COLORS.primary}
                />

                <Text style={styles.connectInfoText}>
                  Ask the patient for their permanent SmritiCare
                  patient code. It normally starts with
                  <Text style={styles.connectCodeHighlight}>
                    {" "}SC-PAT-
                  </Text>.
                </Text>
              </View>

              <InputField
                label="Patient Code *"
                value={patientCode}
                onChangeText={(value) =>
                  setPatientCode(value.toUpperCase())
                }
                placeholder="SC-PAT-XXXXXXXX"
                autoCapitalize="characters"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => {
                    setPatientCode("");
                    setConnectPatientVisible(false);
                  }}
                  disabled={connectingPatient}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={connectPatient}
                  disabled={connectingPatient}
                  style={[
                    styles.saveButton,
                    connectingPatient &&
                      styles.disabledButton,
                  ]}
                >
                  {connectingPatient ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="link"
                        size={20}
                        color={COLORS.onPrimary}
                      />

                      <Text style={styles.saveButtonText}>
                        Connect Patient
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================================== */}
      {/* Photo Modal                                                        */}
      {/* ================================================================== */}

      <Modal
        visible={photoVisible}
        animationType="fade"
        transparent
        onRequestClose={() =>
          setPhotoVisible(false)
        }
      >
        <View style={styles.photoOverlay}>
          <View style={styles.photoContainer}>
            <View style={styles.photoPreview}>
              {profile.profileImageUrl ? (
                <Image
                  source={{
                    uri: profile.profileImageUrl,
                  }}
                  style={styles.photoPreviewImage}
                />
              ) : (
                <View
                  style={
                    styles.photoPreviewPlaceholder
                  }
                >
                  <Text
                    style={
                      styles.photoPreviewInitials
                    }
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.photoTitle}>
              Profile Photo
            </Text>

            <Text style={styles.photoDescription}>
              Choose a photo from your gallery or take
              a new picture.
            </Text>

            {uploadingPhoto ? (
              <View style={styles.uploadingBox}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                />

                <Text
                  style={styles.uploadingText}
                >
                  Saving photo...
                </Text>
              </View>
            ) : (
              <>
                <PhotoAction
                  icon="photo-library"
                  title="Choose from Gallery"
                  onPress={choosePhoto}
                />

                <PhotoAction
                  icon="photo-camera"
                  title="Take a Photo"
                  onPress={takePhoto}
                />

                {profile.profileImageUrl ? (
                  <PhotoAction
                    icon="delete-outline"
                    title="Remove Photo"
                    destructive
                    onPress={removePhoto}
                  />
                ) : null}

                <Pressable
                  onPress={() =>
                    setPhotoVisible(false)
                  }
                  style={styles.photoCancel}
                >
                  <Text
                    style={
                      styles.photoCancelText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ================================================================== */}
      {/* Password Modal                                                     */}
      {/* ================================================================== */}

      <Modal
        visible={passwordVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setPasswordVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title="Change Password"
              subtitle="Keep your caregiver account secure"
              onClose={() =>
                setPasswordVisible(false)
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.modalScroll
              }
            >
              <InputField
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
              />

              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />

              <InputField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />

              <View style={styles.passwordTip}>
                <MaterialIcons
                  name="security"
                  size={21}
                  color={COLORS.primary}
                />

                <Text
                  style={styles.passwordTipText}
                >
                  Use a strong password that you do not
                  share with anyone.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() =>
                    setPasswordVisible(false)
                  }
                  disabled={changingPassword}
                  style={styles.cancelButton}
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={changePassword}
                  disabled={changingPassword}
                  style={[
                    styles.saveButton,
                    changingPassword &&
                      styles.disabledButton,
                  ]}
                >
                  {changingPassword ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="lock-reset"
                        size={20}
                        color={COLORS.onPrimary}
                      />

                      <Text
                        style={
                          styles.saveButtonText
                        }
                      >
                        Change Password
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================================== */}
      {/* Emergency Contact Modal                                            */}
      {/* ================================================================== */}

      <Modal
        visible={contactVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setContactVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title={
                editingContact
                  ? "Edit Contact"
                  : "Add Emergency Contact"
              }
              subtitle="Keep a trusted person close"
              onClose={() =>
                setContactVisible(false)
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.modalScroll
              }
            >
              <InputField
                label="Name *"
                value={contactName}
                onChangeText={setContactName}
                placeholder="Contact name"
              />

              <InputField
                label="Relationship *"
                value={contactRelationship}
                onChangeText={
                  setContactRelationship
                }
                placeholder="e.g. Spouse, Daughter, Son"
              />

              <InputField
                label="Phone *"
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() =>
                    setContactVisible(false)
                  }
                  style={styles.cancelButton}
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveContact}
                  style={styles.saveButton}
                >
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={COLORS.onPrimary}
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    {editingContact
                      ? "Update"
                      : "Add Contact"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ========================================================================== */
/* Reusable Components                                                        */
/* ========================================================================== */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <MaterialIcons
          name={icon}
          size={23}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons
        name={icon}
        size={21}
        color={COLORS.secondary}
      />

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value || "Not provided"}
        </Text>
      </View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  secureTextEntry = false,
  keyboardType,
  multiline = false,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: any;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.outline}
        editable={editable}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        numberOfLines={multiline ? 4 : 1}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.disabledInput,
        ]}
      />
    </View>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.modalHeader}>
      <View style={styles.modalHeaderText}>
        <Text style={styles.modalTitle}>
          {title}
        </Text>

        <Text style={styles.modalSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onClose}
        style={styles.closeButton}
      >
        <MaterialIcons
          name="close"
          size={24}
          color={COLORS.text}
        />
      </Pressable>
    </View>
  );
}

function PhotoAction({
  icon,
  title,
  onPress,
  destructive = false,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.photoAction,
        destructive &&
          styles.photoActionDestructive,
      ]}
    >
      <MaterialIcons
        name={icon}
        size={23}
        color={
          destructive
            ? COLORS.error
            : COLORS.primary
        }
      />

      <Text
        style={[
          styles.photoActionText,
          destructive &&
            styles.photoActionTextDestructive,
        ]}
      >
        {title}
      </Text>
    </Pressable>
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
      style={styles.navItem}
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
          styles.navText,
          active
            ? styles.navTextActive
            : styles.navTextInactive,
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 16,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingTitle: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
  },

  loadingText: {
    marginTop: 6,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    textAlign: "center",
  },

  emptyProfileIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyProfileTitle: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "800",
  },

  emptyProfileText: {
    marginTop: 6,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    textAlign: "center",
  },

  primaryButton: {
    marginTop: 20,
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "800",
  },

  /* Header */

  topBar: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },

  topTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
  },

  topSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },

  /* Hero */

  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingVertical: 25,
    alignItems: "center",
  },

  avatarWrapper: {
    position: "relative",
  },

  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: COLORS.primaryFixed,
  },

  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.primaryFixed,
  },

  avatarInitials: {
    color: COLORS.onPrimaryContainer,
    fontSize: 35,
    fontWeight: "900",
  },

  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
  },

  heroName: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "800",
  },

  heroEmail: {
    marginTop: 3,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },

  roleBadge: {
    marginTop: 11,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  roleBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  /* Cards */

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 17,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  sectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 14,
  },

  infoRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 5,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "700",
  },

  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  /* Patients */

  emptyPatients: {
    alignItems: "center",
    paddingVertical: 20,
  },

  emptyPatientsTitle: {
    marginTop: 9,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  emptyPatientsText: {
    marginTop: 5,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  patientRow: {
    minHeight: 78,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  patientAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },

  patientAvatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  patientAvatarText: {
    color: COLORS.onPrimaryContainer,
    fontSize: 16,
    fontWeight: "900",
  },

  patientInfo: {
    flex: 1,
    minWidth: 0,
  },

  patientName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },

  patientEmail: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },

  patientMeta: {
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
  },

  patientMetaText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "600",
  },

  patientActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 7,
  },

  connectedIndicator: {
    alignItems: "center",
    gap: 2,
  },

  connectedText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
  },

  disconnectButton: {
    minHeight: 31,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: COLORS.errorContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  disconnectButtonText: {
    color: COLORS.error,
    fontSize: 9,
    fontWeight: "800",
  },

  outlineButton: {
    minHeight: 47,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  addPatientButton: {
    minHeight: 50,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  addPatientButtonText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "800",
  },

  connectInfoCard: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 16,
  },

  connectInfoText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },

  connectCodeHighlight: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  /* Actions */

  actionCard: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  actionDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },

  actionButton: {
    paddingHorizontal: 13,
    minHeight: 38,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "800",
  },

  /* Security */

  securityButton: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  securityIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },

  securityText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 3,
  },

  /* Contacts */

  emptyContacts: {
    alignItems: "center",
    paddingVertical: 17,
  },

  emptyContactsTitle: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  emptyContactsText: {
    marginTop: 5,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  contactRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  contactInitials: {
    color: COLORS.onSecondaryContainer,
    fontSize: 14,
    fontWeight: "900",
  },

  contactInfo: {
    flex: 1,
    minWidth: 0,
  },

  contactName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  contactRelationship: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 2,
  },

  contactPhone: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },

  contactActions: {
    flexDirection: "row",
    gap: 3,
  },

  smallIconButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Privacy */

  privacyCard: {
    backgroundColor: COLORS.primaryFixed,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  privacyIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    color: COLORS.primaryContainer,
    fontSize: 16,
    fontWeight: "800",
  },

  privacyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  /* Logout */

  logoutButton: {
    minHeight: 53,
    borderRadius: 15,
    backgroundColor: COLORS.errorContainer,
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "800",
  },

  accountInfo: {
    paddingTop: 5,
  },

  accountInfoTitle: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  /* Bottom nav */

  bottomNavigation: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 80,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 3,
    zIndex: 50,
  },

  navItem: {
    minWidth: 58,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainer: {
    width: 43,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainerActive: {
    backgroundColor: COLORS.surfaceLow,
  },

  navText: {
    fontSize: 11,
    marginTop: 2,
  },

  navTextActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  navTextInactive: {
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

  /* Modals */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,38,30,0.48)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "92%",
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 25,
  },

  modalHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
  },

  input: {
    minHeight: 53,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 105,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  disabledInput: {
    opacity: 0.55,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  cancelButton: {
    flex: 1,
    minHeight: 53,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "800",
  },

  saveButton: {
    flex: 1,
    minHeight: 53,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  saveButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.55,
  },

  passwordTip: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },

  passwordTipText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },

  /* Photo */

  photoOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,38,30,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  photoContainer: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 22,
    alignItems: "center",
  },

  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.primaryFixed,
  },

  photoPreviewImage: {
    width: "100%",
    height: "100%",
  },

  photoPreviewPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  photoPreviewInitials: {
    color: COLORS.onPrimaryContainer,
    fontSize: 36,
    fontWeight: "900",
  },

  photoTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
  },

  photoDescription: {
    marginTop: 5,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  photoAction: {
    width: "100%",
    minHeight: 52,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },

  photoActionDestructive: {
    backgroundColor: COLORS.errorContainer,
  },

  photoActionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  photoActionTextDestructive: {
    color: COLORS.error,
  },

  photoCancel: {
    width: "100%",
    minHeight: 48,
    marginTop: 9,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  photoCancelText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "700",
  },

  uploadingBox: {
    alignItems: "center",
    paddingVertical: 22,
  },

  uploadingText: {
    marginTop: 10,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "700",
  },
});