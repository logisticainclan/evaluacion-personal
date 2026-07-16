import { useEffect, useState } from "react";

import {
  obtenerEvaluadores,
  obtenerPersonal,
  obtenerAsignaciones,
  guardarAsignaciones,
  obtenerPersonalAsignadoPeriodo
} from "../services/asignacionesService";

function Asignaciones() {

  const [evaluadores, setEvaluadores] = useState([]);

  const [personal, setPersonal] = useState([]);

  const [personalAsignado, setPersonalAsignado] = useState([]);

  const [evaluador, setEvaluador] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);

  const [areaFiltro, setAreaFiltro] = useState("");

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {

    const e = await obtenerEvaluadores();
    const p = await obtenerPersonal();
    const a = await obtenerPersonalAsignadoPeriodo();

    if (e.error) {
      alert(e.error.message);
      return;
    }

    if (p.error) {
      alert(p.error.message);
      return;
    }

    setEvaluadores(e.data || []);
    setPersonal(p.data || []);
    setPersonalAsignado(a.data?.map(x => x.personal_id) || []);
  }

  useEffect(() => {

    if (evaluador) {

      cargarAsignaciones();

    } else {

      setSeleccionados([]);

    }

  }, [evaluador]);

  async function cargarAsignaciones() {

    const r = await obtenerAsignaciones(evaluador);

    if (r.error) {

      alert(r.error.message);

      return;

    }

    setSeleccionados(
      r.data.map(x => x.personal_id)
    );

  }

  function cambiarSeleccion(idPersonal) {
  if (!evaluador) {
    alert("Primero seleccione un evaluador");
    return;
  }

  const usuarioEvaluador = evaluadores.find(u => u.id === evaluador);

  if (usuarioEvaluador?.personal_id === idPersonal) {
    alert("Un evaluador no puede evaluarse a sí mismo");
    return;
  }

  if (seleccionados.includes(idPersonal)) {
    setSeleccionados(seleccionados.filter(x => x !== idPersonal));
  } else {
    setSeleccionados([...seleccionados, idPersonal]);
  }
}

  async function guardar() {

    if (!evaluador) {

      alert("Seleccione un evaluador");

      return;

    }

    const r = await guardarAsignaciones(
      evaluador,
      seleccionados
    );

    if (r?.error) {

      alert(r.error.message);

      return;

    }

    alert("Asignaciones guardadas correctamente.");

  }

  const areasUnicas = [
  ...new Set(
    personal
      .map((p) => p.area)
      .filter((area) => area && area.trim() !== "")
  )
].sort();

const personalFiltrado = personal.filter((p) => {

  const asignadoAOtro =
    personalAsignado.includes(p.id) &&
    !seleccionados.includes(p.id);

  if (asignadoAOtro) return false;

  const coincideArea = areaFiltro ? p.area === areaFiltro : true;

  const coincideBusqueda =
    `${p.dni} ${p.nombres} ${p.apellidos} ${p.area || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase());

  return coincideArea && coincideBusqueda;
});

  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>Asignación de Evaluadores</h1>

          <p>
            Seleccione el personal que evaluará cada usuario.
          </p>

        </div>

      </div>

      <div className="table-card asignacion-card" style={{ padding: 25 }}>

        <label><strong>Evaluador</strong></label>

        <select
        className="evaluador-select"
        value={evaluador}
        onChange={(e) => setEvaluador(e.target.value)}
        >

          <option value="">
            Seleccione
          </option>

          {

            evaluadores.map(u => (

              <option
                key={u.id}
                value={u.id}
              >

                {u.personal?.apellidos}, {u.personal?.nombres} - {u.personal?.cargo || 'Sin cargo'} ({u.rol})

              </option>

            ))

          }

        </select>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
  <input
    className="search-input"
    placeholder="Buscar por DNI, nombres o apellidos..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
  />

  <select
    className="search-input"
    value={areaFiltro}
    onChange={(e) => setAreaFiltro(e.target.value)}
  >
    <option value="">Todas las áreas</option>

    {areasUnicas.map((area) => (
      <option key={area} value={area}>
        {area}
      </option>
    ))}
  </select>

  <button
    className="filter-btn"
    onClick={() => {
      setBusqueda("");
      setAreaFiltro("");
    }}
  >
    Limpiar
  </button>
</div>

<p className="result-count">
  Mostrando {personalFiltrado.length} de {personal.length} trabajadores
</p>
        <table>

          <thead>

            <tr>

              <th width="60"></th>

              <th>DNI</th>

              <th>Apellidos y Nombres</th>

            </tr>

          </thead>

          <tbody>

            {

              personalFiltrado.map(p => (

                <tr key={p.id}>

                  <td>

                    <input
                        type="checkbox"
                        checked={seleccionados.includes(p.id)}
                        disabled={
                            evaluadores.find(u => u.id === evaluador)?.personal_id === p.id
                        }
                        onChange={() => cambiarSeleccion(p.id)}
                    />

                  </td>

                  <td>{p.dni}</td>

                  <td>

                    {p.apellidos}, {p.nombres}

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>

        <div
          style={{
            marginTop: 25,
            textAlign: "right"
          }}
        >

          <button
            className="primary-btn"
            onClick={guardar}
          >

            Guardar Asignaciones

          </button>

        </div>

      </div>

    </div>

  );

}

export default Asignaciones;