// empleados.js (FIX) — lista/CRUD usando solo columnas existentes

const SUPABASE_URL = window.SUPABASE_URL || 'https://vhkubknqknvqmhpgrljn.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoa3Via25xa252cW1ocGdybGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5NjUsImV4cCI6MjA3NDc0NDk2NX0.Mi0a3OqjFWkKoMqhAEfZyOaruoXeesFiaGavafk5yUQ';

const supabaseClient =
  window._SUPABASE_CLIENT ||
  window.supabaseClient ||
  window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window._SUPABASE_CLIENT = supabaseClient;
window.supabaseClient = supabaseClient;

// Helpers UI
function nombreCompleto(row) {
  const n = row?.Nombre ?? row?.nombre ?? '';
  const a = row?.Apellido ?? row?.apellido ?? '';
  return `${String(n).trim()} ${String(a).trim()}`.trim();
}
function leerSector(row) {
  // por ahora tu tabla no lo tiene; devolvemos vacío
  return row?.Sector ?? row?.sector ?? row?.sector_nombre ?? '';
}
function leerCargo(row) {
  return row?.Rol ?? row?.rol ?? row?.cargo ?? row?.cargo_nombre ?? '';
}

// ----------- Lecturas -----------
async function fetchEmpleados() {
  const { data, error } = await supabaseClient
    .from('Empleado')   // nombre exacto
    .select('*')        // SELECT *
    .order('id', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function fetchEmpleadoById(id) {
  const { data, error } = await supabaseClient
    .from('Empleado')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function searchEmpleados(texto) {
  const t = (texto || '').trim();
  if (!t) return fetchEmpleados();
  // Buscamos solo por columnas que existen seguro: Nombre, Apellido, DNI
  const { data, error } = await supabaseClient
    .from('Empleado')
    .select('*')
    .or(`Nombre.ilike.%${t}%,Apellido.ilike.%${t}%,DNI.ilike.%${t}%`)
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ----------- Altas / Cambios / Bajas -----------
// CREATE
async function createEmpleado(payload) {
  const { data, error } = await supabaseClient
    .from('Empleado')
    .insert([payload])        // INSERT
    .select();                // devuelve array

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// UPDATE (por id)
async function updateEmpleado(id, updates) {
  const { data, error } = await supabaseClient
    .from('Empleado')
    .update(updates)
    .eq('id', id)
    .select();                // devuelve array (0 o 1 fila esperado)

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// DELETE (por id)
async function deleteEmpleado(id) {
  const { data, error } = await supabaseClient
    .from('Empleado')
    .delete()
    .eq('id', id)
    .select();                // array con la(s) fila(s) borrada(s)

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}


// API pública
window.empleadosAPI = {
  fetchEmpleados,
  fetchEmpleadoById,
  searchEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  nombreCompleto,
  leerSector,
  leerCargo,
};
