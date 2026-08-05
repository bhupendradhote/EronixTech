const db = require("../config/db");

const {
  createShiprocketOrder,
  cancelShiprocketOrder,
  checkServiceability,
  createReturnOrder,        
  getDefaultPickupLocation, 
  getDefaultChannelId, 
} = require("../utils/shiprocketHelper");

// ------------------------------------------------------------------
// Helper: Normalize Indian mobile number for Shiprocket
// ------------------------------------------------------------------
const normalizePhone = (phone) => {
  let cleanedPhone = String(phone || "").replace(/\D/g, "");

  if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
    cleanedPhone = cleanedPhone.slice(2);
  }
  if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
    cleanedPhone = cleanedPhone.slice(1);
  }
  return cleanedPhone;
};

// ------------------------------------------------------------------
// Helper: Calculate Order Totals (Strictly matches Cart UI Math)
// ------------------------------------------------------------------
const calculateOrderTotals = async (items, paymentMode = "prepaid") => {
  let productSubtotal = 0;
  let warrantyTotal = 0;
  let totalTaxAmount = 0;
  let totalWeight = 0;
  let maxLength = 10, maxWidth = 10, maxHeight = 10;
  
  const validatedItems = [];

  for (const item of items) {
    const quantity = Number(item.quantity || 1);
    const isWarranty = item.is_warranty === true || item.is_warranty === 1;

    if (!isWarranty) {
      // ----- Normal Product -----
      const productId = Number(item.product_id);
      if (!Number.isInteger(productId) || productId <= 0) throw new Error("Invalid product ID");
      if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Invalid quantity");

      const [rows] = await db.query(`SELECT * FROM products WHERE id = ?`, [productId]);
      if (!rows.length) throw new Error(`Product ${productId} not found`);
      const product = rows[0];

      if (product.deleted_at) throw new Error(`${product.name} is no longer available`);
      if (product.status !== "active") throw new Error(`${product.name} is inactive`);
      if (product.stock_status === "out_of_stock" || Number(product.stock_quantity) < quantity) {
        throw new Error(`${product.name} is out of stock`);
      }
      if (paymentMode === "cod" && Number(product.is_cod_available) !== 1) {
        throw new Error(`Cash on Delivery is not available for ${product.name}`);
      }

      // Trust the cart's unit_price (e.g., 17274) otherwise fallback to selling_price
      const effectiveUnitPrice = Number(item.unit_price) || Number(product.selling_price) || 0;
      if (!Number.isFinite(effectiveUnitPrice) || effectiveUnitPrice <= 0) {
        throw new Error(`Invalid price for ${product.name}`);
      }

      const taxPercent = Number(product.tax_percentage || 0);

      // Cart UI calculates tax EXCLUSIVELY on top of the subtotal
      const lineTax = (effectiveUnitPrice * (taxPercent / 100)) * quantity;
      const lineSubtotal = effectiveUnitPrice * quantity;

      productSubtotal += lineSubtotal;
      totalTaxAmount += lineTax;

      totalWeight += Number(product.weight || 0.5) * quantity;
      maxLength = Math.max(maxLength, Number(product.depth || 10));
      maxWidth = Math.max(maxWidth, Number(product.width || 10));
      maxHeight = Math.max(maxHeight, Number(product.height || 10));

      let parsedImage = product.images;
      try {
        if (typeof product.images === "string" && product.images.startsWith("[")) {
          const imgArr = JSON.parse(product.images);
          parsedImage = Array.isArray(imgArr) ? imgArr[0] : product.images;
        }
      } catch (e) {
        parsedImage = product.images;
      }

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku || `SKU-${product.id}`,
        product_image: parsedImage || null,
        quantity,
        unit_price: Number(effectiveUnitPrice.toFixed(2)),
        tax_amount: Number(lineTax.toFixed(2)),
        total_price: Number(lineSubtotal.toFixed(2)),
        is_warranty: 0,
        warranty_name: null,
      });
    } else {
      // ----- Warranty Item -----
      const unitPrice = Number(item.unit_price || item.warranty_price || 0);
      if (unitPrice <= 0) throw new Error("Warranty price must be greater than zero");
      
      const lineTotal = unitPrice * quantity;
      
      // Warranty also gets standard 18% GST calculated to match the frontend Cart
      const warrantyTax = (unitPrice * 0.18) * quantity;

      warrantyTotal += lineTotal;
      totalTaxAmount += warrantyTax;

      validatedItems.push({
        product_id: item.product_id || 0,
        product_name: item.warranty_name || item.product_name || "Extended Warranty",
        product_sku: item.product_sku || `WARR-${item.product_id || "0"}`,
        product_image: item.product_image || null,
        quantity,
        unit_price: Number(unitPrice.toFixed(2)),
        tax_amount: Number(warrantyTax.toFixed(2)),
        total_price: Number(lineTotal.toFixed(2)),
        is_warranty: 1,
        warranty_name: item.warranty_name || item.product_name || "Extended Warranty",
      });
    }
  }

  return {
    validatedItems,
    subtotal: Number(productSubtotal.toFixed(2)),
    warrantyTotal: Number(warrantyTotal.toFixed(2)),
    taxAmount: Number(totalTaxAmount.toFixed(2)),
    totalWeight: Number(totalWeight.toFixed(3)),
    length: maxLength,
    width: maxWidth,
    height: maxHeight,
  };
};

// ------------------------------------------------------------------
// Helper: Fulfill order → push to Shiprocket
// ------------------------------------------------------------------
const fulfillOrder = async (orderId, paymentMode = "cod") => {
  const [orderRows] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (!orderRows.length) throw new Error("Order not found in database");

  const [itemRows] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
  if (!itemRows.length) throw new Error("No items found for this order");

  // Send ALL items to Shiprocket (Product + Warranty) so COD matches perfectly
  const order = orderRows[0];
  order.payment_method = String(paymentMode).toLowerCase() === "cod" ? "cod" : "razorpay";
  order.customer_phone = normalizePhone(order.customer_phone);

  const shiprocketItems = itemRows.map(item => ({
    name: item.product_name,
    sku: item.product_sku || `SKU-${item.product_id}`,
    units: item.quantity,
    // Add tax to unit price here so Shiprocket collects the final inclusive amount for COD
    selling_price: Number(item.unit_price) + (Number(item.tax_amount) / Number(item.quantity)),
    discount: 0,
    tax: 0,
    hsn: "",
  }));

  try {
    const shiprocketResponse = await createShiprocketOrder(order, shiprocketItems);

    if (!shiprocketResponse || shiprocketResponse.status !== true) {
      throw new Error(shiprocketResponse?.message || "Failed to push order to Shiprocket");
    }

    const shiprocketOrderId = shiprocketResponse.shiprocket_order_id || shiprocketResponse.aporderid || null;
    const waybill = shiprocketResponse.shiprocket_awb || shiprocketResponse.awb_code || shiprocketResponse.waybill || null;
    const courierCompany = shiprocketResponse.courier_company || null;
    const trackingUrl = shiprocketResponse.tracking_url || null;

    if (!shiprocketOrderId) throw new Error("Shiprocket order ID was not returned");

    await db.query(
      `UPDATE orders SET fship_order_id = ?, fship_awb = ?, awb_code = ?, courier_company = ?, tracking_url = ?, order_status = 'processing' WHERE id = ?`,
      [shiprocketOrderId, waybill, waybill, courierCompany, trackingUrl, orderId]
    );

    console.log(`✅ Order ${orderId} sent to Shiprocket. Order ID: ${shiprocketOrderId}, AWB: ${waybill}`);
    return shiprocketResponse;
  } catch (error) {
    console.error(`❌ fulfillOrder failed for order ${orderId}:`, error.message);
    await db.query(`UPDATE orders SET order_status = 'failed' WHERE id = ?`, [orderId]);
    throw error;
  }
};

exports.fulfillOrder = fulfillOrder;

// ------------------------------------------------------------------
// CREATE COD ORDER
// ------------------------------------------------------------------
exports.createCodOrder = async (req, res) => {
  let connection = null;
  let orderId = null;
  let orderNumber = null;

  try {
    const { orderData, itemsData } = req.body;

    if (!orderData) return res.status(400).json({ success: false, message: "Order data is missing" });
    if (!Array.isArray(itemsData) || itemsData.length === 0) return res.status(400).json({ success: false, message: "Order items are missing" });
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const userId = req.user.id;
    const calculatedOrder = await calculateOrderTotals(itemsData, "cod");

    const {
      validatedItems,
      subtotal,
      warrantyTotal,
      taxAmount,
      totalWeight,
      length,
      width,
      height,
    } = calculatedOrder;

    const shippingFee = Number(orderData.shipping_fee || 0);
    const platformFee = Number(orderData.platform_fee || 0);
    const coinDiscount = Number(orderData.coin_discount || 0);
    const couponDiscount = Number(orderData.coupon_discount || 0);

    // Exact Cart Logic: Subtotal(17274) + Warranty(999) + GST(3289.14) + Fees - Discounts = 21562.14
    const totalAmount = Math.max(
      0,
      subtotal + warrantyTotal + taxAmount + shippingFee + platformFee - coinDiscount - couponDiscount
    );

    const customerPhone = normalizePhone(orderData.customer_phone);
    if (customerPhone.length !== 10) return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number" });

    let address = {};
    if (orderData.address_id) {
      const [addressRows] = await db.query(`SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`, [orderData.address_id, userId]);
      if (!addressRows.length) return res.status(404).json({ success: false, message: "Saved address not found" });
      address = addressRows[0];
    } else {
      address = {
        address_line_1: orderData.shipping_address_line1,
        address_line_2: orderData.shipping_address_line2 || "",
        city: orderData.shipping_city,
        state: orderData.shipping_state,
        postal_code: orderData.shipping_pincode,
        country: orderData.shipping_country || "India",
      };
    }

    if (!address.address_line_1 || !address.city || !address.state || !address.postal_code) {
      return res.status(400).json({ success: false, message: "Complete shipping address is required" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    orderNumber = `ORD-${Date.now()}`;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        user_id, order_number, customer_name, customer_email, customer_phone,
        subtotal, tax_amount, shipping_fee, platform_fee, coin_discount, coupon_discount,
        total_amount, warranty_total, payment_method, total_weight_kg, length_cm, width_cm, height_cm,
        shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_pincode, shipping_country,
        billing_address_line1, billing_address_line2, billing_city, billing_state, billing_pincode, billing_country,
        payment_status, order_status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cod', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending'
      )`,
      [
        userId, orderNumber, orderData.customer_name || "Customer", orderData.customer_email || "no-email@example.com", customerPhone,
        Number(subtotal.toFixed(2)), Number(taxAmount.toFixed(2)), Number(shippingFee.toFixed(2)), Number(platformFee.toFixed(2)),
        Number(coinDiscount.toFixed(2)), Number(couponDiscount.toFixed(2)), Number(totalAmount.toFixed(2)), Number(warrantyTotal.toFixed(2)),
        Number(totalWeight.toFixed(3)), Number(length), Number(width), Number(height),
        address.address_line_1, address.address_line_2 || "", address.city, address.state, String(address.postal_code), address.country || "India",
        address.address_line_1, address.address_line_2 || "", address.city, address.state, String(address.postal_code), address.country || "India"
      ]
    );

    orderId = orderResult.insertId;

    // Insert Order Items
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, product_image,
          quantity, unit_price, tax_amount, total_price, is_warranty, warranty_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, item.product_id, item.product_name, item.product_sku, item.product_image,
          item.quantity, item.unit_price, item.tax_amount, item.total_price, item.is_warranty, item.warranty_name
        ]
      );
    }

    await connection.commit();
    connection.release();
    connection = null;

    // Dispatch to Shiprocket
    try {
      console.log(`📦 Sending COD order ${orderId} to Shiprocket...`);
      await fulfillOrder(orderId, "cod");
    } catch (shiprocketError) {
      console.error("Shiprocket integration failed:", shiprocketError.message);
      return res.status(500).json({
        success: false,
        message: "Order was saved, but failed to sync with Shiprocket.",
        orderId, orderNumber, error: shiprocketError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orderId,
      orderNumber,
      totals: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(taxAmount.toFixed(2)),
        shipping: Number(shippingFee.toFixed(2)),
        total: Number(totalAmount.toFixed(2)),
        warrantyTotal: Number(warrantyTotal.toFixed(2))
      }
    });
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) { console.error("Rollback Error:", rbErr); }
      connection.release();
    }
    console.error("COD Order Error:", error);
    return res.status(500).json({ success: false, message: "Failed to place COD order", error: error.message });
  }
};

// ------------------------------------------------------------------
// CREATE PENDING PREPAID ORDER
// ------------------------------------------------------------------
exports.createPendingOrder = async (req, res) => {
  let connection = null;

  try {
    const { orderData, itemsData } = req.body;

    if (!orderData) return res.status(400).json({ success: false, message: "Order data is missing" });
    if (!Array.isArray(itemsData) || itemsData.length === 0) return res.status(400).json({ success: false, message: "Order items are missing" });
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const userId = req.user.id;
    const calculatedOrder = await calculateOrderTotals(itemsData, "prepaid");

    const {
      validatedItems,
      subtotal,
      warrantyTotal,
      taxAmount,
      totalWeight,
      length,
      width,
      height,
    } = calculatedOrder;

    const shippingFee = Number(orderData.shipping_fee || 0);
    const platformFee = Number(orderData.platform_fee || 0);
    const coinDiscount = Number(orderData.coin_discount || 0);
    const couponDiscount = Number(orderData.coupon_discount || 0);

    const totalAmount = Math.max(
      0,
      subtotal + warrantyTotal + taxAmount + shippingFee + platformFee - coinDiscount - couponDiscount
    );

    const customerPhone = normalizePhone(orderData.customer_phone);
    if (customerPhone.length !== 10) return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number" });

    let address = {};
    if (orderData.address_id) {
      const [addressRows] = await db.query(`SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`, [orderData.address_id, userId]);
      if (!addressRows.length) return res.status(404).json({ success: false, message: "Saved address not found" });
      address = addressRows[0];
    } else {
      address = {
        address_line_1: orderData.shipping_address_line1,
        address_line_2: orderData.shipping_address_line2 || "",
        city: orderData.shipping_city,
        state: orderData.shipping_state,
        postal_code: orderData.shipping_pincode,
        country: orderData.shipping_country || "India",
      };
    }

    if (!address.address_line_1 || !address.city || !address.state || !address.postal_code) {
      return res.status(400).json({ success: false, message: "Complete shipping address is required" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const orderNumber = `ORD-${Date.now()}`;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        user_id, order_number, customer_name, customer_email, customer_phone,
        subtotal, tax_amount, shipping_fee, platform_fee, coin_discount, coupon_discount,
        total_amount, warranty_total, payment_method, total_weight_kg, length_cm, width_cm, height_cm,
        shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_pincode, shipping_country,
        billing_address_line1, billing_address_line2, billing_city, billing_state, billing_pincode, billing_country,
        payment_status, order_status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'razorpay', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending'
      )`,
      [
        userId, orderNumber, orderData.customer_name || "Customer", orderData.customer_email || "no-email@example.com", customerPhone,
        Number(subtotal.toFixed(2)), Number(taxAmount.toFixed(2)), Number(shippingFee.toFixed(2)), Number(platformFee.toFixed(2)),
        Number(coinDiscount.toFixed(2)), Number(couponDiscount.toFixed(2)), Number(totalAmount.toFixed(2)), Number(warrantyTotal.toFixed(2)),
        Number(totalWeight.toFixed(3)), Number(length), Number(width), Number(height),
        address.address_line_1, address.address_line_2 || "", address.city, address.state, String(address.postal_code), address.country || "India",
        address.address_line_1, address.address_line_2 || "", address.city, address.state, String(address.postal_code), address.country || "India"
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, product_image,
          quantity, unit_price, tax_amount, total_price, is_warranty, warranty_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, item.product_id, item.product_name, item.product_sku, item.product_image,
          item.quantity, item.unit_price, item.tax_amount, item.total_price, item.is_warranty, item.warranty_name
        ]
      );
    }

    await connection.commit();
    connection.release();
    connection = null;

    return res.status(200).json({ success: true, message: "Pending order created", orderId, orderNumber });
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) { console.error("Rollback Error:", rbErr); }
      connection.release();
    }
    console.error("Pending Order Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create pending order", error: error.message });
  }
}; 

// ------------------------------------------------------------------
// GET USER ORDERS
// ------------------------------------------------------------------
exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT
        id, order_number, total_amount, payment_method, payment_status, order_status, created_at,
        fship_awb, awb_code, courier_company, tracking_url, shipping_city, shipping_state
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT product_name, quantity, unit_price, total_price, product_image FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
      order.item_count = items.length;
      order.total_amount = parseFloat(order.total_amount) || 0;
    }

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ------------------------------------------------------------------
// GET ORDER DETAILS
// ------------------------------------------------------------------
exports.getOrderDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const orderId = req.params.id;
    const userId = req.user.id;

    const [orderRows] = await db.query(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [orderId, userId]);

    if (!orderRows.length) return res.status(404).json({ success: false, message: "Order not found" });

    const order = orderRows[0];
    order.total_amount = parseFloat(order.total_amount) || 0;

    const [items] = await db.query(
      `SELECT id, product_id, product_name, product_sku, quantity, unit_price, total_price, product_image FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    order.items = items;
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

// ------------------------------------------------------------------
// GET ALL ORDERS — Admin
// ------------------------------------------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT
        o.id, o.order_number, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at,
        o.shipping_address_line1, o.shipping_city, o.shipping_state, o.shipping_pincode, o.shipping_country,
        o.courier_company, o.tracking_url, o.fship_awb, o.awb_code, o.customer_name, o.customer_email, o.customer_phone
       FROM orders o ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT product_name, quantity, unit_price, total_price, product_image FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
      order.total_amount = parseFloat(order.total_amount) || 0;
    }

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const [result] = await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    return res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------------------------------
// CANCEL ORDER
// ------------------------------------------------------------------
exports.cancelOrder = async (req, res) => {
  let connection = null;

  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: "Order not found" });

    const order = orders[0];
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to cancel this order" });
    }

    const cancellableStatuses = ["pending", "processing"];
    if (!cancellableStatuses.includes(order.order_status)) {
      return res.status(400).json({ success: false, message: `Order cannot be cancelled because it is ${order.order_status}` });
    }

    if (order.fship_order_id) {
      try {
        console.log(`🔄 Attempting to cancel Shiprocket order ID: ${order.fship_order_id}`);
        const shiprocketResult = await cancelShiprocketOrder(order.fship_order_id);

        if (shiprocketResult.status === false || shiprocketResult.success === false) {
          throw new Error(shiprocketResult.message || "Shiprocket cancellation failed");
        }
        console.log(`✅ Shiprocket order ${order.fship_order_id} cancelled successfully.`);
      } catch (shiprocketError) {
        console.error(`❌ Shiprocket cancellation error for ${order.fship_order_id}:`, shiprocketError.message);
        return res.status(500).json({
          success: false, message: "Could not cancel order in Shiprocket. Please try again later.", error: shiprocketError.message,
        });
      }
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query("UPDATE orders SET order_status = 'cancelled', cancellation_reason = ? WHERE id = ?", [reason || null, orderId]);

    const [items] = await connection.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId]);

    for (const item of items) {
      await connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?", [item.quantity, item.product_id]);
      await connection.query(
        `UPDATE products SET stock_status = CASE WHEN stock_quantity > 0 THEN 'in_stock' ELSE 'out_of_stock' END WHERE id = ?`,
        [item.product_id]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({ success: true, message: "Order cancelled successfully", reason: reason || null });
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) { console.error("Rollback error:", rbErr); }
      connection.release();
    }
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order", error: error.message });
  }
};

exports.checkDelivery = async (req, res) => {
  try {
    const { pincode, weight, length, breadth, height } = req.body;

    if (!pincode) return res.status(400).json({ success: false, message: "Pincode is required" });
    if (!/^\d{6}$/.test(pincode)) return res.status(400).json({ success: false, message: "Please enter a valid 6-digit pincode" });

    const result = await checkServiceability({ deliveryPincode: pincode, weight: weight || 0.5, length: length || 10, breadth: breadth || 10, height: height || 10 });
    console.log("📦 Full Shiprocket response:", JSON.stringify(result, null, 2));

    let serviceable = false, estimated_days = null, courier = null, shipping_charge = 0, message = "Serviceability check failed";

    if (result?.status === true && result?.data?.available_courier_companies) {
      const couriers = result.data.available_courier_companies;
      if (Array.isArray(couriers) && couriers.length > 0) {
        serviceable = true;
        const firstCourier = couriers[0];
        courier = firstCourier.courier_name || "Unknown";
        estimated_days = firstCourier.estimated_delivery_days || null;
        shipping_charge = Number(firstCourier.shipping_charge) || 0;
        message = `Serviceable via ${courier}`;
      } else {
        message = result?.message || "We do not deliver to this pincode yet.";
      }
    } else {
      message = result?.message || "Serviceability check failed";
    }

    return res.status(200).json({ success: true, serviceable, estimated_days, courier, shipping_charge, message });
  } catch (error) {
    console.error("❌ Delivery check error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to check delivery serviceability" });
  }
};

/**
 * Create a return order via Shiprocket
 * POST /api/orders/:id/return
 */
exports.createReturn = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [orders] = await db.query(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [orderId]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = orders[0];

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    if (!items.length) return res.status(400).json({ success: false, message: 'No items found for this order' });

    let pickupLocation = null;
    let channelId = null;

    if (process.env.SHIPROCKET_CHANNEL_ID) channelId = parseInt(process.env.SHIPROCKET_CHANNEL_ID);
    else channelId = await getDefaultChannelId();

    if (process.env.SHIPROCKET_PICKUP_LOCATION_ID) pickupLocation = { id: parseInt(process.env.SHIPROCKET_PICKUP_LOCATION_ID) };
    else pickupLocation = await getDefaultPickupLocation();

    const today = new Date().toISOString().split('T')[0];

    const returnPayload = {
      order_id: `RET-${order.order_number || order.id}-${Date.now()}`,
      order_date: today,
      channel_id: channelId,
      pickup_customer_name: order.customer_name || 'Customer',
      pickup_last_name: '',
      pickup_address: order.shipping_address_line1 || '',
      pickup_address_2: order.shipping_address_line2 || '',
      pickup_city: order.shipping_city || '',
      pickup_state: order.shipping_state || '',
      pickup_country: order.shipping_country || 'India',
      pickup_pincode: order.shipping_pincode || '',
      pickup_email: order.customer_email || '',
      pickup_phone: order.customer_phone || '',
      pickup_isd_code: '91',
      pickup_location_id: pickupLocation?.id || null,
      shipping_customer_name: pickupLocation?.name || 'Your Store',
      shipping_last_name: '',
      shipping_address: pickupLocation?.address || '',
      shipping_address_2: pickupLocation?.address_2 || '',
      shipping_city: pickupLocation?.city || '',
      shipping_country: 'India',
      shipping_pincode: pickupLocation?.pincode || '',
      shipping_state: pickupLocation?.state || '',
      shipping_email: process.env.SHIPROCKET_RETURN_EMAIL || 'returns@yourstore.com',
      shipping_isd_code: '91',
      shipping_phone: process.env.SHIPROCKET_RETURN_PHONE || '9876543210',
      order_items: items.map((item) => ({
        name: item.product_name || 'Product',
        sku: item.product_sku || `SKU-${item.product_id}`,
        units: item.quantity || 1,
        selling_price: Number(item.unit_price) || 0,
        discount: 0,
        hsn: '',
        qc_enable: true,
        qc_product_name: item.product_name || 'Product',
        qc_brand: '',
        qc_product_image: item.product_image || '',
      })),
      payment_method: order.payment_method === 'cod' ? 'COD' : 'PREPAID',
      total_discount: '0',
      sub_total: Number(order.total_amount) || 0,
      length: Number(order.length_cm) || 10,
      breadth: Number(order.width_cm) || 10,
      height: Number(order.height_cm) || 10,
      weight: Number(order.total_weight_kg) || 0.5,
    };

    console.log('📦 Return payload:', JSON.stringify(returnPayload, null, 2));

    const result = await createReturnOrder(returnPayload);

    await db.query(
      `UPDATE orders SET order_status = 'return_initiated', fship_order_id = ?, fship_awb = ?, courier_company = ?, tracking_url = ? WHERE id = ?`,
      [result.shiprocket_order_id, result.shiprocket_awb, result.courier_company, result.tracking_url, orderId]
    );

    return res.status(200).json({ success: true, message: 'Return order created successfully', data: result });
  } catch (error) {
    console.error('❌ Create return error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create return order' });
  }
};