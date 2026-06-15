const url = window.location.origin + "/"

const navElements = [
  { title: "Home", link: `${url}index.html` },
  { title: "Marvel", link: `${url}pages/Marvel.html` },
  { title: "Lord of rings", link: `${url}pages/LordOfRings.html` },
  { title: "Back to the future", link: `${url}pages/BackToFuture.html` }
]

export const navBarComponent = `
  <nav class="navbar navbar-expand-lg bg-body-tertiary px-4 mb-4">
    <div class="container-fluid">
      <!-- Logo -->
      <a href="${url}index.html">
        <img src="${url}images/iconEmporio.png" 
             alt="Logo" 
             style="height: 40px; width: 40px; object-fit: cover;" 
             class="me-2 rounded-circle">
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav">
          ${navElements.map(e => `
            <li class="nav-item">
              <a class="nav-link" href="${e.link}">${e.title}</a>
            </li>
          `).join(" ")}
        </ul>

        <div class="ms-auto d-flex align-items-center">
          <!-- Carrito -->
          <button class="btn btn-warning rounded-pill d-flex justify-content-center align-items-center me-2" 
            style="width: auto; height: 40px; padding: 0 10px;" 
            onclick="window.location.href='${url}privatePages/cart.html'">
            <img src="${url}images/cartIcon.png" alt="Carrito" style="height: 20px; width: 20px;" class="me-1">
            <span id="cart-count" class="badge bg-success">0</span>
          </button>

          <!-- Usuario -->
          <div id="user-button-container">
            <button class="btn btn-success rounded-pill me-2" onclick="window.location.href='${url}pages/InicioSesion.html'">
              <i class="bi bi-person-circle"></i>
            </button>
          </div>

          <!-- Logout -->
          <button class="btn btn-danger rounded-pill me-2" onclick="logout()">
            <i class="bi bi-box-arrow-left"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
`





