import { prisma } from "../config/database";
import { requireCaregiverPatientAccess } from "./caregiverAccess.service";

export type SubmitGameResultInput = {
  id?: string;
  gameId?: string;
  gameName?: string;
  score: number;
  duration?: number | null;
  playedAt?: Date | string;
};

export type SubmitCognitiveScoreInput = {
  id?: string;
  score: number;
  memory?: number | null;
  attention?: number | null;
  reaction?: number | null;
  recordedAt?: Date | string;
};

const DEFAULT_GAMES = [
  {
    name: "guess-food",
    description: "Traditional food identification game for memory recognition",
    category: "Memory",
    difficulty: "Adaptive",
  },
  {
    name: "odd-one-out",
    description: "Visual discrimination and cognitive focus exercise",
    category: "Attention",
    difficulty: "Adaptive",
  },
];

/**
 * Ensures standard system games exist in the database.
 */
export async function ensureDefaultGamesExist() {
  for (const game of DEFAULT_GAMES) {
    await prisma.game.upsert({
      where: { name: game.name },
      update: {},
      create: {
        name: game.name,
        description: game.description,
        category: game.category,
        difficulty: game.difficulty,
        active: true,
      },
    });
  }
}

/**
 * Get game record by ID or name (auto-creating if needed).
 */
export async function getOrCreateGame(gameIdOrName: string) {
  let game = await prisma.game.findFirst({
    where: {
      OR: [{ id: gameIdOrName }, { name: gameIdOrName.toLowerCase() }],
    },
  });

  if (!game) {
    game = await prisma.game.create({
      data: {
        name: gameIdOrName.toLowerCase(),
        description: `${gameIdOrName} cognitive game`,
        category: "Cognitive",
        difficulty: "Normal",
        active: true,
      },
    });
  }

  return game;
}

/**
 * Submit game result with idempotency based on client ID.
 */
export async function recordGameResult(
  userId: string,
  data: SubmitGameResultInput
) {
  const gameIdentifier = data.gameId || data.gameName || "guess-food";
  const game = await getOrCreateGame(gameIdentifier);

  const playedAt = data.playedAt ? new Date(data.playedAt) : new Date();

  let result;
  if (data.id) {
    result = await prisma.gameResult.upsert({
      where: { id: data.id },
      update: {
        score: data.score,
        duration: data.duration ?? null,
      },
      create: {
        id: data.id,
        userId,
        gameId: game.id,
        score: data.score,
        duration: data.duration ?? null,
        playedAt,
      },
    });
  } else {
    result = await prisma.gameResult.create({
      data: {
        userId,
        gameId: game.id,
        score: data.score,
        duration: data.duration ?? null,
        playedAt,
      },
    });
  }

  return result;
}

/**
 * Record cognitive score with idempotency.
 */
export async function recordCognitiveScore(
  userId: string,
  data: SubmitCognitiveScoreInput
) {
  const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();

  let scoreRecord;
  if (data.id) {
    scoreRecord = await prisma.cognitiveScore.upsert({
      where: { id: data.id },
      update: {
        score: data.score,
        memory: data.memory ?? null,
        attention: data.attention ?? null,
        reaction: data.reaction ?? null,
      },
      create: {
        id: data.id,
        userId,
        score: data.score,
        memory: data.memory ?? null,
        attention: data.attention ?? null,
        reaction: data.reaction ?? null,
        recordedAt,
      },
    });
  } else {
    scoreRecord = await prisma.cognitiveScore.create({
      data: {
        userId,
        score: data.score,
        memory: data.memory ?? null,
        attention: data.attention ?? null,
        reaction: data.reaction ?? null,
        recordedAt,
      },
    });
  }

  return scoreRecord;
}

/**
 * Get game results for user.
 */
export async function getUserGameResults(userId: string, limit: number = 50) {
  return prisma.gameResult.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { playedAt: "desc" },
    take: limit,
  });
}

/**
 * Get cognitive scores for user.
 */
export async function getUserCognitiveScores(userId: string, limit: number = 30) {
  return prisma.cognitiveScore.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });
}

export async function getPatientGameResultsForCaregiver(caregiverId: string, patientId: string, limit = 50) {
  await requireCaregiverPatientAccess(caregiverId, patientId);
  return getUserGameResults(patientId, limit);
}

export async function getPatientCognitiveScoresForCaregiver(caregiverId: string, patientId: string, limit = 30) {
  await requireCaregiverPatientAccess(caregiverId, patientId);
  return getUserCognitiveScores(patientId, limit);
}
