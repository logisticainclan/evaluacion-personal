import { supabase } from '../lib/supabase'

export async function obtenerItems() {
  return await supabase
    .from('items')
    .select(`
      *,
      secciones(nombre)
    `)
    .order('orden', { ascending: true })
}

export async function obtenerSeccionesActivas() {
  return await supabase
    .from('secciones')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
}

export async function crearItem(data) {
  return await supabase.from('items').insert([data])
}

export async function actualizarItem(id, data) {
  return await supabase.from('items').update(data).eq('id', id)
}

export async function eliminarItem(id) {
  const { count, error: errorConteo } = await supabase
    .from("evaluacion_detalle")
    .select("*", { count: "exact", head: true })
    .eq("item_id", id);

  if (errorConteo) {
    return {
      data: null,
      error: errorConteo,
    };
  }

  if (count > 0) {
    const { data, error } = await supabase
      .from("items")
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
    .from("items")
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