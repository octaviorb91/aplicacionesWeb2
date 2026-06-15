import { userCardComponent } from "../pages/components/cards.js"
import { navBarComponent } from "../pages/components/navBar.js"

window.addEventListener('load', async () => {
  // Renderizar Navbar
  const navBarContainer = document.querySelector('header')
  if (navBarContainer) {
    navBarContainer.innerHTML = navBarComponent
  }

  // Obtener Datos de usuario desde la sesión real del backend
  const userData = JSON.parse(sessionStorage.getItem("user"))
  const container = document.getElementById("userCardContainer")

  if (userData && container) {
    // A modo de adaptador, se traducen los campos del backend al formato del frontend
    const usuarioAdaptado = {
        ...userData,
        name: userData.nombre || userData.name, 
        lastname: userData.apellido || "",
        // Mapeamos la foto para asegurarnos de que no falte
        photoUrl: userData.photoUrl || `https://ui-avatars.com/api/?name=${userData.nombre}+${userData.apellido}&background=28a745&color=fff`,
        photo: userData.photoUrl 
    };

    // Le inyectamos el usuario adaptado al componente visual
    container.innerHTML = userCardComponent(usuarioAdaptado)
  } else {
    container.innerHTML = `
      <div class="col-12 text-center mt-5">
        <p class="text-danger fw-bold">No hay ninguna sesión activa.</p>
        <a href="../pages/inicioSesion.html" class="btn btn-primary mt-3">Ir a Iniciar Sesión</a>
      </div>
    `
  }
})

// Función global de cierre de sesión
window.logout = () => {
  sessionStorage.clear();
  window.location.href = "../pages/inicioSesion.html"
}