const ClasesRepo = require('../../repositories/clasesRepository');

const diasMap = {
    'DOM': 'domingo', 'LUN': 'lunes', 'MAR': 'martes',
    'MIE': 'miercoles', 'JUE': 'jueves', 'VIE': 'viernes', 'SAB': 'sabado'
};

async function getDisponibles() {
    return await ClasesRepo.getDisponibles();
}

async function getPorDia(dia) {
    const nombreDia = diasMap[dia] || dia;
    return await ClasesRepo.getPorDia(nombreDia);
}

module.exports = { getDisponibles, getPorDia };