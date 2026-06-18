const settingService = require("./setting.service");

exports.getSettings = async (req, res) => {
  try {
    const settings = await settingService.getSettings();
    res.status(200).json({
      status: "OK",
      message: "Success Get Settings",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed to get settings",
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settingsObj = req.body;
    if (!settingsObj || typeof settingsObj !== "object" || Array.isArray(settingsObj)) {
      return res.status(400).json({
        status: "Failed",
        message: "Settings object is required",
      });
    }
    const updated = await settingService.updateSettings(settingsObj);
    res.status(200).json({
      status: "OK",
      message: "Success Update Settings",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed to update settings",
    });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "Failed", message: "Logo file is required" });
    }
    const logoUrl = `/uploads/${req.file.filename}`;
    const updated = await settingService.updateSettings({ logo_url: logoUrl });
    
    res.status(200).json({
      status: "OK",
      message: "Logo uploaded successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed to upload logo",
    });
  }
};
