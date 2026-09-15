import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as syncController from "../controllers/sync.controller";

const router = Router();

router.use(authenticate);

router.post("/push", syncController.pushSync);
router.get("/pull", syncController.pullSync);

export default router;
