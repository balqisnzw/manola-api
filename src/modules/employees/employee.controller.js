const bcrypt = require("bcrypt");
const employeeService = require("./employee.service");

exports.createEmployee = async (req, res) => {
  try {
    const { email, password, nama, foto, role } = req.body;

    if (!email || !password || !nama || !role) {
      return res.status(400).json({
        status: "Failed",
        message: "Email, Password, Name, And Role Are Required",
      });
    }

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
      status: "OK",
      message: "Success Create Employee Account",
      data: employee,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Create Employee Account",
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees();

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Employees",
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Employees",
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingEmployee = await employeeService.getEmployeeById(id);

    if (!existingEmployee) {
      return res.status(404).json({
        status: "Failed",
        message: "Employee Not Found",
      });
    }

    await employeeService.deleteEmployee(id);

    res.status(200).json({
      status: "OK",
      message: "Success Delete Employee Account",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Delete Employee Account",
    });
  }
};