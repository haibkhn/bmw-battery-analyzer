import express from "express";
import cors from "cors";
import { csvRoutes } from "./routes/csvRoutes";
import { initializeDatabase } from "./config/database";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
import fs from "fs";
import path from "path";
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database
initializeDatabase().catch(console.error);

// Routes
app.use("/api/csv", csvRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
