import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  UserCog,
  UserCheck,
  CalendarDays,
  LogOut,
  ClipboardList,
  KeyRound,
  Trophy,
} from "lucide-react";

import { obtenerUsuarioActual, cerrarSesion } from "../../lib/auth";

function Sidebar() {
  const usuario = obtenerUsuarioActual();

  const esAdmin = usuario?.rol === "admin";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Evaluación</h2>
        <span>IE J.J. Inclán</span>
      </div>

      <nav>
        <span className="sidebar-section-title">General</span>

        <NavLink to="/admin/dashboard">
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink to="/admin/evaluaciones">
          <ClipboardCheck size={19} />
          Evaluaciones
        </NavLink>

        {esAdmin && (
          <>
            <NavLink to="/admin/reportes">
              <BarChart3 size={19} />
              Reportes
            </NavLink>

            <span className="sidebar-section-title">Administración</span>

            <NavLink to="/admin/personal">
              <Users size={19} />
              Personal
            </NavLink>

            <NavLink to="/admin/usuarios">
              <UserCog size={19} />
              Usuarios
            </NavLink>

            <NavLink to="/admin/resultados">
              <Trophy size={19} />
              Resultados
            </NavLink>

            <NavLink to="/admin/asignaciones">
              <UserCheck size={19} />
              Asignaciones
            </NavLink>

            <NavLink to="/admin/periodos">
              <CalendarDays size={19} />
              Períodos
            </NavLink>

            <NavLink to="/admin/ficha-evaluacion">
              <ClipboardList size={19} />
              Ficha de evaluación
            </NavLink>
          </>
        )}

        <span className="sidebar-section-title">Cuenta</span>

        <NavLink to="/admin/cambiar-password">
          <KeyRound size={19} />
          Cambiar contraseña
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={cerrarSesion}>
        <LogOut size={20} />
        Salir
      </button>
    </aside>
  );
}

export default Sidebar;
