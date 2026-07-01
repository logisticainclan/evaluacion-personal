function PersonalTable({ personal, onEditar, onEliminar }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Apellidos y nombres</th>
            <th>Área</th>
            <th>Cargo</th>
            <th>Evaluable</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {personal.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-table">
                No hay registros
              </td>
            </tr>
          ) : (
            personal.map((p) => (
              <tr key={p.id}>
                <td>{p.dni}</td>
                <td>{p.apellidos}, {p.nombres}</td>
                <td>{p.area || '-'}</td>
                <td>{p.cargo || '-'}</td>
                <td>{p.es_evaluable ? 'Sí' : 'No'}</td>
                <td>
                  <span className={`status ${p.estado}`}>
                    {p.estado}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button onClick={() => onEditar(p)}>Editar</button>
                    <button className="danger" onClick={() => onEliminar(p.id)}>
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
  )
}

export default PersonalTable