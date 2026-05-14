const restockService = require("./restock.service");

exports.createRestock = async (req, res) => {
  try {
    const { productVariantId, supplierId, jumlah } = req.body;

    if (!productVariantId || !jumlah) {
      return res.status(400).json({
        status: "Failed",
        message: "Product Variant ID And Quantity Are Required",
      });
    }

    const restock = await restockService.createRestock({
      productVariantId: parseInt(productVariantId),
      supplierId: supplierId ? parseInt(supplierId) : null,
      jumlah: parseInt(jumlah),
    });

    res.status(201).json({
      status: "OK",
      message: "Success Create Restock",
      data: restock,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Create Restock",
    });
  }
};

exports.getRestocks = async (req, res) => {
  try {
    const { productVariantId, supplierId } = req.query;

    const restocks = await restockService.getAllRestocks({
      productVariantId,
      supplierId,
    });

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Restocks",
      data: restocks,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Restocks",
    });
  }
};