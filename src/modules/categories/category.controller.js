const categoryService = require("./category.service");

exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const newCategory = await categoryService.createCategory({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    // Handle unique constraint error (nama kategori sudah ada)
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Kategori dengan nama tersebut sudah ada" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const updatedCategory = await categoryService.updateCategory(id, { name });
    res.json(updatedCategory);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Kategori dengan nama tersebut sudah ada" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    await categoryService.deleteCategory(id);
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
