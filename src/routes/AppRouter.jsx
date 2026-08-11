import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Layout from "../components/layout/Layout";
import Personal from "../pages/Personal";
import Usuarios from "../pages/Usuarios";
import Asignaciones from "../pages/Asignaciones";
import Evaluaciones from "../pages/Evaluaciones";
import Evaluacion from "../pages/Evaluacion";
import Periodos from "../pages/Periodos";
import {
  obtenerUsuarioActual,
  validarUsuarioActual,
} from "../lib/auth";
import Resultados from "../pages/Resultados";
import ReporteEvaluacion from "../pages/ReporteEvaluacion";
import Reportes from "../pages/Reportes";
import CambiarPassword from "../pages/CambiarPassword";
import FichaEvaluacion from "../pages/FichaEvaluacion";
import { useEffect, useState } from "react";

function RutaProtegida({ children, roles }) {
  const usuarioLocal = obtenerUsuarioActual();

  const [validando, setValidando] = useState(true);
  const [usuario, setUsuario] = useState(usuarioLocal);

  useEffect(() => {
    let activo = true;

    const validar = async () => {
      if (!usuarioLocal) {
        if (activo) {
          setUsuario(null);
          setValidando(false);
        }

        return;
      }

      const resultado = await validarUsuarioActual();

      if (!activo) return;

      if (!resultado.valido) {
        setUsuario(null);
        setValidando(false);
        return;
      }

      setUsuario(resultado.usuario);
      setValidando(false);
    };

    validar();

    return () => {
      activo = false;
    };
  }, []);

  if (validando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Validando sesión...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
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
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="personal"
            element={
              <RutaProtegida roles={["admin"]}>
                <Personal />
              </RutaProtegida>
            }
          />

          <Route
            path="usuarios"
            element={
              <RutaProtegida roles={["admin"]}>
                <Usuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="asignaciones"
            element={
              <RutaProtegida roles={["admin"]}>
                <Asignaciones />
              </RutaProtegida>
            }
          />

          <Route
            path="periodos"
            element={
              <RutaProtegida roles={["admin"]}>
                <Periodos />
              </RutaProtegida>
            }
          />

          <Route
            path="ficha-evaluacion"
            element={
              <RutaProtegida roles={["admin"]}>
                <FichaEvaluacion />
              </RutaProtegida>
            }
          />

          <Route
            path="secciones"
            element={<Navigate to="/admin/ficha-evaluacion" replace />}
          />

          <Route
            path="niveles"
            element={<Navigate to="/admin/ficha-evaluacion" replace />}
          />

          <Route
            path="items"
            element={<Navigate to="/admin/ficha-evaluacion" replace />}
          />

          <Route
            path="evaluaciones"
            element={
              <RutaProtegida roles={["admin", "evaluador"]}>
                <Evaluaciones />
              </RutaProtegida>
            }
          />

          <Route
            path="evaluaciones/nueva"
            element={
              <RutaProtegida roles={["admin", "evaluador"]}>
                <Evaluacion />
              </RutaProtegida>
            }
          />

          <Route
            path="evaluaciones/:id"
            element={
              <RutaProtegida roles={["admin", "evaluador"]}>
                <Evaluacion />
              </RutaProtegida>
            }
          />

          <Route
            path="evaluaciones/:id/reporte"
            element={
              <RutaProtegida roles={["admin", "evaluador"]}>
                <ReporteEvaluacion />
              </RutaProtegida>
            }
          />

          <Route
            path="resultados"
            element={
              <RutaProtegida roles={["admin"]}>
                <Resultados />
              </RutaProtegida>
            }
          />

          <Route
            path="reportes"
            element={
              <RutaProtegida roles={["admin"]}>
                <Reportes />
              </RutaProtegida>
            }
          />

          <Route
            path="cambiar-password"
            element={
              <RutaProtegida roles={["admin", "evaluador"]}>
                <CambiarPassword />
              </RutaProtegida>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
