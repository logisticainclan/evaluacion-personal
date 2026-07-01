function StatusBadge({ active }) {
  return (
    <span className={`status ${active ? 'activo' : 'inactivo'}`}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

export default StatusBadge