import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    favoriteProducts: { type: [String], default: [] },
    roles: { type: String, default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");
export default User;
