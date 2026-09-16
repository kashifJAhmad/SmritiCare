import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const COLORS = {
  background: "#FBF9F1",
  surface: "#FBF9F1",
  surfaceLowest: "#FFFFFF",

  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#D7E7D2",

  secondary: "#8A6040",
  secondaryContainer: "#E7EFE3",
  secondaryFixedDim: "#C5D8C1",

  tertiary: "#9B3F32",
  tertiaryFixed: "#E7C9B9",
  onTertiaryFixed: "#68472F",

  surfaceContainerLow: "#F1F0E7",
  surfaceContainerHigh: "#E9E7DE",
  surfaceVariant: "#DDDCD3",

  outlineVariant: "#CDD2C8",

  onSurface: "#1B1C17",
  onSurfaceVariant: "#565A52",
};

type VoiceAssistantScreenProps = {
  onBack: () => void;
  onProfile: () => void;
  onMedicine?: () => void;
  onFamily?: () => void;
  onGame?: () => void;
  onSchedule?: () => void;
};

type AssistantState =
  | "idle"
  | "listening"
  | "processing"
  | "error";

type VoiceCommand =
  | "medicine"
  | "family"
  | "game"
  | "schedule"
  | "profile"
  | "unknown";

function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"]/g, " ")
    .replace(/\s+/g, " ");
}

function detectCommand(text: string): VoiceCommand {
  const normalized = normalizeSpeech(text);

  if (!normalized) {
    return "unknown";
  }

  // ---------------------------------------------------------
  // MEDICINE
  // ---------------------------------------------------------

  if (
    normalized.includes("medicine") ||
    normalized.includes("medication") ||
    normalized.includes("take my medicine") ||
    normalized.includes("take medicine") ||
    normalized.includes("medicine reminder") ||
    normalized.includes("remind me to take")
  ) {
    return "medicine";
  }

  // ---------------------------------------------------------
  // FAMILY
  // ---------------------------------------------------------

  if (
    normalized.includes("call my family") ||
    normalized.includes("call family") ||
    normalized.includes("family call") ||
    normalized.includes("family")
  ) {
    return "family";
  }

  // ---------------------------------------------------------
  // MEMORY GAME
  // ---------------------------------------------------------

  if (
    normalized.includes("memory game") ||
    normalized.includes("memory games") ||
    normalized.includes("play a game") ||
    normalized.includes("play game") ||
    normalized.includes("start a game") ||
    normalized.includes("open memory game")
  ) {
    return "game";
  }

  // ---------------------------------------------------------
  // SCHEDULE
  // ---------------------------------------------------------

  if (
    normalized.includes("schedule") ||
    normalized.includes("reminder schedule") ||
    normalized.includes("show my schedule") ||
    normalized.includes("open my schedule") ||
    normalized.includes("today's schedule") ||
    normalized.includes("today schedule")
  ) {
    return "schedule";
  }

  // ---------------------------------------------------------
  // PROFILE
  // ---------------------------------------------------------

  if (
    normalized === "profile" ||
    normalized.includes("my profile") ||
    normalized.includes("open profile") ||
    normalized.includes("show my profile")
  ) {
    return "profile";
  }

  return "unknown";
}

export default function VoiceAssistantScreen({
  onBack,
  onProfile,
  onMedicine,
  onFamily,
  onGame,
  onSchedule,
}: VoiceAssistantScreenProps) {
  const [assistantState, setAssistantState] =
    useState<AssistantState>("idle");

  const [message, setMessage] = useState(
    "How can I help you today?",
  );

  const [transcript, setTranscript] =
    useState("");

  const [speechAvailable, setSpeechAvailable] =
    useState(true);

  const commandExecutedRef =
    useRef(false);

  const lastTranscriptRef =
    useRef("");

  // =========================================================
  // PULSE ANIMATION
  // =========================================================

  const pulse1 = useRef(
    new Animated.Value(0.8),
  ).current;

  const pulse2 = useRef(
    new Animated.Value(0.8),
  ).current;

  useEffect(() => {
    const animation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, {
          toValue: 1.8,
          duration: 3000,
          useNativeDriver: true,
        }),

        Animated.timing(pulse1, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const animation2 = Animated.loop(
      Animated.sequence([
        Animated.delay(1500),

        Animated.timing(pulse2, {
          toValue: 1.8,
          duration: 3000,
          useNativeDriver: true,
        }),

        Animated.timing(pulse2, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation1.start();
    animation2.start();

    return () => {
      animation1.stop();
      animation2.stop();
    };
  }, [pulse1, pulse2]);

  // =========================================================
  // CHECK SPEECH AVAILABILITY
  // =========================================================

  useEffect(() => {
    try {
      const available =
        ExpoSpeechRecognitionModule.isRecognitionAvailable();

      setSpeechAvailable(available);

      if (!available) {
        setAssistantState("error");

        setMessage(
          "Speech recognition is not available on this device.",
        );
      }
    } catch (error) {
      console.warn(
        "SmritiCare: speech recognition availability check failed:",
        error,
      );

      setSpeechAvailable(false);
    }
  }, []);

  // =========================================================
  // SPEECH START EVENT
  // =========================================================

  useSpeechRecognitionEvent("start", () => {
    setAssistantState("listening");
    setMessage("Listening... speak now");
  });

  // =========================================================
  // SPEECH RESULT EVENT
  // =========================================================

  useSpeechRecognitionEvent(
    "result",
    (event: any) => {
      const result =
        event.results?.[0];

      const spokenText =
        result?.transcript?.trim() ?? "";

      if (!spokenText) {
        return;
      }

      setTranscript(spokenText);
      lastTranscriptRef.current =
        spokenText;

      /*
       * We display interim results while the
       * user is still speaking.
       */
      if (!event.isFinal) {
        setAssistantState("listening");
        setMessage("I can hear you...");
        return;
      }

      if (commandExecutedRef.current) {
        return;
      }

      commandExecutedRef.current = true;

      processTranscript(spokenText);
    },
  );

  // =========================================================
  // SPEECH END EVENT
  // =========================================================

  useSpeechRecognitionEvent("end", () => {
    /*
     * If a final result already executed a command,
     * remain idle.
     */
    if (commandExecutedRef.current) {
      setAssistantState("idle");
      return;
    }

    /*
     * Sometimes the native recognizer ends without
     * returning a final result.
     */
    if (!lastTranscriptRef.current) {
      setAssistantState("idle");

      setMessage(
        "I didn't hear anything. Please try again.",
      );
    }
  });

  // =========================================================
  // SPEECH ERROR EVENT
  // =========================================================

  useSpeechRecognitionEvent(
    "error",
    (event: any) => {
      console.warn(
        "SmritiCare: speech recognition error:",
        event.error,
        event.message,
      );

      /*
       * `aborted` can happen when we intentionally
       * stop recognition. It should not show an
       * alarming error to the user.
       */
      if (event.error === "aborted") {
        setAssistantState("idle");
        return;
      }

      if (event.error === "no-speech") {
        setAssistantState("idle");

        setMessage(
          "I didn't hear anything. Please try again.",
        );

        return;
      }

      if (event.error === "not-allowed") {
        setAssistantState("error");

        setMessage(
          "Microphone permission is needed to use Voice Assistant.",
        );

        return;
      }

      if (
        event.error ===
        "service-not-allowed"
      ) {
        setAssistantState("error");

        setMessage(
          "Speech recognition is unavailable on this device.",
        );

        return;
      }

      setAssistantState("error");

      setMessage(
        "Something went wrong with voice recognition. Please try again.",
      );
    },
  );

  // =========================================================
  // SPEECH NOMATCH
  // =========================================================

  useSpeechRecognitionEvent(
    "nomatch",
    () => {
      setAssistantState("idle");

      setMessage(
        "I couldn't understand that. Please try again.",
      );
    },
  );

  // =========================================================
  // COMMAND EXECUTION
  // =========================================================

  const executeCommand = (
    command: VoiceCommand,
  ) => {
    switch (command) {
      case "medicine":
        setMessage(
          "Opening medicine reminder...",
        );

        setTimeout(() => {
          onMedicine?.();
        }, 400);

        break;

      case "family":
        setMessage(
          "Opening family call...",
        );

        setTimeout(() => {
          onFamily?.();
        }, 400);

        break;

      case "game":
        setMessage(
          "Opening memory games...",
        );

        setTimeout(() => {
          onGame?.();
        }, 400);

        break;

      case "schedule":
        setMessage(
          "Opening your schedule...",
        );

        setTimeout(() => {
          onSchedule?.();
        }, 400);

        break;

      case "profile":
        setMessage(
          "Opening your profile...",
        );

        setTimeout(() => {
          onProfile();
        }, 400);

        break;

      case "unknown":
      default:
        setAssistantState("error");

        setMessage(
          "I can help with medicine reminders, family calls, memory games, schedules, or your profile.",
        );

        break;
    }
  };

  // =========================================================
  // PROCESS TRANSCRIPT
  // =========================================================

  const processTranscript = (
    spokenText: string,
  ) => {
    const cleanText =
      spokenText.trim();

    if (!cleanText) {
      setAssistantState("idle");

      setTranscript("");

      setMessage(
        "I didn't hear anything. Please try again.",
      );

      return;
    }

    setTranscript(cleanText);

    setAssistantState("processing");

    setMessage(
      "Processing your request...",
    );

    const command =
      detectCommand(cleanText);

    setTimeout(() => {
      executeCommand(command);

      if (command !== "unknown") {
        setAssistantState("idle");
      }
    }, 350);
  };

  // =========================================================
  // START LISTENING
  // =========================================================

  const startListening = async () => {
    if (
      assistantState === "processing" ||
      assistantState === "listening"
    ) {
      return;
    }

    if (!speechAvailable) {
      setAssistantState("error");

      setMessage(
        "Speech recognition is not available on this device.",
      );

      return;
    }

    commandExecutedRef.current =
      false;

    lastTranscriptRef.current =
      "";

    setTranscript("");

    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        setAssistantState("error");

        setMessage(
          "Microphone permission is needed to use Voice Assistant.",
        );

        return;
      }

      setAssistantState("listening");

      setMessage(
        "Listening... speak now",
      );

      ExpoSpeechRecognitionModule.start(
        {
          lang: "en-US",
          interimResults: true,
          continuous: false,
        },
      );
    } catch (error) {
      console.warn(
        "SmritiCare: unable to start speech recognition:",
        error,
      );

      setAssistantState("error");

      setMessage(
        "Unable to start voice recognition. Please try again.",
      );
    }
  };

  // =========================================================
  // STOP LISTENING
  // =========================================================

  const stopListening = () => {
    if (
      assistantState !== "listening"
    ) {
      return;
    }

    try {
      ExpoSpeechRecognitionModule.stop();

      setAssistantState("processing");

      setMessage(
        "Processing your request...",
      );
    } catch (error) {
      console.warn(
        "SmritiCare: unable to stop speech recognition:",
        error,
      );

      setAssistantState("error");

      setMessage(
        "Unable to finish voice recognition. Please try again.",
      );
    }
  };

  // =========================================================
  // SUGGESTION ACTIONS
  // =========================================================

  const handleMedicine = () => {
    if (
      assistantState === "processing"
    ) {
      return;
    }

    setTranscript("");

    setAssistantState("processing");

    setMessage(
      "Opening medicine reminder...",
    );

    setTimeout(() => {
      setAssistantState("idle");
      onMedicine?.();
    }, 300);
  };

  const handleFamily = () => {
    if (
      assistantState === "processing"
    ) {
      return;
    }

    setTranscript("");

    setAssistantState("processing");

    setMessage(
      "Opening family call...",
    );

    setTimeout(() => {
      setAssistantState("idle");
      onFamily?.();
    }, 300);
  };

  const handleGame = () => {
    if (
      assistantState === "processing"
    ) {
      return;
    }

    setTranscript("");

    setAssistantState("processing");

    setMessage(
      "Opening memory games...",
    );

    setTimeout(() => {
      setAssistantState("idle");
      onGame?.();
    }, 300);
  };

  const handleSchedule = () => {
    if (
      assistantState === "processing"
    ) {
      return;
    }

    setTranscript("");

    setAssistantState("processing");

    setMessage(
      "Opening your schedule...",
    );

    setTimeout(() => {
      setAssistantState("idle");
      onSchedule?.();
    }, 300);
  };

  // =========================================================
  // STATE HELPERS
  // =========================================================

  const isListening =
    assistantState === "listening";

  const isProcessing =
    assistantState === "processing";

  // =========================================================
  // SCREEN
  // =========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.headerButton,
            pressed &&
              styles.headerButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <MaterialIcons
            name="arrow-back"
            size={28}
            color={COLORS.primary}
          />
        </Pressable>

        <Text
          style={styles.headerTitle}
          pointerEvents="none"
        >
          SmritiCare
        </Text>

        <Pressable
          onPress={onProfile}
          style={({ pressed }) => [
            styles.profilePlaceholder,
            pressed &&
              styles.headerButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={10}
        >
          <MaterialIcons
            name="person"
            size={24}
            color={
              COLORS.onSurfaceVariant
            }
          />
        </Pressable>
      </View>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ===================================================
            STATUS
        =================================================== */}

        <View style={styles.statusArea}>
          <Text style={styles.statusTitle}>
            {isListening
              ? "I'm listening..."
              : isProcessing
                ? "Working..."
                : "Voice Assistant"}
          </Text>

          <Text style={styles.statusSubtitle}>
            {message}
          </Text>

          {transcript.length > 0 && (
            <View
              style={
                styles.transcriptBox
              }
            >
              <Text
                style={
                  styles.transcriptLabel
                }
              >
                I heard:
              </Text>

              <Text
                style={
                  styles.transcriptText
                }
              >
                "{transcript}"
              </Text>
            </View>
          )}
        </View>

        {/* ===================================================
            MICROPHONE
        =================================================== */}

        <View
          style={
            styles.microphoneArea
          }
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                transform: [
                  {
                    scale: pulse1,
                  },
                ],
                opacity: isListening
                  ? 0.5
                  : 0.2,
              },
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRingSecond,
              {
                transform: [
                  {
                    scale: pulse2,
                  },
                ],
                opacity: isListening
                  ? 0.4
                  : 0.15,
              },
            ]}
          />

          <Pressable
            onPressIn={startListening}
            onPressOut={stopListening}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.microphoneButton,

              isListening &&
                styles.microphoneListening,

              isProcessing &&
                styles.microphoneProcessing,

              pressed &&
                !isProcessing &&
                styles.microphonePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hold to speak"
            accessibilityState={{
              busy: isProcessing,
            }}
          >
            {isProcessing ? (
              <ActivityIndicator
                size="large"
                color={
                  COLORS.onPrimary
                }
              />
            ) : (
              <MaterialIcons
                name={
                  isListening
                    ? "mic"
                    : "mic-none"
                }
                size={64}
                color={
                  COLORS.onPrimary
                }
              />
            )}
          </Pressable>
        </View>

        {/* HOLD MESSAGE */}

        <Text style={styles.holdText}>
          {isListening
            ? "Release to stop"
            : isProcessing
              ? "Please wait..."
              : "Press and hold to speak"}
        </Text>

        {/* ===================================================
            SUGGESTIONS
        =================================================== */}

        <View
          style={
            styles.suggestionsSection
          }
        >
          <Text style={styles.tryText}>
            Try saying things like:
          </Text>

          {/* MEDICINE */}

          <Pressable
            onPress={handleMedicine}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Remind me to take my medicine"
          >
            <View
              style={
                styles.commandIconGreen
              }
            >
              <MaterialIcons
                name="medication"
                size={28}
                color={
                  COLORS.onPrimaryContainer
                }
              />
            </View>

            <Text
              style={styles.commandText}
            >
              "Remind me to take my medicine"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          {/* FAMILY */}

          <Pressable
            onPress={handleFamily}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Call my family"
          >
            <View
              style={
                styles.commandIconSecondary
              }
            >
              <MaterialIcons
                name="call"
                size={28}
                color={COLORS.secondary}
              />
            </View>

            <Text
              style={styles.commandText}
            >
              "Call my family"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          {/* MEMORY GAME */}

          <Pressable
            onPress={handleGame}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Start a memory game"
          >
            <View
              style={
                styles.commandIconTertiary
              }
            >
              <MaterialIcons
                name="extension"
                size={28}
                color={
                  COLORS.onTertiaryFixed
                }
              />
            </View>

            <Text
              style={styles.commandText}
            >
              "Start a memory game"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          {/* SCHEDULE */}

          <Pressable
            onPress={handleSchedule}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.commandCard,
              pressed &&
                styles.commandPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Show my schedule"
          >
            <View
              style={
                styles.commandIconPrimaryFixed
              }
            >
              <MaterialIcons
                name="calendar-month"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <Text
              style={styles.commandText}
            >
              "Show my schedule"
            </Text>

            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  header: {
    height: 64,
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,

    backgroundColor:
      COLORS.surface,

    borderBottomWidth: 2,
    borderBottomColor:
      COLORS.secondary,

    position: "relative",
  },

  headerButton: {
    width: 56,
    height: 56,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 28,

    zIndex: 10,
    elevation: 10,
  },

  headerButtonPressed: {
    backgroundColor:
      COLORS.surfaceContainerHigh,
  },

  headerTitle: {
    flex: 1,

    textAlign: "center",

    fontSize: 28,
    lineHeight: 34,

    fontWeight: "700",

    color: COLORS.primary,

    marginHorizontal: 8,
  },

  profilePlaceholder: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      COLORS.surfaceContainerHigh,

    borderWidth: 2,
    borderColor:
      COLORS.outlineVariant,

    zIndex: 10,
    elevation: 10,
  },

  content: {
    flexGrow: 1,

    width: "100%",
    maxWidth: 1024,

    alignSelf: "center",

    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,

    alignItems: "center",
  },

  statusArea: {
    width: "100%",
    maxWidth: 500,

    alignItems: "center",

    marginBottom: 30,
  },

  statusTitle: {
    textAlign: "center",

    fontSize: 36,
    lineHeight: 44,

    fontWeight: "700",

    color: COLORS.primary,
  },

  statusSubtitle: {
    marginTop: 12,

    textAlign: "center",

    fontSize: 22,
    lineHeight: 30,

    color:
      COLORS.onSurfaceVariant,
  },

  transcriptBox: {
    width: "100%",

    marginTop: 18,

    paddingHorizontal: 18,
    paddingVertical: 14,

    borderRadius: 14,

    backgroundColor:
      COLORS.surfaceContainerLow,

    borderWidth: 1,
    borderColor:
      COLORS.outlineVariant,
  },

  transcriptLabel: {
    fontSize: 15,

    fontWeight: "700",

    color:
      COLORS.onSurfaceVariant,

    marginBottom: 4,
  },

  transcriptText: {
    fontSize: 19,
    lineHeight: 27,

    color: COLORS.onSurface,

    textAlign: "center",
  },

  microphoneArea: {
    width: 288,
    height: 288,

    alignItems: "center",
    justifyContent: "center",

    marginVertical: 10,
  },

  pulseRing: {
    position: "absolute",

    width: 230,
    height: 230,

    borderRadius: 115,

    backgroundColor:
      COLORS.primaryContainer,
  },

  pulseRingSecond: {
    position: "absolute",

    width: 210,
    height: 210,

    borderRadius: 105,

    backgroundColor:
      COLORS.primaryContainer,
  },

  microphoneButton: {
    width: 160,
    height: 160,

    borderRadius: 80,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      COLORS.primary,

    borderWidth: 4,
    borderColor:
      COLORS.surfaceLowest,

    elevation: 8,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.15,

    shadowRadius: 12,

    zIndex: 10,
  },

  microphoneListening: {
    backgroundColor:
      COLORS.primaryContainer,

    transform: [
      {
        scale: 1.05,
      },
    ],
  },

  microphoneProcessing: {
    opacity: 0.85,
  },

  microphonePressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  holdText: {
    marginTop: -10,
    marginBottom: 20,

    fontSize: 18,

    fontWeight: "600",

    color:
      COLORS.onSurfaceVariant,
  },

  suggestionsSection: {
    width: "100%",
    maxWidth: 700,

    alignItems: "center",

    marginTop: 20,

    gap: 16,
  },

  tryText: {
    marginBottom: 4,

    paddingHorizontal: 16,
    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.surfaceVariant,

    fontSize: 18,
    lineHeight: 24,

    fontWeight: "600",

    color:
      COLORS.onSurfaceVariant,
  },

  commandCard: {
    width: "100%",

    minHeight: 82,

    flexDirection: "row",
    alignItems: "center",

    padding: 16,

    borderRadius: 12,

    borderWidth: 2,

    borderColor:
      COLORS.secondaryFixedDim,

    backgroundColor:
      COLORS.surfaceLowest,

    elevation: 2,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,

    shadowRadius: 8,

    zIndex: 5,
  },

  commandPressed: {
    backgroundColor:
      COLORS.surfaceContainerLow,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  commandIconGreen: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 16,

    backgroundColor:
      COLORS.primaryContainer,
  },

  commandIconSecondary: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 16,

    backgroundColor:
      COLORS.secondaryContainer,
  },

  commandIconTertiary: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 16,

    backgroundColor:
      COLORS.tertiaryFixed,
  },

  commandIconPrimaryFixed: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 16,

    backgroundColor: "#B9D2B3",
  },

  commandText: {
    flex: 1,

    fontSize: 20,
    lineHeight: 28,

    color: COLORS.onSurface,
  },
});