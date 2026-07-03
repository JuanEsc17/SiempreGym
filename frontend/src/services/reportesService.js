const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const reportesService = {
  
  /**
   * Obtiene el reporte de asistencias por rango de fechas
   * @param {string} fechaInicio - Formato YYYY-MM-DD
   * @param {string} fechaFin - Formato YYYY-MM-DD
   * @param {number|null} id_clase - ID de la clase o null para todas
   * @returns {Promise<Object>} Reporte de asistencias
   */
  obtenerReporte: async (fechaInicio, fechaFin, actividad = null) => {
    try {
      let url = `${API_URL}/reportes/asistencias?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      
      if (actividad) {
        url += `&actividad=${encodeURIComponent(actividad)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el reporte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerReporte:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles específicos de asistencias para una clase
   * @param {number} id_clase - ID de la clase
   * @param {string} fechaInicio - Formato YYYY-MM-DD
   * @param {string} fechaFin - Formato YYYY-MM-DD
   * @returns {Promise<Object>} Detalles de asistencias
   */
  obtenerDetalles: async (id_clase, fechaInicio, fechaFin) => {
    try {
      const url = `${API_URL}/reportes/asistencias/detalles?id_clase=${id_clase}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los detalles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerDetalles:', error);
      throw error;
    }
  }
};

export default reportesService;
