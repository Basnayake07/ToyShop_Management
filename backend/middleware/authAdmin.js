import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins allowed." });
    }
    req.user = decoded; // Optionally attach user info to req
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};