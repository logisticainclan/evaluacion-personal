import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  UserCog,
  ListChecks,
  SlidersHorizontal,
  CheckSquare,
  UserCheck,
  CalendarDays,
  LogOut,
} from "lucide-react";

import { obtenerUsuarioActual, cerrarSesion } from "../../lib/auth";
import { Trophy } from "lucide-react";

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
        <NavLink to="/admin/dashboard">
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/admin/evaluaciones">
          <ClipboardCheck size={20} />
          Evaluaciones
        </NavLink>

        {esAdmin && (
          <>
            <NavLink to="/admin/reportes">
              <BarChart3 size={20} />
              Reportes
            </NavLink>
            <hr className="sidebar-divider" />

            <NavLink to="/admin/personal">
              <Users size={20} />
              Personal
            </NavLink>

            <NavLink to="/admin/usuarios">
              <UserCog size={20} />
              Usuarios
            </NavLink>

            <NavLink to="/admin/resultados">
              <Trophy size={20} />
              Resultados
            </NavLink>

            <NavLink to="/admin/asignaciones">
              <UserCheck size={20} />
              Asignación de Evaluadores
            </NavLink>

            <NavLink to="/admin/periodos">
              <CalendarDays size={20} />
              Períodos
            </NavLink>

            <NavLink to="/admin/secciones">
              <ListChecks size={20} />
              Secciones
            </NavLink>

            <NavLink to="/admin/niveles">
              <SlidersHorizontal size={20} />
              Niveles
            </NavLink>

            <NavLink to="/admin/items">
              <CheckSquare size={20} />
              Ítems
            </NavLink>
          </>
        )}
      </nav>

      <button className="logout-btn" onClick={cerrarSesion}>
        <LogOut size={20} />
        Salir
      </button>
    </aside>
  );
}

export default Sidebar;
