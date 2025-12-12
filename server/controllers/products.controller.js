import Product from "../models/products.model.js";
import User from "../models/users.model.js";
import mongoose from "mongoose";

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = 9; // items per page

    // Get brands and types from query, split by semicolon into array
    const brands = req.query.brand ? req.query.brand.split(";") : [];
    const types = req.query.type ? req.query.type.split(";") : [];

    // Build MongoDB query
    const query = {};
    if (brands.length > 0) query.brand = { $in: brands };
    if (types.length > 0) query.type = { $in: types };

    console.log("from getProducts:");
    const productsLength = await Product.countDocuments(query);

    // Pagination
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return res
      .status(200)
      .send({ message: "Success", count: productsLength, products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFavoriteProducts = async (req, res) => {
  try {
    if (!req.loggedIn) {
      return res.status(404).send({ message: "No logged in user" });
    }
    // get the user info from req.user
    const { id } = req.user;
    // get the user favorite products
    // get the user's favorite product IDs
    const user = await User.findById(id).select("favoriteProducts");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // fetch the favorite products
    const favoriteProducts = await Product.find({
      _id: { $in: user.favoriteProducts },
    });

    res.status(200).send(favoriteProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
    });
    if (!product) {
      return res.status(422).send({ message: "Product not found" });
    }

    res.status(200).send({
      message: "Product found",
      product: product,
    });
  } catch (error) {
    return res.status(422).send({ message: "422 - Product does not exist" });
  }
};
