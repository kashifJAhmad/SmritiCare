import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { API_BASE_URL } from "../../constants/api";
import { getToken } from "../../services/authStorage";

type RepeatType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

type PatientTask = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  scheduledAt: string;
  completed: boolean;
  reminderEnabled: boolean;
  repeatType: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  patientId: string;
  patientName?: string;
};

const COLORS = {
  background: "#FBF9F1",
  surface: "#F1F0E7",
  surfaceVariant: "#DDDCD3",
  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimaryContainer: "#D7E7D2",
  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  onSecondaryContainer: "#68472F",
  tertiary: "#A65D43",
  tertiaryContainer: "#E7C9B9",
  text: "#1B1C17",
  textSecondary: "#565A52",
  outline: "#72766D",
  outlineVariant: "#CDD2C8",
  white: "#FFFFFF",
  error: "#9B3F32",
};

const REPEAT_OPTIONS: {
  value: RepeatType;
  label: string;
}[] = [
  {
    value: "NONE",
    label: "None",
  },
  {
    value: "DAILY",
    label: "Daily",
  },
  {
    value: "WEEKLY",
    label: "Weekly",
  },
  {
    value: "MONTHLY",
    label: "Monthly",
  },
];

function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const date = new Date();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRepeat(value?: string) {
  switch (value) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    default:
      return "None";
  }
}

function normalizeRepeat(value?: string): RepeatType {
  switch (value) {
    case "DAILY":
      return "DAILY";
    case "WEEKLY":
      return "WEEKLY";
    case "MONTHLY":
      return "MONTHLY";
    default:
      return "NONE";
  }
}

function extractTasks(result: any): PatientTask[] {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.tasks)) {
    return result.tasks;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.tasks)) {
    return result.data.tasks;
  }

  return [];
}

export default function CaregiverPatientTasks({
  patientId,
  patientName,
}: Props) {
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingTask, setEditingTask] =
    useState<PatientTask | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [category, setCategory] =
    useState("");

  const [date, setDate] =
    useState(getTodayDate());

  const [time, setTime] =
    useState(getCurrentTime());

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  const [repeatType, setRepeatType] =
    useState<RepeatType>("NONE");

  const [errorMessage, setErrorMessage] =
    useState("");

  const sortedTasks = useMemo(() => {
    return [...tasks].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    );
  }, [tasks]);

  const loadTasks = useCallback(
    async (showRefreshing = false) => {
      if (!patientId) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const token = await getToken();

        if (!token) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/tasks/patient/${patientId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const text = await response.text();

        let result: any = {};

        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          result = {};
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load patient reminders."
          );
        }

        setTasks(extractTasks(result));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load patient reminders.";

        setErrorMessage(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [patientId]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const resetForm = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setDate(getTodayDate());
    setTime(getCurrentTime());
    setReminderEnabled(true);
    setRepeatType("NONE");
    setErrorMessage("");
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (task: PatientTask) => {
    const scheduled = new Date(task.scheduledAt);

    if (Number.isNaN(scheduled.getTime())) {
      setDate(getTodayDate());
      setTime(getCurrentTime());
    } else {
      const year = scheduled.getFullYear();
      const month = String(
        scheduled.getMonth() + 1
      ).padStart(2, "0");
      const day = String(
        scheduled.getDate()
      ).padStart(2, "0");

      const hours = String(
        scheduled.getHours()
      ).padStart(2, "0");
      const minutes = String(
        scheduled.getMinutes()
      ).padStart(2, "0");

      setDate(`${year}-${month}-${day}`);
      setTime(`${hours}:${minutes}`);
    }

    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setCategory(task.category || "");
    setReminderEnabled(
      task.reminderEnabled !== false
    );
    setRepeatType(
      normalizeRepeat(task.repeatType)
    );
    setErrorMessage("");
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    resetForm();
  };

  const validateForm = () => {
    if (!title.trim()) {
      return "Please enter a reminder title.";
    }

    if (!date.trim()) {
      return "Please enter a date.";
    }

    if (!time.trim()) {
      return "Please enter a time.";
    }

    const scheduledDate = new Date(
      `${date.trim()}T${time.trim()}:00`
    );

    if (Number.isNaN(scheduledDate.getTime())) {
      return "Please enter a valid date and time.";
    }

    return null;
  };

  const saveTask = async () => {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const scheduledDate = new Date(
        `${date.trim()}T${time.trim()}:00`
      );

      const payload = {
        title: title.trim(),
        description:
          description.trim() || undefined,
        category:
          category.trim() || undefined,
        scheduledAt:
          scheduledDate.toISOString(),
        reminderEnabled,
        repeatType,
        completed: editingTask
          ? editingTask.completed
          : false,
      };

      const url = editingTask
        ? `${API_BASE_URL}/api/tasks/patient/${patientId}/${editingTask.id}`
        : `${API_BASE_URL}/api/tasks/patient/${patientId}`;

      const response = await fetch(url, {
        method: editingTask ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      let result: any = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Unable to ${
              editingTask ? "update" : "create"
            } reminder.`
        );
      }

      setModalVisible(false);
      resetForm();

      await loadTasks(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save reminder.";

      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const completeTask = async (
    task: PatientTask
  ) => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      /*
       * If the task is already completed, use PUT to
       * allow the caregiver to mark it incomplete again.
       *
       * Otherwise use the dedicated complete endpoint.
       */
      if (task.completed) {
        const response = await fetch(
          `${API_BASE_URL}/api/tasks/patient/${patientId}/${task.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              title: task.title,
              description:
                task.description || undefined,
              category:
                task.category || undefined,
              scheduledAt: task.scheduledAt,
              reminderEnabled:
                task.reminderEnabled,
              repeatType:
                normalizeRepeat(task.repeatType),
              completed: false,
            }),
          }
        );

        const text = await response.text();

        let result: any = {};

        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          result = {};
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to reopen this reminder."
          );
        }
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/tasks/patient/${patientId}/${task.id}/complete`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const text = await response.text();

        let result: any = {};

        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          result = {};
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to complete this reminder."
          );
        }
      }

      await loadTasks(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update reminder.";

      Alert.alert("Unable to update", message);
    }
  };

  const deleteTask = (task: PatientTask) => {
    const performDelete = async () => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/tasks/patient/${patientId}/${task.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const text = await response.text();

        let result: any = {};

        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          result = {};
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to delete this reminder."
          );
        }

        await loadTasks(true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete reminder.";

        Alert.alert(
          "Unable to delete",
          message
        );
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Delete "${task.title}"?`
      );

      if (confirmed) {
        void performDelete();
      }

      return;
    }

    Alert.alert(
      "Delete Reminder",
      `Are you sure you want to delete "${task.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void performDelete();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>
            Patient Reminders
          </Text>

          <Text style={styles.sectionSubtitle}>
            {patientName
              ? `Manage ${patientName}'s schedule`
              : "Manage the connected patient's schedule"}
          </Text>
        </View>

        <Pressable
          onPress={openCreateModal}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons
            name="add"
            size={22}
            color={COLORS.white}
          />

          <Text style={styles.addButtonText}>
            Add
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
          />

          <Text style={styles.stateText}>
            Loading reminders...
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorBox}>
          <MaterialIcons
            name="error-outline"
            size={23}
            color={COLORS.error}
          />

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>
              Unable to load reminders
            </Text>

            <Text style={styles.errorText}>
              {errorMessage}
            </Text>

            <Pressable
              onPress={() => loadTasks()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      ) : sortedTasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <MaterialIcons
              name="event-note"
              size={30}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No reminders yet
          </Text>

          <Text style={styles.emptyText}>
            Create a reminder for the connected patient.
          </Text>

          <Pressable
            onPress={openCreateModal}
            style={styles.emptyButton}
          >
            <MaterialIcons
              name="add"
              size={20}
              color={COLORS.white}
            />

            <Text style={styles.emptyButtonText}>
              Create Reminder
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.taskList}
          contentContainerStyle={
            styles.taskListContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={undefined}
        >
          {refreshing && (
            <View style={styles.refreshingRow}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />

              <Text style={styles.refreshingText}>
                Refreshing...
              </Text>
            </View>
          )}

          {sortedTasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                task.completed &&
                  styles.completedTaskCard,
              ]}
            >
              <View style={styles.taskTopRow}>
                <Pressable
                  onPress={() =>
                    completeTask(task)
                  }
                  hitSlop={8}
                  style={styles.checkButton}
                >
                  <MaterialIcons
                    name={
                      task.completed
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={29}
                    color={
                      task.completed
                        ? COLORS.primary
                        : COLORS.outline
                    }
                  />
                </Pressable>

                <View style={styles.taskMain}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed &&
                        styles.completedTaskTitle,
                    ]}
                  >
                    {task.title}
                  </Text>

                  {!!task.description && (
                    <Text
                      style={styles.taskDescription}
                      numberOfLines={3}
                    >
                      {task.description}
                    </Text>
                  )}

                  <View style={styles.metaRow}>
                    <MaterialIcons
                      name="event"
                      size={17}
                      color={COLORS.secondary}
                    />

                    <Text style={styles.metaText}>
                      {formatDateTime(
                        task.scheduledAt
                      )}
                    </Text>
                  </View>

                  <View style={styles.badgesRow}>
                    {!!task.category && (
                      <View
                        style={styles.categoryBadge}
                      >
                        <MaterialIcons
                          name="label-outline"
                          size={15}
                          color={
                            COLORS.onSecondaryContainer
                          }
                        />

                        <Text
                          style={
                            styles.categoryBadgeText
                          }
                        >
                          {task.category}
                        </Text>
                      </View>
                    )}

                    {task.reminderEnabled && (
                      <View
                        style={styles.reminderBadge}
                      >
                        <MaterialIcons
                          name="notifications-active"
                          size={15}
                          color={COLORS.primary}
                        />

                        <Text
                          style={
                            styles.reminderBadgeText
                          }
                        >
                          Reminder On
                        </Text>
                      </View>
                    )}

                    {task.repeatType &&
                      task.repeatType !==
                        "NONE" && (
                        <View
                          style={styles.repeatBadge}
                        >
                          <MaterialIcons
                            name="repeat"
                            size={15}
                            color={
                              COLORS.onPrimaryContainer
                            }
                          />

                          <Text
                            style={
                              styles.repeatBadgeText
                            }
                          >
                            {formatRepeat(
                              task.repeatType
                            )}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() =>
                      openEditModal(task)
                    }
                    hitSlop={8}
                    style={styles.iconButton}
                  >
                    <MaterialIcons
                      name="edit"
                      size={21}
                      color={COLORS.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      deleteTask(task)
                    }
                    hitSlop={8}
                    style={styles.iconButton}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color={COLORS.error}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingTask
                    ? "Edit Reminder"
                    : "New Reminder"}
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  {patientName
                    ? `For ${patientName}`
                    : "For connected patient"}
                </Text>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={saving}
                hitSlop={10}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={25}
                  color={COLORS.text}
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.formContent
              }
            >
              {errorMessage ? (
                <View style={styles.formErrorBox}>
                  <MaterialIcons
                    name="error-outline"
                    size={20}
                    color={COLORS.error}
                  />

                  <Text
                    style={styles.formErrorText}
                  >
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>
                Title
              </Text>

              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="title"
                  size={20}
                  color={COLORS.primary}
                />

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Take morning medicine"
                  placeholderTextColor={
                    COLORS.textSecondary
                  }
                  editable={!saving}
                  style={styles.input}
                />
              </View>

              <Text style={styles.inputLabel}>
                Description
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                ]}
              >
                <MaterialIcons
                  name="description"
                  size={20}
                  color={COLORS.primary}
                />

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add instructions or details"
                  placeholderTextColor={
                    COLORS.textSecondary
                  }
                  editable={!saving}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                />
              </View>

              <Text style={styles.inputLabel}>
                Category
              </Text>

              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="category"
                  size={20}
                  color={COLORS.primary}
                />

                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  placeholder="e.g. Medicine, Meal, Appointment"
                  placeholderTextColor={
                    COLORS.textSecondary
                  }
                  editable={!saving}
                  style={styles.input}
                />
              </View>

              <View style={styles.twoColumn}>
                <View style={styles.column}>
                  <Text style={styles.inputLabel}>
                    Date
                  </Text>

                  <View
                    style={styles.inputWrapper}
                  >
                    <MaterialIcons
                      name="event"
                      size={19}
                      color={COLORS.primary}
                    />

                    <TextInput
                      value={date}
                      onChangeText={setDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={
                        COLORS.textSecondary
                      }
                      editable={!saving}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.column}>
                  <Text style={styles.inputLabel}>
                    Time
                  </Text>

                  <View
                    style={styles.inputWrapper}
                  >
                    <MaterialIcons
                      name="schedule"
                      size={19}
                      color={COLORS.primary}
                    />

                    <TextInput
                      value={time}
                      onChangeText={setTime}
                      placeholder="HH:mm"
                      placeholderTextColor={
                        COLORS.textSecondary
                      }
                      editable={!saving}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>
                    Reminder notification
                  </Text>

                  <Text
                    style={styles.switchSubtitle}
                  >
                    Patient receives a reminder for this task.
                  </Text>
                </View>

                <Switch
                  value={reminderEnabled}
                  onValueChange={
                    setReminderEnabled
                  }
                  disabled={saving}
                  trackColor={{
                    false: COLORS.surfaceVariant,
                    true: COLORS.primary,
                  }}
                  thumbColor={COLORS.white}
                />
              </View>

              <Text style={styles.inputLabel}>
                Repeat
              </Text>

              <View style={styles.repeatOptions}>
                {REPEAT_OPTIONS.map((option) => {
                  const selected =
                    repeatType === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() =>
                        setRepeatType(
                          option.value
                        )
                      }
                      disabled={saving}
                      style={[
                        styles.repeatOption,
                        selected &&
                          styles.repeatOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.repeatOptionText,
                          selected &&
                            styles.repeatOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={saveTask}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                  saving &&
                    styles.saveButtonDisabled,
                ]}
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

                    <Text
                      style={styles.saveButtonText}
                    >
                      {editingTask
                        ? "Save Changes"
                        : "Create Reminder"}
                    </Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  addButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    marginLeft: 5,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  centerState: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  stateText: {
    marginTop: 9,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.tertiaryContainer,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.error,
  },

  errorText: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  retryText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.onPrimaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.textSecondary,
  },

  emptyButton: {
    marginTop: 17,
    minHeight: 45,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
  },

  emptyButtonText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  taskList: {
    width: "100%",
  },

  taskListContent: {
    paddingBottom: 10,
  },

  refreshingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
  },

  refreshingText: {
    marginLeft: 7,
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },

  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  completedTaskCard: {
    backgroundColor: COLORS.surface,
    opacity: 0.82,
  },

  taskTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  taskMain: {
    flex: 1,
    marginLeft: 8,
    paddingRight: 6,
  },

  taskTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },

  taskDescription: {
    marginTop: 5,
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  metaText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
    gap: 6,
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  categoryBadgeText: {
    marginLeft: 4,
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSecondaryContainer,
  },

  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.onPrimaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  reminderBadgeText: {
    marginLeft: 4,
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.primary,
  },

  repeatBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  repeatBadgeText: {
    marginLeft: 4,
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onPrimaryContainer,
  },

  actions: {
    marginLeft: 4,
    alignItems: "center",
  },

  iconButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(27, 28, 23, 0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },

  formContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },

  formErrorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.tertiaryContainer,
    borderRadius: 13,
    padding: 11,
    marginBottom: 13,
  },

  formErrorText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.error,
  },

  inputLabel: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  inputWrapper: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  textAreaWrapper: {
    alignItems: "flex-start",
    paddingTop: 13,
    minHeight: 95,
  },

  input: {
    flex: 1,
    minHeight: 48,
    marginLeft: 9,
    fontSize: 15,
    color: COLORS.text,

    ...(Platform.OS === "web"
      ? ({ outlineStyle: "none" } as any)
      : {}),
  },

  textArea: {
    minHeight: 78,
    paddingTop: 0,
  },

  twoColumn: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  switchRow: {
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
  },

  switchText: {
    flex: 1,
    paddingRight: 10,
  },

  switchTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  switchSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  repeatOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  repeatOption: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.white,
  },

  repeatOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  repeatOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  repeatOptionTextSelected: {
    color: COLORS.white,
  },

  saveButton: {
    minHeight: 54,
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },
});