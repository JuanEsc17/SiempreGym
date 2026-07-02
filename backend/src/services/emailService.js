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
  monto,
  tipoReserva = 'Reserva'
) => {

  try {

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,

      subject: `${tipoReserva} confirmado - SiempreGym`,

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
              Tu pago de <strong>${tipoReserva}</strong> fue registrado correctamente.
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

            <p style="margin-top:15px;">
              Este email funciona como comprobante de pago.
            </p>

            <p style="margin-top:25px;">
              Gracias por elegir SiempreGym. 💪
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

// Función para enviar notificación de permiso aprobado
const sendPermisoAprobado = async (email, nombre) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Autorización aprobada - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #14b8a6; text-align: center;">¡Autorización Aprobada!</h3>
            
            <p style="color: #333;">Hola <b>${nombre}</b>,</p>
            
            <p style="color: #666;">
              Tu autorización para participar en nuestras actividades ha sido <b style="color: #14b8a6;">aprobada</b> por el administrador.
            </p>
            
            <div style="background-color: #E2CEF6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #5B0672; font-size: 18px; font-weight: bold; margin: 0;">
                ✅ Ya puedes reservar clases
              </p>
            </div>
            
            <p style="color: #666;">
              Ingresa a tu cuenta en SiempreGym y comienza a disfrutar de nuestras actividades.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Gracias por ser parte de SiempreGym. 💪
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email de permiso aprobado enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error al enviar email de permiso aprobado:", error)
    return false
  }
}

// Función para enviar notificación de permiso rechazado
const sendPermisoRechazado = async (email, nombre) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Autorización rechazada - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #f87171; text-align: center;">Autorización Rechazada</h3>
            
            <p style="color: #333;">Hola <b>${nombre}</b>,</p>
            
            <p style="color: #666;">
              Tu autorización para participar en nuestras actividades ha sido <b style="color: #f87171;">rechazada</b>.
            </p>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #dc2626; font-size: 14px; margin: 0;">
                Posible motivo: La autorización no cumple con los requisitos necesarios.
              </p>
            </div>
            
            <p style="color: #666;">
              <b>Buenas noticias:</b> Puedes volver a subir otra autorización. Asegúrate de que el documento sea claro y legible, y que esté firmado por un adulto responsable.
            </p>
            
            <div style="background-color: #fef3c7; padding: 12px; border-radius: 8px; margin: 15px 0;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                Ingresa a tu cuenta en SiempreGym para subir una nueva autorización.
              </p>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              Si tienes preguntas, no dudes en contactarnos.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Gracias por tu comprensión. 💪
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email de permiso rechazado enviado:", info.response)
    return true
  } catch (error) {
    console.error("Error al enviar email de permiso rechazado:", error)
    return false
  }

}
const sendPasswordResetCode = async (email, nombre, codigo) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de confirmación - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 400px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #5B0672; text-align: center;">Recuperar Contraseña</h3>
            
            <p style="color: #666; text-align: center;">Hola <b>${nombre}</b>,</p>
            
            <p style="color: #666; text-align: center;">
              Recibimos una solicitud para cambiar tu contraseña. Usa este código para continuar:
            </p>
            
            <div style="background-color: #E2CEF6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #5B0672; letter-spacing: 5px; margin: 0;">
                ${codigo}
              </p>
            </div>
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              Este código expira en 15 minutos
            </p>
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              Si no solicitaste este cambio, ignora este email
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de recuperación enviado:", info.response);
    return true;
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    return false;
  }
}

const sendPasswordChanged = async (email, nombre) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Contraseña actualizada - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 400px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #14b8a6; text-align: center;">Contraseña Actualizada</h3>
            
            <p style="color: #666;">Hola <b>${nombre}</b>,</p>
            
            <div style="background-color: #E2CEF6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #5B0672; font-size: 16px; font-weight: bold; margin: 0;">
                ✅ Tu contraseña ha sido actualizada exitosamente
              </p>
            </div>
            
            <p style="color: #666;">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Gracias por usar SiempreGym. 💪
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de cambio de contraseña enviado:", info.response);
    return true;
  } catch (error) {
    console.error("Error al enviar email de cambio de contraseña:", error);
    return false;
  }
}

// Función para enviar notificación de pago próximo a vencer
const sendNotificacionPagoProximoAVencer = async (email, nombre, actividad) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Tu pago está próximo a vencerse - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #f59e0b; text-align: center;">⏰ Recordatorio de Pago</h3>
            
            <p style="color: #333;">Hola <b>${nombre}</b>,</p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0;">
                Su pago está a dos días de vencerse
              </p>
            </div>
            
            <p style="color: #666;">
              Tu suscripción a <b>${actividad}</b> se vence dentro de dos días. Te recomendamos renovar tu pago para no perder acceso a tus clases.
            </p>
            
            <div style="background-color: #f3f3f3; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #333; margin: 0;">
                <b>¿Qué hacer?</b>
              </p>
              <p style="color: #666; margin-top: 10px;">
                1. Ingresa a tu cuenta en SiempreGym<br>
                2. Ve a la sección de "Renovaciones"<br>
                3. Completa tu pago antes del vencimiento
              </p>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              Si ya realizaste el pago, ignora este mensaje.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Gracias por ser parte de SiempreGym. 💪
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de notificación de pago próximo a vencer enviado:", info.response);
    return true;
  } catch (error) {
    console.error("Error al enviar email de notificación de pago:", error);
    return false;
  }
}

const sendDevolucionSena = async (email, nombre, actividad, fechaClase, monto) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Comprobante de devolución - SiempreGym',
      html: `
        <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
          <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px;">
            <h2 style="color:#5B0672; text-align:center;">SiempreGym</h2>
            <h3 style="color:#f59e0b; text-align:center;">Devolución registrada</h3>
            <p>Hola <b>${nombre}</b>,</p>
            <p>Se registró la devolución de tu seña por la cancelación de la siguiente clase:</p>
            <div style="background:#f3f3f3; padding:15px; border-radius:8px; margin-top:20px;">
              <p><b>Actividad:</b> ${actividad}</p>
              <p><b>Fecha:</b> ${fechaClase}</p>
              <p><b>Monto a devolver:</b> $${monto}</p>
            </div>
            <p style="margin-top:15px;">Este email funciona como comprobante de devolución.</p>
            <p style="margin-top:25px;">Gracias por elegir SiempreGym. 💪</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Mail devolución enviado:', info.response);
    return true;
  } catch (error) {
    console.error('Error enviando mail devolución:', error);
    return false;
  }
};

// Función para enviar notificación de clase cancelada
const sendClaseCancelada = async (email, nombre, actividad, fechaClase) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Clase cancelada - SiempreGym",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #5B0672; text-align: center;">SiempreGym</h2>
            <h3 style="color: #f87171; text-align: center;">Clase Cancelada</h3>

            <p style="color: #333;">Hola <b>${nombre}</b>,</p>

            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f87171;">
              <p style="color: #dc2626; margin: 0;">
                Lamentamos informarte que la clase de <b>${actividad}</b> del <b>${fechaClase}</b> ha sido cancelada.
              </p>
            </div>

            <p style="color: #666;">
              Como compensación, se te ha asignado <b>1 crédito</b> para que puedas reservar otra clase sin costo adicional.
            </p>

            <div style="background-color: #E2CEF6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #5B0672; font-size: 16px; font-weight: bold; margin: 0;">
                🎫 Tienes 1 crédito disponible
              </p>
            </div>

            <p style="color: #666;">
              Ingresa a tu cuenta en SiempreGym para reservar tu próxima clase.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Gracias por tu comprensión. 💪
            </p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de clase cancelada enviado:", info.response);
    return true;
  } catch (error) {
    console.error("Error al enviar email de clase cancelada:", error);
    return false;
  }
}

const sendListaEsperaAsignada = async (email, nombre, actividad, horario, fechas) => {
  try {
    const fechasHtml = fechas
      .map(f => `<li style="color:#666; margin:4px 0;">${f}</li>`)
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '¡Conseguiste un lugar! - SiempreGym',
      html: `
        <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
          <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px;">
            <h2 style="color:#5B0672; text-align:center;">SiempreGym</h2>
            <h3 style="color:#14b8a6; text-align:center;">¡Tenés un lugar disponible!</h3>
            <p>Hola <b>${nombre}</b>,</p>
            <p>Se liberó un cupo en tu clase de lista de espera y te asignamos las siguientes reservas:</p>
            <div style="background:#f3f3f3; padding:15px; border-radius:8px; margin-top:20px;">
              <p><b>Actividad:</b> ${actividad}</p>
              <p><b>Horario:</b> ${horario}</p>
              <p><b>Clases asignadas:</b></p>
              <ul style="margin:8px 0; padding-left:20px;">
                ${fechasHtml}
              </ul>
            </div>
            <div style="background:#E2CEF6; padding:15px; border-radius:8px; margin-top:20px; text-align:center;">
              <p style="color:#5B0672; font-weight:bold; margin:0;">
                ⏳ Tenés tiempo limitado para completar el pago
              </p>
            </div>
            <p style="margin-top:15px; color:#666;">
              Ingresá a tu cuenta en SiempreGym, andá a <b>Mis Reservas</b> y completá el pago para confirmar tu lugar.
            </p>
            <p style="margin-top:25px;">Gracias por elegir SiempreGym. 💪</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Mail lista espera asignada enviado:', info.response);
    return true;
  } catch (error) {
    console.error('Error enviando mail lista espera:', error);
    return false;
  }
};

module.exports = {
  sendVerificationCode,
  sendPagoConfirmado,
  sendPermisoAprobado,
  sendPermisoRechazado,
  sendPasswordResetCode,
  sendPasswordChanged,
  sendNotificacionPagoProximoAVencer,
  sendDevolucionSena,
  sendClaseCancelada,
  sendListaEsperaAsignada  
}