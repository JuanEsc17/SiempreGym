import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';

const COLORES_ACTIVIDAD = [
  '#8A0BD2', '#a855f7', '#f97316', '#14b8a6', '#eab308', '#3b82f6', '#ec4899'
];

const formatearMonto = (valor) => {
  if (!valor && valor !== 0) return '$0';
  return '$' + Number(valor).toLocaleString('es-AR');
};

const formatearFechaDisplay = (fecha) => {
  if (!fecha) return '';
  const str = typeof fecha === 'string' ? fecha : new Date(fecha).toISOString();
  const [year, month, day] = str.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

export default function ReportesIngresos() {
  const navigate = useNavigate();
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [actividad, setActividad] = useState('');
  const [actividades, setActividades] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/reportes/ingresos/actividades`);
      const data = await res.json();
      if (data.ok) setActividades(data.data);
    } catch (err) {
      console.error('Error al cargar actividades:', err);
    }
  };

  const generarReporte = async () => {
    setError(null);
    if (!fechaDesde || !fechaHasta) {
      setError('Por favor ingresá un rango de fechas');
      return;
    }
    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      setError('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }

    setCargando(true);
    setReporte(null);

    try {
      const params = new URLSearchParams({ fechaDesde, fechaHasta });
      if (actividad) params.append('actividad', actividad);

      const res = await fetch(`${BASE_URL}/api/reportes/ingresos?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      setReporte(data);
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  // Datos derivados
  const metricas = reporte?.metricas || {};

  const totalActividad = reporte?.por_actividad?.reduce((sum, a) => sum + Number(a.ingreso), 0) || 0;
  const actividadConPorcentaje = reporte?.por_actividad?.map(a => ({
    ...a,
    ingreso: Number(a.ingreso),
    mensuales: Number(a.mensuales) || 0,
    individuales: Number(a.individuales) || 0,
    porcentaje: totalActividad > 0 ? Math.round((Number(a.ingreso) / totalActividad) * 100) : 0
  })) || [];

  // Filas filtradas — toLowerCase para evitar problemas de mayúsculas/minúsculas
  const filasMostradas = actividad
    ? actividadConPorcentaje.filter(
        a => a.actividad.toLowerCase() === actividad.toLowerCase()
      )
    : actividadConPorcentaje;

  // Métricas de cards: si hay filtro usar filasMostradas, si no usar backend
  const ingresoTotal = actividad
    ? filasMostradas.reduce((s, a) => s + a.ingreso, 0)
    : Number(metricas.ingreso_total) || 0;

  const totalReservas = actividad
    ? filasMostradas.reduce((s, a) => s + Number(a.cantidad), 0)
    : Number(metricas.total_reservas) || 0;

  const mensuales = actividad
    ? filasMostradas.reduce((s, a) => s + a.mensuales, 0)
    : Number(metricas.mensuales) || 0;

  const individuales = actividad
    ? filasMostradas.reduce((s, a) => s + a.individuales, 0)
    : Number(metricas.individuales) || 0;

  const pctMensual = totalReservas > 0 ? Math.round((mensuales / totalReservas) * 100) : 0;
  const pctIndividual = totalReservas > 0 ? Math.round((individuales / totalReservas) * 100) : 0;

  const hayDatos = reporte !== null;

  return (
    <div className="min-h-screen p-6" style={{ background: '#1a1a2e' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="border-b pb-4 mb-8" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm"
          >
            ← Volver al panel
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Reporte de Ingresos</h1>
          <p className="text-gray-400">
            Visualiza el detalle de los ingresos del gimnasio en el período seleccionado
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span style={{ color: '#8A0BD2' }}>▼</span> Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Fecha desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Fecha hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Actividad</label>
              <select
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              >
                <option value="">Todas</option>
                {actividades.map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generarReporte}
                disabled={cargando}
                className="w-full px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#8A0BD2' }}
              >
                {cargando ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                    Generando...
                  </>
                ) : '▼ Generar Reporte'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Resultados */}
        {hayDatos && (
          <div className="space-y-6">

            {/* 4 Cards métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Ingreso Total */}
              <div className="bg-gray-800 rounded-lg p-5 border-l-4" style={{ borderColor: '#8A0BD2' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: 'rgba(138,11,210,0.25)' }}
                  >$</div>
                  <p className="text-gray-400 text-sm">Ingreso Total</p>
                </div>
                <p className="text-white text-2xl font-bold">{formatearMonto(ingresoTotal)}</p>
                {actividad && <p className="text-purple-400 text-xs mt-1">{actividad}</p>}
              </div>

              {/* Reservas */}
              <div className="bg-gray-800 rounded-lg p-5 border-l-4" style={{ borderColor: '#5B0672' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{ background: 'rgba(91,6,114,0.3)' }}
                  >💳</div>
                  <p className="text-gray-400 text-sm">Reservas</p>
                </div>
                <p className="text-white text-2xl font-bold">{totalReservas}</p>
                <p className="text-gray-500 text-xs mt-1">Total de reservas</p>
              </div>

              {/* Mensuales */}
              <div className="bg-gray-800 rounded-lg p-5 border-l-4" style={{ borderColor: '#14b8a6' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{ background: 'rgba(20,184,166,0.2)' }}
                  >📅</div>
                  <p className="text-gray-400 text-sm">Mensuales</p>
                </div>
                <p className="text-white text-2xl font-bold">{mensuales}</p>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs mb-1">{pctMensual}% del total</p>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pctMensual}%`, background: '#14b8a6' }}
                    />
                  </div>
                </div>
              </div>

              {/* Individuales */}
              <div className="bg-gray-800 rounded-lg p-5 border-l-4" style={{ borderColor: '#a855f7' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{ background: 'rgba(168,85,247,0.2)' }}
                  >👤</div>
                  <p className="text-gray-400 text-sm">Individuales</p>
                </div>
                <p className="text-white text-2xl font-bold">{individuales}</p>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs mb-1">{pctIndividual}% del total</p>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pctIndividual}%`, background: '#a855f7' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla detalle por actividad */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-semibold">Detalle por actividad</h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  {formatearFechaDisplay(fechaDesde)} — {formatearFechaDisplay(fechaHasta)}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr style={{ background: '#5B0672' }}>
                      <th className="px-6 py-3 text-left font-semibold text-sm">Actividad</th>
                      <th className="px-6 py-3 text-center font-semibold text-sm">Reservas</th>
                      <th className="px-6 py-3 text-center font-semibold text-sm">Ingreso</th>
                      <th className="px-6 py-3 text-left font-semibold text-sm">% del total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasMostradas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-gray-400 text-lg mb-1">Sin ingresos registrados</p>
                          <p className="text-gray-600 text-sm">
                            No hay reservas para{' '}
                            <span className="text-purple-400">{actividad}</span>{' '}
                            en el período seleccionado
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filasMostradas.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b"
                          style={{
                            borderColor: 'rgba(255,255,255,0.06)',
                            background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: COLORES_ACTIVIDAD[index % COLORES_ACTIVIDAD.length] }}
                              />
                              <span>{item.actividad}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-300">{item.cantidad}</td>
                          <td className="px-6 py-4 text-center font-semibold">{formatearMonto(item.ingreso)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${item.porcentaje}%`,
                                    background: COLORES_ACTIVIDAD[index % COLORES_ACTIVIDAD.length]
                                  }}
                                />
                              </div>
                              <span className="text-gray-400 text-sm w-10 text-right">{item.porcentaje}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {filasMostradas.length > 0 && (
                    <tfoot>
                      <tr style={{ background: 'rgba(138,11,210,0.15)', borderTop: '1px solid rgba(138,11,210,0.3)' }}>
                        <td className="px-6 py-4 font-semibold text-purple-300">Total</td>
                        <td className="px-6 py-4 text-center font-semibold text-purple-300">
                          {filasMostradas.reduce((s, a) => s + Number(a.cantidad), 0)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-white text-lg">
                          {formatearMonto(filasMostradas.reduce((s, a) => s + a.ingreso, 0))}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">100%</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Loading */}
        {cargando && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: '#8A0BD2' }}
              ></div>
              <p className="text-gray-400">Generando reporte...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}