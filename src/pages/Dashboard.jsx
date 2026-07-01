import { useEffect, useState } from "react"
import { obtenerUsuarioActual } from "../lib/auth"
import {
  obtenerDashboardAdmin,
  obtenerDashboardEvaluador
} from "../services/dashboardService"
import { StatCard, Card } from "../components/ui"

function Dashboard() {
  const usuario = obtenerUsuarioActual()
  const [data, setData] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const respuesta =
      usuario?.rol === "admin"
        ? await obtenerDashboardAdmin()
        : await obtenerDashboardEvaluador()

    if (respuesta.error) {
      alert(respuesta.error.message)
      return
    }

    setData(respuesta.data)
  }

  if (!data) return <p>Cargando dashboard...</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            {usuario?.rol === "admin"
              ? "Dashboard Administrador"
              : "Dashboard Evaluador"}
          </h1>
          <p>Resumen general del sistema de evaluación</p>
        </div>
      </div>

      {usuario?.rol === "admin" ? (
        <>
          <div className="stats-grid">
            <StatCard
              title="Período activo"
              value={`${data.periodo?.anio || "-"} - ${data.periodo?.nombre || "-"}`}
            />

            <StatCard
              title="Personal"
              value={data.totalPersonal}
            />

            <StatCard
              title="Usuarios"
              value={data.totalUsuarios}
            />

            <StatCard
              title="Evaluaciones"
              value={data.totalEvaluaciones}
            />
          </div>

          <Card className="dashboard-card">
            <h2>Estado de evaluaciones</h2>

            <div className="dashboard-row">
              <span>Finalizadas</span>
              <strong>{data.finalizadas}</strong>
            </div>

            <div className="dashboard-row">
              <span>En proceso</span>
              <strong>{data.proceso}</strong>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Período activo"
              value={`${data.periodo?.anio || "-"} - ${data.periodo?.nombre || "-"}`}
            />

            <StatCard
              title="Asignados"
              value={data.total}
            />

            <StatCard
              title="Pendientes"
              value={data.pendientes}
            />

            <StatCard
              title="Finalizadas"
              value={data.finalizadas}
            />
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

            <p>{data.finalizadas} de {data.total} evaluaciones finalizadas.</p>
          </Card>
        </>
      )}
    </div>
  )
}

export default Dashboard