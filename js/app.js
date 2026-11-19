
/* app.js — funciones compartidas por todas las páginas */

const RUTA_PRODUCTOS = "data/productos.json";
const CLAVE_CARRITO = "mottledCreamCarrito";
const CLAVE_INVENTARIO = "mottledCreamInventario";
const LIMITE_STOCK_BAJO = 5;

const COLORES_CATEGORIA = {
    panaderia: "#C8923A",
    reposteria: "#8E3F52",
    cafeteria: "#285B57"
};

/* ---------- Datos y utilidades ---------- */

// Lee los productos y recupera el inventario guardado
async function obtenerProductos() {
    const respuesta = await fetch(RUTA_PRODUCTOS);

    if (!respuesta.ok) {
        throw new Error("No se pudo cargar el archivo de productos.");
    }

    const productos = await respuesta.json();

    return obtenerInventario(productos);
}

// Recupera el inventario o utiliza el stock inicial del JSON
function obtenerInventario(productos) {
    let inventario = [];

    try {
        inventario = JSON.parse(localStorage.getItem(CLAVE_INVENTARIO)) || [];
    } catch (error) {
        inventario = [];
    }

    productos.forEach(function (p) {
        const item = inventario.find(function (i) {
            return i.id === p.id;
        });

        if (item) {
            p.stock = item.stock;
        } else {
            inventario.push({ id: p.id, stock: p.stock });
        }
    });

    localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(inventario));

    return productos;
}

// Guarda las existencias actualizadas
function guardarInventario(productos) {
    const inventario = productos.map(function (p) {
        return {
            id: p.id,
            stock: p.stock
        };
    });

    localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(inventario));
}

function formatearPrecio(numero) {
    return "Bs " + numero.toFixed(2);
}

function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML =
        '<p class="mensaje-estado">' + mensaje + '</p>';
}

function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function claveCategoria(nombre) {
    return normalizar(nombre).replace(/[^a-z0-9]+/g, "-");
}

function claseCategoria(nombre) {
    return "cat-" + claveCategoria(nombre);
}

function colorCategoria(nombre) {
    return COLORES_CATEGORIA[claveCategoria(nombre)] || "#A8906F";
}

function animacionesReducidas() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- Carrito ---------- */

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");

    if (!contador) return;

    let total = 0;

    obtenerCarrito().forEach(function (item) {
        total += item.cantidad;
    });

    contador.textContent = total;
}

function saltarContador() {
    const contador = document.getElementById("contador-carrito");

    if (!contador) return;

    contador.classList.remove("salto");
    void contador.offsetWidth;
    contador.classList.add("salto");
}

// Agrega una unidad sin superar el stock
function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();

    const item = carrito.find(function (i) {
        return i.id === producto.id;
    });

    const cantidadActual = item ? item.cantidad : 0;

    if (cantidadActual >= producto.stock) {
        mostrarAviso("Ya tienes en el carrito todas las unidades disponibles de " + producto.nombre + ".");
        return false;
    }

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    saltarContador();
    mostrarAviso(producto.nombre + " se agregó a tu carrito.");

    return true;
}

// Descuenta las unidades compradas del inventario
function descontarStock(carrito, productos) {

    // Comprueba primero que todos los productos existan
    for (let i = 0; i < carrito.length; i++) {
        const producto = productos.find(function (p) {
            return p.id === carrito[i].id;
        });

        if (!producto || carrito[i].cantidad > producto.stock) {
            mostrarAviso("No hay suficientes unidades disponibles.");
            return false;
        }
    }

    // Descuenta las cantidades
    carrito.forEach(function (item) {
        const producto = productos.find(function (p) {
            return p.id === item.id;
        });

        producto.stock -= item.cantidad;
    });

    guardarInventario(productos);

    return true;
}

/* ---------- Botones y avisos ---------- */

function animarBoton(boton) {
    boton.classList.add("agregado");

    setTimeout(function () {
        boton.classList.remove("agregado");
    }, 700);
}

function mostrarAviso(texto) {
    let aviso = document.getElementById("aviso");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "aviso";
        aviso.className = "aviso";
        aviso.setAttribute("role", "status");
        document.body.appendChild(aviso);
    }

    aviso.textContent = texto;
    aviso.classList.add("visible");

    clearTimeout(aviso.temporizador);

    aviso.temporizador = setTimeout(function () {
        aviso.classList.remove("visible");
    }, 3000);
}

/* ---------- Tarjetas de productos ---------- */

function textoDisponibilidad(producto) {
    if (producto.stock === 0) return "Agotado";

    if (producto.stock <= LIMITE_STOCK_BAJO) {
        return "Últimas " + producto.stock + " unidades";
    }

    return "Disponible (" + producto.stock + ")";
}

function crearTarjetaProducto(producto, alVerDetalles) {
    const agotado = producto.stock === 0;
    const tarjeta = document.createElement("article");

    tarjeta.className = "producto revelar " +
        claseCategoria(producto.categoria) +
        (agotado ? " agotado" : "");

    tarjeta.innerHTML =
        '<div class="producto-foto">' +
        '<img src="' + producto.imagen + '" alt="' + producto.nombre +
        '" loading="lazy" width="400" height="300"></div>' +

        '<div class="producto-info">' +
        '<p class="producto-categoria">' + producto.categoria + '</p>' +
        '<h3>' + producto.nombre + '</h3>' +
        '<p>' + producto.descripcion + '</p>' +
        '<p class="producto-precio">' + formatearPrecio(producto.precio) + '</p>' +
        '<p class="producto-estado ' +
        (agotado ? "estado-agotado" : "estado-disponible") +
        '">' + textoDisponibilidad(producto) + '</p>' +

        '<div class="producto-botones">' +
        '<button type="button" class="boton boton-secundario boton-detalles">Ver detalles</button>' +
        '<button type="button" class="boton boton-agregar"' +
        (agotado ? " disabled" : "") + '>' +
        (agotado ? "Agotado" : "Agregar al carrito") +
        '</button></div></div>';

    const botonAgregar = tarjeta.querySelector(".boton-agregar");

    tarjeta.querySelector(".boton-detalles").addEventListener("click", function () {
        alVerDetalles(producto);
    });

    botonAgregar.addEventListener("click", function () {
        if (agregarAlCarrito(producto)) {
            animarBoton(botonAgregar);
        }
    });

    return tarjeta;
}

/* ---------- Menú para pantallas pequeñas ---------- */

function activarMenu() {
    const boton = document.getElementById("boton-menu");
    const menu = document.getElementById("menu-principal");

    if (!boton || !menu) return;

    boton.addEventListener("click", function () {
        const abierto = menu.classList.toggle("abierto");
        boton.setAttribute("aria-expanded", abierto);
    });
}

/* ---------- Aparición suave al hacer scroll ---------- */

const SELECTORES_REVELAR =
    "main > h1, main > .introduccion, main .contenedor > h2, " +
    "main .dos-columnas > *, main .presentacion > *, " +
    "main .faq-tema, main .filtros, main .indicador, main .panel";

let observador = null;

function revelarElementos() {
    const pendientes = document.querySelectorAll(
        ".revelar:not([data-observado])"
    );

    pendientes.forEach(function (elemento) {
        elemento.dataset.observado = "si";
    });

    if (!("IntersectionObserver" in window) || animacionesReducidas()) {
        pendientes.forEach(function (elemento) {
            elemento.classList.add("visible");
        });
        return;
    }

    if (!observador) {
        observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) return;

                const elemento = entrada.target;

                const hermanos = Array.prototype.filter.call(
                    elemento.parentElement.children,
                    function (h) {
                        return h.classList.contains("revelar");
                    }
                );

                const posicion = hermanos.indexOf(elemento);

                elemento.style.setProperty(
                    "--retraso",
                    Math.min(posicion, 8) * 80 + "ms"
                );

                elemento.classList.add("visible");
                observador.unobserve(elemento);
            });
        }, { threshold: 0.12 });
    }

    pendientes.forEach(function (elemento) {
        observador.observe(elemento);
    });
}

function prepararRevelado() {
    document.querySelectorAll(SELECTORES_REVELAR).forEach(function (elemento) {
        elemento.classList.add("revelar");
    });

    revelarElementos();
}

activarMenu();
actualizarContadorCarrito();
prepararRevelado();
