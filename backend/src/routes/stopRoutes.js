import express from "express";

import {
  createStop,
  getStops,
  deleteStop,
  bulkCreateStops,
  completeStop,
} from "../controllers/stopController.js";



const router = express.Router();

router.post("/", createStop);
router.post("/bulk", bulkCreateStops);

router.get("/", getStops);
router.patch("/:id/complete", completeStop);

router.delete("/:id", deleteStop);

export default router;