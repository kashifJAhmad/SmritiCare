import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

type MedicalHelpScreenProps = {
  onBack?: () => void;
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
  tertiaryContainer: "#E7C9B9",

  error: "#9B3F32",
  errorContainer: "#E7C9B9",
  onErrorContainer: "#7F2F27",

  text: "#1B1C17",
  textSecondary: "#565A52",

  white: "#FFFFFF",

  outline: "#72766D",
  outlineVariant: "#CDD2C8",
};

export default function MedicalHelpScreen({
  onBack,
}: MedicalHelpScreenProps) {
  const [message, setMessage] = useState("");

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    Alert.alert(
      "SmritiCare Assistant",
      `You said:\n\n${trimmedMessage}`,
    );

    setMessage("");
  };

  const handleCallHospital = () => {
    Alert.alert(
      "Call Hospital",
      "Calling City General Hospital...",
    );
  };

  const handleNearbyCenters = () => {
    Alert.alert(
      "Nearby Care Centers",
      "Nearby care centers will be shown here.",
    );
  };

  const handleSOS = () => {
    Alert.alert(
      "SOS Emergency",
      "Are you sure you want to contact emergency services?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call Emergency",
          style: "destructive",
          onPress: () => {
            console.log("Emergency call requested");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              size={30}
              color={COLORS.primary}
            />

            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Medical Help
          </Text>
        </View>

        {/* Main content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Assistant */}
          <View style={styles.assistantCard}>
            <View style={styles.topAccent} />

            <View style={styles.assistantIcon}>
              <MaterialIcons
                name="smart-toy"
                size={30}
                color={COLORS.onPrimaryContainer}
              />
            </View>

            <View style={styles.assistantText}>
              <Text style={styles.assistantTitle}>
                SmritiCare Assistant
              </Text>

              <Text style={styles.assistantMessage}>
                Hello! How are you feeling today? I'm here
                to help with any health concerns.
              </Text>
            </View>
          </View>

          {/* Emergency warning */}
          <View style={styles.warningBox}>
            <MaterialIcons
              name="warning"
              size={24}
              color={COLORS.error}
            />

            <Text style={styles.emergencyWarning}>
              For emergencies, please contact your caregiver
              or emergency services.
            </Text>
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>

            <View style={styles.chipsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() =>
                  handleQuickAction("I have a headache")
                }
              >
                <MaterialIcons
                  name="sick"
                  size={25}
                  color={COLORS.primary}
                />

                <Text style={styles.chipText}>
                  I have a headache
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() =>
                  handleQuickAction("Feeling dizzy")
                }
              >
                <MaterialIcons
                  name="screen-rotation"
                  size={25}
                  color={COLORS.primary}
                />

                <Text style={styles.chipText}>
                  Feeling dizzy
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() =>
                  handleQuickAction("Medication reminder")
                }
              >
                <MaterialIcons
                  name="medication"
                  size={25}
                  color={COLORS.primary}
                />

                <Text style={styles.chipText}>
                  Medication reminder
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Hospital */}
          <View style={styles.hospitalCard}>
            <View style={styles.hospitalAccent}>
              <View style={styles.accentPrimary} />
              <View style={styles.accentSecondary} />
              <View style={styles.accentTertiary} />
            </View>

            <View style={styles.hospitalHeader}>
              <View style={styles.hospitalIcon}>
                <MaterialIcons
                  name="local-hospital"
                  size={32}
                  color={COLORS.error}
                />
              </View>

              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalTitle}>
                  City General Hospital
                </Text>

                <View style={styles.locationRow}>
                  <MaterialIcons
                    name="location-on"
                    size={19}
                    color={COLORS.secondary}
                  />

                  <Text style={styles.locationText}>
                    1.2 km away
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.callHospitalButton,
                pressed && styles.callButtonPressed,
              ]}
              onPress={handleCallHospital}
            >
              <MaterialIcons
                name="call"
                size={27}
                color={COLORS.onPrimary}
              />

              <Text style={styles.callHospitalText}>
                Call Hospital
              </Text>
            </Pressable>
          </View>

          {/* Secondary actions */}
          <View style={styles.secondaryGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryCard,
                pressed && styles.secondaryPressed,
              ]}
              onPress={handleNearbyCenters}
            >
              <View style={styles.secondaryIcon}>
                <MaterialIcons
                  name="map"
                  size={38}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.secondaryCardText}>
                Nearby Care Centers
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryCard,
                styles.sosCard,
                pressed && styles.sosPressed,
              ]}
              onPress={handleSOS}
            >
              <View style={styles.sosIcon}>
                <MaterialIcons
                  name="sos"
                  size={38}
                  color={COLORS.error}
                />
              </View>

              <Text style={styles.sosText}>
                SOS Emergency
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Chat input */}
        <View style={styles.chatArea}>
          <View style={styles.chatRow}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your health concern here..."
              placeholderTextColor={COLORS.outline}
              style={styles.chatInput}
              multiline
              maxLength={500}
              accessibilityLabel="Health concern"
            />

            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendPressed,
              ]}
              onPress={handleSend}
              accessibilityRole="button"
              accessibilityLabel="Send health concern"
            >
              <MaterialIcons
                name="send"
                size={28}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 145,
  },

  header: {
    minHeight: 76,
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

  headerTitle: {
    flex: 1,
    marginLeft: 14,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800",
    color: COLORS.text,
  },

  assistantCard: {
    position: "relative",
    overflow: "hidden",
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  topAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    backgroundColor: COLORS.primary,
  },

  assistantIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  assistantText: {
    flex: 1,
    marginLeft: 15,
  },

  assistantTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: COLORS.primary,
  },

  assistantMessage: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 25,
    color: COLORS.textSecondary,
  },

  warningBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.errorContainer,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  emergencyWarning: {
    flex: 1,
    marginLeft: 9,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: COLORS.onErrorContainer,
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: COLORS.text,
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    minHeight: 52,
    paddingHorizontal: 17,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  chipPressed: {
    backgroundColor: COLORS.surfaceLow,
    transform: [{ scale: 0.98 }],
  },

  chipText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: COLORS.primary,
  },

  hospitalCard: {
    position: "relative",
    overflow: "hidden",
    marginTop: 22,
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  hospitalAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: "row",
  },

  accentPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  accentSecondary: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  accentTertiary: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },

  hospitalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  hospitalIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: COLORS.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  hospitalInfo: {
    flex: 1,
    marginLeft: 14,
  },

  hospitalTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: COLORS.text,
  },

  locationRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  locationText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  callHospitalButton: {
    minHeight: 58,
    marginTop: 18,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  callButtonPressed: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.98 }],
  },

  callHospitalText: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.white,
  },

  secondaryGrid: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
  },

  secondaryCard: {
    flex: 1,
    minHeight: 145,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryPressed: {
    backgroundColor: COLORS.surfaceLow,
  },

  secondaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryCardText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.text,
  },

  sosCard: {
    backgroundColor: COLORS.errorContainer,
    borderColor: COLORS.error,
  },

  sosPressed: {
    transform: [{ scale: 0.98 }],
  },

  sosIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  sosText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.onErrorContainer,
  },

  chatArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  chatRow: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  chatInput: {
    flex: 1,
    minHeight: 58,
    maxHeight: 115,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
  },

  sendButton: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  sendPressed: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.95 }],
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

});