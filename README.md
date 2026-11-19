# Mottled Cream

Tienda virtual de **panadería, repostería y cafetería artesanal**, con una identidad visual cálida inspirada en las cafeterías de barrio: toldo a rayas, tonos moka y crema, ornamentos y mucho detalle.

## Objetivo del proyecto

Mottled Cream es un proyecto académico de desarrollo web. Su objetivo es construir una tienda multipágina completa usando únicamente las tecnologías base de la web, con un código ordenado y fácil de leer: catálogo dinámico, carrito de compras, formulario de contacto validado y un panel de estadísticas calculadas a partir de los datos reales del catálogo.

## Características principales

- Catálogo de 15 productos organizados en Panadería, Repostería y Cafetería.
- Búsqueda, filtros por categoría y disponibilidad, y orden por precio, con actualización inmediata.
- Carrito de compras que conserva su contenido al cerrar y volver a abrir la página.
- Formulario de contacto con validación de campos y de formato del correo.
- Panel de estadísticas con indicadores, tortas, barras e inventario completo.
- Diseño adaptable a computadoras, tablets y teléfonos.
- Animaciones suaves que se desactivan automáticamente si el dispositivo está configurado para reducir el movimiento.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| HTML5 | Estructura de las páginas |
| CSS3 | Estilos, diseño adaptable (Grid, Flexbox, media queries) y animaciones |
| JavaScript | Funcionalidades, manipulación del DOM, `fetch()` y `localStorage` |
| JSON | Almacenamiento de los productos |

No se utilizan frameworks, librerías externas ni base de datos.

## Funcionalidades de la tienda

| Página | Qué ofrece |
| --- | --- |
| Inicio | Banner, cinta de productos, categorías y productos destacados |
| Catálogo | Tarjetas dinámicas, búsqueda, filtros, orden, estados de disponibilidad y ventana de detalles |
| Nosotros | Presentación, misión, visión, valores y objetivos |
| Contacto | Datos de contacto, dirección del local y formulario validado |
| Carrito | Cantidades editables, eliminación de productos, subtotal y total, con control de stock |
| Preguntas frecuentes | Respuestas desplegables sobre productos, pedidos, pagos y entregas |
| Panel de estadísticas | Indicadores, gráficos y tablas de inventario y de stock bajo |

## Estructura del proyecto

```text
MOTTLED-CREAM/
├── index.html
├── productos.html
├── nosotros.html
├── contacto.html
├── carrito.html
├── faq.html
├── dashboard.html
├── data/
│   └── productos.json
├── css/
│   ├── estilos.css
│   └── admin.css
├── js/
│   ├── app.js
│   ├── inicio.js
│   ├── productos.js
│   ├── carrito.js
│   ├── contacto.js
│   └── dashboard.js
├── img/
│   ├── logo.png
│   ├── banner.jpg
│   ├── nosotros.jpg
│   └── productos/
├── docs/
│   └── capturas/
└── README.md
```

## Cómo ejecutar el proyecto

Las páginas cargan los productos con `fetch()`, por lo que deben abrirse desde un servidor local. Abrir los archivos con doble clic no es suficiente.

1. En GitHub, pulsa **Code → Download ZIP** y extrae la carpeta en tu computadora.
2. Abre **Visual Studio Code** y elige **Archivo → Abrir carpeta…**, seleccionando la carpeta del proyecto.
3. Instala la extensión **Live Server** (Ritwick Dey) desde el panel de extensiones.
4. Haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
5. El navegador se abrirá en una dirección como `http://127.0.0.1:5500/index.html`.

## Cómo se cargan los productos

Todos los productos viven en `data/productos.json`. Cada uno tiene `id`, `nombre`, `descripcion`, `precio` (en bolivianos), `categoria`, `stock`, `imagen` y `destacado`.

1. `js/app.js` lee el archivo con `fetch()` y lo convierte en una lista de objetos.
2. Cada página toma esa lista y genera su contenido: tarjetas del catálogo, destacados, categorías, carrito e indicadores.
3. Las categorías, los totales, el valor del inventario y los gráficos se calculan al momento a partir de esos mismos datos.
4. Si el archivo no puede cargarse, las páginas muestran un mensaje amable en lugar de fallar.

## Estado y limitaciones

- **Pedidos y pagos:** el carrito es demostrativo. «Finalizar pedido» no envía ni cobra nada.
- **Formulario de contacto:** valida los datos y muestra una confirmación, pero no envía mensajes porque no existe un servidor que los reciba.
- **Panel de estadísticas:** se accede desde el candado del menú con un código de demostración. Como el sitio es estático, ese código se valida en el navegador y no constituye una protección real: cualquier persona puede leerlo en el código fuente o abrir `dashboard.html` directamente. Un acceso verdaderamente exclusivo requiere un servicio de autenticación o un servidor que valide el inicio de sesión antes de entregar la página.
- **Datos de contacto y dirección:** el local aún no tiene una dirección publicada.
- **Imágenes:** las fotografías de los productos, el banner y la imagen de «Nosotros» son provisionales.
- **Redes sociales:** los enlaces del pie de página dirigen a la página principal de cada plataforma.

## Capturas de pantalla

Próximamente. Las imágenes se añadirán en `docs/capturas/`.

<!--
| Inicio | Catálogo |
| --- | --- |
| ![Inicio](docs/capturas/inicio.png) | ![Catálogo](docs/capturas/catalogo.png) |
| Contacto | Estadísticas |
| ![Contacto](docs/capturas/contacto.png) | ![Estadísticas](docs/capturas/estadisticas.png) |
-->

## Créditos

Proyecto académico desarrollado como práctica de HTML, CSS, JavaScript y JSON. La tipografía principal es Georgia, incluida en la mayoría de los sistemas operativos. Los iconos son de [Lucide](https://lucide.dev) (licencia ISC) y [Feather](https://feathericons.com) (licencia MIT).

## Licencia

Este repositorio todavía no incluye una licencia. Mientras no se defina una, se aplican por defecto los derechos de autor del proyecto.
