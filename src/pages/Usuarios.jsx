import { useEffect, useState } from "react";
import { Toast } from "../lib/toast";
import AutocompleteInput from "../components/common/AutocompleteInput";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  KeyRound,
  Power,
  Eye,
  EyeOff,
} from "lucide-react";

import "../styles/usuarios.css";

import {
  obtenerUsuarios,
  obtenerPersonalSinUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarPasswordUsuario,
} from "../services/usuariosService";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [modal, setModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [modalPassword, setModalPassword] = useState(false);
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const [rolFiltro, setRolFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);

  const [mostrarNuevaPasswordAdmin, setMostrarNuevaPasswordAdmin] =
    useState(false);

  const [mostrarConfirmarPasswordAdmin, setMostrarConfirmarPasswordAdmin] =
    useState(false);

  const [form, setForm] = useState({
    personal_id: "",
    password: "",
    rol: "evaluador",
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [resUsuarios, resPersonal] = await Promise.all([
      obtenerUsuarios(),
      obtenerPersonalSinUsuario(),
    ]);

    if (resUsuarios.error) {
      Toast.error(resUsuarios.error.message);
      return;
    }

    if (resPersonal.error) {
      Toast.error(resPersonal.error.message);
      return;
    }

    setUsuarios(resUsuarios.data || []);
    setPersonal(resPersonal.data || []);
  };

  const abrirNuevo = () => {
    setUsuarioEditando(null);
    setMostrarPasswordNueva(false);

    setForm({
      personal_id: "",
      password: "",
      rol: "evaluador",
      activo: true,
    });

    setModal(true);
  };

  const abrirEditar = (usuario) => {
    setUsuarioEditando(usuario);

    setForm({
      personal_id: usuario.personal_id,
      password: "",
      rol: usuario.rol,
      activo: usuario.activo,
    });

    setModal(true);
  };

  const cerrarModal = () => {
    setModal(false);
    setUsuarioEditando(null);
    setMostrarPasswordNueva(false);

    setForm({
      personal_id: "",
      password: "",
      rol: "evaluador",
      activo: true,
    });
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    if (usuarioEditando) {
      const { error } = await actualizarUsuario(usuarioEditando.id, {
        rol: form.rol,
        activo: form.activo,
      });

      if (error) {
        Toast.error(error.message);
        return;
      }

      Toast.success("Usuario actualizado correctamente");
      cerrarModal();
      await cargarDatos();
      return;
    }

    if (!form.personal_id) {
      Toast.error("Seleccione un personal");
      return;
    }

    if (form.password.length < 4) {
      Toast.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    const { error } = await crearUsuario(form);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success("Usuario creado correctamente");
    cerrarModal();
    await cargarDatos();
  };

  const cambiarEstado = async (usuario) => {
    const { error } = await actualizarUsuario(usuario.id, {
      activo: !usuario.activo,
    });

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success(
      usuario.activo
        ? "Usuario desactivado correctamente"
        : "Usuario activado correctamente",
    );

    await cargarDatos();
  };

  const abrirCambiarPassword = (usuario) => {
    setUsuarioPassword(usuario);
    setNuevaPassword("");
    setConfirmarPassword("");
    setMostrarNuevaPasswordAdmin(false);
    setMostrarConfirmarPasswordAdmin(false);
    setModalPassword(true);
  };

  const cerrarModalPassword = () => {
    setModalPassword(false);
    setUsuarioPassword(null);
    setNuevaPassword("");
    setConfirmarPassword("");
    setMostrarNuevaPasswordAdmin(false);
    setMostrarConfirmarPasswordAdmin(false);
  };

  const guardarNuevaPassword = async (e) => {
    e.preventDefault();

    if (!usuarioPassword?.id) {
      Toast.error("No se encontró el usuario");
      return;
    }

    if (nuevaPassword.length < 4) {
      Toast.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      Toast.error("Las contraseñas no coinciden");
      return;
    }

    setGuardandoPassword(true);

    const { error } = await cambiarPasswordUsuario(
      usuarioPassword.id,
      nuevaPassword,
    );

    setGuardandoPassword(false);

    if (error) {
      Toast.error(error.message);
      return;
    }

    Toast.success("Contraseña actualizada correctamente");
    cerrarModalPassword();
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = `
    ${u.personal?.dni || ""}
    ${u.personal?.nombres || ""}
    ${u.personal?.apellidos || ""}
    ${u.rol || ""}
  `.toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    const coincideRol = rolFiltro ? u.rol === rolFiltro : true;

    const coincideEstado =
      estadoFiltro === ""
        ? true
        : estadoFiltro === "activo"
          ? u.activo === true
          : u.activo === false;

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const totalActivos = usuarios.filter((u) => u.activo).length;
  const totalInactivos = usuarios.filter((u) => !u.activo).length;
  const totalAdmins = usuarios.filter((u) => u.rol === "admin").length;

  const opcionesPersonal = personal.map((p) => ({
    value: p.id,
    label: `${p.apellidos}, ${p.nombres}`,
    sublabel: `DNI: ${p.dni}`,
    searchText: `${p.dni} ${p.nombres} ${p.apellidos}`,
    dni: p.dni,
  }));

  const personalSeleccionado = personal.find((p) => p.id === form.personal_id);

  const textoPersonalSeleccionado = personalSeleccionado
    ? `${personalSeleccionado.apellidos}, ${personalSeleccionado.nombres}`
    : "";

  return (
    <div className="usuarios-page">
      <div className="page-header usuarios-page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Accesos al sistema</p>
        </div>

        <button className="primary-btn" onClick={abrirNuevo}>
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      <div className="usuarios-stats-grid">
        <div className="usuario-stat-card">
          <div className="usuario-stat-icon usuario-stat-blue">
            <Users size={22} />
          </div>

          <div>
            <span>Total de usuarios</span>
            <strong>{usuarios.length}</strong>
          </div>
        </div>

        <div className="usuario-stat-card">
          <div className="usuario-stat-icon usuario-stat-green">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Usuarios activos</span>
            <strong>{totalActivos}</strong>
          </div>
        </div>

        <div className="usuario-stat-card">
          <div className="usuario-stat-icon usuario-stat-red">
            <UserX size={22} />
          </div>

          <div>
            <span>Usuarios inactivos</span>
            <strong>{totalInactivos}</strong>
          </div>
        </div>

        <div className="usuario-stat-card">
          <div className="usuario-stat-icon usuario-stat-violet">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Administradores</span>
            <strong>{totalAdmins}</strong>
          </div>
        </div>
      </div>

      <section className="usuarios-filters-card">
        <div className="usuarios-filter-title">
          <SlidersHorizontal size={18} />

          <div>
            <strong>Filtros</strong>
            <span>Encuentra rápidamente un usuario</span>
          </div>
        </div>

        <div className="usuarios-filters-grid">
          <div className="usuarios-search-wrapper">
            <Search size={18} />

            <input
              className="usuario-filter-control"
              placeholder="Buscar por DNI, nombres o apellidos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="usuario-filter-control"
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="evaluador">Evaluador</option>
          </select>

          <select
            className="usuario-filter-control"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setBusqueda("");
              setRolFiltro("");
              setEstadoFiltro("");
            }}
            disabled={!busqueda && !rolFiltro && !estadoFiltro}
          >
            Limpiar
          </button>
        </div>
      </section>

      <div className="usuarios-results-summary">
        <span>
          Mostrando <strong>{usuariosFiltrados.length}</strong> de{" "}
          <strong>{usuarios.length}</strong> usuarios
        </span>
      </div>

      <div className="usuarios-table-card">
        <div className="usuarios-table-scroll">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="usuario-person-cell">
                      <div className="usuario-avatar">
                        {u.personal
                          ? `${u.personal.nombres?.charAt(0) || ""}${
                              u.personal.apellidos?.charAt(0) || ""
                            }`.toUpperCase()
                          : "U"}
                      </div>

                      <div>
                        <strong>
                          {u.personal
                            ? `${u.personal.apellidos}, ${u.personal.nombres}`
                            : "Sin personal asociado"}
                        </strong>

                        <span>DNI: {u.personal?.dni || "-"}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`usuario-rol-badge ${
                        u.rol === "admin"
                          ? "usuario-rol-admin"
                          : "usuario-rol-evaluador"
                      }`}
                    >
                      {u.rol === "admin" ? "Administrador" : "Evaluador"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status ${u.activo ? "activo" : "inactivo"}`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td>
                    <div className="usuario-actions">
                      <button
                        type="button"
                        className="usuario-action-btn usuario-action-edit"
                        onClick={() => abrirEditar(u)}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className="usuario-action-btn usuario-action-password"
                        onClick={() => abrirCambiarPassword(u)}
                      >
                        <KeyRound size={16} />
                        Contraseña
                      </button>

                      <button
                        type="button"
                        className="usuario-action-btn usuario-action-state"
                        onClick={() => cambiarEstado(u)}
                      >
                        <Power size={16} />
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-table">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-bg">
          <form className="usuario-modal-card" onSubmit={guardarUsuario}>
            <div className="usuario-modal-header">
              <div>
                <span className="usuario-modal-kicker">
                  Gestión de usuarios
                </span>

                <h2>{usuarioEditando ? "Editar usuario" : "Nuevo usuario"}</h2>
              </div>

              <button
                type="button"
                className="usuario-modal-close"
                onClick={cerrarModal}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="usuario-form-section">
              <div className="usuario-form-grid">
                <div className="usuario-form-field usuario-field-full">
                  <label>Personal</label>

                  {usuarioEditando ? (
                    <input
                      type="text"
                      value={`${usuarioEditando.personal?.dni || ""} - ${
                        usuarioEditando.personal?.apellidos || ""
                      }, ${usuarioEditando.personal?.nombres || ""}`}
                      disabled
                    />
                  ) : (
                    <AutocompleteInput
                      id="usuario-personal"
                      value={form.personal_id}
                      displayValue={textoPersonalSeleccionado}
                      onChange={(personalId, opcion) => {
                        const dni = opcion?.dni || "";

                        setForm((anterior) => ({
                          ...anterior,
                          personal_id: personalId,
                          password:
                            personalId && dni.length >= 4 ? dni.slice(-4) : "",
                        }));
                      }}
                      options={opcionesPersonal}
                      placeholder="Buscar por DNI, nombres o apellidos..."
                      required
                      allowCustomValue={false}
                      showCreateMessage={false}
                      emptyMessage="No se encontró personal con esos datos"
                    />
                  )}
                </div>

                {!usuarioEditando && (
                  <div className="usuario-form-field usuario-field-full">
                    <label>Contraseña</label>

                    <div className="usuario-password-input-wrapper">
                      <input
                        type={mostrarPasswordNueva ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            password: e.target.value,
                          })
                        }
                        minLength={4}
                        autoComplete="new-password"
                        placeholder="Ingrese una contraseña"
                        required
                      />

                      <button
                        type="button"
                        className="usuario-password-eye"
                        onClick={() =>
                          setMostrarPasswordNueva((anterior) => !anterior)
                        }
                        aria-label={
                          mostrarPasswordNueva
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        title={
                          mostrarPasswordNueva
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {mostrarPasswordNueva ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="usuario-form-field">
                  <label>Rol</label>

                  <select
                    value={form.rol}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rol: e.target.value,
                      })
                    }
                  >
                    <option value="admin">Administrador</option>
                    <option value="evaluador">Evaluador</option>
                  </select>
                </div>

                {usuarioEditando && (
                  <label className="usuario-activo-control">
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
                      <strong>Usuario activo</strong>
                      <small>Permite el acceso al sistema</small>
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="usuario-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={cerrarModal}
              >
                Cancelar
              </button>

              <button className="primary-btn" type="submit">
                {usuarioEditando ? "Actualizar usuario" : "Crear usuario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalPassword && (
        <div className="modal-bg">
          <form
            className="usuario-password-modal"
            onSubmit={guardarNuevaPassword}
          >
            <div className="usuario-password-header">
              <div>
                <span className="usuario-modal-kicker">
                  Seguridad de la cuenta
                </span>

                <h2>Cambiar contraseña</h2>

                <p>
                  Actualiza la contraseña de acceso del usuario seleccionado.
                </p>
              </div>

              <button
                type="button"
                className="usuario-modal-close"
                onClick={cerrarModalPassword}
                disabled={guardandoPassword}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="usuario-password-body">
              <div className="usuario-password-person">
                <div className="usuario-avatar">
                  {usuarioPassword?.personal
                    ? `${usuarioPassword.personal.nombres?.charAt(0) || ""}${
                        usuarioPassword.personal.apellidos?.charAt(0) || ""
                      }`.toUpperCase()
                    : "U"}
                </div>

                <div>
                  <strong>
                    {usuarioPassword?.personal
                      ? `${usuarioPassword.personal.apellidos}, ${usuarioPassword.personal.nombres}`
                      : "Usuario"}
                  </strong>

                  <span>DNI: {usuarioPassword?.personal?.dni || "-"}</span>
                </div>
              </div>

              <div className="usuario-password-fields">
                <div className="usuario-form-field">
                  <label htmlFor="usuario-nueva-password">
                    Nueva contraseña
                  </label>

                  <div className="usuario-password-input-wrapper">
                    <input
                      id="usuario-nueva-password"
                      type={mostrarNuevaPasswordAdmin ? "text" : "password"}
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      minLength={4}
                      autoComplete="new-password"
                      placeholder="Ingrese la nueva contraseña"
                      disabled={guardandoPassword}
                      required
                    />

                    <button
                      type="button"
                      className="usuario-password-eye"
                      onClick={() =>
                        setMostrarNuevaPasswordAdmin((estado) => !estado)
                      }
                      disabled={guardandoPassword}
                      aria-label={
                        mostrarNuevaPasswordAdmin
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {mostrarNuevaPasswordAdmin ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="usuario-form-field">
                  <label htmlFor="usuario-confirmar-password">
                    Confirmar contraseña
                  </label>

                  <div className="usuario-password-input-wrapper">
                    <input
                      id="usuario-confirmar-password"
                      type={mostrarConfirmarPasswordAdmin ? "text" : "password"}
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      minLength={4}
                      autoComplete="new-password"
                      placeholder="Repita la nueva contraseña"
                      disabled={guardandoPassword}
                      required
                    />

                    <button
                      type="button"
                      className="usuario-password-eye"
                      onClick={() =>
                        setMostrarConfirmarPasswordAdmin((estado) => !estado)
                      }
                      disabled={guardandoPassword}
                      aria-label={
                        mostrarConfirmarPasswordAdmin
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {mostrarConfirmarPasswordAdmin ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="usuario-password-help">
                La contraseña debe tener al menos 4 caracteres.
              </div>
            </div>

            <div className="usuario-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={cerrarModalPassword}
                disabled={guardandoPassword}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={guardandoPassword}
              >
                {guardandoPassword
                  ? "Actualizando..."
                  : "Actualizar contraseña"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
