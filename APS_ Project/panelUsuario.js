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

// --- Pago: elegir seguro y crear registro en Pago ---
const selectSeguroAPagar = document.getElementById("selectSeguroAPagar");
const btnContinuarPago   = document.getElementById("btnContinuarPago");
const metodosPago        = document.getElementById("metodosPago");
const seguroCargando     = document.getElementById("seguroCargando");
const seguroError        = document.getElementById("seguroError");

let pagoActual = null; // { idPago, idSeguro }

// Aseguramos que exista un cliente de Supabase (puede venir de seguros.js)
const _SUPABASE = typeof supabase !== "undefined" ? supabase :
  window.supabase?.createClient?.(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Cargar lista de seguros
async function cargarSegurosParaPagar() {
  const _SUPABASE = window._SUPABASE_CLIENT;
  if (!_SUPABASE) {
    console.warn("Supabase no configurado. Definí SUPABASE_URL/ANON_KEY o el cliente global.");
    return [];
  }
  seguroError.style.display = "none";
  seguroCargando.style.display = "block";
  try {
    // TODO: si tenés RLS por usuario, filtrá por userId actual
    const { data, error } = await _SUPABASE.from("Seguro")
      .select("idSeguro, asegurado, nroPoliza")
      .order("idSeguro", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
  // Log detallado en consola
  console.groupCollapsed("Error cargando seguros");
  console.error(e);
  if (e && (e.code || e.message || e.details || e.hint)) {
    console.table({
      code: e.code || null,
      message: e.message || null,
      details: e.details || null,
      hint: e.hint || null,
    });
  }
  console.groupEnd();

  // Mensaje visible para el usuario
  const partes = [
    e?.message && `Mensaje: ${e.message}`,
    e?.details && `Detalles: ${e.details}`,
    e?.hint && `Sugerencia: ${e.hint}`,
    e?.code && `Código: ${e.code}`,
  ].filter(Boolean);

  seguroError.textContent =
    partes.join(" · ") || "No se pudieron cargar los seguros.";
  seguroError.style.display = "block";

  return [];
} finally {
    seguroCargando.style.display = "none";
  }
}

// Poblar el <select> con los seguros
function poblarSelectSeguros(lista) {
  selectSeguroAPagar.innerHTML = "";
  const optVacia = document.createElement("option");
  optVacia.value = "";
  optVacia.textContent = "Seleccioná un seguro...";
  selectSeguroAPagar.appendChild(optVacia);
  for (const s of lista) {
    const opt = document.createElement("option");
    opt.value = String(s.idSeguro);
    const desc = [s.nombre, s.tipo].filter(Boolean).join(" – ");
    const costo = (s.costo != null) ? ` ($${s.costo})` : "";
    opt.textContent = `#${s.idSeguro} ${desc}${costo}`;
    selectSeguroAPagar.appendChild(opt);
  }
}

// Cuando se abre el modal de pago: primero elegir seguro
userPagar.addEventListener("click", async () => {
  pagoActual = null;
  metodosPago.style.display = "none";
  btnContinuarPago.disabled = true;
  selectSeguroAPagar.disabled = true;
  pagoModal.style.display = "flex";
  const lista = await cargarSegurosParaPagar();
  poblarSelectSeguros(lista);
  selectSeguroAPagar.disabled = false;
});

// Habilitar continuar cuando haya selección
selectSeguroAPagar?.addEventListener("change", () => {
  btnContinuarPago.disabled = !selectSeguroAPagar.value;
});

// Crear registro en Pago y mostrar métodos
btnContinuarPago?.addEventListener("click", async () => {
  const idSeguroSel = Number(selectSeguroAPagar.value);
  if (!idSeguroSel) return;

  if (!_SUPABASE) {
    alert("No hay cliente Supabase configurado.");
    return;
  }

  // Fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const fechaISO = hoy.toISOString().slice(0, 10);

  try {
    const _SUPABASE = window._SUPABASE_CLIENT;
    const { data, error } = await _SUPABASE
      .from("Pago")
      .insert({
        fechaPago: fechaISO,
        idSeguro: idSeguroSel,
        estado: "iniciado",
        metodoPago: null,
        costo: null
      })
      .select("idPago, idSeguro")
      .single();

    if (error) throw error;
    pagoActual = data;
    // Guardar contexto para las pantallas de pago
    sessionStorage.setItem("pagoActual", JSON.stringify(pagoActual));

    // Ahora mostramos los métodos
    metodosPago.style.display = "block";
    // y deshabilitamos la selección para evitar cambios
    selectSeguroAPagar.disabled = true;
    btnContinuarPago.disabled = true;
  } catch (e) {
  // Log detallado en consola
  console.groupCollapsed("Error cargando el pago");
  console.error(e);
  if (e && (e.code || e.message || e.details || e.hint)) {
    console.table({
      code: e.code || null,
      message: e.message || null,
      details: e.details || null,
      hint: e.hint || null,
    });
  }
  console.groupEnd();

  // Mensaje visible para el usuario
  const partes = [
    e?.message && `Mensaje: ${e.message}`,
    e?.details && `Detalles: ${e.details}`,
    e?.hint && `Sugerencia: ${e.hint}`,
    e?.code && `Código: ${e.code}`,
  ].filter(Boolean);

  seguroError.textContent =
    partes.join(" · ") || "No se pudo cargar el pago.";
  seguroError.style.display = "block";

  return [];
} finally {
    seguroCargando.style.display = "none";
  }
});

// Redirecciones conservando el contexto de pago
if (typeof btnPagarTarjeta !== "undefined") {
  btnPagarTarjeta.addEventListener("click", () => {
    const q = pagoActual ? `?pagoId=${pagoActual.idPago}&seguroId=${pagoActual.idSeguro}` : "";
    window.location.href = "pagoTarjeta.html" + q;
  });
}
if (typeof btnPagarQR !== "undefined") {
  btnPagarQR.addEventListener("click", () => {
    const q = pagoActual ? `?pagoId=${pagoActual.idPago}&seguroId=${pagoActual.idSeguro}` : "";
    window.location.href = "pagoQr.html" + q;
  });
}

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
  window.location.href = "pagoQr.html";
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
