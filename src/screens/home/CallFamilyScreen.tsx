import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { getToken } from "../../services/authStorage";
import { API_BASE_URL } from "../../constants/api";

type CallFamilyScreenProps = {
  onBack?: () => void;
};

type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  createdAt?: string;
};

type ContactsResponse = {
  success: boolean;
  contacts?: FamilyMember[];
  message?: string;
};

type ContactResponse = {
  success: boolean;
  contact?: FamilyMember;
  message?: string;
};

const COLORS = {
  background: "#FBF9F1",
  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",
  surfaceVariant: "#D9DDD4",

  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",

  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  onSecondaryContainer: "#68472F",

  tertiary: "#A65D43",

  error: "#9B3F32",
  errorContainer: "#E7C9B9",

  text: "#1B1C17",
  textSecondary: "#565A52",

  outline: "#72766D",
  outlineVariant: "#CDD2C8",
};

export default function CallFamilyScreen({
  onBack,
}: CallFamilyScreenProps) {
  const [familyMembers, setFamilyMembers] = useState<
    FamilyMember[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/emergency-contacts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ContactsResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load family contacts.",
        );
      }

      setFamilyMembers(result.contacts || []);
    } catch (error) {
      Alert.alert(
        "Unable to Load Contacts",
        error instanceof Error
          ? error.message
          : "Unable to load family contacts.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetForm = () => {
    setName("");
    setRelationship("");
    setPhone("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    resetForm();
  };

  const addFamilyMember = async () => {
    const trimmedName = name.trim();
    const trimmedRelationship = relationship.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert(
        "Missing Name",
        "Please enter the family member's name.",
      );
      return;
    }

    if (!trimmedRelationship) {
      Alert.alert(
        "Missing Relationship",
        "Please enter the relationship, such as Son or Daughter.",
      );
      return;
    }

    if (!trimmedPhone) {
      Alert.alert(
        "Missing Phone Number",
        "Please enter a phone number.",
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/emergency-contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            relationship: trimmedRelationship,
            phone: trimmedPhone,
          }),
        },
      );

      const result: ContactResponse =
        await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.contact
      ) {
        throw new Error(
          result.message ||
            "Unable to add family member.",
        );
      }

      setFamilyMembers((current) => [
        ...current,
        result.contact!,
      ]);

      setShowAddModal(false);
      resetForm();

      Alert.alert(
        "Family Member Added",
        `${result.contact.name} has been added successfully.`,
      );
    } catch (error) {
      Alert.alert(
        "Unable to Add Contact",
        error instanceof Error
          ? error.message
          : "Unable to add family member.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteFamilyMember = (
    member: FamilyMember,
  ) => {
    Alert.alert(
      "Remove Family Member",
      `Are you sure you want to remove ${member.name} from your family contacts?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();

              if (!token) {
                throw new Error("Please log in again.");
              }

              const response = await fetch(
                `${API_BASE_URL}/api/emergency-contacts/${member.id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              const result: ContactResponse =
                await response.json();

              if (!response.ok || !result.success) {
                throw new Error(
                  result.message ||
                    "Unable to remove family member.",
                );
              }

              setFamilyMembers((current) =>
                current.filter(
                  (item) => item.id !== member.id,
                ),
              );

              Alert.alert(
                "Contact Removed",
                `${member.name} has been removed.`,
              );
            } catch (error) {
              Alert.alert(
                "Unable to Remove Contact",
                error instanceof Error
                  ? error.message
                  : "Unable to remove family member.",
              );
            }
          },
        },
      ],
    );
  };

  const callFamilyMember = async (
    member: FamilyMember,
  ) => {
    const phoneNumber = member.phone.trim();

    if (!phoneNumber) {
      Alert.alert(
        "No Phone Number",
        `${member.name} does not have a phone number.`,
      );
      return;
    }

    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported =
        await Linking.canOpenURL(phoneUrl);

      if (!supported) {
        Alert.alert(
          "Calling Not Available",
          "This device cannot open the phone dialer.",
        );
        return;
      }

      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(
        "Unable to Call",
        `We could not open the phone dialer for ${member.name}.`,
      );
    }
  };

  const getInitials = (memberName: string) => {
    const parts = memberName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "FM";
    }

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back to home"
          >
            <Ionicons
              name="arrow-back"
              size={29}
              color={COLORS.primary}
            />

            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Call Family
            </Text>

            <Text style={styles.headerSubtitle}>
              Quickly reach someone you trust
            </Text>
          </View>
        </View>

        {/* Main content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <MaterialIcons
                name="family-restroom"
                size={34}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.introTextBlock}>
              <Text style={styles.introTitle}>
                Your Family Contacts
              </Text>

              <Text style={styles.introText}>
                Tap Call to contact someone you trust.
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.loadingText}>
                Loading family contacts...
              </Text>
            </View>
          ) : familyMembers.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons
                  name="people-outline"
                  size={52}
                  color={COLORS.secondary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Family Members Yet
              </Text>

              <Text style={styles.emptyText}>
                Add a trusted family member so you can
                call them quickly when you need help.
              </Text>
            </View>
          ) : (
            familyMembers.map((member) => (
              <View
                key={member.id}
                style={styles.contactCard}
              >
                <View style={styles.contactAccent}>
                  <View
                    style={styles.accentOne}
                  />
                  <View
                    style={styles.accentTwo}
                  />
                  <View
                    style={styles.accentThree}
                  />
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.profilePlaceholder}>
                    <Text style={styles.initials}>
                      {getInitials(member.name)}
                    </Text>
                  </View>

                  <View style={styles.nameBlock}>
                    <Text style={styles.memberName}>
                      {member.name}
                    </Text>

                    <Text
                      style={styles.memberRelation}
                    >
                      {member.relationship}
                    </Text>

                    <Text style={styles.memberPhone}>
                      {member.phone}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionColumn}>
                  <Pressable
                    onPress={() =>
                      callFamilyMember(member)
                    }
                    style={({ pressed }) => [
                      styles.callButton,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${member.name}`}
                  >
                    <Ionicons
                      name="call"
                      size={24}
                      color={COLORS.onPrimary}
                    />

                    <Text style={styles.callButtonText}>
                      Call
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      deleteFamilyMember(member)
                    }
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${member.name}`}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color={COLORS.error}
                    />

                    <Text style={styles.deleteText}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Pressable
            onPress={openAddModal}
            style={({ pressed }) => [
              styles.addFamilyButton,
              pressed && styles.addPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add family member"
          >
            <MaterialIcons
              name="add-circle"
              size={45}
              color={COLORS.primary}
            />

            <Text style={styles.addFamilyText}>
              Add Family Member
            </Text>
          </Pressable>

          {!loading && (
            <Pressable
              onPress={loadContacts}
              style={({ pressed }) => [
                styles.refreshButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh family contacts"
            >
              <MaterialIcons
                name="refresh"
                size={24}
                color={COLORS.primary}
              />

              <Text style={styles.refreshText}>
                Refresh Contacts
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Add family member modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={closeAddModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add Family Member
                </Text>

                <Pressable
                  onPress={closeAddModal}
                  disabled={saving}
                  style={styles.modalCloseButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close add family member form"
                >
                  <Ionicons
                    name="close"
                    size={27}
                    color={COLORS.textSecondary}
                  />
                </Pressable>
              </View>

              <Text style={styles.inputLabel}>
                Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Aman"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                editable={!saving}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>
                Relationship
              </Text>

              <TextInput
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g. Son"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                editable={!saving}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>
                Phone Number
              </Text>

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                editable={!saving}
                keyboardType="phone-pad"
              />

              <Pressable
                onPress={addFamilyMember}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  saving && styles.disabledButton,
                  pressed &&
                    !saving &&
                    styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save family member"
              >
                {saving ? (
                  <ActivityIndicator
                    color={COLORS.onPrimary}
                    size="small"
                  />
                ) : (
                  <>
                    <MaterialIcons
                      name="save"
                      size={24}
                      color={COLORS.onPrimary}
                    />

                    <Text
                      style={styles.saveButtonText}
                    >
                      Save Family Member
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
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

  header: {
    minHeight: 82,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    minWidth: 110,
    minHeight: 54,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  backText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 35,
  },

  introCard: {
    minHeight: 100,
    padding: 17,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  introTextBlock: {
    flex: 1,
    marginLeft: 14,
  },

  introTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: COLORS.primary,
  },

  introText: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },

  loadingContainer: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  emptyCard: {
    marginTop: 16,
    minHeight: 240,
    padding: 25,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 27,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  contactCard: {
    minHeight: 140,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  contactAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    flexDirection: "row",
  },

  accentOne: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  accentTwo: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  accentThree: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },

  contactInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  profilePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },

  nameBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },

  memberName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: COLORS.text,
  },

  memberRelation: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  memberPhone: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.secondary,
  },

  actionColumn: {
    marginLeft: 10,
    alignItems: "stretch",
  },

  callButton: {
    minHeight: 50,
    minWidth: 88,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  callButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  deleteButton: {
    minHeight: 40,
    marginTop: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  deleteText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.error,
  },

  addFamilyButton: {
    width: "100%",
    minHeight: 110,
    marginTop: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },

  addFamilyText: {
    marginTop: 7,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },

  addPressed: {
    backgroundColor: COLORS.surfaceLow,
  },

  refreshButton: {
    minHeight: 54,
    marginTop: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  refreshText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40, 42, 36, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  modalTitle: {
    flex: 1,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
    color: COLORS.primary,
  },

  modalCloseButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  input: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.background,
    fontSize: 16,
    color: COLORS.text,
  },

  saveButton: {
    minHeight: 58,
    marginTop: 21,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  disabledButton: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});