const express = require("express");
const router = express.Router();

const RegisterController = require("../controllers/RegisterController");

// POST /api/register
router.post("/register", RegisterController.register);

module.exports = router;