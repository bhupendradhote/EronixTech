require('dotenv').config();

let cachedWarehouseId = process.env.FSHIP_PICKUP_ADDRESS_ID;

/**
 * Creates a Warehouse on FShip.
 */
const createWarehouse = async (customData = null) => {
    if (cachedWarehouseId && cachedWarehouseId !== "0" && cachedWarehouseId !== "292071") {
        console.log(`✅ Using cached Warehouse ID: ${cachedWarehouseId}`);
        return parseInt(cachedWarehouseId);
    }

    console.log("⚠️ No valid Warehouse ID found. Creating one dynamically...");

    const fshipAddressUrl = process.env.FSHIP_ADDRESS_URL || 'https://capi.fship.in/api/addwarehouse';
    const authToken = process.env.F_SHIP_CLIENT_KEY ? process.env.F_SHIP_CLIENT_KEY.trim() : "";

    const warehousePayload = {
        warehouseId: 0,
        warehouseName: customData?.warehouseName || `Eronix Warehouse ${Date.now()}`,
        contactName: customData?.contactName || "Eronix Tech",
        addressLine1: customData?.addressLine1 || "Office No. 3, Melody Enclave",
        addressLine2: customData?.addressLine2 || "Beside Old IMS School",
        pincode: customData?.pincode || "413004",
        city: customData?.city || "Solapur",
        stateId: 0,
        countryId: 0,
        phoneNumber: customData?.phoneNumber || "9922202003",
        email: customData?.email || "kpagaje95@gmail.com"
    };

    try {
        const response = await fetch(fshipAddressUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': authToken
            },
            body: JSON.stringify(warehousePayload)
        });

        const data = await response.json();
        console.log("📦 Warehouse creation response:", JSON.stringify(data, null, 2));
        
        if (data.status === true && data.warehouseId) {
            console.log(`✅ Warehouse Created Successfully! ID: ${data.warehouseId}`);
            cachedWarehouseId = data.warehouseId;
            return data.warehouseId;
        } else {
            throw new Error(data.response || data.title || "Failed to create warehouse");
        }
    } catch (error) {
        console.error("❌ FShip Add Warehouse Error:", error.message);
        throw error;
    }
};

/**
 * Creates a forward order on FShip with status "New" (no courier assigned).
 */
const createFShipOrder = async (orderData, itemsData) => {
    console.log("🚀 Starting FShip order creation...");
    
    try {
        const activeWarehouseId = await createWarehouse();
        console.log(`🏠 Using Warehouse ID: ${activeWarehouseId}`);

        const length = parseFloat(orderData.length_cm) || 10;
        const width = parseFloat(orderData.width_cm) || 10;
        const height = parseFloat(orderData.height_cm) || 10;
        const volumetricWeight = (length * width * height) / 5000;

        const rawPhone = String(orderData.customer_phone).replace(/\D/g, '');
        const safePhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone;

        const products = itemsData.map(item => ({
            productId: String(item.product_id || ""),
            productName: item.product_name || "Product",
            unitPrice: parseFloat(item.unit_price) || 0,
            quantity: parseInt(item.quantity) || 1,
            productCategory: "General",
            hsnCode: "",
            sku: item.product_sku || "NA",
            taxRate: 0,
            productDiscount: 0
        }));

        // 🔥 KEY CHANGES to keep order "New"
        const payload = {
            customer_Name: orderData.customer_name || "Customer",
            customer_Mobile: safePhone,
            customer_Emailid: orderData.customer_email || "test@example.com",
            customer_Address: orderData.shipping_address_line1 || "No Address Provided",
            landMark: orderData.shipping_address_line2 || "",
            customer_Address_Type: "Home",
            customer_PinCode: String(orderData.shipping_pincode || "413004"),
            customer_City: orderData.shipping_city || "City",

            orderId: String(orderData.order_number),
            invoice_Number: String(orderData.order_number),
            payment_Mode: orderData.payment_method === 'cod' ? 1 : 2,
            express_Type: "surface",
            is_Ndd: 0,

            order_Amount: parseFloat(orderData.subtotal) || 0,
            tax_Amount: parseFloat(orderData.tax_amount) || 0,
            extra_Charges: (parseFloat(orderData.shipping_fee) || 0) + (parseFloat(orderData.platform_fee) || 0),
            total_Amount: parseFloat(orderData.total_amount) || 0,

            cod_Amount: orderData.payment_method === 'cod' ? (parseFloat(orderData.total_amount) || 0) : 0,

            shipment_Weight: parseFloat(orderData.total_weight_kg) || 0.5,
            shipment_Length: length,
            shipment_Width: width,
            shipment_Height: height,
            volumetric_Weight: volumetricWeight,

            latitude: 0,
            longitude: 0,

            pick_Address_ID: activeWarehouseId,
            return_Address_ID: activeWarehouseId,
            
            products: products,

            // ❗ Prevent automatic courier assignment
            courierId: null,           // Use null instead of 0 to avoid auto‑selection
            auto_booking: 0            // Explicit flag to disable auto‑booking
        };

        console.log("📤 FShip Payload:", JSON.stringify(payload, null, 2));

        const fshipUrl = process.env.FSHIP_API_URL || 'https://capi.fship.in/api/createforwardorder';
        const authToken = process.env.F_SHIP_CLIENT_KEY ? process.env.F_SHIP_CLIENT_KEY.trim() : "";

        const response = await fetch(fshipUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': authToken
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("📨 FShip Create Order Response:", JSON.stringify(data, null, 2));
        
        if (!response.ok || data.status === false) {
            throw new Error(data.response || data.message || `HTTP ${response.status}`);
        }

        console.log("✅ FShip order created successfully with status 'New' (no courier assigned)");
        return data;
    } catch (error) {
        console.error("❌ FShip Create Order Error:", error.message);
        throw error;
    }
};

/**
 * Registers pickup for a created forward order (manual use only).
 */
const registerPickup = async (apiorderid, waybill) => {
    console.log(`🚚 Registering pickup for order ID: ${apiorderid}, Waybill: ${waybill}`);
    try {
        const registerUrl = process.env.FSHIP_REGISTER_PICKUP_URL || 'https://capi.fship.in/api/registerpickup';
        const authToken = process.env.F_SHIP_CLIENT_KEY ? process.env.F_SHIP_CLIENT_KEY.trim() : "";
        const payload = { waybills: [waybill] };
        console.log(`📤 Register Pickup Payload:`, JSON.stringify(payload, null, 2));
        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'signature': authToken },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("📨 Register Pickup Response:", JSON.stringify(data, null, 2));
        if (!response.ok || data.status === false) {
            throw new Error(data.response || data.message || `HTTP ${response.status}`);
        }
        console.log(`✅ Pickup registered successfully for order ${apiorderid}`);
        return data;
    } catch (error) {
        console.error(`❌ Register Pickup failed for order ${apiorderid}:`, error.message);
        throw error;
    }
};

module.exports = {
    createWarehouse,
    createFShipOrder,
    registerPickup
};