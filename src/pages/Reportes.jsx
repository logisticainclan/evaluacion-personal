import { useEffect, useState } from "react";
import { obtenerReporteGeneral } from "../services/reportesService";
import { Card, StatCard, EmptyState } from "../components/ui";

function Reportes() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await obtenerReporteGeneral();

    if (error) {
      alert(error.message);
      return;
    }

    setRegistros(data || []);
  };

  const total = registros.length;

  const promedioGeneral =
    total > 0
      ? registros.reduce((acc, r) => acc + Number(r.promedio), 0) / total
      : 0;

  const areas = {};

  registros.forEach((r) => {
    const area = r.personal?.area || "Sin área";

    if (!areas[area]) {
      areas[area] = {
        total: 0,
        suma: 0
      };
    }

    areas[area].total += 1;
    areas[area].suma += Number(r.promedio);
  });

  const promedioPorArea = Object.entries(areas).map(([area, info]) => ({
    area,
    total: info.total,
    promedio: info.suma / info.total
  }));

  const ranking = [...registros]
    .sort((a, b) => Number(b.promedio) - Number(a.promedio))
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p>Análisis general de evaluaciones finalizadas</p>
        </div>

        <button className="primary-btn">
          Exportar Excel
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Evaluaciones finalizadas" value={total} />
        <StatCard title="Promedio general" value={promedioGeneral.toFixed(2)} />
        <StatCard title="Áreas evaluadas" value={promedioPorArea.length} />
        <StatCard title="Mayor promedio" value={ranking[0] ? Number(ranking[0].promedio).toFixed(2) : "0.00"} />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h2>Promedio por área</h2>

          {promedioPorArea.length === 0 && (
            <EmptyState
              title="Sin datos"
              description="No hay evaluaciones finalizadas."
            />
          )}

          {promedioPorArea.map((a) => (
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
          <h2>Ranking general</h2>

          {ranking.length === 0 && (
            <EmptyState
              title="Sin ranking"
              description="No hay evaluaciones finalizadas."
            />
          )}

          {ranking.map((r, index) => (
            <div className="dashboard-row" key={r.id}>
              <span>
                {index + 1}. {r.personal?.apellidos}, {r.personal?.nombres}
              </span>

              <strong>{Number(r.promedio).toFixed(2)}</strong>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default Reportes;