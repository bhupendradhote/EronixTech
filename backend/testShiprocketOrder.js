require("dotenv").config();

const { createShiprocketOrder } = require("./utils/shiprocketHelper");

(async () => {
  try {
    const orderData = {
      order_number: "TEST-" + Date.now(),

      customer_name: "Kapil Agaje",
      customer_email: "test@example.com",
      customer_phone: "9922202003",

      shipping_address_line1: "Test Address",
      shipping_address_line2: "",
      shipping_city: "Solapur",
      shipping_state: "Maharashtra",
      shipping_pincode: "413001",
      shipping_country: "India",

      payment_method: "cod",

      shipping_fee: 0,
      subtotal: 1000,
      total_amount: 1000,

      total_weight_kg: 0.5,
      length_cm: 10,
      width_cm: 10,
      height_cm: 10
    };

    const itemsData = [
      {
        product_name: "Test Product",
        product_sku: "TEST-001",
        quantity: 1,
        unit_price: 1000
      }
    ];

    const result = await createShiprocketOrder(orderData, itemsData);

    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();