const orderService = require("./order.service");

exports.createOrder = async (req, res) => {
  try {
    const role = req.user.role;

    const {
      jenis,
      alamat_pengiriman,
      ongkos_kirim,
      catatan,
      items,
      userId: bodyUserId,
    } = req.body;

    // Validasi: jenis dan items wajib ada
    if (
      !jenis ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        status: "Failed",
        message: "Order Type And Order Items Are Required",
      });
    }

    // Validasi: alamat_pengiriman wajib untuk pesanan ONLINE
    if (jenis === "ONLINE" && !alamat_pengiriman) {
      return res.status(400).json({
        status: "Failed",
        message: "Shipping Address Is Required For Online Orders",
      });
    }

    // Tentukan userId dan kasirId berdasarkan role yang login
    let userId = null;
    let kasirId = null;

    if (role === "KASIR") {
      // KASIR membuat order OFFLINE, kasirId otomatis dari JWT
      kasirId = req.user.id;
      // userId opsional (walk-in customer tidak wajib punya akun)
      userId = bodyUserId ? parseInt(bodyUserId) : null;
    } else {
      // USER membuat order ONLINE, userId dari JWT
      userId = req.user.id;
    }

    const order = await orderService.createOrder({
      userId,
      kasirId,
      jenis,
      alamat_pengiriman,
      ongkos_kirim: ongkos_kirim
        ? parseInt(ongkos_kirim)
        : undefined,
      catatan,
      items: items.map((item) => ({
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

    // Otomatis isi packagingId dari JWT saat status diubah ke DIKEMAS
    let packagingId = null;
    if (status === "DIKEMAS" && req.user.role === "PACKAGING") {
      packagingId = req.user.id;
    }

    const updatedOrder = await orderService.updateOrderStatus(
      id,
      status,
      packagingId
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