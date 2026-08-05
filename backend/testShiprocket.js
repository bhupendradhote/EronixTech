require('dotenv').config();

const {
  getShiprocketToken
} = require('./utils/shiprocketHelper');

const test = async () => {
  try {
    await getShiprocketToken();
    console.log('✅ Shiprocket login successful');
  } catch (error) {
    console.error(
      '❌ Shiprocket login failed:',
      error.message
    );
  }
};

test();