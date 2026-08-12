import { supabase } from '../lib/supabase'

export async function obtenerNiveles() {
  return await supabase
    .from('niveles_calificacion')
    .select('*')
    .order('orden', { ascending: true })
}

export async function crearNivel(data) {
  return await supabase
    .from('niveles_calificacion')
    .insert([data])
}

export async function actualizarNivel(id, data) {
  return await supabase
    .from('niveles_calificacion')
    .update(data)
    .eq('id', id)
}

export async function eliminarNivel(id) {
  const { count, error: errorConteo } = await supabase
    .from("evaluacion_detalle")
    .select("*", { count: "exact", head: true })
    .eq("nivel_id", id);

  if (errorConteo) {
    return {
      data: null,
      error: errorConteo,
    };
  }

  if (count > 0) {
    const { data, error } = await supabase
      .from("niveles_calificacion")
      .update({ activo: false })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return {
        data: null,
        error,
      };
    }

    return {
      data,
      error: null,
      desactivado: true,
    };
  }

  const { data, error } = await supabase
    .from("niveles_calificacion")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
    desactivado: false,
  };
}