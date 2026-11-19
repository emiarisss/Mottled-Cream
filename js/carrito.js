
/* carrito.js — muestra y modifica el carrito */

const zonaCarrito = document.getElementById("contenido-carrito");
let catalogo = [];

function buscarProducto(id) {
    return catalogo.find(function (p) {
        return p.id === id;
    });
}

// Ajusta el carrito al stock disponible
function limpiarCarrito() {
    const carrito = obtenerCarrito().filter(function (item) {
        const producto = buscarProducto(item.id);
        return producto && producto.stock > 0;
    });

    carrito.forEach(function (item) {
        const producto = buscarProducto(item.id);

        if (item.cantidad > producto.stock) {
            item.cantidad = producto.stock;
        }
    });

    guardarCarrito(carrito);

    return carrito;
}

// Aumenta o disminuye la cantidad
function cambiarCantidad(id, cambio) {
    const carrito = obtenerCarrito();

    const item = carrito.find(function (i) {
        return i.id === id;
    });

    const producto = buscarProducto(id);

    if (!item || !producto) return;

    const nueva = item.cantidad + cambio;

    if (nueva > producto.stock) {
        mostrarAviso(
            "Solo hay " + producto.stock +
            " unidades disponibles de " + producto.nombre + "."
        );
        return;
    }

    if (nueva < 1) return;

    item.cantidad = nueva;

    guardarCarrito(carrito);
    dibujarCarrito();
}

// Elimina un producto
function eliminarProducto(id, fila) {
    fila.classList.add("saliendo");

    setTimeout(function () {
        const carrito = obtenerCarrito().filter(function (i) {
            return i.id !== id;
        });

        guardarCarrito(carrito);
        dibujarCarrito();

    }, animacionesReducidas() ? 0 : 350);
}

// Dibuja los productos y el resumen
function dibujarCarrito() {
    const carrito = limpiarCarrito();

    if (carrito.length === 0) {
        zonaCarrito.innerHTML =
            '<div class="carrito-vacio">' +
            '<h2>Tu carrito está vacío</h2>' +
            '<p>Cuando agregues productos, aparecerán aquí.</p>' +
            '<a class="boton" href="productos.html">Ver el catálogo</a>' +
            '</div>';

        return;
    }

    const lista = document.createElement("ul");
    lista.className = "carrito-lista";

    let total = 0;

    carrito.forEach(function (item) {
        const producto = buscarProducto(item.id);

        const subtotal = producto.precio * item.cantidad;
        total += subtotal;

        const fila = document.createElement("li");
        fila.className = "carrito-fila";

        fila.innerHTML =
            '<img src="' + producto.imagen +
            '" alt="' + producto.nombre +
            '" width="96" height="72">' +

            '<div class="carrito-nombre">' +
            '<h3>' + producto.nombre + '</h3>' +
            '<p>' + formatearPrecio(producto.precio) + ' c/u</p>' +
            '</div>' +

            '<div class="cantidad" role="group" aria-label="Cantidad de ' +
            producto.nombre + '">' +

            '<button type="button" class="boton-cantidad" data-accion="menos" aria-label="Quitar una unidad">−</button>' +

            '<span>' + item.cantidad + '</span>' +

            '<button type="button" class="boton-cantidad" data-accion="mas" aria-label="Agregar una unidad">+</button>' +

            '</div>' +

            '<p class="carrito-subtotal">' +
            formatearPrecio(subtotal) + '</p>' +

            '<button type="button" class="boton-texto" data-accion="eliminar">Eliminar</button>';

        fila.querySelector('[data-accion="menos"]')
            .addEventListener("click", function () {
                cambiarCantidad(item.id, -1);
            });

        fila.querySelector('[data-accion="mas"]')
            .addEventListener("click", function () {
                cambiarCantidad(item.id, 1);
            });

        fila.querySelector('[data-accion="eliminar"]')
            .addEventListener("click", function () {
                eliminarProducto(item.id, fila);
            });

        lista.appendChild(fila);
    });

    const resumen = document.createElement("div");
    resumen.className = "carrito-resumen";

    resumen.innerHTML =
        '<h2>Resumen del pedido</h2>' +

        '<p class="linea-resumen">' +
        '<span>Subtotal</span>' +
        '<span>' + formatearPrecio(total) + '</span>' +
        '</p>' +

        '<p class="linea-resumen total">' +
        '<span>Total</span>' +
        '<span>' + formatearPrecio(total) + '</span>' +
        '</p>' +

        '<button type="button" class="boton" id="finalizar-pedido">Finalizar pedido</button>' +

        '<button type="button" class="boton-texto" id="vaciar-carrito">Vaciar carrito</button>';

    zonaCarrito.innerHTML = "";
    zonaCarrito.appendChild(lista);
    zonaCarrito.appendChild(resumen);

    document.getElementById("vaciar-carrito")
        .addEventListener("click", function () {
            guardarCarrito([]);
            dibujarCarrito();
        });

    document.getElementById("finalizar-pedido")
        .addEventListener("click", finalizarPedido);
}

/* ---------- Finalizar pedido ---------- */

function finalizarPedido() {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        mostrarAviso("Tu carrito está vacío.");
        return;
    }

    // Descuenta las cantidades del inventario
    if (!descontarStock(carrito, catalogo)) {
        dibujarCarrito();
        return;
    }

    // Vacía el carrito
    guardarCarrito([]);

    zonaCarrito.innerHTML =
        '<div class="carrito-vacio">' +
        '<h2>¡Gracias por tu pedido!</h2>' +
        '<p>Tu pedido ha sido registrado correctamente.</p>' +
        '<p>¡Esperamos verte pronto en Mottled Cream!</p>' +
        '<a class="boton" href="productos.html">Volver al catálogo</a>' +
        '</div>';
}

/* ---------- Cargar catálogo ---------- */

obtenerProductos()
    .then(function (productos) {
        catalogo = productos;
        dibujarCarrito();
    })
    .catch(function () {
        mostrarError(
            zonaCarrito,
            "No pudimos cargar tu carrito en este momento. Intenta de nuevo en unos minutos."
        );
    });
