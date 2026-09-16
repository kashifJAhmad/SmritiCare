import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as gameService from "../services/game.service";

export async function submitGameResult(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id, gameId, gameName, score, duration, playedAt } = req.body;

    if (score === undefined || score === null || isNaN(Number(score))) {
      return res.status(400).json({
        success: false,
        message: "Valid score is required",
      });
    }

    const result = await gameService.recordGameResult(req.userId, {
      id,
      gameId,
      gameName,
      score: Number(score),
      duration: duration !== undefined && duration !== null ? Number(duration) : null,
      playedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Game result recorded successfully",
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record game result";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function submitCognitiveScore(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id, score, memory, attention, reaction, recordedAt } = req.body;

    if (score === undefined || score === null || isNaN(Number(score))) {
      return res.status(400).json({
        success: false,
        message: "Valid score is required",
      });
    }

    const scoreRecord = await gameService.recordCognitiveScore(req.userId, {
      id,
      score: Number(score),
      memory: memory !== undefined && memory !== null ? Number(memory) : null,
      attention: attention !== undefined && attention !== null ? Number(attention) : null,
      reaction: reaction !== undefined && reaction !== null ? Number(reaction) : null,
      recordedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Cognitive score recorded successfully",
      score: scoreRecord,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record cognitive score";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getUserGameResults(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const results = await gameService.getUserGameResults(req.userId, limit);

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load game results";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getUserCognitiveScores(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 30;
    const scores = await gameService.getUserCognitiveScores(req.userId, limit);

    return res.status(200).json({
      success: true,
      scores,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load cognitive scores";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getPatientGameResults(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId || !req.params.patientId || Array.isArray(req.params.patientId)) return res.status(401).json({ success: false, message: "Authentication and patient ID are required" });
    const results = await gameService.getPatientGameResultsForCaregiver(req.userId, req.params.patientId, req.query.limit ? Number(req.query.limit) : 50);
    return res.json({ success: true, results });
  } catch (error) { return res.status(403).json({ success: false, message: error instanceof Error ? error.message : "Unable to load patient game results" }); }
}

export async function getPatientCognitiveScores(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId || !req.params.patientId || Array.isArray(req.params.patientId)) return res.status(401).json({ success: false, message: "Authentication and patient ID are required" });
    const scores = await gameService.getPatientCognitiveScoresForCaregiver(req.userId, req.params.patientId, req.query.limit ? Number(req.query.limit) : 30);
    return res.json({ success: true, scores });
  } catch (error) { return res.status(403).json({ success: false, message: error instanceof Error ? error.message : "Unable to load patient cognitive scores" }); }
}
