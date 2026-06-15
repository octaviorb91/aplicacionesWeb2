// Controlador LocalStorage del carrito
export const getCart = () => {
  const cart = localStorage.getItem("cart")
  return cart ? JSON.parse(cart) : []
}

export const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart))
}

export const addToCart = (product, quantity) => {
  let cart = getCart()

  // Buscar si el producto ya está en el carrito
  const existing = cart.find(item => item.id === product.id)

  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ ...product, quantity })
  }

  saveCart(cart)
}
