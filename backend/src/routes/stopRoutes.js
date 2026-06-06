import express from "express";

import {
  createStop,
  getStops,
  deleteStop,
} from "../controllers/stopController.js";

const router = express.Router();

router.post("/", createStop);

router.get("/", getStops);

router.delete("/:id", deleteStop);

export default router;