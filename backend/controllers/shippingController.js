const { checkServiceability } = require('../utils/shiprocketHelper');

const asPositiveNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const formatDeliveryDate = (value, estimatedDays) => {
  let date = null;

  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date && Number.isFinite(Number(estimatedDays))) {
    date = new Date();
    date.setDate(date.getDate() + Number(estimatedDays));
  }

  if (!date) return { isoDate: null, label: null };

  return {
    isoDate: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  };
};

const checkDelivery = async (req, res) => {
  try {
    const {
      deliveryPincode,
      weight = 0.5,
      length = 10,
      breadth = 10,
      height = 10,
      paymentMethod = 'prepaid',
    } = req.body || {};

    const pincode = String(deliveryPincode || '').trim();
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit PIN code.',
      });
    }

    const shiprocketData = await checkServiceability({
      pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE,
      deliveryPincode: pincode,
      weight: asPositiveNumber(weight, 0.5),
      length: asPositiveNumber(length, 10),
      breadth: asPositiveNumber(breadth, 10),
      height: asPositiveNumber(height, 10),
      cod: paymentMethod === 'cod' ? 1 : 0,
    });

    const couriers = shiprocketData?.data?.available_courier_companies || [];

    if (!couriers.length) {
      return res.status(200).json({
        success: true,
        serviceable: false,
        message: 'Delivery is currently unavailable for this PIN code.',
      });
    }

    const rankedCouriers = [...couriers].sort((a, b) => {
      const recommendedDifference = Number(b.is_recommended || 0) - Number(a.is_recommended || 0);
      if (recommendedDifference !== 0) return recommendedDifference;

      const aDays = Number(a.estimated_delivery_days) || 999;
      const bDays = Number(b.estimated_delivery_days) || 999;
      return aDays - bDays;
    });

    const selected = rankedCouriers[0];
    const estimatedDays = Number(selected.estimated_delivery_days) || null;
    const dateInfo = formatDeliveryDate(selected.etd, estimatedDays);

    return res.json({
      success: true,
      serviceable: true,
      delivery: {
        pincode,
        courierName: selected.courier_name || null,
        courierCompanyId: selected.courier_company_id || null,
        estimatedDays,
        estimatedDate: dateInfo.isoDate,
        deliveryLabel: dateInfo.label,
        etd: selected.etd || null,
        freightCharge: Number(selected.freight_charge) || 0,
        codAvailable: Boolean(Number(selected.cod)),
        rating: selected.rating || null,
      },
    });
  } catch (error) {
    console.error('Shiprocket delivery check error:', error.message);
    return res.status(500).json({
      success: false,
      serviceable: false,
      message: error.message || 'Unable to check delivery availability right now.',
    });
  }
};

module.exports = { checkDelivery };
