import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ============================================================
// NOTIFICATION CONFIGURATION
// ============================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ============================================================
// TYPES
// ============================================================

export type ReminderRepeatType =
  | 'NONE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

// ============================================================
// REQUEST PERMISSION
// ============================================================

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const existingPermission =
      await Notifications.getPermissionsAsync();

    let finalStatus =
      existingPermission.status;

    if (finalStatus !== 'granted') {
      const requestedPermission =
        await Notifications.requestPermissionsAsync();

      finalStatus =
        requestedPermission.status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'task-reminders',
        {
          name: 'Task Reminders',
          description:
            'Reminders for scheduled SmritiCare activities.',
          importance:
            Notifications.AndroidImportance.HIGH,
          vibrationPattern: [
            0,
            250,
            250,
            250,
          ],
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: 'default',
        },
      );
    }

    return true;
  } catch (error) {
    console.error(
      'NOTIFICATION PERMISSION ERROR:',
      error,
    );

    return false;
  }
}

// ============================================================
// SEND REMINDER NOW
// ============================================================

export async function sendTaskReminderNow(
  taskId: string,
  title: string,
  description?: string | null,
): Promise<boolean> {
  try {
    // expo-notifications native scheduling is not available on web.
    if (Platform.OS === 'web') {
      return false;
    }

    const hasPermission =
      await requestNotificationPermission();

    if (!hasPermission) {
      return false;
    }

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SmritiCare Reminder',
          body:
            description?.trim()
              ? `${title}: ${description.trim()}`
              : title,
          sound: 'default',
          data: {
            taskId,
            type: 'task-reminder-now',
          },
        },
        trigger: {
          type:
            Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
          channelId:
            Platform.OS === 'android'
              ? 'task-reminders'
              : undefined,
        },
      });

    return Boolean(
      notificationId,
    );
  } catch (error) {
    console.error(
      'SEND TASK REMINDER ERROR:',
      error,
    );

    return false;
  }
}

// ============================================================
// SCHEDULE TASK REMINDER
// ============================================================

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  scheduledAt: string,
  reminderEnabled: boolean,
  repeatType: ReminderRepeatType = 'NONE',
): Promise<string | null> {
  try {
    // expo-notifications scheduling is native-only.
    if (Platform.OS === 'web') {
      return null;
    }

    if (!reminderEnabled) {
      return null;
    }

    const hasPermission =
      await requestNotificationPermission();

    if (!hasPermission) {
      return null;
    }

    const scheduledDate =
      new Date(scheduledAt);

    if (
      Number.isNaN(
        scheduledDate.getTime(),
      )
    ) {
      throw new Error(
        'Invalid reminder date.',
      );
    }

    if (
      scheduledDate.getTime() <=
      Date.now()
    ) {
      throw new Error(
        'Reminder time must be in the future.',
      );
    }

    let trigger:
      | Notifications.NotificationTriggerInput
      | null = null;

    switch (repeatType) {
      case 'DAILY':
        trigger = {
          type:
            Notifications.SchedulableTriggerInputTypes.DAILY,
          hour:
            scheduledDate.getHours(),
          minute:
            scheduledDate.getMinutes(),
          channelId:
            Platform.OS === 'android'
              ? 'task-reminders'
              : undefined,
        };
        break;

      case 'WEEKLY':
        trigger = {
          type:
            Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday:
            scheduledDate.getDay() === 0
              ? 1
              : scheduledDate.getDay() + 1,
          hour:
            scheduledDate.getHours(),
          minute:
            scheduledDate.getMinutes(),
          channelId:
            Platform.OS === 'android'
              ? 'task-reminders'
              : undefined,
        };
        break;

      case 'MONTHLY':
        trigger = {
          type:
            Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day:
            scheduledDate.getDate(),
          hour:
            scheduledDate.getHours(),
          minute:
            scheduledDate.getMinutes(),
          channelId:
            Platform.OS === 'android'
              ? 'task-reminders'
              : undefined,
        };
        break;

      case 'NONE':
      default:
        trigger = {
          type:
            Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
          channelId:
            Platform.OS === 'android'
              ? 'task-reminders'
              : undefined,
        };
        break;
    }

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SmritiCare Reminder',
          body: title,
          sound: 'default',
          data: {
            taskId,
            type: 'task-reminder',
          },
        },
        trigger,
      });

    return notificationId;
  } catch (error) {
    console.error(
      'SCHEDULE TASK REMINDER ERROR:',
      error,
    );

    return null;
  }
}

// ============================================================
// CANCEL TASK REMINDER
// ============================================================

export async function cancelTaskReminder(
  notificationId: string | null,
): Promise<void> {
  if (!notificationId) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(
      notificationId,
    );
  } catch (error) {
    console.error(
      'CANCEL TASK REMINDER ERROR:',
      error,
    );
  }
}

// ============================================================
// CANCEL ALL SMRITICARE REMINDERS
// ============================================================

export async function cancelAllTaskReminders(): Promise<void> {
  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduled) {
      const taskId =
        notification.content.data?.taskId;

      if (taskId) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }
  } catch (error) {
    console.error(
      'CANCEL ALL TASK REMINDERS ERROR:',
      error,
    );
  }
}

// ============================================================
// GET SCHEDULED REMINDERS
// ============================================================

export async function getScheduledTaskReminders() {
  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    return scheduled.filter(
      (notification) =>
        Boolean(
          notification.content.data?.taskId,
        ),
    );
  } catch (error) {
    console.error(
      'GET SCHEDULED TASK REMINDERS ERROR:',
      error,
    );

    return [];
  }
}
