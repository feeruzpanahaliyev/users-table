require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);

/*
app.use(cors({
  origin: "http://localhost:5174",
  exposedHeaders: ['X-Total-Count']
}));
*/

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 3001, () =>
      console.log("Server running on port 3001")
    );
  })
  .catch((err) => console.error(err));
