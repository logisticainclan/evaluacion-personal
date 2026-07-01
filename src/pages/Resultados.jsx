import { useEffect, useState } from "react";
import { obtenerResultados } from "../services/resultadosService";
import { DataTable, EmptyState, SearchInput } from "../components/ui"

function Resultados() {
  const [resultados, setResultados] = useState([]);
  const [busqueda, setBusqueda] = useState("");

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

  const filtrados = resultados.filter((r) =>
    `${r.personal?.dni || ""} ${r.personal?.nombres || ""} ${r.personal?.apellidos || ""} ${r.personal?.area || ""} ${r.periodos?.anio || ""} ${r.periodos?.nombre || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Resultados</h1>
          <p>Evaluaciones finalizadas del personal</p>
        </div>
      </div>

      <SearchInput
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por DNI, nombre, área o período..."
      />

      <DataTable
        columns={[
          "Personal",
          "Área",
          "Cargo",
          "Período",
          "Puntaje",
          "Promedio",
          "Nivel",
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
          </tr>
        ))}

        {filtrados.length === 0 && (
          <tr>
            <td colSpan="7">
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
