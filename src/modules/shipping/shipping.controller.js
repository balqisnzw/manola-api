const shippingService = require("./shipping.service");

exports.getProvinces = async (req, res) => {
  try {
    const provinces = await shippingService.getProvinces();
    res.status(200).json({
      status: "OK",
      message: "Success Get Provinces",
      data: provinces
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed to fetch provinces"
    });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { provinceId } = req.params;
    if (!provinceId) {
      return res.status(400).json({
        status: "Failed",
        message: "Province ID is required"
      });
    }
    const cities = await shippingService.getCities(parseInt(provinceId));
    res.status(200).json({
      status: "OK",
      message: "Success Get Cities",
      data: cities
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed to fetch cities"
    });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { cityId } = req.params;
    if (!cityId) {
      return res.status(400).json({
        status: "Failed",
        message: "City ID is required"
      });
    }
    const districts = await shippingService.getDistricts(parseInt(cityId));
    res.status(200).json({
      status: "OK",
      message: "Success Get Districts",
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed to fetch districts"
    });
  }
};

exports.calculateCost = async (req, res) => {
  try {
    const { destinationDistrictId, weight, courier } = req.body;
    
    if (!destinationDistrictId) {
      return res.status(400).json({
        status: "Failed",
        message: "destinationDistrictId is required"
      });
    }

    const costs = await shippingService.calculateCost(
      parseInt(destinationDistrictId),
      weight ? parseInt(weight) : 500,
      courier || "jne"
    );

    res.status(200).json({
      status: "OK",
      message: "Success Calculate Shipping Cost",
      data: costs
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed to calculate shipping cost"
    });
  }
};
