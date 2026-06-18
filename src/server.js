const app = require("./app");
const paymentService = require("./modules/payments/payment.service");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Jalankan pembersihan pertama kali saat server start
  paymentService.autoCancelExpiredPayments().catch(console.error);

  // Jadwalkan pembersihan setiap 30 menit sekali
  setInterval(() => {
    console.log("[Scheduler] Menjalankan pembersihan otomatis pembayaran kedaluwarsa...");
    paymentService.autoCancelExpiredPayments().catch(console.error);
  }, 30 * 60 * 1000);
});