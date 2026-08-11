import { useEffect, useState } from "react";
import { Eye, Layers3, ListChecks, SlidersHorizontal } from "lucide-react";

import { Toast } from "../../lib/toast";
import { obtenerSecciones } from "../../services/seccionesService";
import { obtenerItems } from "../../services/itemsService";
import { obtenerNiveles } from "../../services/nivelesService";
import SeccionCard from "../evaluacion/SeccionCard";
import ObservacionBox from "../evaluacion/ObservacionBox";

function VistaPreviaFicha() {
  const [secciones, setSecciones] = useState([]);
  const [items, setItems] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [seccionActiva, setSeccionActiva] = useState(null);
  const [respuestasPreview, setRespuestasPreview] = useState({});
  const [observacionPreview, setObservacionPreview] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    const [resSecciones, resItems, resNiveles] = await Promise.all([
      obtenerSecciones(),
      obtenerItems(),
      obtenerNiveles(),
    ]);

    if (resSecciones.error) {
      Toast.error(resSecciones.error.message);
      setCargando(false);
      return;
    }

    if (resItems.error) {
      Toast.error(resItems.error.message);
      setCargando(false);
      return;
    }

    if (resNiveles.error) {
      Toast.error(resNiveles.error.message);
      setCargando(false);
      return;
    }

    const seccionesActivas = (resSecciones.data || [])
      .filter((seccion) => seccion.activo)
      .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));

    setSecciones(seccionesActivas);

    if (seccionesActivas.length > 0) {
      setSeccionActiva(seccionesActivas[0].id);
    }

    setItems((resItems.data || []).filter((item) => item.activo));

    setNiveles(
      (resNiveles.data || [])
        .filter((nivel) => nivel.activo)
        .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0)),
    );

    setCargando(false);
  };

  if (cargando) {
    return (
      <div className="ficha-preview-loading">Cargando vista previa...</div>
    );
  }

  const totalItems = items.filter((item) =>
    secciones.some((seccion) => seccion.id === item.seccion_id),
  ).length;

  return (
    <div className="ficha-preview">
      <div className="ficha-subheader">
        <div>
          <span className="ficha-subheader-kicker">Vista previa</span>

          <h2>Ficha de evaluación</h2>

          <p>Visualiza la estructura activa que utilizarán los evaluadores.</p>
        </div>
      </div>

      <div className="ficha-preview-summary">
        <div>
          <Layers3 size={17} />
          <span>
            <strong>{secciones.length}</strong> secciones
          </span>
        </div>

        <div>
          <ListChecks size={17} />
          <span>
            <strong>{totalItems}</strong> ítems
          </span>
        </div>

        <div>
          <SlidersHorizontal size={17} />
          <span>
            <strong>{niveles.length}</strong> niveles
          </span>
        </div>
      </div>

      {secciones.length > 0 && niveles.length > 0 ? (
        <div className="ficha-preview-real">
          <div className="ficha-preview-real-sidebar">
            <h3>Secciones</h3>

            {secciones.map((seccion, index) => {
              const itemsSeccion = items.filter(
                (item) => item.seccion_id === seccion.id,
              );

              const activa = seccion.id === seccionActiva;

              return (
                <button
                  key={seccion.id}
                  type="button"
                  className={`ficha-preview-nav-item ${activa ? "active" : ""}`}
                  onClick={() => setSeccionActiva(seccion.id)}
                >
                  <span>{index + 1}</span>

                  <div>
                    <strong>{seccion.nombre}</strong>

                    <small>
                      {itemsSeccion.length}{" "}
                      {itemsSeccion.length === 1 ? "criterio" : "criterios"}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="ficha-preview-real-content">
            {secciones
              .filter((seccion) => seccion.id === seccionActiva)
              .map((seccion) => (
                <SeccionCard
                  key={seccion.id}
                  seccion={seccion}
                  items={items}
                  niveles={niveles}
                  respuestas={respuestasPreview}
                  setRespuestas={setRespuestasPreview}
                  disabled
                  modoPreview
                />
              ))}

            {seccionActiva === secciones[secciones.length - 1]?.id && (
              <ObservacionBox
                observacion={observacionPreview}
                setObservacion={setObservacionPreview}
                disabled
              />
            )}
          </div>

          <div className="ficha-preview-real-summary">
            <div className="resumen-evaluacion">
              <h2>Resumen</h2>

              <div className="resumen-row">
                <span>Respondidos</span>
                <strong>0/{totalItems}</strong>
              </div>

              <div className="resumen-row">
                <span>Pendientes</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="resumen-row">
                <span>Puntaje</span>
                <strong>0.00</strong>
              </div>

              <div className="resumen-row">
                <span>Promedio</span>
                <strong>0.00</strong>
              </div>

              <div className="resumen-row">
                <span>Nivel</span>
                <strong>Sin calcular</strong>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ficha-preview-empty">
          <Eye size={34} />

          <h3>No es posible generar la vista previa</h3>

          <p>
            Debes tener al menos una sección activa y un nivel de calificación
            activo.
          </p>
        </div>
      )}
    </div>
  );
}

export default VistaPreviaFicha;
