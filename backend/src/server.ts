import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SmritiCare backend running on http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.137.108:${PORT}`);
});