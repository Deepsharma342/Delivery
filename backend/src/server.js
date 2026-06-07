import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import stopRoutes from "./routes/stopRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/stops", stopRoutes);
app.use("/api/routes", routeRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Delivery Route Optimizer API Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});