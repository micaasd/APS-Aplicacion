// seguros.js – Supabase CRUD para Seguros + Asegurado + Bien + Tipos
// (basado en tu archivo previo, ampliado)
// -----------------------------------------------
// Supabase
const SUPABASE_URL = 'https://vhkubknqknvqmhpgrljn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoa3Via25xa252cW1ocGdybGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5NjUsImV4cCI6MjA3NDc0NDk2NX0.Mi0a3OqjFWkKoMqhAEfZyOaruoXeesFiaGavafk5yUQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//publica la constante para que otros scripts puedan usarla
window.supabaseClient = supabaseClient;
window._SUPABASE_CLIENT = supabaseClient; // alias por si mi código lo busca con este nombre
// -----------------------------------------------
// Utils
async function must(ok, msg) {
  if (ok.error) throw new Error(`${msg}: ${ok.error.message || ok.error}`);
  return ok.data;
}

// -----------------------------------------------
// Lecturas existentes
async function fetchSeguros() {
  const { data, error } = await supabaseClient.from('Seguro').select('*').order('idSeguro', { ascending: true });
  if (error) throw error;
  return data;
}

// -----------------------------------------------
// Solicitudes (dejadas por compatibilidad con tu UI)
async function createSolicitud({ asegurado, nroPoliza, fechaFin }) {
  const payload = { asegurado, nroPoliza, fechaFin, estado: 'pendiente' };
  const { data, error } = await supabaseClient.from('Solicitud').insert([payload]).select();
  if (error) throw error;
  return data?.[0];
}
async function fetchSolicitudes() {
  const { data, error } = await supabaseClient.from('Solicitud').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data;
}
async function deleteSolicitud(id) {
  const { data, error } = await supabaseClient.from('Solicitud').delete().eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

// -----------------------------------------------
// Seguro (ya lo tenías)
async function createSeguro({ asegurado, nroPoliza, fechaFin }) {
  const payload = { asegurado, nroPoliza };
  if (fechaFin) payload.fechaFin = fechaFin;
  const { data, error } = await supabaseClient.from('Seguro').insert([payload]).select();
  if (error) throw error;
  return data?.[0]; // { idSeguro, ... }
}
async function updateSeguro(idSeguro, updates) {
  const { data, error } = await supabaseClient.from('Seguro').update(updates).eq('idSeguro', idSeguro).select();
  if (error) throw error;
  return data?.[0];
}
async function deleteSeguro(idSeguro) {
  const { data, error } = await supabaseClient.from('Seguro').delete().eq('idSeguro', idSeguro).select();
  if (error) throw error;
  return data?.[0];
}

// -----------------------------------------------
// NUEVO: Asegurado
async function crearAsegurado({ DNI, nombre, apellido, telefono, direccion }) {
  // Si ya existe ese DNI, devolverlo (idempotente)
  const sel = await supabaseClient.from('Asegurado').select('*').eq('DNI', DNI).maybeSingle();
  if (!sel.error && sel.data) return sel.data; // ya existe

  const ins = await supabaseClient
    .from('Asegurado')
    .insert([{ DNI, nombre, apellido, telefono, direccion }])
    .select()
    .single();
  return must(ins, 'crearAsegurado');
}

// NUEVO: TipoBien (upsert por nombre)
async function upsertTipoBien(nombre) {
  // Buscar si existe
  const q = await supabaseClient.from('TipoBien').select('*').eq('nombre', nombre).maybeSingle();
  if (!q.error && q.data) return q.data; // existe

  // Crear
  const ins = await supabaseClient.from('TipoBien').insert([{ nombre }]).select().single();
  return must(ins, 'upsertTipoBien');
}

// NUEVO: Bien Asegurado (para Auto)
// descripcion se arma con los datos del formulario de auto
async function crearBienAuto({ anio, marca, modelo, version, gnc, usoParticular, nroPoliza = null, montoAsegurado = null }) {
  const descripcion =
    `Auto: Año ${anio}, Marca ${marca}, Modelo ${modelo}, Versión ${version}, ` +
    `GNC: ${gnc}, Uso particular: ${usoParticular ? 'Sí' : 'No'}`;

  const ins = await supabaseClient
    .from('bienAsegurado')
    .insert([{ descripcion, nroPoliza, montoAsegurado }])
    .select()
    .single();
  return must(ins, 'crearBienAuto'); // { idBien, ... }
}

// NUEVO: Relación Tipo_Seguro_Bien
async function crearTipoSeguroBien({ idTipo, idBien, idSeguro }) {
  const ins = await supabaseClient
    .from('Tipo_Seguro_Bien')
    .insert([{ idTipo, idBien, idSeguro }])
    .select()
    .single();
  return must(ins, 'crearTipoSeguroBien');
}

// -----------------------------------------------
// NUEVO: Flujo end-to-end para asegurar AUTO
// - Crea/obtiene Asegurado
// - Crea Bien (Auto)
// - Crea Seguro
// - Asegura TipoBien='auto' y vincula en Tipo_Seguro_Bien
async function asegurarAuto({ asegurado, auto, nroPoliza, fechaFin = null, montoAsegurado = null }) {
  // 1) Asegurado (idempotente por DNI)
  const aseg = await crearAsegurado(asegurado);

  // 2) Bien asegurado (Auto)
  const bien = await crearBienAuto({ ...auto, nroPoliza, montoAsegurado });

  // 3) Seguro
  const seg = await createSeguro({ asegurado: aseg.DNI, nroPoliza, fechaFin }); // columna 'asegurado' referencia DNI

  // 4) Tipo: 'auto' y vínculo Tipo_Seguro_Bien
  const tipo = await upsertTipoBien('auto');
  await crearTipoSeguroBien({ idTipo: tipo.idTipo, idBien: bien.idBien, idSeguro: seg.idSeguro });

  return { asegurado: aseg, bien, seguro: seg, tipo };
}

// -----------------------------------------------
// Exponer API a window
window.segurosAPI = {
  // existentes
  fetchSeguros,
  createSeguro,
  updateSeguro,
  deleteSeguro,
  createSolicitud,
  fetchSolicitudes,
  deleteSolicitud,
  crearAsegurado,
  crearBienAuto,
  upsertTipoBien,
  crearTipoSeguroBien,
  asegurarAuto,
};
