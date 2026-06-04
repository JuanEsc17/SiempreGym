import { useEffect, useState } from "react";
import axios from "axios";

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

export default function PermisosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/usuarios/admin/permisos-pendientes");
      setUsuarios(res.data.data);
    } catch (error) {
      console.log(error);
      setToast({ mensaje: 'Error al cargar permisos', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const aprobar = async (id, nombre) => {
    try {
      setActionLoading(id);
      await axios.put(`http://localhost:3000/api/usuarios/admin/permisos/${id}/aprobar`);
      setToast({ mensaje: `✅ Permiso de ${nombre} aprobado y email enviado`, tipo: 'success' });
      fetchPendientes();
    } catch (error) {
      console.log(error);
      setToast({ mensaje: 'Error al aprobar permiso', tipo: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const rechazar = async (id, nombre) => {
    try {
      setActionLoading(id);
      await axios.put(`http://localhost:3000/api/usuarios/admin/permisos/${id}/rechazar`);
      setToast({ mensaje: `❌ Permiso de ${nombre} rechazado y email enviado`, tipo: 'success' });
      fetchPendientes();
    } catch (error) {
      console.log(error);
      setToast({ mensaje: 'Error al rechazar permiso', tipo: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a1a2e" }}>
        <p className="text-white">Cargando permisos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "#1a1a2e" }}>
      <h1 className="text-2xl font-bold text-white mb-6">
        Permisos pendientes
      </h1>

      {usuarios.length === 0 ? (
        <p className="text-white/70">No hay permisos pendientes</p>
      ) : (
        <div className="grid gap-4">
          {usuarios.map((u) => (
            <div
              key={u.id_usuario}
              className="p-4 rounded-xl flex flex-col gap-2"
              style={{ background: "#5B0672" }}
            >
              <div className="text-white font-semibold">
                {u.nombre} {u.apellido}
              </div>

              <div className="text-white/70 text-sm">
                {u.email}
              </div>

              <div className="text-white/70 text-sm">
                DNI: {u.dni}
              </div>

              {/* FOTO */}
              {u.foto_autorizacion && (
                <img
                    src={`http://localhost:3000/uploads/${u.foto_autorizacion}`}
                    alt="Autorización"
                    style={{
                        maxWidth: "200px",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                />
              )}

              {/* BOTONES */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => aprobar(u.id_usuario, u.nombre)}
                  disabled={actionLoading === u.id_usuario}
                  className="px-4 py-1 rounded-md text-white transition-opacity disabled:opacity-50"
                  style={{ background: "#AF50E5" }}
                >
                  {actionLoading === u.id_usuario ? 'Procesando...' : 'Aprobar'}
                </button>

                <button
                  onClick={() => rechazar(u.id_usuario, u.nombre)}
                  disabled={actionLoading === u.id_usuario}
                  className="px-4 py-1 rounded-md text-white transition-opacity disabled:opacity-50"
                  style={{ background: "#8A0BD2" }}
                >
                  {actionLoading === u.id_usuario ? 'Procesando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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