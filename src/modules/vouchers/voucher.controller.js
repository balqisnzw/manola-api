const voucherService = require("./voucher.service");

exports.createVoucher = async (req, res) => {
  try {
    const voucher = await voucherService.createVoucher(req.body);
    res.status(201).json({ status: "OK", message: "Voucher berhasil dibuat", data: voucher });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await voucherService.getAllVouchers();
    res.status(200).json({ status: "OK", message: "Success", data: vouchers });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: "Gagal memuat voucher" });
  }
};

exports.getVoucher = async (req, res) => {
  try {
    const voucher = await voucherService.getVoucherById(parseInt(req.params.id));
    if (!voucher) return res.status(404).json({ status: "Failed", message: "Voucher tidak ditemukan" });
    res.status(200).json({ status: "OK", data: voucher });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: "Gagal memuat voucher" });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await voucherService.updateVoucher(parseInt(req.params.id), req.body);
    res.status(200).json({ status: "OK", message: "Voucher berhasil diperbarui", data: voucher });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    await voucherService.deleteVoucher(parseInt(req.params.id));
    res.status(200).json({ status: "OK", message: "Voucher berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.validateVoucher = async (req, res) => {
  try {
    const { kode, total_belanja } = req.body;
    if (!kode || !total_belanja) {
      return res.status(400).json({ status: "Failed", message: "Kode dan total belanja wajib diisi" });
    }
    const result = await voucherService.validateVoucher(kode, parseInt(total_belanja));
    res.status(200).json({ status: "OK", data: result });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};
