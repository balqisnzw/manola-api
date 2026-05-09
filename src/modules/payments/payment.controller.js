const paymentService = require("./payment.service");

exports.createPayment = async (req, res) => {
  try {
    const { orderId, metode_pembayaran } = req.body;

    const payment = await paymentService.createPayment({
      orderId: parseInt(orderId),
      metode_pembayaran,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { status_pembayaran, metode_pembayaran } = req.query;
    const payments = await paymentService.getAllPayments({
      status_pembayaran,
      metode_pembayaran,
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment tidak ditemukan" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status_pembayaran } = req.body;

    const updatedPayment = await paymentService.updatePaymentStatus(id, status_pembayaran);
    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
