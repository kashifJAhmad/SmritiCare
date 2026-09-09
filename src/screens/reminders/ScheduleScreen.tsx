import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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

import { getToken } from '../../services/authStorage';
import { API_BASE_URL } from "../../constants/api";

type ScheduleScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
};

type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  scheduledAt: string;
  completed: boolean;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type Task = {
  id: string;
  title: string;
  time: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  section: 'Morning' | 'Afternoon' | 'Evening';
  completed: boolean;
  style: 'red' | 'blue' | 'green';
  scheduledAt: string;
  description: string | null;
  category: string | null;
};



const COLORS = {
  background: '#F4FAFF',
  surface: '#F4FAFF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#E9F6FD',
  surfaceVariant: '#D7E4EC',

  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#90D689',

  secondary: '#00629E',
  secondaryContainer: '#62B4FE',
  onSecondaryContainer: '#004470',

  tertiary: '#7C000B',
  tertiaryContainer: '#A70515',

  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',

  onSurface: '#111D23',
  onSurfaceVariant: '#41493E',

  outline: '#717A6D',
  outlineVariant: '#C0C9BB',

  primaryFixed: '#ACF4A4',
};

function formatTaskTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTaskSection(
  dateString: string,
): 'Morning' | 'Afternoon' | 'Evening' {
  const date = new Date(dateString);
  const hour = date.getHours();

  if (hour < 12) {
    return 'Morning';
  }

  if (hour < 17) {
    return 'Afternoon';
  }

  return 'Evening';
}

function getTaskStyle(
  task: ApiTask,
): 'red' | 'blue' | 'green' {
  const category = task.category?.toLowerCase() || '';
  const title = task.title.toLowerCase();

  if (
    category.includes('medicine') ||
    category.includes('medical') ||
    title.includes('medicine') ||
    title.includes('medication')
  ) {
    return 'red';
  }

  if (
    category.includes('walk') ||
    category.includes('exercise') ||
    title.includes('walk') ||
    title.includes('exercise')
  ) {
    return 'green';
  }

  return 'blue';
}

function getTaskIcon(
  task: ApiTask,
): keyof typeof MaterialIcons.glyphMap {
  const category = task.category?.toLowerCase() || '';
  const title = task.title.toLowerCase();

  if (
    category.includes('medicine') ||
    category.includes('medical') ||
    title.includes('medicine') ||
    title.includes('medication')
  ) {
    return 'medication';
  }

  if (
    category.includes('food') ||
    category.includes('meal') ||
    title.includes('breakfast') ||
    title.includes('lunch') ||
    title.includes('dinner') ||
    title.includes('food')
  ) {
    return 'restaurant';
  }

  if (
    category.includes('walk') ||
    category.includes('exercise') ||
    title.includes('walk') ||
    title.includes('garden')
  ) {
    return 'directions-walk';
  }

  if (
    category.includes('family') ||
    title.includes('family') ||
    title.includes('call')
  ) {
    return 'call';
  }

  if (
    category.includes('game') ||
    title.includes('game')
  ) {
    return 'extension';
  }

  return 'event';
}

function convertApiTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    time: formatTaskTime(task.scheduledAt),
    icon: getTaskIcon(task),
    section: getTaskSection(task.scheduledAt),
    completed: task.completed,
    style: getTaskStyle(task),
    scheduledAt: task.scheduledAt,
    description: task.description,
    category: task.category,
  };
}

export default function ScheduleScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
}: ScheduleScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please sign in to view your schedule.',
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load your schedule.',
        );
      }

      const apiTasks: ApiTask[] = result.tasks || [];

      setTasks(
        apiTasks
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime(),
          )
          .map(convertApiTask),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load your schedule.';

      Alert.alert('Schedule Error', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    setDate('');
    setTime('');
    setReminderEnabled(true);
  };

  const openAddTask = () => {
    resetForm();

    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    setDate(`${yyyy}-${mm}-${dd}`);
    setTime('09:00');

    setShowAddModal(true);
  };

  const createTask = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Task', 'Please enter a task name.');
      return;
    }

    if (!date.trim()) {
      Alert.alert(
        'Missing Date',
        'Please enter a date such as 2026-09-09.',
      );
      return;
    }

    if (!time.trim()) {
      Alert.alert(
        'Missing Time',
        'Please enter a time such as 09:00.',
      );
      return;
    }

    const scheduledAt = new Date(
      `${date.trim()}T${time.trim()}:00`,
    );

    if (Number.isNaN(scheduledAt.getTime())) {
      Alert.alert(
        'Invalid Date',
        'Please use date format YYYY-MM-DD and time format HH:MM.',
      );
      return;
    }

    try {
      setAddingTask(true);

      const token = await getToken();

      if (!token) {
        throw new Error('Please sign in again.');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || undefined,
            category: category.trim() || 'General',
            scheduledAt: scheduledAt.toISOString(),
            reminderEnabled,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to create task.',
        );
      }

      const newTask = convertApiTask(result.task);

      setTasks((currentTasks) =>
        [...currentTasks, newTask].sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
      );

      setShowAddModal(false);
      resetForm();

      Alert.alert(
        'Task Added',
        `${newTask.title} has been added to your schedule.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to create task.';

      Alert.alert('Add Task Error', message);
    } finally {
      setAddingTask(false);
    }
  };

  const toggleTask = async (id: string) => {
    const currentTask = tasks.find(
      (task) => task.id === id,
    );

    if (!currentTask) {
      return;
    }

    if (currentTask.completed) {
      Alert.alert(
        'Task Completed',
        'This task is already marked as completed.',
      );
      return;
    }

    try {
      setUpdatingTaskId(id);

      const token = await getToken();

      if (!token) {
        throw new Error('Please sign in again.');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${id}/complete`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to complete task.',
        );
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: true,
              }
            : task,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to complete task.';

      Alert.alert('Task Error', message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderTask = (task: Task) => {
    const isUpdating = updatingTaskId === task.id;

    return (
      <View key={task.id} style={styles.taskCard}>
        {task.style === 'red' && (
          <View style={styles.gamochaBorder}>
            <View style={styles.redStripe} />
            <View style={styles.whiteStripe} />
          </View>
        )}

        {task.style === 'blue' && (
          <View style={styles.mekhelaBorder}>
            <View style={styles.blueStripe} />
            <View style={styles.whiteStripe} />
          </View>
        )}

        {task.style === 'green' && (
          <View style={styles.greenBorder} />
        )}

        <View style={styles.taskContent}>
          <View style={styles.taskInfo}>
            <View
              style={[
                styles.taskIcon,
                task.style === 'red' &&
                  styles.redTaskIcon,
                task.style === 'blue' &&
                  styles.blueTaskIcon,
                task.style === 'green' &&
                  styles.greenTaskIcon,
              ]}
            >
              <MaterialIcons
                name={task.icon}
                size={28}
                color={
                  task.style === 'red'
                    ? COLORS.onErrorContainer
                    : task.style === 'blue'
                    ? COLORS.onSecondaryContainer
                    : COLORS.onPrimaryContainer
                }
              />
            </View>

            <View style={styles.taskText}>
              <Text style={styles.taskTitle}>
                {task.title}
              </Text>

              <Text style={styles.taskTime}>
                {task.time}
              </Text>

              {task.category && (
                <Text style={styles.taskCategory}>
                  {task.category}
                </Text>
              )}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              task.completed &&
                styles.completedCheckButton,
              pressed && styles.checkPressed,
            ]}
            onPress={() => toggleTask(task.id)}
            disabled={isUpdating}
            accessibilityRole="button"
            accessibilityLabel={
              task.completed
                ? `${task.title} completed`
                : `Mark ${task.title} as done`
            }
          >
            {isUpdating ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />
            ) : (
              task.completed && (
                <MaterialIcons
                  name="check"
                  size={24}
                  color={COLORS.onPrimaryContainer}
                />
              )
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  const renderSection = (
    sectionName: 'Morning' | 'Afternoon' | 'Evening',
  ) => {
    const sectionTasks = tasks.filter(
      (task) => task.section === sectionName,
    );

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {sectionName}
        </Text>

        <View style={styles.sectionDivider} />

        <View style={styles.tasksContainer}>
          {sectionTasks.length > 0 ? (
            sectionTasks.map(renderTask)
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No activities planned
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={32}
              color={COLORS.primary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            SmritiCare
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeader}>
            <View style={styles.titleRow}>
              <View style={styles.titleTextContainer}>
                <Text style={styles.pageTitle}>
                  My Schedule
                </Text>

                <Text style={styles.pageSubtitle}>
                  Today's planned activities.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                ]}
                onPress={loadTasks}
                accessibilityRole="button"
                accessibilityLabel="Refresh schedule"
              >
                <MaterialIcons
                  name="refresh"
                  size={28}
                  color={COLORS.primary}
                />
              </Pressable>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.loadingText}>
                Loading your schedule...
              </Text>
            </View>
          ) : (
            <>
              {renderSection('Morning')}
              {renderSection('Afternoon')}
              {renderSection('Evening')}
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.addTaskButton,
              pressed && styles.addTaskPressed,
            ]}
            onPress={openAddTask}
            accessibilityRole="button"
            accessibilityLabel="Add Task"
          >
            <MaterialIcons
              name="add"
              size={28}
              color={COLORS.onPrimary}
            />

            <Text style={styles.addTaskText}>
              Add Task
            </Text>
          </Pressable>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={onHome}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <MaterialIcons
              name="home"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onGames}
            accessibilityRole="button"
            accessibilityLabel="Games"
          >
            <MaterialIcons
              name="extension"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Games
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.navItem,
              styles.activeNavItem,
            ]}
            onPress={onSchedule}
            accessibilityRole="button"
            accessibilityLabel="Remind"
          >
            <MaterialIcons
              name="alarm"
              size={28}
              color={COLORS.onPrimaryContainer}
            />

            <Text
              style={[
                styles.navText,
                styles.activeNavText,
              ]}
            >
              Remind
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onMemory}
            accessibilityRole="button"
            accessibilityLabel="Memory"
          >
            <MaterialIcons
              name="auto-stories"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Memory
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={onProfile}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <MaterialIcons
              name="person"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>
        </View>

        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (!addingTask) {
              setShowAddModal(false);
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add New Task
                </Text>

                <Pressable
                  onPress={() => {
                    if (!addingTask) {
                      setShowAddModal(false);
                    }
                  }}
                  style={styles.modalCloseButton}
                  disabled={addingTask}
                >
                  <MaterialIcons
                    name="close"
                    size={28}
                    color={COLORS.onSurfaceVariant}
                  />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputLabel}>
                  Task name
                </Text>

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Take medicine"
                  placeholderTextColor="#7A858A"
                  style={styles.input}
                  editable={!addingTask}
                />

                <Text style={styles.inputLabel}>
                  Description
                </Text>

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional details"
                  placeholderTextColor="#7A858A"
                  style={[
                    styles.input,
                    styles.multilineInput,
                  ]}
                  multiline
                  editable={!addingTask}
                />

                <Text style={styles.inputLabel}>
                  Category
                </Text>

                <View style={styles.categoryRow}>
                  {[
                    'General',
                    'Medicine',
                    'Food',
                    'Exercise',
                    'Family',
                    'Game',
                  ].map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setCategory(item)}
                      disabled={addingTask}
                      style={[
                        styles.categoryButton,
                        category === item &&
                          styles.categoryButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === item &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>
                  Date
                </Text>

                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7A858A"
                  style={styles.input}
                  autoCapitalize="none"
                  editable={!addingTask}
                />

                <Text style={styles.inputLabel}>
                  Time
                </Text>

                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#7A858A"
                  style={styles.input}
                  autoCapitalize="none"
                  editable={!addingTask}
                />

                <View style={styles.reminderRow}>
                  <View style={styles.reminderTextContainer}>
                    <Text style={styles.reminderTitle}>
                      Reminder
                    </Text>

                    <Text style={styles.reminderSubtitle}>
                      Enable a reminder for this task
                    </Text>
                  </View>

                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    disabled={addingTask}
                    trackColor={{
                      false: COLORS.surfaceVariant,
                      true: COLORS.primaryContainer,
                    }}
                    thumbColor={COLORS.onPrimary}
                  />
                </View>

                <Pressable
                  onPress={createTask}
                  disabled={addingTask}
                  style={({ pressed }) => [
                    styles.saveTaskButton,
                    pressed &&
                      !addingTask &&
                      styles.addTaskPressed,
                    addingTask &&
                      styles.disabledButton,
                  ]}
                >
                  {addingTask ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.onPrimary}
                    />
                  ) : (
                    <MaterialIcons
                      name="save"
                      size={24}
                      color={COLORS.onPrimary}
                    />
                  )}

                  <Text style={styles.saveTaskText}>
                    {addingTask
                      ? 'Saving...'
                      : 'Save Task'}
                  </Text>
                </Pressable>

                <View style={styles.modalBottomSpace} />
              </ScrollView>
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

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },

  header: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.outlineVariant,
  },

  backButton: {
    width: 48,
    height: 48,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },

  headerTitle: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },

  pageHeader: {
    marginBottom: 24,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titleTextContainer: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },

  pageSubtitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  refreshButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.secondary,
    paddingBottom: 8,
  },

  sectionDivider: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.surfaceVariant,
    marginBottom: 16,
  },

  tasksContainer: {
    gap: 16,
  },

  emptySection: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },

  emptySectionText: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },

  taskCard: {
    width: '100%',
    minHeight: 80,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
  },

  taskContent: {
    minHeight: 80,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  redTaskIcon: {
    backgroundColor: COLORS.errorContainer,
  },

  blueTaskIcon: {
    backgroundColor: COLORS.secondaryContainer,
  },

  greenTaskIcon: {
    backgroundColor: COLORS.primaryContainer,
  },

  taskText: {
    flex: 1,
  },

  taskTitle: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  taskTime: {
    marginTop: 2,
    fontFamily: 'sans-serif',
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  taskCategory: {
    marginTop: 2,
    fontFamily: 'sans-serif',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  gamochaBorder: {
    height: 4,
    width: '100%',
    flexDirection: 'row',
  },

  mekhelaBorder: {
    height: 4,
    width: '100%',
    flexDirection: 'row',
  },

  redStripe: {
    width: 10,
    backgroundColor: COLORS.error,
  },

  blueStripe: {
    width: 10,
    backgroundColor: COLORS.secondary,
  },

  whiteStripe: {
    flex: 1,
    backgroundColor: COLORS.surfaceLowest,
  },

  greenBorder: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.primaryFixed,
  },

  checkButton: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  completedCheckButton: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },

  checkPressed: {
    transform: [{ scale: 0.94 }],
  },

  loadingContainer: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  loadingText: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    color: COLORS.onSurfaceVariant,
  },

  addTaskButton: {
    width: '100%',
    minHeight: 60,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 4,
    borderBottomColor: '#0C5216',
  },

  addTaskPressed: {
    backgroundColor: COLORS.primaryContainer,
    transform: [{ scale: 0.98 }],
  },

  addTaskText: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },

  bottomSpacing: {
    height: 20,
  },

  bottomNav: {
    height: 88,
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.outlineVariant,
  },

  navItem: {
    width: '20%',
    minHeight: 60,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavItem: {
    backgroundColor: COLORS.primaryContainer,
  },

  navText: {
    marginTop: 4,
    fontFamily: 'sans-serif',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  activeNavText: {
    color: COLORS.onPrimaryContainer,
  },

  pressed: {
    opacity: 0.7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.surfaceLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  modalTitle: {
    fontFamily: 'sans-serif',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },

  modalCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLow,
  },

  inputLabel: {
    fontFamily: 'sans-serif',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    width: '100%',
    minHeight: 52,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLowest,
    paddingHorizontal: 16,
    fontFamily: 'sans-serif',
    fontSize: 17,
    color: COLORS.onSurface,
  },

  multilineInput: {
    minHeight: 80,
    paddingTop: 14,
    textAlignVertical: 'top',
  },

  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryButtonActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },

  categoryButtonText: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  categoryButtonTextActive: {
    color: COLORS.onPrimaryContainer,
  },

  reminderRow: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reminderTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  reminderTitle: {
    fontFamily: 'sans-serif',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  reminderSubtitle: {
    marginTop: 4,
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  saveTaskButton: {
    marginTop: 24,
    minHeight: 60,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveTaskText: {
    fontFamily: 'sans-serif',
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },

  disabledButton: {
    opacity: 0.7,
  },

  modalBottomSpace: {
    height: 30,
  },
});