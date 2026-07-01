import { supabase } from "../lib/supabase";

export async function obtenerEvaluadores() {
  return await supabase
    .from("usuarios_app")
    .select(`
      id,
      rol,
      personal_id,
      personal (
        nombres,
        apellidos,
        cargo
      )
    `)
    .order("created_at");
}

export async function obtenerPersonal() {
  return await supabase
    .from("personal")
    .select("id,dni,nombres,apellidos,area")
    .eq("estado", "activo")
    .order("apellidos");
}

export async function obtenerAsignaciones(evaluadorId) {
  return await supabase
    .from("evaluador_personal")
    .select("personal_id")
    .eq("evaluador_id", evaluadorId);
}

export async function guardarAsignaciones(evaluadorId, personalIds) {

  await supabase
    .from("evaluador_personal")
    .delete()
    .eq("evaluador_id", evaluadorId);

  if (personalIds.length === 0) return;

  const registros = personalIds.map(id => ({
    evaluador_id: evaluadorId,
    personal_id: id
  }));

  return await supabase
    .from("evaluador_personal")
    .insert(registros);
}