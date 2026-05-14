const orderService = require("./order.service");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      jenis,
      alamat_pengiriman,
      ongkos_kirim,
      catatan,
      items,
    } = req.body;

    if (
      !jenis ||
      !alamat_pengiriman ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        status: "Failed",
        message:
          "Type, Shipping Address, And Order Items Are Required",
      });
    }

    const order = await orderService.createOrder({
      userId,
      jenis,
      alamat_pengiriman,
      ongkos_kirim: ongkos_kirim
        ? parseInt(ongkos_kirim)
        : undefined,
      catatan,
      items: items.map((item) => ({
        productId: parseInt(item.productId),
        variantId: parseInt(item.variantId),
        jumlah: parseInt(item.jumlah),
      })),
    });

    res.status(201).json({
      status: "OK",
      message: "Success Create Order",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Create Order",
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, jenis } = req.query;

    const filters = { status, jenis };

    // USER hanya bisa melihat order miliknya sendiri
    if (req.user.role === "USER") {
      filters.userId = req.user.id;
    }

    const orders = await orderService.getAllOrders(filters);

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Orders",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Orders",
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "Order Not Found",
      });
    }

    // USER hanya bisa melihat order miliknya sendiri
    if (req.user.role === "USER" && order.userId !== req.user.id) {
      return res.status(403).json({
        status: "Failed",
        message: "Access Denied",
      });
    }

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Order",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Order",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "Failed",
        message: "Order Status Is Required",
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(
      id,
      status
    );

    res.status(200).json({
      status: "OK",
      message: "Success Update Order Status",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Update Order Status",
    });
  }
};