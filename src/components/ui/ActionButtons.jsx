function ActionButtons({ onEdit, onDelete, onToggle, active }) {
  return (
    <div className="actions">
      {onEdit && <button onClick={onEdit}>Editar</button>}

      {onToggle && (
        <button onClick={onToggle}>
          {active ? 'Inactivar' : 'Activar'}
        </button>
      )}

      {onDelete && (
        <button className="danger" onClick={onDelete}>
          Eliminar
        </button>
      )}
    </div>
  )
}

export default ActionButtons