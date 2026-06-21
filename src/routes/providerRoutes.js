import express from "express";
import {
  createSkill, getAllSkills, getMySkills, getSkillById, updateSkill, deleteSkill,
  createPlan, updatePlan, deletePlan,
  skillValidation, planValidation,
} from "../controllers/providerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// Public skill routes
router.get("/skills", getAllSkills);
router.get("/skills/:id", getSkillById);

// Provider only
router.get("/my-skills", protect, restrictTo("skillProvider"), getMySkills);
router.post("/skills", protect, restrictTo("skillProvider"), skillValidation, validate, createSkill);
router.put("/skills/:id", protect, restrictTo("skillProvider"), updateSkill);
router.delete("/skills/:id", protect, restrictTo("skillProvider"), deleteSkill);

// Plans
router.post("/skills/:skillId/plans", protect, restrictTo("skillProvider"), planValidation, validate, createPlan);
router.put("/plans/:id", protect, restrictTo("skillProvider"), updatePlan);
router.delete("/plans/:id", protect, restrictTo("skillProvider"), deletePlan);

export default router;
