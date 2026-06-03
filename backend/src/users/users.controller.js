import bcrypt from "bcrypt";
import User from "./users.schema.js";
import { createToken, verifyToken } from "../utils/jwt.js";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create(req.body);

    const payload = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    const token = createToken(payload);

    res.status(201).json({ ...payload, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLogin = await bcrypt.compare(password, user.password);
    if (!isLogin) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const payload = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    const token = createToken(payload);

    res.json({ ...payload, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//VERIFY USERS
export const verify = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = verifyToken(token);
    if (!payload) throw new Error("Invalid token");

    res.json(payload);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

// FETCH USERS (ADMIN)
export const fetchUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user?.id } },
      "-password",
    ).sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};

// UPDATE USER (ADMIN)
export const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password.toString(), 12);
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FETCH SESSION (CURRENT USER)
export const fetchSession = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PROFILE (CURRENT USER)
export const updateUserProfile = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password.toString(), 12);
    }

    const user = await User.findByIdAndUpdate(req.user?.id, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
