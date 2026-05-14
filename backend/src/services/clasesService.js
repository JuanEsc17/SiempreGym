const ClasesRepository = require('../../repositories/clasesRepository');

const diasMap = {
  'DOM': 'domingo', 'LUN': 'lunes', 'MAR': 'martes',
  'MIE': 'miercoles', 'JUE': 'jueves', 'VIE': 'viernes', 'SAB': 'sabado'
};

class ClasesService {
  constructor(db) {
    this.repo = new ClasesRepository(db);
  }

  async getDisponibles() {
    return await this.repo.getDisponibles();
  }

  async getPorDia(dia) {
    const nombreDia = diasMap[dia] || dia;
    return await this.repo.getPorDia(nombreDia);
  }
}

module.exports = ClasesService;