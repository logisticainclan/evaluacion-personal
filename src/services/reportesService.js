import { supabase } from "../lib/supabase";

export async function obtenerReporteGeneral() {
  return await supabase
    .from("evaluaciones")
    .select(`
      id,
      estado,
      puntaje_total,
      promedio,
      created_at,
      personal (
        dni,
        nombres,
        apellidos,
        area,
        cargo
      ),
      evaluador:usuarios_app!evaluaciones_evaluador_id_fkey (
        personal (
          nombres,
          apellidos
        )
      ),
      periodos (
        anio,
        nombre
      )
    `)
    .eq("estado", "finalizada")
    .order("created_at", { ascending: false });
}