import { useState } from "react";
import { ClipboardList, SlidersHorizontal, Eye } from "lucide-react";

import Niveles from "./Niveles";
import EstructuraFicha from "../components/ficha/EstructuraFicha";
import VistaPreviaFicha from "../components/ficha/VistaPreviaFicha";

import "../styles/ficha-evaluacion.css";

function FichaEvaluacion() {
  const [pestana, setPestana] = useState("estructura");

  return (
    <div className="ficha-page">
      <div className="page-header ficha-page-header">
        <div>
          <span className="ficha-kicker">Configuración</span>

          <h1>Ficha de evaluación</h1>

          <p>
            Configura la estructura y escala utilizada durante las evaluaciones
            del personal.
          </p>
        </div>
      </div>

      <div className="ficha-tabs">
        <button
          type="button"
          className={`ficha-tab ${pestana === "estructura" ? "active" : ""}`}
          onClick={() => setPestana("estructura")}
        >
          <ClipboardList size={18} />

          <span>
            <strong>Estructura</strong>
            <small>Secciones e ítems</small>
          </span>
        </button>

        <button
          type="button"
          className={`ficha-tab ${pestana === "niveles" ? "active" : ""}`}
          onClick={() => setPestana("niveles")}
        >
          <SlidersHorizontal size={18} />

          <span>
            <strong>Niveles</strong>
            <small>Escala de calificación</small>
          </span>
        </button>

        <button
          type="button"
          className={`ficha-tab ${pestana === "vista" ? "active" : ""}`}
          onClick={() => setPestana("vista")}
        >
          <Eye size={18} />

          <span>
            <strong>Vista previa</strong>
            <small>Visualizar ficha</small>
          </span>
        </button>
      </div>

      <div className="ficha-content">
        {pestana === "estructura" && <EstructuraFicha />}

        {pestana === "niveles" && <Niveles integrado />}

        {pestana === "vista" && (
  <VistaPreviaFicha />
)}
      </div>
    </div>
  );
}

export default FichaEvaluacion;
