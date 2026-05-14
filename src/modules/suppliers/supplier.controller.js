const supplierService = require("./supplier.service");

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.json({
      status: "OK",
      message: "Success Get Data Supplier",
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Supplier",
    });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const supplier = await supplierService.getSupplierById(id);

    if (!supplier) {
      return res.status(404).json({
        status: "Failed",
        message: "Supplier Not Found",
      });
    }

    res.json({
      status: "OK",
      message: "Success Get Data Supplier",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Supplier",
    });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { nama, no_telepon, alamat } = req.body;

    if (!nama || !no_telepon || !alamat) {
      return res.status(400).json({
        status: "Failed",
        message: "Name, Phone Number, And Address Are Required",
      });
    }

    const newSupplier = await supplierService.createSupplier({
      nama,
      no_telepon,
      alamat,
    });

    res.status(201).json({
      status: "OK",
      message: "Success Create Supplier",
      data: newSupplier,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Create Supplier",
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await supplierService.getSupplierById(id);
    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Supplier Not Found",
      });
    }

    const { nama, no_telepon, alamat } = req.body;

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (no_telepon !== undefined) updateData.no_telepon = no_telepon;
    if (alamat !== undefined) updateData.alamat = alamat;

    const updatedSupplier = await supplierService.updateSupplier(id, updateData);
    res.json({
      status: "OK",
      message: "Success Update Supplier",
      data: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Update Supplier",
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await supplierService.getSupplierById(id);
    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Supplier Not Found",
      });
    }

    await supplierService.deleteSupplier(id);
    res.json({
      status: "OK",
      message: "Success Delete Supplier",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Delete Supplier",
    });
  }
};