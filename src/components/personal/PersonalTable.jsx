import {
  Pencil,
  Trash2,
  UserRound,
  ClipboardCheck,
  ClipboardX,
} from "lucide-react";

function obtenerIniciales(nombres = "", apellidos = "") {
  const primeraNombre = nombres.trim().charAt(0);
  const primerApellido = apellidos.trim().charAt(0);

  return `${primeraNombre}${primerApellido}`.toUpperCase() || "P";
}

function PersonalTable({
  personal,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="personal-table-card">
      <div className="personal-table-scroll">
        <table className="personal-table">
          <thead>
            <tr>
              <th>Personal</th>
              <th>Área</th>
              <th>Cargo</th>
              <th>Evaluable</th>
              <th>Estado</th>
              <th className="personal-actions-column">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {personal.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="personal-empty-state">
                    <UserRound size={34} />
                    <strong>No hay registros</strong>
                    <span>
                      No se encontraron personas con los filtros
                      seleccionados.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              personal.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="personal-person-cell">
                      <div className="personal-avatar">
                        {obtenerIniciales(
                          p.nombres,
                          p.apellidos
                        )}
                      </div>

                      <div>
                        <strong>
                          {p.apellidos}, {p.nombres}
                        </strong>

                        <span>DNI: {p.dni}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="personal-area-badge">
                      {p.area || "Sin área"}
                    </span>
                  </td>

                  <td>{p.cargo || "-"}</td>

                  <td>
                    <span
                      className={`personal-evaluable-badge ${
                        p.es_evaluable
                          ? "personal-evaluable-si"
                          : "personal-evaluable-no"
                      }`}
                    >
                      {p.es_evaluable ? (
                        <ClipboardCheck size={15} />
                      ) : (
                        <ClipboardX size={15} />
                      )}

                      {p.es_evaluable
                        ? "Evaluable"
                        : "No evaluable"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status ${
                        p.estado === "activo"
                          ? "activo"
                          : "inactivo"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>

                  <td>
                    <div className="personal-actions">
                      <button
                        type="button"
                        className="personal-action-btn"
                        onClick={() => onEditar(p)}
                        title="Editar personal"
                        aria-label={`Editar a ${p.nombres} ${p.apellidos}`}
                      >
                        <Pencil size={17} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className="personal-action-btn personal-action-danger"
                        onClick={() => onEliminar(p)}
                        title="Eliminar personal"
                        aria-label={`Eliminar a ${p.nombres} ${p.apellidos}`}
                      >
                        <Trash2 size={17} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PersonalTable;