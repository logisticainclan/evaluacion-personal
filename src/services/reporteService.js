import { supabase } from "../lib/supabase";

export async function obtenerReporteEvaluacion(id) {
  return await supabase
    .from("evaluaciones")
    .select(`
  *,
  personal (
    dni,
    nombres,
    apellidos,
    area,
    cargo
  ),
  periodos (
    anio,
    nombre
  ),
  evaluador:usuarios_app!evaluaciones_evaluador_id_fkey (
  personal (
    nombres,
    apellidos
  )
),
  evaluacion_detalle (
    item_id,
    nivel_id,
    puntaje,
    items (
      descripcion,
      secciones (
        nombre,
        orden
      )
    ),
    niveles_calificacion (
      nombre,
      puntaje
    )
  )
`)
    .eq("id", id)
    .single();
}