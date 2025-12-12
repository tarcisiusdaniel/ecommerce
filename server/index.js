import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import productsRouter from "./routes/products.routes.js";
import userRouter from "./routes/users.routes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(__dirname);
// console.log(path.join(__dirname, '../public/html'));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser()); // cookie parser middleware
app.use("/api/products", productsRouter);
app.use("/api/users", userRouter);

// page redirection
app.get("", authMiddleware, (req, res) => {
  if (req.user && req.user.role === "admin") {
    res.redirect("/admin");
  } else {
    res.sendFile(path.join(__dirname, "../public/html/index.html"));
  }
});
app.get("/login", authMiddleware, (req, res) => {
  if (req.user) {
    const encoded = Buffer.from("403 - You already logged in").toString(
      "base64"
    );
    // Send in URL
    res.redirect("/error?msg=" + encoded);
    return;
    // res.status(403).send("403 - You already logged in");
  }
  res.sendFile(path.join(__dirname, "../public/html/login.html"));
});
app.use("/register", authMiddleware, (req, res) => {
  if (req.user) {
    const encoded = Buffer.from("403 - You already logged in").toString(
      "base64"
    );
    // Send in URL
    res.redirect("/error?msg=" + encoded);
    return;
    // res.status(403).send("403 - You already logged in");
  }
  res.sendFile(path.join(__dirname, "../public/html/register.html"));
});

app.use("/product/:id", authMiddleware, (req, res) => {
  if (req.user && req.user.role !== "user") {
    const encoded = Buffer.from("403 - Admin cannot access this page").toString(
      "base64"
    );
    // Send in URL
    res.redirect("/error?msg=" + encoded);
    return;
    // res.status(403).send("403 - Admin cannot access this page");
  }
  res.sendFile(path.join(__dirname, "../public/html/product.html"));
});

app.use("/admin", authMiddleware, (req, res) => {
  if (!req.user || (req.user && req.user.role !== "admin")) {
    const encoded = Buffer.from(
      "403 - Forbidden Entry due to your credentials"
    ).toString("base64");
    // Send in URL
    res.redirect("/error?msg=" + encoded);
    return;
    // res.status(403).send("403 - Forbidden Entry due to your credentials");
  }
  res.sendFile(path.join(__dirname, "../public/html/admin.html"));
});

app.get("/error", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/error.html"));
});

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found, Invalid URL");
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
