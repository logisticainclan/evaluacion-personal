import { useEffect, useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";

import EvaluacionHeader from "../components/evaluacion/EvaluacionHeader";
import SeccionCard from "../components/evaluacion/SeccionCard";
import ObservacionBox from "../components/evaluacion/ObservacionBox";
import ResumenEvaluacion from "../components/evaluacion/ResumenEvaluacion";
import "../styles/evaluacion.css";
import EvaluacionSidebar from "../components/evaluacion/EvaluacionSidebar";
import { Toast } from "../lib/toast";
import { Messages } from "../lib/messages";
import { ConfirmModal } from "../components/ui";

import {
  obtenerPersonalEvaluable,
  obtenerFicha,
  obtenerPeriodoActivo,
  obtenerEvaluacionPorId,
  guardarEvaluacionCompleta,
  finalizarEvaluacion,
} from "../services/evaluacionesService";

function Evaluacion() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const [personal, setPersonal] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [items, setItems] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [periodo, setPeriodo] = useState(null);
  const [periodoCerrado, setPeriodoCerrado] = useState(false);

  const [evaluacionId, setEvaluacionId] = useState(id || null);
  const [estado, setEstado] = useState("proceso");

  const [personalSeleccionado, setPersonalSeleccionado] = useState("");
  const [respuestas, setRespuestas] = useState({});
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const soloLectura = estado === "finalizada" || periodoCerrado;

  const [seccionActiva, setSeccionActiva] = useState(null);
  const [confirmarFinalizacion, setConfirmarFinalizacion] = useState(false);

  useEffect(() => {
    cargarFicha();
  }, []);

  const cargarFicha = async () => {
    /*
     * =====================================================
     * EVALUACIÓN EXISTENTE
     * =====================================================
     */
    if (id) {
      const { data, error } = await obtenerEvaluacionPorId(id);

      if (error) {
        Toast.error(error.message);
        navigate("/admin/evaluaciones", { replace: true });
        return;
      }

      setEvaluacionId(data.id);
      setPersonalSeleccionado(data.personal_id);
      setObservacion(data.observacion || "");
      setEstado(data.estado);

      setPeriodo(data.periodos || null);

      const cerrado = data.periodos?.estado !== "activo";
      setPeriodoCerrado(cerrado);

      if (data.personal) {
        setPersonal([data.personal]);
      }

      /*
       * Utilizamos la fotografía histórica de la ficha.
       */
      if (data.ficha_snapshot) {
        const snapshot = data.ficha_snapshot;

        const seccionesSnapshot = [...(snapshot.secciones || [])].sort(
          (a, b) => Number(a.orden || 0) - Number(b.orden || 0),
        );

        const itemsSnapshot = [...(snapshot.items || [])].sort(
          (a, b) => Number(a.orden || 0) - Number(b.orden || 0),
        );

        const nivelesSnapshot = [...(snapshot.niveles || [])].sort(
          (a, b) => Number(a.orden || 0) - Number(b.orden || 0),
        );

        setSecciones(seccionesSnapshot);
        setItems(itemsSnapshot);
        setNiveles(nivelesSnapshot);

        if (seccionesSnapshot.length > 0) {
          setSeccionActiva(seccionesSnapshot[0].id);
        }
      } else {
        /*
         * Fallback por seguridad para registros antiguos
         * que todavía no tengan snapshot.
         */
        const ficha = await obtenerFicha();

        if (ficha.secciones.error) {
          Toast.error(ficha.secciones.error.message);
          return;
        }

        if (ficha.items.error) {
          Toast.error(ficha.items.error.message);
          return;
        }

        if (ficha.niveles.error) {
          Toast.error(ficha.niveles.error.message);
          return;
        }

        setSecciones(ficha.secciones.data || []);
        setItems(ficha.items.data || []);
        setNiveles(ficha.niveles.data || []);

        if ((ficha.secciones.data || []).length > 0) {
          setSeccionActiva(ficha.secciones.data[0].id);
        }
      }

      const respuestasCargadas = {};

      (data.evaluacion_detalle || []).forEach((d) => {
        respuestasCargadas[d.item_id] = {
          nivel_id: d.nivel_id,
          puntaje: d.puntaje,
        };
      });

      setRespuestas(respuestasCargadas);

      return;
    }

    /*
     * =====================================================
     * NUEVA EVALUACIÓN
     * =====================================================
     */

    const ficha = await obtenerFicha();

    if (ficha.secciones.error) {
      Toast.error(ficha.secciones.error.message);
      return;
    }

    if (ficha.items.error) {
      Toast.error(ficha.items.error.message);
      return;
    }

    if (ficha.niveles.error) {
      Toast.error(ficha.niveles.error.message);
      return;
    }

    const personalData = await obtenerPersonalEvaluable();
    const periodoData = await obtenerPeriodoActivo();

    if (personalData.error) {
      Toast.error(personalData.error.message);
      navigate("/admin/evaluaciones", { replace: true });
      return;
    }

    if (periodoData.error || !periodoData.data?.id) {
      Toast.error("No hay período activo configurado");
      navigate("/admin/evaluaciones", { replace: true });
      return;
    }

    setSecciones(ficha.secciones.data || []);
    setItems(ficha.items.data || []);
    setNiveles(ficha.niveles.data || []);

    if ((ficha.secciones.data || []).length > 0) {
      setSeccionActiva(ficha.secciones.data[0].id);
    }

    setPersonal(personalData.data || []);
    setPeriodo(periodoData.data);
    setPeriodoCerrado(false);

    const personalParam = searchParams.get("personal");

    if (personalParam) {
      const existeAsignado = (personalData.data || []).some(
        (p) => String(p.id) === String(personalParam),
      );

      if (!existeAsignado) {
        Toast.error(
          "Este personal no está asignado a tu usuario para el período actual.",
        );

        navigate("/admin/evaluaciones", { replace: true });
        return;
      }

      setPersonalSeleccionado(personalParam);
    }
  };

  const guardar = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario_app"));

    if (soloLectura) {
      Toast.error(Messages.evaluacionNoEditable);
      return;
    }

    if (!personalSeleccionado) {
      Toast.error("Seleccione el personal a evaluar");
      return;
    }

    if (!usuario?.id) {
      Toast.error("No se encontró el usuario evaluador");
      return;
    }

    if (!periodo?.id) {
      Toast.error("No hay período activo");
      return;
    }

    if (Object.keys(respuestas).length === 0) {
      Toast.error("Debe calificar al menos un ítem para guardar el borrador");
      return;
    }

    if (observacion.length > 250) {
      Toast.error("La observación no debe superar los 250 caracteres");
      return;
    }

    setGuardando(true);

    const { data, error } = await guardarEvaluacionCompleta({
      evaluacionId,
      personalId: personalSeleccionado,
      evaluadorId: usuario.id,
      periodoId: periodo.id,
      observacion,
      respuestas,
    });

    setGuardando(false);

    if (error) {
      Toast.error(error.message);
      return;
    }

    setEvaluacionId(data.id);
    setEstado(data.estado);

    Toast.success(Messages.evaluacionGuardada);
  };

  const ejecutarFinalizacion = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario_app"));

    if (!usuario?.id) {
      Toast.error("No se encontró el usuario evaluador");
      return;
    }

    if (!periodo?.id) {
      Toast.error("No hay período activo");
      return;
    }

    if (soloLectura) {
      Toast.error(Messages.evaluacionNoEditable);
      return;
    }

    setGuardando(true);

    const { data, error } = await guardarEvaluacionCompleta({
      evaluacionId,
      personalId: personalSeleccionado,
      evaluadorId: usuario.id,
      periodoId: periodo.id,
      observacion,
      respuestas,
    });

    if (error) {
      setGuardando(false);
      Toast.error(error.message);
      return;
    }

    const { error: errorFinalizar } = await finalizarEvaluacion(data.id);

    setGuardando(false);

    if (errorFinalizar) {
      Toast.error(errorFinalizar.message);
      return;
    }

    Toast.success(Messages.evaluacionFinalizada);
    navigate("/admin/evaluaciones");
  };

  const solicitarFinalizacion = () => {
    if (soloLectura) {
      Toast.error(Messages.evaluacionNoEditable);
      return;
    }

    if (Object.keys(respuestas).length !== items.length) {
      Toast.error("Debe calificar todos los ítems antes de finalizar");
      return;
    }

    setConfirmarFinalizacion(true);
  };

  const personalSeleccionadoInfo = personal.find(
    (p) => p.id === personalSeleccionado,
  );

  const totalItems = items.length;
  const respondidas = Object.keys(respuestas).length;
  const progreso =
    totalItems > 0 ? Math.round((respondidas / totalItems) * 100) : 0;

  const indiceActual = secciones.findIndex((s) => s.id === seccionActiva);

  const irAnterior = () => {
    if (indiceActual > 0) {
      setSeccionActiva(secciones[indiceActual - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const irSiguiente = () => {
    if (indiceActual < secciones.length - 1) {
      setSeccionActiva(secciones[indiceActual + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page-container">
      <EvaluacionHeader
        personalSeleccionadoInfo={personalSeleccionadoInfo}
        periodo={periodo}
        estado={estado}
        respondidas={respondidas}
        totalItems={totalItems}
        progreso={progreso}
        guardando={guardando}
        soloLectura={soloLectura}
        onGuardar={guardar}
        onFinalizar={solicitarFinalizacion}
      />

      <div className="evaluacion-body">
        <EvaluacionSidebar
          secciones={secciones}
          items={items}
          respuestas={respuestas}
          seccionActiva={seccionActiva}
          setSeccionActiva={setSeccionActiva}
        />

        <div className="evaluacion-content">
          {secciones
            .filter((seccion) => seccion.id === seccionActiva)
            .map((seccion) => (
              <SeccionCard
                key={seccion.id}
                seccion={seccion}
                items={items}
                niveles={niveles}
                respuestas={respuestas}
                setRespuestas={setRespuestas}
                disabled={soloLectura}
              />
            ))}

          {indiceActual === secciones.length - 1 && (
            <ObservacionBox
              observacion={observacion}
              setObservacion={setObservacion}
              disabled={soloLectura}
            />
          )}

          {/* 👇 AQUÍ VA EL PASO 2 */}
          <div className="evaluacion-navigation">
            <button
              className="secondary-btn"
              disabled={indiceActual === 0}
              onClick={irAnterior}
            >
              ← Sección anterior
            </button>

            {indiceActual < secciones.length - 1 ? (
              <button className="primary-btn" onClick={irSiguiente}>
                Siguiente sección →
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() =>
                  document
                    .querySelector(".evaluacion-resumen-side")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Ver resumen →
              </button>
            )}
          </div>
        </div>

        <div className="evaluacion-resumen-side">
          <ResumenEvaluacion
            respuestas={respuestas}
            totalItems={totalItems}
            progreso={progreso}
          />
        </div>
      </div>

      <ConfirmModal
        open={confirmarFinalizacion}
        title="Finalizar evaluación"
        message="¿Seguro que deseas finalizar la evaluación? Después ya no podrá modificarse."
        confirmText="Finalizar"
        variant="danger"
        onCancel={() => setConfirmarFinalizacion(false)}
        onConfirm={async () => {
          setConfirmarFinalizacion(false);
          await ejecutarFinalizacion();
        }}
      />
    </div>
  );
}

export default Evaluacion;
