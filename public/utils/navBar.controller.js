import { getCart } from "./localStorage.controller.js"

// Actualiza el contador del carrito en el navbar
export const updateCartCount = () => {
  const cart = getCart()
  const countElement = document.getElementById("cart-count")
  if (countElement) {
    countElement.textContent = cart.reduce((acc, item) => acc + item.quantity, 0)
  }
};

// Inicializa el navbar
export const initNavbar = (navBarComponent) => {
  const navBarContainer = document.querySelector("header")
  if (navBarContainer) {
    navBarContainer.innerHTML = navBarComponent
    updateCartCount()
  }
}
