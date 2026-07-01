import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {

  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const iniciarSesion = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    const { data, error } = await supabase.rpc('verificar_login_dni', {
      p_dni: dni,
      p_password: password
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (!data || data.length === 0) {
      setError('DNI o contraseña incorrectos')
      return
    }

    localStorage.setItem('usuario_app', JSON.stringify(data[0]))
    window.location.href = "/admin/dashboard"
  }

  return (
    <>

      <style>{`

      *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:'Segoe UI',sans-serif;
      }

      body{
          background:#042615;
      }

      .login-page{
          min-height:100vh;
          background:#042615;
          display:flex;
          justify-content:center;
          align-items:center;
      }

      .login-card{
          width:430px;
          background:#fff;
          border-radius:22px;
          padding:40px;
          box-shadow:0 20px 45px rgba(0,0,0,.30);
      }

      .logo{
          width:120px;
          height:120px;
          margin:auto;
          border:3px solid #d7a10f;
          border-radius:50%;
          display:flex;
          justify-content:center;
          align-items:center;
          margin-bottom:25px;
      }

      .logo img{
          width:78px;
      }

      h1{
          text-align:center;
          color:#163625;
          font-size:28px;
          margin-bottom:8px;
          font-weight:700;
      }

      .sub{
          text-align:center;
          color:#7c8b8b;
          margin-bottom:35px;
      }

      label{
          display:block;
          font-size:13px;
          font-weight:700;
          color:#2d6b47;
          margin-bottom:8px;
      }

      input{
          width:100%;
          height:54px;
          border:1px solid #ddd;
          border-radius:10px;
          padding:0 18px;
          margin-bottom:22px;
          background:#fafafa;
          font-size:15px;
          transition:.3s;
      }

      input:focus{
          outline:none;
          border-color:#2d6b47;
          box-shadow:0 0 0 3px rgba(45,107,71,.15);
          background:white;
      }

      .password{
          position:relative;
      }

      .password button{
          position:absolute;
          right:15px;
          top:16px;
          border:none;
          background:none;
          cursor:pointer;
          font-size:18px;
      }

      .login-btn{
          width:100%;
          height:56px;
          border:none;
          border-radius:10px;
          background:#2d6b47;
          color:white;
          font-size:16px;
          font-weight:700;
          cursor:pointer;
          transition:.3s;
      }

      .login-btn:hover{
          background:#204f35;
      }

      .error{
          background:#ffe6e6;
          color:#c0392b;
          padding:12px;
          border-radius:8px;
          margin-bottom:18px;
          text-align:center;
      }

      .footer{
          margin-top:35px;
          text-align:center;
          color:#9b9b9b;
          font-size:13px;
          border-top:1px solid #eee;
          padding-top:18px;
      }

      `}</style>

      <div className="login-page">

        <form className="login-card" onSubmit={iniciarSesion}>

          <div className="logo">
            <img src="/logo.png" alt="Logo"/>
          </div>

          <h1>I.E. CRL. JOSÉ JOAQUÍN INCLÁN</h1>

          <div className="sub">
            Sistema SEDI — Autenticación
          </div>

          <label>USUARIO (DNI)</label>

          <input
            type="text"
            placeholder="Ingrese su DNI"
            value={dni}
            onChange={(e)=>setDni(e.target.value)}
            maxLength={8}
            required
          />

          <label>CONTRASEÑA</label>

          <div className="password">

            <input
              type={mostrar ? "text" : "password"}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={()=>setMostrar(!mostrar)}
            >
              {mostrar ? "🙈" : "👁️"}
            </button>

          </div>

          {error && <div className="error">{error}</div>}

          <button
            className="login-btn"
            disabled={loading}
          >
            {loading ? "INGRESANDO..." : "INGRESAR AL SISTEMA"}
          </button>

          <div className="footer">
            Piura © 2026 | Disciplina, Estudio y Trabajo
          </div>

        </form>

      </div>

    </>
  )

}

export default Login