const mongoose = require("mongoose");
const User = require("./models/User");
const fs = require("fs");
require("dotenv").config();

const rawData = fs.readFileSync("db.json");
const data = JSON.parse(rawData);
const users = data.users;

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await User.deleteMany(); 
    await User.insertMany(users);
    console.log("Users imported successfully.");
  } catch (err) {
    console.error("Error importing users:", err);
  } finally {
    mongoose.disconnect();
  }
});
