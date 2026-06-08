const ListaEsperaRepository=
require("../repositories/listaEsperaRepository");

const db = require("../src/db");

const repo=
new ListaEsperaRepository(db);


const ingresar= async(req,res)=>{

try{

const{
idUsuario,
idClase,
tipoReserva
}=req.body;

if(
 !idUsuario ||
 !idClase ||
 !tipoReserva
){

 return res.status(400)
 .json({
   error:"Faltan datos"
 });

}


// evitar repetidos
if( await repo.existeEnLista(
    idUsuario,
    idClase,
    tipoReserva
    )
){
return res.status(400)
.json({ error: "Ya estás anotado en lista de espera" });
}


const ultima= await repo.obtenerUltimaPosicion(idClase,tipoReserva);

const posicion= ultima+1;


await repo.agregar({

idUsuario,
idClase,
tipoReserva,
posicion

});


return res.status(201)
.json({mensaje: "Ingresado a lista de espera", posicion});

}catch(error){

console.log(error);

return res.status(500)
.json({error:"Error interno del servidor"});
}

};

const obtenerPosicion = async (req, res) => {

  try {

    const {
      idUsuario,
      idClase,
      tipoReserva
    } = req.query;

    const posicion = await repo.obtenerPosicion(
      idUsuario,
      idClase,
      tipoReserva
    );

    if (!posicion) {
      return res.status(404).json({
        ok: false,
        mensaje: "No perteneces a esta lista de espera"
      });
    }

    return res.json({
      ok: true,
      posicion: posicion.posicion
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor"
    });

  }
};

const obtenerPorUsuario = async (req, res) => {

  try {

    const { idUsuario } = req.params;

    const lista = await repo.obtenerPorUsuario(idUsuario);

    return res.json({
      ok: true,
      data: lista
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno"
    });

  }
};


module.exports={
 ingresar,
 obtenerPosicion,
 obtenerPorUsuario
};