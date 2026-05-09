const orderService = require("./order.service");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jenis, alamat_pengiriman, ongkos_kirim, catatan, items } = req.body;

    const order = await orderService.createOrder({
      userId,
      jenis,
      alamat_pengiriman,
      ongkos_kirim: ongkos_kirim ? parseInt(ongkos_kirim) : undefined,
      catatan,
      items: items.map((item) => ({
        productId: parseInt(item.productId),
        variantId: parseInt(item.variantId),
        jumlah: parseInt(item.jumlah),
      })),
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, jenis } = req.query;
    const filters = { status, jenis };

    // Jika user biasa (role USER), hanya tampilkan order miliknya sendiri
    if (req.user.role === "USER") {
      filters.userId = req.user.id;
    }

    const orders = await orderService.getAllOrders(filters);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    // User biasa hanya bisa melihat order miliknya sendiri
    if (req.user.role === "USER" && order.userId !== req.user.id) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus(id, status);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
