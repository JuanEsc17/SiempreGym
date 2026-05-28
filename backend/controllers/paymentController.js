const { MercadoPagoConfig, Preference } = require("mercadopago");
const reservaIndividualService =
  require("../src/services/reservaIndividualService");
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// ─────────────────────────────────────────────
// Crear preferencia de Mercado Pago
// ─────────────────────────────────────────────
const createPreference = async (req, res) => {
  try {
    const {
      tipoPago,
      descripcion,
      precio,
      id_usuario,
      id_clase
    } = req.body;

    let montoACobrar = parseFloat(precio);

    if (!montoACobrar) {
      if (tipoPago === 'sena') {
        montoACobrar = parseFloat(process.env.PRECIO_SENA);
      } else if (tipoPago === 'mensual') {
        montoACobrar = parseFloat(process.env.PRECIO_MENSUAL);
      } else {
        montoACobrar = parseFloat(process.env.PRECIO_INDIVIDUAL);
      }
    }

    // Referencia única interna
    const refUnica = JSON.stringify({
    id_usuario,
    id_clase,
    id_instancia: req.body.id_instancia,
    fecha_clase: req.body.fecha_clase,
    tipo_pago: tipoPago,
    monto: montoACobrar
  });

    const preference = new Preference(mpClient);

    const response = await preference.create({
      body: {
        items: [
          {
            title:
              descripcion ||
              `Pago SiempreGym - ${tipoPago || 'Actividad'}`,

            quantity: 1,
            unit_price: montoACobrar,
            currency_id: "ARS"
          }
        ],

        external_reference: refUnica,
 // auto_return: "approved",

        back_urls: {
          success:
            `${process.env.NGROK_URL}/payment-status`,

          failure:
            `${process.env.NGROK_URL}/payment-status`,

          pending:
            `${process.env.NGROK_URL}/payment-status`
        }
      }
    });

    return res.json({
      id: response.id,
      init_point: response.init_point
    });

  } catch (error) {

    console.error(
      "Error al crear preferencia MP:",
      error
    );

    return res.status(500).json({
      error:
        "El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde"
    });
  }
};
const paymentStatus = async (req, res) => {

  try {
    console.log("aca")
    const {
      status,
      status_detail,
      external_reference
    } = req.query;

    // PAGO EXITOSO
    if (status === 'approved') {

      const data =
        JSON.parse(external_reference);

      const resultado =
        await reservaIndividualService
          .crearReservaIndividual(
            data.id_usuario,
            data.id_clase,
            data.id_instancia,
            data.fecha_clase,
            data.tipo_pago,
            data.monto
          );

      return res.json({
        success: true,
        mensaje: 'Pago realizado con éxito',
        resultado
      });
    }
    if (status === 'pending') {
      return res.status(400).json({
        success: false,
        mensaje: 'El pago quedó pendiente de aprobación'
      });
    }
    // FONDOS INSUFICIENTES
    if (
      status === 'rejected' &&
      status_detail ===
        'cc_rejected_insufficient_amount'
    ) {

      return res.status(400).json({
        success: false,
        mensaje:
          'La cuenta con la que desea pagar no tiene fondos suficientes, reintente'
      });
    }

    // OPERACIÓN CANCELADA / NO HUBO PAGO
    if (!status || status === 'null') {
      return res.status(400).json({
        success: false,
        mensaje: 'Operación cancelada'
      });
    }

    return res.status(400).json({
      success: false,
      mensaje: 'El pago no pudo procesarse'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      mensaje:
        'El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde'
    });
  }
};
module.exports = {
  createPreference,
  paymentStatus
};