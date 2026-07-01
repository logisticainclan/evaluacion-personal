export function obtenerUsuarioActual() {
  return JSON.parse(localStorage.getItem("usuario_app"));
}

export function obtenerRolActual() {
  const usuario = obtenerUsuarioActual();
  return usuario?.rol || null;
}

export function esAdmin() {
  return obtenerRolActual() === "admin";
}

export function esEvaluador() {
  return obtenerRolActual() === "evaluador";
}

export function cerrarSesion() {
  localStorage.removeItem("usuario_app");
  window.location.href = "/login";
}