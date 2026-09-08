import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import emergencyContactRoutes from "./routes/emergencyContact.routes";
import memoryRoutes from "./routes/memory.routes";
import memoryUploadRoutes from "./routes/memoryUpload.routes";
import profileImageRoutes from "./routes/profileImage.routes";

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

export default app;