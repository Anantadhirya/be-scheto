const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

const app = express();

app.use(cors({ origin: true }));

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.route("/").get((req, res, next) => {
  res.status(200).json({ message: "Hello World" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
