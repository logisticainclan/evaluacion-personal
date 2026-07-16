import { useEffect, useState } from "react";
import { StatCard, Card } from "../components/ui";
import { Toast } from "../lib/toast";
import { Messages } from "../lib/messages";
import { Button } from "../components/ui";
import {
  obtenerPeriodos,
  crearAnioPeriodos,
  activarPeriodo,
  cerrarPeriodo,
  actualizarFechasPeriodo,
  obtenerResumenPeriodoActivo
} from "../services/periodosService";

function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [modal, setModal] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState(null);
  const [form, setForm] = useState({
  fecha_inicio: "",
  fecha_fin: ""
});

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await obtenerPeriodos();

    if (error) {
      Toast.error(error.message);
      return;
    }

    setPeriodos(data || []);

    const r = await obtenerResumenPeriodoActivo();

    if (!r.error) {
      setResumen(r.data);
    }
  };

  const crearAnio = async () => {
    const existeAnio = periodos.some((p) => p.anio === Number(anio));

    if (existeAnio) {
      Toast.error(`El año ${anio} ya existe.`);
      return;
    }
    const { error } = await crearAnioPeriodos(Number(anio));

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(Messages.anioCreado);
    cargar();
  };

  const activar = async (periodo) => {
    if (!periodo.fecha_inicio || !periodo.fecha_fin) {
      Toast.error("Debe configurar las fechas antes de activar el período.");
      return;
    }

    const confirmar = confirm(
      `Se cerrará el período activo y se activará ${periodo.anio} - ${periodo.nombre}. ¿Deseas continuar?`
    );

    if (!confirmar) return;

    const { error } = await activarPeriodo(periodo.id);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(Messages.periodoActivado);
    cargar();
  };

  const cerrar = async (id) => {
    if (!confirm("¿Deseas cerrar este período?")) return;

    const { error } = await cerrarPeriodo(id);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(Messages.periodoCerrado);
    cargar();
  };

  const abrirEditar = (periodo) => {
  setPeriodoEditando(periodo);
  setForm({
    fecha_inicio: periodo.fecha_inicio || "",
    fecha_fin: periodo.fecha_fin || ""
  });
  setModal(true);
};

const guardarFechas = async (e) => {
  e.preventDefault();

  if (form.fecha_fin < form.fecha_inicio) {
    Toast.error("La fecha de fin debe ser mayor que la fecha de inicio.");
    return;
  }

  const { error } = await actualizarFechasPeriodo(
    periodoEditando.id,
    form
  );

  if (error) {
    Toast.error(error.message);
    return;
  }

  setModal(false);
  setPeriodoEditando(null);

  Toast.success(Messages.fechasActualizadas);
  cargar();
};

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
};

const periodoActivo = periodos.find((p) => p.estado === "activo");

  return (
  <div>
    <div className="page-header">
      <div>
        <h1>Períodos de Evaluación</h1>
        <p>Gestión de bimestres activos, pendientes y cerrados</p>
      </div>
    </div>

    {periodoActivo ? (
      <div className="periodo-activo-card">
        <div>
          <span>Período activo</span>

          <h2>
            {periodoActivo.anio} - {periodoActivo.nombre}
          </h2>

          <p>
            {formatearFecha(periodoActivo.fecha_inicio)}
            {" — "}
            {formatearFecha(periodoActivo.fecha_fin)}
          </p>
        </div>

        <strong>Activo</strong>
      </div>
    ) : (
      <div className="periodo-sin-activo">
        <strong>No existe un período activo</strong>
        <p>Active un bimestre para habilitar asignaciones y evaluaciones.</p>
      </div>
    )}

    {resumen && (
      <div className="stats-grid">

        <StatCard
          title="Evaluadores"
          value={resumen.evaluadores}
        />

        <StatCard
          title="Asignados"
          value={resumen.totalAsignados}
        />

        <StatCard
          title="Finalizadas"
          value={resumen.finalizadas}
        />

        <StatCard
          title="Pendientes"
          value={resumen.pendientes}
        />

      </div>
    )}

    {resumen && (
      <Card className="dashboard-card">

        <div className="progress-header">
          <strong>Avance del período</strong>
          <span>{resumen.avance}%</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${resumen.avance}%`
            }}
          />
        </div>

        <p>
          {resumen.finalizadas} de{" "}
          {resumen.totalAsignados}
          {" "}evaluaciones finalizadas.
        </p>

      </Card>
    )}

    <div className="periodos-toolbar">
  <div>
    <h3>Crear año escolar</h3>
    <p>Genera automáticamente los 4 bimestres del año.</p>
  </div>

  <div className="periodos-create-row">
    <input
      type="number"
      value={anio}
      onChange={(e) => setAnio(e.target.value)}
    />

    <Button onClick={crearAnio}>
        Crear año
    </Button>
  </div>
</div>

    <div className="table-card">
      <table className="periodos-table">
        <thead>
          <tr>
            <th>Año</th>
            <th>Bimestre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {periodos.map((p) => (
            <tr key={p.id}>
              <td>{p.anio}</td>
              <td>{p.nombre}</td>
              <td>{formatearFecha(p.fecha_inicio)}</td>
              <td>{formatearFecha(p.fecha_fin)}</td>
              <td>
                <span className={`periodo-status ${p.estado}`}>
                  {p.estado}
                </span>
              </td>
              <td>
                <div className="periodos-actions">
                <Button
                    variant="secondary"
                    onClick={() => abrirEditar(p)}
                >
                    Editar
                </Button>

                {p.estado === "pendiente" && (
                  <button
                    className="primary-btn"
                    onClick={() => activar(p)}
                  >
                    Activar
                  </button>
                )}

                {p.estado === "activo" && (
                  <Button
                      variant="danger"
                    onClick={() => cerrar(p.id)}
                  >
                    Cerrar
                  </Button>
                )}

                {p.estado === "cerrado" && (
                  <span className="periodo-bloqueado">
                    Período cerrado
                  </span>
                )}
                </div>
              </td>
            </tr>
          ))}

          {periodos.length === 0 && (
            <tr>
              <td colSpan="6" className="empty-table">
                No hay períodos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {modal && (
      <div className="modal-bg">
        <form className="modal-card" onSubmit={guardarFechas}>
          <h2>Editar fechas</h2>

          <label>Fecha de inicio</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) =>
              setForm({ ...form, fecha_inicio: e.target.value })
            }
            required
          />

          <label>Fecha de fin</label>
          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) =>
              setForm({ ...form, fecha_fin: e.target.value })
            }
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={() => setModal(false)}>
              Cancelar
            </button>

            <button className="primary-btn" type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
);
}

export default Periodos;