const shiftService = require("./shift.service");

exports.startShift = async (req, res) => {
  try {
    const kasirId = req.user.id;
    const { modal_awal } = req.body;
    if (modal_awal === undefined || modal_awal === null) {
      return res.status(400).json({
        status: "Failed",
        message: "Modal awal is required",
      });
    }
    const shift = await shiftService.startShift(kasirId, modal_awal);
    res.status(201).json({
      status: "OK",
      message: "Shift started successfully",
      data: shift,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed to start shift",
    });
  }
};

exports.getActiveShift = async (req, res) => {
  try {
    const kasirId = req.user.id;
    const shift = await shiftService.getActiveShift(kasirId);
    res.status(200).json({
      status: "OK",
      message: "Success get active shift",
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed to get active shift",
    });
  }
};

exports.closeShift = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { modal_akhir, catatan } = req.body;
    if (modal_akhir === undefined || modal_akhir === null) {
      return res.status(400).json({
        status: "Failed",
        message: "Modal akhir is required",
      });
    }
    const shift = await shiftService.closeShift(id, modal_akhir, catatan);
    res.status(200).json({
      status: "OK",
      message: "Shift closed successfully",
      data: shift,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed to close shift",
    });
  }
};

exports.addPettyCash = async (req, res) => {
  try {
    const { shiftId, jumlah, keterangan } = req.body;
    if (!shiftId || !jumlah || !keterangan) {
      return res.status(400).json({
        status: "Failed",
        message: "Shift ID, jumlah, and keterangan are required",
      });
    }
    const expense = await shiftService.addPettyCash(parseInt(shiftId), jumlah, keterangan);
    res.status(201).json({
      status: "OK",
      message: "Petty cash added successfully",
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed to add petty cash",
    });
  }
};

exports.getShifts = async (req, res) => {
  try {
    const filters = {};
    if (req.user.role === "KASIR") {
      filters.kasirId = req.user.id;
    }
    const shifts = await shiftService.getAllShifts(filters);
    res.status(200).json({
      status: "OK",
      message: "Success get shifts",
      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed to get shifts",
    });
  }
};
