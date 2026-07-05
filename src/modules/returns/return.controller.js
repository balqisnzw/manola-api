const returnService = require("./return.service");

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: "Failed", message: "Foto bukti wajib diunggah" });
    }

    // Validasi ukuran per file (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    for (const file of req.files) {
      if (file.size > MAX_SIZE) {
        return res.status(400).json({
          status: "Failed",
          message: `File "${file.originalname}" melebihi batas 2MB`,
        });
      }
    }

    const urls = req.files.map((f) => f.path);
    res.status(200).json({ status: "OK", message: "Upload berhasil", data: { urls } });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, alasan, keterangan, bukti_url, imageUrls } = req.body;
    
    // Validasi basic
    if (!orderId || !alasan) {
      return res.status(400).json({ status: "Failed", message: "orderId dan alasan wajib diisi" });
    }

    // Validasi keterangan max 500 karakter
    if (keterangan && keterangan.length > 500) {
      return res.status(400).json({ status: "Failed", message: "Keterangan maksimal 500 karakter" });
    }

    const returnReq = await returnService.createReturnRequest(
      parseInt(orderId),
      alasan,
      keterangan,
      bukti_url,
      imageUrls || []
    );
    res.status(201).json({ status: "OK", message: "Pengajuan pengembalian berhasil dibuat", data: returnReq });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.getAllReturnRequests = async (req, res) => {
  try {
    const returnReqs = await returnService.getAllReturnRequests();
    res.status(200).json({ status: "OK", message: "Berhasil mengambil data pengajuan pengembalian", data: returnReqs });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.updateReturnRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: "Failed", message: "Status wajib diisi" });
    }

    const updatedReq = await returnService.updateReturnRequestStatus(parseInt(id), status);
    res.status(200).json({ status: "OK", message: "Status pengajuan pengembalian berhasil diupdate", data: updatedReq });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

// Pelanggan memasukkan nomor resi pengiriman retur
exports.submitResi = async (req, res) => {
  try {
    const { id } = req.params;
    const { resi } = req.body;

    if (!resi) {
      return res.status(400).json({ status: "Failed", message: "Nomor resi wajib diisi" });
    }

    const updatedReq = await returnService.updateReturnResi(parseInt(id), resi);
    res.status(200).json({ status: "OK", message: "Resi berhasil dikirim", data: updatedReq });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

// Admin mengkonfirmasi paket retur sudah sampai
exports.receivePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReq = await returnService.confirmReturnReceived(parseInt(id));
    res.status(200).json({ status: "OK", message: "Paket retur telah dikonfirmasi diterima. Stok telah dikembalikan.", data: updatedReq });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};
