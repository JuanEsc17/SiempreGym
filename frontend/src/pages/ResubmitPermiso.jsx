import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3000/api';

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = tipo === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      {mensaje}
    </div>
  );
}

export default function ResubmitPermiso() {
  const [permisoFile, setPermisoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir si no es un menor con permiso rechazado
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPermisoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!permisoFile) {
        setToast({ mensaje: 'Debes seleccionar un archivo', tipo: 'error' });
        setLoading(false);
        return;
      }

      if (!permisoFile.type.startsWith('image/')) {
        setToast({ mensaje: 'Debes subir una imagen válida', tipo: 'error' });
        setLoading(false);
        return;
      }

      if (permisoFile.size > 16 * 1024 * 1024) {
        setToast({ mensaje: 'La foto debe ocupar hasta 16MB', tipo: 'error' });
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append('permiso', permisoFile);

      const response = await fetch(
        `${BASE_URL}/usuarios/permisos/${user.id}/resubmit`,
        {
          method: 'PUT',
          body: form
        }
      );

      const data = await response.json();

      if (response.ok) {
        setToast({ mensaje: data.mensaje, tipo: 'success' });
        setTimeout(() => {
          navigate('/actividades');
        }, 2000);
      } else {
        setToast({ mensaje: data.error || 'Error al subir autorización', tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setToast({ mensaje: 'Error al conectar con el servidor', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-[Roboto] overflow-hidden">
      {/* Panel izquierdo */}
      <div className="w-1/2 bg-[#E2CEF6] overflow-y-auto flex flex-col justify-center items-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔄</div>
          <h1 className="text-3xl font-bold text-[#5B0672] mb-4">
            Reenviar Autorización
          </h1>
          <p className="text-gray-700 mb-6">
            Tu autorización anterior fue rechazada. Por favor, sube una nueva autorización firmada por un adulto.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Requisitos:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Debe ser una imagen clara y legible</li>
                <li>Debe estar firmada por un adulto responsable</li>
                <li>Tamaño máximo: 16MB</li>
                <li>Formato: JPG, PNG, etc.</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-1/2 bg-white overflow-y-auto flex flex-col justify-center items-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#5B0672] mb-6 text-center">
            Nueva Autorización
          </h2>

          {/* Input de archivo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#5B0672] mb-3">
              Selecciona tu autorización firmada
            </label>
            <div className="relative border-2 border-dashed border-[#8A0BD2] rounded-lg p-6 text-center hover:bg-[#E2CEF6]/20 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div>
                <div className="text-3xl mb-2">📄</div>
                {permisoFile ? (
                  <div>
                    <p className="text-[#5B0672] font-semibold">{permisoFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(permisoFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium">Click para seleccionar archivo</p>
                    <p className="text-xs text-gray-500 mt-1">o arrastra tu archivo aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/actividades')}
              className="flex-1 py-3 rounded-lg font-medium text-[#5B0672] bg-gray-200 hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-medium text-white transition-all"
              style={{
                background: loading ? 'rgba(138,11,210,0.5)' : '#8A0BD2'
              }}
            >
              {loading ? 'Subiendo...' : 'Subir Autorización'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
