import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { getToken } from "../../services/authStorage";

const API_BASE_URL = "http://192.168.29.253:5000";

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
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

export default function MemoryScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: Props) {
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
  }, []);

  // ------------------------------------------------------------
  // LOAD MEMORIES
  // ------------------------------------------------------------

  const loadMemories = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/memories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load memories."
        );
      }

      setMemories(data.memories || []);
    } catch (error) {
      Alert.alert(
        "Unable to load memories",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // RESET
  // ------------------------------------------------------------

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedImage(null);
    setRecordedAudio(null);
    setMemoryType("text");
  };

  // ------------------------------------------------------------
  // CHANGE MEMORY TYPE
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // SAVE TEXT MEMORY
  // ------------------------------------------------------------

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

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/memories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || "Text",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save memory."
        );
      }

      resetForm();
      await loadMemories();

      Alert.alert(
        "Memory saved",
        "Your text memory has been saved successfully."
      );
    } catch (error) {
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

  // ------------------------------------------------------------
  // GALLERY
  // ------------------------------------------------------------

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
          allowsEditing: true,
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setSelectedImage(result.assets[0].uri);
        setRecordedAudio(null);
      }
    } catch (error) {
      Alert.alert(
        "Photo error",
        error instanceof Error
          ? error.message
          : "Unable to open your photo library."
      );
    }
  };

  // ------------------------------------------------------------
  // CAMERA
  // ------------------------------------------------------------

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
          allowsEditing: true,
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setSelectedImage(result.assets[0].uri);
        setRecordedAudio(null);
      }
    } catch (error) {
      Alert.alert(
        "Camera error",
        error instanceof Error
          ? error.message
          : "Unable to open the camera."
      );
    }
  };

  // ------------------------------------------------------------
  // START VOICE RECORDING
  // ------------------------------------------------------------

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
      Alert.alert(
        "Recording error",
        error instanceof Error
          ? error.message
          : "Unable to start recording."
      );
    }
  };

  // ------------------------------------------------------------
  // STOP VOICE RECORDING
  // ------------------------------------------------------------

  const stopRecording = async () => {
    try {
      await recorder.stop();

      const uri = recorder.uri;

      if (uri) {
        setRecordedAudio(uri);
      }
    } catch (error) {
      Alert.alert(
        "Recording error",
        error instanceof Error
          ? error.message
          : "Unable to stop recording."
      );
    }
  };

  // ------------------------------------------------------------
  // CREATE FILE FOR UPLOAD
  // ------------------------------------------------------------

  const createFileObject = async (
    uri: string,
    fileName: string,
    mimeType: string
  ) => {
    if (Platform.OS === "web") {
      const response = await fetch(uri);

      const blob = await response.blob();

      return new File([blob], fileName, {
        type: blob.type || mimeType,
      });
    }

    return {
      uri,
      name: fileName,
      type: mimeType,
    };
  };

  // ------------------------------------------------------------
  // SAVE PHOTO MEMORY
  // ------------------------------------------------------------

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

      const formData = new FormData();

      formData.append("title", title.trim());

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category",
        category.trim() || "Photo"
      );

      formData.append("type", "photo");

      const file = await createFileObject(
        selectedImage,
        `memory-${Date.now()}.jpg`,
        "image/jpeg"
      );

      formData.append("file", file as any);

      const response = await fetch(
        `${API_BASE_URL}/api/memories/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save photo memory."
        );
      }

      resetForm();

      await loadMemories();

      Alert.alert(
        "Memory saved",
        "Your photo memory has been saved successfully."
      );
    } catch (error) {
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

  // ------------------------------------------------------------
  // SAVE VOICE MEMORY
  // ------------------------------------------------------------

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

      const formData = new FormData();

      formData.append("title", title.trim());

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category",
        category.trim() || "Voice"
      );

      formData.append("type", "voice");

      const file = await createFileObject(
        recordedAudio,
        `memory-${Date.now()}.m4a`,
        Platform.OS === "web"
          ? "audio/webm"
          : "audio/m4a"
      );

      formData.append("file", file as any);

      const response = await fetch(
        `${API_BASE_URL}/api/memories/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save voice memory."
        );
      }

      resetForm();

      await loadMemories();

      Alert.alert(
        "Memory saved",
        "Your voice memory has been saved successfully."
      );
    } catch (error) {
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

  // ------------------------------------------------------------
  // SAVE CURRENT MEMORY
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  const deleteMemory = async (id: string) => {
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
          onPress: async () => {
            try {
              const token = await getToken();

              if (!token) {
                throw new Error(
                  "Please log in again."
                );
              }

              const response = await fetch(
                `${API_BASE_URL}/api/memories/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message ||
                    "Unable to delete memory."
                );
              }

              setMemories((current) =>
                current.filter(
                  (memory) => memory.id !== id
                )
              );
            } catch (error) {
              Alert.alert(
                "Delete failed",
                error instanceof Error
                  ? error.message
                  : "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // ------------------------------------------------------------
  // OPEN AUDIO
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          {onBack && (
            <Pressable
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backText}>
                ← Back
              </Text>
            </Pressable>
          )}

          <Text style={styles.title}>
            My Memories
          </Text>

          <Text style={styles.subtitle}>
            Save important people, places, moments
            and stories.
          </Text>
        </View>

        {/* ADD MEMORY */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Add a memory
          </Text>

          {/* MEMORY TYPE */}

          <Text style={styles.typeLabel}>
            How would you like to save it?
          </Text>

          <View style={styles.typeRow}>
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

          {/* TITLE */}

          <TextInput
            style={styles.input}
            placeholder="Memory title"
            placeholderTextColor="#717A6D"
            value={title}
            onChangeText={setTitle}
          />

          {/* DESCRIPTION */}

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            placeholder={
              memoryType === "voice"
                ? "Add a description or note about this recording"
                : "Tell us about this memory"
            }
            placeholderTextColor="#717A6D"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* CATEGORY */}

          <TextInput
            style={styles.input}
            placeholder="Category (optional)"
            placeholderTextColor="#717A6D"
            value={category}
            onChangeText={setCategory}
          />

          {/* TEXT */}

          {memoryType === "text" && (
            <Pressable
              style={styles.saveButton}
              onPress={saveMemory}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Memory
                </Text>
              )}
            </Pressable>
          )}

          {/* PHOTO */}

         {memoryType === "photo" && (
  <>
    <View style={styles.actionRow}>
      <Pressable
        style={styles.actionButton}
        onPress={choosePhoto}
        disabled={saving}
      >
        <Text style={styles.actionIcon}>🖼️</Text>
        <Text style={styles.actionText}>Gallery</Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={takePhoto}
        disabled={saving}
      >
        <Text style={styles.actionIcon}>📷</Text>
        <Text style={styles.actionText}>Camera</Text>
      </Pressable>
    </View>

    {selectedImage && (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.previewImage}
        />

        <Text style={styles.previewText}>
          Photo selected
        </Text>
      </View>
    )}

    <Pressable
      style={[
        styles.saveButton,
        !selectedImage && styles.saveButtonDisabled,
      ]}
      onPress={saveMemory}
      disabled={saving}
    >
      {saving ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.saveButtonText}>
          Save Memory
        </Text>
      )}
    </Pressable>
  </>
)}

          {/* VOICE */}

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
                <Text style={styles.voiceIcon}>
                  {recording ? "⏹️" : "🎙️"}
                </Text>

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
                      <ActivityIndicator color="#FFFFFF" />
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

        {/* SAVED MEMORIES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Saved memories
          </Text>

          <Pressable onPress={loadMemories}>
            <Text style={styles.refreshText}>
              Refresh
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#00450D"
            style={styles.loader}
          />
        ) : memories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              💚
            </Text>

            <Text style={styles.emptyTitle}>
              No memories yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first memory using text,
              a photo or a voice recording.
            </Text>
          </View>
        ) : (
          memories.map((memory) => (
            <View
              key={memory.id}
              style={styles.memoryCard}
            >
              {/* PHOTO */}

              {memory.imageUrl && (
                <Image
                  source={{
                    uri: memory.imageUrl,
                  }}
                  style={styles.memoryImage}
                />
              )}

              <View style={styles.memoryBody}>
                <View style={styles.memoryHeader}>
                  <View style={styles.memoryTitleRow}>
                    <Text style={styles.memoryTypeIcon}>
                      {memory.type === "photo"
                        ? "📷"
                        : memory.type === "voice"
                        ? "🎙️"
                        : "📝"}
                    </Text>

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
                  >
                    <Text
                      style={styles.deleteText}
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>

                {/* CATEGORY */}

                {memory.category && (
                  <Text style={styles.category}>
                    {memory.category}
                  </Text>
                )}

                {/* DESCRIPTION */}

                {memory.description && (
                  <Text
                    style={styles.description}
                  >
                    {memory.description}
                  </Text>
                )}

                {/* VOICE */}

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
                      <Text
                        style={styles.playText}
                      >
                        ▶ Play voice memory
                      </Text>
                    </Pressable>
                  )}

                {/* DATE */}

                <Text style={styles.date}>
                  {new Date(
                    memory.createdAt
                  ).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        <NavButton
          label="Home"
          icon="⌂"
          onPress={onHome}
        />

        <NavButton
          label="Games"
          icon="🎮"
          onPress={onGames}
        />

        <NavButton
          label="Schedule"
          icon="📅"
          onPress={onSchedule}
        />

        <NavButton
          label="Memories"
          icon="💚"
          active
          onPress={onMemory}
        />

        <NavButton
          label="Profile"
          icon="👤"
          onPress={onProfile}
        />
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// MEMORY TYPE BUTTON
// ------------------------------------------------------------

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
      <Text style={styles.typeIcon}>
        {icon}
      </Text>

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

// ------------------------------------------------------------
// NAV BUTTON
// ------------------------------------------------------------

function NavButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.navButton}
      onPress={onPress}
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          active && styles.navActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FAFF",
  },

  content: {
    padding: 20,
    paddingTop: 28,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    minHeight: 40,
    justifyContent: "center",
  },

  backText: {
    color: "#00450D",
    fontSize: 15,
    fontWeight: "700",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#00450D",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: "#41493E",
    lineHeight: 23,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E2E1",
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#1B1C1C",
    marginBottom: 14,
  },

  typeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#41493E",
    marginBottom: 8,
  },

  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  typeButton: {
    flex: 1,
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C0C9BB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonActive: {
    backgroundColor: "#D9E6DA",
    borderColor: "#00450D",
  },

  typeIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  typeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#556158",
  },

  typeButtonTextActive: {
    color: "#00450D",
  },

  input: {
    backgroundColor: "#F6F3F2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1B1C1C",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E2E1",
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },

  actionButton: {
    flex: 1,
    minHeight: 72,
    backgroundColor: "#D9E6DA",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00450D",
  },

  previewContainer: {
    marginTop: 16,
  },

  previewImage: {
    width: "100%",
    height: 210,
    borderRadius: 14,
  },

  previewText: {
    fontSize: 14,
    color: "#556158",
    marginTop: 8,
  },

  saveButton: {
    backgroundColor: "#00450D",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  saveButtonDisabled: {
  backgroundColor: "#AEB8AE",
},

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  voiceButton: {
    backgroundColor: "#D9E6DA",
    borderRadius: 14,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  voiceButtonRecording: {
    backgroundColor: "#FFDAD6",
  },

  voiceIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  voiceButtonText: {
    color: "#00450D",
    fontSize: 15,
    fontWeight: "800",
  },

  recordingStatus: {
    marginTop: 14,
    backgroundColor: "#FFDAD6",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#BA1A1A",
    marginRight: 8,
  },

  recordingText: {
    color: "#BA1A1A",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },

  recordingTime: {
    color: "#BA1A1A",
    fontSize: 15,
    fontWeight: "800",
  },

  voicePreview: {
    marginTop: 14,
    backgroundColor: "#F6F3F2",
    borderRadius: 14,
    padding: 16,
  },

  voiceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#00450D",
  },

  voiceDuration: {
    fontSize: 14,
    color: "#556158",
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1B1C1C",
  },

  refreshText: {
    color: "#00450D",
    fontWeight: "700",
    fontSize: 14,
  },

  loader: {
    marginTop: 30,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E2E1",
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1B1C1C",
    marginBottom: 6,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#556158",
  },

  memoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E2E1",
  },

  memoryImage: {
    width: "100%",
    height: 190,
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
    fontSize: 18,
  },

  memoryTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "800",
    color: "#1B1C1C",
  },

  deleteText: {
    color: "#BA1A1A",
    fontWeight: "700",
    fontSize: 13,
  },

  category: {
    color: "#00450D",
    fontWeight: "700",
    fontSize: 13,
    marginTop: 6,
  },

  description: {
    fontSize: 15,
    color: "#41493E",
    lineHeight: 22,
    marginTop: 9,
  },

  playButton: {
    backgroundColor: "#D9E6DA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 12,
  },

  playText: {
    color: "#00450D",
    fontWeight: "700",
  },

  date: {
    color: "#717A6D",
    fontSize: 12,
    marginTop: 12,
  },

  bottomSpace: {
    height: 90,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E2E1",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
    minHeight: 56,
  },

  navIcon: {
    fontSize: 21,
    color: "#717A6D",
    marginBottom: 2,
  },

  navLabel: {
    fontSize: 11,
    color: "#717A6D",
    fontWeight: "600",
  },

  navActive: {
    color: "#00450D",
    fontWeight: "800",
  },
});