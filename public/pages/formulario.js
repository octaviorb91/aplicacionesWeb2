import { navBarComponent } from "../pages/components/navBar.js"

// Función auxiliar para convertir el archivo de imagen seleccionado a Base64
const leerImagenComoBase64 = (archivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(archivo);
  });
};

window.addEventListener("load", () => {
  // Insertar el menú de navegación en el header
  const navBarContainer = document.querySelector("header")
  if (navBarContainer) navBarContainer.innerHTML = navBarComponent

  // Capturar los elementos del formulario y de alertas
  const form = document.getElementById("loginForm") || document.getElementById("registerForm") || document.querySelector("form")
  const alertBox = document.getElementById("loginAlert") || document.getElementById("registerAlert")

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Captura de campos según los inputs del HTML
      const nombreInput = document.getElementById("nombre") || document.getElementById("name") || document.getElementById("txtNombre")
      const apellidoInput = document.getElementById("apellido") || document.getElementById("txtApellido")
      const emailInput = document.getElementById("email") || document.getElementById("txtEmail")
      const passwordInput = document.getElementById("password") || document.getElementById("txtPass")
      const filePhotoInput = document.getElementById("filePhoto")

      if (!emailInput || !passwordInput || !nombreInput) {
        alert("No se pudieron encontrar los campos obligatorios del formulario en el HTML.")
        return
      }

      const nombreValue = nombreInput.value.trim()
      const apellidoValue = apellidoInput ? apellidoInput.value.trim() : ""
      const emailValue = emailInput.value.trim()
      const passwordValue = passwordInput.value.trim()

      // Generación automática del nombre de usuario
      const usernameGenerated = `${nombreValue.toLowerCase().replace(/\s+/g, '')}.${apellidoValue.toLowerCase().replace(/\s+/g, '')}` || emailValue.split("@")[0];

      try {
        let photoBase64 = "";

        // Si se seleccionó una imagen de perfil, la procesamos y la convertimos a Base64
        if (filePhotoInput && filePhotoInput.files.length > 0) {
          const archivo = filePhotoInput.files[0];
          
          // Límite de tamaño sugerido: 2MB para evitar peticiones sobrecargadas
          if (archivo.size > 2 * 1024 * 1024) {
             throw new Error("La imagen seleccionada supera el límite permitido de 2MB.");
          }
          
          photoBase64 = await leerImagenComoBase64(archivo);
        }

        // Enviamos la petición de creación al endpoint de registro en el backend
        const response = await fetch("/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: nombreValue,
            apellido: apellidoValue,
            email: emailValue,
            password: passwordValue,
            username: usernameGenerated,
            photoBase64: photoBase64
          })
        })

        const result = await response.json()

        if (response.ok && result.status) {
          // Al registrarse con éxito, guardamos los datos del usuario en el sessionStorage
          sessionStorage.setItem("user", JSON.stringify({
            id: result.usuario.id,
            nombre: result.usuario.nombre,
            apellido: result.usuario.apellido,
            email: result.usuario.email,
            username: result.usuario.username,
            photoUrl: result.usuario.photoUrl
          }))

          alert(`¡Registro exitoso! Bienvenido/a a la tripulación, ${result.usuario.nombre}.`);

          // Redireccionamos a la sección privada del panel de usuario
          window.location.href = "../privatePages/user.html"
        } else {
          throw new Error(result.message || "No se pudo registrar la cuenta en este momento.")
        }

      } catch (error) {
        console.error("Error durante el registro:", error);
        const message = error.message || "Ocurrió un error inesperado al crear la cuenta. Intentalo más tarde.";
        
        // Renderizar el mensaje en el banner de alertas
        if (alertBox) {
          alertBox.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center shadow border-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>${message}</div>
            </div>`;
        } else {
          alert(message)
        }
      }
    })
  }
})

// Función global para cerrar sesión
window.logout = () => {
  sessionStorage.clear()
  window.location.href = "../pages/inicioSesion.html"
}
