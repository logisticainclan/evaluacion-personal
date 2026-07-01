function EvaluacionSidebar({
  secciones,
  items,
  respuestas,
  seccionActiva,
  setSeccionActiva
}) {
  const progresoSeccion = (seccionId) => {
    const itemsSeccion = items.filter((i) => i.seccion_id === seccionId)
    const respondidos = itemsSeccion.filter((item) => respuestas[item.id]).length

    return {
      total: itemsSeccion.length,
      respondidos,
      completa: itemsSeccion.length > 0 && respondidos === itemsSeccion.length
    }
  }

  return (
    <aside className="evaluacion-sidebar">
      <h3>Secciones</h3>

      {secciones.map((seccion, index) => {
        const activa = seccion.id === seccionActiva
        const progreso = progresoSeccion(seccion.id)

        return (
          <button
            key={seccion.id}
            className={`eval-nav-item ${activa ? 'active' : ''}`}
            onClick={() => setSeccionActiva(seccion.id)}
          >
            <span>
              {progreso.completa ? '✓' : activa ? '➜' : index + 1}
            </span>

            <div>
              <strong>{seccion.nombre}</strong>
              <small>
                {progreso.respondidos}/{progreso.total} respondidos
              </small>
            </div>
          </button>
        )
      })}
    </aside>
  )
}

export default EvaluacionSidebar