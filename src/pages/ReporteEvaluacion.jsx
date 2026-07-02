import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerReporteEvaluacion } from "../services/reporteService";
import "../styles/reporte.css";
import autoTable from "jspdf-autotable";

function ReporteEvaluacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluacion, setEvaluacion] = useState(null);
  const reporteRef = useRef(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await obtenerReporteEvaluacion(id);

    if (error) {
      alert(error.message);
      return;
    }

    setEvaluacion(data);
  };

  if (!evaluacion) return <p>Cargando reporte...</p>;

  const detallesOrdenados = [...evaluacion.evaluacion_detalle].sort((a, b) => {
    return (a.items?.secciones?.orden || 0) - (b.items?.secciones?.orden || 0);
  });

  const secciones = {};

  detallesOrdenados.forEach((d) => {
    const nombre = d.items?.secciones?.nombre || "Sin sección";

    if (!secciones[nombre]) {
      secciones[nombre] = [];
    }

    secciones[nombre].push(d);
  });

  const obtenerNivel = (promedio) => {
    const p = Number(promedio);

    if (p >= 3.5) return "Muy Bueno";
    if (p >= 2.5) return "Bueno";
    if (p >= 1.5) return "Regular";
    return "Deficiente";
  };

  const cargarImagenBase64 = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => resolve(null);
    });
  };

  const descargarPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const escudo = await cargarImagenBase64("/escudo-peru.png");

    const dibujarEncabezado = () => {
      if (escudo) {
        pdf.addImage(escudo, "PNG", 14, 10, 22, 22);
      }

      pdf.setFontSize(9);
      pdf.setFillColor(157, 157, 157);
      pdf.rect(40, 12, 30, 18, "F");
      pdf.rect(72, 12, 35, 18, "F");

      pdf.setFillColor(199, 199, 199);
      pdf.rect(109, 12, 32, 18, "F");
      pdf.rect(143, 12, 32, 18, "F");
      pdf.rect(177, 12, 25, 18, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");

      pdf.text("PERU", 55, 23, { align: "center" });
      pdf.text("Ministerio\nDe Defensa", 89, 20, { align: "center" });
      pdf.text("Ejército\nDel Perú", 125, 20, { align: "center" });
      pdf.text("Jefatura de\nBienestar del\nEjército", 159, 18, {
        align: "center",
      });
      pdf.text("IE CRL José\nJoaquín Inclán", 189, 20, { align: "center" });

      pdf.setTextColor(0, 0, 0);
    };

    const dibujarPiePagina = () => {
      const totalPaginas = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPaginas; i++) {
        pdf.setPage(i);

        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.text(
          "“Inclán camino hacia la excelencia educativa”",
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(
          `Página ${i} de ${totalPaginas}`,
          pageWidth - 20,
          pageHeight - 10,
          {
            align: "right",
          },
        );
      }
    };

    dibujarEncabezado();

    let y = 42;

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "INSTRUMENTO DE EVALUACIÓN DEL DESEMPEÑO DEL PERSONAL",
      pageWidth / 2,
      y,
      {
        align: "center",
      },
    );

    y += 12;

    pdf.setFontSize(11);
    pdf.text("I. DATOS GENERALES", 14, y);
    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    pdf.text("Institución educativa: Coronel José Joaquín Inclán", 14, y);
    y += 5;
    pdf.text(
      `Evaluado: ${evaluacion.personal?.apellidos}, ${evaluacion.personal?.nombres}`,
      14,
      y,
    );
    y += 5;
    pdf.text(`DNI: ${evaluacion.personal?.dni}`, 14, y);
    y += 5;
    pdf.text(`Cargo: ${evaluacion.personal?.cargo || "-"}`, 14, y);
    y += 5;
    pdf.text(`Área: ${evaluacion.personal?.area || "-"}`, 14, y);
    y += 5;
    pdf.text(
      `Periodo: ${evaluacion.periodos?.anio} - ${evaluacion.periodos?.nombre}`,
      14,
      y,
    );

    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("II. MATRIZ DE EVALUACIÓN", 14, y);
    y += 6;

    Object.entries(secciones).forEach(([nombreSeccion, items]) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(nombreSeccion, 14, y);
      y += 3;

      autoTable(pdf, {
        startY: y,
        head: [["Indicador", "Calificación", "Puntaje"]],
        body: items.map((d) => [
          d.items?.descripcion || "",
          d.niveles_calificacion?.nombre || "",
          d.puntaje || "",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 38 },
          2: { cellWidth: 22 },
        },
        margin: { top: 38, left: 14, right: 14, bottom: 25 },
        didDrawPage: () => {
          dibujarEncabezado();
        },
      });

      y = pdf.lastAutoTable.finalY + 10;
    });

    if (y > 230) {
      pdf.addPage();
      dibujarEncabezado();
      y = 42;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("III. RESULTADO FINAL", 14, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `Puntaje total: ${Number(evaluacion.puntaje_total).toFixed(2)}`,
      14,
      y,
    );
    pdf.text(`Promedio: ${Number(evaluacion.promedio).toFixed(2)}`, 75, y);
    pdf.text(`Nivel: ${obtenerNivel(evaluacion.promedio)}`, 135, y);

    y += 14;

    pdf.setFont("helvetica", "bold");
    pdf.text("IV. APRECIACIÓN FINAL", 14, y);
    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.text(evaluacion.observacion || "Sin observación registrada.", 14, y, {
      maxWidth: 180,
    });

    y += 35;

    if (y > 230) {
      pdf.addPage();
      dibujarEncabezado();
      y = 70;
    }

    const evaluadorNombre = evaluacion.evaluador?.personal
      ? `${evaluacion.evaluador.personal.apellidos.toUpperCase()}, ${evaluacion.evaluador.personal.nombres.toUpperCase()}`
      : "________________________";

    const evaluadoNombre = `${evaluacion.personal?.apellidos?.toUpperCase()}, ${evaluacion.personal?.nombres?.toUpperCase()}`;

    pdf.setDrawColor(0, 0, 0);
    pdf.line(25, y, 85, y);
    pdf.line(125, y, 185, y);

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(evaluadorNombre, 55, y, { align: "center", maxWidth: 70 });
    pdf.text(evaluadoNombre, 155, y, { align: "center", maxWidth: 70 });

    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.text("EVALUADOR", 55, y, { align: "center" });
    pdf.text("PERSONAL EVALUADO", 155, y, { align: "center" });

    dibujarPiePagina();

    pdf.save(`reporte-evaluacion-${evaluacion.personal?.dni}.pdf`);
  };

  return (
    <div className="reporte-page">
      <div className="reporte-actions">
        <button className="secondary-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <button className="primary-btn" onClick={descargarPDF}>
          📄 Descargar PDF
        </button>
      </div>
      <div className="reporte-hoja" ref={reporteRef}>
        <header className="reporte-header-institucional">
          <div className="escudo-box">
            <img src="/escudo-peru.png" alt="Escudo del Perú" />
          </div>

          <div className="header-block dark">PERU</div>
          <div className="header-block dark">
            Ministerio
            <br />
            De Defensa
          </div>
          <div className="header-block gray">
            Ejército
            <br />
            Del Perú
          </div>
          <div className="header-block gray">
            Jefatura de
            <br />
            Bienestar del
            <br />
            Ejército
          </div>
          <div className="header-block gray">
            IE CRL José
            <br />
            Joaquín Inclán
          </div>
        </header>

        <section>
          <h2>I. DATOS GENERALES</h2>

          <div className="reporte-grid">
            <p>
              <strong>Institución educativa:</strong> Coronel José Joaquín
              Inclán
            </p>
            <p>
              <strong>Nombre del evaluado:</strong>{" "}
              {evaluacion.personal?.apellidos}, {evaluacion.personal?.nombres}
            </p>
            <p>
              <strong>DNI:</strong> {evaluacion.personal?.dni}
            </p>
            <p>
              <strong>Cargo:</strong> {evaluacion.personal?.cargo}
            </p>
            <p>
              <strong>Área:</strong> {evaluacion.personal?.area}
            </p>
            <p>
              <strong>Evaluador:</strong>{" "}
              {evaluacion.usuarios_app?.personal?.apellidos},{" "}
              {evaluacion.usuarios_app?.personal?.nombres}
            </p>
            <p>
              <strong>Periodo:</strong> {evaluacion.periodos?.anio} -{" "}
              {evaluacion.periodos?.nombre}
            </p>
          </div>
        </section>

        <section>
          <h2>II. MATRIZ DE EVALUACIÓN</h2>

          {Object.entries(secciones).map(([seccion, items]) => (
            <div key={seccion} className="reporte-seccion">
              <h3>{seccion}</h3>

              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Calificación</th>
                    <th>Puntaje</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((d) => (
                    <tr key={d.item_id}>
                      <td>{d.items?.descripcion}</td>
                      <td>{d.niveles_calificacion?.nombre}</td>
                      <td>{d.puntaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        <section>
          <h2>III. RESULTADO FINAL</h2>

          <div className="resultado-box">
            <p>
              <strong>Puntaje total:</strong>{" "}
              {Number(evaluacion.puntaje_total).toFixed(2)}
            </p>
            <p>
              <strong>Promedio:</strong>{" "}
              {Number(evaluacion.promedio).toFixed(2)}
            </p>
            <p>
              <strong>Nivel:</strong> {obtenerNivel(evaluacion.promedio)}
            </p>
          </div>
        </section>

        <section>
          <h2>IV. APRECIACIÓN FINAL</h2>
          <div className="observacion-reporte">
            {evaluacion.observacion || "Sin observación registrada."}
          </div>
        </section>

        <footer className="firmas">
          <div className="firma-box">
            <div className="firma-linea"></div>

            <h4>
              {evaluacion.evaluador
                ? `${evaluacion.evaluador?.personal?.apellidos.toUpperCase()}, ${evaluacion.evaluador?.personal?.nombres.toUpperCase()}`
                : "________________________"}
            </h4>

            <span>EVALUADOR</span>
          </div>

          <div className="firma-box">
            <div className="firma-linea"></div>

            <h4>
              {`${evaluacion.personal.apellidos.toUpperCase()}, ${evaluacion.personal.nombres.toUpperCase()}`}
            </h4>

            <span>PERSONAL EVALUADO</span>
          </div>
        </footer>

        <p className="lema">“Inclán camino hacia la excelencia educativa”</p>
      </div>
    </div>
  );
}

export default ReporteEvaluacion;
