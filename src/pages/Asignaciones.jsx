import { useEffect, useState } from "react";
import { Toast } from "../lib/toast";
import { Messages } from "../lib/messages";

import { Search, Users, UserCheck, ClipboardCheck } from "lucide-react";

import "../styles/asignaciones.css";

import {
  obtenerEvaluadores,
  obtenerPersonal,
  obtenerAsignaciones,
  guardarAsignaciones,
  obtenerPersonalAsignadoPeriodo,
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
      Toast.error(e.error.message);
      return;
    }

    if (p.error) {
      Toast.error(p.error.message);
      return;
    }

    if (a.error) {
      Toast.error(a.error.message);
      return;
    }

    setEvaluadores(e.data || []);
    setPersonal(p.data || []);
    setPersonalAsignado(a.data?.map((x) => x.personal_id) || []);
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
      Toast.error(r.error.message);

      return;
    }

    setSeleccionados((r.data || []).map((x) => x.personal_id));
  }

  function cambiarSeleccion(idPersonal) {
    if (!evaluador) {
      Toast.error("Primero seleccione un evaluador");
      return;
    }

    const usuarioEvaluador = evaluadores.find((u) => u.id === evaluador);

    if (usuarioEvaluador?.personal_id === idPersonal) {
      Toast.error("Un evaluador no puede evaluarse a sí mismo");
      return;
    }

    if (seleccionados.includes(idPersonal)) {
      setSeleccionados(seleccionados.filter((x) => x !== idPersonal));
    } else {
      setSeleccionados([...seleccionados, idPersonal]);
    }
  }

  async function guardar() {
    if (!evaluador) {
      Toast.error("Seleccione un evaluador");
      return;
    }

    const r = await guardarAsignaciones(evaluador, seleccionados);

    if (r?.error) {
      Toast.error(r.error.message);
      return;
    }

    const asignadosPeriodo = await obtenerPersonalAsignadoPeriodo();

    if (asignadosPeriodo.error) {
      Toast.error(asignadosPeriodo.error.message);
      return;
    }

    setPersonalAsignado(
      (asignadosPeriodo.data || []).map((x) => x.personal_id),
    );

    Toast.success(Messages.asignacionesGuardadas);
  }

  const areasUnicas = [
    ...new Set(
      personal.map((p) => p.area).filter((area) => area && area.trim() !== ""),
    ),
  ].sort();

  const personalFiltrado = personal.filter((p) => {
    const asignadoAOtro =
      personalAsignado.includes(p.id) && !seleccionados.includes(p.id);

    if (asignadoAOtro) return false;

    const coincideArea = areaFiltro ? p.area === areaFiltro : true;

    const coincideBusqueda =
      `${p.dni} ${p.nombres} ${p.apellidos} ${p.area || ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    return coincideArea && coincideBusqueda;
  });

  const totalSeleccionados = seleccionados.length;

  const totalDisponibles = personalFiltrado.length;

  const totalAsignadosPeriodo = personalAsignado.length;

  return (
    <div className="asignaciones-page">
      <div className="page-header asignaciones-header">
        <div>
          <h1>Asignación de Evaluadores</h1>
          <p>Seleccione el personal que evaluará cada usuario.</p>
        </div>
      </div>

      <div className="asignaciones-stats">
        <div className="asignacion-stat">
          <div className="asignacion-stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Personal evaluable</span>
            <strong>{personal.length}</strong>
          </div>
        </div>

        <div className="asignacion-stat">
          <div className="asignacion-stat-icon">
            <UserCheck size={20} />
          </div>

          <div>
            <span>Seleccionados</span>
            <strong>{totalSeleccionados}</strong>
          </div>
        </div>

        <div className="asignacion-stat">
          <div className="asignacion-stat-icon">
            <ClipboardCheck size={20} />
          </div>

          <div>
            <span>Asignados en el período</span>
            <strong>{totalAsignadosPeriodo}</strong>
          </div>
        </div>
      </div>

      <section className="asignaciones-panel">
        <div className="asignaciones-panel-header">
          <div>
            <h2>Evaluador</h2>
            <p>
              Selecciona el usuario responsable de realizar las evaluaciones.
            </p>
          </div>
        </div>

        <div className="asignaciones-field">
          <label>Usuario evaluador</label>

          <select
            value={evaluador}
            onChange={(e) => setEvaluador(e.target.value)}
          >
            <option value="">Seleccione un evaluador</option>

            {evaluadores.map((u) => (
              <option key={u.id} value={u.id}>
                {u.personal?.apellidos}, {u.personal?.nombres}
                {" - "}
                {u.personal?.cargo || "Sin cargo"} ({u.rol})
              </option>
            ))}
          </select>
        </div>

        <div className="asignaciones-filters">
          <div className="asignaciones-search">
            <Search size={17} />

            <input
              className="asignaciones-filter-control"
              placeholder="Buscar por DNI, nombres o apellidos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="asignaciones-filter-control"
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
            type="button"
            className="secondary-btn"
            onClick={() => {
              setBusqueda("");
              setAreaFiltro("");
            }}
            disabled={!busqueda && !areaFiltro}
          >
            Limpiar
          </button>
        </div>

        <div className="asignaciones-summary">
          <span>
            Mostrando <strong>{totalDisponibles}</strong> de{" "}
            <strong>{personal.length}</strong> trabajadores
          </span>

          {evaluador && (
            <span>
              <strong>{totalSeleccionados}</strong> seleccionados
            </span>
          )}
        </div>

        <div className="asignaciones-table-card">
          <div className="asignaciones-table-scroll">
            <table className="asignaciones-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Personal</th>
                  <th>Área</th>
                  <th>Cargo</th>
                </tr>
              </thead>

              <tbody>
                {personalFiltrado.map((p) => {
                  const seleccionado = seleccionados.includes(p.id);

                  const esMismoEvaluador =
                    evaluadores.find((u) => u.id === evaluador)?.personal_id ===
                    p.id;

                  return (
                    <tr
                      key={p.id}
                      className={seleccionado ? "asignacion-row-selected" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="asignacion-checkbox"
                          checked={seleccionado}
                          disabled={esMismoEvaluador}
                          onChange={() => cambiarSeleccion(p.id)}
                        />
                      </td>

                      <td>
                        <div className="asignacion-person">
                          <div className="asignacion-avatar">
                            {`${p.nombres?.charAt(0) || ""}${
                              p.apellidos?.charAt(0) || ""
                            }`.toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {p.apellidos}, {p.nombres}
                            </strong>

                            <span>DNI: {p.dni}</span>
                          </div>
                        </div>
                      </td>

                      <td>{p.area || "Sin área"}</td>
                      <td>{p.cargo || "Sin cargo"}</td>
                    </tr>
                  );
                })}

                {personalFiltrado.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-table">
                      No hay personal disponible con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="asignaciones-footer">
          <button
            className="primary-btn"
            type="button"
            onClick={guardar}
            disabled={!evaluador}
          >
            Guardar asignaciones
          </button>
        </div>
      </section>
    </div>
  );
}

export default Asignaciones;
