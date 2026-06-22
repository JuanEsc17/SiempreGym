import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Ajusta según tu contexto

export default function QRViewer() {
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const obtenerQR = async () => {

    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/qr/usuario/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();

      if (data.ok) {
        setQrCode(data.codigo_qr);
      } else {
        setError(data.mensaje || 'Hubo un fallo generando su QR');
      }
    } catch (err) {
      setError('Error al obtener el QR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Mi Código QR</h2>
      
      {!qrCode ? (
        <button
          onClick={obtenerQR}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Cargando...' : 'Mostrar QR'}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <img src={qrCode} alt="QR Code" className="w-64 h-64 border-2 border-gray-300 p-2" />
          <button
            onClick={() => setQrCode(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Ocultar QR
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}