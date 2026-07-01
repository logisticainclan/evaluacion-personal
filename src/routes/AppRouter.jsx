import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Layout from '../components/layout/Layout'
import Personal from '../pages/Personal'
import Usuarios from '../pages/Usuarios'
import Secciones from '../pages/Secciones'
import Niveles from '../pages/Niveles'
import Items from '../pages/Items'
import Asignaciones from '../pages/Asignaciones'
import Evaluaciones from '../pages/Evaluaciones'
import Evaluacion from '../pages/Evaluacion'
import Periodos from '../pages/Periodos'
import { obtenerUsuarioActual } from '../lib/auth'

function RutaProtegida({ children, roles }) {
  const usuario = obtenerUsuarioActual()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="personal"
            element={
              <RutaProtegida roles={['admin']}>
                <Personal />
              </RutaProtegida>
            }
          />

          <Route
            path="usuarios"
            element={
              <RutaProtegida roles={['admin']}>
                <Usuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="asignaciones"
            element={
              <RutaProtegida roles={['admin']}>
                <Asignaciones />
              </RutaProtegida>
            }
          />

          <Route
            path="periodos"
            element={
              <RutaProtegida roles={['admin']}>
                <Periodos />
              </RutaProtegida>
            }
          />

          <Route
            path="secciones"
            element={
              <RutaProtegida roles={['admin']}>
                <Secciones />
              </RutaProtegida>
            }
          />

          <Route
            path="niveles"
            element={
              <RutaProtegida roles={['admin']}>
                <Niveles />
              </RutaProtegida>
            }
          />

          <Route
            path="items"
            element={
              <RutaProtegida roles={['admin']}>
                <Items />
              </RutaProtegida>
            }
          />

          <Route
            path="evaluaciones"
            element={
              <RutaProtegida roles={['admin', 'evaluador']}>
                <Evaluaciones />
              </RutaProtegida>
            }
          />

          <Route
            path="evaluaciones/nueva"
            element={
              <RutaProtegida roles={['admin', 'evaluador']}>
                <Evaluacion />
              </RutaProtegida>
            }
          />

          <Route
            path="evaluaciones/:id"
            element={
              <RutaProtegida roles={['admin', 'evaluador']}>
                <Evaluacion />
              </RutaProtegida>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter