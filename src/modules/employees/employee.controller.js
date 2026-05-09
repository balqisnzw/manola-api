const bcrypt = require("bcrypt");
const employeeService = require("./employee.service");

exports.createEmployee = async (req, res) => {
  try {
    const { email, password, nama, foto, role } = req.body;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const employee = await employeeService.createEmployee({
      email,
      password: hashedPassword,
      nama,
      foto,
      role,
    });

    res.status(201).json({
      message: "Akun karyawan berhasil dibuat",
      employee,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await employeeService.deleteEmployee(id);
    res.json({ message: "Akun karyawan berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
