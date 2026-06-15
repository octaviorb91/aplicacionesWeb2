// components/cards.js
import { addToCart } from "../../utils/localStorage.controller.js";

const formatPrice = (price) => {
  return `$${price.toLocaleString("es-AR")}`
}

// Componente de tarjeta de producto
export const cardComponent = (product) => {
  return `
    <div class="col">
      <div class="card h-100">
        <img src="${product.imageUrl}" 
             class="card-img-top img-fluid" 
             style="height: 300px; object-fit: stretch;" 
             alt="${product.title}" />
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text text-danger fw-bold">
            ${formatPrice(product.price)} 
            ${product.oldPrice ? `<span class="text-muted text-decoration-line-through">${formatPrice(product.oldPrice)}</span>` : ""}
          </p>
          <p class="text-success">${product.installments || ""}</p>
          <p class="text-info">${product.shipping || ""}</p>

          <div class="d-flex align-items-center mb-3">
            <button class="btn btn-outline-secondary restar">−</button>
            <input type="text" class="form-control mx-2 text-center cantidad" 
                   value="1" style="width: 60px;" readonly>
            <button class="btn btn-outline-secondary sumar">+</button>
          </div>

          <button class="btn btn-success w-100 add-to-cart">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `
}

// Componente de tarjeta de usuario para la sección privada
export const userCardComponent = (user) => {
  return `
    <div class="card text-center">
      <img src="${user.photoUrl}" 
           class="card-img-top rounded-circle mx-auto mt-3"
           style="height: 150px; width: 150px; object-fit: cover;" 
           alt="${user.name}" />
      <div class="card-body">
        <h5 class="card-title">Bienvenido, ${user.name} 👋</h5>
        <button class="btn btn-primary mt-3 w-100" onclick="window.location.href='../index.html'">
          Empezar a comprar
        </button>
      </div>
    </div>
  `
}

