const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all records
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM test_db ORDER BY id DESC"
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Insert record
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const [result] = await db.query(
      "INSERT INTO test_db (name) VALUES (?)",
      [name]
    );

    res.status(201).json({
      success: true,
      message: "Record inserted successfully",
      insertedId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;