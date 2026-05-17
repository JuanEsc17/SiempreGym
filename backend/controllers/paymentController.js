const { MercadoPagoConfig, Preference } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

// ─── MÉTODO 1: Crear la preferencia ──────────────────────────────────
const createPreference = async (req, res) => {
  try {
    const { tipoPago, descripcion, precio, id_usuario, id_clase } = req.body;

    let montoACobrar = parseFloat(precio);
    if (!montoACobrar) {
      if (tipoPago === 'sena') montoACobrar = parseFloat(process.env.PRECIO_SENA);
      else if (tipoPago === 'mensual') montoACobrar = parseFloat(process.env.PRECIO_MENSUAL);
      else montoACobrar = parseFloat(process.env.PRECIO_INDIVIDUAL);
    }

    // Creamos la referencia acá por si el Front no la envió
    const refUnica = req.body.external_reference || `RESERVA_${id_usuario || '1'}_${id_clase || '1'}_${Date.now()}`;

    const preference = new Preference(mpClient);
    
    const response = await preference.create({
      body: {
        items: [
          {
            title: descripcion || `Pago SiempreGym - ${tipoPago || 'Actividad'}`,
            quantity: 1,
            unit_price: montoACobrar,
            currency_id: 'ARS'
          }
        ],
        back_urls: {
          success: "http://localhost:5173/payment-status",
          failure: "http://localhost:5173/payment-status",
          pending: "http://localhost:5173/payment-status"
        },
        external_reference: refUnica
      }
    });

    // Devolvemos el ID, el link Y también la referencia para que el Front la guarde fácil
    return res.json({ 
      id: response.id, 
      init_point: response.init_point,
      external_reference: refUnica
    });

  } catch (error) {
    console.error('Error al conectar con Mercado Pago:', error);
    return res.status(500).json({ 
      error: 'El servicio para realizar el pago está interrumpido momentáneamente, reintente más tarde' 
    });
  }
};

// ─── MÉTODO 2: Validar el pago (SÚPER INTELIGENTE / HÍBRIDO) ──────────
const validarPago = async (req, res) => {
  try {
    const { preference_id } = req.body;

    if (!preference_id) {
      return res.status(400).json({ verificado: false, error: "Falta el ID de preferencia." });
    }

    // 🌐 Endpoint oficial para buscar órdenes comerciales por ID de preferencia
    const url = `https://api.mercadopago.com/merchant_orders/search?preference_id=${preference_id}`;

    const responseMP = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!responseMP.ok) {
      const errorTxt = await responseMP.text();
      console.error("Error en Merchant Orders de MP:", errorTxt);
      return res.status(400).json({ verificado: false, error: "No se pudo consultar la orden en Mercado Pago." });
    }

    const mpData = await responseMP.json();

    console.log("====== 🔍 REVISANDO ORDEN DE MERCADO PAGO ======");
    console.log(JSON.stringify(mpData, null, 2));
    console.log("================================================");

    // Si la orden existe en los resultados
    if (mpData && mpData.elements && mpData.elements.length > 0) {
      const orden = mpData.elements[0];

      // Verificamos si el estado de la orden es "closed" (cerrada) 
      // y si el monto pagado (order_status o status) está aprobado
      const statusAprobado = orden.status === 'closed' || orden.order_status === 'paid';
      
      // Opcional: chequear si tiene pagos aprobados adentro
      const tienePagoAprobado = orden.payments && orden.payments.some(p => p.status === 'approved');

      if (statusAprobado || tienePagoAprobado) {
        console.log("-> ✅ ¡ORDEN VERIFICADA Y PAGADA CON ÉXITO!");
        return res.json({ verificado: true });
      }
    }

    console.log(`-> ❌ RECHAZADO: La orden para la preferencia ${preference_id} no está pagada.`);
    return res.status(200).json({ 
      verificado: false, 
      error: "El pago no figura como aprobado o acreditado todavía." 
    });

  } catch (error) {
    console.error("Error interno al validar orden:", error);
    return res.status(500).json({ verificado: false, error: "Error interno del servidor" });
  }
};
module.exports = {
  createPreference,
  validarPago
};