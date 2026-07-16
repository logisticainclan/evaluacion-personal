import { useEffect, useState } from "react";
import { obtenerResultados } from "../services/resultadosService";
import { DataTable, EmptyState, SearchInput } from "../components/ui"
import { useNavigate } from "react-router-dom";
import { exportarResultadosExcel } from "../utils/exportarExcel";

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
      alert(error.message);
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
    ...new Set(
      resultados
        .map((r) => r.personal?.area)
        .filter(Boolean)
    )
  ].sort();

  const periodos = [
    ...new Set(
      resultados
        .map((r) =>
          r.periodos
            ? `${r.periodos.anio} - ${r.periodos.nombre}`
            : null
        )
        .filter(Boolean)
    )
  ];

  const evaluadores = [
    ...new Set(
      resultados
        .map((r) =>
          r.evaluador?.personal
            ? `${r.evaluador.personal.apellidos}, ${r.evaluador.personal.nombres}`
            : null
        )
        .filter(Boolean)
    )
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

    const coincideArea =
      !areaFiltro || r.personal?.area === areaFiltro;

    const coincidePeriodo =
      !periodoFiltro || periodoTexto === periodoFiltro;

    const coincideNivel =
      !nivelFiltro || nivel === nivelFiltro;

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Resultados</h1>
          <p>Evaluaciones finalizadas del personal</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => exportarResultadosExcel(filtrados)}
          disabled={filtrados.length === 0}
        >
          Exportar Excel
        </button>
      </div>

      <div className="filter-bar resultados-filtros">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por DNI, nombre, cargo o evaluador..."
        />

        <select
          className="search-input"
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
          className="search-input"
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
          className="search-input"
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
          className="search-input"
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
          className="secondary-btn"
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

      <p className="result-count">
        Mostrando {filtrados.length} de {resultados.length} evaluaciones
      </p>

      <DataTable
        columns={[
          "Personal",
          "Evaluador",
          "Área",
          "Cargo",
          "Período",
          "Puntaje",
          "Promedio",
          "Nivel",
          "Acciones"
        ]}
      >
        {filtrados.map((r) => (
          <tr key={r.id}>
            <td>
              <strong>
                {r.personal?.apellidos}, {r.personal?.nombres}
              </strong>
              <br />
              <small>DNI: {r.personal?.dni}</small>
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
            <td>{Number(r.puntaje_total).toFixed(2)}</td>
            <td>{Number(r.promedio).toFixed(2)}</td>
            <td>
              <span className="eval-status finalizada">
                {obtenerNivel(r.promedio)}
              </span>
            </td>
            <td>
  <div className="actions">
    <button
      className="secondary-btn"
      onClick={() => navigate(`/admin/evaluaciones/${r.id}`)}
    >
      Ver evaluación
    </button>

    <button
      className="primary-btn"
      onClick={() => navigate(`/admin/evaluaciones/${r.id}/reporte`)}
    >
      Ver reporte
    </button>
  </div>
</td>
          </tr>
        ))}

        {filtrados.length === 0 && (
          <tr>
            <td colSpan="9">
              <EmptyState
                title="No hay resultados"
                description="Aún no existen evaluaciones finalizadas."
              />
            </td>
          </tr>
        )}
      </DataTable>
    </div>
  );
}

export default Resultados;
