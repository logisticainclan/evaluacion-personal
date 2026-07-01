import { useEffect, useState } from "react";
import { obtenerUsuarioActual } from "../lib/auth";
import {
  obtenerDashboardAdmin,
  obtenerDashboardEvaluador
} from "../services/dashboardService";

function Dashboard() {
  const usuario = obtenerUsuarioActual();
  const [data, setData] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const respuesta =
      usuario?.rol === "admin"
        ? await obtenerDashboardAdmin()
        : await obtenerDashboardEvaluador();

    if (respuesta.error) {
      alert(respuesta.error.message);
      return;
    }

    setData(respuesta.data);
  };

  if (!data) return <p>Cargando dashboard...</p>;

  if (usuario?.rol === "admin") {
    return (
      <div>
        <h1>Dashboard Administrador</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Período activo</h3>
            <strong>{data.periodo?.anio} - {data.periodo?.nombre}</strong>
          </div>

          <div className="stat-card">
            <h3>Personal</h3>
            <strong>{data.totalPersonal}</strong>
          </div>

          <div className="stat-card">
            <h3>Usuarios</h3>
            <strong>{data.totalUsuarios}</strong>
          </div>

          <div className="stat-card">
            <h3>Evaluaciones</h3>
            <strong>{data.totalEvaluaciones}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard Evaluador</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Período activo</h3>
          <strong>{data.periodo?.anio} - {data.periodo?.nombre}</strong>
        </div>

        <div className="stat-card">
          <h3>Asignados</h3>
          <strong>{data.total}</strong>
        </div>

        <div className="stat-card">
          <h3>Pendientes</h3>
          <strong>{data.pendientes}</strong>
        </div>

        <div className="stat-card">
          <h3>Finalizadas</h3>
          <strong>{data.finalizadas}</strong>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-header">
          <strong>Avance de evaluación</strong>
          <span>{data.progreso}%</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${data.progreso}%` }}
          />
        </div>

        <p>{data.finalizadas} de {data.total} evaluaciones finalizadas.</p>
      </div>
    </div>
  );
}

export default Dashboard;