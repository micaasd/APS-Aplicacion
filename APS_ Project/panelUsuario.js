// --- Referencias de elementos ---
const modal = document.getElementById("userSeguroModal");
const title = document.getElementById("userModalTitle");
const form = document.getElementById("userFormSeguro");

// pasos
const stepSelect = document.getElementById("stepSelect");
const stepAuto = document.getElementById("stepAuto");
const stepAseg = document.getElementById("stepAsegurado");

// botones selector
const btnAuto = document.getElementById("btnAsegurarAuto");
const btnCancel0 = document.getElementById("userCancelBtn");

// botones auto
const btnCancel1 = document.getElementById("userCancelBtn2");
const btnAsegurado = document.getElementById("btnAseguradoForm");

// botones asegurado
const btnVolverAuto = document.getElementById("btnVolverAuto");
const btnCancel2 = document.getElementById("userCancelBtn3");

// --- Helpers ---
function showSelector() {
  title.textContent = "Solicitar Seguro";
  stepSelect.style.display = "grid";
  stepAuto.style.display = "none";
  stepAseg.style.display = "none";
}
function showAutoForm() {
  title.textContent = "Asegurar auto";
  stepSelect.style.display = "none";
  stepAuto.style.display = "grid";
  stepAseg.style.display = "none";
}
function showAseguradoForm() {
  title.textContent = "Datos del asegurado";
  stepSelect.style.display = "none";
  stepAuto.style.display = "none";
  stepAseg.style.display = "grid";
}

function openModal() {
  showSelector();
  form.reset?.();
  modal.style.display = "flex";
}
function closeModal() {
  modal.style.display = "none";
}

// --- Navegación ---
document.getElementById("userSolicitar").addEventListener("click", openModal);
btnAuto.addEventListener("click", showAutoForm);
btnCancel0.addEventListener("click", closeModal);
btnCancel1.addEventListener("click", closeModal);

// --- BOTÓN BAJA ---
const userBaja = document.getElementById("userBaja");
const bajaModal = document.getElementById("bajaModal");
const bajaForm = document.getElementById("bajaForm");
const bajaCancelBtn = document.getElementById("bajaCancelBtn");
const bajaIdInput = document.getElementById("bajaIdInput");
const bajaModalMsg = document.getElementById("bajaModalMsg");

userBaja.addEventListener("click", () => {
  bajaForm.reset();
  bajaModalMsg.textContent = "";
  bajaModalMsg.style.color = "";
  bajaModal.style.display = "flex";
});

bajaCancelBtn.addEventListener(
  "click",
  () => (bajaModal.style.display = "none")
);

bajaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = bajaIdInput.value;
  if (!id) return;
  if (!confirm("¿Confirma la baja definitiva del seguro " + id + "?")) return;

  bajaModalMsg.textContent = "Procesando...";
  try {
    await window.segurosAPI.deleteSeguro(parseInt(id, 10));
    bajaModalMsg.textContent = "Baja procesada.";
    bajaModalMsg.style.color = "green";
    setTimeout(() => (bajaModal.style.display = "none"), 1200);
  } catch (err) {
    bajaModalMsg.textContent = "Error: " + err.message;
    bajaModalMsg.style.color = "crimson";
  }
});

// --- BOTÓN MODIFICAR ---
document.getElementById("userModificar").addEventListener("click", () => {
  console.log("Redirigiendo a la página de modificación...");
  alert('Botón "Modificar Seguro" presionado.');
});

// --- BOTÓN PAGAR SEGURO ---
const userPagar = document.getElementById("userPagar");
const pagoModal = document.getElementById("pagoModal");
const btnPagarTarjeta = document.getElementById("btnPagarTarjeta");
const btnPagarQR = document.getElementById("btnPagarQR");
const btnCancelarPago = document.getElementById("btnCancelarPago");

userPagar.addEventListener("click", () => {
  // Mostrar el modal de pago
  pagoModal.style.display = "flex";
});

// Cerrar modal
btnCancelarPago.addEventListener("click", () => {
  pagoModal.style.display = "none";
});

// Elegir pago con Tarjeta
btnPagarTarjeta.addEventListener("click", () => {
  console.log("Redirigiendo al pago con tarjeta...");
  window.location.href = "pagoTarjeta.html";
});

// Elegir pago con QR
btnPagarQR.addEventListener("click", () => {
  console.log("Redirigiendo al pago con QR...");
  window.location.href = "pago-qr.html";
});

// --- Paso 2: volver/cancelar ---
btnVolverAuto.addEventListener("click", showAutoForm);
btnCancel2.addEventListener("click", closeModal);

form.addEventListener("submit", async (e) => {
  if (stepAseg.style.display === "none") return;
  e.preventDefault();

  const asegurado = {
    DNI: document.getElementById("asegDni").value.trim(),
    nombre: document.getElementById("asegNombre").value.trim(),
    apellido: document.getElementById("asegApellido").value.trim(),
    telefono: document.getElementById("asegTelefono").value.trim(),
    direccion: document.getElementById("asegDireccion").value.trim(),
  };

  if (Object.values(asegurado).some((v) => !v)) {
    alert("Completá DNI, nombre, apellido, teléfono y dirección.");
    return;
  }

  const auto = JSON.parse(form.dataset.autoPayload || "{}");
  if (!auto.anio) {
    alert("Faltan los datos del auto. Volvé al Paso Auto.");
    return;
  }

  const nroPoliza = crypto.randomUUID().slice(0, 8).toUpperCase();
  const fechaFin = null;
  const montoAsegurado = null;

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Creando...";

  try {
    const result = await window.segurosAPI.asegurarAuto({
      asegurado,
      auto,
      nroPoliza,
      fechaFin,
      montoAsegurado,
    });
    alert(`¡Listo! Seguro #${result.seguro.idSeguro}
Asegurado DNI: ${result.asegurado.DNI}
Bien ID: ${result.bien.idBien}
Tipo: auto`);
    closeModal();
  } catch (err) {
    alert("No se pudo crear la solicitud: " + (err?.message || err));
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirmar";
  }
});

function avanzarAsegurado() {
  const anio = document.getElementById("autoAnio").value.trim();
  const marca = document.getElementById("autoMarca").value.trim();
  const modelo = document.getElementById("autoModelo").value.trim();
  const version = document.getElementById("autoVersion").value.trim();
  const gnc = form.querySelector('input[name="autoGNC"]:checked')?.value || "";

  if (!anio || !marca || !modelo || !version || !gnc) {
    alert("Completá año, marca, modelo, versión y si tiene GNC.");
    return false;
  }
  form.dataset.autoPayload = JSON.stringify({
    anio,
    marca,
    modelo,
    version,
    gnc,
    usoParticular: document.getElementById("autoUsoParticular").checked,
  });
  showAseguradoForm();
  return true;
}

btnAsegurado.addEventListener("click", avanzarAsegurado);
