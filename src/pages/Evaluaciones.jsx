import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerPanelEvaluaciones,
  obtenerHistorialEvaluaciones,
} from "../services/evaluacionesService";
import { Toast } from "../lib/toast";

import {
  ClipboardList,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  Play,
  Eye,
  FileText,
} from "lucide-react";

import "../styles/evaluaciones-listado.css";

function Evaluaciones() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [periodo, setPeriodo] = useState(null);
  const [sinPeriodoActivo, setSinPeriodoActivo] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const [respuestaPanel, respuestaHistorial] = await Promise.all([
      obtenerPanelEvaluaciones(),
      obtenerHistorialEvaluaciones(),
    ]);

    if (respuestaHistorial.error) {
      Toast.error(respuestaHistorial.error.message);
    } else {
      setHistorial(respuestaHistorial.data || []);
    }

    if (respuestaPanel.error) {
      if (
        respuestaPanel.error.message ===
        "No hay un período de evaluación activo."
      ) {
        setRegistros([]);
        setPeriodo(null);
        setSinPeriodoActivo(true);
        return;
      }

      Toast.error(respuestaPanel.error.message);
      return;
    }

    setSinPeriodoActivo(false);
    setRegistros(respuestaPanel.data || []);
    setPeriodo(respuestaPanel.periodo || null);
  };

  const irEvaluacion = (registro) => {
    if (registro.evaluacion?.id) {
      navigate(`/admin/evaluaciones/${registro.evaluacion.id}`);
    } else {
      navigate(`/admin/evaluaciones/nueva?personal=${registro.personal.id}`);
    }
  };

  const pendientes = registros.filter((r) => r.estado === "pendiente");
  const enProceso = registros.filter((r) => r.estado === "proceso");
  const finalizadas = registros.filter((r) => r.estado === "finalizada");

  const total = registros.length;
  const progreso =
    total > 0 ? Math.round((finalizadas.length / total) * 100) : 0;

  const renderCard = (r) => (
    <article className="evaluacion-list-card" key={r.personal.id}>
      <div className="evaluacion-person">
        <div className="evaluacion-avatar">
          {`${r.personal.nombres?.charAt(0) || ""}${
            r.personal.apellidos?.charAt(0) || ""
          }`.toUpperCase()}
        </div>

        <div className="evaluacion-person-info">
          <div className="evaluacion-person-title">
            <h3>
              {r.personal.apellidos}, {r.personal.nombres}
            </h3>

            <span className={`evaluacion-state ${r.estado}`}>
              {r.estado === "pendiente"
                ? "Pendiente"
                : r.estado === "proceso"
                  ? "En proceso"
                  : "Finalizada"}
            </span>
          </div>

          <p>
            {r.personal.area || "Sin área"}
            {" · "}
            {r.personal.cargo || "Sin cargo"}
            {" · "}
            DNI: {r.personal.dni}
          </p>

          {r.evaluacion && (
            <span className="evaluacion-promedio">
              Promedio: {Number(r.evaluacion.promedio).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="evaluacion-list-actions">
        <button
          type="button"
          className={
            r.estado === "finalizada" ? "secondary-btn" : "primary-btn"
          }
          onClick={() => irEvaluacion(r)}
        >
          {r.estado === "pendiente" ? (
            <>
              <Play size={15} />
              Iniciar
            </>
          ) : r.estado === "finalizada" ? (
            <>
              <Eye size={15} />
              Ver evaluación
            </>
          ) : (
            <>
              <Play size={15} />
              Continuar
            </>
          )}
        </button>

        {r.estado === "finalizada" && (
          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              navigate(`/admin/evaluaciones/${r.evaluacion.id}/reporte`)
            }
          >
            <FileText size={15} />
            Ver reporte
          </button>
        )}
      </div>
    </article>
  );

  const historialPorPeriodo = historial.reduce((grupos, evaluacion) => {
    const periodoTexto = evaluacion.periodos
      ? `${evaluacion.periodos.anio} - ${evaluacion.periodos.nombre}`
      : "Período sin identificar";

    if (!grupos[periodoTexto]) {
      grupos[periodoTexto] = [];
    }

    grupos[periodoTexto].push(evaluacion);

    return grupos;
  }, {});

  return (
    <div className="evaluaciones-page">
      <div className="page-header evaluaciones-page-header">
        <div>
          <span className="evaluaciones-kicker">Evaluación de personal</span>

          <h1>Mis evaluaciones</h1>

          <p>
            Período activo:{" "}
            {periodo ? `${periodo.anio} - ${periodo.nombre}` : "No configurado"}
          </p>
        </div>
      </div>

      {sinPeriodoActivo ? (
        <div className="evaluaciones-empty">
          <strong>No hay un período activo</strong>
          <p>
            Las evaluaciones estarán disponibles cuando el administrador active
            un nuevo bimestre.
          </p>
        </div>
      ) : (
        <>
          <div className="evaluaciones-stats">
            <div className="evaluaciones-stat">
              <div className="evaluaciones-stat-icon eval-stat-total">
                <ClipboardList size={20} />
              </div>

              <div>
                <span>Total asignadas</span>
                <strong>{total}</strong>
              </div>
            </div>

            <div className="evaluaciones-stat">
              <div className="evaluaciones-stat-icon eval-stat-pendiente">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Pendientes</span>
                <strong>{pendientes.length}</strong>
              </div>
            </div>

            <div className="evaluaciones-stat">
              <div className="evaluaciones-stat-icon eval-stat-proceso">
                <LoaderCircle size={20} />
              </div>

              <div>
                <span>En proceso</span>
                <strong>{enProceso.length}</strong>
              </div>
            </div>

            <div className="evaluaciones-stat">
              <div className="evaluaciones-stat-icon eval-stat-finalizada">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>Finalizadas</span>
                <strong>{finalizadas.length}</strong>
              </div>
            </div>
          </div>

          <section className="evaluaciones-progress">
            <div className="evaluaciones-progress-header">
              <strong>Avance general del período</strong>
              <span>{progreso}%</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progreso}%` }}
              />
            </div>

            <p>
              {finalizadas.length} de {total} evaluaciones finalizadas.
            </p>
          </section>

          <section className="evaluaciones-section">
            <div className="evaluaciones-section-header">
              <h2>Pendientes</h2>
              <span className="evaluaciones-section-count">
                {pendientes.length}
              </span>
            </div>

            <div className="evaluaciones-list">
              {pendientes.map(renderCard)}

              {pendientes.length === 0 && (
                <div className="evaluaciones-empty">
                  No tienes evaluaciones pendientes.
                </div>
              )}
            </div>
          </section>

          <section className="evaluaciones-section">
            <div className="evaluaciones-section-header">
              <h2>En proceso</h2>
              <span className="evaluaciones-section-count">
                {enProceso.length}
              </span>
            </div>

            <div className="evaluaciones-list">
              {enProceso.map(renderCard)}

              {enProceso.length === 0 && (
                <div className="evaluaciones-empty">
                  No hay evaluaciones en proceso.
                </div>
              )}
            </div>
          </section>

          <section className="evaluaciones-section">
            <div className="evaluaciones-section-header">
              <h2>Finalizadas</h2>
              <span className="evaluaciones-section-count">
                {finalizadas.length}
              </span>
            </div>

            <div className="evaluaciones-list">
              {finalizadas.map(renderCard)}

              {finalizadas.length === 0 && (
                <div className="evaluaciones-empty">
                  Aún no has finalizado evaluaciones.
                </div>
              )}
            </div>
          </section>
        </>
      )}
      {historial.length > 0 && (
        <section className="evaluaciones-section">
          <div className="evaluaciones-section-header">
            <h2>Historial de evaluaciones</h2>

            <span className="evaluaciones-section-count">
              {historial.length}
            </span>
          </div>

          <div className="evaluaciones-historial">
            {Object.entries(historialPorPeriodo).map(
              ([periodoNombre, evaluacionesPeriodo]) => (
                <div
                  className="evaluaciones-historial-periodo"
                  key={periodoNombre}
                >
                  <div className="evaluaciones-historial-header">
                    <div>
                      <strong>{periodoNombre}</strong>
                      <span>
                        {evaluacionesPeriodo.length} evaluación
                        {evaluacionesPeriodo.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="evaluaciones-list">
                    {evaluacionesPeriodo.map((r) => (
                      <article className="evaluacion-list-card" key={r.id}>
                        <div className="evaluacion-person">
                          <div className="evaluacion-avatar">
                            {`${r.personal?.nombres?.charAt(0) || ""}${
                              r.personal?.apellidos?.charAt(0) || ""
                            }`.toUpperCase()}
                          </div>

                          <div className="evaluacion-person-info">
                            <div className="evaluacion-person-title">
                              <h3>
                                {r.personal?.apellidos}, {r.personal?.nombres}
                              </h3>

                              <span className={`evaluacion-state ${r.estado}`}>
                                {r.estado === "finalizada"
                                  ? "Finalizada"
                                  : r.estado === "proceso"
                                    ? "En proceso"
                                    : r.estado}
                              </span>
                            </div>

                            <p>
                              {r.personal?.area || "Sin área"}
                              {" · "}
                              {r.personal?.cargo || "Sin cargo"}
                              {" · "}
                              DNI: {r.personal?.dni || "-"}
                            </p>

                            <span className="evaluacion-promedio">
                              Promedio: {Number(r.promedio || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="evaluacion-list-actions">
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() =>
                              navigate(`/admin/evaluaciones/${r.id}`)
                            }
                          >
                            <Eye size={15} />
                            Ver evaluación
                          </button>

                          {r.estado === "finalizada" && (
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() =>
                                navigate(`/admin/evaluaciones/${r.id}/reporte`)
                              }
                            >
                              <FileText size={15} />
                              Ver reporte
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Evaluaciones;
