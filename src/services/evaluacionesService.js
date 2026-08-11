import { supabase } from "../lib/supabase";
import { obtenerUsuarioActual } from "../lib/auth";

export async function obtenerPersonalAsignado(evaluadorId, periodoId) {
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
    .eq("evaluador_id", evaluadorId)
    .eq("periodo_id", periodoId);
}

export async function obtenerPersonalEvaluable() {
  const usuario = JSON.parse(localStorage.getItem("usuario_app"));

  if (!usuario?.id) {
    return { data: [], error: null };
  }

  const periodoActivo = await obtenerPeriodoActivo();

  if (periodoActivo.error) {
    return { data: [], error: periodoActivo.error };
  }

  const { data, error } = await obtenerPersonalAsignado(
    usuario.id,
    periodoActivo.data.id
  );

  if (error) {
    return { data: [], error };
  }

  return {
    data: (data || []).map((x) => x.personal).filter(Boolean),
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

async function obtenerSnapshotFicha() {
  const ficha = await obtenerFicha();

  if (ficha.secciones.error) {
    return {
      data: null,
      error: ficha.secciones.error,
    };
  }

  if (ficha.items.error) {
    return {
      data: null,
      error: ficha.items.error,
    };
  }

  if (ficha.niveles.error) {
    return {
      data: null,
      error: ficha.niveles.error,
    };
  }

  return {
    data: {
      secciones: (ficha.secciones.data || []).map((s) => ({
        id: s.id,
        nombre: s.nombre,
        orden: s.orden,
      })),

      items: (ficha.items.data || []).map((i) => ({
        id: i.id,
        seccion_id: i.seccion_id,
        descripcion: i.descripcion,
        ayuda: i.ayuda || "",
        orden: i.orden,
      })),

      niveles: (ficha.niveles.data || []).map((n) => ({
        id: n.id,
        nombre: n.nombre,
        puntaje: Number(n.puntaje),
        orden: n.orden,
      })),
    },

    error: null,
  };
}

export async function obtenerPeriodoActivo() {
  const { data, error } = await supabase
    .from("periodos")
    .select("*")
    .eq("estado", "activo")
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: null,
      error: {
        message: "No hay un período de evaluación activo.",
      },
    };
  }

  return {
    data,
    error: null,
  };
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
    .eq("evaluador_id", usuario.id)
    .eq("periodo_id", periodoActivo.data.id);

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

  return {
  data,
  periodo: periodoActivo.data,
  error: null,
};
}

export async function obtenerEvaluacionPorId(id) {
  const usuario = obtenerUsuarioActual();

  if (!usuario?.id) {
    return {
      data: null,
      error: {
        message: "No se encontró una sesión válida.",
      },
    };
  }

  let consulta = supabase
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
        nombre,
        estado
      ),
      evaluacion_detalle (
        item_id,
        nivel_id,
        puntaje
      )
    `)
    .eq("id", id);

  /*
    El administrador puede consultar evaluaciones
    desde Resultados y Reportes.

    El evaluador solamente puede consultar las suyas.
  */
  if (usuario.rol !== "admin") {
    consulta = consulta.eq("evaluador_id", usuario.id);
  }

  const { data, error } = await consulta.maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: {
        message:
          "La evaluación no existe o no tienes permiso para acceder a ella.",
      },
    };
  }

  return {
    data,
    error: null,
  };
}

export async function guardarEvaluacionCompleta({
  evaluacionId,
  personalId,
  evaluadorId,
  periodoId,
  observacion,
  respuestas
}) {
  const usuario = obtenerUsuarioActual();

if (!usuario?.id) {
  return {
    data: null,
    error: {
      message: "No se encontró una sesión válida.",
    },
  };
}

if (usuario.id !== evaluadorId) {
  return {
    data: null,
    error: {
      message: "El usuario evaluador no coincide con la sesión actual.",
    },
  };
}

const { data: periodoEvaluacion, error: errorPeriodo } = await supabase
  .from("periodos")
  .select("id, estado")
  .eq("id", periodoId)
  .maybeSingle();

if (errorPeriodo) {
  return {
    data: null,
    error: errorPeriodo,
  };
}

if (!periodoEvaluacion) {
  return {
    data: null,
    error: {
      message: "No se encontró el período de la evaluación.",
    },
  };
}

if (periodoEvaluacion.estado !== "activo") {
  return {
    data: null,
    error: {
      message:
        "El período de esta evaluación está cerrado y ya no admite modificaciones.",
    },
  };
}

const { data: asignacion, error: errorAsignacion } = await supabase
  .from("evaluador_personal")
  .select("personal_id")
  .eq("evaluador_id", usuario.id)
  .eq("personal_id", personalId)
  .eq("periodo_id", periodoId)
  .maybeSingle();

if (errorAsignacion) {
  return {
    data: null,
    error: errorAsignacion,
  };
}

if (!asignacion) {
  return {
    data: null,
    error: {
      message:
        "Este personal no está asignado a tu usuario para el período actual.",
    },
  };
}
  const detalle = Object.entries(respuestas);

  const puntajeTotal = detalle.reduce(
    (total, [, r]) => total + Number(r.puntaje),
    0
  );

  const promedio = detalle.length ? puntajeTotal / detalle.length : 0;

  if (!evaluacionId) {
    const { data: existente, error: errorExistente } = await supabase
  .from("evaluaciones")
  .select("id, evaluador_id, estado, ficha_snapshot")
  .eq("personal_id", personalId)
  .eq("periodo_id", periodoId)
  .maybeSingle();

    if (errorExistente) {
      return { data: null, error: errorExistente };
    }

    if (existente?.id) {
      if (existente.evaluador_id !== evaluadorId) {
        return {
          data: null,
          error: {
            message:
              "Este personal ya tiene una evaluación registrada por otro evaluador."
          }
        };
      }

      if (existente.estado === "finalizada") {
        return {
          data: null,
          error: {
            message:
              "Esta evaluación ya fue finalizada y no puede modificarse."
          }
        };
      }

      evaluacionId = existente.id;
    }
  }

  let evaluacion;

  if (evaluacionId) {
    let snapshotParaGuardar = null;

const { data: evaluacionActual, error: errorEvaluacionActual } = await supabase
  .from("evaluaciones")
  .select("ficha_snapshot")
  .eq("id", evaluacionId)
  .maybeSingle();

if (errorEvaluacionActual) {
  return {
    data: null,
    error: errorEvaluacionActual,
  };
}

if (!evaluacionActual?.ficha_snapshot) {
  const snapshot = await obtenerSnapshotFicha();

  if (snapshot.error) {
    return {
      data: null,
      error: snapshot.error,
    };
  }

  snapshotParaGuardar = snapshot.data;
}
  const { data, error } = await supabase
    .from("evaluaciones")
    .update({
  puntaje_total: puntajeTotal,
  promedio,
  observacion,
  estado: "proceso",
  updated_at: new Date().toISOString(),

  ...(snapshotParaGuardar
    ? { ficha_snapshot: snapshotParaGuardar }
    : {}),
})
    .eq("id", evaluacionId)
    .eq("evaluador_id", evaluadorId)
    .neq("estado", "finalizada")
    .select()
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: null,
      error: {
        message:
          "La evaluación no puede modificarse o ya fue finalizada.",
      },
    };
  }

  evaluacion = data;

  const { error: errorEliminarDetalle } = await supabase
    .from("evaluacion_detalle")
    .delete()
    .eq("evaluacion_id", evaluacionId);

  if (errorEliminarDetalle) {
    return {
      data: null,
      error: errorEliminarDetalle,
    };
  }
} else {
  const snapshot = await obtenerSnapshotFicha();

  if (snapshot.error) {
    return {
      data: null,
      error: snapshot.error,
    };
  }

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
        observacion,
        ficha_snapshot: snapshot.data,
      },
    ])
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error,
    };
  }

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

  if (errorDetalle) {
    return { data: null, error: errorDetalle };
  }

  return { data: evaluacion, error: null };
}

export async function finalizarEvaluacion(id) {
  const usuario = obtenerUsuarioActual();

  if (!usuario?.id) {
    return {
      data: null,
      error: {
        message: "No se encontró una sesión válida.",
      },
    };
  }

  const { data: evaluacionActual, error: errorEvaluacion } = await supabase
    .from("evaluaciones")
    .select(`
      id,
      evaluador_id,
      estado,
      periodos (
        estado
      )
    `)
    .eq("id", id)
    .eq("evaluador_id", usuario.id)
    .maybeSingle();

  if (errorEvaluacion) {
    return {
      data: null,
      error: errorEvaluacion,
    };
  }

  if (!evaluacionActual) {
    return {
      data: null,
      error: {
        message: "No tienes permiso para finalizar esta evaluación.",
      },
    };
  }

  if (evaluacionActual.estado === "finalizada") {
    return {
      data: null,
      error: {
        message: "Esta evaluación ya fue finalizada.",
      },
    };
  }

  if (evaluacionActual.periodos?.estado !== "activo") {
    return {
      data: null,
      error: {
        message:
          "El período está cerrado y la evaluación ya no puede finalizarse.",
      },
    };
  }

  const { data, error } = await supabase
    .from("evaluaciones")
    .update({
      estado: "finalizada",
      fecha_finalizacion: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("evaluador_id", usuario.id)
    .neq("estado", "finalizada")
    .select()
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: null,
      error: {
        message: "No se pudo finalizar la evaluación.",
      },
    };
  }

  return {
    data,
    error: null,
  };
}

export async function obtenerHistorialEvaluaciones() {
  const usuario = obtenerUsuarioActual();

  if (!usuario?.id) {
    return {
      data: [],
      error: {
        message: "No se encontró una sesión válida.",
      },
    };
  }

  const { data, error } = await supabase
    .from("evaluaciones")
    .select(`
      id,
      estado,
      puntaje_total,
      promedio,
      observacion,
      created_at,
      fecha_finalizacion,
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
        nombre,
        estado
      )
    `)
    .eq("evaluador_id", usuario.id)
    .eq("periodos.estado", "cerrado")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: [],
      error,
    };
  }

  return {
    data: data || [],
    error: null,
  };
}