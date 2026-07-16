import { useEffect, useState } from 'react'
import { Toast } from "../../lib/toast";

const formInicial = {
  dni: '',
  nombres: '',
  apellidos: '',
  area: '',
  cargo: '',
  estado: 'activo',
  es_evaluable: true
}

function PersonalModal({ abierto, onCerrar, onGuardar, areas, cargos, personalEditando }) {
  const [form, setForm] = useState(formInicial)

  useEffect(() => {
    if (personalEditando) {
      setForm({
        dni: personalEditando.dni || '',
        nombres: personalEditando.nombres || '',
        apellidos: personalEditando.apellidos || '',
        area: personalEditando.area || '',
        cargo: personalEditando.cargo || '',
        estado: personalEditando.estado || 'activo',
        es_evaluable: personalEditando.es_evaluable ?? true
      })
    } else {
      setForm(formInicial)
    }
  }, [personalEditando, abierto])

  if (!abierto) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.dni.length !== 8) {
      Toast.error("El DNI debe tener 8 dígitos");
      return
    }

    onGuardar(form)
  }

  return (
    <div className="modal-bg">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>{personalEditando ? 'Editar personal' : 'Nuevo personal'}</h2>

        <label>DNI</label>
        <input
          value={form.dni}
          onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
          maxLength="8"
          required
        />

        <label>Nombres</label>
        <input
          value={form.nombres}
          onChange={(e) => setForm({ ...form, nombres: e.target.value })}
          required
        />

        <label>Apellidos</label>
        <input
          value={form.apellidos}
          onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
          required
        />

        <label>Área</label>
<input
  value={form.area}
  onChange={(e) => setForm({ ...form, area: e.target.value })}
  required
/>

<label>Cargo</label>
<input
  value={form.cargo}
  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
  required
/>

        <label>Estado</label>
        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.es_evaluable}
            onChange={(e) => setForm({ ...form, es_evaluable: e.target.checked })}
          />
          Será evaluado
        </label>

        <div className="modal-actions">
          <button type="button" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="primary-btn" type="submit">
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

export default PersonalModal