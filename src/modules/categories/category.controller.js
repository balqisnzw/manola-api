const categoryService = require("./category.service");

exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ status: "OK", data: categories });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: "Gagal memuat kategori" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ status: "Failed", message: "Nama kategori wajib diisi" });
    const category = await categoryService.createCategory(nama);
    res.status(201).json({ status: "OK", message: "Kategori berhasil dibuat", data: category });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ status: "Failed", message: "Nama kategori wajib diisi" });
    const category = await categoryService.updateCategory(parseInt(req.params.id), nama);
    res.status(200).json({ status: "OK", message: "Kategori berhasil diperbarui", data: category });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(parseInt(req.params.id));
    res.status(200).json({ status: "OK", message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};
