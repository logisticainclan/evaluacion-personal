import { useEffect, useState } from "react";
import { obtenerUsuarioActual } from "../lib/auth";
import {
  obtenerDashboardAdmin,
  obtenerDashboardEvaluador,
} from "../services/dashboardService";
import { StatCard, Card } from "../components/ui";
import { Toast } from "../lib/toast";

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
      Toast.error(respuesta.error.message);
      return;
    }

    setData(respuesta.data);
  };

  if (!data) return <p>Cargando dashboard...</p>;

  if (usuario?.rol !== "admin") {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dashboard Evaluador</h1>
            <p>Resumen de tus evaluaciones asignadas</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Período activo"
            value={`${data.periodo?.anio || "-"} - ${data.periodo?.nombre || "-"}`}
          />
          <StatCard title="Asignados" value={data.total} />
          <StatCard title="Pendientes" value={data.pendientes} />
          <StatCard title="Finalizadas" value={data.finalizadas} />
        </div>

        <Card className="dashboard-card">
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

          <p>
            {data.finalizadas} de {data.total} evaluaciones finalizadas.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard Administrador</h1>
          <p>
            Resumen del período {data.periodo?.anio || "-"} -{" "}
            {data.periodo?.nombre || "-"}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Personal" value={data.totalPersonal} />
        <StatCard title="Usuarios" value={data.totalUsuarios} />
        <StatCard title="Evaluaciones" value={data.totalEvaluaciones} />
        <StatCard
          title="Promedio institucional"
          value={Number(data.promedioInstitucional).toFixed(2)}
          description="Promedio general del período"
        />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h2>Estado de evaluaciones</h2>

          {[
            { label: "Finalizadas", value: data.finalizadas },
            { label: "En proceso", value: data.proceso },
            { label: "Pendientes", value: data.pendientes },
          ].map((item) => {
            const totalEstados =
              data.finalizadas + data.proceso + data.pendientes;

            const porcentaje =
              totalEstados > 0
                ? Math.round((item.value / totalEstados) * 100)
                : 0;

            return (
              <div className="chart-row" key={item.label}>
                <div className="chart-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>

                <div className="chart-track">
                  <div
                    className="chart-fill"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Card>

        <Card className="dashboard-card">
          <h2>Top 5 mejores promedios</h2>

          {data.ranking.length === 0 && <p>No hay evaluaciones finalizadas.</p>}

          {data.ranking.map((e, index) => (
            <div className="ranking-row" key={e.id}>
              <div>
                <strong>#{index + 1}</strong>
                <span>
                  {e.personal?.apellidos}, {e.personal?.nombres}
                </span>
              </div>

              <strong>{Number(e.promedio).toFixed(2)}</strong>
            </div>
          ))}
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h2>Promedio por área</h2>

          {data.promedioPorArea.length === 0 && <p>No hay datos por área.</p>}

          {data.promedioPorArea.map((a) => (
            <div className="area-row" key={a.area}>
              <div>
                <strong>{a.area}</strong>
                <span>{a.total} evaluaciones</span>
              </div>

              <div className="area-score">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(Number(a.promedio) / 4) * 100}%` }}
                  />
                </div>
                <strong>{Number(a.promedio).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </Card>

        <Card className="dashboard-card">
          <h2>Últimas evaluaciones</h2>

          {data.ultimas.length === 0 && <p>No hay evaluaciones registradas.</p>}

          {data.ultimas.map((e) => (
            <div className="dashboard-row" key={e.id}>
              <span>
                {e.personal?.apellidos}, {e.personal?.nombres}
              </span>
              <strong>{Number(e.promedio).toFixed(2)}</strong>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
