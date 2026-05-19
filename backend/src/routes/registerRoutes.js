const express = require("express");
const router = express.Router();

const multer = require("multer");
const RegisterController = require("../../controllers/registerController");

// configuración simple de multer
const upload = multer({
    dest: "uploads/"
});

// POST /api/register
router.post("/register", upload.single("permiso"), RegisterController.register);

module.exports = router;