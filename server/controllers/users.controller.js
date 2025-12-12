// create the controller for user features
import User from "../models/users.model.js";
import Product from "../models/products.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// login and register are the only two functions without authentication

// function to register a user
export const registerUser = async (req, res) => {
  // get the user data from req.body
  const { username, email, password, confirmPassword } = req.body;
  // check if the user already exists
  const userWithEmail = await User.findOne({ email });
  const userWithUsername = await User.findOne({ username });
  if (userWithEmail) {
    return res.status(409).send({ message: "Email already used" });
  }
  if (userWithUsername) {
    return res.status(409).send({ message: "Username already used" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;

  // password validation
  if (password.length <= 7 || password.length >= 15) {
    return res.status(422).send({
      message:
        "password must be longer than 7 characters and shorter than 15 characters",
    });
  }
  if (!passwordRegex.test(password)) {
    return res.status(422).send({
      message:
        "password must contain uppercase, lowercase, number, special characters",
    });
  }
  if (password !== confirmPassword) {
    return res.status(422).send({
      message: "Passwords do not match!",
    });
  }

  // username validation
  if (username.length <= 4 || username.length >= 30) {
    return res.status(422).send({
      message:
        "Username must be longer than 4 characters and shorter than 30 characters",
    });
  }
  if (!/^[A-Za-z0-9]+$/.test(username)) {
    return res.status(422).send({
      message: "Username must be alphanumeric, no special characters.",
    });
  }

  // email validation
  if (email.length <= 5 || email.length >= 50) {
    return res.status(422).send({
      message:
        "Email must be longer than 5 characters and shorter than 50 characters",
    });
  }
  if (!/^[A-Za-z0-9@.]+$/.test(email)) {
    return res.status(422).send({
      message: "Min length, max length, no special characters besides @ and .",
    });
  }
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    return res.status(422).send({
      message: "Format not allowed, allowed example: abcd123@gmail.com",
    });
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
  // save the user to the database
  await newUser.save();
  // send a response back to the client
  res.status(201).json({ message: "User registered successfully" });
};

// function to login a user
// upon successful login, backend should generate a JWT
// and send to the frontend
// (you can choose to save the JWT through either cookies or localStorage)
export const loginUser = async (req, res) => {
  // get the user data based of req.body
  const { usernameOrEmail, password } = req.body;
  // find the user by email
  const userByUsername = await User.findOne({ username: usernameOrEmail });
  const userByEmail = await User.findOne({ email: usernameOrEmail });
  if (!(userByUsername || userByEmail)) {
    return res
      .status(400)
      .send({ message: "Invalid username or email or password" });
  }
  const user = !userByUsername ? userByEmail : userByUsername;
  // compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send({ message: "Invalid username or password" });
  }
  // generate a JWT
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  // set the JWT in a cookie
  res.cookie("jwtAssignmentToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  // send the JWT back to the client
  res.status(200).json({ role: user.roles, message: "Login successful" });
};

// function to verify a user based on JWT
// verification endpoint that receives a JWT,
// and checks if the JWT is still valid,
// so that users don't have to login again
// if they have a valid JWT in their browser already
export const verifyUser = async (req, res) => {
  if (!req.loggedIn) {
    return res
      .status(401)
      .send({ loggedIn: req.loggedIn, message: req.loginMsg });
  }
  res.status(200).send({ loggedIn: req.loggedIn, username: req.user.username });
};

// function to logout a user
// logout a user, if using cookies, clear the cookie,
// if using localStorage, only need to send a success response,
// and frontend needs to clear localStorage
export const logoutUser = async (req, res) => {
  // clear the JWT in the cookie
  res.clearCookie("jwtAssignmentToken");
  req.user = null;
  req.loggedIn = null;
  res.status(200).json({ message: "Logout successful" });
};

// make a product as favorite
export const makeProductFavorite = async (req, res) => {
  // get the id of the product
  const { productId } = req.body;
  const { id } = req.user;
  const a = await User.findOne({ _id: new mongoose.Types.ObjectId(id) });
  console.log(a);
  // add it
  const patchStatus = await User.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $addToSet: { favoriteProducts: productId }, // avoids duplicates
    }
  );
  // check if patch was successful
  if (!patchStatus) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).send({ message: "product add to favorite list" });
};

// make a product as favorite
export const deleteProductFromFavorite = async (req, res) => {
  // get the id of the product
  const { productId } = req.body;
  const { id } = req.user;
  // add it
  const patchStatus = await User.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $pull: { favoriteProducts: productId }, // avoids duplicates
    }
  );
  // check if patch was successful
  if (!patchStatus) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).send({ message: "product removed from favorite list" });
};

export const getUsersDataForAdmin = async (req, res) => {
  const users = await User.find({ roles: { $ne: "admin" } });
  const sentData = await Promise.all(
    users.map(async ({ username, favoriteProducts }) => {
      const products = await Product.find({
        _id: { $in: favoriteProducts },
      });

      return {
        username,
        products,
      };
    })
  );

  res
    .status(200)
    .send({ data: sentData, message: "product removed from favorite list" });
};
