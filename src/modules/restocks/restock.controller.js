const restockService = require("./restock.service");

exports.createRestock = async (req, res) => {
  try {
    const { productVariantId, supplierId, jumlah } = req.body;

    const restock = await restockService.createRestock({
      productVariantId: parseInt(productVariantId),
      supplierId: supplierId ? parseInt(supplierId) : null,
      jumlah: parseInt(jumlah),
    });

    res.status(201).json(restock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRestocks = async (req, res) => {
  try {
    const { productVariantId, supplierId } = req.query;
    const restocks = await restockService.getAllRestocks({ productVariantId, supplierId });
    res.json(restocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
