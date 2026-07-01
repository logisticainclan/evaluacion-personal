import { useEffect, useState } from 'react'
import {
  obtenerNiveles,
  crearNivel,
  actualizarNivel,
  eliminarNivel
} from '../services/nivelesService'

const formInicial = {
  nombre: '',
  puntaje: 1,
  orden: 1,
  activo: true
}

function Niveles() {
  const [niveles, setNiveles] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(formInicial)

  useEffect(() => {
    cargarNiveles()
  }, [])

  const cargarNiveles = async () => {
    const { data, error } = await obtenerNiveles()

    if (error) {
      alert(error.message)
      return
    }

    setNiveles(data || [])
  }

  const abrirNuevo = () => {
    setEditando(null)
    setForm({
      ...formInicial,
      orden: niveles.length + 1
    })
    setModal(true)
  }

  const abrirEditar = (nivel) => {
    setEditando(nivel)
    setForm({
      nombre: nivel.nombre,
      puntaje: nivel.puntaje,
      orden: nivel.orden,
      activo: nivel.activo
    })
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()

    const datos = {
      nombre: form.nombre.trim(),
      puntaje: Number(form.puntaje),
      orden: Number(form.orden),
      activo: form.activo
    }

    const respuesta = editando
      ? await actualizarNivel(editando.id, datos)
      : await crearNivel(datos)

    if (respuesta.error) {
      alert(respuesta.error.message)
      return
    }

    setModal(false)
    setEditando(null)
    setForm(formInicial)
    cargarNiveles()
  }

  const cambiarEstado = async (nivel) => {
    const { error } = await actualizarNivel(nivel.id, {
      activo: !nivel.activo
    })

    if (error) {
      alert(error.message)
      return
    }

    cargarNiveles()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este nivel?')) return

    const { error } = await eliminarNivel(id)

    if (error) {
      alert(error.message)
      return
    }

    cargarNiveles()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Niveles de calificación</h1>
          <p>Escala utilizada en la ficha de evaluación</p>
        </div>

        <button className="primary-btn" onClick={abrirNuevo}>
          Nuevo nivel
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Nombre</th>
              <th>Puntaje</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {niveles.map((n) => (
              <tr key={n.id}>
                <td>{n.orden}</td>
                <td>{n.nombre}</td>
                <td>{n.puntaje}</td>
                <td>
                  <span className={`status ${n.activo ? 'activo' : 'inactivo'}`}>
                    {n.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button onClick={() => abrirEditar(n)}>Editar</button>
                    <button onClick={() => cambiarEstado(n)}>
                      {n.activo ? 'Inactivar' : 'Activar'}
                    </button>
                    <button className="danger" onClick={() => eliminar(n.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {niveles.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-table">
                  No hay niveles registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg">
          <form className="modal-card" onSubmit={guardar}>
            <h2>{editando ? 'Editar nivel' : 'Nuevo nivel'}</h2>

            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />

            <label>Puntaje</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.puntaje}
              onChange={(e) => setForm({ ...form, puntaje: e.target.value })}
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
              Nivel activo
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

export default Niveles