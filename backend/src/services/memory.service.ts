import { prisma } from "../config/database";
import { requireCaregiverPatientAccess } from "./caregiverAccess.service";

export type CreateMemoryInput = {
  title: string;
  description?: string;
  category?: string;
};

export type UpdateMemoryInput = {
  title?: string;
  description?: string;
  category?: string;
};

export async function createMemory(
  userId: string,
  data: CreateMemoryInput
) {
  if (!data.title?.trim()) {
    throw new Error("Memory title is required.");
  }

  if (!data.description?.trim()) {
    throw new Error("Memory description is required.");
  }

  return prisma.memory.create({
    data: {
      userId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category?.trim() || null,
    },
  });
}

export async function getMemories(userId: string) {
  return prisma.memory.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMemoryById(
  userId: string,
  memoryId: string
) {
  return prisma.memory.findFirst({
    where: {
      id: memoryId,
      userId,
    },
  });
}

export async function updateMemory(
  userId: string,
  memoryId: string,
  data: UpdateMemoryInput
) {
  const existing = await getMemoryById(userId, memoryId);

  if (!existing) {
    throw new Error("Memory not found.");
  }

  const updateData: UpdateMemoryInput = {};

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      throw new Error("Memory title cannot be empty.");
    }

    updateData.title = data.title.trim();
  }

  if (data.description !== undefined) {
    if (!data.description.trim()) {
      throw new Error("Memory description cannot be empty.");
    }

    updateData.description = data.description.trim();
  }

  if (data.category !== undefined) {
    updateData.category = data.category.trim();
  }

  return prisma.memory.update({
    where: {
      id: memoryId,
    },
    data: updateData,
  });
}

export async function deleteMemory(
  userId: string,
  memoryId: string
) {
  const existing = await getMemoryById(userId, memoryId);

  if (!existing) {
    throw new Error("Memory not found.");
  }

  await prisma.memory.delete({
    where: {
      id: memoryId,
    },
  });

  return {
    id: memoryId,
  };
}

export async function getPatientMemoriesForCaregiver(caregiverId: string, patientId: string) {
  await requireCaregiverPatientAccess(caregiverId, patientId);
  return getMemories(patientId);
}
