import { useEffect, useState } from "react";
import axios from "axios";

export default function PermisosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/usuarios/admin/permisos-pendientes");
      setUsuarios(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const aprobar = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/usuarios/admin/permisos/${id}/aprobar`);
      fetchPendientes();
    } catch (error) {
      console.log(error);
    }
  };

  const rechazar = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/usuarios/admin/permisos/${id}/rechazar`);
      fetchPendientes();
    } catch (error) {
      console.log(error);
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
                  onClick={() => aprobar(u.id_usuario)}
                  className="px-4 py-1 rounded-md text-white"
                  style={{ background: "#AF50E5" }}
                >
                  Aprobar
                </button>

                <button
                  onClick={() => rechazar(u.id_usuario)}
                  className="px-4 py-1 rounded-md text-white"
                  style={{ background: "#8A0BD2" }}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}