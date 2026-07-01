function Header() {
  const usuario = JSON.parse(localStorage.getItem('usuario_app'))

  return (
    <header className="header">
      <div>
        <h2>Panel Administrativo</h2>
        <p>Bienvenido, {usuario?.nombres} {usuario?.apellidos}</p>
      </div>

      <span className="role-badge">{usuario?.rol}</span>
    </header>
  )
}

export default Header