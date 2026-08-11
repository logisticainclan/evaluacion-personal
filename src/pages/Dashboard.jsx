import { useEffect, useState } from "react";
import "../styles/dashboard.css";
import {
  Users,
  UserCog,
  ClipboardCheck,
  TrendingUp,
  CalendarDays,
  Clock3,
  CheckCircle2,
  ListTodo,
  Trophy,
  Building2,
  Activity,
  LoaderCircle,
} from "lucide-react";

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
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);

    const respuesta =
      usuario?.rol === "admin"
        ? await obtenerDashboardAdmin()
        : await obtenerDashboardEvaluador();

    setCargando(false);

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return;
    }

    setData(respuesta.data);
  };

  if (cargando) {
    return (
      <div className="dashboard-loading">
        <LoaderCircle className="dashboard-loading-icon" size={34} />
        <span>Cargando información...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-empty">
        No se pudo cargar la información del dashboard.
      </div>
    );
  }

  if (usuario?.rol !== "admin") {
    return (
      <div className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">
              Panel del evaluador
            </span>

            <h1>
              Bienvenido, {usuario?.nombres || usuario?.usuario || "usuario"}
            </h1>

            <p>
              Consulta el avance de las evaluaciones asignadas
              para el período activo.
            </p>
          </div>

          <div className="dashboard-period-badge">
            <CalendarDays size={20} />

            <div>
              <span>Período activo</span>
              <strong>
                {data.periodo?.anio || "-"} -{" "}
                {data.periodo?.nombre || "-"}
              </strong>
            </div>
          </div>
        </section>

        <div className="dashboard-stats">
          <StatCard
            title="Personal asignado"
            value={data.total}
            description="Trabajadores bajo tu evaluación"
            icon={Users}
            tone="blue"
          />

          <StatCard
            title="Pendientes"
            value={data.pendientes}
            description="Evaluaciones aún no iniciadas"
            icon={Clock3}
            tone="amber"
          />

          <StatCard
            title="Finalizadas"
            value={data.finalizadas}
            description="Evaluaciones completadas"
            icon={CheckCircle2}
            tone="green"
          />

          <StatCard
            title="Progreso"
            value={`${data.progreso}%`}
            description="Avance del período actual"
            icon={TrendingUp}
            tone="violet"
          />
        </div>

        <Card className="dashboard-panel dashboard-progress-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                Avance general
              </span>
              <h2>Progreso de evaluación</h2>
            </div>

            <strong className="dashboard-progress-value">
              {data.progreso}%
            </strong>
          </div>

          <div className="dashboard-progress-track">
            <div
              className="dashboard-progress-fill"
              style={{
                width: `${Math.min(data.progreso, 100)}%`,
              }}
            />
          </div>

          <div className="dashboard-progress-footer">
            <span>
              {data.finalizadas} de {data.total} evaluaciones
              finalizadas
            </span>

            <span>
              {data.pendientes} pendientes
            </span>
          </div>
        </Card>
      </div>
    );
  }

  const totalEstados =
    data.finalizadas + data.proceso + data.pendientes;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            Panel administrativo
          </span>

          <h1>
            Bienvenido, {usuario?.nombres || usuario?.usuario || "administrador"}
          </h1>

          <p>
            Resumen institucional del desempeño del personal
            durante el período activo.
          </p>
        </div>

        <div className="dashboard-period-badge">
          <CalendarDays size={20} />

          <div>
            <span>Período activo</span>
            <strong>
              {data.periodo?.anio || "-"} -{" "}
              {data.periodo?.nombre || "-"}
            </strong>
          </div>
        </div>
      </section>

      <div className="dashboard-stats">
        <StatCard
          title="Personal"
          value={data.totalPersonal}
          description="Trabajadores registrados"
          icon={Users}
          tone="blue"
        />

        <StatCard
          title="Usuarios"
          value={data.totalUsuarios}
          description="Cuentas con acceso al sistema"
          icon={UserCog}
          tone="violet"
        />

        <StatCard
          title="Evaluaciones"
          value={data.totalEvaluaciones}
          description="Evaluaciones del período"
          icon={ClipboardCheck}
          tone="amber"
        />

        <StatCard
          title="Promedio institucional"
          value={Number(data.promedioInstitucional).toFixed(2)}
          description="Escala máxima de 4.00"
          icon={TrendingUp}
          tone="green"
        />
      </div>

      <div className="dashboard-content-grid">
        <Card className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                Seguimiento
              </span>
              <h2>Estado de evaluaciones</h2>
            </div>

            <Activity size={22} />
          </div>

          <div className="dashboard-status-list">
            {[
              {
                label: "Finalizadas",
                value: data.finalizadas,
                tone: "green",
              },
              {
                label: "En proceso",
                value: data.proceso,
                tone: "blue",
              },
              {
                label: "Pendientes",
                value: data.pendientes,
                tone: "amber",
              },
            ].map((item) => {
              const porcentaje =
                totalEstados > 0
                  ? Math.round(
                      (item.value / totalEstados) * 100
                    )
                  : 0;

              return (
                <div className="dashboard-status-row" key={item.label}>
                  <div className="dashboard-status-top">
                    <div>
                      <span
                        className={`dashboard-status-dot dashboard-status-dot-${item.tone}`}
                      />

                      <span>{item.label}</span>
                    </div>

                    <strong>{item.value}</strong>
                  </div>

                  <div className="dashboard-mini-track">
                    <div
                      className={`dashboard-mini-fill dashboard-mini-fill-${item.tone}`}
                      style={{
                        width: `${porcentaje}%`,
                      }}
                    />
                  </div>

                  <small>{porcentaje}% del total</small>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                Rendimiento
              </span>
              <h2>Top 5 mejores promedios</h2>
            </div>

            <Trophy size={22} />
          </div>

          {data.ranking.length === 0 ? (
            <div className="dashboard-no-data">
              No hay evaluaciones finalizadas.
            </div>
          ) : (
            <div className="dashboard-ranking-list">
              {data.ranking.map((e, index) => (
                <div className="dashboard-ranking-row" key={e.id}>
                  <div className="dashboard-ranking-position">
                    {index + 1}
                  </div>

                  <div className="dashboard-ranking-person">
                    <strong>
                      {e.personal?.apellidos},{" "}
                      {e.personal?.nombres}
                    </strong>

                    <span>
                      Posición #{index + 1}
                    </span>
                  </div>

                  <div className="dashboard-ranking-score">
                    {Number(e.promedio).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="dashboard-content-grid">
        <Card className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                Distribución
              </span>
              <h2>Promedio por área</h2>
            </div>

            <Building2 size={22} />
          </div>

          {data.promedioPorArea.length === 0 ? (
            <div className="dashboard-no-data">
              No hay datos por área.
            </div>
          ) : (
            <div className="dashboard-area-list">
              {data.promedioPorArea.map((a) => (
                <div className="dashboard-area-row" key={a.area}>
                  <div className="dashboard-area-top">
                    <div>
                      <strong>{a.area}</strong>
                      <span>
                        {a.total} evaluaciones
                      </span>
                    </div>

                    <strong>
                      {Number(a.promedio).toFixed(2)}
                    </strong>
                  </div>

                  <div className="dashboard-mini-track">
                    <div
                      className="dashboard-mini-fill dashboard-mini-fill-blue"
                      style={{
                        width: `${Math.min(
                          (Number(a.promedio) / 4) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                Actividad reciente
              </span>
              <h2>Últimas evaluaciones</h2>
            </div>

            <ListTodo size={22} />
          </div>

          {data.ultimas.length === 0 ? (
            <div className="dashboard-no-data">
              No hay evaluaciones registradas.
            </div>
          ) : (
            <div className="dashboard-recent-list">
              {data.ultimas.map((e) => (
                <div className="dashboard-recent-row" key={e.id}>
                  <div className="dashboard-recent-icon">
                    <ClipboardCheck size={18} />
                  </div>

                  <div>
                    <strong>
                      {e.personal?.apellidos},{" "}
                      {e.personal?.nombres}
                    </strong>

                    <span>
                      Evaluación finalizada
                    </span>
                  </div>

                  <div className="dashboard-recent-score">
                    {Number(e.promedio).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;