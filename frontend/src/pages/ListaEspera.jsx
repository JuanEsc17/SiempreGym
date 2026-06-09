import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000/api';
const UPLOADS_URL = 'http://localhost:3000/uploads';

const DIAS = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const formatFecha = (fecha) => {
  if (!fecha) return '';

  const d = new Date(fecha);

  return `${d.getDate()} de ${
    MESES[d.getMonth()]
  } ${d.getFullYear()}`;
};

export default function ListaEspera() {
  const navigate = useNavigate();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLista();
  }, []);

  const cargarLista = async () => {
    try {
      const usuario = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      const idUsuario =
        usuario.id || usuario.id_usuario;

      if (!idUsuario) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${BASE_URL}/lista-espera/usuario/${idUsuario}`
      );

      const data = await response.json();

      if (data.ok) {
        setLista(data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#12121f',
        padding: '32px 40px',
        fontFamily: 'system-ui,sans-serif'
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        ← Volver
      </button>

      <h1
        style={{
          color: 'white',
          fontSize: 26,
          fontWeight: 'bold',
          margin: '0 0 4px'
        }}
      >
        Lista de Espera
      </h1>

      <p
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 13,
          margin: '0 0 28px'
        }}
      >
        Consultá tu posición en las clases sin cupos disponibles
      </p>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 80
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              border: '3px solid rgba(138,11,210,0.25)',
              borderTopColor: '#8A0BD2',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 1s linear infinite'
            }}
          />

          <p style={{ color: 'white' }}>
            Cargando lista de espera...
          </p>
        </div>
      ) : lista.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            paddingTop: 100
          }}
        >
          <div
            style={{
              fontSize: 60,
              marginBottom: 15
            }}
          >
            📭
          </div>

          <h3
            style={{
              color: 'white',
              marginBottom: 10
            }}
          >
            No estás anotado en ninguna lista de espera
          </h3>

          <p
            style={{
              color: 'rgba(255,255,255,0.4)'
            }}
          >
            Cuando una clase esté completa y te anotes,
            aparecerá aquí.
          </p>
        </div>
      ) : (
        <>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 14
            }}
          >
            Mis listas de espera

            <span
              style={{
                color: 'rgba(255,255,255,0.25)',
                marginLeft: 8,
                fontWeight: 'normal'
              }}
            >
              ({lista.length})
            </span>
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {lista.map((item) => {
              const colorEstado =
                item.estado === 'esperando'
                  ? '#b7b2a9'
                  : item.estado === 'notificado'
                  ? '#10b981'
                  : '#ef4444';

              return (
                <div
                  key={item.id_lista}
                  style={{
                    background: '#1a1a2e',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border:
                      '1px solid rgba(255,255,255,0.08)',
                    display: 'flex'
                  }}
                >
                  <div
                    style={{
                      width: 100,
                      flexShrink: 0,
                      background: '#5B0672',
                      overflow: 'hidden'
                    }}
                  >
                    {item.imagen && (
                      <img
                        src={`${UPLOADS_URL}/${item.imagen}`}
                        alt={item.actividad}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>

                  <div
                  style={{
                  flex: 1,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center'
                  }}
                  >
                  <div style={{ width: '100%' }}>
                  {/* FILA SUPERIOR */}
                  <div
                  style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap'
                  }}
                  >
                  <h3
                  style={{
                  color: 'white',
                  margin: 0,
                  fontSize: 18,
                  textTransform: 'capitalize'
                  }}
                  >
                  {item.actividad}
                  </h3>

                  <span
                  style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 15
                  }}
                  >
                  {DIAS[item.dia] || item.dia} •{' '}
                  {item.horario?.slice(0, 5)} hs
                  </span>

                {/* POSICIÓN */}
                <span
                style={{
                color:
                item.posicion === 1
                ? '#7f9a92'
                : '#AF50E5',
                fontWeight: 'bold',
                fontSize: 14
                }}
                >
                {item.posicion === 1 ? '🥇' : '👥'} Posición #{item.posicion}
                </span>

              {/* ESTADO */}
                <span
                style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(245,158,11,0.12)',
                color: colorEstado,
                border: `1px solid ${colorEstado}40`,
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 'bold'
                }}
               >
              ⏳ {item.estado}
                </span>
              </div>

              {/* FILA INFERIOR */}
              <div
              style={{
              marginTop: 10
              }}
              >
            <p
            style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 12,
            margin: 0
            }}
            >
          📅 Ingresaste el{' '}
            {formatFecha(item.fecha_ingreso)}
            </p>

            {item.posicion === 1 ? (
            <p
            style={{
            color: '#68aa94',
            fontSize: 13,
            marginTop: 8,
            marginBottom: 0,
            fontWeight: 600
            }}
            >
            • Sos el próximo en ingresar cuando se libere un cupo
            </p>
          ) : (
          <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            marginTop: 8,
            marginBottom: 0
          }}
        >
          👥 Hay {item.posicion - 1} persona(s)
          delante tuyo
        </p>
                  )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}