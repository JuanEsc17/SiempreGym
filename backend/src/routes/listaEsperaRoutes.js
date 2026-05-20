const express = require("express");
const router = express.Router();

const ListaEsperaController = require("../../controllers/listaEsperaController");

router.post(
"/",
ListaEsperaController.ingresar
);

module.exports = router;