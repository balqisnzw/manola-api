const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authService = require("./auth.service");
const { sendResetPasswordEmail } = require("../../libs/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_manola123";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

exports.register = async (req, res) => {
  try {
    const { email, password, nama, foto } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const validEmail = email.includes("@") && email.includes(".");
    if (!validEmail) {
      return res.status(400).json({ message: "Invalid Format Email" });
    }
    
    // Buat user baru (role default: USER)
    const newUser = await authService.createUser({
      email,
      password: hashedPassword,
      nama,
      foto,
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Cek apakah email terdaftar
    const user = await authService.findUserByEmail(email);
    if (!user) {
      // Tetap kirim response sukses agar tidak bisa digunakan untuk cek email terdaftar
      return res.json({ message: "Jika email terdaftar, link reset password telah dikirim" });
    }

    // Generate token random
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam dari sekarang

    // Simpan token ke database
    await authService.createResetToken(email, token, expiresAt);

    // Kirim email
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({ message: "Jika email terdaftar, link reset password telah dikirim" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Cari token di database
    const resetToken = await authService.findResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ message: "Token tidak valid atau sudah digunakan" });
    }

    // Cek apakah token sudah expired
    if (new Date() > resetToken.expiresAt) {
      // Hapus token yang expired
      await authService.deleteResetToken(token);
      return res.status(400).json({ message: "Token sudah expired. Silakan request ulang" });
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password user
    await authService.updateUserPassword(resetToken.email, hashedPassword);

    // Hapus token setelah berhasil digunakan
    await authService.deleteResetToken(token);

    res.json({ message: "Password berhasil direset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await authService.getAllUsers(role);
    res.json({
      status: "OK",
      message: "Success Get Data Users",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
