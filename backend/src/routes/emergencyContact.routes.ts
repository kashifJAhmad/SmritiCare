import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createContact,
  deleteContact,
  getContactById,
  getContacts,
  updateContact,
} from "../controllers/emergencyContact.controller";

const router = Router();

router.use(authenticate);

router.post("/", createContact);
router.get("/", getContacts);
router.get("/:id", getContactById);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;