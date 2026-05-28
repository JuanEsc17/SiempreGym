import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const DIAS_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado'
};
const FORMATOS_VALIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMG_MB = 16;

function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-14 flex flex-col items-center pt-5 z-50"
      style={{ background: '#5B0672' }}>
      <span className="text-white text-2xl cursor-pointer">☰</span>
    </div>
  );
}

function Campo({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </label>
      {children}
      {error && <span className="text-xs mt-0.5" style={{ color: '#f87171' }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  background: '#2d2d3a',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
};

function StyledInput({ error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(focused ? { border: '1px solid #8A0BD2' } : {}),
        ...(error ? { border: '1px solid #f87171' } : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function StyledSelect({ error, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        ...(focused ? { border: '1px solid #8A0BD2' } : {}),
        ...(error ? { border: '1px solid #f87171' } : {}),
        appearance: 'none',
        cursor: 'pointer',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  if (!mensaje) return null;
  const bg = tipo === 'exito' ? '#16a34a' : '#dc2626';
  const icon = tipo === 'exito' ? '✓' : '✕';

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-2xl"
      style={{ background: bg, maxWidth: '360px' }}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: 'rgba(255,255,255,0.25)' }}>{icon}</span>
      <span>{mensaje}</span>
      <button onClick={onClose} className="ml-auto text-white opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
    </div>
  );
}

export default function EditarClase() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    actividad: '',
    dia: '',
    horario: '',
    duracion: '',
    cupo_maximo: '',
    id_profesor: '',
    id_sala: '',
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);
  const [profesores, setProfesores] = useState([]);
  const [salas, setSalas] = useState([]);

  // Cargar datos de la clase + profesores + salas
  useEffect(() => {
    async function cargar() {
      try {
        const [resClase, resProfesores, resSalas] = await Promise.all([
          axios.get(`${BASE_URL}/clases/${id}`),
          axios.get(`${BASE_URL}/clases/profesores`),
          axios.get(`${BASE_URL}/clases/salas`),
        ]);

        if (resClase.data.ok) {
          const c = resClase.data.data;
          setForm({
            actividad: c.actividad || '',
            dia: c.dia || '',
            horario: c.horario?.slice(0, 5) || '',
            duracion: c.duracion || '',
            cupo_maximo: c.cupo_maximo || '',
            id_profesor: c.id_profesor || '',
            id_sala: c.id_sala || '',
          });
        }
        if (resProfesores.data.ok) setProfesores(resProfesores.data.data);
        if (resSalas.data.ok) setSalas(resSalas.data.data);
      } catch {
        setToast({ mensaje: 'Error al cargar los datos de la clase', tipo: 'error' });
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }));
  }

  // Mapeo de actividades a imágenes predeterminadas
  const imagenesActividades = {
    yoga: 'Yoga2.png',
    pilates: 'Pilatesmq.png',
    funcional: 'Funcional.png'
  };

  function validar() {
    const e = {};
    if (!form.actividad) e.actividad = 'La actividad es obligatoria';
    if (!form.dia) e.dia = 'Seleccioná un día';
    if (!form.horario) e.horario = 'El horario es obligatorio';
    if (!form.duracion) {
      e.duracion = 'La duración es obligatoria';
    } else if (Number(form.duracion) <= 0) {
      e.duracion = 'La duración mínima debe ser mayor a 0';
    }
    if (!form.cupo_maximo) {
      e.cupo_maximo = 'El cupo es obligatorio';
    } else if (Number(form.cupo_maximo) <= 0) {
      e.cupo_maximo = 'El cupo máximo debe ser mayor a 0';
    }
    if (!form.id_profesor) e.id_profesor = 'Seleccioná un profesor';
    if (!form.id_sala) e.id_sala = 'Seleccioná una sala';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e_validacion = validar();
    if (Object.keys(e_validacion).length > 0) {
      setErrores(e_validacion);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      
      // Asignar imagen automática según actividad
      const nombreImagen = imagenesActividades[form.actividad];
      formData.append('imagen', nombreImagen);

      const res = await axios.put(`${BASE_URL}/clases/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.ok) {
        setToast({ mensaje: 'Clase actualizada exitosamente', tipo: 'exito' });
        setTimeout(() => navigate('/ver-clases-admin'), 2000);
      } else {
        setToast({ mensaje: res.data.mensaje, tipo: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al actualizar la clase';
      setToast({ mensaje: msg, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#1a1a2e' }}>
        <p className="text-white opacity-60">Cargando clase...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a2e' }}>
      <style>{`
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
        input[type="file"] { display: none; }
        select option { background: #2d2d3a; }
      `}</style>

      <Sidebar />

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}

      <div className="flex-1 pl-20 pr-6 py-6 max-w-3xl">

        <div className="border-b pb-3 mb-8" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#8A0BD2' }}>
            Panel de administración
          </p>
          <h1 className="text-3xl font-medium text-white">Editar clase</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Actividad */}
          <Campo label="Actividad" error={errores.actividad}>
            <StyledSelect name="actividad" value={form.actividad} onChange={handleChange} error={errores.actividad}>
              <option value="">Seleccionar actividad</option>
              <option value="yoga">Yoga</option>
              <option value="pilates">Pilates</option>
              <option value="funcional">Funcional</option>
            </StyledSelect>
          </Campo>

          {/* Día y Horario */}
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Día" error={errores.dia}>
              <StyledSelect name="dia" value={form.dia} onChange={handleChange} error={errores.dia}>
                <option value="">Seleccionar día</option>
                {DIAS.map(d => (
                  <option key={d} value={d}>{DIAS_LABEL[d]}</option>
                ))}
              </StyledSelect>
            </Campo>

            <Campo label="Horario" error={errores.horario}>
              <StyledInput
                type="time"
                name="horario"
                value={form.horario}
                onChange={handleChange}
                error={errores.horario}
              />
            </Campo>
          </div>

          {/* Duración y Cupo */}
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Duración (minutos)" error={errores.duracion}>
              <StyledInput
                type="number"
                name="duracion"
                placeholder="Ej: 60"
                min="1"
                value={form.duracion}
                onChange={handleChange}
                error={errores.duracion}
              />
            </Campo>

            <Campo label="Cupo máximo" error={errores.cupo_maximo}>
              <StyledInput
                type="number"
                name="cupo_maximo"
                placeholder="Ej: 30"
                min="1"
                value={form.cupo_maximo}
                onChange={handleChange}
                error={errores.cupo_maximo}
              />
            </Campo>
          </div>

          {/* Profesor */}
          <Campo label="Profesor" error={errores.id_profesor}>
            <StyledSelect name="id_profesor" value={form.id_profesor} onChange={handleChange} error={errores.id_profesor}>
              <option value="">Seleccionar profesor</option>
              {profesores.map(p => (
                <option key={p.id_usuario} value={p.id_usuario}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </StyledSelect>
          </Campo>

          {/* Sala */}
          <Campo label="Sala" error={errores.id_sala}>
            <StyledSelect name="id_sala" value={form.id_sala} onChange={handleChange} error={errores.id_sala}>
              <option value="">Seleccionar sala</option>
              {salas.map(s => (
                <option key={s.id_sala} value={s.id_sala}>
                  {s.nombre} — capacidad {s.capacidad}
                </option>
              ))}
            </StyledSelect>
          </Campo>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/ver-clases-admin')}
              className="py-3 rounded-xl font-medium text-sm border-none cursor-pointer transition-all"
              style={{ background: '#2d2d3a', color: 'rgba(255,255,255,0.7)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl text-white font-medium text-sm border-none cursor-pointer transition-all"
              style={{
                background: loading ? 'rgba(138,11,210,0.5)' : '#8A0BD2',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(138,11,210,0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}