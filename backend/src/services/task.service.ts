import { prisma } from "../config/database";

type RepeatType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

type CreateTaskData = {
  title: string;
  description?: string;
  category?: string;
  scheduledAt: string | Date;
  reminderEnabled?: boolean;
  repeatType?: RepeatType | string;
};

type UpdateTaskData = {
  title?: string;
  description?: string | null;
  category?: string | null;
  scheduledAt?: string | Date;
  completed?: boolean;
  reminderEnabled?: boolean;
  repeatType?: RepeatType | string;
};

function parseDate(
  value: string | Date,
): Date {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "Invalid scheduled date",
    );
  }

  return date;
}

function parseRepeatType(
  value?: string,
): RepeatType {
  const repeatType =
    String(value || "NONE")
      .trim()
      .toUpperCase();

  const allowed: RepeatType[] = [
    "NONE",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
  ];

  if (
    !allowed.includes(
      repeatType as RepeatType,
    )
  ) {
    throw new Error(
      "Invalid repeat type. Use NONE, DAILY, WEEKLY, or MONTHLY.",
    );
  }

  return repeatType as RepeatType;
}

function startOfDay(
  date: Date,
): Date {
  const result =
    new Date(date.getTime());

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

function advanceScheduledDate(
  scheduledAt: Date,
  repeatType: RepeatType,
): Date {
  const next =
    new Date(
      scheduledAt.getTime(),
    );

  switch (repeatType) {
    case "DAILY":
      next.setDate(
        next.getDate() + 1,
      );
      break;

    case "WEEKLY":
      next.setDate(
        next.getDate() + 7,
      );
      break;

    case "MONTHLY": {
      const originalDay =
        next.getDate();

      next.setDate(1);

      next.setMonth(
        next.getMonth() + 1,
      );

      const lastDayOfMonth =
        new Date(
          next.getFullYear(),
          next.getMonth() + 1,
          0,
        ).getDate();

      next.setDate(
        Math.min(
          originalDay,
          lastDayOfMonth,
        ),
      );

      break;
    }

    case "NONE":
    default:
      break;
  }

  return next;
}

/**
 * Renew completed recurring tasks only AFTER the calendar day has
 * changed.
 *
 * Example:
 *   Daily task: today at 10:00 AM
 *   Patient completes it at 10:30 AM
 *   -> It stays completed for the rest of today.
 *
 * After 12:00 AM:
 *   -> The task moves to tomorrow at 10:00 AM
 *   -> completed becomes false.
 *
 * This prevents the task from immediately becoming active again
 * simply because the patient completed it after its scheduled time.
 */
async function renewCompletedRepeatingTasks(
  userId: string,
): Promise<void> {
  const repeatingTasks =
    await prisma.task.findMany({
      where: {
        userId,
        completed: true,
        repeatType: {
          in: [
            "DAILY",
            "WEEKLY",
            "MONTHLY",
          ],
        },
      },
    });

  const today =
    startOfDay(
      new Date(),
    );

  for (const task of repeatingTasks) {
    const repeatType =
      parseRepeatType(
        task.repeatType,
      );

    const scheduledDay =
      startOfDay(
        task.scheduledAt,
      );

    // The task was completed today.
    // Keep it completed until midnight.
    if (
      scheduledDay.getTime() >=
      today.getTime()
    ) {
      continue;
    }

    // The task's scheduled date is before today,
    // so the new occurrence is now due to be created.
    let nextScheduledAt =
      new Date(
        task.scheduledAt.getTime(),
      );

    while (
      startOfDay(
        nextScheduledAt,
      ).getTime() <
      today.getTime()
    ) {
      nextScheduledAt =
        advanceScheduledDate(
          nextScheduledAt,
          repeatType,
        );
    }

    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        scheduledAt:
          nextScheduledAt,
        completed: false,
      },
    });
  }
}

export async function createTask(
  userId: string,
  data: CreateTaskData,
) {
  const title =
    data.title?.trim();

  if (!title) {
    throw new Error(
      "Task title is required",
    );
  }

  const scheduledAt =
    parseDate(
      data.scheduledAt,
    );

  const repeatType =
    parseRepeatType(
      data.repeatType,
    );

  return prisma.task.create({
    data: {
      userId,
      title,
      description:
        data.description?.trim() ||
        null,
      category:
        data.category?.trim() ||
        null,
      scheduledAt,
      reminderEnabled:
        data.reminderEnabled ??
        true,
      repeatType,
    },
  });
}

export async function getTasks(
  userId: string,
) {
  await renewCompletedRepeatingTasks(
    userId,
  );

  return prisma.task.findMany({
    where: {
      userId,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
}

export async function getTaskById(
  userId: string,
  taskId: string,
) {
  const task =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

  if (!task) {
    throw new Error(
      "Task not found",
    );
  }

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskData,
) {
  const existingTask =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

  if (!existingTask) {
    throw new Error(
      "Task not found",
    );
  }

  const updateData: {
    title?: string;
    description?: string | null;
    category?: string | null;
    scheduledAt?: Date;
    completed?: boolean;
    reminderEnabled?: boolean;
    repeatType?: RepeatType;
  } = {};

  if (
    data.title !== undefined
  ) {
    const title =
      data.title.trim();

    if (!title) {
      throw new Error(
        "Task title cannot be empty",
      );
    }

    updateData.title = title;
  }

  if (
    data.description !==
    undefined
  ) {
    updateData.description =
      data.description?.trim() ||
      null;
  }

  if (
    data.category !== undefined
  ) {
    updateData.category =
      data.category?.trim() ||
      null;
  }

  if (
    data.scheduledAt !==
    undefined
  ) {
    updateData.scheduledAt =
      parseDate(
        data.scheduledAt,
      );
  }

  if (
    data.completed !==
    undefined
  ) {
    updateData.completed =
      Boolean(
        data.completed,
      );
  }

  if (
    data.reminderEnabled !==
    undefined
  ) {
    updateData.reminderEnabled =
      Boolean(
        data.reminderEnabled,
      );
  }

  if (
    data.repeatType !==
    undefined
  ) {
    updateData.repeatType =
      parseRepeatType(
        data.repeatType,
      );
  }

  return prisma.task.update({
    where: {
      id: taskId,
    },
    data: updateData,
  });
}

export async function deleteTask(
  userId: string,
  taskId: string,
) {
  const existingTask =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

  if (!existingTask) {
    throw new Error(
      "Task not found",
    );
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return {
    message:
      "Task deleted successfully",
  };
}

export async function completeTask(
  userId: string,
  taskId: string,
) {
  const existingTask =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

  if (!existingTask) {
    throw new Error(
      "Task not found",
    );
  }

  return prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      completed: true,
    },
  });
}
