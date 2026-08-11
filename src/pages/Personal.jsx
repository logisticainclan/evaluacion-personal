import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ClipboardCheck,
  Search,
  SlidersHorizontal,
  Plus,
} from "lucide-react";

import PersonalTable from "../components/personal/PersonalTable";
import PersonalModal from "../components/personal/PersonalModal";
import { ConfirmModal } from "../components/ui";
import { Toast } from "../lib/toast";
import "../styles/personal.css";

import {
  obtenerPersonal,
  obtenerAreasActivas,
  obtenerCargosActivos,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal,
  asegurarArea,
} from "../services/personalService";

function Personal() {
  const [personal, setPersonal] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [evaluableFiltro, setEvaluableFiltro] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [personalEditando, setPersonalEditando] = useState(null);
  const [personalAEliminar, setPersonalAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [resPersonal, resAreas, resCargos] = await Promise.all([
      obtenerPersonal(),
      obtenerAreasActivas(),
      obtenerCargosActivos(),
    ]);

    console.log("Respuesta áreas:", resAreas);
    console.log("Áreas recibidas:", resAreas.data);

    if (resPersonal.error) {
      Toast.error(resPersonal.error.message);
      return;
    }

    if (resAreas.error) {
      Toast.error(resAreas.error.message);
      return;
    }

    if (resCargos.error) {
      Toast.error(resCargos.error.message);
      return;
    }

    setPersonal(resPersonal.data || []);
    setAreas(resAreas.data || []);
    setCargos(resCargos.data || []);
  };

  const abrirNuevo = () => {
    setPersonalEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (registro) => {
    setPersonalEditando(registro);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPersonalEditando(null);
  };

  const guardar = async (form) => {
    const nombreArea = form.area.trim();
    const nombreCargo = form.cargo.trim();

    const resArea = await asegurarArea(nombreArea);

    if (resArea.error) {
      Toast.error(`No se pudo registrar el área: ${resArea.error.message}`);
      return;
    }

    const datos = {
      dni: form.dni.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      area: resArea.data.nombre,
      cargo: nombreCargo,
      estado: form.estado,
      es_evaluable: form.es_evaluable,
    };

    const respuesta = personalEditando
      ? await actualizarPersonal(personalEditando.id, datos)
      : await crearPersonal(datos);

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return;
    }

    Toast.success(
      personalEditando
        ? "Personal actualizado correctamente"
        : "Personal registrado correctamente",
    );

    cerrarModal();
    await cargarDatos();
  };

  const solicitarEliminar = (registro) => {
    setPersonalAEliminar(registro);
  };

  const confirmarEliminar = async () => {
    if (!personalAEliminar?.id || eliminando) return;

    setEliminando(true);

    const { error } = await eliminarPersonal(personalAEliminar.id);

    setEliminando(false);

    if (error) {
      const tieneRegistrosRelacionados =
        error.code === "23503" ||
        error.message?.includes("foreign key constraint");

      if (tieneRegistrosRelacionados) {
        Toast.error(
          "Este personal tiene evaluaciones registradas y no puede eliminarse. Será desactivado.",
        );

        await desactivarPersonal(personalAEliminar);
        return;
      }

      Toast.error(error.message);
      return;
    }

    Toast.success("Registro eliminado correctamente");
    setPersonalAEliminar(null);
    await cargarDatos();
  };

  const areasUnicas = useMemo(
    () =>
      [
        ...new Set(
          personal
            .map((p) => p.area)
            .filter((area) => area && area.trim() !== ""),
        ),
      ].sort(),
    [personal],
  );

  const personalFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return personal.filter((p) => {
      const coincideBusqueda = `
        ${p.dni || ""}
        ${p.nombres || ""}
        ${p.apellidos || ""}
        ${p.area || ""}
        ${p.cargo || ""}
      `
        .toLowerCase()
        .includes(termino);

      const coincideArea = areaFiltro ? p.area === areaFiltro : true;
      const coincideEstado = estadoFiltro ? p.estado === estadoFiltro : true;

      const coincideEvaluable =
        evaluableFiltro === ""
          ? true
          : evaluableFiltro === "si"
            ? p.es_evaluable === true
            : p.es_evaluable === false;

      return (
        coincideBusqueda && coincideArea && coincideEstado && coincideEvaluable
      );
    });
  }, [personal, busqueda, areaFiltro, estadoFiltro, evaluableFiltro]);

  const resumen = useMemo(() => {
    const activos = personal.filter((p) => p.estado === "activo").length;

    const inactivos = personal.filter((p) => p.estado === "inactivo").length;

    const evaluables = personal.filter((p) => p.es_evaluable).length;

    return {
      total: personal.length,
      activos,
      inactivos,
      evaluables,
    };
  }, [personal]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setAreaFiltro("");
    setEstadoFiltro("");
    setEvaluableFiltro("");
  };

  const desactivarPersonal = async (registro) => {
    const { error } = await actualizarPersonal(registro.id, {
      estado: "inactivo",
      es_evaluable: false,
    });

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success("Personal desactivado correctamente");
    setPersonalAEliminar(null);
    await cargarDatos();
  };

  const hayFiltros = busqueda || areaFiltro || estadoFiltro || evaluableFiltro;

  const areasDisponibles = useMemo(() => {
    const nombresCatalogo = areas.map((area) => area.nombre).filter(Boolean);

    const nombresUsados = personal
      .map((persona) => persona.area)
      .filter(Boolean);

    const mapaAreas = new Map();

    [...nombresCatalogo, ...nombresUsados].forEach((nombre) => {
      const nombreLimpio = nombre.trim();

      const clave = nombreLimpio
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase();

      if (!mapaAreas.has(clave)) {
        mapaAreas.set(clave, nombreLimpio);
      }
    });

    return Array.from(mapaAreas.values()).sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }, [areas, personal]);

  return (
    <div className="personal-page">
      <div className="page-header personal-page-header">
        <div>
          <span className="personal-page-kicker">Gestión institucional</span>

          <h1>Personal</h1>

          <p>Administra el registro del personal de la institución.</p>
        </div>

        <button className="primary-btn" onClick={abrirNuevo}>
          <Plus size={18} />
          Registrar personal
        </button>
      </div>

      <div className="personal-stats-grid">
        <article className="personal-stat-card">
          <div className="personal-stat-icon personal-stat-blue">
            <Users size={22} />
          </div>

          <div>
            <span>Total registrado</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article className="personal-stat-card">
          <div className="personal-stat-icon personal-stat-green">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Personal activo</span>
            <strong>{resumen.activos}</strong>
          </div>
        </article>

        <article className="personal-stat-card">
          <div className="personal-stat-icon personal-stat-red">
            <UserX size={22} />
          </div>

          <div>
            <span>Personal inactivo</span>
            <strong>{resumen.inactivos}</strong>
          </div>
        </article>

        <article className="personal-stat-card">
          <div className="personal-stat-icon personal-stat-violet">
            <ClipboardCheck size={22} />
          </div>

          <div>
            <span>Personal evaluable</span>
            <strong>{resumen.evaluables}</strong>
          </div>
        </article>
      </div>

      <section className="personal-filters-card">
        <div className="personal-filter-title">
          <SlidersHorizontal size={18} />

          <div>
            <strong>Filtros</strong>
            <span>Encuentra rápidamente un registro</span>
          </div>
        </div>

        <div className="personal-filters-grid">
          <div className="personal-search-wrapper">
            <Search size={18} />

            <input
              className="personal-filter-control"
              placeholder="Buscar por DNI, nombres, apellidos, área o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="personal-filter-control"
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

          <select
            className="personal-filter-control"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <select
            className="personal-filter-control"
            value={evaluableFiltro}
            onChange={(e) => setEvaluableFiltro(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="si">Evaluables</option>
            <option value="no">No evaluables</option>
          </select>

          <button
            type="button"
            className="secondary-btn personal-clear-btn"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar
          </button>
        </div>
      </section>

      <div className="personal-results-summary">
        <span>
          Mostrando <strong>{personalFiltrado.length}</strong> de{" "}
          <strong>{personal.length}</strong> registros
        </span>
      </div>

      <PersonalTable
        personal={personalFiltrado}
        onEditar={abrirEditar}
        onEliminar={solicitarEliminar}
      />

      <PersonalModal
        abierto={modalAbierto}
        onCerrar={cerrarModal}
        onGuardar={guardar}
        areas={areasDisponibles}
        cargos={cargos}
        personalEditando={personalEditando}
      />

      <ConfirmModal
        open={Boolean(personalAEliminar)}
        title="Eliminar personal"
        message={
          personalAEliminar
            ? `¿Deseas eliminar a ${personalAEliminar.apellidos}, ${personalAEliminar.nombres}? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText={eliminando ? "Eliminando..." : "Eliminar"}
        variant="danger"
        onCancel={() => {
          if (!eliminando) {
            setPersonalAEliminar(null);
          }
        }}
        onConfirm={confirmarEliminar}
      />
    </div>
  );
}

export default Personal;
