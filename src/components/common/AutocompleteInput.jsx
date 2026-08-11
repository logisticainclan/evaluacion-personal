import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import "../../styles/autocomplete.css";

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function obtenerLabel(opcion) {
  if (typeof opcion === "string") {
    return opcion;
  }

  return opcion?.label || "";
}

function obtenerSubLabel(opcion) {
  if (typeof opcion === "string") {
    return "";
  }

  return opcion?.sublabel || "";
}

function obtenerValue(opcion) {
  if (typeof opcion === "string") {
    return opcion;
  }

  return opcion?.value ?? "";
}

function obtenerTextoBusqueda(opcion) {
  if (typeof opcion === "string") {
    return opcion;
  }

  return [
    opcion?.label || "",
    opcion?.sublabel || "",
    opcion?.searchText || "",
  ].join(" ");
}

function AutocompleteInput({
  id,
  value,
  onChange,
  options = [],
  placeholder = "",
  disabled = false,
  required = false,
  emptyMessage = "No hay coincidencias",

  /*
   * Permite controlar qué texto se muestra en el input
   * cuando value realmente es un ID.
   */
  displayValue,

  /*
   * true para Área:
   * permite escribir una opción nueva.
   *
   * false para Usuarios:
   * obliga a seleccionar una opción existente.
   */
  allowCustomValue = true,

  /*
   * Para ocultar el mensaje:
   * "Se registrará como una nueva opción".
   */
  showCreateMessage = true,
}) {
  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [texto, setTexto] = useState(
    displayValue !== undefined ? displayValue : value || ""
  );

  const contenedorRef = useRef(null);

  useEffect(() => {
    if (displayValue !== undefined) {
      setTexto(displayValue || "");
    } else {
      setTexto(value || "");
    }
  }, [value, displayValue]);

  const opcionesFiltradas = useMemo(() => {
    const termino = normalizarTexto(texto);

    if (!termino) {
      return options.slice(0, 8);
    }

    return options
      .filter((opcion) =>
        normalizarTexto(
          obtenerTextoBusqueda(opcion)
        ).includes(termino)
      )
      .slice(0, 8);
  }, [options, texto]);

  const existeCoincidenciaExacta = useMemo(() => {
    const textoNormalizado = normalizarTexto(texto);

    if (!textoNormalizado) return false;

    return options.some(
      (opcion) =>
        normalizarTexto(obtenerLabel(opcion)) ===
        textoNormalizado
    );
  }, [options, texto]);

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target)
      ) {
        setAbierto(false);
        setIndiceActivo(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickFuera
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickFuera
      );
    };
  }, []);

  const seleccionarOpcion = (opcion) => {
    const label = obtenerLabel(opcion);
    const valor = obtenerValue(opcion);

    setTexto(label);
    onChange(valor, opcion);

    setAbierto(false);
    setIndiceActivo(-1);
  };

  const manejarCambio = (event) => {
    const nuevoTexto = event.target.value;

    setTexto(nuevoTexto);
    setAbierto(true);
    setIndiceActivo(-1);

    if (allowCustomValue) {
      onChange(nuevoTexto, null);
    } else {
      /*
       * Si el usuario modifica lo escrito después de haber
       * seleccionado una persona, limpiamos el ID hasta que
       * seleccione una opción válida otra vez.
       */
      onChange("", null);
    }
  };

  const manejarTeclado = (event) => {
    if (
      !abierto &&
      ["ArrowDown", "ArrowUp"].includes(event.key)
    ) {
      setAbierto(true);
      return;
    }

    if (!abierto) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setIndiceActivo((actual) =>
        actual < opcionesFiltradas.length - 1
          ? actual + 1
          : 0
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setIndiceActivo((actual) =>
        actual > 0
          ? actual - 1
          : opcionesFiltradas.length - 1
      );
    }

    if (
      event.key === "Enter" &&
      indiceActivo >= 0 &&
      opcionesFiltradas[indiceActivo]
    ) {
      event.preventDefault();

      seleccionarOpcion(
        opcionesFiltradas[indiceActivo]
      );
    }

    if (event.key === "Escape") {
      setAbierto(false);
      setIndiceActivo(-1);
    }
  };

  return (
    <div
      className="autocomplete"
      ref={contenedorRef}
    >
      <input
        id={id}
        type="text"
        value={texto}
        onChange={manejarCambio}
        onFocus={() => setAbierto(true)}
        onKeyDown={manejarTeclado}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        required={required}
        aria-expanded={abierto}
        aria-autocomplete="list"
      />

      <button
        type="button"
        className="autocomplete-toggle"
        onClick={() =>
          setAbierto((estado) => !estado)
        }
        disabled={disabled}
        aria-label={
          abierto
            ? "Cerrar opciones"
            : "Mostrar opciones"
        }
      >
        <ChevronDown size={18} />
      </button>

      {abierto && (
        <div className="autocomplete-menu">
          {opcionesFiltradas.length > 0 ? (
            opcionesFiltradas.map(
              (opcion, index) => {
                const label =
                  obtenerLabel(opcion);

                const sublabel =
                  obtenerSubLabel(opcion);

                const seleccionada =
                  obtenerValue(opcion) === value;

                return (
                  <button
                    type="button"
                    key={
                      typeof opcion === "string"
                        ? opcion
                        : opcion.value
                    }
                    className={`autocomplete-option ${
                      indiceActivo === index
                        ? "autocomplete-option-active"
                        : ""
                    }`}
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() =>
                      seleccionarOpcion(opcion)
                    }
                  >
                    <div className="autocomplete-option-text">
                      <span>{label}</span>

                      {sublabel && (
                        <small>
                          {sublabel}
                        </small>
                      )}
                    </div>

                    {seleccionada && (
                      <Check size={17} />
                    )}
                  </button>
                );
              }
            )
          ) : (
            <div className="autocomplete-empty">
              <strong>{emptyMessage}</strong>

              {allowCustomValue &&
                showCreateMessage &&
                texto.trim() &&
                !existeCoincidenciaExacta && (
                  <span>
                    Se registrará “
                    {texto.trim()}” como una
                    nueva opción.
                  </span>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;