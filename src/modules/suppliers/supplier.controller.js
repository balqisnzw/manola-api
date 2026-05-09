const supplierService = require("./supplier.service");

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const supplier = await supplierService.getSupplierById(id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { nama, no_telepon, alamat } = req.body;

    if (!nama || !no_telepon) {
      return res.status(400).json({ message: "Nama dan no_telepon wajib diisi" });
    }

    const newSupplier = await supplierService.createSupplier({
      nama,
      no_telepon,
      alamat,
    });

    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await supplierService.getSupplierById(id);
    if (!existing) {
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    }

    const { nama, no_telepon, alamat } = req.body;

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (no_telepon !== undefined) updateData.no_telepon = no_telepon;
    if (alamat !== undefined) updateData.alamat = alamat;

    const updatedSupplier = await supplierService.updateSupplier(id, updateData);
    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await supplierService.getSupplierById(id);
    if (!existing) {
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    }

    await supplierService.deleteSupplier(id);
    res.json({ message: "Supplier berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
