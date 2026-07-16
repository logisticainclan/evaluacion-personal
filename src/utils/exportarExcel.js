import * as XLSX from "xlsx";

export function exportarResultadosExcel(resultados) {
  if (!resultados || resultados.length === 0) {
    return;
  }

  const obtenerNivel = (promedio) => {
    const valor = Number(promedio);

    if (valor >= 3.5) return "Muy Bueno";
    if (valor >= 2.5) return "Bueno";
    if (valor >= 1.5) return "Regular";
    return "Deficiente";
  };

  const datos = resultados.map((r, index) => ({
    "N°": index + 1,
    DNI: r.personal?.dni || "",
    Personal: `${r.personal?.apellidos || ""}, ${r.personal?.nombres || ""}`,
    Área: r.personal?.area || "",
    Cargo: r.personal?.cargo || "",
    Evaluador: r.evaluador?.personal
      ? `${r.evaluador.personal.apellidos}, ${r.evaluador.personal.nombres}`
      : "-",
    Período: r.periodos
      ? `${r.periodos.anio} - ${r.periodos.nombre}`
      : "",
    Puntaje: Number(r.puntaje_total || 0),
    Promedio: Number(Number(r.promedio || 0).toFixed(2)),
    Nivel: obtenerNivel(r.promedio)
  }));

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datos);

  hoja["!cols"] = [
    { wch: 6 },  // N°
    { wch: 12 }, // DNI
    { wch: 38 }, // Personal
    { wch: 22 }, // Área
    { wch: 35 }, // Cargo
    { wch: 38 }, // Evaluador
    { wch: 22 }, // Período
    { wch: 12 }, // Puntaje
    { wch: 12 }, // Promedio
    { wch: 16 }  // Nivel
  ];

  hoja["!autofilter"] = {
    ref: hoja["!ref"]
  };

  XLSX.utils.book_append_sheet(libro, hoja, "Resultados");

  const fecha = new Date().toISOString().slice(0, 10);

  XLSX.writeFile(
    libro,
    `Reporte_Evaluaciones_${fecha}.xlsx`
  );
}