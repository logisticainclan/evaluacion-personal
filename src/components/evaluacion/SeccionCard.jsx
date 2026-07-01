import ItemCalificacion from "./ItemCalificacion";
function SeccionCard({
  seccion,
  items,
  niveles,
  respuestas,
  setRespuestas,
  disabled = false
}) {

  const itemsSeccion = items.filter(
    i => i.seccion_id === seccion.id
  )

  return (

    <div className="seccion-card">

      <div className="seccion-header">

        <h2>{seccion.nombre}</h2>

        <span>

          {Object.keys(respuestas).length} respuestas

        </span>

      </div>

      {

        itemsSeccion.map((item,index)=>(

          <div
            className="indicador-card"
            key={item.id}
          >

            <div className="indicador-numero">

              Indicador {index+1} de {itemsSeccion.length}

            </div>

            <ItemCalificacion
              item={item}
              niveles={niveles}
              respuestas={respuestas}
              setRespuestas={setRespuestas}
              disabled={disabled}
            />

          </div>

        ))

      }

    </div>

  )

}

export default SeccionCard