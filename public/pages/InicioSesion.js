import { navBarComponent } from "../pages/components/navBar.js"

window.addEventListener("load", () => {
  // Renderizamos el Navbar en el header
  const navBarContainer = document.querySelector("header")
  if (navBarContainer) navBarContainer.innerHTML = navBarComponent

  // Nota: La lógica de autenticación y manejo de sesión se encuentra en auth.js
})

// Función global de cierre de sesión
window.logout = () => {
  sessionStorage.clear()
  window.location.href = "../pages/inicioSesion.html"
}
