import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { MaterialIcons } from "@expo/vector-icons";

import { API_BASE_URL } from "../../constants/api";
import { getToken } from "../../services/authStorage";

const COLORS = {
  background: "#FBF9F1",
  primary: "#3F6F45",
  primaryContainer: "#315A36",
  onPrimary: "#FFFFFF",
  secondary: "#8A6040",
  secondaryContainer: "#E9D7C5",
  surface: "#FFFFFF",
  surfaceLow: "#F1F0E7",
  surfaceHigh: "#E3E2D9",
  greenSoft: "#E7EFE3",
  greenBorder: "#C5D8C1",
  error: "#9B3F32",
  errorContainer: "#E7C9B9",
  onSurface: "#1B1C17",
  onSurfaceVariant: "#565A52",
  outline: "#72766D",
  outlineVariant: "#CDD2C8",
};

type Task = {
  id: string;
  userId?: string;
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
  patientName: string;
};

type RepeatType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

function confirmDelete(
  title: string,
  message: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
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

function extractTasks(result: any): Task[] {
  const candidates = [
    result?.data,
    result?.data?.tasks,
    result?.tasks,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function formatTaskDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInputDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInputTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function createScheduledAt(
  dateValue: string,
  timeValue: string
): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    dateValue.trim()
  );

  const timeMatch = /^(\d{2}):(\d{2})$/.exec(
    timeValue.trim()
  );

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return date.toISOString();
}

export default function CaregiverPatientTasks({
  patientId,
  patientName,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminderEnabled, setReminderEnabled] =
    useState(true);
  const [repeatType, setRepeatType] =
    useState<RepeatType>("NONE");

  const loadTasks = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token = await getToken();

        if (!token) {
          throw new Error("Please log in again.");
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

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load this patient's reminders."
          );
        }

        const loadedTasks = extractTasks(result);

        loadedTasks.sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        );

        setTasks(loadedTasks);
      } catch (error) {
        showMessage(
          "Reminders",
          error instanceof Error
            ? error.message
            : "Unable to load reminders."
        );
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
    setDate("");
    setTime("");
    setReminderEnabled(true);
    setRepeatType("NONE");
  };

  const openAddReminder = () => {
    resetForm();

    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);

    setDate(
      `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`
    );

    setTime(
      `${String(now.getHours()).padStart(
        2,
        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`
    );

    setModalVisible(true);
  };

  const openEditReminder = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setCategory(task.category || "");
    setDate(getInputDate(task.scheduledAt));
    setTime(getInputTime(task.scheduledAt));
    setReminderEnabled(Boolean(task.reminderEnabled));

    const normalizedRepeat =
      String(task.repeatType || "NONE").toUpperCase();

    if (
      normalizedRepeat === "DAILY" ||
      normalizedRepeat === "WEEKLY" ||
      normalizedRepeat === "MONTHLY"
    ) {
      setRepeatType(normalizedRepeat);
    } else {
      setRepeatType("NONE");
    }

    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    resetForm();
  };

  const saveReminder = async () => {
    if (!title.trim()) {
      showMessage(
        "Title required",
        "Please enter a reminder title."
      );
      return;
    }

    const scheduledAt = createScheduledAt(date, time);

    if (!scheduledAt) {
      showMessage(
        "Invalid date or time",
        "Please use date YYYY-MM-DD and time HH:MM."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        scheduledAt,
        reminderEnabled,
        repeatType,
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

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save the reminder."
        );
      }

      setModalVisible(false);
      resetForm();

      await loadTasks();

      showMessage(
        editingTask
          ? "Reminder updated"
          : "Reminder created",
        editingTask
          ? `The reminder for ${patientName} has been updated.`
          : `The reminder has been added to ${patientName}'s schedule.`
      );
    } catch (error) {
      showMessage(
        "Unable to save reminder",
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCompleted = async (task: Task) => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

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
              completed: false,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to mark reminder as pending."
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

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to update reminder status."
          );
        }
      }

      await loadTasks();
    } catch (error) {
      showMessage(
        "Unable to update reminder",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  const deleteReminder = (task: Task) => {
    confirmDelete(
      "Delete Reminder",
      `Delete "${task.title}" from ${patientName}'s schedule?`,
      async () => {
        try {
          const token = await getToken();

          if (!token) {
            throw new Error("Please log in again.");
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

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message ||
                "Unable to delete the reminder."
            );
          }

          setTasks((current) =>
            current.filter((item) => item.id !== task.id)
          );

          showMessage(
            "Reminder deleted",
            `"${task.title}" has been removed from the schedule.`
          );
        } catch (error) {
          showMessage(
            "Unable to delete reminder",
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons
            name="notifications-active"
            size={23}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.sectionLabel}>
            PATIENT SCHEDULE
          </Text>

          <Text style={styles.title}>
            Reminders for {patientName}
          </Text>

          <Text style={styles.subtitle}>
            Manage this patient's daily care reminders.
          </Text>
        </View>

        <Pressable
          onPress={openAddReminder}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons
            name="add"
            size={21}
            color={COLORS.onPrimary}
          />

          <Text style={styles.addButtonText}>
            Add
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingTitle}>
            Loading reminders...
          </Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <MaterialIcons
              name="event-note"
              size={34}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No reminders yet
          </Text>

          <Text style={styles.emptyText}>
            Create a reminder for {patientName}'s
            medication, meals, appointments, hydration,
            or daily routine.
          </Text>

          <Pressable
            onPress={openAddReminder}
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name="add-alert"
              size={21}
              color={COLORS.onPrimary}
            />

            <Text style={styles.emptyButtonText}>
              Create First Reminder
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {tasks.length}{" "}
              {tasks.length === 1
                ? "reminder"
                : "reminders"}
            </Text>

            <Pressable
              onPress={() => loadTasks(true)}
              disabled={refreshing}
              style={styles.refreshButton}
            >
              {refreshing ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <MaterialIcons
                  name="refresh"
                  size={19}
                  color={COLORS.primary}
                />
              )}

              <Text style={styles.refreshText}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.taskList}>
            {tasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.completed &&
                    styles.taskCardCompleted,
                ]}
              >
                <View
                  style={[
                    styles.taskIcon,
                    task.completed &&
                      styles.taskIconCompleted,
                  ]}
                >
                  <MaterialIcons
                    name={
                      task.completed
                        ? "check"
                        : "notifications-active"
                    }
                    size={22}
                    color={
                      task.completed
                        ? COLORS.primary
                        : COLORS.secondary
                    }
                  />
                </View>

                <View style={styles.taskContent}>
                  <View style={styles.taskTitleRow}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed &&
                          styles.taskTitleCompleted,
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>

                    {task.completed ? (
                      <View style={styles.completedBadge}>
                        <Text
                          style={styles.completedBadgeText}
                        >
                          Done
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.taskDate}>
                    {formatTaskDate(task.scheduledAt)}
                  </Text>

                  {task.category ? (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {task.category}
                      </Text>
                    </View>
                  ) : null}

                  {task.description ? (
                    <Text
                      style={styles.taskDescription}
                      numberOfLines={2}
                    >
                      {task.description}
                    </Text>
                  ) : null}

                  <View style={styles.taskMetaRow}>
                    <View style={styles.taskMeta}>
                      <MaterialIcons
                        name={
                          task.reminderEnabled
                            ? "notifications-active"
                            : "notifications-off"
                        }
                        size={15}
                        color={
                          task.reminderEnabled
                            ? COLORS.primary
                            : COLORS.outline
                        }
                      />

                      <Text style={styles.taskMetaText}>
                        {task.reminderEnabled
                          ? "Reminder on"
                          : "Reminder off"}
                      </Text>
                    </View>

                    {task.repeatType &&
                    task.repeatType !== "NONE" ? (
                      <View style={styles.taskMeta}>
                        <MaterialIcons
                          name="repeat"
                          size={15}
                          color={COLORS.secondary}
                        />

                        <Text
                          style={styles.taskMetaText}
                        >
                          {task.repeatType === "DAILY"
                            ? "Daily"
                            : task.repeatType === "WEEKLY"
                            ? "Weekly"
                            : task.repeatType === "MONTHLY"
                            ? "Monthly"
                            : task.repeatType}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() =>
                        toggleCompleted(task)
                      }
                      style={({ pressed }) => [
                        styles.completeButton,
                        task.completed &&
                          styles.uncompleteButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialIcons
                        name={
                          task.completed
                            ? "undo"
                            : "check-circle-outline"
                        }
                        size={18}
                        color={COLORS.primary}
                      />

                      <Text
                        style={
                          styles.completeButtonText
                        }
                      >
                        {task.completed
                          ? "Mark Pending"
                          : "Mark Complete"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        openEditReminder(task)
                      }
                      style={({ pressed }) => [
                        styles.iconActionButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialIcons
                        name="edit"
                        size={19}
                        color={COLORS.secondary}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        deleteReminder(task)
                      }
                      style={({ pressed }) => [
                        styles.iconActionButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={20}
                        color={COLORS.error}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingTask
                    ? "Edit Reminder"
                    : "Add Reminder"}
                </Text>

                <Text style={styles.modalSubtitle}>
                  For {patientName}
                </Text>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={saving}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={COLORS.onSurface}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.modalScroll
              }
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>
                Title *
              </Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Take morning medicine"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                editable={!saving}
              />

              <Text style={styles.inputLabel}>
                Description
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add instructions or details"
                placeholderTextColor={COLORS.outline}
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                multiline
                numberOfLines={3}
                editable={!saving}
              />

              <Text style={styles.inputLabel}>
                Category
              </Text>

              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Medication, Meal, Hydration..."
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                editable={!saving}
              />

              <Text style={styles.inputLabel}>
                Date *
              </Text>

              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
                editable={!saving}
                maxLength={10}
              />

              <Text style={styles.inputHint}>
                Example: 2026-09-15
              </Text>

              <Text style={styles.inputLabel}>
                Time *
              </Text>

              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
                editable={!saving}
                maxLength={5}
              />

              <Text style={styles.inputHint}>
                Use 24-hour time. Example: 08:30
              </Text>

              <View style={styles.switchRow}>
                <View style={styles.switchIcon}>
                  <MaterialIcons
                    name={
                      reminderEnabled
                        ? "notifications-active"
                        : "notifications-off"
                    }
                    size={22}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.switchContent}>
                  <Text style={styles.switchTitle}>
                    Reminder notification
                  </Text>

                  <Text style={styles.switchDescription}>
                    Enable a notification for this reminder.
                  </Text>
                </View>

                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  disabled={saving}
                  trackColor={{
                    false: COLORS.outlineVariant,
                    true: COLORS.greenBorder,
                  }}
                  thumbColor={
                    reminderEnabled
                      ? COLORS.primary
                      : COLORS.outline
                  }
                />
              </View>

              <Text style={styles.inputLabel}>
                Repeat
              </Text>

              <View style={styles.optionRow}>
                {(
                  [
                    "NONE",
                    "DAILY",
                    "WEEKLY",
                    "MONTHLY",
                  ] as RepeatType[]
                ).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() =>
                      setRepeatType(option)
                    }
                    disabled={saving}
                    style={[
                      styles.optionButton,
                      repeatType === option &&
                        styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        repeatType === option &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option === "NONE"
                        ? "None"
                        : option === "DAILY"
                        ? "Daily"
                        : option === "WEEKLY"
                        ? "Weekly"
                        : "Monthly"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={closeModal}
                  disabled={saving}
                  style={[
                    styles.cancelButton,
                    saving && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveReminder}
                  disabled={saving}
                  style={[
                    styles.saveButton,
                    saving && styles.disabledButton,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <MaterialIcons
                      name="save"
                      size={20}
                      color={COLORS.onPrimary}
                    />
                  )}

                  <Text style={styles.saveText}>
                    {saving
                      ? "Saving..."
                      : editingTask
                      ? "Update"
                      : "Create"}
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
    width: "100%",
    gap: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
  },

  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  title: {
    color: COLORS.onSurface,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
  },

  subtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },

  addButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  addButtonText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "800",
  },

  loadingCard: {
    minHeight: 140,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    marginTop: 10,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 22,
    alignItems: "center",
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 13,
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 7,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 17,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "800",
  },

  summaryRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "700",
  },

  refreshButton: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  refreshText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  taskList: {
    gap: 10,
  },

  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    flexDirection: "row",
    gap: 10,
  },

  taskCardCompleted: {
    backgroundColor: COLORS.greenSoft,
    borderColor: COLORS.greenBorder,
  },

  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  taskIconCompleted: {
    backgroundColor: COLORS.surface,
  },

  taskContent: {
    flex: 1,
    minWidth: 0,
  },

  taskTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  taskTitle: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },

  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.onSurfaceVariant,
  },

  completedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },

  completedBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
  },

  taskDate: {
    marginTop: 4,
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "700",
  },

  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.secondaryContainer,
  },

  categoryText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "800",
  },

  taskDescription: {
    marginTop: 6,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },

  taskMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  taskMetaText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: "600",
  },

  actionRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 7,
  },

  completeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  uncompleteButton: {
    backgroundColor: COLORS.surface,
  },

  completeButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  iconActionButton: {
    width: 40,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(55,50,40,0.48)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: COLORS.onSurface,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },

  modalSubtitle: {
    marginTop: 2,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  inputLabel: {
    marginTop: 13,
    marginBottom: 7,
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: "800",
  },

  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 14,
    color: COLORS.onSurface,
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 85,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  inputHint: {
    marginTop: 5,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },

  switchRow: {
    marginTop: 17,
    minHeight: 66,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  switchIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  switchContent: {
    flex: 1,
  },

  switchTitle: {
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: "800",
  },

  switchDescription: {
    marginTop: 2,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 15,
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionButton: {
    flex: 1,
    minHeight: 43,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  optionButtonActive: {
    backgroundColor: COLORS.greenSoft,
    borderColor: COLORS.primary,
  },

  optionText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
  },

  optionTextActive: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  modalButtons: {
    marginTop: 22,
    flexDirection: "row",
    gap: 9,
  },

  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "800",
  },

  saveButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  saveText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.7,
  },
});