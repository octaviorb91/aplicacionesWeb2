import { getSessionStorage } from "../utils/sessionStorage.controller.js";

// Variables de estado local
let listadoProductosCompleto = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const sessionUser = getSessionStorage();

// Referencias del DOM
const lblSaludo = document.getElementById("lblSaludo");
const contenedorProductos = document.getElementById("contenedorProductos");
const listaCarrito = document.getElementById("listaCarrito");
const txtTotal = document.getElementById("txtTotal");
const badgeContador = document.getElementById("badgeContador");
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
const txtBuscar = document.getElementById("txtBuscar");
const txtDireccion = document.getElementById("txtDireccion");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const botonesFiltro = document.querySelectorAll(".btn-filtro");

// Redirección de seguridad si no está logueado
if (!sessionUser || !sessionUser.status) {
    window.location.href = "../index.html";
} else {
    lblSaludo.textContent = `Bienvenido, ${sessionUser.nombre} ${sessionUser.apellido}`;
}

// 1. Obtener productos desde el Backend
const cargarProductos = async () => {
    try {
        const respuesta = await fetch("http://localhost:5000/users/productos/all");
        if (!respuesta.ok) throw new Error("Error en la carga de productos");
        listadoProductosCompleto = await respuesta.json();
        renderizarProductos(listadoProductosCompleto);
    } catch (error) {
        console.error(error);
        contenedorProductos.innerHTML = `<p class="text-red-400 col-span-2 text-center">No se pudieron cargar los productos.</p>`;
    }
};

// 2. Renderizar las tarjetas de productos en el catálogo
const renderizarProductos = (productos) => {
    contenedorProductos.innerHTML = "";
    if (productos.length === 0) {
        contenedorProductos.innerHTML = `<p class="text-gray-500 col-span-2 text-center py-8">No se encontraron productos coincidentes.</p>`;
        return;
    }

    productos.forEach(prod => {
        const card = document.createElement("div");
        card.className = "bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-700 transition-all";
        card.innerHTML = `
            <div>
                <div class="bg-gray-800 h-36 rounded-xl mb-3 flex items-center justify-center text-gray-500 font-medium text-xs text-center px-2">
                    [Imagen: ${prod.imagen}]
                </div>
                <h3 class="text-white font-semibold text-base mb-1">${prod.nombre}</h3>
                <p class="text-gray-400 text-xs line-clamp-2 mb-3">${prod.desc}</p>
            </div>
            <div class="flex justify-between items-center mt-2">
                <span class="text-white font-bold text-lg">$${prod.precio.toLocaleString('es-AR')}</span>
                <button class="btn-agregar bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 text-xs font-medium px-3 py-2 rounded-xl transition-all" data-id="${prod.id}">
                    Añadir +
                </button>
            </div>
        `;
        contenedorProductos.appendChild(card);
    });

    // Añadir manejadores de eventos a los nuevos botones dinámicos
    document.querySelectorAll(".btn-agregar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            añadirAlCarrito(id);
        });
    });
};

// 3. Funcionalidad de Filtros (Buscador y Categorías del JSON)
const filtrarCatalogo = (categoriaSeleccionada = "todos") => {
    const textoBusqueda = txtBuscar.value.toLowerCase().trim();

    const productosFiltrados = listadoProductosCompleto.filter(prod => {
        const coincideBusqueda = prod.nombre.toLowerCase().includes(textoBusqueda) || prod.desc.toLowerCase().includes(textoBusqueda);
        
        if (categoriaSeleccionada === "todos") return coincideBusqueda;
        
        // Mapeo lógico según descripciones o nombres de tus productos reales
        const nombre = prod.nombre.toLowerCase();
        const desc = prod.desc.toLowerCase();
        
        if (categoriaSeleccionada === "computacion") {
            return coincideBusqueda && (nombre.includes("notebook") || nombre.includes("mouse") || nombre.includes("teclado") || nombre.includes("monitor") || nombre.includes("impresora") || nombre.includes("disco") || nombre.includes("ssd") || nombre.includes("router"));
        }
        if (categoriaSeleccionada === "celulares") {
            return coincideBusqueda && (nombre.includes("smartphone") || nombre.includes("iphone") || nombre.includes("tablet") || nombre.includes("ipad") || nombre.includes("smartwatch") || nombre.includes("watch"));
        }
        if (categoriaSeleccionada === "consolas") {
            return coincideBusqueda && (nombre.includes("playstation") || nombre.includes("xbox") || nombre.includes("nintendo") || nombre.includes("switch") || nombre.includes("gamer"));
        }
        if (categoriaSeleccionada === "hogar") {
            return coincideBusqueda && (nombre.includes("proyector") || nombre.includes("lámpara") || nombre.includes("cafetera") || nombre.includes("heladera") || nombre.includes("microondas") || nombre.includes("lavarropas") || nombre.includes("aspiradora") || nombre.includes("ventilador") || nombre.includes("televisor") || nombre.includes("escritorio"));
        }
        return coincideBusqueda;
    });

    renderizarProductos(productosFiltrados);
};

// Manejo visual activo de los botones de categoría
botonesFiltro.forEach(boton => {
    boton.addEventListener("click", () => {
        botonesFiltro.forEach(b => {
            b.classList.remove("bg-gray-800", "text-white", "font-medium");
            b.classList.add("bg-gray-950");
        });
        boton.classList.remove("bg-gray-950");
        boton.classList.add("bg-gray-800", "text-white", "font-medium");
        
        const cat = boton.getAttribute("data-cat");
        filtrarCatalogo(cat);
    });
});

txtBuscar.addEventListener("input", () => {
    // Busca dentro de la categoría que esté visualmente marcada como activa
    const botonActivo = document.querySelector(".btn-filtro.bg-gray-800");
    const cat = botonActivo ? botonActivo.getAttribute("data-cat") : "todos";
    filtrarCatalogo(cat);
});

// 4. Lógica del Carrito con LocalStorage
const añadirAlCarrito = (id) => {
    const itemExistente = carrito.find(p => p.id === id);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        const productoBase = listadoProductosCompleto.find(p => p.id === id);
        carrito.push({ ...productoBase, cantidad: 1 });
    }
    actualizarInterfazCarrito();
};

const eliminarDelCarrito = (id) => {
    carrito = carrito.filter(p => p.id !== id);
    actualizarInterfazCarrito();
};

const actualizarInterfazCarrito = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `<p class="text-gray-500 text-sm text-center py-4">El carrito está vacío.</p>`;
        txtTotal.textContent = "$0";
        badgeContador.textContent = "0";
        btnFinalizarCompra.disabled = true;
        return;
    }

    let totalCalculado = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        totalCalculado += item.precio * item.cantidad;
        totalItems += item.cantidad;

        const row = document.createElement("div");
        row.className = "flex justify-between items-center bg-gray-950 p-2.5 rounded-xl border border-gray-800 text-xs";
        row.innerHTML = `
            <div class="flex-1 min-w-0 pr-2">
                <p class="text-white font-medium truncate">${item.nombre}</p>
                <p class="text-gray-400 font-mono mt-0.5">${item.cantidad} x $${item.precio.toLocaleString('es-AR')}</p>
            </div>
            <button class="btn-eliminar text-red-400 hover:text-red-300 font-medium px-2 py-1 bg-red-950/30 rounded-lg" data-id="${item.id}">
                Quitar
            </button>
        `;
        listaCarrito.appendChild(row);
    });

    txtTotal.textContent = `$${totalCalculado.toLocaleString('es-AR')}`;
    badgeContador.textContent = totalItems;
    btnFinalizarCompra.disabled = false;

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            eliminarDelCarrito(id);
        });
    });
};

// 5. Enviar la Orden de Compra al Backend (POST)
btnFinalizarCompra.addEventListener("click", async () => {
    const totalCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    const payloadCompra = {
        username: sessionUser.username,
        productosCarrito: carrito,
        total: totalCalculado,
        direccion: txtDireccion.value.trim()
    };

    try {
        btnFinalizarCompra.disabled = true;
        btnFinalizarCompra.textContent = "Procesando...";

        const response = await fetch("http://localhost:5000/users/ventas/comprar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadCompra)
        });

        const dataResponse = await response.json();

        if (response.ok && dataResponse.status) {
            alert(`¡Compra Exitosa!\n${dataResponse.message}\nOrden N°: ${dataResponse.id_orden}`);
            // Limpiamos el carrito al finalizar correctamente
            carrito = [];
            txtDireccion.value = "";
            actualizarInterfazCarrito();
        } else {
            alert(`Error en el servidor: ${dataResponse.message || "No se pudo procesar."}`);
            btnFinalizarCompra.disabled = false;
            btnFinalizarCompra.textContent = "Finalizar Compra";
        }
    } catch (error) {
        console.error("Error en la petición de compra:", error);
        alert("Ocurrió un problema de conexión con el backend.");
        btnFinalizarCompra.disabled = false;
        btnFinalizarCompra.textContent = "Finalizar Compra";
    }
});

// Botón de Cierre de Sesión
btnCerrarSesion.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "../index.html";
});

// Inicialización de la App al cargar el script
cargarProductos();
actualizarInterfazCarrito();