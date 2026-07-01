function ObservacionBox({ observacion, setObservacion, disabled = false }) {

  return (

    <div className="observacion-box">

      <h2>

        Observación

      </h2>

      <textarea

        rows="5"

        maxLength="250"
        disabled={disabled}

        value={observacion}

        onChange={(e)=>setObservacion(e.target.value)}

      />

      <small>

        {observacion.length}/250 caracteres

      </small>

    </div>

  )

}

export default ObservacionBox;