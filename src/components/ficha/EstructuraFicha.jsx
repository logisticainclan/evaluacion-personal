import { useEffect, useState } from "react";
import { Plus, Pencil, Power, Trash2, Layers3, ListChecks } from "lucide-react";

import { Toast } from "../../lib/toast";

import {
  obtenerSecciones,
  crearSeccion,
  actualizarSeccion,
  eliminarSeccion,
} from "../../services/seccionesService";

import {
  obtenerItems,
  crearItem,
  actualizarItem,
  eliminarItem,
} from "../../services/itemsService";

const seccionInicial = {
  nombre: "",
  orden: 1,
  activo: true,
};

const itemInicial = {
  seccion_id: "",
  descripcion: "",
  ayuda: "",
  orden: 1,
  activo: true,
};

function EstructuraFicha() {
  const [secciones, setSecciones] = useState([]);
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalSeccion, setModalSeccion] = useState(false);
  const [seccionEditando, setSeccionEditando] = useState(null);
  const [formSeccion, setFormSeccion] = useState(seccionInicial);

  const [modalItem, setModalItem] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [formItem, setFormItem] = useState(itemInicial);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    const [resSecciones, resItems] = await Promise.all([
      obtenerSecciones(),
      obtenerItems(),
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

    setSecciones(resSecciones.data || []);
    setItems(resItems.data || []);
    setCargando(false);
  };

  // =========================
  // SECCIONES
  // =========================

  const abrirNuevaSeccion = () => {
    setSeccionEditando(null);

    setFormSeccion({
      ...seccionInicial,
      orden: secciones.length + 1,
    });

    setModalSeccion(true);
  };

  const abrirEditarSeccion = (seccion) => {
    setSeccionEditando(seccion);

    setFormSeccion({
      nombre: seccion.nombre || "",
      orden: seccion.orden || 1,
      activo: seccion.activo,
    });

    setModalSeccion(true);
  };

  const cerrarModalSeccion = () => {
    setModalSeccion(false);
    setSeccionEditando(null);
    setFormSeccion(seccionInicial);
  };

  const guardarSeccion = async (e) => {
    e.preventDefault();

    const datos = {
      nombre: formSeccion.nombre.trim(),
      orden: Number(formSeccion.orden),
      activo: formSeccion.activo,
    };

    const respuesta = seccionEditando
      ? await actualizarSeccion(seccionEditando.id, datos)
      : await crearSeccion(datos);

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return;
    }

    Toast.success(
      seccionEditando
        ? "Sección actualizada correctamente"
        : "Sección creada correctamente",
    );

    cerrarModalSeccion();
    await cargarDatos();
  };

  const cambiarEstadoSeccion = async (seccion) => {
    const { error } = await actualizarSeccion(seccion.id, {
      activo: !seccion.activo,
    });

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(
      seccion.activo
        ? "Sección inactivada correctamente"
        : "Sección activada correctamente",
    );

    await cargarDatos();
  };

  const borrarSeccion = async (seccion) => {
    const confirmar = confirm(
      `¿Seguro que deseas eliminar la sección "${seccion.nombre}"?`,
    );

    if (!confirmar) return;

    const { error } = await eliminarSeccion(seccion.id);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success("Sección eliminada correctamente");
    await cargarDatos();
  };

  // =========================
  // ÍTEMS
  // =========================

  const abrirNuevoItem = (seccion) => {
    const itemsSeccion = items.filter((item) => item.seccion_id === seccion.id);

    setItemEditando(null);

    setFormItem({
      ...itemInicial,
      seccion_id: seccion.id,
      orden: itemsSeccion.length + 1,
    });

    setModalItem(true);
  };

  const abrirEditarItem = (item) => {
    setItemEditando(item);

    setFormItem({
      seccion_id: item.seccion_id || "",
      descripcion: item.descripcion || "",
      ayuda: item.ayuda || "",
      orden: item.orden || 1,
      activo: item.activo,
    });

    setModalItem(true);
  };

  const cerrarModalItem = () => {
    setModalItem(false);
    setItemEditando(null);
    setFormItem(itemInicial);
  };

  const guardarItem = async (e) => {
    e.preventDefault();

    const datos = {
      seccion_id: formItem.seccion_id,
      descripcion: formItem.descripcion.trim(),
      ayuda: formItem.ayuda.trim(),
      orden: Number(formItem.orden),
      activo: formItem.activo,
    };

    const respuesta = itemEditando
      ? await actualizarItem(itemEditando.id, datos)
      : await crearItem(datos);

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return;
    }

    Toast.success(
      itemEditando
        ? "Ítem actualizado correctamente"
        : "Ítem creado correctamente",
    );

    cerrarModalItem();
    await cargarDatos();
  };

  const cambiarEstadoItem = async (item) => {
    const { error } = await actualizarItem(item.id, {
      activo: !item.activo,
    });

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(
      item.activo
        ? "Ítem inactivado correctamente"
        : "Ítem activado correctamente",
    );

    await cargarDatos();
  };

  const borrarItem = async (item) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este ítem?");

    if (!confirmar) return;

    const { error } = await eliminarItem(item.id);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success("Ítem eliminado correctamente");
    await cargarDatos();
  };

  if (cargando) {
    return (
      <div className="ficha-estructura-loading">
        Cargando estructura de la ficha...
      </div>
    );
  }

  return (
    <div className="estructura-ficha">
      <div className="ficha-subheader">
        <div>
          <span className="ficha-subheader-kicker">Estructura</span>

          <h2>Contenido de la ficha</h2>

          <p>
            Organiza las secciones y los criterios que serán utilizados durante
            la evaluación.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={abrirNuevaSeccion}
        >
          <Plus size={17} />
          Nueva sección
        </button>
      </div>

      <div className="estructura-resumen">
        <div>
          <Layers3 size={17} />
          <span>
            <strong>{secciones.length}</strong> secciones
          </span>
        </div>

        <div>
          <ListChecks size={17} />
          <span>
            <strong>{items.length}</strong> ítems
          </span>
        </div>
      </div>

      <div className="estructura-secciones">
        {secciones.map((seccion) => {
          const itemsSeccion = items
            .filter((item) => item.seccion_id === seccion.id)
            .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));

          return (
            <section className="estructura-seccion-card" key={seccion.id}>
              <div className="estructura-seccion-header">
                <div className="estructura-seccion-info">
                  <div className="estructura-seccion-numero">
                    {String(seccion.orden).padStart(2, "0")}
                  </div>

                  <div>
                    <div className="estructura-seccion-title-row">
                      <h3>{seccion.nombre}</h3>

                      <span
                        className={`status ${
                          seccion.activo ? "activo" : "inactivo"
                        }`}
                      >
                        {seccion.activo ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    <p>
                      {itemsSeccion.length} ítem
                      {itemsSeccion.length !== 1 ? "s" : ""} registrado
                      {itemsSeccion.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="estructura-seccion-actions">
                  <button
                    type="button"
                    title="Editar sección"
                    onClick={() => abrirEditarSeccion(seccion)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    title={
                      seccion.activo ? "Inactivar sección" : "Activar sección"
                    }
                    onClick={() => cambiarEstadoSeccion(seccion)}
                  >
                    <Power size={16} />
                  </button>

                  <button
                    type="button"
                    className="estructura-danger-icon"
                    title="Eliminar sección"
                    onClick={() => borrarSeccion(seccion)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="estructura-items">
                {itemsSeccion.length > 0 ? (
                  itemsSeccion.map((item) => (
                    <article
                      className={`estructura-item ${
                        !item.activo ? "estructura-item-inactivo" : ""
                      }`}
                      key={item.id}
                    >
                      <div className="estructura-item-numero">
                        {String(item.orden).padStart(2, "0")}
                      </div>

                      <div className="estructura-item-content">
                        <div className="estructura-item-title">
                          <strong>{item.descripcion}</strong>

                          {!item.activo && (
                            <span className="status inactivo">Inactivo</span>
                          )}
                        </div>

                        {item.ayuda && <p>{item.ayuda}</p>}
                      </div>

                      <div className="estructura-item-actions">
                        <button
                          type="button"
                          title="Editar ítem"
                          onClick={() => abrirEditarItem(item)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          title={
                            item.activo ? "Inactivar ítem" : "Activar ítem"
                          }
                          onClick={() => cambiarEstadoItem(item)}
                        >
                          <Power size={15} />
                        </button>

                        <button
                          type="button"
                          className="estructura-danger-icon"
                          title="Eliminar ítem"
                          onClick={() => borrarItem(item)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="estructura-items-empty">
                    Esta sección todavía no tiene ítems.
                  </div>
                )}
              </div>

              <div className="estructura-add-item">
                <button type="button" onClick={() => abrirNuevoItem(seccion)}>
                  <Plus size={16} />
                  Agregar ítem
                </button>
              </div>
            </section>
          );
        })}

        {secciones.length === 0 && (
          <div className="estructura-empty">
            <Layers3 size={30} />

            <strong>No hay secciones registradas</strong>

            <span>
              Crea la primera sección para comenzar a construir la ficha.
            </span>

            <button
              type="button"
              className="primary-btn"
              onClick={abrirNuevaSeccion}
            >
              <Plus size={17} />
              Crear primera sección
            </button>
          </div>
        )}
      </div>

      {/* MODAL SECCIÓN */}

      {modalSeccion && (
        <div className="modal-bg">
          <form className="ficha-modal-card" onSubmit={guardarSeccion}>
            <div className="ficha-modal-header">
              <div>
                <span className="ficha-modal-kicker">
                  Configuración de ficha
                </span>

                <h2>{seccionEditando ? "Editar sección" : "Nueva sección"}</h2>

                <p>Define el nombre, orden y estado de la sección.</p>
              </div>

              <button
                type="button"
                className="ficha-modal-close"
                onClick={cerrarModalSeccion}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="ficha-modal-body">
              <div className="ficha-modal-field ficha-modal-field-full">
                <label>Nombre de la sección</label>

                <input
                  value={formSeccion.nombre}
                  onChange={(e) =>
                    setFormSeccion({
                      ...formSeccion,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Ej. Responsabilidad"
                  required
                />
              </div>

              <div className="ficha-modal-grid">
                <div className="ficha-modal-field">
                  <label>Orden</label>

                  <input
                    type="number"
                    min="1"
                    value={formSeccion.orden}
                    onChange={(e) =>
                      setFormSeccion({
                        ...formSeccion,
                        orden: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <label className="ficha-modal-status-control">
                  <input
                    type="checkbox"
                    checked={formSeccion.activo}
                    onChange={(e) =>
                      setFormSeccion({
                        ...formSeccion,
                        activo: e.target.checked,
                      })
                    }
                  />

                  <span>
                    <strong>Sección activa</strong>
                    <small>Se utilizará durante las evaluaciones.</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="ficha-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={cerrarModalSeccion}
              >
                Cancelar
              </button>

              <button type="submit" className="primary-btn">
                {seccionEditando ? "Actualizar sección" : "Crear sección"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ÍTEM */}

      {modalItem && (
        <div className="modal-bg">
          <form
            className="ficha-modal-card ficha-modal-item"
            onSubmit={guardarItem}
          >
            <div className="ficha-modal-header">
              <div>
                <span className="ficha-modal-kicker">
                  Criterio de evaluación
                </span>

                <h2>{itemEditando ? "Editar ítem" : "Nuevo ítem"}</h2>

                <p>
                  Configura el criterio que será calificado dentro de la
                  sección.
                </p>
              </div>

              <button
                type="button"
                className="ficha-modal-close"
                onClick={cerrarModalItem}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="ficha-modal-body">
              <div className="ficha-modal-field">
                <label>Sección</label>

                <select
                  value={formItem.seccion_id}
                  onChange={(e) =>
                    setFormItem({
                      ...formItem,
                      seccion_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccione una sección</option>

                  {secciones.map((seccion) => (
                    <option key={seccion.id} value={seccion.id}>
                      {seccion.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ficha-modal-field">
                <label>Descripción del ítem</label>

                <textarea
                  value={formItem.descripcion}
                  onChange={(e) =>
                    setFormItem({
                      ...formItem,
                      descripcion: e.target.value,
                    })
                  }
                  rows="4"
                  placeholder="Describe el criterio que será evaluado"
                  required
                />
              </div>

              <div className="ficha-modal-field">
                <label>Ayuda / aclaración</label>

                <textarea
                  value={formItem.ayuda}
                  onChange={(e) =>
                    setFormItem({
                      ...formItem,
                      ayuda: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Información adicional para orientar al evaluador"
                />
              </div>

              <div className="ficha-modal-grid">
                <div className="ficha-modal-field">
                  <label>Orden</label>

                  <input
                    type="number"
                    min="1"
                    value={formItem.orden}
                    onChange={(e) =>
                      setFormItem({
                        ...formItem,
                        orden: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <label className="ficha-modal-status-control">
                  <input
                    type="checkbox"
                    checked={formItem.activo}
                    onChange={(e) =>
                      setFormItem({
                        ...formItem,
                        activo: e.target.checked,
                      })
                    }
                  />

                  <span>
                    <strong>Ítem activo</strong>
                    <small>Será incluido en la ficha de evaluación.</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="ficha-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={cerrarModalItem}
              >
                Cancelar
              </button>

              <button type="submit" className="primary-btn">
                {itemEditando ? "Actualizar ítem" : "Crear ítem"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EstructuraFicha;
