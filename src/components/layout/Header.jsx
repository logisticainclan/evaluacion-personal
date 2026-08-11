import { UserRound } from "lucide-react";
import { obtenerUsuarioActual } from "../../lib/auth";

function Header() {
  const usuario = obtenerUsuarioActual();

  const rolTexto =
  usuario?.rol === "admin"
    ? "Administrador"
    : usuario?.rol === "evaluador"
      ? "Evaluador"
      : usuario?.rol || "-";

  const nombreCompleto = [
    usuario?.nombres,
    usuario?.apellidos,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-eyebrow">
          I.E. José Joaquín Inclán
        </span>

        <h2>Sistema de Evaluación del Personal</h2>
      </div>

      <div className="header-user">
        <div className="header-user-icon">
          <UserRound size={19} />
        </div>

        <div className="header-user-info">
          <strong>{nombreCompleto || "Usuario"}</strong>
          <span>{rolTexto}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;