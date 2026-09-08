import React, { useCallback, useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getToken } from '../../services/authStorage';

const API_BASE_URL = 'http://192.168.29.253:5000';

type CallFamilyScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
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

export default function CallFamilyScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: CallFamilyScreenProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/emergency-contacts`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: ContactsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load family contacts.'
        );
      }

      setFamilyMembers(result.contacts || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load family contacts.';

      Alert.alert('Unable to Load Contacts', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetForm = () => {
    setName('');
    setRelationship('');
    setPhone('');
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
      Alert.alert('Missing Name', 'Please enter the family member’s name.');
      return;
    }

    if (!trimmedRelationship) {
      Alert.alert(
        'Missing Relationship',
        'Please enter the relationship, such as Son or Daughter.'
      );
      return;
    }

    if (!trimmedPhone) {
      Alert.alert(
        'Missing Phone Number',
        'Please enter a phone number.'
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/emergency-contacts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
            relationship: trimmedRelationship,
            phone: trimmedPhone,
          }),
        }
      );

      const result: ContactResponse = await response.json();

      if (!response.ok || !result.success || !result.contact) {
        throw new Error(
          result.message || 'Unable to add family member.'
        );
      }

      setFamilyMembers((current) => [
        ...current,
        result.contact!,
      ]);

      setShowAddModal(false);
      resetForm();

      Alert.alert(
        'Family Member Added',
        `${result.contact.name} has been added successfully.`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to add family member.';

      Alert.alert('Unable to Add Contact', message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFamilyMember = (member: FamilyMember) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${member.name} from your family contacts?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();

              if (!token) {
                throw new Error('Please log in again.');
              }

              const response = await fetch(
                `${API_BASE_URL}/api/emergency-contacts/${member.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const result: ContactResponse =
                await response.json();

              if (!response.ok || !result.success) {
                throw new Error(
                  result.message ||
                    'Unable to remove family member.'
                );
              }

              setFamilyMembers((current) =>
                current.filter((item) => item.id !== member.id)
              );

              Alert.alert(
                'Contact Removed',
                `${member.name} has been removed.`
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Unable to remove family member.';

              Alert.alert('Unable to Remove Contact', message);
            }
          },
        },
      ]
    );
  };

  const callFamilyMember = async (member: FamilyMember) => {
    const phoneNumber = member.phone.trim();

    if (!phoneNumber) {
      Alert.alert(
        'No Phone Number',
        `${member.name} does not have a phone number.`
      );
      return;
    }

    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);

      if (!supported) {
        Alert.alert(
          'Calling Not Available',
          'This device cannot open the phone dialer.'
        );
        return;
      }

      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(
        'Unable to Call',
        `We could not open the phone dialer for ${member.name}.`
      );
    }
  };

  const getInitials = (memberName: string) => {
    const parts = memberName.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#00450D"
            />
          </Pressable>

          <Text style={styles.headerTitle}>SmritiCare</Text>

          <Text style={styles.headerSectionTitle}>
            Call Family
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <MaterialIcons
                name="family-restroom"
                size={34}
                color="#00450D"
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
                color="#00450D"
              />
              <Text style={styles.loadingText}>
                Loading family contacts...
              </Text>
            </View>
          ) : familyMembers.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons
                name="people-outline"
                size={58}
                color="#556158"
              />

              <Text style={styles.emptyTitle}>
                No Family Members Yet
              </Text>

              <Text style={styles.emptyText}>
                Add a trusted family member so you can call them
                quickly when you need help.
              </Text>
            </View>
          ) : (
            familyMembers.map((member) => (
              <View key={member.id} style={styles.contactCard}>
                <View style={styles.topPattern}>
                  <View style={styles.patternStripeOne} />
                  <View style={styles.patternStripeTwo} />
                  <View style={styles.patternStripeThree} />
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

                    <Text style={styles.memberRelation}>
                      {member.relationship}
                    </Text>

                    <Text style={styles.memberPhone}>
                      {member.phone}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionColumn}>
                  <Pressable
                    onPress={() => callFamilyMember(member)}
                    style={({ pressed }) => [
                      styles.callButton,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${member.name}`}
                  >
                    <Ionicons
                      name="call"
                      size={25}
                      color="#FFFFFF"
                    />

                    <Text style={styles.callButtonText}>
                      Call
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => deleteFamilyMember(member)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${member.name}`}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={23}
                      color="#A70515"
                    />

                    <Text style={styles.deleteText}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          {/* Add Family Member */}
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
              size={48}
              color="#00450D"
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
                size={25}
                color="#00450D"
              />

              <Text style={styles.refreshText}>
                Refresh Contacts
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <NavItem
            icon="home"
            label="Home"
            active
            onPress={onHome}
          />

          <NavItem
            icon="extension"
            label="Games"
            onPress={onGames}
          />

          <NavItem
            icon="alarm"
            label="Remind"
            onPress={onSchedule}
          />

          <NavItem
            icon="auto-stories"
            label="Memory"
            onPress={onMemory}
          />

          <NavItem
            icon="person"
            label="Profile"
            onPress={onProfile}
          />
        </View>

        {/* Add Family Member Modal */}
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
                    size={28}
                    color="#41493E"
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
                placeholderTextColor="#717A6D"
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
                placeholderTextColor="#717A6D"
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
                placeholderTextColor="#717A6D"
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
                  pressed && !saving && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save family member"
              >
                {saving ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <>
                    <MaterialIcons
                      name="save"
                      size={25}
                      color="#FFFFFF"
                    />

                    <Text style={styles.saveButtonText}>
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

type NavItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function NavItem({
  icon,
  label,
  active,
  onPress,
}: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        active && styles.navItemActive,
        pressed && styles.navPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialIcons
        name={icon}
        size={28}
        color={active ? '#90D689' : '#41493E'}
      />

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
    backgroundColor: '#F4FAFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#F4FAFF',
  },

  // Header
  header: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4FAFF',
    borderBottomWidth: 2,
    borderBottomColor: '#C0C9BB',
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: '#00450D',
  },

  headerSectionTitle: {
    marginLeft: 'auto',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#00450D',
  },

  // Content
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 125,
  },

  introCard: {
    minHeight: 92,
    backgroundColor: '#E9F6FD',
    borderWidth: 2,
    borderColor: '#C0DCEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  introIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  introTextBlock: {
    flex: 1,
  },

  introTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    color: '#00450D',
  },

  introText: {
    marginTop: 3,
    fontSize: 16,
    lineHeight: 22,
    color: '#41493E',
  },

  // Loading
  loadingContainer: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: '#41493E',
  },

  // Empty
  emptyCard: {
    minHeight: 220,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 18,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#111D23',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 17,
    lineHeight: 25,
    color: '#41493E',
    textAlign: 'center',
  },

  // Contact
  contactCard: {
    minHeight: 128,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  topPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: 'row',
  },

  patternStripeOne: {
    flex: 1,
    backgroundColor: '#A70515',
  },

  patternStripeTwo: {
    flex: 1,
    backgroundColor: '#A70515',
    opacity: 0.55,
  },

  patternStripeThree: {
    flex: 1,
    backgroundColor: '#A70515',
    opacity: 0.25,
  },

  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  profilePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E3F0F8',
    borderWidth: 2,
    borderColor: '#D7E4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  initials: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '700',
    color: '#00450D',
  },

  nameBlock: {
    flex: 1,
    minWidth: 0,
  },

  memberName: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
    color: '#111D23',
  },

  memberRelation: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 23,
    color: '#41493E',
  },

  memberPhone: {
    marginTop: 3,
    fontSize: 16,
    lineHeight: 22,
    color: '#556158',
  },

  actionColumn: {
    alignItems: 'stretch',
    marginLeft: 10,
  },

  callButton: {
    minHeight: 54,
    minWidth: 94,
    paddingHorizontal: 17,
    borderRadius: 8,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  callButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
  },

  deleteButton: {
    minHeight: 42,
    marginTop: 5,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    marginLeft: 4,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#A70515',
  },

  pressed: {
    opacity: 0.78,
  },

  // Add member
  addFamilyButton: {
    width: '100%',
    minHeight: 116,
    marginTop: 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#00450D',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  addFamilyText: {
    marginTop: 8,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '700',
    color: '#00450D',
    textAlign: 'center',
  },

  addPressed: {
    backgroundColor: '#E9F6FD',
  },

  refreshButton: {
    minHeight: 56,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: '700',
    color: '#00450D',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 2,
    borderColor: '#C0C9BB',
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalTitle: {
    flex: 1,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    color: '#00450D',
  },

  modalCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#1B1C1C',
  },

  input: {
    minHeight: 54,
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 18,
    color: '#111D23',
    backgroundColor: '#FCF9F8',
  },

  saveButton: {
    minHeight: 58,
    marginTop: 22,
    borderRadius: 8,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  // Bottom navigation
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#F4FAFF',
    borderTopWidth: 2,
    borderTopColor: '#C0C9BB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  navItem: {
    minWidth: 64,
    minHeight: 60,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navItemActive: {
    backgroundColor: '#1B5E20',
  },

  navLabel: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#41493E',
  },

  navLabelActive: {
    color: '#90D689',
  },

  navPressed: {
    opacity: 0.75,
  },
});