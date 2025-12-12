import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
  logoutUser,
  makeProductFavorite,
  deleteProductFromFavorite,
  getUsersDataForAdmin,
} from "../controllers/users.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

// POST /api/users/register
// POST /api/users/login:
// GET /api/users/verify:
// GET /api/users/logout:
// GET /api/users/profile:
// PUT /api/users/profile:
// PATCH /api/users/like:
// GET /api/users/likedSongs/:pageNumber/:pageSize:

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify", authMiddleware, verifyUser);
userRouter.get("/logout", authMiddleware, logoutUser);
userRouter.patch("/add/favorite", authMiddleware, makeProductFavorite);
userRouter.patch("/delete/favorite", authMiddleware, deleteProductFromFavorite);
userRouter.get("/all", authMiddleware, getUsersDataForAdmin);

export default userRouter;
