import {
  User,
  CalendarDays,
  Briefcase,
  Building2,
  BadgeCheck,
} from "lucide-react";

function EvaluacionHeader({
  personalSeleccionadoInfo,
  periodo,
  estado,
  respondidas,
  totalItems,
  progreso,
  guardando,
  soloLectura,
  onGuardar,
  onFinalizar,
}) {
  return (
    <div className="evaluacion-header-card">
      <div className="header-top">
        <div className="header-persona">
          <div className="avatar-circle">
            <User size={28} />
          </div>

          <div>
            <h2>
              {personalSeleccionadoInfo
                ? `${personalSeleccionadoInfo.apellidos}, ${personalSeleccionadoInfo.nombres}`
                : "Sin trabajador"}
            </h2>

            <div className="info-list">
              <span>
                <BadgeCheck size={16} />
                DNI: {personalSeleccionadoInfo?.dni}
              </span>

              <span>
                <Building2 size={16} />
                {personalSeleccionadoInfo?.area}
              </span>

              <span>
                <Briefcase size={16} />
                {personalSeleccionadoInfo?.cargo}
              </span>
            </div>
          </div>
        </div>

        <div className={`estado-pill ${estado}`}>{estado}</div>
      </div>

      <div className="header-bottom">
        <div className="periodo-box">
          <CalendarDays size={18} />

          {periodo ? `${periodo.anio} - ${periodo.nombre}` : "-"}
        </div>

        <div className="header-progress">
          <span>
            {respondidas} / {totalItems}
          </span>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progreso}%` }} />
          </div>

          <strong>{progreso}%</strong>
        </div>

        {!soloLectura && (
          <div className="header-actions">
            <button
              className="secondary-btn"
              onClick={onGuardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>

            <button className="danger-btn" onClick={onFinalizar}>
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EvaluacionHeader;
