const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { validateUser } = require("../validators/userValidator");
const Counter = require("../models/Counter");

router.get("/", async (req, res, next) => {
  const {
    page = 1,
    per_page = 10,
    q,
    role,
    status,
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;

  const query = {};
  if (q) query.name = { $regex: q, $options: "i" };
  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(per_page);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  try {
    const [users, totalCount] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(parseInt(per_page)),
      User.countDocuments(query),
    ]);

    const formatted = users
      .filter((u) => u !== null)
      .map((u) => ({
        ...u.toObject(),
        id: u.id,
        _id: undefined,
      }));

    res.json({
      total: totalCount,
      totalPages: Math.ceil(totalCount / parseInt(per_page)),
      currentPage: parseInt(page),
      users: formatted,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    next(err);
  }
});

// Statistics page allusers
router.get("/allUsers", async (req, res, next) => {
  try {
    const users = await User.find().lean();

    const formatted = users.map((u) => ({
      ...u,
      id: u.id,
      _id: undefined,
    }));

    res.json({ users: formatted });
  } catch (err) {
    console.error("Error fetching all users:", err);
    next(err);
  }
});

// Add user
router.post("/", async (req, res, next) => {
  console.log("POST /users route hit");

  if (!req.body.id) {
      const counter = await Counter.findByIdAndUpdate(
        { id: "id" }, 
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      req.body.id = counter.seq;
    }

  console.log("Validating user:", req.body);

  const { error } = validateUser(req.body);
  if (error) {
    console.error("Validation error:", error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    const formatted = {
      ...savedUser.toObject(),
      id: savedUser.id,
      _id: undefined,
    };

    res.status(201).json(formatted);
  } catch (err) {
    console.error("Error creating user:", err);
    next(err);
  }
});

// By ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne({ id: Number(id) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error in /users/:id route:", err);
    next(err);
  }
});

// Update user
router.put("/:id", async (req, res, next) => {
  try {
    const { error } = validateUser(req.body);
    if (error){ 
      return res.status(400).json({ error: error.details[0].message });
    };

    const updatedUser = await User.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const formatted = {
      ...updatedUser.toObject(),
      id: updatedUser.id,
      _id: undefined,
    };

    res.json(formatted);
  } catch (err) {
    console.error("Error updating user:", err);
    next(err);
  }
});



//Delete User
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      id: parseInt(req.params.id),
    });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    next(err);
  }
});

module.exports = router;
