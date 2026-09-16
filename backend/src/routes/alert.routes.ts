import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as alertController from "../controllers/alert.controller";

const router = Router();

router.use(authenticate);

router.get("/", alertController.getAlerts);
router.post("/", alertController.createAlert);
router.post("/:id/acknowledge", alertController.acknowledgeAlert);
router.post("/:id/resolve", alertController.resolveAlert);

export default router;
