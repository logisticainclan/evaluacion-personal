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
  return await supabase
    .from('niveles_calificacion')
    .delete()
    .eq('id', id)
}