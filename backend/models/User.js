const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  role: String,
  email: String,
  status: String,
  salary: Number,
});

module.exports = mongoose.model("User", userSchema);
