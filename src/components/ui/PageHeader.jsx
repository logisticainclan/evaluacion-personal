function PageHeader({ title, description, actionText, onAction }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {actionText && (
        <button className="primary-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  )
}

export default PageHeader