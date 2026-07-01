import { supabase } from '../lib/supabase'

export async function obtenerPersonal() {
  return await supabase
    .from('personal')
    .select('*')
    .order('apellidos', { ascending: true })
}

export async function obtenerAreasActivas() {
  return await supabase
    .from('areas')
    .select('*')
    .eq('activo', true)
    .order('nombre')
}

export async function obtenerCargosActivos() {
  return await supabase
    .from('cargos')
    .select('*')
    .eq('activo', true)
    .order('nombre')
}

export async function crearPersonal(data) {
  return await supabase
    .from('personal')
    .insert([data])
}

export async function actualizarPersonal(id, data) {
  return await supabase
    .from('personal')
    .update(data)
    .eq('id', id)
}

export async function eliminarPersonal(id) {
  return await supabase
    .from('personal')
    .delete()
    .eq('id', id)
}