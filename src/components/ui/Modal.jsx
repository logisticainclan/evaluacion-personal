function Modal({ title, children, onClose }) {
  return (
    <div className="modal-bg">
      <div className="modal-card">
        <h2>{title}</h2>
        {children}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal