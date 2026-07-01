import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPanelEvaluaciones } from "../services/evaluacionesService";

function Evaluaciones() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [periodo, setPeriodo] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await obtenerPanelEvaluaciones();

    if (error) {
      alert(error.message);
      return;
    }

    setRegistros(data || []);
    setPeriodo(data?.[0]?.periodo || null);
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
  const progreso = total > 0 ? Math.round((finalizadas.length / total) * 100) : 0;

  const renderCard = (r) => (
    <div className="eval-card" key={r.personal.id}>
      <div>
        <span className={`eval-dot ${r.estado}`}></span>

        <h3>
          {r.personal.apellidos}, {r.personal.nombres}
        </h3>

        <p>{r.personal.area || "-"} · {r.personal.cargo || "-"}</p>

        {r.evaluacion && (
          <small>
            Promedio: {Number(r.evaluacion.promedio).toFixed(2)}
          </small>
        )}
      </div>

      <button
        className={r.estado === "finalizada" ? "secondary-btn" : "primary-btn"}
        onClick={() => irEvaluacion(r)}
      >
        {r.estado === "pendiente"
          ? "Iniciar"
          : r.estado === "finalizada"
          ? "Ver evaluación"
          : "Continuar"}
      </button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mis evaluaciones</h1>
          <p>
            Periodo activo: {periodo ? `${periodo.anio} - ${periodo.nombre}` : "No configurado"}
          </p>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-header">
          <strong>Avance general</strong>
          <span>{progreso}%</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progreso}%` }} />
        </div>

        <p>{finalizadas.length} de {total} evaluaciones finalizadas.</p>
      </div>

      <section className="eval-section">
        <h2>Pendientes ({pendientes.length})</h2>
        {pendientes.map(renderCard)}
      </section>

      <section className="eval-section">
        <h2>En proceso ({enProceso.length})</h2>
        {enProceso.map(renderCard)}
      </section>

      <section className="eval-section">
        <h2>Finalizadas ({finalizadas.length})</h2>
        {finalizadas.map(renderCard)}
      </section>
    </div>
  );
}

export default Evaluaciones;