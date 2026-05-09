const express = require("express");
const router = express.Router();
const employeeController = require("./employee.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Semua route hanya bisa diakses OWNER
router.use(verifyToken);
router.use(checkRole("OWNER"));

// Menambah akun karyawan baru
router.post("/", employeeController.createEmployee);

// Melihat daftar karyawan
router.get("/", employeeController.getEmployees);

// Menghapus akun karyawan
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
