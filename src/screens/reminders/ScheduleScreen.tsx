import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type ScheduleScreenProps = {
  onBack?: () => void;
};

type Task = {
  id: string;
  title: string;
  time: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  section: 'Morning' | 'Afternoon' | 'Evening';
  completed: boolean;
  style: 'red' | 'blue' | 'green';
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

export default function ScheduleScreen({
  onBack,
}: ScheduleScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Medicine',
      time: '9:00 AM',
      icon: 'medication',
      section: 'Morning',
      completed: false,
      style: 'red',
    },
    {
      id: '2',
      title: 'Breakfast',
      time: '9:30 AM',
      icon: 'restaurant',
      section: 'Morning',
      completed: true,
      style: 'blue',
    },
    {
      id: '3',
      title: 'Lunch',
      time: '1:00 PM',
      icon: 'restaurant',
      section: 'Afternoon',
      completed: false,
      style: 'blue',
    },
    {
      id: '4',
      title: 'Walk in Garden',
      time: '4:00 PM',
      icon: 'directions-walk',
      section: 'Afternoon',
      completed: false,
      style: 'green',
    },
    {
      id: '5',
      title: 'Call Family',
      time: '6:00 PM',
      icon: 'call',
      section: 'Evening',
      completed: false,
      style: 'blue',
    },
    {
      id: '6',
      title: 'Dinner',
      time: '8:00 PM',
      icon: 'restaurant',
      section: 'Evening',
      completed: false,
      style: 'blue',
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );
  };

  const addTask = () => {
    Alert.alert(
      'Add Task',
      'Task creation will be connected next.',
    );
  };

  const renderTask = (task: Task) => {
    return (
      <View key={task.id} style={styles.taskCard}>

        {/* Decorative top border */}

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

          {/* Left side */}

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
            </View>

          </View>

          {/* Check button */}

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              task.completed &&
                styles.completedCheckButton,
              pressed && styles.checkPressed,
            ]}
            onPress={() => toggleTask(task.id)}
            accessibilityRole="button"
            accessibilityLabel={
              task.completed
                ? `Mark ${task.title} as not done`
                : `Mark ${task.title} as done`
            }
          >
            {task.completed && (
              <MaterialIcons
                name="check"
                size={24}
                color={COLORS.onPrimaryContainer}
              />
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
          {sectionTasks.map(renderTask)}
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* =====================================================
            TOP APP BAR
        ====================================================== */}

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

          {/* Changed from Sanjeevan to SmritiCare */}

          <Text style={styles.headerTitle}>
            SmritiCare
          </Text>

        </View>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* PAGE TITLE */}

          <View style={styles.pageHeader}>

            <Text style={styles.pageTitle}>
              My Schedule
            </Text>

            <Text style={styles.pageSubtitle}>
              Today's planned activities.
            </Text>

          </View>

          {/* MORNING */}

          {renderSection('Morning')}

          {/* AFTERNOON */}

          {renderSection('Afternoon')}

          {/* EVENING */}

          {renderSection('Evening')}

          {/* ===================================================
              ADD TASK
          ==================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.addTaskButton,
              pressed && styles.addTaskPressed,
            ]}
            onPress={addTask}
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

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <View style={styles.bottomNav}>

          {/* Home */}

          <Pressable style={styles.navItem}>
            <MaterialIcons
              name="home"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          {/* Games */}

          <Pressable style={styles.navItem}>
            <MaterialIcons
              name="extension"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Games
            </Text>
          </Pressable>

          {/* Remind - ACTIVE */}

          <Pressable
            style={[
              styles.navItem,
              styles.activeNavItem,
            ]}
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

          {/* Memory */}

          <Pressable style={styles.navItem}>
            <MaterialIcons
              name="auto-stories"
              size={28}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.navText}>
              Memory
            </Text>
          </Pressable>

          {/* Profile */}

          <Pressable style={styles.navItem}>
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

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // =========================================================
  // MAIN
  // =========================================================

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

  // =========================================================
  // HEADER
  // =========================================================

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

  // =========================================================
  // PAGE HEADER
  // =========================================================

  pageHeader: {
    marginBottom: 24,
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

  // =========================================================
  // SECTIONS
  // =========================================================

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

  // =========================================================
  // TASK CARD
  // =========================================================

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

  // =========================================================
  // DECORATIVE BORDERS
  // =========================================================

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

  // =========================================================
  // CHECK BUTTON
  // =========================================================

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

  // =========================================================
  // ADD TASK
  // =========================================================

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

  // =========================================================
  // BOTTOM NAVIGATION
  // =========================================================

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
});