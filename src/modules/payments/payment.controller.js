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