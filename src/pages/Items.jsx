import { useEffect, useState } from 'react'
import { Toast } from "../lib/toast";
import {
  obtenerItems,
  obtenerSeccionesActivas,
  crearItem,
  actualizarItem,
  eliminarItem
} from '../services/itemsService'

const formInicial = {
  seccion_id: '',
  descripcion: '',
  ayuda: '',
  orden: 1,
  activo: true
}

function Items() {
  const [items, setItems] = useState([])
  const [secciones, setSecciones] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState(formInicial)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [resItems, resSecciones] = await Promise.all([
      obtenerItems(),
      obtenerSeccionesActivas()
    ])

    if (resItems.error) {
      Toast.error(resItems.error.message);
      return;
    }

    if (resSecciones.error) {
      Toast.error(resSecciones.error.message);
      return;
    }

    setItems(resItems.data || [])
    setSecciones(resSecciones.data || [])
  }

  const abrirNuevo = () => {
    setEditando(null)
    setForm(formInicial)
    setModal(true)
  }

  const abrirEditar = (item) => {
    setEditando(item)
    setForm({
      seccion_id: item.seccion_id || '',
      descripcion: item.descripcion || '',
      ayuda: item.ayuda || '',
      orden: item.orden || 1,
      activo: item.activo
    })
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()

    const datos = {
      seccion_id: form.seccion_id,
      descripcion: form.descripcion.trim(),
      ayuda: form.ayuda.trim(),
      orden: Number(form.orden),
      activo: form.activo
    }

    const respuesta = editando
      ? await actualizarItem(editando.id, datos)
      : await crearItem(datos)

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return
    }

    setModal(false)
    setEditando(null)
    setForm(formInicial)
    cargarDatos()
  }

  const cambiarEstado = async (item) => {
    const { error } = await actualizarItem(item.id, {
      activo: !item.activo
    })

    if (error) {
      Toast.error(error.message);
      return
    }

    cargarDatos()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este ítem?')) return

    const { error } = await eliminarItem(id)

    if (error) {
      Toast.error(error.message);
      return
    }

    cargarDatos()
  }

  const itemsFiltrados = items.filter((item) =>
    `${item.secciones?.nombre || ''} ${item.descripcion}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ítems</h1>
          <p>Ítems de la ficha de evaluación</p>
        </div>

        <button className="primary-btn" onClick={abrirNuevo}>
          Nuevo ítem
        </button>
      </div>

      <input
        className="search-input"
        placeholder="Buscar por sección o descripción..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Sección</th>
              <th>Orden</th>
              <th>Descripción</th>
              <th>Ayuda</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {itemsFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{item.secciones?.nombre || '-'}</td>
                <td>{item.orden}</td>
                <td>{item.descripcion}</td>
                <td>{item.ayuda || '-'}</td>
                <td>
                  <span className={`status ${item.activo ? 'activo' : 'inactivo'}`}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button onClick={() => abrirEditar(item)}>Editar</button>
                    <button onClick={() => cambiarEstado(item)}>
                      {item.activo ? 'Inactivar' : 'Activar'}
                    </button>
                    <button className="danger" onClick={() => eliminar(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {itemsFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">
                  No hay ítems registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg">
          <form className="modal-card" onSubmit={guardar}>
            <h2>{editando ? 'Editar ítem' : 'Nuevo ítem'}</h2>

            <label>Sección</label>
            <select
              value={form.seccion_id}
              onChange={(e) => setForm({ ...form, seccion_id: e.target.value })}
              required
            >
              <option value="">Seleccione</option>
              {secciones.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            <label>Descripción del ítem</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              required
              rows="3"
            />

            <label>Ayuda / aclaración</label>
            <textarea
              value={form.ayuda}
              onChange={(e) => setForm({ ...form, ayuda: e.target.value })}
              rows="2"
            />

            <label>Orden</label>
            <input
              type="number"
              min="1"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: e.target.value })}
              required
            />

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Ítem activo
            </label>

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
  )
}

export default Items