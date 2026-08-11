import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Toast } from "../lib/toast";
import "../styles/login.css";

import {
  Eye,
  EyeOff,
  UserRound,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Landmark,
  LoaderCircle,
} from "lucide-react";

function Login() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (dni.length !== 8) {
      Toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (!password.trim()) {
      Toast.error("Ingrese su contraseña");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        "verificar_login_dni",
        {
          p_dni: dni,
          p_password: password,
        }
      );

      if (error) {
        Toast.error(error.message);
        return;
      }

      if (!data || data.length === 0) {
        Toast.error("DNI o contraseña incorrectos");
        return;
      }

      localStorage.setItem(
        "usuario_app",
        JSON.stringify(data[0])
      );

      window.location.href = "/admin/dashboard";
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Toast.error("No se pudo conectar con el sistema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div
        className="login-decoration login-shape-top"
        aria-hidden="true"
      />

      <div
        className="login-decoration login-shape-bottom"
        aria-hidden="true"
      />

      <div
        className="login-decoration login-dots"
        aria-hidden="true"
      />

      <img
        className="login-watermark"
        src="/logo.png"
        alt=""
        aria-hidden="true"
      />

      <form
        className="login-card"
        onSubmit={iniciarSesion}
        noValidate
      >
        <header className="login-brand">
          <div className="login-logo-container">
            <img
              className="login-logo"
              src="/logo.png"
              alt="Escudo de la I.E. José Joaquín Inclán"
            />
          </div>

          <h1 className="login-title">
            I.E. CRL. JOSÉ JOAQUÍN INCLÁN
          </h1>

          <div className="login-subtitle-row">
            <span className="login-subtitle-line" />

            <p className="login-subtitle">
              Sistema SEDI — Autenticación
            </p>

            <span className="login-subtitle-line" />
          </div>

          <div
            className="login-security-icon"
            aria-hidden="true"
          >
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
        </header>

        <div className="login-form-group">
          <label
            className="login-form-label"
            htmlFor="dni"
          >
            USUARIO (DNI)
          </label>

          <div className="login-input-wrapper">
            <UserRound
              className="login-input-icon"
              size={20}
              strokeWidth={1.9}
            />

            <input
              id="dni"
              className="login-input"
              type="text"
              placeholder="Ingrese su DNI"
              value={dni}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, "");
                setDni(valor);
              }}
              maxLength={8}
              inputMode="numeric"
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="login-form-group">
          <label
            className="login-form-label"
            htmlFor="password"
          >
            CONTRASEÑA
          </label>

          <div className="login-input-wrapper">
            <LockKeyhole
              className="login-input-icon"
              size={20}
              strokeWidth={1.9}
            />

            <input
              id="password"
              className="login-input login-password-input"
              type={mostrar ? "text" : "password"}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
            />

            <button
              className="login-password-toggle"
              type="button"
              aria-label={
                mostrar
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              title={
                mostrar
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              onClick={() =>
                setMostrar((estadoAnterior) => !estadoAnterior)
              }
              disabled={loading}
            >
              {mostrar ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <button
          className="login-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle
                className="login-spinner"
                size={21}
              />
              INGRESANDO...
            </>
          ) : (
            <>
              <LogIn size={21} strokeWidth={2.2} />
              INGRESAR AL SISTEMA
            </>
          )}
        </button>

        <footer className="login-footer">
          <div className="login-footer-divider">
            <span className="login-footer-icon">
              <Landmark size={19} strokeWidth={1.8} />
            </span>
          </div>

          <p className="login-footer-text">
            Piura © 2026 | Disciplina, Estudio y Trabajo
          </p>
        </footer>
      </form>
    </main>
  );
}

export default Login;