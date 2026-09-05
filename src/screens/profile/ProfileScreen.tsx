import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type ProfileScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

export default function ProfileScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: ProfileScreenProps) {
  const [caregiverAccess, setCaregiverAccess] = useState(true);
  const [gpsSharing, setGpsSharing] = useState(true);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('large');
  const [language, setLanguage] = useState('English');

  const editDetails = () => {
    Alert.alert(
      'Edit Details',
      'Profile editing will be connected next.'
    );
  };

  const editContact = (name: string) => {
    Alert.alert(
      'Edit Contact',
      `Opening editor for ${name}...`
    );
  };

  const addContact = () => {
    Alert.alert(
      'Add New Contact',
      'New contact creation will be connected next.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Mobile Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#00450D"
            />
          </Pressable>

          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Personal Details */}
          <View style={styles.card}>
            <View style={styles.mekhelaBorder}>
              <View style={styles.mekhelaStripe} />
              <View style={styles.mekhelaStripeLight} />
              <View style={styles.mekhelaStripe} />
              <View style={styles.mekhelaStripeLight} />
              <View style={styles.mekhelaStripe} />
            </View>

            <View style={styles.cardPadding}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <MaterialIcons
                    name="person"
                    size={42}
                    color="#00450D"
                  />
                </View>

                <View style={styles.profileNameBlock}>
                  <Text style={styles.profileName}>
                    Ramani Barman
                  </Text>
                  <Text style={styles.profileAge}>
                    Age: 72
                  </Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value="Ramani Barman"
                  editable={false}
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  value="72"
                  editable={false}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={editDetails}
                style={({ pressed }) => [
                  styles.outlineButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name="edit"
                  size={24}
                  color="#00450D"
                />
                <Text style={styles.outlineButtonText}>
                  Edit Details
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Caregiver Access */}
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.greenSettingIcon}>
                  <MaterialIcons
                    name="supervisor-account"
                    size={30}
                    color="#90D689"
                  />
                </View>

                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    Caregiver Access
                  </Text>
                  <Text style={styles.settingDescription}>
                    Allow family to help
                  </Text>
                </View>
              </View>

              <Switch
                value={caregiverAccess}
                onValueChange={setCaregiverAccess}
                trackColor={{
                  false: '#D7E4EC',
                  true: '#1B5E20',
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D7E4EC"
              />
            </View>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.card}>
            <View style={styles.cardPadding}>
              <View style={styles.sectionHeader}>
                <View style={styles.emergencyIcon}>
                  <MaterialIcons
                    name="emergency"
                    size={30}
                    color="#93000A"
                  />
                </View>
                <Text style={styles.sectionTitle}>
                  Emergency Contacts
                </Text>
              </View>

              <ContactRow
                icon="call"
                name="Son (Bikash)"
                phone="+91 98765 43210"
                onEdit={() => editContact('Son (Bikash)')}
              />

              <ContactRow
                icon="local-hospital"
                name="Dr. Sharma"
                phone="+91 91234 56789"
                onEdit={() => editContact('Dr. Sharma')}
              />

              <Pressable
                onPress={addContact}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name="add"
                  size={26}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryButtonText}>
                  Add New Contact
                </Text>
              </Pressable>
            </View>
          </View>

          {/* GPS Sharing */}
          <View style={styles.card}>
            <View style={styles.cardPadding}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.blueSettingIcon}>
                    <MaterialIcons
                      name="location-on"
                      size={30}
                      color="#004470"
                    />
                  </View>

                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>
                      GPS Sharing
                    </Text>
                  </View>
                </View>

                <Switch
                  value={gpsSharing}
                  onValueChange={setGpsSharing}
                  trackColor={{
                    false: '#D7E4EC',
                    true: '#1B5E20',
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D7E4EC"
                />
              </View>

              <Text style={styles.mapDescription}>
                Sharing location with caregivers for safety.
              </Text>

              <View style={styles.mapPlaceholder}>
                <View style={styles.mapRoadOne} />
                <View style={styles.mapRoadTwo} />
                <View style={styles.mapRoadThree} />
                <View style={styles.mapRoadFour} />

                <View style={styles.locationMarker}>
                  <MaterialIcons
                    name="my-location"
                    size={28}
                    color="#90D689"
                  />
                </View>

                <Text style={styles.mapLabel}>Guwahati</Text>
              </View>
            </View>
          </View>

          {/* App Settings */}
          <View style={[styles.card, styles.lastCard]}>
            <View style={styles.cardPadding}>
              <View style={styles.sectionHeader}>
                <View style={styles.settingsIcon}>
                  <MaterialIcons
                    name="settings"
                    size={30}
                    color="#111D23"
                  />
                </View>
                <Text style={styles.sectionTitle}>
                  App Settings
                </Text>
              </View>

              <Text style={styles.label}>Language</Text>

              <View style={styles.languageRow}>
                <Pressable
                  onPress={() =>
                    setLanguage(
                      language === 'English'
                        ? 'Assamese (অসমীয়া)'
                        : 'English'
                    )
                  }
                  style={styles.languageSelector}
                >
                  <Text style={styles.languageText}>
                    {language}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={28}
                    color="#41493E"
                  />
                </Pressable>
              </View>

              <Text style={[styles.label, styles.textSizeLabel]}>
                Text Size
              </Text>

              <View style={styles.textSizeRow}>
                <Pressable
                  onPress={() => setTextSize('normal')}
                  style={[
                    styles.textSizeButton,
                    textSize === 'normal' &&
                      styles.textSizeButtonNormalActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.textSizeButtonText,
                      textSize === 'normal' &&
                        styles.textSizeButtonTextActive,
                    ]}
                  >
                    A- Normal
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setTextSize('large')}
                  style={[
                    styles.textSizeButton,
                    textSize === 'large' &&
                      styles.textSizeButtonLargeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.textSizeButtonText,
                      textSize === 'large' &&
                        styles.textSizeButtonTextLargeActive,
                    ]}
                  >
                    A+ Large
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <NavItem
            icon="home"
            label="Home"
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
            active
            onPress={onProfile}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

type ContactRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  name: string;
  phone: string;
  onEdit: () => void;
};

function ContactRow({
  icon,
  name,
  phone,
  onEdit,
}: ContactRowProps) {
  return (
    <View style={styles.contactRow}>
      <View style={styles.contactInfo}>
        <MaterialIcons
          name={icon}
          size={30}
          color="#41493E"
        />

        <View style={styles.contactText}>
          <Text style={styles.contactName}>{name}</Text>
          <Text style={styles.contactPhone}>{phone}</Text>
        </View>
      </View>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [
          styles.editContactButton,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${name}`}
      >
        <MaterialIcons
          name="edit"
          size={23}
          color="#00450D"
        />
      </Pressable>
    </View>
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
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: '#F4FAFF',
    borderBottomWidth: 2,
    borderBottomColor: '#C0C9BB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: '#00450D',
  },

  // Content
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  lastCard: {
    marginBottom: 8,
  },
  cardPadding: {
    padding: 24,
  },

  // Mekhela decoration
  mekhelaBorder: {
    height: 4,
    width: '100%',
    flexDirection: 'row',
  },
  mekhelaStripe: {
    flex: 1,
    backgroundColor: '#00450D',
  },
  mekhelaStripeLight: {
    flex: 1,
    backgroundColor: '#E3F0F8',
  },

  // Profile
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DDEAF2',
    borderWidth: 2,
    borderColor: '#00450D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileNameBlock: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#111D23',
  },
  profileAge: {
    marginTop: 3,
    fontSize: 22,
    lineHeight: 32,
    color: '#41493E',
  },

  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111D23',
    marginBottom: 8,
  },
  input: {
    minHeight: 60,
    borderWidth: 2,
    borderColor: '#717A6D',
    borderRadius: 8,
    backgroundColor: '#F4FAFF',
    paddingHorizontal: 16,
    fontSize: 22,
    color: '#111D23',
  },
  outlineButton: {
    minHeight: 60,
    marginTop: 2,
    borderWidth: 2,
    borderColor: '#00450D',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#00450D',
  },

  // Settings
  settingRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#111D23',
  },
  settingDescription: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 32,
    color: '#41493E',
  },
  greenSettingIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueSettingIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#CFE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Emergency contacts
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#111D23',
  },
  emergencyIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#FFDAD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#DDEAF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: {
    minHeight: 86,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F4FAFF',
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 16,
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111D23',
  },
  contactPhone: {
    marginTop: 3,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
  },
  editContactButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E3F0F8',
    borderWidth: 1,
    borderColor: '#C0C9BB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    minHeight: 60,
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // GPS / map
  mapDescription: {
    marginTop: 10,
    marginBottom: 16,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
  },
  mapPlaceholder: {
    height: 192,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C0C9BB',
    backgroundColor: '#D7E4EC',
    overflow: 'hidden',
    position: 'relative',
  },
  mapRoadOne: {
    position: 'absolute',
    width: '140%',
    height: 22,
    backgroundColor: '#FFFFFF',
    top: 50,
    left: -40,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.8,
  },
  mapRoadTwo: {
    position: 'absolute',
    width: '140%',
    height: 16,
    backgroundColor: '#FFFFFF',
    top: 118,
    left: -40,
    transform: [{ rotate: '18deg' }],
    opacity: 0.75,
  },
  mapRoadThree: {
    position: 'absolute',
    width: 18,
    height: '140%',
    backgroundColor: '#FFFFFF',
    left: 95,
    top: -35,
    transform: [{ rotate: '28deg' }],
    opacity: 0.7,
  },
  mapRoadFour: {
    position: 'absolute',
    width: 12,
    height: '130%',
    backgroundColor: '#FFFFFF',
    right: 70,
    top: -25,
    transform: [{ rotate: '-25deg' }],
    opacity: 0.7,
  },
  locationMarker: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B5E20',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 70,
  },
  mapLabel: {
    position: 'absolute',
    top: 12,
    left: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#41493E',
  },

  // App settings
  languageRow: {
    marginBottom: 20,
  },
  languageSelector: {
    minHeight: 60,
    borderWidth: 2,
    borderColor: '#717A6D',
    borderRadius: 8,
    backgroundColor: '#F4FAFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageText: {
    fontSize: 22,
    color: '#111D23',
  },
  textSizeLabel: {
    marginTop: 2,
  },
  textSizeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  textSizeButton: {
    flex: 1,
    minHeight: 60,
    borderWidth: 2,
    borderColor: '#C0C9BB',
    borderRadius: 8,
    backgroundColor: '#DDEAF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSizeButtonNormalActive: {
    borderColor: '#00450D',
    backgroundColor: '#E9F6FD',
  },
  textSizeButtonLargeActive: {
    borderColor: '#00450D',
    backgroundColor: '#1B5E20',
  },
  textSizeButtonText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111D23',
  },
  textSizeButtonTextActive: {
    color: '#00450D',
  },
  textSizeButtonTextLargeActive: {
    color: '#90D689',
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
    minWidth: 60,
    minHeight: 60,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: '#1B5E20',
  },
 navLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#41493E',
  marginTop: 4,
},
  navLabelActive: {
    color: '#90D689',
  },
  pressed: {
    opacity: 0.75,
  },
  navPressed: {
    opacity: 0.75,
  },
});
