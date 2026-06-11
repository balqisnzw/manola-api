const apiKey = process.env.KOMERCE_API_KEY;
const originDistrictId = process.env.SHOP_ORIGIN_DISTRICT_ID || "1361"; // Fallback to Matraman, Jakarta Timur

/**
 * Generic GET helper to fetch from RajaOngkir
 */
const apiGet = async (path) => {
  const url = `https://rajaongkir.komerce.id/api/v1${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "key": apiKey
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RajaOngkir API GET ${path} failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.data || [];
};

/**
 * Fetch all provinces
 */
const getProvinces = async () => {
  return await apiGet("/destination/province");
};

/**
 * Fetch cities in a province
 */
const getCities = async (provinceId) => {
  return await apiGet(`/destination/city/${provinceId}`);
};

/**
 * Fetch districts in a city
 */
const getDistricts = async (cityId) => {
  return await apiGet(`/destination/district/${cityId}`);
};

/**
 * Calculate shipping cost (district to district)
 */
const calculateCost = async (destinationDistrictId, weight, courier) => {
  const url = "https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost";
  
  // Validate courier - only JNE and TIKI are allowed based on store constraints
  const allowedCouriers = ["jne", "tiki"];
  const selectedCourier = courier ? courier.toLowerCase() : "jne";
  if (!allowedCouriers.includes(selectedCourier)) {
    throw new Error(`Kurir '${courier}' tidak didukung. Toko Manola hanya melayani pengiriman via JNE dan TIKI.`);
  }

  const formData = new URLSearchParams();
  formData.append("origin", originDistrictId);
  formData.append("destination", String(destinationDistrictId));
  formData.append("weight", String(weight || 500));
  formData.append("courier", selectedCourier);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "key": apiKey,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kalkulasi ongkir gagal (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const rawData = result.data || [];

  // Filter layanan agar lebih rapi dan relevan untuk toko pakaian:
  // JNE: Hanya REG
  // TIKI: Hanya ECO & REG
  if (selectedCourier === "jne") {
    return rawData.filter(item => item.service.toUpperCase() === "REG");
  } else if (selectedCourier === "tiki") {
    return rawData.filter(item => ["ECO", "REG"].includes(item.service.toUpperCase()));
  }

  return rawData;
};

module.exports = {
  getProvinces,
  getCities,
  getDistricts,
  calculateCost
};
