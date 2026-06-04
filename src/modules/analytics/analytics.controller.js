const analyticsService = require("./analytics.service");

exports.getDashboardData = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardData();
    res.json({
      status: "OK",
      message: "Success Get Dashboard Data",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
