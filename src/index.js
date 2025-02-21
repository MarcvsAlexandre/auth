import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

// Middlewares globais
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rotas
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
