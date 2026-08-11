import { useEffect, useState } from "react";
import { Toast } from "../lib/toast";
import {
  obtenerNiveles,
  crearNivel,
  actualizarNivel,
  eliminarNivel,
} from "../services/nivelesService";

const formInicial = {
  nombre: "",
  puntaje: 1,
  orden: 1,
  activo: true,
};

function Niveles({ integrado = false }) {
  const [niveles, setNiveles] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    cargarNiveles();
  }, []);

  const cargarNiveles = async () => {
    const { data, error } = await obtenerNiveles();

    if (error) {
      Toast.error(error.message);
      return;
    }

    setNiveles(data || []);
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm({
      ...formInicial,
      orden: niveles.length + 1,
    });
    setModal(true);
  };

  const abrirEditar = (nivel) => {
    setEditando(nivel);
    setForm({
      nombre: nivel.nombre,
      puntaje: nivel.puntaje,
      orden: nivel.orden,
      activo: nivel.activo,
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
      nombre: form.nombre.trim(),
      puntaje: Number(form.puntaje),
      orden: Number(form.orden),
      activo: form.activo,
    };

    const respuesta = editando
      ? await actualizarNivel(editando.id, datos)
      : await crearNivel(datos);

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return;
    }

    Toast.success(
      editando
        ? "Nivel actualizado correctamente"
        : "Nivel creado correctamente",
    );

    cerrarModal();
    await cargarNiveles();
  };

  const cambiarEstado = async (nivel) => {
    const { error } = await actualizarNivel(nivel.id, {
      activo: !nivel.activo,
    });

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(
      nivel.activo
        ? "Nivel inactivado correctamente"
        : "Nivel activado correctamente",
    );

    await cargarNiveles();
  };

  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este nivel?")) return;

    const { error } = await eliminarNivel(id);

    if (error) {
      Toast.error(error.message);
      return;
    }

    cargarNiveles();
  };

  return (
    <div>
      {!integrado && (
        <div className="page-header">
          <div>
            <h1>Niveles de calificación</h1>
            <p>Escala utilizada en la ficha de evaluación</p>
          </div>

          <button className="primary-btn" onClick={abrirNuevo}>
            Nuevo nivel
          </button>
        </div>
      )}

      {integrado && (
        <div className="ficha-subheader">
          <div>
            <span className="ficha-subheader-kicker">Escala de evaluación</span>

            <h2>Niveles de calificación</h2>

            <p>
              Configura los niveles y puntajes disponibles al realizar una
              evaluación.
            </p>
          </div>

          <button className="primary-btn" type="button" onClick={abrirNuevo}>
            Nuevo nivel
          </button>
        </div>
      )}

      <div className="niveles-grid">
        {niveles.map((n) => (
          <article
            className={`nivel-card ${!n.activo ? "nivel-card-inactivo" : ""}`}
            key={n.id}
          >
            <div className="nivel-score">
              {Number(n.puntaje).toFixed(Number(n.puntaje) % 1 === 0 ? 0 : 2)}
            </div>

            <div className="nivel-info">
              <div className="nivel-title-row">
                <div>
                  <span className="nivel-order">Nivel {n.orden}</span>

                  <h3>{n.nombre}</h3>
                </div>

                <span className={`status ${n.activo ? "activo" : "inactivo"}`}>
                  {n.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <p>
                Puntaje asignado:{" "}
                <strong>{Number(n.puntaje).toFixed(2)}</strong>
              </p>
            </div>

            <div className="nivel-actions">
              <button
                type="button"
                className="nivel-action-btn"
                onClick={() => abrirEditar(n)}
              >
                Editar
              </button>

              <button
                type="button"
                className="nivel-action-btn"
                onClick={() => cambiarEstado(n)}
              >
                {n.activo ? "Inactivar" : "Activar"}
              </button>

              <button
                type="button"
                className="nivel-action-btn nivel-action-danger"
                onClick={() => eliminar(n.id)}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}

        {niveles.length === 0 && (
          <div className="niveles-empty">
            No hay niveles de calificación registrados.
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-bg">
          <form className="ficha-modal-card" onSubmit={guardar}>
            <div className="ficha-modal-header">
              <div>
                <span className="ficha-modal-kicker">Escala de evaluación</span>

                <h2>{editando ? "Editar nivel" : "Nuevo nivel"}</h2>

                <p>
                  Define el nombre, puntaje y posición del nivel dentro de la
                  escala de calificación.
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
                <label>Nombre del nivel</label>

                <input
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Ej. Muy Bueno"
                  required
                />
              </div>

              <div className="ficha-modal-grid">
                <div className="ficha-modal-field">
                  <label>Puntaje</label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.puntaje}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        puntaje: e.target.value,
                      })
                    }
                    placeholder="Ej. 4"
                    required
                  />
                </div>

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
                  <strong>Nivel activo</strong>
                  <small>Estará disponible durante las evaluaciones.</small>
                </span>
              </label>
            </div>

            <div className="ficha-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={cerrarModal}
              >
                Cancelar
              </button>

              <button type="submit" className="primary-btn">
                {editando ? "Actualizar nivel" : "Crear nivel"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Niveles;
