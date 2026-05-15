import { useState } from 'react';

const clasesMock = [
  {
    id: 1,
    actividad: 'Yoga',
    profesor: 'Carla Gómez',
    horario: '08:00',
    cupos: 8,
    color: '#8A0BD2'
  },
  {
    id: 2,
    actividad: 'Funcional',
    profesor: 'Lucas Pérez',
    horario: '10:00',
    cupos: 2,
    color: '#14b8a6'
  },
  {
    id: 3,
    actividad: 'Pilates',
    profesor: 'Ana Torres',
    horario: '18:00',
    cupos: 0,
    color: '#f59e0b'
  }
];

export default function ReservaPresencial() {
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);

  return (
    <div
      className="
        min-h-screen
        text-white
        p-6
      "
      style={{
        background:
          'linear-gradient(135deg, #12061b 0%, #1e1b4b 45%, #0f172a 100%)'
      }}
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Reserva Presencial
          </h1>

          <p className="text-slate-300 mt-2 text-lg">
            Gestión manual de reservas y pagos
          </p>
        </div>

        <div
          className="
            px-6
            py-3
            rounded-3xl
            border
            backdrop-blur-xl
          "
          style={{
            background: 'rgba(138,11,210,0.15)',
            borderColor: 'rgba(255,255,255,0.08)'
          }}
        >
          <p className="text-sm text-slate-400">
            Sistema
          </p>

          <p className="font-semibold text-lg">
            SiempreGym
          </p>
        </div>

      </div>

      {/* Layout */}
      <div className="flex gap-6">

        {/* IZQUIERDA */}
        <div
          className="
            w-[40%]
            rounded-[34px]
            p-6
            border
            backdrop-blur-xl
          "
          style={{
            background: 'rgba(15,23,42,0.75)',
            borderColor: 'rgba(255,255,255,0.06)'
          }}
        >

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-2xl font-semibold">
                Clases disponibles
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Seleccioná una clase
              </p>
            </div>

            <div
              className="
                px-4
                py-2
                rounded-2xl
                text-sm
                font-medium
              "
              style={{
                background: 'rgba(138,11,210,0.18)',
                color: '#d8b4fe'
              }}
            >
              Hoy
            </div>

          </div>

          <div className="flex flex-col gap-4">

            {clasesMock.map(clase => {

              const activa =
                claseSeleccionada?.id === clase.id;

              return (
                <div
                  key={clase.id}
                  onClick={() => setClaseSeleccionada(clase)}
                  className="
                    rounded-3xl
                    p-5
                    cursor-pointer
                    transition-all
                    duration-300
                    border
                    hover:scale-[1.015]
                  "
                  style={{
                    background: activa
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.55)',

                    borderColor: activa
                      ? clase.color
                      : 'rgba(255,255,255,0.05)',

                    boxShadow: activa
                      ? `0 0 30px ${clase.color}30`
                      : 'none'
                  }}
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="text-2xl font-semibold">
                        {clase.actividad}
                      </p>

                      <p className="text-slate-400 text-sm mt-1">
                        Prof. {clase.profesor}
                      </p>

                    </div>

                    <div
                      className="
                        px-4
                        py-2
                        rounded-2xl
                        text-sm
                        font-semibold
                      "
                      style={{
                        background: clase.color
                      }}
                    >
                      {clase.horario}
                    </div>

                  </div>

                  <div className="mt-6">

                    <div className="flex justify-between mb-2">

                      <p className="text-sm text-slate-400">
                        Cupos
                      </p>

                      <p
                        className="
                          text-sm
                          font-semibold
                        "
                        style={{
                          color:
                            clase.cupos <= 0
                              ? '#f87171'
                              : clase.cupos <= 3
                              ? '#facc15'
                              : '#4ade80'
                        }}
                      >
                        {clase.cupos <= 0
                          ? 'Sin lugares'
                          : `${clase.cupos} disponibles`}
                      </p>

                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">

                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(clase.cupos / 10) * 100}%`,
                          background: clase.color
                        }}
                      />

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* DERECHA */}
        <div
          className="
            flex-1
            rounded-[34px]
            p-7
            border
            backdrop-blur-xl
          "
          style={{
            background: 'rgba(15,23,42,0.75)',
            borderColor: 'rgba(255,255,255,0.06)'
          }}
        >

          {!claseSeleccionada && (

            <div className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              text-center
            ">

              <div
                className="
                  w-28
                  h-28
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-5xl
                  mb-6
                "
                style={{
                  background:
                    'linear-gradient(135deg,#8A0BD2,#14b8a6)'
                }}
              >
                📅
              </div>

              <h2 className="text-3xl font-semibold mb-3">
                Seleccioná una clase
              </h2>

              <p className="text-slate-400 max-w-sm leading-relaxed">
                Elegí una actividad del panel izquierdo
                para comenzar una nueva reserva presencial.
              </p>

            </div>
          )}

          {claseSeleccionada && (

            <div>

              {/* TOP */}
              <div className="flex justify-between items-start mb-8">

                <div>

                  <h2 className="text-4xl font-bold">
                    {claseSeleccionada.actividad}
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Profesor {claseSeleccionada.profesor}
                  </p>

                </div>

                <div
                  className="
                    px-5
                    py-3
                    rounded-3xl
                    text-lg
                    font-bold
                  "
                  style={{
                    background: claseSeleccionada.color
                  }}
                >
                  {claseSeleccionada.horario}
                </div>

              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-4 mb-8">

                <div
                  className="
                    rounded-3xl
                    p-5
                    border
                  "
                  style={{
                    background: 'rgba(138,11,210,0.10)',
                    borderColor: 'rgba(138,11,210,0.15)'
                  }}
                >

                  <p className="text-xs text-slate-400 mb-2">
                    HORARIO
                  </p>

                  <p className="text-2xl font-semibold">
                    {claseSeleccionada.horario} hs
                  </p>

                </div>

                <div
                  className="
                    rounded-3xl
                    p-5
                    border
                  "
                  style={{
                    background: 'rgba(20,184,166,0.10)',
                    borderColor: 'rgba(20,184,166,0.15)'
                  }}
                >

                  <p className="text-xs text-slate-400 mb-2">
                    CUPOS DISPONIBLES
                  </p>

                  <p className="text-2xl font-semibold">
                    {claseSeleccionada.cupos}
                  </p>

                </div>

              </div>

              {/* BUSCADOR */}
              <div className="mb-8">

                <p className="text-sm text-slate-300 mb-3">
                  Buscar cliente
                </p>

                <input
                  type="text"
                  placeholder="Nombre, apellido o email"
                  className="
                    w-full
                    rounded-3xl
                    px-5
                    py-4
                    outline-none
                    border
                    transition-all
                    placeholder:text-slate-500
                  "
                  style={{
                    background: 'rgba(15,23,42,0.7)',
                    borderColor: 'rgba(255,255,255,0.08)'
                  }}
                />

              </div>

              {/* ALERTA */}
              <div
                className="
                  rounded-3xl
                  p-5
                  mb-8
                  border
                "
                style={{
                  background: 'rgba(245,158,11,0.10)',
                  borderColor: 'rgba(245,158,11,0.15)'
                }}
              >

                <p className="font-semibold text-amber-300 mb-1">
                  ⚠ Cliente con plan vencido
                </p>

                <p className="text-sm text-amber-100/70">
                  Debe regularizar el pago para continuar.
                </p>

              </div>

              {/* PAGOS */}
              <div className="mb-8">

                <p className="text-sm text-slate-300 mb-3">
                  Forma de pago
                </p>

                <div className="grid grid-cols-2 gap-4">

                  <button
                    className="
                      py-4
                      rounded-3xl
                      font-semibold
                      transition-all
                      hover:scale-[1.02]
                    "
                    style={{
                      background:
                        'linear-gradient(135deg,#8A0BD2,#AF50E5)'
                    }}
                  >
                    Pago total
                  </button>

                  <button
                    className="
                      py-4
                      rounded-3xl
                      font-semibold
                      transition-all
                      hover:scale-[1.02]
                    "
                    style={{
                      background:
                        'linear-gradient(135deg,#14b8a6,#0f766e)'
                    }}
                  >
                    Pago con seña
                  </button>

                </div>

              </div>

              {/* BOTONES */}
              <div className="flex gap-4">

                <button
                  className="
                    flex-1
                    py-4
                    rounded-3xl
                    font-semibold
                    border
                    transition-all
                    hover:bg-white/5
                  "
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)'
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="
                    flex-1
                    py-4
                    rounded-3xl
                    font-bold
                    text-lg
                    transition-all
                    hover:scale-[1.01]
                  "
                  style={{
                    background:
                      'linear-gradient(135deg,#8A0BD2,#14b8a6)'
                  }}
                >
                  Confirmar reserva
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}