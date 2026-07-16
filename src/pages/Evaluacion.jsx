import { useEffect, useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";

import EvaluacionHeader from "../components/evaluacion/EvaluacionHeader";
import SeccionCard from "../components/evaluacion/SeccionCard";
import ObservacionBox from "../components/evaluacion/ObservacionBox";
import ResumenEvaluacion from "../components/evaluacion/ResumenEvaluacion";
import "../styles/evaluacion.css";
import EvaluacionSidebar from "../components/evaluacion/EvaluacionSidebar";
import { Toast } from "../lib/toast";

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

  const [evaluacionId, setEvaluacionId] = useState(id || null);
  const [estado, setEstado] = useState("proceso");

  const [personalSeleccionado, setPersonalSeleccionado] = useState("");
  const [respuestas, setRespuestas] = useState({});
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const soloLectura = estado === "finalizada";

  const [seccionActiva, setSeccionActiva] = useState(null);

  useEffect(() => {
    cargarFicha();
  }, []);

  const cargarFicha = async () => {
    const personalData = await obtenerPersonalEvaluable();
    const ficha = await obtenerFicha();
    const periodoData = await obtenerPeriodoActivo();

    if (personalData.error) return alert(personalData.error.message);
    if (ficha.secciones.error) return alert(ficha.secciones.error.message);
    if (ficha.items.error) return alert(ficha.items.error.message);
    if (ficha.niveles.error) return alert(ficha.niveles.error.message);
    if (periodoData.error) return alert("No hay periodo activo configurado");

    setPersonal(personalData.data || []);
    setSecciones(ficha.secciones.data || []);
    setItems(ficha.items.data || []);
    setNiveles(ficha.niveles.data || []);
    setPeriodo(periodoData.data);

    if ((ficha.secciones.data || []).length > 0) {
      setSeccionActiva(ficha.secciones.data[0].id);
    }

    if (id) {
      const { data, error } = await obtenerEvaluacionPorId(id);

      if (error) {
        alert(error.message);
        return;
      }

      setEvaluacionId(data.id);
      setPersonalSeleccionado(data.personal_id);
      setObservacion(data.observacion || "");
      setEstado(data.estado);

      const respuestasCargadas = {};

      data.evaluacion_detalle.forEach((d) => {
        respuestasCargadas[d.item_id] = {
          nivel_id: d.nivel_id,
          puntaje: d.puntaje,
        };
      });

      setRespuestas(respuestasCargadas);
      return;
    }

    const personalParam = searchParams.get("personal");

    if (personalParam) {
      setPersonalSeleccionado(personalParam);
    }
  };

  const guardar = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario_app"));

    if (soloLectura) {
      Toast.error("Esta evaluación ya fue finalizada");
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

    Toast.success("Avance guardado correctamente");
  };

  const finalizar = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario_app"));

    if (Object.keys(respuestas).length !== items.length) {
      alert("Debe calificar todos los ítems antes de finalizar");
      return;
    }

    if (
      !confirm(
        "¿Seguro que deseas finalizar la evaluación? Ya no podrá modificarse.",
      )
    ) {
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
      alert(error.message);
      return;
    }

    const { error: errorFinalizar } = await finalizarEvaluacion(data.id);

    if (errorFinalizar) {
      alert(errorFinalizar.message);
      return;
    }

    Toast.success("Evaluación finalizada correctamente");
    navigate("/admin/evaluaciones");
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
        onFinalizar={finalizar}
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
    </div>
  );
}

export default Evaluacion;
