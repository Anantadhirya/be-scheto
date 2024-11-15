const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")

const errorHandler = require("./src/middleware/errorHandler");

dotenv.config();

const app = express();

const corsConfig = require('./src/config/corsConfig')
app.use(cors(corsConfig()));

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.route("/").get((req, res, next) => {
  res.status(200).json({ message: "Hello World" });
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
const mongoURI = process.env.DB_CONN
app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Connect to MongoDB
  mongoose.connect(mongoURI, {
    
  })
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
});
