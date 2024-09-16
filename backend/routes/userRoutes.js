import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only route example
router.get("/admin", protect, admin, (req, res) => {
  res.send("Admin Access");
});

// Admin-only route to get all users
router.get("/admin/users", protect, admin, async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

export default router;
