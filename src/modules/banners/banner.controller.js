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
    const existingBanners = await bannerService.getAllBanners();
    if (existingBanners.length >= 5) {
      return res.status(400).json({ status: "Failed", message: "Maksimal hanya 5 banner yang diizinkan" });
    }

    const urutan = parseInt(req.body.urutan) || 1;
    if (existingBanners.some(b => b.urutan === urutan)) {
      return res.status(400).json({ status: "Failed", message: `Slide urutan ${urutan} sudah terisi` });
    }

    const judul = req.body.judul || `Banner ${Date.now()}`;
    let gambar = req.body.gambar || null;

    // Jika upload file via multer
    if (req.file) {
      gambar = `/uploads/${req.file.filename}`;
    }

    if (!gambar) {
      return res.status(400).json({ status: "Failed", message: "Gambar wajib diisi" });
    }

    const banner = await bannerService.createBanner({ ...req.body, judul, gambar });
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
    
    if (data.urutan !== undefined) {
      const urutan = parseInt(data.urutan);
      const existingBanners = await bannerService.getAllBanners();
      if (existingBanners.some(b => b.urutan === urutan && b.id !== parseInt(req.params.id))) {
        return res.status(400).json({ status: "Failed", message: `Slide urutan ${urutan} sudah terisi` });
      }
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
