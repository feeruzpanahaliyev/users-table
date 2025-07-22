const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
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
        id: u.id.toString(),
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
    res.status(500).json({ error: "Internal server error" });
  }
});

// By ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ id: Number(id) }); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error in /users/:id route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Statistics page allusers
router.get("/allUsers", async (req, res) => {
  try {
    const users = await User.find().lean();

    const formatted = users.map((u) => ({
      ...u,
      id: u.id.toString(),
      _id: undefined,
    }));

    res.json({ users: formatted });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: "Failed to fetch all users" });
  }
});


// Add user
router.post("/", async (req, res) => {
  try {
    if (!req.body.id) {
      const lastUser = await User.findOne().sort({ id: -1 }).limit(1);
      req.body.id = lastUser ? lastUser.id + 1 : 1;
    }

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
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: parseInt(req.params.id) }, 
      req.body,
      { new: true }  
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
    res.status(500).json({ error: "Failed to update user" });
  }
});

//Delete User
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ id: parseInt(req.params.id) });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
