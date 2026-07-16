import { useEffect, useState } from 'react'
import { Toast } from "../lib/toast";
import {
  obtenerUsuarios,
  obtenerPersonalSinUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../services/usuariosService'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [personal, setPersonal] = useState([])
  const [modal, setModal] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({
    personal_id: '',
    password: '',
    rol: 'evaluador'
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [resUsuarios, resPersonal] = await Promise.all([
      obtenerUsuarios(),
      obtenerPersonalSinUsuario()
    ])

    if (resUsuarios.error) {
      Toast.error(resUsuarios.error.message);
      return;
    }

    if (resPersonal.error) {
      Toast.error(resPersonal.error.message);
      return;
    }

    setUsuarios(resUsuarios.data || [])
    setPersonal(resPersonal.data || [])
  }

  const guardarUsuario = async (e) => {
    e.preventDefault()

    if (!form.personal_id) {
      Toast.error("Seleccione un personal");
      return
    }

    if (form.password.length < 4) {
      Toast.error("La contraseña debe tener al menos 4 caracteres");
      return
    }

    const { error } = await crearUsuario(form)

    if (error) {
      Toast.error(error.message);
      return
    }

    setModal(false)
    setForm({
      personal_id: '',
      password: '',
      rol: 'evaluador'
    })
    cargarDatos()
  }

  const cambiarEstado = async (usuario) => {
    const { error } = await actualizarUsuario(usuario.id, {
      activo: !usuario.activo
    })

    if (error) {
      Toast.error(error.message);
      return
    }

    cargarDatos()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return

    const { error } = await eliminarUsuario(id)

    if (error) {
      Toast.error(error.message);
      return
    }

    cargarDatos()
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.personal?.dni || ''} ${u.personal?.nombres || ''} ${u.personal?.apellidos || ''} ${u.rol}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Accesos al sistema</p>
        </div>

        <button className="primary-btn" onClick={() => setModal(true)}>
          Nuevo usuario
        </button>
      </div>

      <input
        className="search-input"
        placeholder="Buscar por DNI, nombres o rol..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Personal</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>{u.personal?.dni}</td>
                <td>{u.personal?.apellidos}, {u.personal?.nombres}</td>
                <td>{u.rol}</td>
                <td>
                  <span className={`status ${u.activo ? 'activo' : 'inactivo'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button onClick={() => cambiarEstado(u)}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="danger" onClick={() => eliminar(u.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-table">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg">
          <form className="modal-card" onSubmit={guardarUsuario}>
            <h2>Nuevo usuario</h2>

            <label>Personal</label>
            <select
              value={form.personal_id}
              onChange={(e) => setForm({ ...form, personal_id: e.target.value })}
              required
            >
              <option value="">Seleccione</option>
              {personal.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.dni} - {p.apellidos}, {p.nombres}
                </option>
              ))}
            </select>

            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <label>Rol</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="admin">Administrador</option>
              <option value="evaluador">Evaluador</option>
            </select>

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

export default Usuarios