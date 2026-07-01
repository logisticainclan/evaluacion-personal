import { supabase } from "../lib/supabase";

export async function obtenerPersonalAsignado(evaluadorId) {
  return await supabase
    .from("evaluador_personal")
    .select(`
      personal (
        id,
        dni,
        nombres,
        apellidos,
        area,
        cargo
      )
    `)
    .eq("evaluador_id", evaluadorId);
}

export async function obtenerPersonalEvaluable() {
  const usuario = JSON.parse(localStorage.getItem("usuario_app"));

  if (!usuario?.id) return { data: [], error: null };

  const { data, error } = await obtenerPersonalAsignado(usuario.id);

  if (error) return { data: [], error };

  return {
    data: data.map((x) => x.personal),
    error: null
  };
}

export async function obtenerFicha() {
  const [secciones, items, niveles] = await Promise.all([
    supabase.from("secciones").select("*").eq("activo", true).order("orden"),
    supabase.from("items").select("*").eq("activo", true).order("orden"),
    supabase.from("niveles_calificacion").select("*").eq("activo", true).order("orden")
  ]);

  return { secciones, items, niveles };
}

export async function obtenerPeriodoActivo() {
  return await supabase
    .from("periodos")
    .select("*")
    .eq("estado", "activo")
    .single();
}

export async function obtenerPanelEvaluaciones() {
  const usuario = JSON.parse(localStorage.getItem("usuario_app"));

  if (!usuario?.id) return { data: [], error: null };

  const periodoActivo = await obtenerPeriodoActivo();

  if (periodoActivo.error) {
    return { data: [], error: periodoActivo.error };
  }

  const { data: asignados, error: errorAsignados } = await supabase
    .from("evaluador_personal")
    .select(`
      personal (
        id,
        dni,
        nombres,
        apellidos,
        area,
        cargo
      )
    `)
    .eq("evaluador_id", usuario.id);

  if (errorAsignados) return { data: [], error: errorAsignados };

  const { data: evaluaciones, error: errorEvaluaciones } = await supabase
    .from("evaluaciones")
    .select(`
      id,
      personal_id,
      estado,
      puntaje_total,
      promedio,
      created_at
    `)
    .eq("evaluador_id", usuario.id)
    .eq("periodo_id", periodoActivo.data.id);

  if (errorEvaluaciones) return { data: [], error: errorEvaluaciones };

  const data = asignados.map((a) => {
    const evaluacion = evaluaciones.find(
      (e) => e.personal_id === a.personal.id
    );

    return {
      personal: a.personal,
      evaluacion: evaluacion || null,
      estado: evaluacion ? evaluacion.estado : "pendiente",
      periodo: periodoActivo.data
    };
  });

  return { data, error: null };
}

export async function obtenerEvaluacionPorId(id) {
  return await supabase
    .from("evaluaciones")
    .select(`
      *,
      personal (
        id,
        dni,
        nombres,
        apellidos,
        area,
        cargo
      ),
      periodos (
        id,
        anio,
        nombre
      ),
      evaluacion_detalle (
        item_id,
        nivel_id,
        puntaje
      )
    `)
    .eq("id", id)
    .single();
}

export async function guardarEvaluacionCompleta({
  evaluacionId,
  personalId,
  evaluadorId,
  periodoId,
  observacion,
  respuestas
}) {
  const detalle = Object.entries(respuestas);

  const puntajeTotal = detalle.reduce(
    (total, [, r]) => total + Number(r.puntaje),
    0
  );

  const promedio = detalle.length ? puntajeTotal / detalle.length : 0;

  let evaluacion;

  if (evaluacionId) {
    const { data, error } = await supabase
      .from("evaluaciones")
      .update({
        puntaje_total: puntajeTotal,
        promedio,
        observacion,
        estado: "proceso",
        updated_at: new Date()
      })
      .eq("id", evaluacionId)
      .select()
      .single();

    if (error) return { data: null, error };

    evaluacion = data;

    await supabase
      .from("evaluacion_detalle")
      .delete()
      .eq("evaluacion_id", evaluacionId);
  } else {
    const { data, error } = await supabase
      .from("evaluaciones")
      .insert([
        {
          personal_id: personalId,
          evaluador_id: evaluadorId,
          periodo_id: periodoId,
          estado: "proceso",
          puntaje_total: puntajeTotal,
          promedio,
          observacion
        }
      ])
      .select()
      .single();

    if (error) return { data: null, error };

    evaluacion = data;
  }

  const detalleInsertar = detalle.map(([itemId, r]) => ({
    evaluacion_id: evaluacion.id,
    item_id: itemId,
    nivel_id: r.nivel_id,
    puntaje: r.puntaje
  }));

  const { error: errorDetalle } = await supabase
    .from("evaluacion_detalle")
    .insert(detalleInsertar);

  if (errorDetalle) return { data: null, error: errorDetalle };

  return { data: evaluacion, error: null };
}

export async function finalizarEvaluacion(id) {
  return await supabase
    .from("evaluaciones")
    .update({
      estado: "finalizada",
      fecha_finalizacion: new Date(),
      updated_at: new Date()
    })
    .eq("id", id);
}