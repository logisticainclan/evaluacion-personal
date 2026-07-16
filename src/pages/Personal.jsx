import { useEffect, useState } from 'react'
import PersonalTable from '../components/personal/PersonalTable'
import PersonalModal from '../components/personal/PersonalModal'
import { Toast } from "../lib/toast";
import {
  obtenerPersonal,
  obtenerAreasActivas,
  obtenerCargosActivos,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal
} from '../services/personalService'

function Personal() {
  const [personal, setPersonal] = useState([])
  const [areas, setAreas] = useState([])
  const [cargos, setCargos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [areaFiltro, setAreaFiltro] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [personalEditando, setPersonalEditando] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [resPersonal, resAreas, resCargos] = await Promise.all([
      obtenerPersonal(),
      obtenerAreasActivas(),
      obtenerCargosActivos()
    ])

    if (resPersonal.error) {
      Toast.error(resPersonal.error.message);
      return;
    }

    if (resAreas.error) {
      Toast.error(resAreas.error.message);
      return;
    }

    if (resCargos.error) {
      Toast.error(resCargos.error.message);
      return;
    }

    setPersonal(resPersonal.data || [])
    setAreas(resAreas.data || [])
    setCargos(resCargos.data || [])
  }

  const abrirNuevo = () => {
    setPersonalEditando(null)
    setModalAbierto(true)
  }

  const abrirEditar = (registro) => {
    setPersonalEditando(registro)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setPersonalEditando(null)
  }

  const guardar = async (form) => {
    const datos = {
      dni: form.dni,
      nombres: form.nombres,
      apellidos: form.apellidos,
      area: form.area,
      cargo: form.cargo,
      estado: form.estado,
      es_evaluable: form.es_evaluable
    }

    const respuesta = personalEditando
      ? await actualizarPersonal(personalEditando.id, datos)
      : await crearPersonal(datos)

    if (respuesta.error) {
      Toast.error(respuesta.error.message);
      return
    }

    cerrarModal()
    cargarDatos()
  }

  const eliminar = async (id) => {
    const confirmar = confirm('¿Seguro que deseas eliminar este registro?')
    if (!confirmar) return

    const { error } = await eliminarPersonal(id)

    if (error) {
      Toast.error(error.message);
      return
    }

    cargarDatos()
  }

  const areasUnicas = [
    ...new Set(
      personal
        .map((p) => p.area)
        .filter((area) => area && area.trim() !== '')
    )
  ].sort()

  const personalFiltrado = personal.filter((p) => {
    const coincideBusqueda = `${p.dni} ${p.nombres} ${p.apellidos} ${p.area || ''} ${p.cargo || ''}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())

    const coincideArea = areaFiltro ? p.area === areaFiltro : true

    return coincideBusqueda && coincideArea
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Personal</h1>
          <p>Registro del personal de la institución</p>
        </div>

        <button className="primary-btn" onClick={abrirNuevo}>
          Nuevo personal
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Buscar por DNI, nombres, apellidos, área o cargo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button
          className="filter-btn"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          Filtrar
        </button>
      </div>

      {mostrarFiltros && (
        <div className="filter-panel">
          <label>Área</label>

          <select
            value={areaFiltro}
            onChange={(e) => setAreaFiltro(e.target.value)}
          >
            <option value="">Todas las áreas</option>

            {areasUnicas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <div className="filter-actions">
            <button
              type="button"
              onClick={() => {
                setAreaFiltro('')
                setMostrarFiltros(false)
              }}
            >
              Limpiar
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={() => setMostrarFiltros(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      <p className="result-count">
        Mostrando {personalFiltrado.length} de {personal.length} registros
      </p>

      <PersonalTable
        personal={personalFiltrado}
        onEditar={abrirEditar}
        onEliminar={eliminar}
      />

      <PersonalModal
        abierto={modalAbierto}
        onCerrar={cerrarModal}
        onGuardar={guardar}
        areas={areas}
        cargos={cargos}
        personalEditando={personalEditando}
      />
    </div>
  )
}

export default Personal