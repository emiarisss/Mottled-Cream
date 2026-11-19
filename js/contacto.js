/* contacto.js — validación del formulario de contacto (envío simulado) */

const formulario = document.getElementById("formulario-contacto");
const confirmacion = document.getElementById("confirmacion");

// Cada campo con el mensaje que se muestra si está vacío
const camposObligatorios = [
  { id: "nombre", mensaje: "Escribe tu nombre completo." },
  { id: "correo", mensaje: "Escribe tu correo electrónico." },
  { id: "telefono", mensaje: "Escribe tu número de teléfono." },
  { id: "asunto", mensaje: "Escribe el asunto de tu mensaje." },
  { id: "mensaje", mensaje: "Escribe tu mensaje." }
];

function correoValido(correo) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(correo);
}

function telefonoValido(telefono) {
  const digitos = telefono.replace(/\D/g, "");
  return digitos.length >= 7 && digitos.length <= 15;
}

function mostrarErrorCampo(id, texto) {
  const campo = document.getElementById(id);
  const error = document.getElementById("error-" + id);
  error.textContent = texto;
  campo.setAttribute("aria-invalid", texto !== "");
}

function validarFormulario() {
  let hayErrores = false;

  camposObligatorios.forEach(function (campo) {
    const valor = document.getElementById(campo.id).value.trim();
    let texto = "";

    if (valor === "") {
      texto = campo.mensaje;
    } else if (campo.id === "correo" && !correoValido(valor)) {
      texto = "Revisa el formato del correo, por ejemplo: nombre@correo.com.";
    } else if (campo.id === "telefono" && !telefonoValido(valor)) {
      texto = "Escribe un teléfono válido, con al menos 7 dígitos.";
    }

    mostrarErrorCampo(campo.id, texto);
    if (texto !== "") hayErrores = true;
  });

  return !hayErrores;
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // Evita el envío real: todavía no hay servidor
  confirmacion.hidden = true;

  if (!validarFormulario()) {
    const primerError = formulario.querySelector('[aria-invalid="true"]');
    if (primerError) primerError.focus();
    return;
  }

  const nombre = document.getElementById("nombre").value.trim().split(" ")[0];
  confirmacion.textContent = "Gracias, " + nombre + ". Recibimos tu mensaje y te responderemos pronto.";
  confirmacion.hidden = false;
  formulario.reset();
});
