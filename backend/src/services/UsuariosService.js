const UsuariosRepository = require('../../repositories/usuariosRepository');
const { sendPasswordResetCode, sendPasswordChanged } = require('./emailService');
const crypto = require('crypto');

class UsuariosService {
  constructor(db) {
    this.repo = new UsuariosRepository(db);
  }

  // HISTORIA 1: Enviar código de confirmación
  async solicitarCambioContraseña(email) {
    // Validar email no vacío
    if (!email || email.trim() === '') {
      throw { status: 400, mensaje: 'Se debe ingresar el mail' };
    }

    // Validar que el usuario existe
    const usuario = await this.repo.buscarPorEmail(email);
    if (!usuario) {
      throw { status: 404, mensaje: 'El mail no existe en el sistema' };
    }

    // Generar código aleatorio (5 dígitos)
    const codigo = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Calcular expiración (15 minutos desde ahora)
    const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    // Guardar código en la BD
    await this.repo.crearCodigoConfirmacion(usuario.id_usuario, codigo, fechaExpiracion);

    // Enviar email
    const emailEnviado = await sendPasswordResetCode(email, usuario.nombre, codigo);
    if (!emailEnviado) {
      throw { status: 500, mensaje: 'Error al enviar el email' };
    }

    return { mensaje: 'Código de confirmación enviado' };
  }

  // HISTORIA 2: Verificar código
  async verificarCodigo(email, codigo) {
    // Validar campos no vacíos
    if (!email || email.trim() === '') {
      throw { status: 400, mensaje: 'Se debe ingresar el mail' };
    }
    if (!codigo || codigo.toString().trim() === '') {
      throw { status: 400, mensaje: 'Se debe ingresar código de confirmación' };
    }

    // Buscar el usuario
    const usuario = await this.repo.buscarPorEmail(email);
    if (!usuario) {
      throw { status: 404, mensaje: 'El mail no existe' };
    }

    // Buscar el código más reciente del usuario
    const codigoRegistro = await this.repo.obtenerUltimoCodigoConfirmacion(usuario.id_usuario);
    if (!codigoRegistro) {
      throw { status: 404, mensaje: 'No existe código de confirmación' };
    }

    // Validar si el código ya fue usado
    if (codigoRegistro.usado) {
      throw { status: 400, mensaje: 'El código ya fue utilizado' };
    }

    // Validar si el código está vencido
    const ahora = new Date();
    if (ahora > new Date(codigoRegistro.fecha_expiracion)) {
      throw { status: 400, mensaje: 'El código está vencido' };
    }

    // Validar si el código es correcto
    if (codigoRegistro.codigo !== codigo.toString()) {
      throw { status: 400, mensaje: 'El código es inválido' };
    }

    // Marcar como usado
    await this.repo.marcarCodigoUsado(codigoRegistro.id_codigo);

    return { mensaje: 'Código verificado exitosamente' };
  }

  // HISTORIA 3: Cambiar contraseña
  async cambiarContraseña(email, codigoVerificado, contraseñaNueva, confirmacionContraseña) {
    // Validar campos no vacíos
    if (!email || !contraseñaNueva || !confirmacionContraseña) {
      throw { status: 400, mensaje: 'Se debe rellenar todos los campos' };
    }

    // Validar que las contraseñas coinciden
    if (contraseñaNueva !== confirmacionContraseña) {
      throw { status: 400, mensaje: 'Las contraseñas no coinciden, debe probar de nuevo' };
    }

    // Validar formato de contraseña
    const regexContraseña = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,20}$/;
    if (!regexContraseña.test(contraseñaNueva)) {
      throw { 
        status: 400, 
        mensaje: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un carácter especial y un máximo de 20 caracteres' 
      };
    }

    // Buscar usuario
    const usuario = await this.repo.buscarPorEmail(email);
    if (!usuario) {
      throw { status: 404, mensaje: 'El mail no existe' };
    }

    // Validar que NO sea igual a la actual

    if (contraseñaNueva === usuario.password) {
        throw { status: 400, mensaje: 'La contraseña nueva debe ser distinta a la actual' };
    }

    await this.repo.actualizarContraseña(usuario.id_usuario, contraseñaNueva);

    // Enviar email de confirmación
    await sendPasswordChanged(email, usuario.nombre);

    return { mensaje: 'La contraseña ha sido actualizada exitosamente' };
  }
}

module.exports = UsuariosService;