function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  icon = null,
  className = "",
  onClick
}) {

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${variant}-btn
        btn-${size}
        ${loading ? "btn-loading" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          Cargando...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;