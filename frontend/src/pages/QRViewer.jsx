import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Ajusta según tu contexto

import { useNavigate } from "react-router-dom"; 

export default function QRViewer() {
  const navigate = useNavigate();
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
    <div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{ background: "#1a1a2e" }}
      >
      <div className="absolute top-6 right-6">
  <button
    onClick={() => navigate("/actividades")} 
    className="px-4 py-2 rounded-xl text-white font-medium cursor-pointer transition-all duration-200 hover:brightness-75"
    style={{
      background: "#8A0BD2",
      border: "none",
    }}
  >
    ← Volver
  </button>
</div>
      <h2 className="text-white text-2xl font-bold mb-6">
        Mi Código QR
      </h2>
      
      {!qrCode ? (
        <button
          onClick={obtenerQR}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-white font-medium cursor-pointer transition-all duration-200 hover:brightness-75"
style={{
  background: "#8A0BD2",
  border: "none",
}}
        >
          {loading ? 'Cargando...' : 'Mostrar QR'}
        </button>
      ) : (
        <div
  className="p-8 rounded-2xl flex flex-col items-center"
  style={{
    background: "#252540",
    border: "2px solid #8A0BD2",
  }}
>
          <img src={qrCode} alt="QR Code" className="w-64 h-64 border-2 border-gray-300 p-2" />
          <button
  onClick={() => setQrCode(null)}
  className="mt-4 px-4 py-2 rounded-xl text-white font-medium cursor-pointer transition-all duration-200 hover:brightness-75"
  style={{
    background: "#8A0BD2",
    border: "none",
  }}
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