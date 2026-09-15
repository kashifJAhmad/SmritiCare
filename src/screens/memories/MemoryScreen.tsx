import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import QuickAssist from "../../components/QuickAssist";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { getToken } from "../../services/authStorage";
import { API_BASE_URL } from "../../constants/api";
import {
  getLocalMemories,
  createMemoryLocally,
  deleteMemoryLocally,
  upsertServerMemories,
} from "../../database/repositories/memoryRepository";
import { syncManager } from "../../services/syncManager";
import { networkMonitor } from "../../services/networkMonitor";

type MemoryType = "text" | "photo" | "voice";

type Memory = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  type?: MemoryType;
  createdAt: string;
};

type Props = {
  userId?: string;
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
  onVoiceAssistant?: () => void;
};

const COLORS = {
  background: "#FBF9F1",
  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",
  surfaceHigh: "#E3E2D9",
  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  primaryFixed: "#B9D2B3",
  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  tertiary: "#A65D43",
  onSurface: "#1B1C17",
  onSurfaceVariant: "#565A52",
  outline: "#72766D",
  outlineVariant: "#CDD2C8",
  error: "#9B3F32",
  errorContainer: "#E7C9B9",
  onErrorContainer: "#7F2F27",
};

export default function MemoryScreen({
  userId,
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
  onVoiceAssistant,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const [memoryType, setMemoryType] =
    useState<MemoryType>("text");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [recordedAudio, setRecordedAudio] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const recorderState =
    useAudioRecorderState(recorder);

  const recording = recorderState.isRecording;

  useEffect(() => {
    loadMemories();
  }, [userId]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || "patient_local";

      // 1. Instant offline load from SQLite
      const local = await getLocalMemories(targetUserId);
      if (local && local.length > 0) {
        setMemories(local as any);
      }

      // 2. Fetch server updates if online
      const token = await getToken();
      if (token && networkMonitor.getIsOnline()) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/memories`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && Array.isArray(data.memories)) {
            await upsertServerMemories(targetUserId, data.memories);
            const refreshed = await getLocalMemories(targetUserId);
            setMemories(refreshed as any);
          }
        } catch (netErr) {
          console.log("MemoryScreen: network fetch skipped or offline", netErr);
        }
      }
    } catch (error) {
      console.error("LOAD MEMORIES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedImage(null);
    setRecordedAudio(null);
    setMemoryType("text");
  };

  const selectMemoryType = (type: MemoryType) => {
    if (recording) {
      Alert.alert(
        "Recording in progress",
        "Please stop the recording first."
      );
      return;
    }

    setMemoryType(type);

    if (type !== "photo") {
      setSelectedImage(null);
    }

    if (type !== "voice") {
      setRecordedAudio(null);
    }
  };

  const saveTextMemory = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Title required",
        "Please enter a title for this memory."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Description required",
        "Please write something about this memory."
      );
      return;
    }

    try {
      setSaving(true);
      const targetUserId = userId || "patient_local";

      const created = await createMemoryLocally({
        userId: targetUserId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || "Text",
        type: "text",
      });

      setMemories((prev) => [created as any, ...prev]);
      resetForm();

      syncManager.triggerSync().catch(() => {});

      Alert.alert(
        "Memory saved",
        "Your text memory has been saved successfully."
      );
    } catch (error) {
      console.error("SAVE TEXT MEMORY ERROR:", error);
      Alert.alert(
        "Unable to save",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission",
          "Please allow SmritiCare to access your photos."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        setRecordedAudio(null);
      }
    } catch (error) {
      console.error("CHOOSE PHOTO ERROR:", error);

      Alert.alert(
        "Photo error",
        error instanceof Error
          ? error.message
          : "Unable to open your photo library."
      );
    }
  };

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission",
          "Please allow SmritiCare to use the camera."
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const uri = result.assets[0].uri;

        console.log("CAMERA IMAGE URI:", uri);

        setSelectedImage(uri);
        setRecordedAudio(null);
      }
    } catch (error) {
      console.error("CAMERA ERROR:", error);

      Alert.alert(
        "Camera error",
        error instanceof Error
          ? error.message
          : "Unable to open the camera."
      );
    }
  };

  const uploadMemoryFile = async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    memoryType: "photo" | "voice",
    token: string,
  ) => {
    const uploadResult = await FileSystem.uploadAsync(
      `${API_BASE_URL}/api/memories/upload`,
      fileUri,
      {
        fieldName: "file",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType,
        parameters: {
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || (memoryType === "photo" ? "Photo" : "Voice"),
          type: memoryType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    let data: any = {};

    try {
      data = uploadResult.body
        ? JSON.parse(uploadResult.body)
        : {};
    } catch {
      data = {};
    }

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(
        data.message ||
          `Upload failed with status ${uploadResult.status}.`,
      );
    }

    return data;
  };

  const savePhotoMemory = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Title required",
        "Please enter a title for this memory."
      );
      return;
    }

    if (!selectedImage) {
      Alert.alert(
        "Photo required",
        "Please choose or take a photo first."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const fileName = `memory-${Date.now()}.jpg`;

      console.log("UPLOADING PHOTO:", {
        uri: selectedImage,
        fileName,
        platform: Platform.OS,
      });

      await uploadMemoryFile(
        selectedImage,
        fileName,
        "image/jpeg",
        "photo",
        token,
      );

      resetForm();
      await loadMemories();

      Alert.alert(
        "Memory saved",
        "Your photo memory has been saved successfully."
      );
    } catch (error) {
      console.error("PHOTO UPLOAD ERROR:", error);

      Alert.alert(
        "Unable to save photo",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const startRecording = async () => {
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission",
          "Please allow SmritiCare to use the microphone."
        );
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      setSelectedImage(null);
      setRecordedAudio(null);
    } catch (error) {
      console.error(
        "START RECORDING ERROR:",
        error
      );

      Alert.alert(
        "Recording error",
        error instanceof Error
          ? error.message
          : "Unable to start recording."
      );
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();

      const uri = recorder.uri;

      if (uri) {
        setRecordedAudio(uri);
      }
    } catch (error) {
      console.error(
        "STOP RECORDING ERROR:",
        error
      );

      Alert.alert(
        "Recording error",
        error instanceof Error
          ? error.message
          : "Unable to stop recording."
      );
    }
  };

  const saveVoiceMemory = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Title required",
        "Please enter a title for this memory."
      );
      return;
    }

    if (!recordedAudio) {
      Alert.alert(
        "Recording required",
        "Please record your memory first."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const fileName = `memory-${Date.now()}.m4a`;

      await uploadMemoryFile(
        recordedAudio,
        fileName,
        "audio/mp4",
        "voice",
        token,
      );

      resetForm();
      await loadMemories();

      Alert.alert(
        "Memory saved",
        "Your voice memory has been saved successfully."
      );
    } catch (error) {
      console.error("VOICE UPLOAD ERROR:", error);

      Alert.alert(
        "Unable to save",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveMemory = async () => {
    if (memoryType === "text") {
      await saveTextMemory();
      return;
    }

    if (memoryType === "photo") {
      await savePhotoMemory();
      return;
    }

    await saveVoiceMemory();
  };

  const deleteMemory = async (id: string) => {
    const performDelete = async () => {
      try {
        const targetUserId = userId || "patient_local";
        await deleteMemoryLocally(targetUserId, id);

        setMemories((current) =>
          current.filter(
            (memory) => memory.id !== id
          )
        );

        syncManager.triggerSync().catch(() => {});
      } catch (error) {
        Alert.alert(
          "Delete failed",
          error instanceof Error
            ? error.message
            : "Please try again."
        );
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this memory?"
      );

      if (confirmed) {
        await performDelete();
      }

      return;
    }

    Alert.alert(
      "Delete memory?",
      "This memory will be removed permanently.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDelete,
        },
      ]
    );
  };

  const openAudio = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to play",
        "The voice recording could not be opened."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            isMobile && styles.contentMobile,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {onBack && (
              <Pressable
                style={styles.backButton}
                onPress={onBack}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={25}
                  color={COLORS.primary}
                />
                <Text style={styles.backText}>
                  Back
                </Text>
              </Pressable>
            )}

            <Text style={styles.title}>
              My Memories
            </Text>

            <Text style={styles.subtitle}>
              Save important people, places,
              moments and stories.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Add a memory
            </Text>

            <Text style={styles.typeLabel}>
              How would you like to save it?
            </Text>

            <View
              style={[
                styles.typeRow,
                isMobile && styles.typeRowMobile,
              ]}
            >
              <TypeButton
                icon="📝"
                label="Text"
                active={memoryType === "text"}
                onPress={() =>
                  selectMemoryType("text")
                }
              />

              <TypeButton
                icon="📷"
                label="Photo"
                active={memoryType === "photo"}
                onPress={() =>
                  selectMemoryType("photo")
                }
              />

              <TypeButton
                icon="🎙️"
                label="Voice"
                active={memoryType === "voice"}
                onPress={() =>
                  selectMemoryType("voice")
                }
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Memory title"
              placeholderTextColor={COLORS.outline}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={
                memoryType === "voice"
                  ? "Add a description or note about this recording"
                  : "Tell us about this memory"
              }
              placeholderTextColor={COLORS.outline}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Category (optional)"
              placeholderTextColor={COLORS.outline}
              value={category}
              onChangeText={setCategory}
            />

            {memoryType === "text" && (
              <Pressable
                style={[
                  styles.saveButton,
                  saving &&
                    styles.saveButtonDisabled,
                ]}
                onPress={saveMemory}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator
                    color={COLORS.onPrimary}
                  />
                ) : (
                  <Text
                    style={styles.saveButtonText}
                  >
                    Save Memory
                  </Text>
                )}
              </Pressable>
            )}

            {memoryType === "photo" && (
              <>
                <View
                  style={[
                    styles.actionRow,
                    isMobile &&
                      styles.actionRowMobile,
                  ]}
                >
                  <Pressable
                    style={styles.actionButton}
                    onPress={choosePhoto}
                    disabled={saving}
                  >
                    <MaterialIcons
                      name="photo-library"
                      size={27}
                      color={COLORS.primary}
                    />
                    <Text style={styles.actionText}>
                      Gallery
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionButton}
                    onPress={takePhoto}
                    disabled={saving}
                  >
                    <MaterialIcons
                      name="photo-camera"
                      size={27}
                      color={COLORS.primary}
                    />
                    <Text style={styles.actionText}>
                      Camera
                    </Text>
                  </Pressable>
                </View>

                {selectedImage && (
                  <View
                    style={styles.previewContainer}
                  >
                    <Image
                      source={{
                        uri: selectedImage,
                      }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />

                    <Text style={styles.previewText}>
                      Photo selected
                    </Text>
                  </View>
                )}

                <Pressable
                  style={[
                    styles.saveButton,
                    (!selectedImage || saving) &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={saveMemory}
                  disabled={!selectedImage || saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <Text
                      style={styles.saveButtonText}
                    >
                      Save Photo Memory
                    </Text>
                  )}
                </Pressable>
              </>
            )}

            {memoryType === "voice" && (
              <>
                <Pressable
                  style={[
                    styles.voiceButton,
                    recording &&
                      styles.voiceButtonRecording,
                  ]}
                  onPress={
                    recording
                      ? stopRecording
                      : startRecording
                  }
                  disabled={saving}
                >
                  <MaterialIcons
                    name={
                      recording
                        ? "stop"
                        : "mic"
                    }
                    size={28}
                    color={
                      recording
                        ? COLORS.error
                        : COLORS.primary
                    }
                  />

                  <Text
                    style={styles.voiceButtonText}
                  >
                    {recording
                      ? "Stop Recording"
                      : "Start Recording"}
                  </Text>
                </Pressable>

                {recording && (
                  <View
                    style={styles.recordingStatus}
                  >
                    <View
                      style={styles.recordingDot}
                    />

                    <Text
                      style={styles.recordingText}
                    >
                      Recording...
                    </Text>

                    <Text
                      style={styles.recordingTime}
                    >
                      {Math.round(
                        recorderState.durationMillis /
                          1000
                      )}
                      s
                    </Text>
                  </View>
                )}

                {recordedAudio && !recording && (
                  <View
                    style={styles.voicePreview}
                  >
                    <Text style={styles.voiceTitle}>
                      🎙️ Recording ready
                    </Text>

                    <Text
                      style={styles.voiceDuration}
                    >
                      {Math.round(
                        recorderState.durationMillis /
                          1000
                      )}{" "}
                      seconds
                    </Text>

                    <Pressable
                      style={styles.saveButton}
                      onPress={saveMemory}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator
                          color={COLORS.onPrimary}
                        />
                      ) : (
                        <Text
                          style={
                            styles.saveButtonText
                          }
                        >
                          Save Voice Memory
                        </Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Saved memories
              </Text>

              <Text style={styles.sectionSubtitle}>
                {memories.length}{" "}
                {memories.length === 1
                  ? "memory"
                  : "memories"}
              </Text>
            </View>

            <Pressable onPress={loadMemories}>
              <View style={styles.refreshButton}>
                <MaterialIcons
                  name="refresh"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.refreshText}>
                  Refresh
                </Text>
              </View>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={styles.loader}
            />
          ) : memories.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons
                  name="auto-stories"
                  size={31}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No memories yet
              </Text>

              <Text style={styles.emptyText}>
                Add your first memory using
                text, a photo or a voice
                recording.
              </Text>
            </View>
          ) : (
            memories.map((memory) => (
              <View
                key={memory.id}
                style={styles.memoryCard}
              >
                {memory.imageUrl && (
                  <Image
                    source={{
                      uri: memory.imageUrl,
                    }}
                    style={styles.memoryImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.memoryBody}>
                  <View style={styles.memoryHeader}>
                    <View
                      style={styles.memoryTitleRow}
                    >
                      <View
                        style={
                          styles.memoryTypeIcon
                        }
                      >
                        <MaterialIcons
                          name={
                            memory.type === "photo"
                              ? "photo"
                              : memory.type ===
                                "voice"
                              ? "mic"
                              : "description"
                          }
                          size={19}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text
                        style={styles.memoryTitle}
                      >
                        {memory.title}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        deleteMemory(memory.id)
                      }
                      style={styles.deleteButton}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={19}
                        color={COLORS.error}
                      />
                    </Pressable>
                  </View>

                  {memory.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.category}>
                        {memory.category}
                      </Text>
                    </View>
                  )}

                  {memory.description && (
                    <Text style={styles.description}>
                      {memory.description}
                    </Text>
                  )}

                  {memory.type === "voice" &&
                    memory.audioUrl && (
                      <Pressable
                        style={styles.playButton}
                        onPress={() =>
                          openAudio(
                            memory.audioUrl!
                          )
                        }
                      >
                        <MaterialIcons
                          name="play-arrow"
                          size={20}
                          color={COLORS.primary}
                        />

                        <Text
                          style={styles.playText}
                        >
                          Play voice memory
                        </Text>
                      </Pressable>
                    )}

                  <Text style={styles.date}>
                    {new Date(
                      memory.createdAt
                    ).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        <View style={styles.bottomNav}>
          <NavButton
            label="Home"
            icon="home"
            onPress={onHome || (() => {})}
          />

          <NavButton
            label="Games"
            icon="extension"
            onPress={onGames || (() => {})}
          />

          <NavButton
            label="Schedule"
            icon="alarm"
            onPress={onSchedule || (() => {})}
          />

          <NavButton
            label="Memory"
            icon="auto-stories"
            active
            onPress={onMemory || (() => {})}
          />

          <NavButton
            label="Profile"
            icon="person"
            onPress={onProfile || (() => {})}
          />
        </View>

        <QuickAssist
          bottomOffset={86}
          onVoiceAssistant={onVoiceAssistant}
        />
      </View>
    </SafeAreaView>
  );
}

function TypeButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.typeButton,
        active && styles.typeButtonActive,
      ]}
      onPress={onPress}
    >
      <Text style={styles.typeIcon}>{icon}</Text>

      <Text
        style={[
          styles.typeButtonText,
          active &&
            styles.typeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NavButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<
    typeof MaterialIcons
  >["name"];
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.navButton,
        active && styles.navButtonActive,
      ]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={
          active
            ? COLORS.primary
            : COLORS.onSurfaceVariant
        }
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
  },

  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 7,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
    marginTop: 5,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 14,
  },

  typeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 9,
  },

  typeRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 16,
  },

  typeRowMobile: {
    flexDirection: "column",
  },

  typeButton: {
    flex: 1,
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonActive: {
    backgroundColor: COLORS.primaryFixed,
    borderColor: COLORS.primary,
  },

  typeIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  typeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  typeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  input: {
    minHeight: 52,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.onSurface,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },

  actionRowMobile: {
    flexDirection: "column",
  },

  actionButton: {
    flex: 1,
    minHeight: 72,
    backgroundColor: COLORS.primaryFixed,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#C5D8C1",
  },

  actionText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 5,
  },

  previewContainer: {
    marginTop: 16,
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceHigh,
  },

  previewText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
  },

  saveButton: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  saveButtonDisabled: {
    backgroundColor: COLORS.outline,
    opacity: 0.65,
  },

  saveButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: "800",
  },

  voiceButton: {
    minHeight: 76,
    backgroundColor: COLORS.primaryFixed,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C5D8C1",
  },

  voiceButtonRecording: {
    backgroundColor: COLORS.errorContainer,
    borderColor: COLORS.error,
  },

  voiceButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },

  recordingStatus: {
    marginTop: 14,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },

  recordingText: {
    color: COLORS.onErrorContainer,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },

  recordingTime: {
    color: COLORS.onErrorContainer,
    fontSize: 15,
    fontWeight: "800",
  },

  voicePreview: {
    marginTop: 14,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  voiceTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },

  voiceDuration: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 3,
  },

  refreshButton: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primaryFixed,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  refreshText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  loader: {
    marginTop: 30,
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginTop: 12,
    marginBottom: 6,
  },

  emptyText: {
    maxWidth: 500,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
  },

  memoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  memoryImage: {
    width: "100%",
    height: 220,
    backgroundColor: COLORS.surfaceHigh,
  },

  memoryBody: {
    padding: 16,
  },

  memoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  memoryTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  memoryTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  memoryTitle: {
    flex: 1,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: COLORS.onSurface,
    paddingTop: 4,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 9,
  },

  category: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
  },

  description: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
  },

  playButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryFixed,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  playText: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  date: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    marginTop: 12,
  },

  bottomSpace: {
    height: 100,
  },

  bottomNav: {
    height: 76,
    width: "100%",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  navButton: {
    flex: 1,
    minHeight: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  navButtonActive: {
    backgroundColor: COLORS.primaryFixed,
  },

  navLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
    marginTop: 3,
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },

});
