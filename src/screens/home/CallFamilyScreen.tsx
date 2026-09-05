import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
  relation: string;
  image?: string;
};

const familyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Aman',
    relation: 'Son',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKCVi_90lEug6dfI7b3WTGnVE9X6FSgSDidooMkdN9QSRSBGnrVZzuL5M1NFO_d7QFg2qCLBIv7YZ2tJfN1Z-4UUb51kVvRXxqFWC_UGEe_etsOzFLBLO6cfaOmPlfLw66KyyIwp4a3Tobvz-06wX3W_Z-7RQyQhe_CFh7KzvDYCI9lwGiCehIbAYVIL5KW1rmpdHHu2KHwebxnWAyDZO1ZYxuZcjHFp9STVr_GC2KQgcN6wkbmOKOHQ',
  },
  {
    id: '2',
    name: 'Priya',
    relation: 'Daughter',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAo9Ok4SXvXsme7V4Ag2MLRm7X517Nt0H6ljLTYRh4Z2vXaFjXIzQ1IZaG-aWCseFNh4kdo7mj2-eVm-qjs_1UnVS30cHwTHnPl448QioG6q4rzYpfLfo2Ss1mCmbbY--T1QI5W6TetMjdQn7Kj4FcWa_OfCgz8EXDJQxFfQCWxfDPIbvrK3xBCTjKjnmW9NSRR-0c6LKK7pRyiIDJQJX5BGPT-BD3QwbQr5e-NAx0jYvWmjN2PBs1SJA',
  },
  {
    id: '3',
    name: 'Rohan',
    relation: 'Grandson',
  },
];

export default function CallFamilyScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: CallFamilyScreenProps) {
  const callFamilyMember = (member: FamilyMember) => {
    Alert.alert(
      `Call ${member.name}`,
      `Calling ${member.name} (${member.relation})...`
    );
  };

  const addFamilyMember = () => {
    Alert.alert(
      'Add Family Member',
      'Family member creation will be connected next.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
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

          <Text style={styles.headerSectionTitle}>Call Family</Text>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {familyMembers.map((member) => (
            <View key={member.id} style={styles.contactCard}>
              <View style={styles.topPattern}>
                <View style={styles.patternStripeOne} />
                <View style={styles.patternStripeTwo} />
                <View style={styles.patternStripeThree} />
              </View>

              <View style={styles.contactInfo}>
                {member.image ? (
                  <Image
                    source={{ uri: member.image }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <MaterialIcons
                      name="person"
                      size={40}
                      color="#41493E"
                    />
                  </View>
                )}

                <View style={styles.nameBlock}>
                  <Text style={styles.memberName}>
                    {member.name}
                  </Text>
                  <Text style={styles.memberRelation}>
                    {member.relation}
                  </Text>
                </View>
              </View>

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
                  size={27}
                  color="#FFFFFF"
                />
                <Text style={styles.callButtonText}>Call</Text>
              </Pressable>
            </View>
          ))}

          {/* Add Family Member */}
          <Pressable
            onPress={addFamilyMember}
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
    paddingTop: 24,
    paddingBottom: 115,
  },
  contactCard: {
    minHeight: 116,
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#D7E4EC',
    marginRight: 16,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F0F8',
    borderWidth: 2,
    borderColor: '#D7E4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nameBlock: {
    flexShrink: 1,
  },
  memberName: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#111D23',
  },
  memberRelation: {
    marginTop: 3,
    fontSize: 18,
    lineHeight: 28,
    color: '#41493E',
  },
  callButton: {
    minHeight: 60,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: '#00450D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  callButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },

  // Add member
  addFamilyButton: {
    width: '100%',
    minHeight: 120,
    marginTop: 8,
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#00450D',
    textAlign: 'center',
  },
  addPressed: {
    backgroundColor: '#E9F6FD',
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
