function ItemCalificacion({
  item,
  niveles,
  respuestas,
  setRespuestas,
  disabled = false,
  modoPreview = false,
}) {
  const seleccionarNivel = (nivel) => {
    if (disabled || modoPreview) return;

    setRespuestas((prev) => ({
      ...prev,
      [item.id]: {
        nivel_id: nivel.id,
        puntaje: nivel.puntaje,
      },
    }));
  };

  return (
    <div className="item-calificacion">
      <div className="item-descripcion">
        {item.descripcion}
      </div>

      <div className="nivel-buttons">
        {niveles.map((nivel) => {
          const activo =
            respuestas[item.id]?.nivel_id === nivel.id;

          return (
            <button
              key={nivel.id}
              type="button"
              disabled={disabled && !modoPreview}
              className={`nivel-btn ${
                activo ? "active" : ""
              } ${modoPreview ? "nivel-btn-preview" : ""}`}
              onClick={() => seleccionarNivel(nivel)}
              tabIndex={modoPreview ? -1 : undefined}
            >
              <strong>{nivel.nombre}</strong>
              <span>{nivel.puntaje} pts</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ItemCalificacion;