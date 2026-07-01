import { supabase } from "../lib/supabase";

export async function obtenerResultados() {
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
      usuarios_app (
        usuario,
        rol,
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