import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
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
    console.log('ERROR SUPABASE:', error)
    setError(error.message)
    return
    }

    if (!data || data.length === 0) {
      setError('DNI o contraseña incorrectos')
      return
    }

    localStorage.setItem('usuario_app', JSON.stringify(data[0]))
    window.location.href = '/admin/dashboard'
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={iniciarSesion}>
        <h1>Sistema de Evaluación</h1>
        <p>IE José Joaquín Inclán</p>

        <label>DNI</label>
        <input
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Ingrese su DNI"
          maxLength="8"
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          required
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

export default Login