import jwt from "jsonwebtoken";

// Common function to verify token
const verifyAuth = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new Error("Unauthorized");
  }

  const parts = authorization.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Unauthorized");
  }

  const token = parts[1];

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  return payload;
};

// Admin Middleware
export const AdminAccessMiddleware = (req, res, next) => {
  try {
    const payload = verifyAuth(req);

    if (payload.role !== "admin") {
      throw new Error("Unauthorized");
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized access (admin only)" });
  }
};

// User Middleware
export const UserAccessMiddleware = (req, res, next) => {
  try {
    const payload = verifyAuth(req);

    if (payload.role !== "user") {
      throw new Error("Unauthorized");
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized access (user only)" });
  }
};

// Any logged-in user
export const AuthAccessMiddleware = (req, res, next) => {
  try {
    const payload = verifyAuth(req);

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
