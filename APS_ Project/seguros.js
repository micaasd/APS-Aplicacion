// Script: seguros.js
// Encapsula operaciones CRUD para la tabla Seguro usando Supabase
const SUPABASE_URL = 'https://vhkubknqknvqmhpgrljn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoa3Via25xa252cW1ocGdybGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5NjUsImV4cCI6MjA3NDc0NDk2NX0.Mi0a3OqjFWkKoMqhAEfZyOaruoXeesFiaGavafk5yUQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Obtener todos los seguros
async function fetchSeguros() {
  console.debug('[segurosAPI] fetchSeguros -> querying Supabase');
  const { data, error } = await supabaseClient
    .from('Seguro')
    .select('*')
    .order('idSeguro', { ascending: true });
  console.debug('[segurosAPI] fetchSeguros result', { data, error });
  if (error) throw error;
  return data;
}


// Solicitudes 
async function createSolicitud({ asegurado, nroPoliza, fechaFin }) {
  const payload = { asegurado, nroPoliza, fechaFin, estado: 'pendiente' };
  console.debug('[segurosAPI] createSolicitud payload', payload);
  const { data, error } = await supabaseClient
    .from('Solicitud')
    .insert([payload])
    .select();
  console.debug('[segurosAPI] createSolicitud result', { data, error });
  if (error) throw error;
  return data;
}

// fetch solicitudes pending
async function fetchSolicitudes() {
  console.debug('[segurosAPI] fetchSolicitudes');
  const { data, error } = await supabaseClient
    .from('Solicitud')
    .select('*')
    .order('id', { ascending: true });
  console.debug('[segurosAPI] fetchSolicitudes result', { data, error });
  if (error) throw error;
  return data;
}

// delete solicitud by id
async function deleteSolicitud(id) {
  console.debug('[segurosAPI] deleteSolicitud id', id);
  const { data, error } = await supabaseClient
    .from('Solicitud')
    .delete()
    .eq('id', id)
    .select();
  console.debug('[segurosAPI] deleteSolicitud result', { data, error });
  if (error) throw error;
  return data;
}

// Insertar seguro
async function createSeguro({ asegurado, nroPoliza, fechaFin }) {
  const payload = { asegurado, nroPoliza };
  if (fechaFin) payload.fechaFin = fechaFin;
  console.debug('[segurosAPI] createSeguro payload', payload);
  const { data, error } = await supabaseClient
    .from('Seguro')
    .insert([payload]);
  console.debug('[segurosAPI] createSeguro result', { data, error });
  if (error) throw error;
  return data;
}

// Actualizar seguro por idSeguro
async function updateSeguro(idSeguro, updates) {
  console.debug('[segurosAPI] updateSeguro', { idSeguro, updates });
  // Ensure we return the updated rows and get any errors
  const { data, error } = await supabaseClient
    .from('Seguro')
    .update(updates)
    .eq('idSeguro', idSeguro)
    .select();
  console.debug('[segurosAPI] updateSeguro result', { data, error });
  if (error) throw error;
  return data;
}

// Eliminar seguro por idSeguro
async function deleteSeguro(idSeguro) {
  console.debug('[segurosAPI] deleteSeguro id', idSeguro);
  // include .select() to return deleted rows info when allowed
  const { data, error } = await supabaseClient
    .from('Seguro')
    .delete()
    .eq('idSeguro', idSeguro)
    .select();
  console.debug('[segurosAPI] deleteSeguro result', { data, error });
  if (error) throw error;
  return data;
}

// Expose functions to window for UI scripts
window.segurosAPI = {
  fetchSeguros,
  createSeguro,
  updateSeguro,
  deleteSeguro,
  createSolicitud,
  fetchSolicitudes,
  deleteSolicitud,
};
