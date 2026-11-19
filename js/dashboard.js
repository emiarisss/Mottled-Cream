/* dashboard.js — estadísticas públicas calculadas desde productos.json */

const campoLimite = document.getElementById("limite-stock");
let productosActuales = [];

/* ---------- Acceso con código (demostración) ----------
   Importante: el código está escrito en este archivo, así que cualquiera que abra el
   código fuente puede leerlo. Sirve para mostrar cómo funcionaría un acceso,
   pero no es una protección real. */
const CODIGO_ACCESO = "8888";
const CLAVE_SESION = "mottledCreamSesionPanel";

const panelAcceso = document.getElementById("panel-acceso");
const panelDashboard = document.getElementById("contenido");
const formularioAcceso = document.getElementById("formulario-acceso");
const campoCodigo = document.getElementById("codigo");
const errorAcceso = document.getElementById("error-acceso");
const botonCerrarSesion = document.getElementById("cerrar-sesion");

function mostrarPanel() {
  panelAcceso.hidden = true;
  panelDashboard.hidden = false;
  botonCerrarSesion.hidden = false;
  cargarDatos();
}

formularioAcceso.addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (campoCodigo.value.trim() === CODIGO_ACCESO) {
    sessionStorage.setItem(CLAVE_SESION, "si"); // solo recuerda que ya se ingresó, no guarda el código
    errorAcceso.textContent = "";
    campoCodigo.value = "";
    campoCodigo.removeAttribute("aria-invalid");
    mostrarPanel();
  } else {
    errorAcceso.textContent = "El código no es correcto. Inténtalo de nuevo.";
    campoCodigo.setAttribute("aria-invalid", "true");
    campoCodigo.focus();
  }
});

botonCerrarSesion.addEventListener("click", function () {
  sessionStorage.removeItem(CLAVE_SESION);
  panelDashboard.hidden = true;
  botonCerrarSesion.hidden = true;
  panelAcceso.hidden = false;
  campoCodigo.focus();
});

// Colores del gráfico de stock (los mismos de la leyenda y la tabla)
const COLOR_STOCK_NORMAL = "#65745A";
const COLOR_STOCK_BAJO = "#B85C38";
const COLOR_AGOTADO = "#706250";

/* ---------- Cálculo de indicadores ---------- */

function estadoDelProducto(producto, limite) {
  if (producto.stock === 0) return "agotado";
  if (producto.stock <= limite) return "bajo";
  return "normal";
}

function calcularIndicadores(productos, limite) {
  const categorias = [];
  let valorInventario = 0;
  let conExistencias = 0;
  let agotados = 0;
  let stockBajo = 0;

  productos.forEach(function (p) {
    if (!categorias.includes(p.categoria)) categorias.push(p.categoria);
    valorInventario += p.precio * p.stock;
    if (p.stock > 0) conExistencias++;
    if (p.stock === 0) agotados++;
    if (estadoDelProducto(p, limite) === "bajo") stockBajo++;
  });

  return {
    total: productos.length,
    categorias: categorias,
    valorInventario: valorInventario,
    conExistencias: conExistencias,
    agotados: agotados,
    stockBajo: stockBajo,
    stockNormal: conExistencias - stockBajo
  };
}

/* ---------- Animaciones de números ---------- */

// Cuenta desde 0 hasta el valor final
function animarNumero(elemento, valorFinal, esDinero) {
  const texto = function (n) {
    return esDinero ? formatearPrecio(n) : Math.round(n);
  };
  if (animacionesReducidas()) {
    elemento.textContent = texto(valorFinal);
    return;
  }
  const duracion = 900;
  const inicio = performance.now();
  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const suave = 1 - Math.pow(1 - progreso, 3);
    elemento.textContent = texto(valorFinal * suave);
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function mostrarIndicadores(datos) {
  animarNumero(document.getElementById("ind-total"), datos.total, false);
  animarNumero(document.getElementById("ind-categorias"), datos.categorias.length, false);
  animarNumero(document.getElementById("ind-valor"), datos.valorInventario, true);
  animarNumero(document.getElementById("ind-existencias"), datos.conExistencias, false);
  animarNumero(document.getElementById("ind-agotados"), datos.agotados, false);
  animarNumero(document.getElementById("ind-bajo"), datos.stockBajo, false);
}

/* ---------- Tortas (gráficos circulares) ---------- */
// grupos: lista de { nombre, valor, color, texto }

function animarTorta(circulo, grupos, total) {
  const duracion = animacionesReducidas() ? 1 : 1000;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const limite = 360 * (1 - Math.pow(1 - progreso, 3)); // hasta dónde se ha dibujado
    let acumulado = 0;
    const tramos = [];

    grupos.forEach(function (g) {
      const desde = acumulado;
      const hasta = Math.min(acumulado + (g.valor / total) * 360, limite);
      if (hasta > desde) tramos.push(g.color + " " + desde + "deg " + hasta + "deg");
      acumulado += (g.valor / total) * 360;
    });
    tramos.push("var(--crema) " + limite + "deg 360deg");
    circulo.style.background = "conic-gradient(" + tramos.join(", ") + ")";

    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function dibujarTorta(idCirculo, idLeyenda, grupos) {
  const circulo = document.getElementById(idCirculo);
  const leyenda = document.getElementById(idLeyenda);
  let total = 0;
  grupos.forEach(function (g) { total += g.valor; });

  leyenda.innerHTML = "";
  grupos.forEach(function (g) {
    const porcentaje = total > 0 ? Math.round((g.valor / total) * 100) : 0;
    const item = document.createElement("li");
    item.innerHTML =
      '<span class="color-leyenda" style="background:' + g.color + '"></span>' +
      '<span class="leyenda-nombre">' + g.nombre + "</span>" +
      "<strong>" + g.texto + "</strong>" +
      '<span class="leyenda-porcentaje">' + porcentaje + "%</span>";
    leyenda.appendChild(item);
  });

  if (total === 0) {
    circulo.style.background = "var(--crema)";
    return;
  }
  animarTorta(circulo, grupos, total);
}

// Suma, por categoría, lo que devuelva la función "calcular"
function agruparPorCategoria(productos, categorias, calcular) {
  return categorias.map(function (nombre) {
    let valor = 0;
    productos.forEach(function (p) {
      if (p.categoria === nombre) valor += calcular(p);
    });
    return { nombre: nombre, valor: valor, color: colorCategoria(nombre) };
  });
}

function dibujarTortas(productos, datos) {
  // 1. Productos por categoría
  const porCantidad = agruparPorCategoria(productos, datos.categorias, function () { return 1; });
  porCantidad.forEach(function (g) { g.texto = g.valor; });
  dibujarTorta("torta-categorias", "leyenda-categorias", porCantidad);

  // 2. Distribución del stock
  dibujarTorta("torta-stock", "leyenda-stock", [
    { nombre: "Stock normal", valor: datos.stockNormal, color: COLOR_STOCK_NORMAL, texto: datos.stockNormal },
    { nombre: "Stock bajo", valor: datos.stockBajo, color: COLOR_STOCK_BAJO, texto: datos.stockBajo },
    { nombre: "Agotados", valor: datos.agotados, color: COLOR_AGOTADO, texto: datos.agotados }
  ]);

  // 3. Valor del inventario por categoría
  const porValor = agruparPorCategoria(productos, datos.categorias, function (p) { return p.precio * p.stock; });
  porValor.forEach(function (g) { g.texto = formatearPrecio(g.valor); });
  dibujarTorta("torta-valor", "leyenda-valor", porValor);
}

/* ---------- Barras: unidades en stock por producto ---------- */

function dibujarBarrasStock(productos) {
  const zona = document.getElementById("grafico-stock-productos");
  zona.innerHTML = "";
  let maximo = 1;
  productos.forEach(function (p) {
    if (p.stock > maximo) maximo = p.stock;
  });

  productos.forEach(function (p) {
    const fila = document.createElement("div");
    fila.className = "barra-fila";
    fila.innerHTML =
      "<span>" + p.nombre + "</span>" +
      '<div class="barra-fondo"><div class="barra ' + claseCategoria(p.categoria) + '"></div></div>' +
      "<strong>" + p.stock + "</strong>";
    zona.appendChild(fila);
  });

  // Las barras crecen desde 0 hasta su valor
  setTimeout(function () {
    const barras = zona.querySelectorAll(".barra");
    productos.forEach(function (p, i) {
      barras[i].style.transitionDelay = i * 40 + "ms";
      barras[i].style.width = (p.stock / maximo) * 100 + "%";
    });
  }, 50);
}

/* ---------- Tablas ---------- */

const TEXTO_ESTADO = { normal: "Disponible", bajo: "Stock bajo", agotado: "Agotado" };

function dibujarTablaInventario(productos, limite) {
  const cuerpo = document.getElementById("tabla-inventario");
  const pie = document.getElementById("total-inventario");
  cuerpo.innerHTML = "";
  let totalUnidades = 0;
  let totalValor = 0;

  productos.forEach(function (p) {
    const estado = estadoDelProducto(p, limite);
    const valor = p.precio * p.stock;
    totalUnidades += p.stock;
    totalValor += valor;
    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td>" + p.nombre + "</td><td>" + p.categoria + "</td>" +
      '<td class="numero">' + formatearPrecio(p.precio) + "</td>" +
      '<td class="numero">' + p.stock + "</td>" +
      '<td class="numero">' + formatearPrecio(valor) + "</td>" +
      '<td><span class="chip chip-' + estado + '">' + TEXTO_ESTADO[estado] + "</span></td>";
    cuerpo.appendChild(fila);
  });

  pie.innerHTML =
    '<tr><td colspan="3">Total</td><td class="numero">' + totalUnidades + "</td>" +
    '<td class="numero">' + formatearPrecio(totalValor) + "</td><td></td></tr>";
}

function dibujarTablaStockBajo(productos, limite) {
  const cuerpo = document.getElementById("tabla-stock-bajo");
  const bajos = productos
    .filter(function (p) { return estadoDelProducto(p, limite) === "bajo"; })
    .sort(function (a, b) { return a.stock - b.stock; });

  cuerpo.innerHTML = "";
  if (bajos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="4">No hay productos con stock bajo.</td></tr>';
    return;
  }
  bajos.forEach(function (p) {
    // El medidor muestra cuántas unidades quedan respecto al límite de stock bajo
    const porcentaje = limite > 0 ? (p.stock / limite) * 100 : 0;
    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td><strong>" + p.nombre + "</strong></td>" +
      '<td><span class="chip-categoria ' + claseCategoria(p.categoria) + '">' + p.categoria + "</span></td>" +
      '<td><div class="medidor"><div class="medidor-barra" style="width:' + porcentaje + '%"></div></div>' +
      '<span class="medidor-texto">' + p.stock + (p.stock === 1 ? " unidad" : " unidades") + "</span></td>" +
      '<td class="numero">' + formatearPrecio(p.precio) + "</td>";
    cuerpo.appendChild(fila);
  });
}

/* ---------- Carga y actualización ---------- */

function actualizarPanel() {
  let limite = Number(campoLimite.value);
  if (isNaN(limite) || limite < 0) limite = LIMITE_STOCK_BAJO;

  const datos = calcularIndicadores(productosActuales, limite);
  mostrarIndicadores(datos);
  dibujarTortas(productosActuales, datos);
  dibujarBarrasStock(productosActuales);
  dibujarTablaInventario(productosActuales, limite);
  dibujarTablaStockBajo(productosActuales, limite);
  document.getElementById("hora-actualizacion").textContent = new Date().toLocaleString("es-BO");
}

function cargarDatos() {
  const aviso = document.getElementById("error-datos");
  aviso.hidden = true;
  obtenerProductos()
    .then(function (productos) {
      productosActuales = productos;
      actualizarPanel();
    })
    .catch(function () {
      aviso.textContent = "No pudimos cargar los datos de productos. Revisa que data/productos.json esté disponible e intenta de nuevo.";
      aviso.hidden = false;
    });
}

campoLimite.value = LIMITE_STOCK_BAJO;
campoLimite.addEventListener("input", function () {
  if (productosActuales.length > 0) actualizarPanel();
});
document.getElementById("boton-actualizar").addEventListener("click", cargarDatos);

if (sessionStorage.getItem(CLAVE_SESION) === "si") mostrarPanel();
