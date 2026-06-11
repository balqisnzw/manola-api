const bannerService = require("./banner.service");

exports.getBanners = async (req, res) => {
  try {
    // Query param ?active=true untuk hanya ambil yang aktif (public home page)
    const onlyActive = req.query.active === "true";
    const banners = await bannerService.getAllBanners(onlyActive);
    res.status(200).json({ status: "OK", data: banners });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: "Gagal memuat banner" });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { judul } = req.body;
    let gambar = req.body.gambar || null;

    // Jika upload file via multer
    if (req.file) {
      gambar = `/uploads/${req.file.filename}`;
    }

    if (!judul || !gambar) {
      return res.status(400).json({ status: "Failed", message: "Judul dan gambar wajib diisi" });
    }

    const banner = await bannerService.createBanner({ ...req.body, gambar });
    res.status(201).json({ status: "OK", message: "Banner berhasil dibuat", data: banner });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.gambar = `/uploads/${req.file.filename}`;
    }
    const banner = await bannerService.updateBanner(parseInt(req.params.id), data);
    res.status(200).json({ status: "OK", message: "Banner berhasil diperbarui", data: banner });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await bannerService.deleteBanner(parseInt(req.params.id));
    res.status(200).json({ status: "OK", message: "Banner berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: error.message });
  }
};
