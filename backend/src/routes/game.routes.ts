import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as gameController from "../controllers/game.controller";

const router = Router();

router.use(authenticate);

router.post("/result", gameController.submitGameResult);
router.get("/results", gameController.getUserGameResults);

router.post("/cognitive-score", gameController.submitCognitiveScore);
router.get("/cognitive-scores", gameController.getUserCognitiveScores);

export default router;
