function EvaluacionTopBar({
  estado,
  respondidas,
  totalItems,
  progreso,
  guardando,
  soloLectura,
  onGuardar,
  onFinalizar
}) {
  return (
    <div className="evaluacion-topbar">
      <div>
        <span className={`eval-status ${estado}`}>
          {estado}
        </span>

        <strong>
          {respondidas} / {totalItems} ítems respondidos
        </strong>
      </div>

      <div className="evaluacion-progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progreso}%` }}
          />
        </div>

        <span>{progreso}%</span>
      </div>

      {!soloLectura && (
        <div className="evaluacion-actions">
          <button
            className="secondary-btn"
            onClick={onGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar borrador"}
          </button>

          <button
            className="danger-btn"
            onClick={onFinalizar}
          >
            Finalizar
          </button>
        </div>
      )}
    </div>
  )
}

export default EvaluacionTopBar