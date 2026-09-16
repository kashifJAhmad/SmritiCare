import { prisma } from "../config/database";
import * as gameService from "./game.service";

export type SyncOperation = "CREATE" | "UPDATE" | "DELETE";
export type SyncEntityType =
  | "GAME_RESULT"
  | "COGNITIVE_SCORE"
  | "MEMORY"
  | "TASK"
  | "PROFILE"
  | "ALERT";

export type SyncItemInput = {
  id: string; // queue item ID / client operation ID
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: any;
  clientTimestamp?: string;
};

export type SyncItemResult = {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  status: "SUCCESS" | "ERROR";
  serverId?: string;
  error?: string;
};

/**
 * Process a batch of sync items from a client in a safe, idempotent manner.
 */
export async function processSyncPush(
  userId: string,
  items: SyncItemInput[]
): Promise<SyncItemResult[]> {
  const results: SyncItemResult[] = [];

  for (const item of items) {
    try {
      const payload = typeof item.payload === "string" ? JSON.parse(item.payload) : item.payload;

      switch (item.entityType) {
        case "GAME_RESULT": {
          const gameId = payload.gameId || payload.gameName || "guess-food";
          const game = await gameService.getOrCreateGame(gameId);
          const playedAt = payload.playedAt ? new Date(payload.playedAt) : new Date();

          const record = await prisma.gameResult.upsert({
            where: { id: item.entityId },
            update: {
              score: payload.score,
              duration: payload.duration ?? null,
            },
            create: {
              id: item.entityId,
              userId,
              gameId: game.id,
              score: payload.score,
              duration: payload.duration ?? null,
              playedAt,
            },
          });

          results.push({
            id: item.id,
            entityType: item.entityType,
            entityId: item.entityId,
            status: "SUCCESS",
            serverId: record.id,
          });
          break;
        }

        case "COGNITIVE_SCORE": {
          const recordedAt = payload.recordedAt ? new Date(payload.recordedAt) : new Date();

          const record = await prisma.cognitiveScore.upsert({
            where: { id: item.entityId },
            update: {
              score: payload.score,
              memory: payload.memory ?? null,
              attention: payload.attention ?? null,
              reaction: payload.reaction ?? null,
            },
            create: {
              id: item.entityId,
              userId,
              score: payload.score,
              memory: payload.memory ?? null,
              attention: payload.attention ?? null,
              reaction: payload.reaction ?? null,
              recordedAt,
            },
          });

          results.push({
            id: item.id,
            entityType: item.entityType,
            entityId: item.entityId,
            status: "SUCCESS",
            serverId: record.id,
          });
          break;
        }

        case "MEMORY": {
          if (item.operation === "DELETE") {
            await prisma.memory.deleteMany({
              where: { id: item.entityId, userId },
            });
            results.push({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              status: "SUCCESS",
            });
          } else {
            const memory = await prisma.memory.upsert({
              where: { id: item.entityId },
              update: {
                title: payload.title,
                description: payload.description ?? null,
                category: payload.category ?? null,
                imageUrl: payload.imageUrl ?? null,
                audioUrl: payload.audioUrl ?? null,
                type: payload.type || "text",
              },
              create: {
                id: item.entityId,
                userId,
                title: payload.title || "Untitled Memory",
                description: payload.description ?? null,
                category: payload.category ?? null,
                imageUrl: payload.imageUrl ?? null,
                audioUrl: payload.audioUrl ?? null,
                type: payload.type || "text",
                createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
              },
            });

            results.push({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              status: "SUCCESS",
              serverId: memory.id,
            });
          }
          break;
        }

        case "TASK": {
          if (item.operation === "DELETE") {
            await prisma.task.deleteMany({
              where: { id: item.entityId, userId },
            });
            results.push({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              status: "SUCCESS",
            });
          } else {
            const scheduledAt = payload.scheduledAt
              ? new Date(payload.scheduledAt)
              : new Date();

            const task = await prisma.task.upsert({
              where: { id: item.entityId },
              update: {
                title: payload.title,
                description: payload.description ?? null,
                category: payload.category ?? null,
                scheduledAt,
                completed: Boolean(payload.completed),
                reminderEnabled: payload.reminderEnabled !== undefined ? Boolean(payload.reminderEnabled) : true,
                repeatType: payload.repeatType || "NONE",
              },
              create: {
                id: item.entityId,
                userId,
                title: payload.title || "Untitled Task",
                description: payload.description ?? null,
                category: payload.category ?? null,
                scheduledAt,
                completed: Boolean(payload.completed),
                reminderEnabled: payload.reminderEnabled !== undefined ? Boolean(payload.reminderEnabled) : true,
                repeatType: payload.repeatType || "NONE",
                createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
              },
            });

            results.push({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              status: "SUCCESS",
              serverId: task.id,
            });
          }
          break;
        }

        case "PROFILE": {
          const updateData: Record<string, any> = {};
          if (payload.fullName !== undefined) updateData.fullName = payload.fullName;
          if (payload.age !== undefined) updateData.age = payload.age;
          if (payload.phone !== undefined) updateData.phone = payload.phone;
          if (payload.dateOfBirth !== undefined)
            updateData.dateOfBirth = payload.dateOfBirth ? new Date(payload.dateOfBirth) : null;
          if (payload.gender !== undefined) updateData.gender = payload.gender;
          if (payload.address !== undefined) updateData.address = payload.address;
          if (payload.city !== undefined) updateData.city = payload.city;
          if (payload.bloodGroup !== undefined) updateData.bloodGroup = payload.bloodGroup;
          if (payload.medicalNotes !== undefined) updateData.medicalNotes = payload.medicalNotes;
          if (payload.language !== undefined) updateData.language = payload.language;
          if (payload.textSize !== undefined) updateData.textSize = payload.textSize;
          if (payload.caregiverName !== undefined) updateData.caregiverName = payload.caregiverName;
          if (payload.caregiverAccess !== undefined) updateData.caregiverAccess = payload.caregiverAccess;
          if (payload.gpsSharing !== undefined) updateData.gpsSharing = payload.gpsSharing;

          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
          });

          results.push({
            id: item.id,
            entityType: item.entityType,
            entityId: item.entityId,
            status: "SUCCESS",
            serverId: updatedUser.id,
          });
          break;
        }

        case "ALERT": {
          if (item.operation === "DELETE") {
            await prisma.alert.deleteMany({
              where: {
                id: item.entityId,
                OR: [{ caregiverId: userId }, { patientId: userId }],
              },
            });
            results.push({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              status: "SUCCESS",
            });
          } else {
            const status = payload.status || "ACTIVE";
            const updateData: Record<string, any> = {
              status,
            };
            if (payload.title) updateData.title = payload.title;
            if (payload.description !== undefined) updateData.description = payload.description;
            if (payload.category) updateData.category = payload.category;
            if (payload.typeLabel) updateData.typeLabel = payload.typeLabel;
            if (payload.badge) updateData.badge = payload.badge;
            if (payload.acknowledgedAt) {
              updateData.acknowledgedAt = new Date(payload.acknowledgedAt);
            } else if (status === "ACKNOWLEDGED") {
              updateData.acknowledgedAt = new Date();
            }
            if (payload.resolvedAt) {
              updateData.resolvedAt = new Date(payload.resolvedAt);
            } else if (status === "RESOLVED") {
              updateData.resolvedAt = new Date();
            }

            const alert = await prisma.alert.upsert({
              where: { id: item.entityId },
              update: updateData,
              create: {
                id: item.entityId,
                patientId: payload.patientId || userId,
                caregiverId: payload.caregiverId || userId,
                category: payload.category || "general",
                typeLabel: payload.typeLabel || "Alert",
                title: payload.title || "Alert",
                description: payload.description || "",
                badge: payload.badge || "Alert",
                status,
                sourceType: payload.sourceType || "TASK",
                sourceId: payload.sourceId ?? null,
                acknowledgedAt: updateData.acknowledgedAt ?? null,
                resolvedAt: updateData.resolvedAt ?? null,
                createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
              },
            });

            results.push({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              status: "SUCCESS",
              serverId: alert.id,
            });
          }
          break;
        }

        default:
          results.push({
            id: item.id,
            entityType: item.entityType,
            entityId: item.entityId,
            status: "ERROR",
            error: `Unsupported entity type: ${item.entityType}`,
          });
      }
    } catch (err) {
      results.push({
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        status: "ERROR",
        error: err instanceof Error ? err.message : "Unknown error during sync",
      });
    }
  }

  return results;
}

/**
 * Fetch server updates modified since a specific timestamp for client pull sync.
 */
export async function processSyncPull(userId: string, sinceDate?: Date) {
  const filter = sinceDate ? { updatedAt: { gte: sinceDate } } : {};
  const filterCreatedAt = sinceDate ? { createdAt: { gte: sinceDate } } : {};

  const [memories, tasks, gameResults, cognitiveScores, profile, alerts] = await Promise.all([
    prisma.memory.findMany({
      where: { userId, ...filter },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: { userId, ...filter },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.gameResult.findMany({
      where: { userId, ...filterCreatedAt },
      include: { game: true },
      orderBy: { playedAt: "desc" },
      take: 50,
    }),
    prisma.cognitiveScore.findMany({
      where: { userId, ...filterCreatedAt },
      orderBy: { recordedAt: "desc" },
      take: 30,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        age: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        bloodGroup: true,
        medicalNotes: true,
        profileImageUrl: true,
        language: true,
        caregiverName: true,
        caregiverAccess: true,
        gpsSharing: true,
        textSize: true,
        updatedAt: true,
      },
    }),
    prisma.alert.findMany({
      where: {
        OR: [{ caregiverId: userId }, { patientId: userId }],
        ...filter,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    timestamp: new Date().toISOString(),
    memories,
    tasks,
    gameResults,
    cognitiveScores,
    profile,
    alerts,
  };
}
