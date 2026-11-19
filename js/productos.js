
/* productos.js — catálogo con búsqueda, filtro y orden */

const contenedor = document.getElementById("lista-productos");
const campoBusqueda = document.getElementById("busqueda");
const selectCategoria = document.getElementById("filtro-categoria");
const selectOrden = document.getElementById("orden-precio");
const casillaDisponibles = document.getElementById("solo-disponibles");
const textoResultados = document.getElementById("cantidad-resultados");
const ventana = document.getElementById("detalle-producto");

let todosLosProductos = [];

function llenarCategorias() {
    const categorias = [];

    todosLosProductos.forEach(function (p) {
        if (!categorias.includes(p.categoria)) {
            categorias.push(p.categoria);
        }
    });

    categorias.forEach(function (categoria) {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

function aplicarFiltros() {
    const texto = normalizar(campoBusqueda.value.trim());
    const categoria = selectCategoria.value;

    let resultado = todosLosProductos.filter(function (p) {
        const coincideNombre = normalizar(p.nombre).includes(texto);
        const coincideCategoria =
            categoria === "todas" || p.categoria === categoria;
        const coincideStock =
            !casillaDisponibles.checked || p.stock > 0;

        return coincideNombre && coincideCategoria && coincideStock;
    });

    if (selectOrden.value === "menor") {
        resultado.sort(function (a, b) {
            return a.precio - b.precio;
        });
    } else if (selectOrden.value === "mayor") {
        resultado.sort(function (a, b) {
            return b.precio - a.precio;
        });
    }

    mostrarProductos(resultado);
}

function mostrarProductos(lista) {
    contenedor.innerHTML = "";

    textoResultados.textContent =
        lista.length === 1
            ? "1 producto encontrado"
            : lista.length + " productos encontrados";

    if (lista.length === 0) {
        mostrarError(
            contenedor,
            "No encontramos productos con esos criterios. Prueba con otra búsqueda o categoría."
        );
        return;
    }

    lista.forEach(function (producto) {
        contenedor.appendChild(
            crearTarjetaProducto(producto, abrirDetalle)
        );
    });

    revelarElementos();
}

/* ---------- Ventana de detalles ---------- */

function abrirDetalle(producto) {
    const agotado = producto.stock === 0;

    ventana.innerHTML =
        '<img src="' + producto.imagen + '" alt="' +
        producto.nombre + '" width="400" height="300">' +

        '<div class="detalle-texto">' +
        '<p class="producto-categoria">' + producto.categoria + '</p>' +
        '<h2>' + producto.nombre + '</h2>' +
        '<p>' + producto.descripcion + '</p>' +
        '<p class="producto-precio">' +
        formatearPrecio(producto.precio) + '</p>' +

        '<p class="producto-estado ' +
        (agotado ? "estado-agotado" : "estado-disponible") +
        '">' + textoDisponibilidad(producto) + '</p>' +

        '<div class="producto-botones">' +
        '<button type="button" class="boton boton-secundario" id="cerrar-detalle">Cerrar</button>' +

        '<button type="button" class="boton" id="agregar-detalle"' +
        (agotado ? " disabled" : "") + '>' +
        (agotado ? "Agotado" : "Agregar al carrito") +
        '</button></div></div>';

    document.getElementById("cerrar-detalle")
        .addEventListener("click", function () {
            ventana.close();
        });

    const botonAgregar = document.getElementById("agregar-detalle");

    botonAgregar.addEventListener("click", function () {
        if (agregarAlCarrito(producto)) {
            animarBoton(botonAgregar);
        }
    });

    ventana.showModal();
}

// Cierra la ventana al hacer clic fuera del contenido
ventana.addEventListener("click", function (evento) {
    if (evento.target === ventana) {
        ventana.close();
    }
});

/* ---------- Inicio ---------- */

// Evita que la página se recargue al pulsar Enter en el buscador
document.querySelector(".filtros").addEventListener("submit", function (evento) {
    evento.preventDefault();
});

campoBusqueda.addEventListener("input", aplicarFiltros);
selectCategoria.addEventListener("change", aplicarFiltros);
selectOrden.addEventListener("change", aplicarFiltros);
casillaDisponibles.addEventListener("change", aplicarFiltros);

obtenerProductos()
    .then(function (productos) {
        todosLosProductos = productos;
        llenarCategorias();

        // Recupera la categoría o producto indicado en la dirección
        const parametros = new URLSearchParams(window.location.search);
        const categoriaUrl = parametros.get("categoria");

        if (
            categoriaUrl &&
            productos.some(function (p) {
                return p.categoria === categoriaUrl;
            })
        ) {
            selectCategoria.value = categoriaUrl;
        }

        aplicarFiltros();

        const idUrl = Number(parametros.get("id"));

        const productoUrl = productos.find(function (p) {
            return p.id === idUrl;
        });

        if (productoUrl) {
            abrirDetalle(productoUrl);
        }
    })
    .catch(function () {
        mostrarError(
            contenedor,
            "No pudimos cargar el catálogo en este momento. Intenta de nuevo en unos minutos."
        );

        textoResultados.textContent = "";
    });
