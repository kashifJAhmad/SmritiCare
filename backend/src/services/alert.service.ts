import { prisma } from "../config/database";
import { AlertStatus, AlertSourceType } from "@prisma/client";

export type CreateAlertInput = {
  id?: string;
  patientId: string;
  caregiverId: string;
  category: string;
  typeLabel: string;
  title: string;
  description: string;
  badge: string;
  sourceType?: AlertSourceType;
  sourceId?: string | null;
  status?: AlertStatus;
  createdAt?: Date;
};

/**
 * Retrieve alerts relevant to the requesting user (as caregiver or patient).
 */
export async function getAlertsForUser(userId: string) {
  return prisma.alert.findMany({
    where: {
      OR: [
        { caregiverId: userId },
        { patientId: userId },
      ],
    },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      caregiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Upsert an alert idempotently using client-provided id or unique composite key.
 */
export async function upsertAlert(userId: string, input: CreateAlertInput) {
  // If unique constraint [caregiverId, sourceType, sourceId] is present, check existing
  const sourceType = input.sourceType || AlertSourceType.TASK;
  const status = input.status || AlertStatus.ACTIVE;

  if (input.id) {
    return prisma.alert.upsert({
      where: { id: input.id },
      update: {
        category: input.category,
        typeLabel: input.typeLabel,
        title: input.title,
        description: input.description,
        badge: input.badge,
        status,
      },
      create: {
        id: input.id,
        patientId: input.patientId,
        caregiverId: input.caregiverId,
        category: input.category,
        typeLabel: input.typeLabel,
        title: input.title,
        description: input.description,
        badge: input.badge,
        status,
        sourceType,
        sourceId: input.sourceId ?? null,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
      },
    });
  }

  // If no ID is passed, check composite key
  if (input.sourceId) {
    const existing = await prisma.alert.findUnique({
      where: {
        caregiverId_sourceType_sourceId: {
          caregiverId: input.caregiverId,
          sourceType,
          sourceId: input.sourceId,
        },
      },
    });

    if (existing) {
      return prisma.alert.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          description: input.description,
          status,
        },
      });
    }
  }

  return prisma.alert.create({
    data: {
      patientId: input.patientId,
      caregiverId: input.caregiverId,
      category: input.category,
      typeLabel: input.typeLabel,
      title: input.title,
      description: input.description,
      badge: input.badge,
      status,
      sourceType,
      sourceId: input.sourceId ?? null,
      createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
    },
  });
}

/**
 * Acknowledge an alert offline or online.
 */
export async function acknowledgeAlert(userId: string, alertId: string) {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    throw new Error("Alert not found");
  }

  // Authorization: must be caregiver or patient on this alert
  if (alert.caregiverId !== userId && alert.patientId !== userId) {
    throw new Error("You are not authorized to update this alert");
  }

  return prisma.alert.update({
    where: { id: alertId },
    data: {
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgedAt: new Date(),
    },
  });
}

/**
 * Resolve an alert offline or online.
 */
export async function resolveAlert(userId: string, alertId: string) {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    throw new Error("Alert not found");
  }

  // Authorization: must be caregiver or patient on this alert
  if (alert.caregiverId !== userId && alert.patientId !== userId) {
    throw new Error("You are not authorized to update this alert");
  }

  return prisma.alert.update({
    where: { id: alertId },
    data: {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
    },
  });
}
