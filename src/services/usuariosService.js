import { supabase } from "../lib/supabase";

export async function obtenerUsuarios() {
  return await supabase
    .from("usuarios_app")
    .select(`
      id,
      personal_id,
      usuario,
      rol,
      activo,
      created_at,
      personal:personal_id (
        dni,
        nombres,
        apellidos
      )
    `)
    .order("created_at", { ascending: false });
}

export async function obtenerPersonalSinUsuario() {
  return await supabase
    .from("personal")
    .select("*")
    .eq("estado", "activo")
    .order("apellidos", { ascending: true });
}

export async function crearUsuario(data) {
  return await supabase.rpc("crear_usuario_dni", {
    p_personal_id: data.personal_id,
    p_password: data.password,
    p_rol: data.rol,
  });
}

export async function actualizarUsuario(id, data) {
  return await supabase
    .from("usuarios_app")
    .update(data)
    .eq("id", id);
}

export async function cambiarPasswordUsuario(usuarioId, password) {
  return await supabase.rpc("cambiar_password_usuario", {
    p_usuario_id: usuarioId,
    p_password: password,
  });
}

export async function cambiarMiPassword({
  usuarioId,
  passwordActual,
  passwordNueva,
}) {
  return await supabase.rpc("cambiar_mi_password", {
    p_usuario_id: usuarioId,
    p_password_actual: passwordActual,
    p_password_nueva: passwordNueva,
  });
}