import { useEffect, useState } from "react";
import { Button, ConfirmModal } from "../components/ui";
import { Toast } from "../lib/toast";
import { Messages } from "../lib/messages";
import {
  CalendarDays,
  Users,
  UserCheck,
  CheckCircle2,
  Clock3,
  Plus,
  Pencil,
  PlayCircle,
  Lock,
} from "lucide-react";

import "../styles/periodos.css";
import {
  obtenerPeriodos,
  crearAnioPeriodos,
  activarPeriodo,
  cerrarPeriodo,
  actualizarFechasPeriodo,
  obtenerResumenPeriodoActivo,
} from "../services/periodosService";

function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [modal, setModal] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState(null);
  const [form, setForm] = useState({
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [confirmacion, setConfirmacion] = useState({
    open: false,
    tipo: "",
    periodo: null,
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

    if (r.error) {
      setResumen(null);
    } else {
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

  const activar = (periodo) => {
    if (!periodo.fecha_inicio || !periodo.fecha_fin) {
      Toast.error("Debe configurar las fechas antes de activar el período.");
      return;
    }

    setConfirmacion({
      open: true,
      tipo: "activar",
      periodo,
    });
  };

  const cerrar = (periodo) => {
    setConfirmacion({
      open: true,
      tipo: "cerrar",
      periodo,
    });
  };

  const abrirEditar = (periodo) => {
    setPeriodoEditando(periodo);
    setForm({
      fecha_inicio: periodo.fecha_inicio || "",
      fecha_fin: periodo.fecha_fin || "",
    });
    setModal(true);
  };

  const guardarFechas = async (e) => {
    e.preventDefault();

    if (!form.fecha_inicio || !form.fecha_fin) {
      Toast.error("Debe ingresar la fecha de inicio y la fecha de fin.");
      return;
    }

    if (form.fecha_fin < form.fecha_inicio) {
      Toast.error("La fecha de fin debe ser mayor que la fecha de inicio.");
      return;
    }

    const { error } = await actualizarFechasPeriodo(periodoEditando.id, form);

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

  const ejecutarConfirmacion = async () => {
    const periodo = confirmacion.periodo;
    const tipo = confirmacion.tipo;

    if (!periodo) return;

    setConfirmacion({
      open: false,
      tipo: "",
      periodo: null,
    });

    if (tipo === "activar") {
      const { error } = await activarPeriodo(periodo.id);

      if (error) {
        Toast.error(error.message);
        return;
      }

      Toast.success(Messages.periodoActivado);
      await cargar();
      return;
    }

    if (tipo === "cerrar") {
      const { error } = await cerrarPeriodo(periodo.id);

      if (error) {
        Toast.error(error.message);
        return;
      }

      Toast.success(Messages.periodoCerrado);
      await cargar();
    }
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
        <div className="periodos-stats">
          <div className="periodo-stat-card">
            <div className="periodo-stat-icon periodo-stat-blue">
              <Users size={20} />
            </div>
            <div>
              <span>Evaluadores</span>
              <strong>{resumen.evaluadores}</strong>
            </div>
          </div>

          <div className="periodo-stat-card">
            <div className="periodo-stat-icon periodo-stat-violet">
              <UserCheck size={20} />
            </div>
            <div>
              <span>Asignados</span>
              <strong>{resumen.totalAsignados}</strong>
            </div>
          </div>

          <div className="periodo-stat-card">
            <div className="periodo-stat-icon periodo-stat-green">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span>Finalizadas</span>
              <strong>{resumen.finalizadas}</strong>
            </div>
          </div>

          <div className="periodo-stat-card">
            <div className="periodo-stat-icon periodo-stat-orange">
              <Clock3 size={20} />
            </div>
            <div>
              <span>Pendientes</span>
              <strong>{resumen.pendientes}</strong>
            </div>
          </div>
        </div>
      )}

      {resumen && (
  <section className="periodos-progress-card">
    <div className="periodos-progress-header">
      <strong>Avance del período</strong>
      <span>{resumen.avance}%</span>
    </div>

    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${resumen.avance}%` }}
      />
    </div>

    <p>
      {resumen.finalizadas} de {resumen.totalAsignados} evaluaciones finalizadas.
    </p>
  </section>
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

          <Button onClick={crearAnio}>Crear año</Button>
        </div>
      </div>

      <div className="periodos-table-card">
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
                    <Button variant="secondary" onClick={() => abrirEditar(p)}>
                      Editar
                    </Button>

                    {p.estado === "pendiente" && (
                      <Button onClick={() => activar(p)}>Activar</Button>
                    )}

                    {p.estado === "activo" && (
                      <Button variant="danger" onClick={() => cerrar(p)}>
                        Cerrar
                      </Button>
                    )}

                    {p.estado === "cerrado" && (
                      <span className="periodo-bloqueado">Período cerrado</span>
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
    <form
      className="periodo-modal-card"
      onSubmit={guardarFechas}
    >
      <div className="periodo-modal-header">
        <div>
          <h2>Editar fechas</h2>

          <p>
            {periodoEditando
              ? `${periodoEditando.anio} - ${periodoEditando.nombre}`
              : "Configura el rango del período"}
          </p>
        </div>

        <button
          type="button"
          className="ficha-modal-close"
          onClick={() => {
            setModal(false);
            setPeriodoEditando(null);
          }}
        >
          ×
        </button>
      </div>

      <div className="periodo-modal-body">
        <div className="periodo-modal-field">
          <label>Fecha de inicio</label>

          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) =>
              setForm({
                ...form,
                fecha_inicio: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="periodo-modal-field">
          <label>Fecha de fin</label>

          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) =>
              setForm({
                ...form,
                fecha_fin: e.target.value,
              })
            }
            required
          />
        </div>
      </div>

      <div className="periodo-modal-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setModal(false);
            setPeriodoEditando(null);
          }}
        >
          Cancelar
        </Button>

        <Button type="submit">
          Guardar fechas
        </Button>
      </div>
    </form>
  </div>
)}

      <ConfirmModal
        open={confirmacion.open}
        title={
          confirmacion.tipo === "activar" ? "Activar período" : "Cerrar período"
        }
        message={
          confirmacion.tipo === "activar"
            ? `Se cerrará el período activo y se activará ${confirmacion.periodo?.anio} - ${confirmacion.periodo?.nombre}. ¿Deseas continuar?`
            : `¿Deseas cerrar ${confirmacion.periodo?.anio} - ${confirmacion.periodo?.nombre}?`
        }
        confirmText={confirmacion.tipo === "activar" ? "Activar" : "Cerrar"}
        variant={confirmacion.tipo === "activar" ? "primary" : "danger"}
        onCancel={() =>
          setConfirmacion({
            open: false,
            tipo: "",
            periodo: null,
          })
        }
        onConfirm={ejecutarConfirmacion}
      />
    </div>
  );
}

export default Periodos;
