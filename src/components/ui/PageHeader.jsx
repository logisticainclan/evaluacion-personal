function PageHeader({
  title,
  description,
  actionText,
  onAction,
  children
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>

      <div className="page-header-actions">
        {children}

        {actionText && (
          <button
            className="primary-btn"
            onClick={onAction}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  )
}

export default PageHeader