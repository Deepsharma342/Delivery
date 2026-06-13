import express from "express";
import {
  createStop,
  getStops,
  deleteStop,
  deleteAllStops,
  bulkCreateStops,
  completeStop,
} from "../controllers/stopController.js";

const router = express.Router();

router.post("/", createStop);
router.post("/bulk", bulkCreateStops);

router.get("/", getStops);
router.patch("/:id/complete", completeStop);

router.delete("/all", deleteAllStops); // ✅ must be ABOVE /:id or Express will treat "all" as an id
router.delete("/:id", deleteStop);

export default router;