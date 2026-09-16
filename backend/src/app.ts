import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import caregiverConnectionRoutes from "./routes/caregiverConnection.routes";
import taskRoutes from "./routes/task.routes";
import emergencyContactRoutes from "./routes/emergencyContact.routes";
import memoryRoutes from "./routes/memory.routes";
import memoryUploadRoutes from "./routes/memoryUpload.routes";
import profileImageRoutes from "./routes/profileImage.routes";
import locationRoutes from "./routes/location.routes";
import gameRoutes from "./routes/game.routes";
import syncRoutes from "./routes/sync.routes";
import alertRoutes from "./routes/alert.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads"),
  ),
);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "SmritiCare backend is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/caregiver-connections",
  caregiverConnectionRoutes,
);

app.use("/api/tasks", taskRoutes);

app.use(
  "/api/emergency-contacts",
  emergencyContactRoutes,
);

app.use("/api/memories", memoryRoutes);

app.use(
  "/api/memories/upload",
  memoryUploadRoutes,
);

app.use(
  "/api/auth/profile-image",
  profileImageRoutes,
);

app.use(
  "/api/location",
  locationRoutes,
);

app.use("/api/games", gameRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/alerts", alertRoutes);

export default app;