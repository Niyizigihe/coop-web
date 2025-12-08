import express from "express";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import memberRoutes from "./routes/memberRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set("view engine", "ejs");
app.set("views", "views");
app.use(expressLayouts);
app.set("layout", "layout");

// Static files
app.use(express.static("public"));

// Routes
app.get("/hello", (req, res) => {
  res.status(200).json({ message: "Hello DevOps!" });
});

app.use("/", memberRoutes);

// Start server only in production/development mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("Running on port " + PORT));
}

export default app;