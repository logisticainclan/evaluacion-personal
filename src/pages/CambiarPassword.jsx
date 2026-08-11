import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import { Toast } from "../lib/toast";
import { cambiarMiPassword } from "../services/usuariosService";

function CampoPassword({
  label,
  value,
  campo,
  mostrar,
  cambiarMostrar,
  autocomplete,
  actualizarCampo,
  guardando,
}) {
  return (
    <div className="password-field">
      <label htmlFor={campo}>{label}</label>

      <div className="password-input-wrapper">
        <input
          id={campo}
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={(e) =>
            actualizarCampo(campo, e.target.value)
          }
          autoComplete={autocomplete}
          disabled={guardando}
          required
        />

        <button
          type="button"
          className="password-eye-btn"
          onClick={cambiarMostrar}
          aria-label={
            mostrar
              ? "Ocultar contraseña"
              : "Mostrar contraseña"
          }
          disabled={guardando}
        >
          {mostrar ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>
    </div>
  );
}

function CambiarPassword() {
  const [form, setForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  });

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);

  const [guardando, setGuardando] = useState(false);

  const usuario = JSON.parse(
    localStorage.getItem("usuario_app")
  );

  const actualizarCampo = (campo, valor) => {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      Toast.error("No se encontró la sesión del usuario");
      return;
    }

    if (!form.passwordActual.trim()) {
      Toast.error("Ingrese su contraseña actual");
      return;
    }

    if (form.passwordNueva.length < 4) {
      Toast.error(
        "La nueva contraseña debe tener al menos 4 caracteres"
      );
      return;
    }

    if (form.passwordNueva !== form.confirmarPassword) {
      Toast.error("Las nuevas contraseñas no coinciden");
      return;
    }

    if (form.passwordActual === form.passwordNueva) {
      Toast.error(
        "La nueva contraseña debe ser diferente de la actual"
      );
      return;
    }

    setGuardando(true);

    const { error } = await cambiarMiPassword({
      usuarioId: usuario.id,
      passwordActual: form.passwordActual,
      passwordNueva: form.passwordNueva,
    });

    setGuardando(false);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success("Contraseña actualizada correctamente");

    setForm({
      passwordActual: "",
      passwordNueva: "",
      confirmarPassword: "",
    });

    setMostrarActual(false);
    setMostrarNueva(false);
    setMostrarConfirmacion(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Cambiar contraseña</h1>
          <p>Actualiza la contraseña de acceso a tu cuenta.</p>
        </div>
      </div>

      <div className="password-page-card">
        <div className="password-page-icon">
          <KeyRound size={28} />
        </div>

        <div className="password-page-header">
          <h2>Seguridad de la cuenta</h2>

          <p>
            Para proteger tu cuenta, primero debes confirmar
            tu contraseña actual.
          </p>
        </div>

        <form onSubmit={guardar}>
          <CampoPassword
            label="Contraseña actual"
            campo="passwordActual"
            value={form.passwordActual}
            mostrar={mostrarActual}
            cambiarMostrar={() =>
              setMostrarActual((estado) => !estado)
            }
            autocomplete="current-password"
            actualizarCampo={actualizarCampo}
            guardando={guardando}
          />

          <CampoPassword
            label="Nueva contraseña"
            campo="passwordNueva"
            value={form.passwordNueva}
            mostrar={mostrarNueva}
            cambiarMostrar={() =>
              setMostrarNueva((estado) => !estado)
            }
            autocomplete="new-password"
            actualizarCampo={actualizarCampo}
            guardando={guardando}
          />

          <CampoPassword
            label="Confirmar nueva contraseña"
            campo="confirmarPassword"
            value={form.confirmarPassword}
            mostrar={mostrarConfirmacion}
            cambiarMostrar={() =>
              setMostrarConfirmacion((estado) => !estado)
            }
            autocomplete="new-password"
            actualizarCampo={actualizarCampo}
            guardando={guardando}
          />

          <div className="password-requirements">
            La nueva contraseña debe tener al menos 4 caracteres
            y ser diferente de la actual.
          </div>

          <div className="password-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={guardando}
            >
              {guardando
                ? "Actualizando..."
                : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CambiarPassword;