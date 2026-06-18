const paymentService = require("./payment.service");

exports.createPayment = async (req, res) => {
  try {
    const { orderId, metode_pembayaran } = req.body;

    if (!orderId || !metode_pembayaran) {
      return res.status(400).json({
        status: "Failed",
        message: "Order ID And Payment Method Are Required",
      });
    }

    const payment = await paymentService.createPayment({
      orderId: parseInt(orderId),
      metode_pembayaran,
    });

    res.status(201).json({
      status: "OK",
      message: "Success Create Payment",
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Create Payment",
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { status_pembayaran, metode_pembayaran } = req.query;

    const payments = await paymentService.getAllPayments({
      status_pembayaran,
      metode_pembayaran,
    });

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Payments",
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Payments",
    });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({
        status: "Failed",
        message: "Payment Not Found",
      });
    }

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Payment",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Payment",
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status_pembayaran } = req.body;

    if (!status_pembayaran) {
      return res.status(400).json({
        status: "Failed",
        message: "Payment Status Is Required",
      });
    }

    const updatedPayment = await paymentService.updatePaymentStatus(
      id,
      status_pembayaran
    );

    res.status(200).json({
      status: "OK",
      message: "Success Update Payment Status",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Update Payment Status",
    });
  }
};

exports.regenerateToken = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const payment = await paymentService.regenerateMidtransToken(orderId);
    
    res.status(200).json({
      status: "OK",
      message: "Berhasil membuat token baru",
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Gagal membuat token baru",
    });
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    
    const payment = await paymentService.cancelPayment(orderId, userId);
    res.status(200).json({
      status: "OK",
      message: "Pesanan berhasil dibatalkan",
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Gagal membatalkan pesanan",
    });
  }
};

exports.syncPaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await paymentService.syncPaymentStatusFromMidtrans(orderId);
    
    res.status(200).json({
      status: "OK",
      message: "Berhasil sinkronisasi status dari Midtrans",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Gagal sinkronisasi status",
    });
  }
};

exports.midtransWebhook = async (req, res) => {
  try {
    await paymentService.handleMidtransNotification(req.body);
    res.status(200).json({ status: "OK", message: "Webhook processed" });
  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    // Midtrans requires 200 OK even if error internally to stop retries, or 500 if we want it to retry. 
    // We'll return 200 to acknowledge receipt if it's an expected format error, but 500 if DB failed.
    res.status(500).json({ status: "Failed", message: "Webhook processing error" });
  }
};