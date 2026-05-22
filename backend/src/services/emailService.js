const nodemailer = require("nodemailer")
require("dotenv").config()

// Configurar el transportador SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // O usa host/port personalizados
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASSWORD // Contraseña de aplicación
  }
})

// Función para enviar código 2FA
const sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de verificación - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 400px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #5B0672; text-align: center;">Verificación de Administrador</h3>
            <p style="color: #666; text-align: center; font-size: 14px;">
              Has iniciado sesión como administrador. Para completar tu acceso, ingresa este código:
            </p>
            <div style="background-color: #E2CEF6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #5B0672; letter-spacing: 5px; margin: 0;">
                ${code}
              </p>
            </div>
            <p style="color: #999; text-align: center; font-size: 12px;">
              Este código expira en 15 minutos
            </p>
            <p style="color: #999; text-align: center; font-size: 12px;">
              Si no solicitaste este código, ignora este email
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error al enviar email:", error)
    return false
  }
}
const sendPagoConfirmado = async ( // envio de mail confirmacion de pago
  email,
  nombre,
  actividad,
  fechaClase,
  monto
) => {

  try {

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,

      subject: 'Pago confirmado - SiempreGym',

      html: `
        <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">

          <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px;">

            <h2 style="color:#5B0672; text-align:center;">
              SiempreGym
            </h2>

            <h3 style="color:#14b8a6; text-align:center;">
              Pago realizado con éxito
            </h3>

            <p>Hola <b>${nombre}</b>,</p>

            <p>
              Tu pago fue registrado correctamente.
            </p>

            <div style="background:#f3f3f3; padding:15px; border-radius:8px; margin-top:20px;">

              <p>
                <b>Actividad:</b> ${actividad}
              </p>

              <p>
                <b>Fecha:</b> ${fechaClase}
              </p>

              <p>
                <b>Monto abonado:</b> $${monto}
              </p>

            </div>

            <p style="margin-top:25px;">
              Te esperamos en la clase 💪
            </p>

          </div>

        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Mail pago enviado:', info.response);

    return true;

  } catch (error) {

    console.error('Error enviando mail pago:', error);

    return false;
  }
};

module.exports = { sendVerificationCode ,sendPagoConfirmado}