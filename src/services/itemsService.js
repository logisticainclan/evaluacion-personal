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
  return await supabase.from('items').delete().eq('id', id)
}