import { supabase } from "../lib/supabase";
import { obtenerUsuarioActual } from "../lib/auth";
import { obtenerPeriodoActivo } from "./evaluacionesService";

export async function obtenerDashboardEvaluador() {
  const usuario = obtenerUsuarioActual();

  if (!usuario?.id) return { data: null, error: null };

  const periodo = await obtenerPeriodoActivo();

  if (periodo.error) return { data: null, error: periodo.error };

  const { data: asignados, error: errorAsignados } = await supabase
    .from("evaluador_personal")
    .select("personal_id")
    .eq("evaluador_id", usuario.id);

  if (errorAsignados) return { data: null, error: errorAsignados };

  const { data: evaluaciones, error: errorEvaluaciones } = await supabase
    .from("evaluaciones")
    .select("estado")
    .eq("evaluador_id", usuario.id)
    .eq("periodo_id", periodo.data.id);

  if (errorEvaluaciones) return { data: null, error: errorEvaluaciones };

  const total = asignados.length;
  const finalizadas = evaluaciones.filter(e => e.estado === "finalizada").length;
  const proceso = evaluaciones.filter(e => e.estado === "proceso").length;
  const pendientes = total - finalizadas - proceso;

  return {
    data: {
      periodo: periodo.data,
      total,
      finalizadas,
      proceso,
      pendientes,
      progreso: total ? Math.round((finalizadas / total) * 100) : 0
    },
    error: null
  };
}

export async function obtenerDashboardAdmin() {
  const periodo = await obtenerPeriodoActivo();

  const { count: totalPersonal } = await supabase
    .from("personal")
    .select("*", { count: "exact", head: true });

  const { count: totalUsuarios } = await supabase
    .from("usuarios_app")
    .select("*", { count: "exact", head: true });

  const { data: evaluaciones } = await supabase
    .from("evaluaciones")
    .select(`
      id,
      estado,
      promedio,
      created_at,
      personal (
        nombres,
        apellidos,
        area
      )
    `)
    .eq("periodo_id", periodo.data.id);

  const totalEvaluaciones = evaluaciones?.length || 0;
  const finalizadas = evaluaciones?.filter(e => e.estado === "finalizada").length || 0;
  const proceso = evaluaciones?.filter(e => e.estado === "proceso").length || 0;

  const promedioInstitucional = finalizadas
    ? evaluaciones
        .filter(e => e.estado === "finalizada")
        .reduce((acc, e) => acc + Number(e.promedio), 0) / finalizadas
    : 0;

  const ultimas = [...(evaluaciones || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const ranking = [...(evaluaciones || [])]
    .filter(e => e.estado === "finalizada")
    .sort((a, b) => Number(b.promedio) - Number(a.promedio))
    .slice(0, 5);

  const areas = {};

  (evaluaciones || [])
    .filter(e => e.estado === "finalizada")
    .forEach(e => {
      const area = e.personal?.area || "Sin área";

      if (!areas[area]) {
        areas[area] = {
          total: 0,
          suma: 0
        };
      }

      areas[area].total += 1;
      areas[area].suma += Number(e.promedio);
    });

  const promedioPorArea = Object.entries(areas).map(([area, info]) => ({
    area,
    promedio: info.suma / info.total,
    total: info.total
  }));

  return {
    data: {
      periodo: periodo.data,
      totalPersonal,
      totalUsuarios,
      totalEvaluaciones,
      finalizadas,
      proceso,
      pendientes: Math.max(totalPersonal - finalizadas - proceso, 0),
      promedioInstitucional,
      ultimas,
      ranking,
      promedioPorArea
    },
    error: null
  };
}