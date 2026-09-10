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

function parseDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid scheduled date");
  }

  return date;
}

function parseRepeatType(value?: string): RepeatType {
  const repeatType = String(value || "NONE")
    .trim()
    .toUpperCase();

  const allowed: RepeatType[] = [
    "NONE",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
  ];

  if (!allowed.includes(repeatType as RepeatType)) {
    throw new Error(
      "Invalid repeat type. Use NONE, DAILY, WEEKLY, or MONTHLY.",
    );
  }

  return repeatType as RepeatType;
}

function startOfDay(date: Date): Date {
  const result = new Date(date.getTime());

  result.setHours(0, 0, 0, 0);

  return result;
}

function advanceScheduledDate(
  scheduledAt: Date,
  repeatType: RepeatType,
): Date {
  const next = new Date(scheduledAt.getTime());

  switch (repeatType) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;

    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;

    case "MONTHLY": {
      const originalDay = next.getDate();

      next.setDate(1);

      next.setMonth(next.getMonth() + 1);

      const lastDayOfMonth = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0,
      ).getDate();

      next.setDate(
        Math.min(originalDay, lastDayOfMonth),
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
 * Renew completed repeating tasks after the calendar day changes.
 */
async function renewCompletedRepeatingTasks(
  userId: string,
): Promise<void> {
  const repeatingTasks = await prisma.task.findMany({
    where: {
      userId,
      completed: true,
      repeatType: {
        in: ["DAILY", "WEEKLY", "MONTHLY"],
      },
    },
  });

  const today = startOfDay(new Date());

  for (const task of repeatingTasks) {
    const repeatType = parseRepeatType(task.repeatType);

    const scheduledDay = startOfDay(task.scheduledAt);

    if (scheduledDay.getTime() >= today.getTime()) {
      continue;
    }

    let nextScheduledAt = new Date(
      task.scheduledAt.getTime(),
    );

    while (
      startOfDay(nextScheduledAt).getTime() <
      today.getTime()
    ) {
      nextScheduledAt = advanceScheduledDate(
        nextScheduledAt,
        repeatType,
      );
    }

    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        scheduledAt: nextScheduledAt,
        completed: false,
      },
    });
  }
}

/**
 * Verify that a caregiver is connected to a patient.
 */
async function verifyCaregiverPatientAccess(
  caregiverId: string,
  patientId: string,
): Promise<void> {
  const caregiver = await prisma.user.findUnique({
    where: {
      id: caregiverId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!caregiver) {
    throw new Error("Caregiver not found");
  }

  if (caregiver.role !== "CAREGIVER") {
    throw new Error(
      "Only caregivers can manage patient tasks",
    );
  }

  const patient = await prisma.user.findUnique({
    where: {
      id: patientId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  if (patient.role !== "PATIENT") {
    throw new Error(
      "The selected user is not a patient",
    );
  }

  const connection =
    await prisma.caregiverPatient.findUnique({
      where: {
        caregiverId_patientId: {
          caregiverId,
          patientId,
        },
      },
      select: {
        id: true,
      },
    });

  if (!connection) {
    throw new Error(
      "You are not connected to this patient",
    );
  }
}

/**
 * Create a task for a user.
 */
export async function createTask(
  userId: string,
  data: CreateTaskData,
) {
  const title = data.title?.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  const scheduledAt = parseDate(data.scheduledAt);

  const repeatType = parseRepeatType(
    data.repeatType,
  );

  return prisma.task.create({
    data: {
      userId,
      title,
      description:
        data.description?.trim() || null,
      category:
        data.category?.trim() || null,
      scheduledAt,
      reminderEnabled:
        data.reminderEnabled ?? true,
      repeatType,
    },
  });
}

/**
 * Get the logged-in user's tasks.
 */
export async function getTasks(userId: string) {
  await renewCompletedRepeatingTasks(userId);

  return prisma.task.findMany({
    where: {
      userId,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
}

/**
 * Get a single task belonging to the logged-in user.
 */
export async function getTaskById(
  userId: string,
  taskId: string,
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

/**
 * Update a task belonging to the logged-in user.
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskData,
) {
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
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

  if (data.title !== undefined) {
    const title = data.title.trim();

    if (!title) {
      throw new Error(
        "Task title cannot be empty",
      );
    }

    updateData.title = title;
  }

  if (data.description !== undefined) {
    updateData.description =
      data.description?.trim() || null;
  }

  if (data.category !== undefined) {
    updateData.category =
      data.category?.trim() || null;
  }

  if (data.scheduledAt !== undefined) {
    updateData.scheduledAt = parseDate(
      data.scheduledAt,
    );
  }

  if (data.completed !== undefined) {
    updateData.completed = Boolean(
      data.completed,
    );
  }

  if (data.reminderEnabled !== undefined) {
    updateData.reminderEnabled = Boolean(
      data.reminderEnabled,
    );
  }

  if (data.repeatType !== undefined) {
    updateData.repeatType = parseRepeatType(
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

/**
 * Delete a task belonging to the logged-in user.
 */
export async function deleteTask(
  userId: string,
  taskId: string,
) {
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return {
    message: "Task deleted successfully",
  };
}

/**
 * Complete a task belonging to the logged-in user.
 */
export async function completeTask(
  userId: string,
  taskId: string,
) {
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
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

// ============================================================
// CAREGIVER TASK ACCESS
// ============================================================

/**
 * Get all tasks for a connected patient.
 */
export async function getPatientTasksForCaregiver(
  caregiverId: string,
  patientId: string,
) {
  await verifyCaregiverPatientAccess(
    caregiverId,
    patientId,
  );

  await renewCompletedRepeatingTasks(patientId);

  return prisma.task.findMany({
    where: {
      userId: patientId,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
}

/**
 * Create a task for a connected patient.
 */
export async function createTaskForPatient(
  caregiverId: string,
  patientId: string,
  data: CreateTaskData,
) {
  await verifyCaregiverPatientAccess(
    caregiverId,
    patientId,
  );

  return createTask(patientId, data);
}

/**
 * Update a task belonging to a connected patient.
 */
export async function updateTaskForPatient(
  caregiverId: string,
  patientId: string,
  taskId: string,
  data: UpdateTaskData,
) {
  await verifyCaregiverPatientAccess(
    caregiverId,
    patientId,
  );

  const existingTask =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: patientId,
      },
    });

  if (!existingTask) {
    throw new Error("Patient task not found");
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

  if (data.title !== undefined) {
    const title = data.title.trim();

    if (!title) {
      throw new Error(
        "Task title cannot be empty",
      );
    }

    updateData.title = title;
  }

  if (data.description !== undefined) {
    updateData.description =
      data.description?.trim() || null;
  }

  if (data.category !== undefined) {
    updateData.category =
      data.category?.trim() || null;
  }

  if (data.scheduledAt !== undefined) {
    updateData.scheduledAt = parseDate(
      data.scheduledAt,
    );
  }

  if (data.completed !== undefined) {
    updateData.completed = Boolean(
      data.completed,
    );
  }

  if (data.reminderEnabled !== undefined) {
    updateData.reminderEnabled = Boolean(
      data.reminderEnabled,
    );
  }

  if (data.repeatType !== undefined) {
    updateData.repeatType = parseRepeatType(
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

/**
 * Delete a task belonging to a connected patient.
 */
export async function deleteTaskForPatient(
  caregiverId: string,
  patientId: string,
  taskId: string,
) {
  await verifyCaregiverPatientAccess(
    caregiverId,
    patientId,
  );

  const existingTask =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: patientId,
      },
    });

  if (!existingTask) {
    throw new Error("Patient task not found");
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return {
    message: "Patient task deleted successfully",
  };
}

/**
 * Mark a connected patient's task as completed.
 */
export async function completeTaskForPatient(
  caregiverId: string,
  patientId: string,
  taskId: string,
) {
  await verifyCaregiverPatientAccess(
    caregiverId,
    patientId,
  );

  const existingTask =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: patientId,
      },
    });

  if (!existingTask) {
    throw new Error("Patient task not found");
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