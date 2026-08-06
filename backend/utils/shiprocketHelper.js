// backend/utils/shiprocketHelper.js

const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in";

let cachedToken = null;
let tokenCreatedAt = null;

/**
 * Get Shiprocket authentication token.
 * Token is cached temporarily to avoid logging in for every request.
 */
const getShiprocketToken = async () => {
  const tokenLifetime = 8 * 24 * 60 * 60 * 1000;

  if (cachedToken && tokenCreatedAt && Date.now() - tokenCreatedAt < tokenLifetime) {
    return cachedToken;
  }

  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket email or password is missing in .env");
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.token) {
    console.error("Shiprocket authentication error:", data);
    throw new Error(data.message || data.error || "Shiprocket authentication failed");
  }

  cachedToken = data.token;
  tokenCreatedAt = Date.now();

  return cachedToken;
};

/**
 * Common Shiprocket API request function.
 */
const shiprocketRequest = async (endpoint, options = {}, retry = true) => {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && retry) {
    cachedToken = null;
    tokenCreatedAt = null;
    return shiprocketRequest(endpoint, options, false);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = {
      message: "Invalid response received from Shiprocket",
    };
  }

  if (!response.ok) {
    console.error("Shiprocket API error:", data);
    const validationErrors = data.errors
      ? Object.entries(data.errors)
          .map(([field, messages]) => {
            const messageText = Array.isArray(messages) ? messages.join(", ") : String(messages);
            return `${field}: ${messageText}`;
          })
          .join(" | ")
      : "";

    throw new Error(validationErrors || data.message || data.error || "Shiprocket API request failed");
  }

  return data;
};

/**
 * Create a new Shiprocket order.
 */
const createShiprocketOrder = async (orderData, itemsData) => {
  if (!orderData) {
    throw new Error("Order data is missing");
  }

  if (!Array.isArray(itemsData) || itemsData.length === 0) {
    throw new Error("Order items are missing");
  }

  const orderId = orderData.order_number || orderData.order_id || orderData.id;

  if (!orderId) {
    throw new Error("Order ID is missing");
  }

  const customerName = orderData.customer_name || orderData.billing_customer_name || orderData.name || orderData.first_name || "Customer";
  const customerLastName = orderData.customer_last_name || orderData.billing_last_name || orderData.last_name || "";
  const billingAddress = orderData.shipping_address_line1 || orderData.shipping_address_line_1 || orderData.billing_address || orderData.address || orderData.address_line1 || orderData.address_line_1 || "";
  const billingAddress2 = orderData.shipping_address_line2 || orderData.shipping_address_line_2 || orderData.billing_address_2 || orderData.address_2 || orderData.address_line2 || orderData.address_line_2 || "";
  const billingCity = orderData.shipping_city || orderData.billing_city || orderData.city || "";
  const billingPincode = String(orderData.shipping_pincode || orderData.billing_pincode || orderData.pincode || orderData.postal_code || "");
  const billingState = orderData.shipping_state || orderData.billing_state || orderData.state || "";
  const billingCountry = orderData.shipping_country || orderData.billing_country || orderData.country || "India";
  const billingEmail = orderData.customer_email || orderData.billing_email || orderData.email || "";
  const billingPhone = String(orderData.customer_phone || orderData.billing_phone || orderData.phone || orderData.mobile || "");

  if (!billingAddress) throw new Error("Customer shipping address is missing");
  if (!billingCity) throw new Error("Customer shipping city is missing");
  if (!billingState) throw new Error("Customer shipping state is missing");
  if (!billingPincode) throw new Error("Customer shipping pincode is missing");
  if (!billingPhone) throw new Error("Customer phone number is missing");

  const orderItems = itemsData.map((item, index) => {
    const productName = item.product_name || item.name || item.title || "Product";
    const sku = item.product_sku || item.sku || item.product_id || item.id || `SKU-${orderId}-${index + 1}`;
    const quantity = Number(item.quantity || item.units || item.qty || 1);

    const sellingPrice = Number(
      item.selling_price !== undefined ? item.selling_price : 
      (item.unit_price || item.price || item.sale_price || 0)
    );

    if (sellingPrice <= 0) {
      throw new Error(`Invalid selling price for product: ${productName}`);
    }

    return {
      name: productName,
      sku: String(sku),
      units: quantity > 0 ? quantity : 1,
      selling_price: sellingPrice,
      discount: Number(item.discount || 0),
      tax: Number(item.tax || 0),
      hsn: String(item.hsn || item.hsn_code || ""),
    };
  });

  const paymentMethod = String(orderData.payment_method || orderData.payment_mode || "").toUpperCase();

  // 🔥 FIX: Dynamically calculate the subtotal exactly as Shiprocket expects it 
  // (Sum of all item selling prices * units)
  const calculatedSubTotal = orderItems.reduce((sum, item) => {
    return sum + (item.selling_price * item.units);
  }, 0);

  const payload = {
    order_id: String(orderId),
    order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: customerName,
    billing_last_name: customerLastName,
    billing_address: billingAddress,
    billing_address_2: billingAddress2,
    billing_city: billingCity,
    billing_pincode: billingPincode,
    billing_state: billingState,
    billing_country: billingCountry,
    billing_email: billingEmail,
    billing_phone: billingPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: paymentMethod === "COD" ? "COD" : "Prepaid",
    
    shipping_charges: Number(orderData.shipping_fee || orderData.shipping_charge || orderData.shipping_charges || 0),
    giftwrap_charges: Number(orderData.giftwrap_charges || 0),
    transaction_charges: Number(orderData.transaction_charges || 0),

    total_discount: Number(orderData.coupon_discount || orderData.discount || orderData.total_discount || 0) + Number(orderData.coin_discount || 0),

    // 🔥 FIX: Pass the perfectly calculated sum instead of the raw DB subtotal
    sub_total: Number(calculatedSubTotal.toFixed(2)),
    
    length: Number(orderData.length_cm || orderData.length || 10),
    breadth: Number(orderData.width_cm || orderData.breadth || orderData.width || 10),
    height: Number(orderData.height_cm || orderData.height || 10),
    weight: Number(orderData.total_weight_kg || orderData.weight_kg || orderData.weight || 0.5),
  };

  console.log("📦 Shiprocket payload:", JSON.stringify(payload, null, 2));

  const data = await shiprocketRequest("/v1/external/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("✅ Shiprocket order response:", data);

  return {
    status: true,
    shiprocket_order_id: data.order_id || null,
    shiprocket_shipment_id: data.shipment_id || null,
    shiprocket_awb: data.awb_code || null,
    courier_company: data.courier_name || null,
    tracking_url: data.tracking_url || null,
    aporderid: data.order_id || null,
    waybill: data.awb_code || null,
    awb_code: data.awb_code || null,
    raw: data,
  };
};

/**
 * Cancel an existing Shiprocket order.
 */
const cancelShiprocketOrder = async (shiprocketOrderId) => {
  if (!shiprocketOrderId) {
    throw new Error("Shiprocket order ID is required");
  }

  const data = await shiprocketRequest("/v1/external/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: [String(shiprocketOrderId)] }),
  });

  return data;
};

/**
 * Check courier serviceability.
 */
const checkServiceability = async ({
  pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "110001",
  deliveryPincode,
  weight = 0.5,
  length = 10,
  breadth = 10,
  height = 10,
  cod = 0
}) => {
  if (!deliveryPincode) {
    throw new Error("Delivery pincode is required");
  }

  const queryParams = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: String(deliveryPincode),
    weight: Number(weight),
    length: Number(length),
    breadth: Number(breadth),
    height: Number(height),
    cod: Number(cod) ? 1 : 0
  });

  const endpoint = `/v1/external/courier/serviceability?${queryParams.toString()}`;

  console.log("🔍 Checking Shiprocket serviceability:", endpoint);

  const data = await shiprocketRequest(endpoint, {
    method: "GET"
  });

  return data;
};

/**
 * Create a return order in Shiprocket.
 */
const createReturnOrder = async (returnData) => {
  const requiredFields = [
    'order_id', 'order_date', 'channel_id', 'pickup_customer_name', 'pickup_address', 'pickup_city', 'pickup_state', 'pickup_country', 'pickup_pincode', 'pickup_email', 'pickup_phone', 'shipping_customer_name', 'shipping_address', 'shipping_city', 'shipping_country', 'shipping_pincode', 'shipping_state', 'shipping_phone', 'order_items', 'payment_method', 'sub_total', 'length', 'breadth', 'height', 'weight',
  ];

  const missing = requiredFields.filter((field) => !returnData[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (!Array.isArray(returnData.order_items) || returnData.order_items.length === 0) {
    throw new Error('order_items must be a non-empty array');
  }

  const payload = {
    order_id: String(returnData.order_id),
    order_date: returnData.order_date,
    channel_id: Number(returnData.channel_id),
    pickup_customer_name: returnData.pickup_customer_name,
    pickup_last_name: returnData.pickup_last_name || '',
    company_name: returnData.company_name || '',
    pickup_address: returnData.pickup_address,
    pickup_address_2: returnData.pickup_address_2 || '',
    pickup_city: returnData.pickup_city,
    pickup_state: returnData.pickup_state,
    pickup_country: returnData.pickup_country,
    pickup_pincode: Number(returnData.pickup_pincode),
    pickup_email: returnData.pickup_email,
    pickup_phone: String(returnData.pickup_phone),
    pickup_isd_code: returnData.pickup_isd_code || '91',
    pickup_location_id: returnData.pickup_location_id || null,
    shipping_customer_name: returnData.shipping_customer_name,
    shipping_last_name: returnData.shipping_last_name || '',
    shipping_address: returnData.shipping_address,
    shipping_address_2: returnData.shipping_address_2 || '',
    shipping_city: returnData.shipping_city,
    shipping_country: returnData.shipping_country,
    shipping_pincode: Number(returnData.shipping_pincode),
    shipping_state: returnData.shipping_state,
    shipping_email: returnData.shipping_email || '',
    shipping_isd_code: returnData.shipping_isd_code || '91',
    shipping_phone: String(returnData.shipping_phone),
    order_items: returnData.order_items.map((item) => ({
      name: item.name,
      sku: String(item.sku),
      units: Number(item.units),
      selling_price: Number(item.selling_price),
      discount: Number(item.discount) || 0,
      hsn: item.hsn || '',
      qc_enable: item.qc_enable || false,
      qc_product_name: item.qc_product_name || item.name,
      qc_brand: item.qc_brand || '',
      qc_product_image: item.qc_product_image || '',
      qc_color: item.qc_color || '',
      qc_serial_no: item.qc_serial_no || '',
      qc_ean_barcode: item.qc_ean_barcode || '',
      qc_size: item.qc_size || '',
    })),
    payment_method: returnData.payment_method.toUpperCase(),
    total_discount: String(returnData.total_discount || 0),
    sub_total: Number(returnData.sub_total),
    length: Number(returnData.length),
    breadth: Number(returnData.breadth),
    height: Number(returnData.height),
    weight: Number(returnData.weight),
  };

  console.log('📦 Shiprocket return order payload:', JSON.stringify(payload, null, 2));

  const data = await shiprocketRequest('/v1/external/orders/create/return', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  console.log('✅ Shiprocket return order response:', data);

  return {
    status: true,
    shiprocket_order_id: data.order_id || null,
    shiprocket_shipment_id: data.shipment_id || null,
    shiprocket_awb: data.awb_code || null,
    courier_company: data.courier_name || null,
    tracking_url: data.tracking_url || null,
    raw: data,
  };
};

// ========== NEW: Get Pickup Locations ==========
const getPickupLocations = async () => {
  const data = await shiprocketRequest('/v1/external/settings/pickupLocations', {
    method: 'GET',
  });
  return data?.data || [];
};

// ========== NEW: Get Default Pickup Location ==========
const getDefaultPickupLocation = async () => {
  const locations = await getPickupLocations();
  if (!locations.length) {
    throw new Error('No pickup locations configured in Shiprocket.');
  }
  const defaultLoc = locations.find((loc) => loc.is_default) || locations[0];
  return defaultLoc;
};

// ========== NEW: Get Default Channel ID ==========
const getDefaultChannelId = async () => {
  const data = await shiprocketRequest('/v1/external/settings/channels', {
    method: 'GET',
  });
  const channels = data?.data || [];
  if (!channels.length) {
    throw new Error('No channels found in Shiprocket.');
  }
  const defaultChannel = channels.find((ch) => ch.is_default) || channels[0];
  return defaultChannel.id;
};

// ========== NEW: Get Order Details from Shiprocket ==========
const getShiprocketOrderDetails = async (shiprocketOrderId) => {
  const data = await shiprocketRequest(`/v1/external/orders/${shiprocketOrderId}`, {
    method: 'GET',
  });
  return data;
};

// ========== EXPORTS ==========
module.exports = {
  getShiprocketToken,
  shiprocketRequest,
  createShiprocketOrder,
  cancelShiprocketOrder,
  checkServiceability,
  createReturnOrder,
  getPickupLocations,
  getDefaultPickupLocation,
  getDefaultChannelId,
  getShiprocketOrderDetails,
};