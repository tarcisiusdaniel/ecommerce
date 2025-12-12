import express from "express";
import {
  getProducts,
  getFavoriteProducts,
  getProductById,
} from "../controllers/products.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

// GET /api/songs/:pageNumber/:pageSize
// GET /api/songs/:pageNumber/:pageSize?search=""&language=""&genre=""
// POST /api/songs
// DELETE /api/songs/:songId
// GET/products?page=”n”&brand=”brand1;brand2”&type=”type1;type2”

const productsRouter = express.Router();
productsRouter.get("", getProducts);
productsRouter.get("/favorites", authMiddleware, getFavoriteProducts);
productsRouter.get("/:productId", getProductById);

export default productsRouter;
