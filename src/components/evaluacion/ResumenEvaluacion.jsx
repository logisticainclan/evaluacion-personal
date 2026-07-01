function ResumenEvaluacion({ respuestas, totalItems = 0, progreso = 0 }) {
  const respondidas = Object.keys(respuestas).length
  const pendientes = totalItems - respondidas

  const total = Object.values(respuestas).reduce(
    (a, b) => a + Number(b.puntaje),
    0
  )

  const promedio = respondidas ? total / respondidas : 0

  let nivel = 'Sin calcular'

  if (promedio >= 3.5) nivel = 'Muy Bueno'
  else if (promedio >= 2.5) nivel = 'Bueno'
  else if (promedio >= 1.5) nivel = 'Regular'
  else if (promedio > 0) nivel = 'Deficiente'

  return (
    <div className="resumen-evaluacion">
      <h2>Resumen</h2>

      <div className="resumen-row">
        <span>Respondidos</span>
        <strong>{respondidas}/{totalItems}</strong>
      </div>

      <div className="resumen-row">
        <span>Pendientes</span>
        <strong>{pendientes}</strong>
      </div>

      <div className="resumen-row">
        <span>Puntaje</span>
        <strong>{total.toFixed(2)}</strong>
      </div>

      <div className="resumen-row">
        <span>Promedio</span>
        <strong>{promedio.toFixed(2)}</strong>
      </div>

      <div className="resumen-row">
        <span>Nivel</span>
        <strong>{nivel}</strong>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  )
}

export default ResumenEvaluacion