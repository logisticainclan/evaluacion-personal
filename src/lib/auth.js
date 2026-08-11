import { supabase } from "./supabase";

export function obtenerUsuarioActual() {
  return JSON.parse(localStorage.getItem("usuario_app"));
}

export function obtenerRolActual() {
  const usuario = obtenerUsuarioActual();
  return usuario?.rol || null;
}

export function esAdmin() {
  return obtenerRolActual() === "admin";
}

export function esEvaluador() {
  return obtenerRolActual() === "evaluador";
}

export async function validarUsuarioActual() {
  const usuarioLocal = obtenerUsuarioActual();

  if (!usuarioLocal?.id) {
    return {
      valido: false,
      usuario: null,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("usuarios_app")
    .select(`
      id,
      rol,
      activo,
      personal_id,
      personal (
        nombres,
        apellidos
      )
    `)
    .eq("id", usuarioLocal.id)
    .maybeSingle();

  if (error) {
    return {
      valido: false,
      usuario: null,
      error,
    };
  }

  if (!data || data.activo === false) {
    localStorage.removeItem("usuario_app");

    return {
      valido: false,
      usuario: null,
      error: null,
    };
  }

  const usuarioActualizado = {
    ...usuarioLocal,
    ...data,
    nombres:
      data.personal?.nombres ||
      usuarioLocal.nombres,
    apellidos:
      data.personal?.apellidos ||
      usuarioLocal.apellidos,
  };

  localStorage.setItem(
    "usuario_app",
    JSON.stringify(usuarioActualizado),
  );

  return {
    valido: true,
    usuario: usuarioActualizado,
    error: null,
  };
}

export function cerrarSesion() {
  localStorage.removeItem("usuario_app");
  window.location.href = "/login";
}