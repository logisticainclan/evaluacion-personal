function ItemCalificacion({
  item,
  niveles,
  respuestas,
  setRespuestas,
  disabled = false
}) {
  const seleccionarNivel = (nivel) => {
    if (disabled) return

    setRespuestas((prev) => ({
      ...prev,
      [item.id]: {
        nivel_id: nivel.id,
        puntaje: nivel.puntaje
      }
    }))
  }

  return (
    <div className="item-calificacion">
      <div className="item-descripcion">
        {item.descripcion}
      </div>

      <div className="nivel-buttons">
        {niveles.map((nivel) => {
          const activo = respuestas[item.id]?.nivel_id === nivel.id

          return (
            <button
              key={nivel.id}
              type="button"
              disabled={disabled}
              className={`nivel-btn ${activo ? 'active' : ''}`}
              onClick={() => seleccionarNivel(nivel)}
            >
              <strong>{nivel.nombre}</strong>
              <span>{nivel.puntaje} pts</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ItemCalificacion