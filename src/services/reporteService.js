import { supabase } from "../lib/supabase";
import { obtenerUsuarioActual } from "../lib/auth";

export async function obtenerReporteEvaluacion(id) {
  const usuario = obtenerUsuarioActual();

  if (!usuario?.id) {
    return {
      data: null,
      error: {
        message: "No se encontró una sesión válida.",
      },
    };
  }

  let consulta = supabase
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
    .eq("id", id);

  if (usuario.rol !== "admin") {
    consulta = consulta.eq("evaluador_id", usuario.id);
  }

  const { data, error } = await consulta.maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: null,
      error: {
        message:
          "El reporte no existe o no tienes permiso para acceder a él.",
      },
    };
  }

  return {
    data,
    error: null,
  };
}