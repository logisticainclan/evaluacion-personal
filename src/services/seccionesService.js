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
  return await supabase
    .from('secciones')
    .delete()
    .eq('id', id)
}