import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000/api';

// Reutilizar el mismo Toast de ReservaPresencial
function Toast({ mensaje, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      style={{
        position:'fixed',
        bottom:24,
        left:'50%',
        transform:'translateX(-50%)',
        background:'#1e1e2e',
        border:'1px solid rgba(16,185,129,0.4)',
        borderLeft:'4px solid #10b981',
        borderRadius:14,
        padding:'14px 20px',
        color:'white',
        zIndex:9999
      }}
    >
      {mensaje}
    </div>
  );
}

// nuevo
function obtenerEstadoReserva(reserva) {

  const ahora = new Date();

  const [hora, minuto] =
    reserva.horario.slice(0,5).split(':');

  const inicioClase = new Date();

  inicioClase.setHours(
    Number(hora),
    Number(minuto),
    0,
    0
  );

  const habilitaDesde = new Date(
    inicioClase.getTime() - 30 * 60000
  );

  const finClase = new Date(
    inicioClase.getTime() +
    reserva.duracion * 60000
  );

  const venceEn = new Date(
    finClase.getTime() - 15 * 60000
  );

  if (ahora < habilitaDesde) {
    return {
      habilitada: false,
      mensaje: 'Se habilitará 30 minutos antes del inicio'
    };
  }

  if (ahora > venceEn) {
    return {
      habilitada: false,
      mensaje: 'Quedan menos de 15 minutos para que finalice la clase'
    };
  }

  return {
    habilitada: true,
    mensaje: null
  };
}

// modificado
function ReservaCard({
  reserva,
  seleccionada,
  onClick
}) {

  const estado =
    obtenerEstadoReserva(reserva);

  return (
    <div
      onClick={
        estado.habilitada
          ? onClick
          : undefined
      }
      className={`rounded-2xl p-5 transition-all ${
        estado.habilitada
          ? 'cursor-pointer'
          : 'cursor-not-allowed'
      }`}
      style={{
        opacity:
          estado.habilitada
            ? 1
            : 0.6,

        background:
          seleccionada
            ? '#8A0BD2'
            : '#252535',

        border:
          seleccionada
            ? '2px solid #AF50E5'
            : '2px solid transparent'
      }}
    >
      <h3
        className="text-white font-bold text-xl m-0"
      >
        {reserva.actividad}
      </h3>

      <p className="text-white/60 mt-2 mb-0">
        {reserva.horario?.slice(0,5)} hs
      </p>

      <p className="text-white/40 text-sm">
        Reserva #{reserva.id_reserva}
      </p>

      {!estado.habilitada && (
        <div
          className="mt-3 text-xs px-2 py-1 rounded-lg inline-block"
          style={{
            background:
              'rgba(239,68,68,0.15)',
            color:'#fca5a5'
          }}
        >
          {estado.mensaje}
        </div>
      )}
    </div>
  );
}

export default function RegistrarAsistencia() {

  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [reservas, setReservas] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [toast, setToast] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // BUSCADOR
  useEffect(() => {

    const buscarUsuario = async () => {

      if (busqueda.length < 3) {
        setUsuarios([]);
        return;
      }

      try {

        const response = await fetch(
          `${BASE_URL}/usuarios/buscar?query=${busqueda}`
        );

        const data = await response.json();

        if (data.ok) {
          setUsuarios(data.data);
        }

      } catch (error) {
        console.log(error);
      }
    };

    const timer = setTimeout(
      buscarUsuario,
      400
    );

    return () => clearTimeout(timer);

  }, [busqueda]);

  const seleccionarUsuario = async (usuario) => {

    setUsuarioSeleccionado(usuario);
    setBusqueda(usuario.username);
    setUsuarios([]);

    setReservaSeleccionada(null);

    try {

      const response = await fetch(
        `${BASE_URL}/asistencias/reservas-hoy/${usuario.id_usuario}`
      );

      const data = await response.json();

      if (data.ok) {

        setReservas(data.data);

        if (data.data.length === 0) {
          setToast(
            'El usuario no posee reservas para hoy'
          );
        }
      }

    } catch (error) {
      console.log(error);
      setToast('Error al obtener reservas');
    }
  };

  const registrarAsistencia = async () => {

    if (!usuarioSeleccionado) {
      setToast(
        'Debe seleccionar un usuario'
      );
      return;
    }

    if (!reservaSeleccionada) {
      setToast(
        'Debe seleccionar una reserva'
      );
      return;
    }

    setProcesando(true);

    try {

      const response = await fetch(
        `${BASE_URL}/asistencias/manual`,
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify({
            usuario_id:
              usuarioSeleccionado.id_usuario,
            id_reserva:
              reservaSeleccionada.id_reserva
          })
        }
      );

      const data = await response.json();

      setToast(data.mensaje);

      if (data.ok) {

        setUsuarioSeleccionado(null);
        setReservaSeleccionada(null);
        setReservas([]);
        setBusqueda('');
      }

    } catch (error) {

      console.log(error);

      setToast(
        'Error al conectar con el servidor'
      );

    } finally {

      setProcesando(false);

    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:'#12121f',
        fontFamily:'system-ui,sans-serif'
      }}
    >

      {/* SIDEBAR */}

      <div
        className="w-80 bg-black/40 border-r border-white/10 p-6 overflow-y-auto flex flex-col"
      >

        <h2
          className="text-2xl font-bold text-white mb-6"
        >
          Registrar Asistencia
        </h2>

        {/* BUSCADOR */}

        <div className="mb-6">

          <label
            className="block text-white text-sm font-bold mb-2"
          >
            Buscar cliente:
          </label>

          <input
            placeholder="Username o email"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            className="w-full rounded-xl px-4 py-2 text-white outline-none border-2 border-white/10 focus:border-[#8A0BD2]"
            style={{
              background:'rgba(255,255,255,0.05)'
            }}
          />

          {usuarios.length > 0 && (

            <div
              className="mt-3 space-y-2 max-h-40 overflow-y-auto"
            >

              {usuarios.map(usuario => (

                <button
                  key={usuario.id_usuario}
                  onClick={() =>
                    seleccionarUsuario(usuario)
                  }
                  className="w-full text-left p-3 rounded-lg hover:bg-white/10"
                  style={{
                    background:'rgba(138,11,210,0.15)',
                    border:'1px solid rgba(138,11,210,0.3)'
                  }}
                >
                  <p className="text-white font-medium text-sm m-0">
                    {usuario.username}
                  </p>

                  <p className="text-white/50 text-xs m-0">
                    {usuario.email}
                  </p>

                </button>

              ))}

            </div>

          )}

        </div>

        {/* USUARIO */}

        {usuarioSeleccionado && (

          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background:'rgba(138,11,210,0.2)',
              border:'1px solid rgba(138,11,210,0.4)'
            }}
          >

            <p className="text-white/70 text-xs mb-1">
              Cliente seleccionado:
            </p>

            <p className="text-white font-bold">
              {usuarioSeleccionado.username}
            </p>

            <button
              onClick={() => {

                setUsuarioSeleccionado(null);
                setBusqueda('');
                setReservas([]);
                setReservaSeleccionada(null);

              }}
              className="text-xs text-[#AF50E5] mt-2 cursor-pointer underline"
            >
              Cambiar cliente
            </button>

          </div>

        )}

      </div>

      {/* MAIN */}

      <main className="flex-1 p-6 lg:px-12 lg:pt-10 overflow-y-auto">

        <header className="mb-7 flex justify-between items-start">

          <div>

            <h1
              className="font-bold text-white m-0"
              style={{ fontSize:'30px' }}
            >
              Reservas del día
            </h1>

            <p
              style={{
                color:'rgba(255,255,255,0.4)',
                fontSize:'13px'
              }}
            >
              Selecciona una reserva para registrar asistencia
            </p>

          </div>

          <button
            onClick={() => navigate('/empleado')}
            className="px-4 py-2 rounded-xl text-white font-medium"
            style={{
              background:'#8A0BD2',
              border:'none'
            }}
          >
            ← Volver
          </button>

        </header>

        <div className="space-y-3">

          {reservas.length > 0 ? (

            reservas.map(reserva => (

              <ReservaCard
                key={reserva.id_reserva}
                reserva={reserva}
                seleccionada={
                  reservaSeleccionada?.id_reserva ===
                  reserva.id_reserva
                }
                onClick={() =>
                  setReservaSeleccionada(reserva)
                }
              />

            ))

          ) : (

            <div className="text-center py-12">

              <p className="text-white/50 text-lg">
                Selecciona un usuario para ver sus reservas
              </p>

            </div>

          )}

        </div>

        {reservas.length > 0 && (

          <button
            onClick={registrarAsistencia}
            disabled={
              !reservaSeleccionada ||
              procesando
            }
            className="mt-6 w-full py-4 rounded-2xl text-white font-bold transition-all disabled:opacity-40"
            style={{
              background:
                'linear-gradient(135deg,#AF50E5,#8A0BD2)'
            }}
          >
            {
              procesando
                ? 'Registrando...'
                : 'Registrar asistencia'
            }
          </button>

        )}

      </main>

      {toast && (
        <Toast
          mensaje={toast}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}