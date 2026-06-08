const express = require("express");
const router = express.Router();

const ListaEsperaController = require("../../controllers/listaEsperaController");

router.post(
"/",
ListaEsperaController.ingresar
);

router.get(
  "/posicion",
  ListaEsperaController.obtenerPosicion
);

router.get(
  "/usuario/:idUsuario",
  ListaEsperaController.obtenerPorUsuario
);

module.exports = router;