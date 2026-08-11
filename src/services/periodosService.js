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
  const { error: errorCerrar } = await supabase
    .from("periodos")
    .update({ estado: "cerrado" })
    .eq("estado", "activo")
    .neq("id", id);

  if (errorCerrar) {
    return {
      data: null,
      error: errorCerrar
    };
  }

  return await supabase
    .from("periodos")
    .update({ estado: "activo" })
    .eq("id", id)
    .select()
    .single();
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

export async function obtenerResumenPeriodoActivo() {

  const { data: periodo, error } = await supabase
    .from("periodos")
    .select("id,anio,nombre")
    .eq("estado", "activo")
    .single();

  if (error) {
    return { data: null, error };
  }

  const [
    asignaciones,
    evaluaciones
  ] = await Promise.all([

    supabase
      .from("evaluador_personal")
      .select("evaluador_id,personal_id")
      .eq("periodo_id", periodo.id),

    supabase
      .from("evaluaciones")
      .select("estado, personal_id")
      .eq("periodo_id", periodo.id)

  ]);

  if (asignaciones.error) {
    return { data: null, error: asignaciones.error };
  }

  if (evaluaciones.error) {
    return { data: null, error: evaluaciones.error };
  }

  const totalAsignados = (asignaciones.data || []).length;

  const evaluadores = new Set(
    (asignaciones.data || []).map((a) => a.evaluador_id)
  ).size;

  const personalAsignadoIds = new Set(
    (asignaciones.data || []).map((a) => a.personal_id)
  );

  const evaluacionesAsignadas = (evaluaciones.data || []).filter((e) =>
    personalAsignadoIds.has(e.personal_id)
  );

  const finalizadas = evaluacionesAsignadas.filter(
    (e) => e.estado === "finalizada"
  ).length;

  const proceso = evaluacionesAsignadas.filter(
    (e) => e.estado === "proceso"
  ).length;

  const pendientes = Math.max(
    totalAsignados - finalizadas - proceso,
    0
  );

  const avance = totalAsignados
    ? Math.min(
        Math.round((finalizadas / totalAsignados) * 100),
        100
      )
    : 0;

  return {
    data: {
      periodo,
      evaluadores,
      totalAsignados,
      finalizadas,
      proceso,
      pendientes,
      avance
    },
    error: null
  };

}