const BASE_URL = 'http://localhost:3001/api';

export const clasesService = {
    async getDisponibles() {
    const response = await fetch(`${BASE_URL}/clases/disponibles`);
    const data = await response.json();
    return data;
    },

    async getPorDia(dia) {
    const response = await fetch(`${BASE_URL}/clases/por-dia?dia=${dia}`);
    const data = await response.json();
    return data;
    }
};

export const reservasService = {
    async crearReserva(id_usuario, id_clase, tipo_pago) {
    const response = await fetch(`${BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario, id_clase, tipo_pago })
    });
    return await response.json();
    },

    async getMisReservas(id_usuario) {
    const response = await fetch(`${BASE_URL}/reservas/usuario/${id_usuario}`);
    return await response.json();
    }
};