import { useEffect, useState } from 'react'
import {
  obtenerSecciones,
  crearSeccion,
  actualizarSeccion,
  eliminarSeccion
} from '../services/seccionesService'

const formInicial = {
  nombre: '',
  orden: 1,
  activo: true
}

function Secciones() {
  const [secciones, setSecciones] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(formInicial)

  useEffect(() => {
    cargarSecciones()
  }, [])

  const cargarSecciones = async () => {
    const { data, error } = await obtenerSecciones()

    if (error) {
      alert(error.message)
      return
    }

    setSecciones(data || [])
  }

  const abrirNuevo = () => {
    setEditando(null)
    setForm({
      ...formInicial,
      orden: secciones.length + 1
    })
    setModal(true)
  }

  const abrirEditar = (seccion) => {
    setEditando(seccion)
    setForm({
      nombre: seccion.nombre,
      orden: seccion.orden,
      activo: seccion.activo
    })
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()

    const datos = {
      nombre: form.nombre.trim(),
      orden: Number(form.orden),
      activo: form.activo
    }

    const respuesta = editando
      ? await actualizarSeccion(editando.id, datos)
      : await crearSeccion(datos)

    if (respuesta.error) {
      alert(respuesta.error.message)
      return
    }

    setModal(false)
    setEditando(null)
    setForm(formInicial)
    cargarSecciones()
  }

  const cambiarEstado = async (seccion) => {
    const { error } = await actualizarSeccion(seccion.id, {
      activo: !seccion.activo
    })

    if (error) {
      alert(error.message)
      return
    }

    cargarSecciones()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta sección?')) return

    const { error } = await eliminarSeccion(id)

    if (error) {
      alert(error.message)
      return
    }

    cargarSecciones()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Secciones</h1>
          <p>Secciones de la ficha de evaluación</p>
        </div>

        <button className="primary-btn" onClick={abrirNuevo}>
          Nueva sección
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {secciones.map((s) => (
              <tr key={s.id}>
                <td>{s.orden}</td>
                <td>{s.nombre}</td>
                <td>
                  <span className={`status ${s.activo ? 'activo' : 'inactivo'}`}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button onClick={() => abrirEditar(s)}>Editar</button>
                    <button onClick={() => cambiarEstado(s)}>
                      {s.activo ? 'Inactivar' : 'Activar'}
                    </button>
                    <button className="danger" onClick={() => eliminar(s.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {secciones.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-table">
                  No hay secciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg">
          <form className="modal-card" onSubmit={guardar}>
            <h2>{editando ? 'Editar sección' : 'Nueva sección'}</h2>

            <label>Nombre de la sección</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
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
              Sección activa
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

export default Secciones