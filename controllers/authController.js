const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  const { username, password, role, location } = req.body;

  try {
    // Case-insensitive username check
    let user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username: username.toLowerCase(),
      password,
      role: role.toLowerCase(),
      location: location.trim(),  // Keep original case, but we'll match flexibly on login
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        location: user.location,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { username, password, role, location } = req.body;

  try {
    console.log("Login attempt:", { username, role, location }); // Debug log

    // Find user: case-insensitive username AND location
    const user = await User.findOne({
      username: username.toLowerCase(),
      location: { $regex: new RegExp("^" + location.trim() + "$", "i") } // Case-insensitive location
    });

    console.log("Found user:", user ? { username: user.username, role: user.role, location: user.location } : null);

    if (!user) {
      return res.status(400).json({ msg: "No account found with this username and location" });
    }

    if (user.role !== role.toLowerCase()) {
      return res.status(400).json({ msg: "Incorrect role selected" });
    }

   

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        location: user.location,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};