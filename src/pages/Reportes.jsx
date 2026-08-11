import { useEffect, useState } from "react";
import { obtenerReporteGeneral } from "../services/reportesService";
import { Toast } from "../lib/toast";
import { ClipboardCheck, TrendingUp, Building2, Trophy } from "lucide-react";

import "../styles/reportes.css";

function Reportes() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await obtenerReporteGeneral();

    if (error) {
      Toast.error(error.message);
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
        suma: 0,
      };
    }

    areas[area].total += 1;
    areas[area].suma += Number(r.promedio);
  });

  const promedioPorArea = Object.entries(areas).map(([area, info]) => ({
    area,
    total: info.total,
    promedio: info.suma / info.total,
  }));

  const ranking = [...registros]
    .sort((a, b) => Number(b.promedio) - Number(a.promedio))
    .slice(0, 5);

  return (
  <div className="reportes-page">
    <div className="page-header reportes-header">
      <div>
        <span className="reportes-kicker">
          Análisis institucional
        </span>

        <h1>Reportes</h1>

        <p>
          Análisis general de las evaluaciones finalizadas.
        </p>
      </div>
    </div>

    <div className="reportes-stats">
      <div className="reporte-stat-card">
        <div className="reporte-stat-icon reporte-stat-blue">
          <ClipboardCheck size={20} />
        </div>

        <div>
          <span>Evaluaciones finalizadas</span>
          <strong>{total}</strong>
        </div>
      </div>

      <div className="reporte-stat-card">
        <div className="reporte-stat-icon reporte-stat-green">
          <TrendingUp size={20} />
        </div>

        <div>
          <span>Promedio general</span>
          <strong>{promedioGeneral.toFixed(2)}</strong>
        </div>
      </div>

      <div className="reporte-stat-card">
        <div className="reporte-stat-icon reporte-stat-violet">
          <Building2 size={20} />
        </div>

        <div>
          <span>Áreas evaluadas</span>
          <strong>{promedioPorArea.length}</strong>
        </div>
      </div>

      <div className="reporte-stat-card">
        <div className="reporte-stat-icon reporte-stat-orange">
          <Trophy size={20} />
        </div>

        <div>
          <span>Mayor promedio</span>
          <strong>
            {ranking[0]
              ? Number(ranking[0].promedio).toFixed(2)
              : "0.00"}
          </strong>
        </div>
      </div>
    </div>

    <div className="reportes-grid">
      <section className="reporte-card">
        <div className="reporte-card-header">
          <h2>Promedio por área</h2>
          <p>
            Comparación del desempeño promedio entre las áreas evaluadas.
          </p>
        </div>

        {promedioPorArea.length === 0 ? (
          <div className="reportes-empty">
            No hay evaluaciones finalizadas.
          </div>
        ) : (
          <div className="reporte-area-list">
            {promedioPorArea.map((a) => (
              <div
                className="reporte-area-row"
                key={a.area}
              >
                <div className="reporte-area-top">
                  <strong>{a.area}</strong>

                  <span>
                    {a.total} evaluación
                    {a.total !== 1 ? "es" : ""}
                  </span>
                </div>

                <div className="reporte-area-score">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(Number(a.promedio) / 4) * 100}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {Number(a.promedio).toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="reporte-card">
        <div className="reporte-card-header">
          <h2>Top 5 mejores promedios</h2>
          <p>
            Personal con los promedios más altos de las evaluaciones finalizadas.
          </p>
        </div>

        {ranking.length === 0 ? (
          <div className="reportes-empty">
            No hay evaluaciones finalizadas.
          </div>
        ) : (
          <div className="reporte-ranking">
            {ranking.map((r, index) => (
              <div
                className="reporte-ranking-row"
                key={r.id}
              >
                <div className="reporte-ranking-position">
                  {index + 1}
                </div>

                <div className="reporte-ranking-person">
                  <strong>
                    {r.personal?.apellidos},{" "}
                    {r.personal?.nombres}
                  </strong>

                  <span>
                    {r.personal?.area || "Sin área"}
                  </span>
                </div>

                <div className="reporte-ranking-score">
                  {Number(r.promedio).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  </div>
);
}

export default Reportes;
