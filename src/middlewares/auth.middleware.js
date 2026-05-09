const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_manola123";

// Middleware untuk memverifikasi token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan" });
  }

  // Format: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Format token salah" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Menyimpan payload (id, email, role) ke req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau sudah expired" });
  }
};

// Middleware untuk mengecek role user (RBAC)
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Akses ditolak. Role tidak ditemukan" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini" });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};
