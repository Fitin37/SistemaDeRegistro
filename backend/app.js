import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import clientesRouter from "./src/routes/clientesRoutes.js"

const app = express();

// CORS PRIMERO - antes que otros middlewares
app.use(cors({
  origin: "https://sistema-de-registro-kappa.vercel.app",
  credentials: true
}));

// DESPUÉS los demás middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/test", (req, res) => {
  res.json({ message: "Test with cookieParser" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/clientes", clientesRouter);

export default app;