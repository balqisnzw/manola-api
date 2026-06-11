const addressService = require("./address.service");

exports.getMyAddresses = async (req, res) => {
  try {
    const addresses = await addressService.getByUser(req.user.id);
    res.status(200).json({
      status: "OK",
      message: "Success Get Addresses",
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Addresses",
    });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await addressService.getById(
      parseInt(req.params.id),
      req.user.id
    );
    res.status(200).json({
      status: "OK",
      message: "Success Get Address",
      data: address,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message || "Address Not Found",
    });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { 
      label, penerima, no_telepon, alamat, kota, kode_pos, is_utama,
      provinceId, cityId, districtId, provinsi, kecamatan
    } = req.body;

    if (!penerima || !no_telepon || !alamat || !kota || !kode_pos) {
      return res.status(400).json({
        status: "Failed",
        message: "Penerima, No Telepon, Alamat, Kota, dan Kode Pos wajib diisi",
      });
    }

    const address = await addressService.create(req.user.id, {
      label,
      penerima,
      no_telepon,
      alamat,
      kota,
      kode_pos,
      is_utama,
      provinceId,
      cityId,
      districtId,
      provinsi,
      kecamatan
    });

    res.status(201).json({
      status: "OK",
      message: "Success Create Address",
      data: address,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Create Address",
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await addressService.update(
      parseInt(req.params.id),
      req.user.id,
      req.body
    );
    res.status(200).json({
      status: "OK",
      message: "Success Update Address",
      data: address,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Update Address",
    });
  }
};

exports.setUtama = async (req, res) => {
  try {
    const address = await addressService.setUtama(
      parseInt(req.params.id),
      req.user.id
    );
    res.status(200).json({
      status: "OK",
      message: "Success Set Primary Address",
      data: address,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Set Primary Address",
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await addressService.remove(parseInt(req.params.id), req.user.id);
    res.status(200).json({
      status: "OK",
      message: "Success Delete Address",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Delete Address",
    });
  }
};
