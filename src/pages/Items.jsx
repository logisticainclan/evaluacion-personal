import { useEffect, useState } from "react";
import { Toast } from "../lib/toast";
import {
  obtenerItems,
  obtenerSeccionesActivas,
  crearItem,
  actualizarItem,
  eliminarItem,
} from "../services/itemsService";

const formInicial = {
  seccion_id: "",
  descripcion: "",
  ayuda: "",
  orden: 1,
  activo: true,
};

function Items({ integrado = false }) {
  const [items, setItems] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [resItems, resSecciones] = await Promise.all([
      obtenerItems(),
      obtenerSeccionesActivas(),
    ]);

    if (resItems.error) {
      Toast.error(resItems.error.message);
      return;
    }

    if (resSecciones.error) {
      Toast.error(resSecciones.error.message);
      return;
    }

    setItems(resItems.data || []);
    setSecciones(resSecciones.data || []);
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(formInicial);
    setModal(true);
  };

  const abrirEditar = (item) => {
    setEditando(item);
    setForm({
      seccion_id: item.seccion_id || "",
      descripcion: item.descripcion || "",
      ayuda: item.ayuda || "",
      orden: item.orden || 1,
      activo: item.activo,
    });
    setModal(true);
  };

  const cerrarModal = () => {
  setModal(false);
  setEditando(null);
  setForm(formInicial);
};

  const guardar = async (e) => {
    e.preventDefault();

    const datos = {
      seccion_id: form.seccion_id,
      descripcion: form.descripcion.trim(),
      ayuda: form.ayuda.trim(),
      orden: Number(form.orden),
      activo: form.activo,
    };

    const respuesta = editando
      ? await actualizarItem(editando.id, datos)
      : await crearItem(datos);

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return;
    }

    Toast.success(
      editando ? "Ítem actualizado correctamente" : "Ítem creado correctamente",
    );

    cerrarModal();
await cargarDatos();
  };

  const cambiarEstado = async (item) => {
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

  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este ítem?")) return;

    const { error } = await eliminarItem(id);

    if (error) {
      Toast.error(error.message);
      return;
    }

    cargarDatos();
  };

  const itemsFiltrados = items.filter((item) =>
    `${item.secciones?.nombre || ""} ${item.descripcion}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  const itemsOrdenados = [...itemsFiltrados].sort((a, b) => {
    const seccionA = a.secciones?.nombre || "";
    const seccionB = b.secciones?.nombre || "";

    const comparacion = seccionA.localeCompare(seccionB);

    if (comparacion !== 0) return comparacion;

    return Number(a.orden || 0) - Number(b.orden || 0);
  });

  const itemsAgrupados = itemsOrdenados.reduce((grupos, item) => {
    const nombreSeccion = item.secciones?.nombre || "Sin sección";

    if (!grupos[nombreSeccion]) {
      grupos[nombreSeccion] = [];
    }

    grupos[nombreSeccion].push(item);

    return grupos;
  }, {});

  return (
    <div>
      {!integrado && (
        <div className="page-header">
          <div>
            <h1>Ítems</h1>
            <p>Ítems de la ficha de evaluación</p>
          </div>

          <button className="primary-btn" onClick={abrirNuevo}>
            Nuevo ítem
          </button>
        </div>
      )}

      {integrado && (
        <div className="ficha-subheader">
          <div>
            <span className="ficha-subheader-kicker">
              Criterios de evaluación
            </span>

            <h2>Ítems de evaluación</h2>

            <p>
              Define los criterios que serán calificados dentro de cada sección.
            </p>
          </div>

          <button className="primary-btn" type="button" onClick={abrirNuevo}>
            Nuevo ítem
          </button>
        </div>
      )}

      <input
        className="search-input"
        placeholder="Buscar por sección o descripción..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="items-sections">
        {Object.entries(itemsAgrupados).map(([nombreSeccion, lista]) => (
          <section className="items-section-card" key={nombreSeccion}>
            <div className="items-section-header">
              <div>
                <span className="items-section-label">Sección</span>

                <h2>{nombreSeccion}</h2>

                <p>
                  {lista.length} ítem
                  {lista.length !== 1 ? "s" : ""} registrado
                  {lista.length !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={() => {
                  const seccion = secciones.find(
                    (s) => s.nombre === nombreSeccion,
                  );

                  setEditando(null);
                  setForm({
                    ...formInicial,
                    seccion_id: seccion?.id || "",
                  });
                  setModal(true);
                }}
              >
                + Nuevo ítem
              </button>
            </div>

            <div className="items-section-list">
              {lista.map((item) => (
                <article className="item-admin-card" key={item.id}>
                  <div className="item-order">{item.orden}</div>

                  <div className="item-admin-content">
                    <div className="item-admin-top">
                      <h3>{item.descripcion}</h3>

                      <span
                        className={`status ${
                          item.activo ? "activo" : "inactivo"
                        }`}
                      >
                        {item.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {item.ayuda && <p className="item-help">{item.ayuda}</p>}
                  </div>

                  <div className="item-admin-actions">
                    <button
                      className="secondary-btn"
                      onClick={() => abrirEditar(item)}
                    >
                      Editar
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => cambiarEstado(item)}
                    >
                      {item.activo ? "Inactivar" : "Activar"}
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => eliminar(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {itemsOrdenados.length === 0 && (
          <div className="table-card empty-table">No hay ítems registrados</div>
        )}
      </div>

      {modal && (
  <div className="modal-bg">
    <form
      className="ficha-modal-card ficha-modal-item"
      onSubmit={guardar}
    >
      <div className="ficha-modal-header">
        <div>
          <span className="ficha-modal-kicker">
            Criterio de evaluación
          </span>

          <h2>
            {editando ? "Editar ítem" : "Nuevo ítem"}
          </h2>

          <p>
            Configura el criterio que será calificado dentro de una sección.
          </p>
        </div>

        <button
          type="button"
          className="ficha-modal-close"
          onClick={cerrarModal}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="ficha-modal-body">
        <div className="ficha-modal-field ficha-modal-field-full">
          <label>Sección</label>

          <select
            value={form.seccion_id}
            onChange={(e) =>
              setForm({
                ...form,
                seccion_id: e.target.value,
              })
            }
            required
          >
            <option value="">Seleccione una sección</option>

            {secciones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="ficha-modal-field ficha-modal-field-full">
          <label>Descripción del ítem</label>

          <textarea
            value={form.descripcion}
            onChange={(e) =>
              setForm({
                ...form,
                descripcion: e.target.value,
              })
            }
            placeholder="Ej. Cumple con el horario de ingreso y salida establecido."
            rows="4"
            required
          />
        </div>

        <div className="ficha-modal-field ficha-modal-field-full">
          <label>
            Ayuda / aclaración
            <span className="ficha-field-optional">
              Opcional
            </span>
          </label>

          <textarea
            value={form.ayuda}
            onChange={(e) =>
              setForm({
                ...form,
                ayuda: e.target.value,
              })
            }
            placeholder="Agrega una indicación adicional para orientar al evaluador."
            rows="3"
          />
        </div>

        <div className="ficha-modal-grid">
          <div className="ficha-modal-field">
            <label>Orden</label>

            <input
              type="number"
              min="1"
              value={form.orden}
              onChange={(e) =>
                setForm({
                  ...form,
                  orden: e.target.value,
                })
              }
              required
            />
          </div>

          <label className="ficha-modal-status-control">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) =>
                setForm({
                  ...form,
                  activo: e.target.checked,
                })
              }
            />

            <span>
              <strong>Ítem activo</strong>
              <small>
                Será incluido en la ficha de evaluación.
              </small>
            </span>
          </label>
        </div>
      </div>

      <div className="ficha-modal-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={cerrarModal}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="primary-btn"
        >
          {editando ? "Actualizar ítem" : "Crear ítem"}
        </button>
      </div>
    </form>
  </div>
)}
    </div>
  );
}

export default Items;
