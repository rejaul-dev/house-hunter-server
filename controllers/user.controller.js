const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET;

const User = require("../models/user.model");

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain 6+ chars, uppercase, lowercase, number, symbol",
      });
    }
    const user = await User.signup(name, email, password, phone, role);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("All fields are required");
    }

    const user = await User.login(email, password);

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET_KEY);
      const blacklistedTokens = {};
      blacklistedTokens[token] = true;

      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {}
  }
  return res.status(200).json({ message: "Logout successful" });
};

module.exports = { createUser, loginUser, logoutUser };
