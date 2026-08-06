import { getCart, saveCart } from "../utils/localStorage.controller.js"
import { navBarComponent } from "../pages/components/navBar.js"

// Navbar
const navBarContainer = document.querySelector("header")
if (navBarContainer) {
  navBarContainer.innerHTML = navBarComponent
}

// Contador del carrito
const updateCartCount = () => {
  const cart = getCart()
  const countElement = document.getElementById("cart-count")
  if (countElement) {
    countElement.textContent = cart.reduce((acc, item) => acc + item.quantity, 0)
  }
}

const cartContainer = document.getElementById("cartContainer")
const totalElement = document.getElementById("total")
const clearButton = document.getElementById("clear-cart")

// Contenedor para el boton de compra, lo creamos aca para poder mostrarlo u ocultarlo según el estado del carrito
const actionButtonsContainer = document.createElement("div");
actionButtonsContainer.className = "d-flex justify-content-end gap-2 mt-3";

const formatPrice = (price) => `$${price.toLocaleString("es-AR")}`

const renderCart = () => {
  const cart = getCart();
  cartContainer.innerHTML = ""
  let total = 0

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="text-center col-12">Tu carrito está vacío 🛒</p>`
    totalElement.parentElement.style.display = 'none'; // Oculta los totales si no hay nada
    updateCartCount()
    return
  }

  // Volvemos a mostrar la zona de totales y botones si hay items
  totalElement.parentElement.style.display = 'block';

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity
    total += subtotal

    const card = document.createElement("div")
    card.classList.add("col");
    card.innerHTML = `
      <div class="card h-100 shadow-sm border-secondary bg-dark text-light">
        <img src="${item.imageUrl}" 
             class="card-img-top img-fluid p-2 rounded" 
             style="height: 250px; object-fit: contain; background-color: #212529;" 
             alt="${item.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-bold text-primary">${item.title}</h5>
          <p class="card-text text-danger fw-bold fs-5 mb-1">
            ${formatPrice(item.price)} 
            ${item.oldPrice ? `<span class="text-muted text-decoration-line-through fs-6 ms-2">${formatPrice(item.oldPrice)}</span>` : ""}
          </p>
          <div class="mt-auto">
            <p class="text-success mb-1 fw-bold">Cantidad: <span class="text-light">${item.quantity}</span></p>
            <p class="text-info mb-3 fw-bold">Subtotal: <span class="text-light">${formatPrice(subtotal)}</span></p>
            <button class="btn btn-outline-danger w-100 remove-item fw-bold" data-index="${index}">
              <i class="bi bi-trash-fill pointer-events-none"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `
    cartContainer.appendChild(card)
  })

  totalElement.textContent = `Total a Pagar: ${formatPrice(total)}`
  
  // Agregar el botón de compra junto al botón de vaciar
  if (clearButton && !document.getElementById("checkout-btn")) {
      const checkoutBtn = document.createElement("button");
      checkoutBtn.id = "checkout-btn";
      checkoutBtn.className = "btn btn-success ms-2 fw-bold px-4";
      checkoutBtn.innerHTML = '<i class="bi bi-bag-check-fill me-2"></i>Finalizar Compra';
      
      // Agregamos el listener para procesar la compra
      checkoutBtn.addEventListener("click", procesarCompra);
      
      // Inyectamos el boton al lado del boton de limpiar
      clearButton.parentElement.appendChild(checkoutBtn);
  }

  updateCartCount();
}

// Lógica para procesar y guardar la compra en el Backend
const procesarCompra = async () => {
    const cart = getCart();
    const userData = JSON.parse(sessionStorage.getItem("user"));

    // Validar que el usuario esté logueado
    if (!userData) {
        alert("¡Atención! Debes iniciar sesión en tu cuenta para poder finalizar la compra.");
        window.location.href = "../pages/InicioSesion.html";
        return;
    }

    if (cart.length === 0) return;

    // Calcular el total
    const totalCompra = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Formatear los productos del carrito para que coincidan con lo que espera el backend
    const productosParaAPI = cart.map(item => ({
        id: item.id,
        cantidad: item.quantity
    }));

    try {
        // Bloquear el botón mientras procesa para evitar multiples clicks
        const btn = document.getElementById("checkout-btn");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...';
        btn.disabled = true;

        // Realizar la peticion POST al backend
        const response = await fetch("/users/ventas/comprar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: userData.username,
                productosCarrito: productosParaAPI,
                total: totalCompra,
                direccion: "Retiro en sucursal principal"
            })
        });

        const result = await response.json();

        // Evaluar la respuesta
        if (response.ok && result.status) {
            alert(`¡Felicidades, ${userData.nombre}! Tu compra se procesó con éxito.\nOrden de compra #: ${result.id_orden}`);
            
            // Vaciar el carrito local tras una compra exitosa
            localStorage.removeItem("cart");
            renderCart();
        } else {
            throw new Error(result.message || "No se pudo completar la transacción.");
        }

    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("Ocurrió un inconveniente al procesar tu compra. Por favor, intenta de nuevo más tarde.");
    } finally {
        // Restaurar el boton si hubo un error (si fue éxito el renderCart ya lo oculta)
        const btn = document.getElementById("checkout-btn");
        if(btn) {
            btn.innerHTML = '<i class="bi bi-bag-check-fill me-2"></i>Finalizar Compra';
            btn.disabled = false;
        }
    }
};

// Eliminar producto
cartContainer.addEventListener("click", (e) => {
  // Asegurarnos de capturar el click
  const targetBtn = e.target.closest(".remove-item");
  if (targetBtn) {
    const index = targetBtn.getAttribute("data-index")
    let cart = getCart()
    cart.splice(index, 1)
    saveCart(cart)
    renderCart() 
  }
})

// Vaciar carrito
if (clearButton) {
  clearButton.addEventListener("click", () => {
    if(confirm("¿Estás seguro que deseas vaciar tu carrito místico?")) {
        localStorage.removeItem("cart")
        renderCart()
    }
  })
}

// Render inicial
renderCart()


