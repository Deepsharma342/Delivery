import express from "express";
import { optimizeStops } from "../controllers/routeController.js";

const router = express.Router();

router.post("/optimize", optimizeStops);

export default router;