import { prisma } from "../config/database";

type CreateTaskData = {
  title: string;
  description?: string;
  category?: string;
  scheduledAt: string | Date;
  reminderEnabled?: boolean;
};

type UpdateTaskData = {
  title?: string;
  description?: string | null;
  category?: string | null;
  scheduledAt?: string | Date;
  completed?: boolean;
  reminderEnabled?: boolean;
};

function parseDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid scheduled date");
  }

  return date;
}

export async function createTask(
  userId: string,
  data: CreateTaskData,
) {
  const title = data.title?.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  const scheduledAt = parseDate(data.scheduledAt);

  return prisma.task.create({
    data: {
      userId,
      title,
      description: data.description?.trim() || null,
      category: data.category?.trim() || null,
      scheduledAt,
      reminderEnabled: data.reminderEnabled ?? true,
    },
  });
}

export async function getTasks(userId: string) {
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
  } = {};

  if (data.title !== undefined) {
    const title = data.title.trim();

    if (!title) {
      throw new Error("Task title cannot be empty");
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
    updateData.scheduledAt = parseDate(data.scheduledAt);
  }

  if (data.completed !== undefined) {
    updateData.completed = Boolean(data.completed);
  }

  if (data.reminderEnabled !== undefined) {
    updateData.reminderEnabled = Boolean(
      data.reminderEnabled,
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