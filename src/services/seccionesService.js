import { supabase } from '../lib/supabase'

export async function obtenerSecciones() {
  return await supabase
    .from('secciones')
    .select('*')
    .order('orden', { ascending: true })
}

export async function crearSeccion(data) {
  return await supabase
    .from('secciones')
    .insert([data])
}

export async function actualizarSeccion(id, data) {
  return await supabase
    .from('secciones')
    .update(data)
    .eq('id', id)
}

export async function eliminarSeccion(id) {
  const { count, error: errorConteo } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("seccion_id", id);

  if (errorConteo) {
    return {
      data: null,
      error: errorConteo,
    };
  }

  if (count > 0) {
    const { data, error } = await supabase
      .from("secciones")
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
    .from("secciones")
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