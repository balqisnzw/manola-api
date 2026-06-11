const notificationService = require("./notification.service");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.status(200).json({
      status: "OK",
      message: "Success Get Notifications",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Notifications",
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await notificationService.markAsRead(parseInt(req.params.id), req.user.id);
    res.status(200).json({
      status: "OK",
      message: "Success Mark As Read",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: "Failed To Mark As Read",
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({
      status: "OK",
      message: "Success Mark All As Read",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: "Failed To Mark All As Read",
    });
  }
};
