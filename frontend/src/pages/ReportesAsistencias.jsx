import { useState, useEffect } from 'react';
import reportesService from '../services/reportesService';
import '../styles/ReportesAsistencias.css';

export default function ReportesAsistencias() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clases, setClases] = useState([]);
  const [id_clase_seleccionada, setId_clase_seleccionada] = useState('todas');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [detalles, setDetalles] = useState(null);
  const [detallesCargando, setDetallesCargando] = useState(false);

  // Cargar lista de clases al montar el componente
  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/clases/todas');
      const data = await response.json();
      if (data.ok && data.data) {
        setClases(data.data);
      }
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  };

  // Formatear fecha para el input
  const formatearFechaParaInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Formatear fecha de DD/MM/YYYY a YYYY-MM-DD
  const convertirFecha = (fechaDDMMYYYY) => {
    const [day, month, year] = fechaDDMMYYYY.split('/');
    return `${year}-${month}-${day}`;
  };

  const generarReporte = async () => {
    setError(null);

    // Validaciones
    if (!fechaInicio || !fechaFin) {
      setError('Por favor ingresa un rango de fechas válido');
      return;
    }

    // Convertir fechas si están en formato DD/MM/YYYY
    let inicio = fechaInicio;
    let fin = fechaFin;

    if (fechaInicio.includes('/')) {
      inicio = convertirFecha(fechaInicio);
    }
    if (fechaFin.includes('/')) {
      fin = convertirFecha(fechaFin);
    }

    // Validar que inicio sea menor o igual a fin
    if (new Date(inicio) > new Date(fin)) {
      setError('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }

    setCargando(true);
    setReporte(null);
    setDetalles(null);
    setMostrarDetalles(false);

    try {
      const idClase = id_clase_seleccionada === 'todas' ? null : id_clase_seleccionada;
      const resultado = await reportesService.obtenerReporte(inicio, fin, idClase);

      if (resultado.ok) {
        setReporte(resultado);
        setError(null);
      } else {
        setReporte(resultado);
        setError(resultado.mensaje || 'Error al generar el reporte');
      }
    } catch (error) {
      console.error('Error:', error);
      setReporte(null);
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const cargarDetalles = async (id_clase, nombreClase) => {
    setDetallesCargando(true);

    try {
      let inicio = fechaInicio;
      let fin = fechaFin;

      if (fechaInicio.includes('/')) {
        inicio = convertirFecha(fechaInicio);
      }
      if (fechaFin.includes('/')) {
        fin = convertirFecha(fechaFin);
      }

      const resultado = await reportesService.obtenerDetalles(id_clase, inicio, fin);

      if (resultado.ok) {
        setDetalles({
          nombreClase,
          datos: resultado.data
        });
        setMostrarDetalles(true);
      } else {
        setError('Error al cargar los detalles');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setDetallesCargando(false);
    }
  };

  const formatearFechaDisplay = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  const obtenerEstadoColor = (estado) => {
    switch (estado) {
      case 'asistio':
        return 'bg-green-100 text-green-800';
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerEstadoTexto = (estado) => {
    switch (estado) {
      case 'asistio':
        return 'Asistió';
      case 'reservada':
        return 'No asistió';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#1a1a2e' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b pb-4 mb-8" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#8A0BD2' }}>
            Herramientas de análisis
          </p>
          <h1 className="text-4xl font-bold text-white mb-2">Reportes de Asistencias</h1>
          <p className="text-gray-400">Visualiza las asistencias por rango de fechas</p>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Selecciona los filtros</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Fecha Inicio */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Fecha de fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Selector de Clase */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Clase
              </label>
              <select
                value={id_clase_seleccionada}
                onChange={(e) => setId_clase_seleccionada(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              >
                <option value="todas">Todas las clases</option>
                {clases.map((clase) => (
                  <option key={clase.id_clase} value={clase.id_clase}>
                    {clase.actividad}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Generar */}
            <div className="flex items-end">
              <button
                onClick={generarReporte}
                disabled={cargando}
                className="w-full px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#8A0BD2' }}
              >
                {cargando ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Resultados del Reporte */}
        {reporte && !reporte.tieneClientes && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-yellow-500">
            <p className="text-yellow-200 font-medium">{reporte.mensaje || 'No hay asistencias disponibles para el período seleccionado.'}</p>
          </div>
        )}

        {reporte && reporte.tieneClientes && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border-l-4" style={{ borderColor: '#8A0BD2' }}>
                <p className="text-gray-400 text-sm">Rango de fechas</p>
                <p className="text-white text-xl font-bold">
                  {formatearFechaDisplay(reporte.fechaInicio)} - {formatearFechaDisplay(reporte.fechaFin)}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border-l-4" style={{ borderColor: '#5B0672' }}>
                <p className="text-gray-400 text-sm">Clases reportadas</p>
                <p className="text-white text-xl font-bold">{reporte.clasesReportadas}</p>
              </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr style={{ background: '#5B0672' }}>
                      <th className="px-6 py-3 text-left font-semibold">Clase</th>
                      <th className="px-6 py-3 text-center font-semibold">Total Inscritos</th>
                      <th className="px-6 py-3 text-center font-semibold">Asistencias</th>
                      <th className="px-6 py-3 text-center font-semibold">% Asistencias</th>
                      <th className="px-6 py-3 text-center font-semibold">Inasistencias</th>
                      <th className="px-6 py-3 text-center font-semibold">% Inasistencias</th>
                      <th className="px-6 py-3 text-center font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.data.map((clase, index) => (
                      <tr
                        key={clase.id_clase}
                        className="border-b"
                        style={{
                          borderColor: 'rgba(255,255,255,0.1)',
                          background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                        }}
                      >
                        <td className="px-6 py-4">{clase.actividad}</td>
                        <td className="px-6 py-4 text-center">{clase.totalInscritos}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-green-500 bg-opacity-20 text-green-300 px-3 py-1 rounded-full text-sm">
                            {clase.asistencias}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-semibold">
                            {clase.porcentajeAsistencias}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-yellow-500 bg-opacity-20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                            {clase.inasistencias}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-yellow-400 font-semibold">
                            {clase.porcentajeInasistencias}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => cargarDetalles(clase.id_clase, clase.actividad)}
                            disabled={detallesCargando}
                            className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors disabled:opacity-50"
                          >
                            Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal de Detalles */}
            {mostrarDetalles && detalles && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                  {/* Header del Modal */}
                  <div className="sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                      Detalles: {detalles.nombreClase}
                    </h3>
                    <button
                      onClick={() => setMostrarDetalles(false)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    {detalles.datos.length === 0 ? (
                      <p className="text-gray-400">No hay registros de asistencia para este período.</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {detalles.datos.map((asistencia, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {asistencia.nombre} {asistencia.apellido}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {formatearFechaDisplay(asistencia.fecha_clase)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerEstadoColor(asistencia.estado)}`}>
                                {obtenerEstadoTexto(asistencia.estado)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado de Carga */}
        {cargando && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Generando reporte...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
