import { supabase } from "../lib/supabase";

export async function obtenerPeriodos() {
  return await supabase
    .from("periodos")
    .select("*")
    .order("anio", { ascending: false })
    .order("bimestre", { ascending: true });
}

export async function crearAnioPeriodos(anio) {
  const registros = [
    { anio, bimestre: 1, nombre: "I Bimestre", estado: "pendiente", fecha_inicio: `${anio}-03-01`, fecha_fin: `${anio}-04-30` },
    { anio, bimestre: 2, nombre: "II Bimestre", estado: "pendiente", fecha_inicio: `${anio}-05-01`, fecha_fin: `${anio}-06-30` },
    { anio, bimestre: 3, nombre: "III Bimestre", estado: "pendiente", fecha_inicio: `${anio}-08-01`, fecha_fin: `${anio}-09-30` },
    { anio, bimestre: 4, nombre: "IV Bimestre", estado: "pendiente", fecha_inicio: `${anio}-10-01`, fecha_fin: `${anio}-11-30` }
  ];

  return await supabase.from("periodos").insert(registros);
}

export async function activarPeriodo(id) {
  await supabase
    .from("periodos")
    .update({ estado: "cerrado" })
    .eq("estado", "activo");

  return await supabase
    .from("periodos")
    .update({ estado: "activo" })
    .eq("id", id);
}

export async function cerrarPeriodo(id) {
  return await supabase
    .from("periodos")
    .update({ estado: "cerrado" })
    .eq("id", id);
}

export async function actualizarFechasPeriodo(id, data) {
  return await supabase
    .from("periodos")
    .update(data)
    .eq("id", id);
}