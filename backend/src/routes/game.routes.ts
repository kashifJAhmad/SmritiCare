import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as gameController from "../controllers/game.controller";

const router = Router();

router.use(authenticate);

router.post("/result", gameController.submitGameResult);
router.get("/results", gameController.getUserGameResults);
router.get("/patient/:patientId/results", gameController.getPatientGameResults);

router.post("/cognitive-score", gameController.submitCognitiveScore);
router.get("/cognitive-scores", gameController.getUserCognitiveScores);
router.get("/patient/:patientId/cognitive-scores", gameController.getPatientCognitiveScores);

export default router;
