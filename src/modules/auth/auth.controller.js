const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("./auth.service");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_manola123";

exports.register = async (req, res) => {
  try {
    const { email, password, nama, alamat, foto, role } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat user baru
    const newUser = await authService.createUser({
      email,
      password: hashedPassword,
      nama,
      alamat,
      foto,
      role,
    });

    // Hilangkan password dari response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Registrasi berhasil",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" } // Token valid selama 7 hari
    );

    // Hilangkan password dari response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login berhasil",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
