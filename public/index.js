import { navBarComponent } from "./pages/components/navBar.js"
import { cardComponent } from "./pages/components/cards.js"
import { addToCart, getCart } from "./utils/localStorage.controller.js"

// Función global para actualizar el contador del carrito en el header
const updateCartCount = () => {
  const cart = getCart()
  const countElement = document.getElementById("cart-count")
  if (countElement) {
    countElement.textContent = cart.reduce((acc, item) => acc + item.quantity, 0)
  }
}

// Muestra una notificación flotante en pantalla
const mostrarNotificacion = (mensaje) => {
  const toast = document.createElement("div")
  toast.className = "position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded shadow-lg border border-light"
  toast.style.zIndex = "1060"
  toast.style.minWidth = "250px"
  toast.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${mensaje}`
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.transition = "opacity 0.5s ease"
    toast.style.opacity = "0"
    setTimeout(() => toast.remove(), 500)
  }, 3000)
}

// Adaptador: Traduce los campos de la base de datos del backend al formato el front
const adaptarProducto = (producto) => {
  return {
    id: producto.id,
    title: producto.nombre,                 // Traduce 'nombre' a 'title'
    desc: producto.desc,
    price: producto.precio,                 // Traduce 'precio' a 'price'
    imageUrl: `/images/${producto.imagen}`,  // Adapta la ruta para servirse de forma estática desde el servidor
    categoria: producto.categoria,
    oldPrice: producto.precio * 1.15,       // Genera un descuento simulado del 15% para el diseño visual
    installments: producto.categoria === "marvel" 
      ? `18 cuotas sin interés de $${(producto.precio / 18).toFixed(2)}`
      : `9 cuotas sin interés de $${(producto.precio / 9).toFixed(2)}`,
    shipping: "Envío gratis"
  }
}

// Resuelve la página de redirección adecuada según la categoría del artefacto místico
const obtenerPaginaDestino = (categoria) => {
  if (categoria === "marvel") return "pages/Marvel.html";
  if (categoria === "lotr") return "pages/LordOfRings.html";
  if (categoria === "backToFuture") return "pages/BackToFuture.html";
  return "index.html";
}

window.addEventListener('load', async () => {
  // Inyección y renderizado del Menú de Navegación común
  const navBarContainer = document.querySelector('header')
  if (navBarContainer) {
    navBarContainer.innerHTML = navBarComponent
    updateCartCount()

    // Detectar si hay un usuario logueado en la sesión
    const userData = JSON.parse(sessionStorage.getItem("user"))
    const userButtonContainer = document.getElementById("user-button-container")

    if (userButtonContainer) {
      if (userData) {
        // Generamos un avatar por defecto dinámico si el perfil de usuario no cuenta con foto asignada
        const fotoUsuario = userData.photoUrl || `https://ui-avatars.com/api/?name=${userData.nombre}+${userData.apellido}&background=28a745&color=fff`;
        const nombreDisplay = userData.name || `${userData.nombre} ${userData.apellido}`;

        userButtonContainer.innerHTML = `
          <button class="btn btn-success rounded-pill me-2 d-flex align-items-center" 
                  onclick="window.location.href='${window.location.origin}/privatePages/user.html'">
            <img src="${fotoUsuario}" 
                 alt="${nombreDisplay}" 
                 class="rounded-circle me-1" 
                 style="height: 28px; width: 28px; object-fit: cover;">
            <small class="d-none d-md-inline">${userData.nombre || 'Mi Perfil'}</small>
          </button>
        `
      } else {
        userButtonContainer.innerHTML = `
          <button class="btn btn-success rounded-pill me-2" 
                  onclick="window.location.href='${window.location.origin}/pages/inicioSesion.html'">
            <i class="bi bi-person-circle"></i>
          </button>
        `
      }
    }
  }

  const path = window.location.pathname
  let products = []
  const baseUrl = window.location.origin

  // Carga asíncrona de los productos
  try {
    let urlFetch = `${baseUrl}/api/productos`;

    // Filtramos la url del endpoint de acuerdo al documento HTML donde se encuentre parado el cliente
    if (path.endsWith("Marvel.html")) {
      urlFetch = `${baseUrl}/api/productos?categoria=marvel`;
    } else if (path.endsWith("LordOfRings.html")) {
      urlFetch = `${baseUrl}/api/productos?categoria=lotr`;
    } else if (path.endsWith("BackToFuture.html")) {
      urlFetch = `${baseUrl}/api/productos?categoria=backToFuture`;
    }

    const response = await fetch(urlFetch);
    if (response.ok) {
      const dbProducts = await response.json();
      // Mapeamos los datos crudos del backend a través de nuestro adaptador
      products = dbProducts.map(p => adaptarProducto(p));
    } else {
      console.error("La API del servidor no devolvió una respuesta exitosa");
    }
  } catch (error) {
    console.error("Error crítico de red al solicitar los productos:", error);
  }

  // Cierre de sesión global
  window.logout = () => {
    sessionStorage.clear()
    window.location.href = "../pages/inicioSesion.html"
  }

  // Sistema de búsqueda unificado y centralizado con el Backend
  const searchInput = document.getElementById("searchInput")
  const searchButton = document.getElementById("searchButton")

  const handleSearch = async () => {
    const query = searchInput.value.trim().toLowerCase()
    if (!query) return

    // Guardamos la consulta de búsqueda para filtrarla dinámicamente en la página correspondiente
    sessionStorage.setItem("searchQuery", query)

    try {
      const response = await fetch(`${baseUrl}/api/productos`);
      if (response.ok) {
        const dbProducts = await response.json();
        const todosLosProductos = dbProducts.map(p => adaptarProducto(p));

        const encontrado = todosLosProductos.find(p => p.title.toLowerCase().includes(query));

        if (encontrado) {
          const paginaDestino = obtenerPaginaDestino(encontrado.categoria);
          window.location.href = `${baseUrl}/${paginaDestino}`;
        } else {
          // Si el artefacto no existe, volvemos a la portada principal
          window.location.href = `${baseUrl}/index.html`
        }
      }
    } catch (err) {
      console.error("Error al procesar la búsqueda en la API:", err);
    }
  };

  if (searchButton) searchButton.addEventListener("click", handleSearch)
  if (searchInput) searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch()
  })

  // Renderizado dinámico de tarjetas de catálogo
  const container = document.getElementById("cardsContainer")
  if (container && products.length > 0) {
    const searchQuery = sessionStorage.getItem("searchQuery")
    let filteredProducts = products;

    if (searchQuery) {
      filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery)
      );
      sessionStorage.removeItem("searchQuery")
    }

    if (filteredProducts.length > 0) {
      container.innerHTML = filteredProducts.map(p => cardComponent(p)).join("")
    } else {
      container.innerHTML = `<p class="text-center fw-bold text-danger my-5">No disponemos de ese artefacto real en stock 😕</p>`
    }

    // Delegación de eventos para sumar, restar y agregar ítems al carrito
    container.addEventListener("click", (e) => {
      if (e.target.classList.contains("sumar")) {
        const input = e.target.parentElement.querySelector(".cantidad")
        input.value = parseInt(input.value) + 1
      }
      if (e.target.classList.contains("restar")) {
        const input = e.target.parentElement.querySelector(".cantidad")
        if (parseInt(input.value) > 1) {
          input.value = parseInt(input.value) - 1
        }
      }
      if (e.target.classList.contains("add-to-cart")) {
        const cardBody = e.target.closest(".card-body")
        const cantidad = parseInt(cardBody.querySelector(".cantidad").value)
        const title = cardBody.querySelector(".card-title").textContent
        const product = products.find(p => p.title === title)

        if (product) {
          addToCart(product, cantidad)
          updateCartCount()
          mostrarNotificacion(`Agregaste ${cantidad} unidad(es) de "${product.title}" al carrito.`);
        }
      }
    })
  }
})





