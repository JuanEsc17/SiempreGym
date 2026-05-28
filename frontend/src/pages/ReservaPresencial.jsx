import { useEffect, useState } from 'react';
//import axios from "axios";

//const BASE_URL = "http://localhost:3000/api";

export default function ReservaPresencial() {

  const [clases,setClases]=useState([]);
  const [claseSeleccionada,setClaseSeleccionada]= useState(null);

  const [busqueda,setBusqueda]=useState("");
  const [usuarios,setUsuarios]=useState([]);
  const [usuarioSeleccionado,setUsuarioSeleccionado]=useState(null);

  const [tipoReserva,setTipoReserva]=useState("INDIVIDUAL");
  const [tipoPago,setTipoPago]=useState("TOTAL");

  const [resultado,setResultado]=useState(null);



  //=============================
  // TRAER CLASES REALES
  //=============================

  useEffect(()=>{

    const obtenerClases=async()=>{

      try{

        const response=
        await fetch(
        "http://localhost:3000/api/clases/todas"
        );

        const data=
        await response.json();

        if(data.ok){

          setClases(data.data);
          console.log(data.data);

        }

      }
      catch(error){

        console.log(
        "Error clases:",
        error
        );

      }

    }

    obtenerClases();

  },[]);



  //=============================
  // BUSCADOR USUARIOS
  //=============================

  useEffect(()=>{

    const buscarUsuario=async()=>{

      if(busqueda.length<3){

        setUsuarios([]);
        return;

      }

      try{

        const response=
        await fetch(
        `http://localhost:3000/api/usuarios/buscar?query=${busqueda}`
        );

        const data=
        await response.json();

        if(data.ok){

          setUsuarios(data.data);

        }

      }

      catch(error){

        console.log(error);

      }

    }

    const timer=
    setTimeout(
      buscarUsuario,
      400
    );

    return()=>clearTimeout(timer);

  },[busqueda]);

  //
  // CALCULAR PRÓXIMA OCURRENCIA
  //

  const obtenerProximaFecha = (diaClase) => {

  const dias = {
    domingo:0,
    lunes:1,
    martes:2,
    miercoles:3,
    jueves:4,
    viernes:5,
    sabado:6
  };

  const hoy = new Date();

  const fecha = new Date();

  let diferencia =
    dias[diaClase.toLowerCase()] -
    hoy.getDay();

  if(diferencia <= 0){
    diferencia += 7;
  }

  fecha.setDate(
    hoy.getDate()+diferencia
  );

  return fecha
    .toISOString()
    .split("T")[0];
  };



  //=============================
  // VERIFICAR
  //=============================

  const verificarReserva=async()=>{

    try{

      if(!usuarioSeleccionado){

        alert(
        "Seleccione un usuario"
        );

        return;

      }

      if(!claseSeleccionada){

        alert(
        "Seleccione una clase"
        );

        return;

      }

      let endpoint="";
      let body={};

      if(
      tipoReserva==="INDIVIDUAL"
      ){

        endpoint=
        "http://localhost:3000/api/reservas/verificar-individual";

        body={

          id_usuario:
          usuarioSeleccionado.id_usuario,

          id_clase:
          claseSeleccionada.id_clase,

          fecha_clase:
          obtenerProximaFecha(
          claseSeleccionada.dia
          )

        };

      }

      else{

        const hoy=
        new Date();

        endpoint=
        "http://localhost:3000/api/reservas/verificar-mensual";

        body={

          id_usuario:
          usuarioSeleccionado.id_usuario,

          id_clase:
          claseSeleccionada.id_clase,

          mes:
          hoy.getMonth()+1,

          anio:
          hoy.getFullYear(),
          
          esPresencial:
          true

        };

      }

      const response=
      await fetch(
      endpoint,
      {

      method:"POST",

      headers:{
      "Content-Type":
      "application/json"
      },

      body:
      JSON.stringify(body)

      });

      const data=
      await response.json();

      setResultado(data);

      alert(data.mensaje);

    }

    catch(error){

      console.log(error);

    }

  };



  //=============================
  // CONFIRMAR
  //=============================

  const confirmarReserva=async()=>{

    console.log("RESULTADO VERIFICAR:", resultado);

    try{

      let endpoint="";
      let body={};

      if(
      tipoReserva==="INDIVIDUAL"
      ){

        endpoint=
        "http://localhost:3000/api/reservas/crear";

        body={

          id_usuario:
          usuarioSeleccionado.id_usuario,

          id_clase:
          claseSeleccionada.id_clase,

          id_instancia:
          resultado.id_instancia,

          fecha_clase:
          obtenerProximaFecha(
          claseSeleccionada.dia
          ),

          tipo_pago:
          tipoPago,

          precio_total:
          resultado.monto

        };

      }

      else{

        endpoint=
        "http://localhost:3000/api/reservas/crear-mensual";

        body={

          id_usuario:
          usuarioSeleccionado.id_usuario,

          id_clase:
          claseSeleccionada.id_clase,

          fechas:
          resultado.fechas,

          monto_total:
          resultado.monto

        };

      }

      const response=
      await fetch(
      endpoint,
      {

      method:"POST",

      headers:{
      "Content-Type":
      "application/json"
      },

      body:
      JSON.stringify(body)

      });

      const data=
      await response.json();

      alert(
      data.mensaje
      );

    }

    catch(error){

      console.log(error);

    }

  };



return (

<div
className="
min-h-screen
text-white
font-[Roboto]
p-6
"
style={{
background:
'linear-gradient(135deg,#5B0672 0%,#8A0BD2 50%,#12061b 100%)'
}}
>

<div className="flex gap-6">

{/* PANEL IZQUIERDO */}

<div
className="
w-[40%]
rounded-[34px]
p-6
backdrop-blur-xl
"
style={{
background:'rgba(255,255,255,.05)'
}}
>

<h2
className="
text-3xl
font-bold
mb-6
"
>
Clases disponibles
</h2>

<div
className="
flex
flex-col
gap-4
"
>

{clases.map(clase => (

<div
key={clase.id_clase}
onClick={()=>
setClaseSeleccionada(clase)
}
className="
rounded-3xl
p-5
cursor-pointer
transition-all
"
style={{
background:
claseSeleccionada?.id_clase===clase.id_clase
? 'rgba(226,206,246,.18)'
: 'rgba(255,255,255,.04)'
}}
>

<img
src={`http://localhost:3000/uploads/${clase.imagen}`}
alt={clase.actividad}
className="
w-full
h-40
rounded-2xl
object-cover
mb-4
"
onError={(e)=>{
e.target.style.display='none'
}}
/>

<h2
className="
text-2xl
font-bold
"
>
{clase.actividad}
</h2>

<p className="text-[#E2CEF6]">
{clase.dia} · {clase.horario?.slice(0,5)} hs
</p>

<div
className="
flex
justify-between
mt-4
"
>

<p>
Duración: {clase.duracion} min
</p>

<p>
Cupos: {clase.cupo_maximo}
</p>

</div>

</div>

))}

</div>

</div>


{/* PANEL DERECHO */}

<div
className="
flex-1
rounded-[34px]
p-7
backdrop-blur-xl
"
style={{
background:'rgba(255,255,255,.05)'
}}
>

<h1
className="
text-4xl
font-bold
mb-6
"
>
Reserva presencial
</h1>

<input
placeholder="Username o email"
value={busqueda}
onChange={(e)=>
setBusqueda(e.target.value)
}
className="
w-full
rounded-3xl
px-5
py-4
text-white
outline-none
"
style={{
background:'rgba(255,255,255,.06)'
}}
/>


{usuarios.map(usuario=>(

<div
key={usuario.id_usuario}

onClick={()=>{

setUsuarioSeleccionado(usuario);
setBusqueda(usuario.username);
setUsuarios([]);

}}

className="
p-4
mt-2
rounded-2xl
cursor-pointer
"

style={{
background:'rgba(217,128,249,.15)'
}}
>

{usuario.username}

<span className="text-[#E2CEF6]">
({usuario.email})
</span>

</div>

))}


{usuarioSeleccionado&&(

<div
className="
mt-5
p-4
rounded-3xl
"
style={{
background:'rgba(138,11,210,.25)'
}}
>

Cliente:

<b>
{usuarioSeleccionado.username}
</b>

</div>

)}


<div className="mt-5">

<select

value={tipoReserva}

onChange={(e)=>
setTipoReserva(e.target.value)
}

className="
w-full
rounded-3xl
p-4
text-white
"

style={{
background:'#5B0672'
}}
>

<option value="INDIVIDUAL">
Individual
</option>

<option value="MENSUAL">
Mensual
</option>

</select>

</div>


{tipoReserva==="INDIVIDUAL" && (

<div className="mt-5">

<select

value={tipoPago}

onChange={(e)=>
setTipoPago(e.target.value)
}

className="
w-full
rounded-3xl
p-4
text-white
"

style={{
background:'#8A0BD2'
}}
>

<option value="TOTAL">
Pago total
</option>

</select>

</div>

)}

{tipoReserva==="MENSUAL" && (

<div className="mt-5">

<select

className="
w-full
rounded-3xl
p-4
text-white
"

style={{
background:'#8A0BD2'
}}

disabled

>

<option value="TOTAL">
Pago total
</option>

</select>

</div>

)}


<div
className="
flex
gap-4
mt-8
"
>

<button

onClick={verificarReserva}

className="
flex-1
py-4
rounded-3xl
font-bold
"

style={{
background:
'linear-gradient(135deg,#AF50E5,#8A0BD2)'
}}
>

Verificar

</button>


{resultado?.ok&&(

<button

onClick={confirmarReserva}

className="
flex-1
py-4
rounded-3xl
font-bold
"

style={{
background:
'linear-gradient(135deg,#D980F9,#AF50E5)'
}}
>

Confirmar

</button>

)}

</div>

</div>

</div>

</div>

);

}