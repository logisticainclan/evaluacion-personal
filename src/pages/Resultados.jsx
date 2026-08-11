import { useEffect, useState } from "react";
import { obtenerResultados } from "../services/resultadosService";
import { SearchInput } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { exportarResultadosExcel } from "../utils/exportarExcel";
import { Toast } from "../lib/toast";
import {
  ClipboardCheck,
  TrendingUp,
  Trophy,
  Building2,
  FileSpreadsheet,
  Eye,
  FileText,
} from "lucide-react";

import "../styles/resultados.css";

function Resultados() {
  const [resultados, setResultados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [areaFiltro, setAreaFiltro] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("");
  const [nivelFiltro, setNivelFiltro] = useState("");
  const [evaluadorFiltro, setEvaluadorFiltro] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await obtenerResultados();

    if (error) {
      Toast.error(error.message);
      return;
    }

    setResultados(data || []);
  };

  const obtenerNivel = (promedio) => {
    const p = Number(promedio);

    if (p >= 3.5) return "Muy Bueno";
    if (p >= 2.5) return "Bueno";
    if (p >= 1.5) return "Regular";
    return "Deficiente";
  };

  const areas = [
    ...new Set(resultados.map((r) => r.personal?.area).filter(Boolean)),
  ].sort();

  const periodos = [
    ...new Set(
      resultados
        .map((r) =>
          r.periodos ? `${r.periodos.anio} - ${r.periodos.nombre}` : null,
        )
        .filter(Boolean),
    ),
  ];

  const evaluadores = [
    ...new Set(
      resultados
        .map((r) =>
          r.evaluador?.personal
            ? `${r.evaluador.personal.apellidos}, ${r.evaluador.personal.nombres}`
            : null,
        )
        .filter(Boolean),
    ),
  ].sort();

  const filtrados = resultados.filter((r) => {
    const texto = `
      ${r.personal?.dni || ""}
      ${r.personal?.nombres || ""}
      ${r.personal?.apellidos || ""}
      ${r.personal?.area || ""}
      ${r.personal?.cargo || ""}
      ${r.periodos?.anio || ""}
      ${r.periodos?.nombre || ""}
      ${r.evaluador?.personal?.nombres || ""}
      ${r.evaluador?.personal?.apellidos || ""}
    `.toLowerCase();

    const periodoTexto = r.periodos
      ? `${r.periodos.anio} - ${r.periodos.nombre}`
      : "";

    const evaluadorTexto = r.evaluador?.personal
      ? `${r.evaluador.personal.apellidos}, ${r.evaluador.personal.nombres}`
      : "";

    const nivel = obtenerNivel(r.promedio);

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    const coincideArea = !areaFiltro || r.personal?.area === areaFiltro;

    const coincidePeriodo = !periodoFiltro || periodoTexto === periodoFiltro;

    const coincideNivel = !nivelFiltro || nivel === nivelFiltro;

    const coincideEvaluador =
      !evaluadorFiltro || evaluadorTexto === evaluadorFiltro;

    return (
      coincideBusqueda &&
      coincideArea &&
      coincidePeriodo &&
      coincideNivel &&
      coincideEvaluador
    );
  });

  const promedioGeneral =
    resultados.length > 0
      ? resultados.reduce((total, r) => total + Number(r.promedio || 0), 0) /
        resultados.length
      : 0;

  const mejorPromedio =
    resultados.length > 0
      ? Math.max(...resultados.map((r) => Number(r.promedio || 0)))
      : 0;

  const totalAreas = new Set(
    resultados.map((r) => r.personal?.area).filter(Boolean),
  ).size;

  const claseNivel = (promedio) => {
    const nivel = obtenerNivel(promedio);

    if (nivel === "Muy Bueno") return "muy-bueno";
    if (nivel === "Bueno") return "bueno";
    if (nivel === "Regular") return "regular";

    return "deficiente";
  };

  return (
    <div className="resultados-page">
      <div className="page-header resultados-header">
        <div>
          <span className="resultados-kicker">Consolidado de evaluaciones</span>

          <h1>Resultados</h1>

          <p>Consulta y analiza las evaluaciones finalizadas del personal.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => exportarResultadosExcel(filtrados)}
          disabled={filtrados.length === 0}
        >
          <FileSpreadsheet size={16} />
          Exportar Excel
        </button>
      </div>

      <div className="resultados-stats">
        <div className="resultado-stat-card">
          <div className="resultado-stat-icon resultado-stat-blue">
            <ClipboardCheck size={20} />
          </div>

          <div>
            <span>Evaluaciones finalizadas</span>
            <strong>{resultados.length}</strong>
          </div>
        </div>

        <div className="resultado-stat-card">
          <div className="resultado-stat-icon resultado-stat-green">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Promedio general</span>
            <strong>{promedioGeneral.toFixed(2)}</strong>
          </div>
        </div>

        <div className="resultado-stat-card">
          <div className="resultado-stat-icon resultado-stat-violet">
            <Building2 size={20} />
          </div>

          <div>
            <span>Áreas evaluadas</span>
            <strong>{totalAreas}</strong>
          </div>
        </div>

        <div className="resultado-stat-card">
          <div className="resultado-stat-icon resultado-stat-orange">
            <Trophy size={20} />
          </div>

          <div>
            <span>Mejor promedio</span>
            <strong>{mejorPromedio.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <section className="resultados-filtros-card">
        <div className="resultados-filtros-title">
          <strong>Filtros</strong>
          <span>Busca y segmenta los resultados registrados.</span>
        </div>

        <div className="resultados-filtros-grid">
          <SearchInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por DNI, nombre, cargo o evaluador..."
          />

          <select
            className="resultados-filtro-control"
            value={areaFiltro}
            onChange={(e) => setAreaFiltro(e.target.value)}
          >
            <option value="">Todas las áreas</option>

            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            className="resultados-filtro-control"
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value)}
          >
            <option value="">Todos los períodos</option>

            {periodos.map((periodo) => (
              <option key={periodo} value={periodo}>
                {periodo}
              </option>
            ))}
          </select>

          <select
            className="resultados-filtro-control"
            value={nivelFiltro}
            onChange={(e) => setNivelFiltro(e.target.value)}
          >
            <option value="">Todos los niveles</option>
            <option value="Muy Bueno">Muy Bueno</option>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Deficiente">Deficiente</option>
          </select>

          <select
            className="resultados-filtro-control"
            value={evaluadorFiltro}
            onChange={(e) => setEvaluadorFiltro(e.target.value)}
          >
            <option value="">Todos los evaluadores</option>

            {evaluadores.map((evaluador) => (
              <option key={evaluador} value={evaluador}>
                {evaluador}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="secondary-btn"
            disabled={
              !busqueda &&
              !areaFiltro &&
              !periodoFiltro &&
              !nivelFiltro &&
              !evaluadorFiltro
            }
            onClick={() => {
              setBusqueda("");
              setAreaFiltro("");
              setPeriodoFiltro("");
              setNivelFiltro("");
              setEvaluadorFiltro("");
            }}
          >
            Limpiar
          </button>
        </div>
      </section>

      <div className="resultados-summary">
        Mostrando {filtrados.length} de {resultados.length} evaluaciones
      </div>

      <div className="resultados-table-card">
        <div className="resultados-table-scroll">
          <table className="resultados-table">
            <thead>
              <tr>
                <th>Personal</th>
                <th>Evaluador</th>
                <th>Área</th>
                <th>Cargo</th>
                <th>Período</th>
                <th>Puntaje</th>
                <th>Promedio</th>
                <th>Nivel</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="resultado-person">
                      <div className="resultado-avatar">
                        {`${r.personal?.nombres?.charAt(0) || ""}${
                          r.personal?.apellidos?.charAt(0) || ""
                        }`.toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {r.personal?.apellidos}, {r.personal?.nombres}
                        </strong>

                        <span>DNI: {r.personal?.dni || "-"}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    {r.evaluador?.personal
                      ? `${r.evaluador.personal.apellidos}, ${r.evaluador.personal.nombres}`
                      : "-"}
                  </td>

                  <td>{r.personal?.area || "-"}</td>
                  <td>{r.personal?.cargo || "-"}</td>

                  <td>
                    {r.periodos?.anio} - {r.periodos?.nombre}
                  </td>

                  <td className="resultado-score">
                    {Number(r.puntaje_total).toFixed(2)}
                  </td>

                  <td className="resultado-score">
                    {Number(r.promedio).toFixed(2)}
                  </td>

                  <td>
                    <span
                      className={`resultado-nivel ${claseNivel(r.promedio)}`}
                    >
                      {obtenerNivel(r.promedio)}
                    </span>
                  </td>

                  <td>
                    <div className="resultados-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => navigate(`/admin/evaluaciones/${r.id}`)}
                      >
                        <Eye size={15} />
                        Evaluación
                      </button>

                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() =>
                          navigate(`/admin/evaluaciones/${r.id}/reporte`)
                        }
                      >
                        <FileText size={15} />
                        Reporte
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-table">
                    No hay resultados que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Resultados;
