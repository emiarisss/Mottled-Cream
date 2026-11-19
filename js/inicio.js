/* inicio.js — marquesina, productos destacados y categorías de index.html */

const contenedorDestacados = document.getElementById("productos-destacados");
const contenedorCategorias = document.getElementById("lista-categorias");
const marquesina = document.getElementById("marquesina");

// Un icono por categoría (Lucide, licencia ISC). Si aparece una categoría nueva se usa el de la taza.
const ICONOS_CATEGORIA = {
  panaderia: '<svg class="icono" viewBox="0 0 24 24" width="42" height="42" aria-hidden="true"><path d="M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487"/><path d="M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132"/><path d="M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42"/><path d="M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14"/><path d="M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676"/></svg>',
  reposteria: '<svg class="icono" viewBox="0 0 24 24" width="42" height="42" aria-hidden="true"><path d="M16 13H3"/><path d="M16 17H3"/><path d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle cx="9" cy="7" r="2"/></svg>',
  cafeteria: '<svg class="icono" viewBox="0 0 24 24" width="42" height="42" aria-hidden="true"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>'
};

// Desde el inicio se envía a la persona al catálogo para ver el detalle
function irAlDetalle(producto) {
  window.location.href = "productos.html?id=" + producto.id;
}

// Cinta con los nombres de los productos que se desplaza sola
function mostrarMarquesina(productos) {
  let grupo = "";
  productos.forEach(function (p) {
    grupo += "<span>" + p.nombre + '</span><span class="estrella">✦</span>';
  });
  // El contenido se repite dos veces para que el movimiento no tenga saltos
  marquesina.innerHTML = '<div class="marquesina-grupo">' + grupo + '</div><div class="marquesina-grupo">' + grupo + "</div>";
}

function mostrarDestacados(productos) {
  const destacados = productos.filter(function (p) {
    return p.destacado;
  });
  destacados.forEach(function (producto) {
    contenedorDestacados.appendChild(crearTarjetaProducto(producto, irAlDetalle));
  });
}

function mostrarCategorias(productos) {
  const nombres = [];
  productos.forEach(function (p) {
    if (!nombres.includes(p.categoria)) nombres.push(p.categoria);
  });

  nombres.forEach(function (nombre) {
    const cantidad = productos.filter(function (p) {
      return p.categoria === nombre;
    }).length;
    const icono = ICONOS_CATEGORIA[claveCategoria(nombre)] || ICONOS_CATEGORIA.cafeteria;
    const enlace = document.createElement("a");
    enlace.className = "categoria revelar " + claseCategoria(nombre);
    enlace.href = "productos.html?categoria=" + encodeURIComponent(nombre);
    enlace.innerHTML =
      '<span class="categoria-icono" aria-hidden="true">' + icono + "</span>" +
      "<strong>" + nombre + "</strong><span>" + cantidad + " productos</span>";
    contenedorCategorias.appendChild(enlace);
  });
}

obtenerProductos()
  .then(function (productos) {
    contenedorDestacados.innerHTML = "";
    contenedorCategorias.innerHTML = "";
    mostrarMarquesina(productos);
    mostrarDestacados(productos);
    mostrarCategorias(productos);
    revelarElementos();
  })
  .catch(function () {
    const mensaje = "No pudimos cargar los productos en este momento. Intenta de nuevo en unos minutos.";
    mostrarError(contenedorDestacados, mensaje);
    mostrarError(contenedorCategorias, mensaje);
  });
