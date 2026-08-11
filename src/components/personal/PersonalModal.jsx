import { useEffect, useState } from "react";
import { UserRound, BriefcaseBusiness, X } from "lucide-react";

import { Toast } from "../../lib/toast";
import AutocompleteInput from "../common/AutocompleteInput";

const formInicial = {
  dni: "",
  nombres: "",
  apellidos: "",
  area: "",
  cargo: "",
  estado: "activo",
  es_evaluable: true,
};

function PersonalModal({
  abierto,
  onCerrar,
  onGuardar,
  areas,
  cargos,
  personalEditando,
}) {
  const [form, setForm] = useState(formInicial);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (personalEditando) {
      setForm({
        dni: personalEditando.dni || "",
        nombres: personalEditando.nombres || "",
        apellidos: personalEditando.apellidos || "",
        area: personalEditando.area || "",
        cargo: personalEditando.cargo || "",
        estado: personalEditando.estado || "activo",
        es_evaluable: personalEditando.es_evaluable ?? true,
      });
    } else {
      setForm(formInicial);
    }

    setGuardando(false);
  }, [personalEditando, abierto]);

  if (!abierto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.dni.length !== 8) {
      Toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (!form.nombres.trim()) {
      Toast.error("Ingrese los nombres");
      return;
    }

    if (!form.apellidos.trim()) {
      Toast.error("Ingrese los apellidos");
      return;
    }

    if (!form.area.trim()) {
      Toast.error("Seleccione o ingrese un área");
      return;
    }

    if (!form.cargo.trim()) {
      Toast.error("Seleccione o ingrese un cargo");
      return;
    }

    setGuardando(true);

    await onGuardar(form);

    setGuardando(false);
  };

  return (
    <div className="modal-bg personal-modal-bg">
      <form className="personal-modal-card" onSubmit={handleSubmit}>
        <div className="personal-modal-header">
          <div>
            <span className="personal-modal-kicker">Gestión de personal</span>

            <h2>
              {personalEditando ? "Editar personal" : "Registrar personal"}
            </h2>
          </div>

          <button
            type="button"
            className="personal-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            disabled={guardando}
          >
            <X size={20} />
          </button>
        </div>

        <section className="personal-modal-section">
          <div className="personal-modal-section-title">
            <div>
              <UserRound size={19} />
            </div>

            <div>
              <strong>Información personal</strong>
              <span>Datos de identificación del trabajador</span>
            </div>
          </div>

          <div className="personal-form-grid">
            <div className="personal-form-field">
              <label htmlFor="personal-dni">DNI</label>

              <input
                id="personal-dni"
                value={form.dni}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dni: e.target.value.replace(/\D/g, ""),
                  })
                }
                maxLength={8}
                inputMode="numeric"
                placeholder="Ingrese 8 dígitos"
                disabled={guardando}
                required
              />
            </div>

            <div className="personal-form-field">
              <label htmlFor="personal-nombres">Nombres</label>

              <input
                id="personal-nombres"
                value={form.nombres}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombres: e.target.value,
                  })
                }
                placeholder="Ingrese los nombres"
                disabled={guardando}
                required
              />
            </div>

            <div className="personal-form-field personal-field-full">
              <label htmlFor="personal-apellidos">Apellidos</label>

              <input
                id="personal-apellidos"
                value={form.apellidos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    apellidos: e.target.value,
                  })
                }
                placeholder="Ingrese los apellidos"
                disabled={guardando}
                required
              />
            </div>
          </div>
        </section>

        <section className="personal-modal-section">
          <div className="personal-modal-section-title">
            <div>
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <strong>Información laboral</strong>
              <span>Ubicación y función dentro de la institución</span>
            </div>
          </div>

          <div className="personal-form-grid">
            <div className="personal-form-field">
              <label htmlFor="personal-area">Área</label>

              <AutocompleteInput
                id="personal-area"
                value={form.area}
                onChange={(valor) =>
                  setForm({
                    ...form,
                    area: valor,
                  })
                }
                options={areas}
                placeholder="Escriba o seleccione un área"
                disabled={guardando}
                required
                emptyMessage="No existe un área con ese nombre"
              />
            </div>

            <div className="personal-form-field">
              <label htmlFor="personal-cargo">Cargo</label>

              <input
                id="personal-cargo"
                type="text"
                value={form.cargo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cargo: e.target.value,
                  })
                }
                placeholder="Ingrese el cargo"
                autoComplete="off"
                disabled={guardando}
                required
              />
            </div>

            <div className="personal-form-field">
              <label htmlFor="personal-estado">Estado</label>

              <select
                id="personal-estado"
                value={form.estado}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estado: e.target.value,
                  })
                }
                disabled={guardando}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <label className="personal-evaluable-control">
              <input
                type="checkbox"
                checked={form.es_evaluable}
                onChange={(e) =>
                  setForm({
                    ...form,
                    es_evaluable: e.target.checked,
                  })
                }
                disabled={guardando}
              />

              <span>
                <strong>Personal evaluable</strong>
                <small>Incluir a este trabajador en las evaluaciones</small>
              </span>
            </label>
          </div>
        </section>

        <div className="personal-modal-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button className="primary-btn" type="submit" disabled={guardando}>
            {guardando
              ? "Guardando..."
              : personalEditando
                ? "Actualizar personal"
                : "Registrar personal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PersonalModal;
