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
  useWindowDimensions,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import QuickAssist from '../../components/QuickAssist';

import { getToken } from '../../services/authStorage';
import { API_BASE_URL } from '../../constants/api';

// ============================================================
// TYPES
// ============================================================

type ScheduleScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
  onGames?: () => void;
  onSchedule?: () => void;
  onMemory?: () => void;
  onProfile?: () => void;
  onVoiceAssistant?: () => void;
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

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  background: '#F4FAFF',
  surface: '#FFFFFF',
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

// ============================================================
// HELPERS
// ============================================================

function formatTaskTime(
  dateString: string,
): string {
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
  const category =
    task.category?.toLowerCase() || '';

  const title =
    task.title.toLowerCase();

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
    title.includes('exercise') ||
    title.includes('garden')
  ) {
    return 'green';
  }

  return 'blue';
}

function getTaskIcon(
  task: ApiTask,
): keyof typeof MaterialIcons.glyphMap {
  const category =
    task.category?.toLowerCase() || '';

  const title =
    task.title.toLowerCase();

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

function convertApiTask(
  task: ApiTask,
): Task {
  return {
    id: task.id,
    title: task.title,
    time: formatTaskTime(
      task.scheduledAt,
    ),
    icon: getTaskIcon(task),
    section: getTaskSection(
      task.scheduledAt,
    ),
    completed: task.completed,
    style: getTaskStyle(task),
    scheduledAt: task.scheduledAt,
    description: task.description,
    category: task.category,
  };
}

// ============================================================
// NAV BUTTON
// ============================================================

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
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        active && styles.navButtonActive,
        pressed && styles.navPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navIconActive,
        ]}
      >
        {icon}
      </Text>

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

// ============================================================
// SCREEN
// ============================================================

export default function ScheduleScreen({
  onBack,
  onHome,
  onGames,
  onSchedule,
  onMemory,
  onProfile,
  onVoiceAssistant,
}: ScheduleScreenProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [tasks, setTasks] = useState<Task[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [
    updatingTaskId,
    setUpdatingTaskId,
  ] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [addingTask, setAddingTask] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [category, setCategory] =
    useState('General');

  const [date, setDate] =
    useState('');

  const [time, setTime] =
    useState('');

  const [
    reminderEnabled,
    setReminderEnabled,
  ] = useState(true);

  // ==========================================================
  // LOAD TASKS
  // ==========================================================

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
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Unable to load your schedule.',
        );
      }

      const apiTasks: ApiTask[] =
        result.tasks || [];

      const convertedTasks =
        apiTasks
          .sort(
            (a, b) =>
              new Date(
                a.scheduledAt,
              ).getTime() -
              new Date(
                b.scheduledAt,
              ).getTime(),
          )
          .map(convertApiTask);

      setTasks(convertedTasks);
    } catch (error) {
      console.error(
        'LOAD TASKS ERROR:',
        error,
      );

      Alert.alert(
        'Schedule Error',
        error instanceof Error
          ? error.message
          : 'Unable to load your schedule.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    setDate('');
    setTime('');
    setReminderEnabled(true);
  };

  // ==========================================================
  // OPEN ADD TASK
  // ==========================================================

  const openAddTask = () => {
    resetForm();

    const today = new Date();

    const yyyy =
      today.getFullYear();

    const mm = String(
      today.getMonth() + 1,
    ).padStart(2, '0');

    const dd = String(
      today.getDate(),
    ).padStart(2, '0');

    setDate(
      `${yyyy}-${mm}-${dd}`,
    );

    setTime('09:00');

    setShowAddModal(true);
  };

  // ==========================================================
  // CREATE TASK
  // ==========================================================

  const createTask = async () => {
    if (!title.trim()) {
      Alert.alert(
        'Missing Task',
        'Please enter a task name.',
      );

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

    const scheduledAt =
      new Date(
        `${date.trim()}T${time.trim()}:00`,
      );

    if (
      Number.isNaN(
        scheduledAt.getTime(),
      )
    ) {
      Alert.alert(
        'Invalid Date',
        'Please use YYYY-MM-DD for date and HH:MM for time.',
      );

      return;
    }

    try {
      setAddingTask(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          'Please sign in again.',
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks`,
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() ||
              undefined,
            category:
              category.trim() ||
              'General',
            scheduledAt:
              scheduledAt.toISOString(),
            reminderEnabled,
          }),
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Unable to create task.',
        );
      }

      const newTask =
        convertApiTask(
          result.task,
        );

      setTasks(
        (currentTasks) =>
          [
            ...currentTasks,
            newTask,
          ].sort(
            (a, b) =>
              new Date(
                a.scheduledAt,
              ).getTime() -
              new Date(
                b.scheduledAt,
              ).getTime(),
          ),
      );

      setShowAddModal(false);

      resetForm();

      Alert.alert(
        'Task Added',
        `${newTask.title} has been added to your schedule.`,
      );
    } catch (error) {
      console.error(
        'CREATE TASK ERROR:',
        error,
      );

      Alert.alert(
        'Add Task Error',
        error instanceof Error
          ? error.message
          : 'Unable to create task.',
      );
    } finally {
      setAddingTask(false);
    }
  };

  // ==========================================================
  // COMPLETE TASK
  // ==========================================================

  const toggleTask = async (
    id: string,
  ) => {
    const currentTask =
      tasks.find(
        (task) => task.id === id,
      );

    if (!currentTask) {
      return;
    }

    if (currentTask.completed) {
      return;
    }

    try {
      setUpdatingTaskId(id);

      const token = await getToken();

      if (!token) {
        throw new Error(
          'Please sign in again.',
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${id}/complete`,
        {
          method: 'PATCH',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Unable to complete task.',
        );
      }

      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (task) =>
              task.id === id
                ? {
                    ...task,
                    completed: true,
                  }
                : task,
          ),
      );
    } catch (error) {
      console.error(
        'COMPLETE TASK ERROR:',
        error,
      );

      Alert.alert(
        'Task Error',
        error instanceof Error
          ? error.message
          : 'Unable to complete task.',
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // ==========================================================
  // TASK CARD
  // ==========================================================

  const renderTask = (
    task: Task,
  ) => {
    const isUpdating =
      updatingTaskId === task.id;

    const iconBackground =
      task.style === 'red'
        ? COLORS.errorContainer
        : task.style === 'blue'
        ? COLORS.secondaryContainer
        : COLORS.primaryContainer;

    const iconColor =
      task.style === 'red'
        ? COLORS.onErrorContainer
        : task.style === 'blue'
        ? COLORS.onSecondaryContainer
        : COLORS.onPrimaryContainer;

    return (
      <View
        key={task.id}
        style={[
          styles.taskCard,
          task.completed &&
            styles.completedTaskCard,
        ]}
      >
        {/* TOP DECORATIVE LINE */}

        {task.style === 'red' && (
          <View
            style={styles.redStripe}
          />
        )}

        {task.style === 'blue' && (
          <View
            style={styles.blueStripe}
          />
        )}

        {task.style === 'green' && (
          <View
            style={styles.greenStripe}
          />
        )}

        <View
          style={[
            styles.taskContent,
            isMobile &&
              styles.taskContentMobile,
          ]}
        >
          {/* TASK INFORMATION */}

          <View
            style={styles.taskInfo}
          >
            <View
              style={[
                styles.taskIcon,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >
              <MaterialIcons
                name={task.icon}
                size={28}
                color={iconColor}
              />
            </View>

            <View
              style={styles.taskText}
            >
              <Text
                style={[
                  styles.taskTitle,
                  task.completed &&
                    styles.completedTaskTitle,
                ]}
              >
                {task.title}
              </Text>

              <Text
                style={styles.taskTime}
              >
                {task.time}
              </Text>

              {task.category && (
                <Text
                  style={
                    styles.taskCategory
                  }
                >
                  {task.category}
                </Text>
              )}

              {task.description && (
                <Text
                  style={
                    styles.taskDescription
                  }
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
            </View>
          </View>

          {/* COMPLETE BUTTON */}

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              task.completed &&
                styles.completedCheckButton,
              pressed &&
                styles.checkPressed,
              isMobile &&
                styles.checkButtonMobile,
            ]}
            onPress={() =>
              toggleTask(task.id)
            }
            disabled={isUpdating}
            accessibilityRole="button"
            accessibilityLabel={
              task.completed
                ? `${task.title} completed`
                : `Mark ${task.title} as complete`
            }
          >
            {isUpdating ? (
              <ActivityIndicator
                size="small"
                color={
                  COLORS.primary
                }
              />
            ) : task.completed ? (
              <MaterialIcons
                name="check"
                size={25}
                color={
                  COLORS.onPrimaryContainer
                }
              />
            ) : null}
          </Pressable>
        </View>
      </View>
    );
  };

  // ==========================================================
  // SECTION
  // ==========================================================

  const renderSection = (
    sectionName:
      | 'Morning'
      | 'Afternoon'
      | 'Evening',
  ) => {
    const sectionTasks =
      tasks.filter(
        (task) =>
          task.section ===
          sectionName,
      );

    return (
      <View
        style={styles.section}
        key={sectionName}
      >
        <Text
          style={styles.sectionTitle}
        >
          {sectionName}
        </Text>

        <View
          style={styles.sectionDivider}
        />

        {sectionTasks.length > 0 ? (
          <View
            style={
              styles.tasksContainer
            }
          >
            {sectionTasks.map(
              renderTask,
            )}
          </View>
        ) : (
          <View
            style={styles.emptySection}
          >
            <MaterialIcons
              name="event-busy"
              size={23}
              color={COLORS.outline}
            />

            <Text
              style={
                styles.emptySectionText
              }
            >
              No activities planned
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.container}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={styles.header}
        >
          <View
            style={
              styles.headerLeft
            }
          >
            {onBack && (
              <Pressable
                style={
                  styles.backButton
                }
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="arrow-back"
                  size={27}
                  color={
                    COLORS.primary
                  }
                />
              </Pressable>
            )}

            <View>
              <Text
                style={
                  styles.headerBrand
                }
              >
                SmritiCare
              </Text>

              <Text
                style={
                  styles.headerSmallText
                }
              >
                Your daily care companion
              </Text>
            </View>
          </View>

          <Pressable
            style={
              styles.headerRefresh
            }
            onPress={loadTasks}
            accessibilityRole="button"
            accessibilityLabel="Refresh schedule"
          >
            <MaterialIcons
              name="refresh"
              size={25}
              color={
                COLORS.primary
              }
            />
          </Pressable>
        </View>

        {/* ====================================================
            SCROLL CONTENT
        ==================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            isMobile &&
              styles.contentMobile,
          ]}
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* PAGE TITLE */}

          <View
            style={
              styles.pageHeader
            }
          >
            <Text
              style={styles.pageTitle}
            >
              My Schedule
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Here are the activities
              planned for you.
            </Text>
          </View>

          {/* TODAY SUMMARY */}

          <View
            style={styles.summaryCard}
          >
            <View
              style={
                styles.summaryIcon
              }
            >
              <MaterialIcons
                name="today"
                size={28}
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={
                styles.summaryText
              }
            >
              <Text
                style={
                  styles.summaryTitle
                }
              >
                Today's activities
              </Text>

              <Text
                style={
                  styles.summaryDescription
                }
              >
                {tasks.length === 0
                  ? 'No activities added yet.'
                  : `${tasks.length} ${
                      tasks.length === 1
                        ? 'activity'
                        : 'activities'
                    } in your schedule.`}
              </Text>
            </View>
          </View>

          {/* LOADING */}

          {loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading your schedule...
              </Text>
            </View>
          ) : (
            <>
              {renderSection(
                'Morning',
              )}

              {renderSection(
                'Afternoon',
              )}

              {renderSection(
                'Evening',
              )}
            </>
          )}

          {/* ADD TASK */}

          <Pressable
            style={({ pressed }) => [
              styles.addTaskButton,
              pressed &&
                styles.addTaskPressed,
            ]}
            onPress={
              openAddTask
            }
            accessibilityRole="button"
            accessibilityLabel="Add a new task"
          >
            <MaterialIcons
              name="add"
              size={27}
              color={
                COLORS.onPrimary
              }
            />

            <Text
              style={
                styles.addTaskText
              }
            >
              Add Task
            </Text>
          </Pressable>

          {/* BOTTOM CONTENT SPACE */}

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>

        {/* ====================================================
            BOTTOM NAVIGATION
        ==================================================== */}

        <View
          style={styles.bottomNav}
        >
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
            active
            onPress={onSchedule}
          />

          <NavButton
            label="Memories"
            icon="💚"
            onPress={onMemory}
          />

          <NavButton
            label="Profile"
            icon="👤"
            onPress={onProfile}
          />
        </View>

        {/* ====================================================
            EXISTING QUICK ASSIST
        ==================================================== */}

        <QuickAssist
          bottomOffset={100}
          onVoiceAssistant={
            onVoiceAssistant
          }
        />

        {/* ====================================================
            ADD TASK MODAL
        ==================================================== */}

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
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={[
                styles.modalCard,
                isMobile &&
                  styles.modalCardMobile,
              ]}
            >
              {/* MODAL HEADER */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <View
                  style={
                    styles.modalTitleContainer
                  }
                >
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    Add New Task
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Add an activity to your
                    daily schedule.
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    if (
                      !addingTask
                    ) {
                      setShowAddModal(
                        false,
                      );
                    }
                  }}
                  style={
                    styles.modalCloseButton
                  }
                  disabled={
                    addingTask
                  }
                >
                  <MaterialIcons
                    name="close"
                    size={27}
                    color={
                      COLORS.onSurfaceVariant
                    }
                  />
                </Pressable>
              </View>

              {/* MODAL FORM */}

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
              >
                {/* TASK NAME */}

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Task name
                </Text>

                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  placeholder="e.g. Take medicine"
                  placeholderTextColor="#7A858A"
                  style={
                    styles.input
                  }
                  editable={
                    !addingTask
                  }
                />

                {/* DESCRIPTION */}

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Description
                </Text>

                <TextInput
                  value={
                    description
                  }
                  onChangeText={
                    setDescription
                  }
                  placeholder="Optional details"
                  placeholderTextColor="#7A858A"
                  style={[
                    styles.input,
                    styles.multilineInput,
                  ]}
                  multiline
                  editable={
                    !addingTask
                  }
                />

                {/* CATEGORY */}

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Category
                </Text>

                <View
                  style={
                    styles.categoryRow
                  }
                >
                  {[
                    'General',
                    'Medicine',
                    'Food',
                    'Exercise',
                    'Family',
                    'Game',
                  ].map(
                    (item) => (
                      <Pressable
                        key={item}
                        onPress={() =>
                          setCategory(
                            item,
                          )
                        }
                        disabled={
                          addingTask
                        }
                        style={[
                          styles.categoryButton,
                          category ===
                            item &&
                            styles.categoryButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            category ===
                              item &&
                              styles.categoryButtonTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>

                {/* DATE */}

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Date
                </Text>

                <TextInput
                  value={date}
                  onChangeText={
                    setDate
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7A858A"
                  style={
                    styles.input
                  }
                  autoCapitalize="none"
                  editable={
                    !addingTask
                  }
                />

                {/* TIME */}

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Time
                </Text>

                <TextInput
                  value={time}
                  onChangeText={
                    setTime
                  }
                  placeholder="HH:MM"
                  placeholderTextColor="#7A858A"
                  style={
                    styles.input
                  }
                  autoCapitalize="none"
                  editable={
                    !addingTask
                  }
                />

                {/* REMINDER */}

                <View
                  style={
                    styles.reminderRow
                  }
                >
                  <View
                    style={
                      styles.reminderTextContainer
                    }
                  >
                    <Text
                      style={
                        styles.reminderTitle
                      }
                    >
                      Reminder
                    </Text>

                    <Text
                      style={
                        styles.reminderSubtitle
                      }
                    >
                      Enable a reminder for
                      this activity.
                    </Text>
                  </View>

                  <Switch
                    value={
                      reminderEnabled
                    }
                    onValueChange={
                      setReminderEnabled
                    }
                    disabled={
                      addingTask
                    }
                    trackColor={{
                      false:
                        COLORS.surfaceVariant,
                      true:
                        COLORS.primaryContainer,
                    }}
                    thumbColor={
                      COLORS.onPrimary
                    }
                  />
                </View>

                {/* SAVE */}

                <Pressable
                  onPress={
                    createTask
                  }
                  disabled={
                    addingTask
                  }
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
                      color={
                        COLORS.onPrimary
                      }
                    />
                  ) : (
                    <MaterialIcons
                      name="save"
                      size={24}
                      color={
                        COLORS.onPrimary
                      }
                    />
                  )}

                  <Text
                    style={
                      styles.saveTaskText
                    }
                  >
                    {addingTask
                      ? 'Saving...'
                      : 'Save Task'}
                  </Text>
                </Pressable>

                <View
                  style={
                    styles.modalBottomSpace
                  }
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 20,
  },

  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    minHeight: 76,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor:
      COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerBrand: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: COLORS.primary,
  },

  headerSmallText: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.outline,
  },

  headerRefresh: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================================
  // PAGE HEADER
  // ==========================================================

  pageHeader: {
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    color: COLORS.primary,
  },

  pageSubtitle: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.onSurfaceVariant,
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryCard: {
    minHeight: 82,
    backgroundColor:
      COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      COLORS.outlineVariant,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor:
      '#E7F3E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },

  summaryDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    marginTop: 3,
  },

  // ==========================================================
  // SECTIONS
  // ==========================================================

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 8,
  },

  sectionDivider: {
    width: '100%',
    height: 2,
    backgroundColor:
      COLORS.surfaceVariant,
    marginBottom: 14,
  },

  tasksContainer: {
    gap: 12,
  },

  emptySection: {
    minHeight: 65,
    backgroundColor:
      COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  emptySectionText: {
    fontSize: 15,
    color: COLORS.outline,
  },

  // ==========================================================
  // TASK CARD
  // ==========================================================

  taskCard: {
    width: '100%',
    minHeight: 92,
    backgroundColor:
      COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      COLORS.outlineVariant,
    overflow: 'hidden',
  },

  completedTaskCard: {
    opacity: 0.75,
  },

  redStripe: {
    width: '100%',
    height: 4,
    backgroundColor:
      COLORS.error,
  },

  blueStripe: {
    width: '100%',
    height: 4,
    backgroundColor:
      COLORS.secondary,
  },

  greenStripe: {
    width: '100%',
    height: 4,
    backgroundColor:
      COLORS.primaryFixed,
  },

  taskContent: {
    minHeight: 88,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  taskContentMobile: {
    padding: 14,
  },

  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  taskIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  taskText: {
    flex: 1,
    minWidth: 0,
  },

  taskTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
  },

  completedTaskTitle: {
    textDecorationLine:
      'line-through',
  },

  taskTime: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
  },

  taskCategory: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  taskDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.outline,
  },

  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  checkButtonMobile: {
    width: 46,
    height: 46,
  },

  completedCheckButton: {
    backgroundColor:
      COLORS.primaryContainer,
    borderColor:
      COLORS.primaryContainer,
  },

  checkPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },

  loadingText: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },

  // ==========================================================
  // ADD TASK
  // ==========================================================

  addTaskButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 14,
    backgroundColor:
      COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },

  addTaskPressed: {
    backgroundColor:
      COLORS.primaryContainer,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  addTaskText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onPrimary,
  },

  bottomSpace: {
    height: 20,
  },

  // ==========================================================
  // BOTTOM NAVIGATION
  // ==========================================================

  bottomNav: {
    height: 74,
    width: '100%',
    backgroundColor:
      COLORS.surface,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingVertical: 6,
  },

  navButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navButtonActive: {
    backgroundColor:
      '#E7F3E6',
  },

  navPressed: {
    opacity: 0.65,
  },

  navIcon: {
    fontSize: 21,
    lineHeight: 25,
    color: COLORS.outline,
  },

  navIconActive: {
    color: COLORS.primary,
  },

  navLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: COLORS.outline,
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    alignSelf: 'center',
    backgroundColor:
      COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  modalCardMobile: {
    maxHeight: '92%',
    paddingHorizontal: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: COLORS.primary,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
  },

  modalCloseButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================================
  // FORM
  // ==========================================================

  inputLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 13,
    marginBottom: 7,
  },

  input: {
    width: '100%',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor:
      COLORS.outlineVariant,
    borderRadius: 13,
    backgroundColor:
      COLORS.surface,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.onSurface,
  },

  multilineInput: {
    minHeight: 85,
    paddingTop: 13,
    paddingBottom: 13,
    textAlignVertical: 'top',
  },

  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    minHeight: 43,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor:
      COLORS.outlineVariant,
    backgroundColor:
      COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryButtonActive: {
    backgroundColor:
      COLORS.primaryContainer,
    borderColor:
      COLORS.primaryContainer,
  },

  categoryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },

  categoryButtonTextActive: {
    color: COLORS.onPrimaryContainer,
  },

  // ==========================================================
  // REMINDER
  // ==========================================================

  reminderRow: {
    minHeight: 70,
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor:
      COLORS.surfaceLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reminderTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  reminderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },

  reminderSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  // ==========================================================
  // SAVE TASK
  // ==========================================================

  saveTaskButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 13,
    backgroundColor:
      COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },

  saveTaskText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onPrimary,
  },

  disabledButton: {
    opacity: 0.65,
  },

  modalBottomSpace: {
    height: 30,
  },
});