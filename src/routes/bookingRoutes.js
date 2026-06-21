import express from "express";
import {
  createBooking, getSeekerBookings, getProviderBookings,
  getBookingById, updateBookingStatus, cancelBooking,
  bookingValidation,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("skillSeeker"), bookingValidation, validate, createBooking);
router.get("/my", protect, restrictTo("skillSeeker"), getSeekerBookings);
router.get("/provider", protect, restrictTo("skillProvider"), getProviderBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, updateBookingStatus);
router.delete("/:id", protect, restrictTo("skillSeeker"), cancelBooking);

export default router;
