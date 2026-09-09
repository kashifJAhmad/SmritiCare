import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
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
import * as Clipboard from "expo-clipboard";
import * as Location from "expo-location";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  type UserProfile,
} from "../../services/profile.service";
import { getToken } from "../../services/authStorage";

type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

import { API_BASE_URL } from "../../constants/api";

const COLORS = {
  background: "#F4FAFF",
  primary: "#00450D",
  primaryContainer: "#1B5E20",
  onPrimaryContainer: "#90D689",
  surfaceLow: "#F6F3F2",
  surface: "#F0EDED",
  surfaceHigh: "#EAE7E7",
  surfaceHighest: "#E5E2E1",
  secondary: "#556158",
  secondaryFixed: "#D9E6DA",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  outline: "#717A6D",
  outlineVariant: "#C0C9BB",
  onSurface: "#1B1C1C",
  onSurfaceVariant: "#41493E",
  white: "#FFFFFF",
};

const BODY_FONT = Platform.select({
  ios: "Atkinson Hyperlegible",
  android: "sans-serif",
  web: "Atkinson Hyperlegible Next",
  default: "sans-serif",
});

const HEADING_FONT = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "Plus Jakarta Sans",
  default: "sans-serif",
});

function formatDateForInput(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "Not provided";

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

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "SC";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

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
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    const confirmed = window.confirm(`${title}\n\n${message}`);

    if (confirmed) {
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

export default function ProfileScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
}: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const [editingContact, setEditingContact] =
    useState<EmergencyContact | null>(null);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const [language, setLanguage] = useState("English");
  const [textSize, setTextSize] = useState("Normal");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverAccess, setCaregiverAccess] = useState(false);
  const [gpsSharing, setGpsSharing] = useState(false);

  const locationSubscriptionRef =
    useRef<Location.LocationSubscription | null>(null);
  const gpsStartingRef = useRef(false);

  const [caregiverConnection, setCaregiverConnection] = useState<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null>(null);
  const [connectCaregiverVisible, setConnectCaregiverVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [connectingCaregiver, setConnectingCaregiver] = useState(false);

  const [patientCode, setPatientCode] = useState("");
  const [loadingPatientCode, setLoadingPatientCode] = useState(false);
  const [copyingPatientCode, setCopyingPatientCode] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactRelationship, setContactRelationship] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const stopLocationSharing = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  const sendLocationToServer = useCallback(
    async (location: Location.LocationObject) => {
      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/location`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to share your location."
        );
      }
    },
    []
  );

  const removeLocationFromServer = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(`${API_BASE_URL}/api/location`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Unable to stop location sharing."
      );
    }
  }, []);

  const startLocationSharing = useCallback(
    async (showErrors = true) => {
      if (gpsStartingRef.current || locationSubscriptionRef.current) {
        return true;
      }

      if (Platform.OS === "web") {
        if (showErrors) {
          showMessage(
            "GPS unavailable",
            "GPS location sharing is currently supported on Android and iOS."
          );
        }
        return false;
      }

      try {
        gpsStartingRef.current = true;

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          if (showErrors) {
            showMessage(
              "Location permission required",
              "Please allow SmritiCare to access your location so your connected caregiver can see your current location."
            );
          }
          return false;
        }

        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

        await sendLocationToServer(currentLocation);

        locationSubscriptionRef.current =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 60000,
              distanceInterval: 50,
            },
            async (location) => {
              try {
                await sendLocationToServer(location);
              } catch (error) {
                console.warn(
                  "SmritiCare GPS update failed:",
                  error
                );
              }
            }
          );

        return true;
      } catch (error) {
        if (showErrors) {
          showMessage(
            "Unable to share location",
            error instanceof Error
              ? error.message
              : "Unable to get or share your current location."
          );
        }
        return false;
      } finally {
        gpsStartingRef.current = false;
      }
    },
    [sendLocationToServer]
  );

  const handleGpsSharingChange = useCallback(
    async (value: boolean) => {
      if (!value) {
        stopLocationSharing();
        setGpsSharing(false);

        try {
          const updated = await updateMyProfile({
            gpsSharing: false,
          });

          setProfile(updated);
          await removeLocationFromServer();

          showMessage(
            "GPS sharing disabled",
            "Your location is no longer being shared with your caregiver."
          );
        } catch (error) {
          showMessage(
            "Unable to disable GPS sharing",
            error instanceof Error
              ? error.message
              : "Could not disable location sharing."
          );
        }

        return;
      }

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          setGpsSharing(false);

          showMessage(
            "Location permission required",
            "GPS sharing was not enabled because location permission was not granted."
          );
          return;
        }

        const updated = await updateMyProfile({
          gpsSharing: true,
        });

        setProfile(updated);
        setGpsSharing(true);

        const started = await startLocationSharing(true);

        if (!started) {
          stopLocationSharing();

          await updateMyProfile({
            gpsSharing: false,
          });

          setGpsSharing(false);

          try {
            await removeLocationFromServer();
          } catch {
            // No location may have been stored.
          }
        } else {
          showMessage(
            "GPS sharing enabled",
            "Your current location is now being shared with your connected caregiver."
          );
        }
      } catch (error) {
        stopLocationSharing();
        setGpsSharing(false);

        try {
          const reverted = await updateMyProfile({
            gpsSharing: false,
          });
          setProfile(reverted);
        } catch {
          // Keep local state disabled if rollback fails.
        }

        showMessage(
          "Unable to enable GPS",
          error instanceof Error
            ? error.message
            : "Could not enable location sharing."
        );
      }
    },
    [
      removeLocationFromServer,
      startLocationSharing,
      stopLocationSharing,
    ]
  );

  const loadConnectedCaregiver = async (token?: string) => {
    try {
      const authToken = token || (await getToken());

      if (!authToken) return;

      const response = await fetch(
        `${API_BASE_URL}/api/caregiver-connections/caregiver`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setCaregiverConnection(null);
        return;
      }

      const data = result.data;

      const connection = data?.connection || data;
      const caregiver = connection?.caregiver || data?.caregiver || connection;

      if (caregiver && (caregiver.id || connection?.caregiverId)) {
        setCaregiverConnection({
          id: connection?.id || caregiver.id || connection.caregiverId,
          name:
            caregiver.fullName ||
            caregiver.name ||
            caregiver.caregiverName ||
            "Connected Caregiver",
          email: caregiver.email || undefined,
          phone: caregiver.phone || undefined,
        });
      } else {
        setCaregiverConnection(null);
      }
    } catch {
      setCaregiverConnection(null);
    }
  };

  const loadPatientCode = async (token?: string) => {
    try {
      setLoadingPatientCode(true);

      const authToken = token || (await getToken());

      if (!authToken) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/caregiver-connections/patient-code`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to get your patient code."
        );
      }

      setPatientCode(
        result.patientCode ||
          result.data?.patientCode ||
          ""
      );
    } catch (error) {
      setPatientCode("");

      showMessage(
        "Patient code",
        error instanceof Error
          ? error.message
          : "Unable to get your patient code."
      );
    } finally {
      setLoadingPatientCode(false);
    }
  };

  const copyPatientCode = async () => {
    if (!patientCode) {
      await loadPatientCode();
      return;
    }

    try {
      setCopyingPatientCode(true);

      await Clipboard.setStringAsync(patientCode);

      showMessage(
        "Code copied",
        "Your patient code has been copied. Share it with your caregiver."
      );
    } catch (error) {
      showMessage(
        "Unable to copy",
        error instanceof Error
          ? error.message
          : "Unable to copy your patient code."
      );
    } finally {
      setCopyingPatientCode(false);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const data = await getMyProfile();

      setProfile(data);

      setFullName(data.fullName || "");
      setAge(data.age !== null && data.age !== undefined ? String(data.age) : "");
      setPhone(data.phone || "");
      setDateOfBirth(formatDateForInput(data.dateOfBirth));
      setGender(data.gender || "");
      setBloodGroup(data.bloodGroup || "");
      setAddress(data.address || "");
      setCity(data.city || "");
      setMedicalNotes(data.medicalNotes || "");

      setLanguage(data.language || "English");
      setTextSize(data.textSize || "Normal");
      setCaregiverName(data.caregiverName || "");
      setCaregiverAccess(Boolean(data.caregiverAccess));
      setGpsSharing(Boolean(data.gpsSharing));

      await loadEmergencyContacts(token);
      await loadConnectedCaregiver(token);
      await loadPatientCode(token);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load your profile.";

      showMessage("Profile", message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmergencyContacts = async (token?: string) => {
    try {
      const authToken = token || (await getToken());

      if (!authToken) return;

      const response = await fetch(
        `${API_BASE_URL}/api/emergency-contacts`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
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
      } else {
        setContacts([]);
      }
    } catch {
      setContacts([]);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profile?.gpsSharing) {
      stopLocationSharing();
      return;
    }

    startLocationSharing(false);

    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active" && profile.gpsSharing) {
          startLocationSharing(false);
        }
      }
    );

    return () => {
      subscription.remove();
      stopLocationSharing();
    };
  }, [
    profile?.gpsSharing,
    startLocationSharing,
    stopLocationSharing,
  ]);

  const initials = useMemo(
    () => getInitials(profile?.fullName || fullName || "SmritiCare"),
    [profile?.fullName, fullName]
  );

  const saveProfile = async () => {
    if (!fullName.trim()) {
      showMessage("Missing information", "Please enter your full name.");
      return;
    }

    try {
      setSaving(true);

      const parsedAge = age.trim() ? Number(age) : null;

      if (
        parsedAge !== null &&
        (!Number.isFinite(parsedAge) ||
          parsedAge < 1 ||
          parsedAge > 120)
      ) {
        showMessage(
          "Invalid age",
          "Please enter an age between 1 and 120."
        );
        return;
      }

      const updated = await updateMyProfile({
        fullName: fullName.trim(),
        age: parsedAge,
        phone: phone.trim() || null,
        dateOfBirth: dateOfBirth.trim() || null,
        gender: gender.trim() || null,
        bloodGroup: bloodGroup.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        medicalNotes: medicalNotes.trim() || null,
        language,
        textSize,
        caregiverName: caregiverName.trim() || null,
        caregiverAccess,
        gpsSharing,
      });

      setProfile(updated);
      setEditProfileVisible(false);

      showMessage(
        "Profile updated",
        "Your profile information has been saved successfully."
      );
    } catch (error) {
      showMessage(
        "Unable to save",
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const connectCaregiver = async () => {
    const code = inviteCode.trim().toUpperCase();

    if (!code) {
      showMessage(
        "Invite code required",
        "Please enter the invite code provided by your caregiver."
      );
      return;
    }

    try {
      setConnectingCaregiver(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/caregiver-connections/connect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inviteCode: code,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to connect to the caregiver."
        );
      }

      setInviteCode("");
      setConnectCaregiverVisible(false);

      await loadProfile();

      showMessage(
        "Caregiver connected",
        "Your caregiver has been connected to your SmritiCare account successfully."
      );
    } catch (error) {
      showMessage(
        "Unable to connect",
        error instanceof Error
          ? error.message
          : "Something went wrong while connecting your caregiver."
      );
    } finally {
      setConnectingCaregiver(false);
    }
  };

  const choosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          "Permission required",
          "Please allow photo library access to choose a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      await uploadPhoto(result.assets[0].uri);
    } catch (error) {
      showMessage(
        "Photo error",
        error instanceof Error
          ? error.message
          : "Unable to select the photo."
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
          "Please allow camera access to take a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      await uploadPhoto(result.assets[0].uri);
    } catch (error) {
      showMessage(
        "Camera error",
        error instanceof Error
          ? error.message
          : "Unable to take the photo."
      );
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setUploadingPhoto(true);

      const imageUrl = await uploadProfileImage(uri);

      const updated = await updateMyProfile({
        profileImageUrl: imageUrl,
      });

      setProfile(updated);
      setPhotoModalVisible(false);

      showMessage(
        "Profile photo updated",
        "Your new profile photo has been saved."
      );
    } catch (error) {
      showMessage(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload your profile photo."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    if (!profile?.profileImageUrl) {
      setPhotoModalVisible(false);
      return;
    }

    confirmAction(
      "Remove profile photo",
      "Are you sure you want to remove your profile photo?",
      async () => {
        try {
          setUploadingPhoto(true);

          const updated = await updateMyProfile({
            profileImageUrl: null,
          });

          setProfile(updated);
          setPhotoModalVisible(false);

          showMessage(
            "Photo removed",
            "Your profile photo has been removed."
          );
        } catch (error) {
          showMessage(
            "Unable to remove photo",
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        } finally {
          setUploadingPhoto(false);
        }
      }
    );
  };

  const openAddContact = () => {
    setEditingContact(null);
    setContactName("");
    setContactRelationship("");
    setContactPhone("");
    setContactModalVisible(true);
  };

  const openEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactRelationship(contact.relationship);
    setContactPhone(contact.phone);
    setContactModalVisible(true);
  };

  const saveContact = async () => {
    if (!contactName.trim()) {
      showMessage("Missing information", "Please enter the contact name.");
      return;
    }

    if (!contactPhone.trim()) {
      showMessage("Missing information", "Please enter the phone number.");
      return;
    }

    if (!contactRelationship.trim()) {
      showMessage(
        "Missing information",
        "Please enter the relationship."
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
        relationship: contactRelationship.trim(),
        phone: contactPhone.trim(),
      };

      const url = editingContact
        ? `${API_BASE_URL}/api/emergency-contacts/${editingContact.id}`
        : `${API_BASE_URL}/api/emergency-contacts`;

      const response = await fetch(url, {
        method: editingContact ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save emergency contact."
        );
      }

      setContactModalVisible(false);

      await loadEmergencyContacts(token);

      showMessage(
        editingContact ? "Contact updated" : "Contact added",
        editingContact
          ? "The emergency contact has been updated."
          : "The emergency contact has been added."
      );
    } catch (error) {
      showMessage(
        "Unable to save contact",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  const deleteContact = (contact: EmergencyContact) => {
    confirmAction(
      "Delete emergency contact",
      `Remove ${contact.name} from your emergency contacts?`,
      async () => {
        try {
          const token = await getToken();

          if (!token) {
            throw new Error("Please log in again.");
          }

          const response = await fetch(
            `${API_BASE_URL}/api/emergency-contacts/${contact.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message || "Unable to delete contact."
            );
          }

          await loadEmergencyContacts(token);

          showMessage(
            "Contact removed",
            `${contact.name} has been removed from your emergency contacts.`
          );
        } catch (error) {
          showMessage(
            "Unable to delete contact",
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        }
      }
    );
  };

  const renderSectionHeader = (
    icon: keyof typeof MaterialIcons.glyphMap,
    title: string,
    subtitle?: string
  ) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <MaterialIcons
          name={icon}
          size={23}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderInfoRow = (
    icon: keyof typeof MaterialIcons.glyphMap,
    label: string,
    value: string
  ) => (
    <View style={styles.infoRow}>
      <MaterialIcons
        name={icon}
        size={22}
        color={COLORS.secondary}
      />

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not provided"}</Text>
      </View>
    </View>
  );

  const renderSwitchRow = (
    icon: keyof typeof MaterialIcons.glyphMap,
    title: string,
    description: string,
    value: boolean,
    onChange: (value: boolean) => void
  ) => (
    <View style={styles.switchRow}>
      <View style={styles.switchIcon}>
        <MaterialIcons
          name={icon}
          size={23}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.switchText}>
        <Text style={styles.switchTitle}>{title}</Text>
        <Text style={styles.switchDescription}>
          {description}
        </Text>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onPress={() => onChange(!value)}
        style={[
          styles.switch,
          value && styles.switchActive,
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            value && styles.switchThumbActive,
          ]}
        />
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons
          name="person-outline"
          size={64}
          color={COLORS.outline}
        />

        <Text style={styles.emptyTitle}>
          Profile unavailable
        </Text>

        <Text style={styles.emptyText}>
          We couldn't load your profile information.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={loadProfile}
        >
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.iconButton}
            accessibilityLabel="Go back"
          >
            <MaterialIcons
              name="arrow-back"
              size={26}
              color={COLORS.onSurface}
            />
          </Pressable>

          <Text style={styles.topTitle}>My Profile</Text>

          <Pressable
            onPress={() => setEditProfileVisible(true)}
            style={styles.iconButton}
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
            onPress={() => setPhotoModalVisible(true)}
            style={styles.avatarWrapper}
          >
            {profile.profileImageUrl ? (
              <Image
                source={{ uri: profile.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {initials}
                </Text>
              </View>
            )}

            <View style={styles.cameraBadge}>
              <MaterialIcons
                name="photo-camera"
                size={17}
                color={COLORS.white}
              />
            </View>
          </Pressable>

          <Text style={styles.heroName}>
            {profile.fullName}
          </Text>

          <Text style={styles.heroEmail}>
            {profile.email}
          </Text>

          <View style={styles.profileBadge}>
            <MaterialIcons
              name="verified-user"
              size={16}
              color={COLORS.primary}
            />

            <Text style={styles.profileBadgeText}>
              SmritiCare Member
            </Text>
          </View>
        </View>

        {/* Personal information */}
        <View style={styles.card}>
          {renderSectionHeader(
            "person",
            "Personal Information",
            "Your basic personal details"
          )}

          <View style={styles.divider} />

          {renderInfoRow(
            "person-outline",
            "Full Name",
            profile.fullName
          )}

          {renderInfoRow(
            "cake",
            "Date of Birth",
            formatDisplayDate(profile.dateOfBirth)
          )}

          {renderInfoRow(
            "calendar-today",
            "Age",
            profile.age !== null
              ? `${profile.age} years`
              : "Not provided"
          )}

          {renderInfoRow(
            "wc",
            "Gender",
            profile.gender || "Not provided"
          )}

          {renderInfoRow(
            "phone",
            "Phone",
            profile.phone || "Not provided"
          )}
        </View>

        {/* Health information */}
        <View style={styles.card}>
          {renderSectionHeader(
            "favorite",
            "Health Information",
            "Important information for your care"
          )}

          <View style={styles.divider} />

          {renderInfoRow(
            "bloodtype",
            "Blood Group",
            profile.bloodGroup || "Not provided"
          )}

          {renderInfoRow(
            "location-city",
            "City",
            profile.city || "Not provided"
          )}

          {renderInfoRow(
            "home",
            "Address",
            profile.address || "Not provided"
          )}

          <View style={styles.medicalNotesBox}>
            <View style={styles.medicalNotesHeader}>
              <MaterialIcons
                name="medical-information"
                size={21}
                color={COLORS.primary}
              />

              <Text style={styles.medicalNotesTitle}>
                Medical Notes
              </Text>
            </View>

            <Text style={styles.medicalNotesText}>
              {profile.medicalNotes ||
                "No medical notes have been added yet."}
            </Text>
          </View>
        </View>

        {/* Patient code */}
        <View style={styles.card}>
          {renderSectionHeader(
            "badge",
            "My Patient Code",
            "Share this code with your caregiver"
          )}

          <View style={styles.divider} />

          <View style={styles.patientCodeInfoBox}>
            <MaterialIcons
              name="info-outline"
              size={22}
              color={COLORS.secondary}
            />

            <Text style={styles.patientCodeInfoText}>
              Your patient code identifies your SmritiCare account.
              Give this code to your caregiver so they can add you
              from their dashboard.
            </Text>
          </View>

          <View style={styles.patientCodeBox}>
            <View style={styles.patientCodeLabelRow}>
              <Text style={styles.patientCodeLabel}>
                Patient Code
              </Text>

              <MaterialIcons
                name="verified-user"
                size={20}
                color={COLORS.primary}
              />
            </View>

            {loadingPatientCode ? (
              <View style={styles.patientCodeLoading}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text style={styles.patientCodeLoadingText}>
                  Generating your code...
                </Text>
              </View>
            ) : (
              <Text style={styles.patientCodeValue}>
                {patientCode || "Unavailable"}
              </Text>
            )}
          </View>

          <Pressable
            style={[
              styles.copyPatientCodeButton,
              (!patientCode || copyingPatientCode) &&
                styles.disabledButton,
            ]}
            onPress={copyPatientCode}
            disabled={!patientCode || copyingPatientCode}
          >
            {copyingPatientCode ? (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />
            ) : (
              <MaterialIcons
                name="content-copy"
                size={21}
                color={COLORS.white}
              />
            )}

            <Text style={styles.copyPatientCodeButtonText}>
              {copyingPatientCode
                ? "Copying..."
                : "Copy Patient Code"}
            </Text>
          </Pressable>
        </View>

        {/* Caregiver */}
        <View style={styles.card}>
          {renderSectionHeader(
            "supervisor-account",
            "Caregiver",
            "Manage trusted caregiver access"
          )}

          <View style={styles.divider} />

          {renderInfoRow(
            "person",
            "Caregiver Name",
            caregiverConnection?.name ||
              profile.caregiverName ||
              "Not assigned"
          )}

          {caregiverConnection ? (
            <View style={styles.connectedCaregiverBox}>
              <View style={styles.connectedCaregiverIcon}>
                <MaterialIcons
                  name="verified-user"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.connectedCaregiverText}>
                <Text style={styles.connectedCaregiverTitle}>
                  Caregiver connected
                </Text>

                <Text style={styles.connectedCaregiverSubtitle}>
                  {caregiverConnection.email ||
                    caregiverConnection.phone ||
                    "Your trusted caregiver is connected to your account."}
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable
            style={styles.connectCaregiverButton}
            onPress={() => setConnectCaregiverVisible(true)}
          >
            <MaterialIcons
              name="link"
              size={22}
              color={COLORS.white}
            />

            <Text style={styles.connectCaregiverButtonText}>
              {caregiverConnection
                ? "Change Caregiver"
                : "Connect Caregiver"}
            </Text>
          </Pressable>

          {renderSwitchRow(
            "security",
            "Caregiver Access",
            "Allow your caregiver to access your care information.",
            profile.caregiverAccess,
            setCaregiverAccess
          )}
        </View>

        {/* Emergency contacts */}
        <View style={styles.card}>
          {renderSectionHeader(
            "emergency",
            "Emergency Contacts",
            "People who can help when you need them"
          )}

          <View style={styles.divider} />

          {contacts.length === 0 ? (
            <View style={styles.noContacts}>
              <MaterialIcons
                name="contacts"
                size={42}
                color={COLORS.outline}
              />

              <Text style={styles.noContactsTitle}>
                No emergency contacts
              </Text>

              <Text style={styles.noContactsText}>
                Add a trusted person for quick access during an
                emergency.
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <View
                key={contact.id}
                style={styles.contactRow}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitials}>
                    {getInitials(contact.name)}
                  </Text>
                </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>
                    {contact.name}
                  </Text>

                  <Text style={styles.contactRelationship}>
                    {contact.relationship}
                  </Text>

                  <Text style={styles.contactPhone}>
                    {contact.phone}
                  </Text>
                </View>

                <View style={styles.contactActions}>
                  <Pressable
                    onPress={() => openEditContact(contact)}
                    style={styles.smallIconButton}
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => deleteContact(contact)}
                    style={styles.smallIconButton}
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
            style={styles.outlineButton}
            onPress={openAddContact}
          >
            <MaterialIcons
              name="person-add"
              size={21}
              color={COLORS.primary}
            />

            <Text style={styles.outlineButtonText}>
              Add Emergency Contact
            </Text>
          </Pressable>
        </View>

        {/* Privacy and sharing */}
        <View style={styles.card}>
          {renderSectionHeader(
            "privacy-tip",
            "Privacy & Sharing",
            "Choose what information you share"
          )}

          <View style={styles.divider} />

          {renderSwitchRow(
            "location-on",
            "GPS Location Sharing",
            "Allow trusted caregivers to access your current location.",
            profile.gpsSharing,
            handleGpsSharingChange
          )}

          <View style={styles.gpsStatus}>
            <View
              style={[
                styles.statusDot,
                profile.gpsSharing
                  ? styles.statusDotActive
                  : styles.statusDotInactive,
              ]}
            />

            <Text style={styles.gpsStatusText}>
              {gpsSharing
                ? "Location sharing is enabled"
                : "Location sharing is disabled"}
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          {renderSectionHeader(
            "tune",
            "Preferences",
            "Customize your SmritiCare experience"
          )}

          <View style={styles.divider} />

          <Text style={styles.preferenceLabel}>
            Language
          </Text>

          <View style={styles.optionRow}>
            {["English", "Hindi"].map((option) => (
              <Pressable
                key={option}
                onPress={async () => {
                  setLanguage(option);

                  try {
                    const updated =
                      await updateMyProfile({
                        language: option,
                      });

                    setProfile(updated);
                  } catch {
                    setLanguage(profile.language);
                  }
                }}
                style={[
                  styles.optionButton,
                  language === option &&
                    styles.optionButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    language === option &&
                      styles.optionButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.preferenceLabel}>
            Text Size
          </Text>

          <View style={styles.optionRow}>
            {["Normal", "Large", "Extra Large"].map(
              (option) => (
                <Pressable
                  key={option}
                  onPress={async () => {
                    setTextSize(option);

                    try {
                      const updated =
                        await updateMyProfile({
                          textSize: option,
                        });

                      setProfile(updated);
                    } catch {
                      setTextSize(profile.textSize);
                    }
                  }}
                  style={[
                    styles.optionButton,
                    textSize === option &&
                      styles.optionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      textSize === option &&
                        styles.optionButtonTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </View>

        {/* Account information */}
        <View style={styles.card}>
          {renderSectionHeader(
            "account-circle",
            "Account",
            "Your SmritiCare account information"
          )}

          <View style={styles.divider} />

          {renderInfoRow(
            "email",
            "Email",
            profile.email
          )}

          {renderInfoRow(
            "calendar-month",
            "Member Since",
            formatDisplayDate(profile.createdAt)
          )}

          {renderInfoRow(
            "update",
            "Last Updated",
            formatDisplayDate(profile.updatedAt)
          )}
        </View>

        {/* Bottom navigation */}
        <View style={styles.bottomNavigation}>
          <Pressable
            style={styles.navItem}
            onPress={onHome}
          >
            <MaterialIcons
              name="home"
              size={25}
              color={COLORS.secondary}
            />
            <Text style={styles.navText}>Home</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onSchedule}
          >
            <MaterialIcons
              name="calendar-month"
              size={25}
              color={COLORS.secondary}
            />
            <Text style={styles.navText}>Schedule</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onGames}
          >
            <MaterialIcons
              name="extension"
              size={25}
              color={COLORS.secondary}
            />
            <Text style={styles.navText}>Games</Text>
          </Pressable>

          <View style={[styles.navItem, styles.navItemActive]}>
            <MaterialIcons
              name="person"
              size={25}
              color={COLORS.primary}
            />
            <Text style={styles.navTextActive}>Profile</Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editProfileVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setEditProfileVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Edit Profile
                </Text>

                <Text style={styles.modalSubtitle}>
                  Update your personal and health information
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setEditProfileVisible(false)
                }
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={25}
                  color={COLORS.onSurface}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.inputLabel}>
                Full Name *
              </Text>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Age
              </Text>

              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={COLORS.outline}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Phone
              </Text>

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.outline}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Date of Birth
              </Text>

              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputHint}>
                Use the format YYYY-MM-DD
              </Text>

              <Text style={styles.inputLabel}>
                Gender
              </Text>

              <TextInput
                value={gender}
                onChangeText={setGender}
                placeholder="Male, Female, Other..."
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Blood Group
              </Text>

              <TextInput
                value={bloodGroup}
                onChangeText={setBloodGroup}
                placeholder="e.g. O+, A+, B-"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                City
              </Text>

              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Enter your city"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Address
              </Text>

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor={COLORS.outline}
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
              />

              <Text style={styles.inputLabel}>
                Medical Notes
              </Text>

              <TextInput
                value={medicalNotes}
                onChangeText={setMedicalNotes}
                placeholder="Add important medical information"
                placeholderTextColor={COLORS.outline}
                multiline
                numberOfLines={5}
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
              />

              <Text style={styles.inputLabel}>
                Caregiver Name
              </Text>

              <TextInput
                value={caregiverName}
                onChangeText={setCaregiverName}
                placeholder="Enter caregiver name"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              {renderSwitchRow(
                "security",
                "Caregiver Access",
                "Allow your caregiver to access care information.",
                caregiverAccess,
                setCaregiverAccess
              )}

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() =>
                    setEditProfileVisible(false)
                  }
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.saveButton,
                    saving && styles.disabledButton,
                  ]}
                  onPress={saveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="save"
                        size={21}
                        color={COLORS.white}
                      />

                      <Text style={styles.saveButtonText}>
                        Save Changes
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Connect caregiver modal */}
      <Modal
        visible={connectCaregiverVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!connectingCaregiver) {
            setConnectCaregiverVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.connectCaregiverModalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.connectCaregiverHeaderText}>
                <View style={styles.connectCaregiverHeaderIcon}>
                  <MaterialIcons
                    name="link"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.connectCaregiverHeaderCopy}>
                  <Text style={styles.modalTitle}>
                    Connect Caregiver
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Enter the invite code provided by your caregiver.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  if (!connectingCaregiver) {
                    setConnectCaregiverVisible(false);
                  }
                }}
                style={styles.closeButton}
                disabled={connectingCaregiver}
              >
                <MaterialIcons
                  name="close"
                  size={25}
                  color={COLORS.onSurface}
                />
              </Pressable>
            </View>

            <View style={styles.connectCaregiverContent}>
              <View style={styles.inviteInfoBox}>
                <MaterialIcons
                  name="info-outline"
                  size={22}
                  color={COLORS.secondary}
                />

                <Text style={styles.inviteInfoText}>
                  Ask your caregiver for their SmritiCare invite code.
                  Enter it below to connect your accounts.
                </Text>
              </View>

              <Text style={styles.inputLabel}>
                Invite Code *
              </Text>

              <TextInput
                value={inviteCode}
                onChangeText={(value) =>
                  setInviteCode(value.toUpperCase())
                }
                placeholder="Enter invite code"
                placeholderTextColor={COLORS.outline}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={32}
                style={[
                  styles.input,
                  styles.inviteCodeInput,
                ]}
              />

              <Text style={styles.inputHint}>
                The code is case-insensitive.
              </Text>

              <Pressable
                style={[
                  styles.connectSubmitButton,
                  connectingCaregiver &&
                    styles.disabledButton,
                ]}
                onPress={connectCaregiver}
                disabled={connectingCaregiver}
              >
                {connectingCaregiver ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <>
                    <MaterialIcons
                      name="link"
                      size={22}
                      color={COLORS.white}
                    />

                    <Text style={styles.connectSubmitButtonText}>
                      Connect Caregiver
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={styles.photoCancelButton}
                onPress={() => {
                  if (!connectingCaregiver) {
                    setConnectCaregiverVisible(false);
                  }
                }}
                disabled={connectingCaregiver}
              >
                <Text style={styles.photoCancelText}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile photo modal */}
      <Modal
        visible={photoModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() =>
          setPhotoModalVisible(false)
        }
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContainer}>
            <View style={styles.photoPreview}>
              {profile.profileImageUrl ? (
                <Image
                  source={{
                    uri: profile.profileImageUrl,
                  }}
                  style={styles.photoPreviewImage}
                />
              ) : (
                <View style={styles.photoPreviewPlaceholder}>
                  <Text style={styles.photoPreviewInitials}>
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.photoModalTitle}>
              Profile Photo
            </Text>

            <Text style={styles.photoModalText}>
              Choose a new photo from your device or take a
              new picture.
            </Text>

            {uploadingPhoto ? (
              <View style={styles.uploadingBox}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                />

                <Text style={styles.uploadingText}>
                  Saving photo...
                </Text>
              </View>
            ) : (
              <>
                <Pressable
                  style={styles.photoActionButton}
                  onPress={choosePhoto}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={24}
                    color={COLORS.primary}
                  />

                  <Text style={styles.photoActionText}>
                    Choose from Gallery
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.photoActionButton}
                  onPress={takePhoto}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={24}
                    color={COLORS.primary}
                  />

                  <Text style={styles.photoActionText}>
                    Take a Photo
                  </Text>
                </Pressable>

                {profile.profileImageUrl ? (
                  <Pressable
                    style={[
                      styles.photoActionButton,
                      styles.removePhotoButton,
                    ]}
                    onPress={removePhoto}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={24}
                      color={COLORS.error}
                    />

                    <Text
                      style={[
                        styles.photoActionText,
                        styles.removePhotoText,
                      ]}
                    >
                      Remove Photo
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={styles.photoCancelButton}
                  onPress={() =>
                    setPhotoModalVisible(false)
                  }
                >
                  <Text style={styles.photoCancelText}>
                    Cancel
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Emergency contact modal */}
      <Modal
        visible={contactModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setContactModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contactModalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingContact
                    ? "Edit Contact"
                    : "Add Emergency Contact"}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Keep a trusted person close when help is needed.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setContactModalVisible(false)
                }
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={25}
                  color={COLORS.onSurface}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.inputLabel}>
                Name *
              </Text>

              <TextInput
                value={contactName}
                onChangeText={setContactName}
                placeholder="Contact name"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Relationship *
              </Text>

              <TextInput
                value={contactRelationship}
                onChangeText={setContactRelationship}
                placeholder="e.g. Daughter, Son, Spouse"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Phone *
              </Text>

              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Phone number"
                placeholderTextColor={COLORS.outline}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() =>
                    setContactModalVisible(false)
                  }
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.saveButton}
                  onPress={saveContact}
                >
                  <MaterialIcons
                    name="check"
                    size={21}
                    color={COLORS.white}
                  />

                  <Text style={styles.saveButtonText}>
                    {editingContact
                      ? "Update Contact"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingBottom: 110,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 16,
    fontFamily: BODY_FONT,
    fontSize: 17,
    color: COLORS.onSurfaceVariant,
  },

  emptyTitle: {
    marginTop: 18,
    fontFamily: HEADING_FONT,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  emptyText: {
    marginTop: 8,
    fontFamily: BODY_FONT,
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 400,
  },

  topBar: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontFamily: HEADING_FONT,
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  avatarWrapper: {
    width: 112,
    height: 112,
    position: "relative",
    marginBottom: 15,
  },

  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },

  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    fontFamily: HEADING_FONT,
    fontSize: 38,
    fontWeight: "800",
    color: COLORS.onPrimaryContainer,
  },

  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  heroName: {
    fontFamily: HEADING_FONT,
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  heroEmail: {
    marginTop: 5,
    fontFamily: BODY_FONT,
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  profileBadge: {
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryFixed,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  profileBadgeText: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  sectionTitle: {
    fontFamily: HEADING_FONT,
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 16,
  },

  infoRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  infoTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  infoLabel: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  infoValue: {
    marginTop: 3,
    fontFamily: BODY_FONT,
    fontSize: 17,
    color: COLORS.onSurface,
  },

  medicalNotesBox: {
    marginTop: 12,
    padding: 15,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
  },

  medicalNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  medicalNotesTitle: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  medicalNotesText: {
    marginTop: 9,
    fontFamily: BODY_FONT,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.onSurfaceVariant,
  },

  switchRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },

  switchIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  switchText: {
    flex: 1,
    marginHorizontal: 12,
  },

  switchTitle: {
    fontFamily: BODY_FONT,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  switchDescription: {
    marginTop: 3,
    fontFamily: BODY_FONT,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  switch: {
    width: 54,
    height: 32,
    borderRadius: 18,
    padding: 3,
    justifyContent: "center",
    backgroundColor: COLORS.outlineVariant,
  },

  switchActive: {
    backgroundColor: COLORS.primary,
  },

  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
  },

  switchThumbActive: {
    alignSelf: "flex-end",
  },

  gpsStatus: {
    marginTop: 8,
    padding: 12,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 9,
  },

  statusDotActive: {
    backgroundColor: COLORS.primary,
  },

  statusDotInactive: {
    backgroundColor: COLORS.outline,
  },

  gpsStatusText: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  noContacts: {
    paddingVertical: 20,
    alignItems: "center",
  },

  noContactsTitle: {
    marginTop: 10,
    fontFamily: HEADING_FONT,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  noContactsText: {
    marginTop: 6,
    maxWidth: 420,
    fontFamily: BODY_FONT,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  contactRow: {
    minHeight: 84,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  contactInitials: {
    fontFamily: HEADING_FONT,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },

  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },

  contactName: {
    fontFamily: BODY_FONT,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  contactRelationship: {
    marginTop: 2,
    fontFamily: BODY_FONT,
    fontSize: 13,
    color: COLORS.secondary,
  },

  contactPhone: {
    marginTop: 2,
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  contactActions: {
    flexDirection: "row",
    gap: 2,
  },

  smallIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  outlineButton: {
    minHeight: 54,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  outlineButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  preferenceLabel: {
    marginTop: 7,
    marginBottom: 9,
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },

  optionButton: {
    minHeight: 46,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  optionButtonActive: {
    backgroundColor: COLORS.secondaryFixed,
    borderColor: COLORS.primary,
  },

  optionButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  optionButtonTextActive: {
    color: COLORS.primary,
  },

  primaryButton: {
    marginTop: 22,
    minHeight: 54,
    paddingHorizontal: 25,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },

  patientCodeInfoBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  patientCodeInfoText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: BODY_FONT,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
  },

  patientCodeBox: {
    marginTop: 14,
    padding: 17,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryFixed,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  patientCodeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  patientCodeLabel: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  patientCodeValue: {
    marginTop: 9,
    fontFamily: HEADING_FONT,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.primary,
  },

  patientCodeLoading: {
    marginTop: 12,
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
  },

  patientCodeLoadingText: {
    marginLeft: 9,
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  copyPatientCodeButton: {
    minHeight: 54,
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  copyPatientCodeButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
  },

  connectedCaregiverBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.secondaryFixed,
    flexDirection: "row",
    alignItems: "center",
  },

  connectedCaregiverIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  connectedCaregiverText: {
    flex: 1,
    marginLeft: 11,
  },

  connectedCaregiverTitle: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  connectedCaregiverSubtitle: {
    marginTop: 3,
    fontFamily: BODY_FONT,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  connectCaregiverButton: {
    minHeight: 54,
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  connectCaregiverButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
  },

  connectCaregiverModalContainer: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },

  connectCaregiverHeaderText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  connectCaregiverHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  connectCaregiverHeaderCopy: {
    flex: 1,
    marginLeft: 11,
  },

  connectCaregiverContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  inviteInfoBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  inviteInfoText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: BODY_FONT,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
  },

  inviteCodeInput: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
  },

  connectSubmitButton: {
    minHeight: 56,
    marginTop: 22,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  connectSubmitButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },

  bottomNavigation: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 18,
    minHeight: 70,
    paddingHorizontal: 8,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    minWidth: 68,
    minHeight: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  navItemActive: {
    backgroundColor: COLORS.secondaryFixed,
  },

  navText: {
    marginTop: 2,
    fontFamily: BODY_FONT,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  navTextActive: {
    marginTop: 2,
    fontFamily: BODY_FONT,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },

  contactModalContainer: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontFamily: HEADING_FONT,
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  modalSubtitle: {
    marginTop: 4,
    maxWidth: 500,
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  inputLabel: {
    marginTop: 13,
    marginBottom: 7,
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  input: {
    minHeight: 54,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLow,
    fontFamily: BODY_FONT,
    fontSize: 16,
    color: COLORS.onSurface,
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  inputHint: {
    marginTop: 5,
    fontFamily: BODY_FONT,
    fontSize: 12,
    color: COLORS.secondary,
  },

  modalButtons: {
    marginTop: 24,
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  saveButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
  },

  disabledButton: {
    opacity: 0.65,
  },

  photoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  photoModalContainer: {
    width: "100%",
    maxWidth: 430,
    padding: 24,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },

  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    marginBottom: 17,
  },

  photoPreviewImage: {
    width: "100%",
    height: "100%",
  },

  photoPreviewPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  photoPreviewInitials: {
    fontFamily: HEADING_FONT,
    fontSize: 50,
    fontWeight: "800",
    color: COLORS.onPrimaryContainer,
  },

  photoModalTitle: {
    fontFamily: HEADING_FONT,
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  photoModalText: {
    marginTop: 7,
    marginBottom: 18,
    fontFamily: BODY_FONT,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  photoActionButton: {
    width: "100%",
    minHeight: 54,
    marginTop: 9,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  photoActionText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  removePhotoButton: {
    borderColor: COLORS.error,
  },

  removePhotoText: {
    color: COLORS.error,
  },

  photoCancelButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  photoCancelText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
  },

  uploadingBox: {
    width: "100%",
    paddingVertical: 25,
    alignItems: "center",
  },

  uploadingText: {
    marginTop: 12,
    fontFamily: BODY_FONT,
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
  },
});