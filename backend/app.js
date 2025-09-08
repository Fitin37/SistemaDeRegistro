import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import clientesRouter from "./src/routes/clientesRoutes.js"


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "https://sistema-de-registro-kappa.vercel.app/"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   allowedHeaders: [
    "Content-Type",
    "Authorization", 
    "Accept",
    "Origin",
    "Cache-Control",
    "cache-control", 
    "Pragma",
    "pragma"
  ]
}));

app.get("/test", (req, res) => {
  res.json({ message: "Test with cookieParser" });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/clientes",clientesRouter);

export default app;