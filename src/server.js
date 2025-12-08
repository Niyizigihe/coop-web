import express from "express";
import dotenv from "dotenv";
import path from "path";
import memberRoutes from "./routes/memberRoutes.js";
import expressLayouts from "express-ejs-layouts";

dotenv.config();

const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set views and EJS engine
app.set("view engine", "ejs");
app.set("views", "views");

// Enable layouts
app.use(expressLayouts);
app.set("layout", "layout"); // this tells EJS which layout file to use

// Static files
app.use(express.static("public"));

// Routes
app.use("/", memberRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));
