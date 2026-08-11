import { supabase } from "../lib/supabase";
import { obtenerPeriodoActivo } from "./evaluacionesService";

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
    .select("id,dni,nombres,apellidos,area,cargo")
    .eq("estado", "activo")
    .eq("es_evaluable", true)
    .order("apellidos");
}

export async function obtenerPersonalAsignadoPeriodo() {
  const { data: periodo, error } = await obtenerPeriodoActivo();

  if (error || !periodo?.id) {
    return {
      data: [],
      error: error || {
        message: "No existe un período activo.",
      },
    };
  }

  return await supabase
    .from("evaluador_personal")
    .select("personal_id")
    .eq("periodo_id", periodo.id);
}

export async function obtenerAsignaciones(evaluadorId) {
  const { data: periodo, error } = await obtenerPeriodoActivo();

  if (error || !periodo?.id) {
    return {
      data: [],
      error: error || {
        message: "No existe un período activo.",
      },
    };
  }

  return await supabase
    .from("evaluador_personal")
    .select("personal_id")
    .eq("evaluador_id", evaluadorId)
    .eq("periodo_id", periodo.id);
}

export async function guardarAsignaciones(
  evaluadorId,
  personalIds
) {
  return await supabase.rpc(
    "guardar_asignaciones_evaluador",
    {
      p_evaluador_id: evaluadorId,
      p_personal_ids: personalIds,
    }
  );
}