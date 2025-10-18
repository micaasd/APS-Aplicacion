// Archivo: auth.js
// ADVERTENCIA: Este script usa un método de login inseguro.

// 1. Configuración del cliente de Supabase
const SUPABASE_URL = 'https://vhkubknqknvqmhpgrljn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoa3Via25xa252cW1ocGdybGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5NjUsImV4cCI6MjA3NDc0NDk2NX0.Mi0a3OqjFWkKoMqhAEfZyOaruoXeesFiaGavafk5yUQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Seleccionar elementos del formulario
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessageSpan = document.getElementById('password-error');

// 3. Escuchar el envío del formulario
if (loginForm) {
    console.log("Script cargado y formulario encontrado. Listo para iniciar sesión.");

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageSpan.textContent = '';

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        console.log(`Intentando validar -> Usuario: "${username}", Contraseña: "${password}"`);

        try {
            // La consulta sigue siendo la misma, ya que el '*' selecciona todas las columnas, incluyendo 'role'.
            const { data, error } = await supabase
                .from('Cuenta')
                .select('*') 
                .eq('usuario', username)
                .eq('password', password);

            if (error) {
                console.error("Error devuelto por Supabase:", error.message);
                throw error;
            }

            console.log("Respuesta de Supabase (data):", data);

            if (data && data.length > 0) {
                const user = data[0]; // El primer (y único) usuario coincidente
                
                const userRole = user.role; 
                let redirectUrl;

                if (userRole === 'admin') {
                    console.log("¡Éxito! Rol 'admin'. Redirigiendo a panelEmpleado.html...");
                    redirectUrl = 'panelEmpleado.html';
                } else if (userRole === 'user') {
                    console.log("¡Éxito! Rol 'user'. Redirigiendo a panelUsuario.html...");
                    redirectUrl = 'panelUsuario.html'; 
                } else {
                    // Si el rol no es ni 'admin' ni 'user', mostramos un error y terminamos
                    console.warn(`Rol de usuario no válido (${userRole}).`);
                    errorMessageSpan.textContent = 'Acceso denegado. Rol de usuario no válido.';
                    return; 
                }
                
                window.location.href = redirectUrl;

            } else {
                console.log("Fallo: La consulta no devolvió ningún usuario coincidente.");
                errorMessageSpan.textContent = 'Usuario o contraseña incorrectos.';
            }

        } catch (error) {
            errorMessageSpan.textContent = 'Ocurrió un error. Revisa la consola (F12).';
        }
    });
} else {
    console.error("Error crítico: No se encontró el formulario con id='login-form' en la página.");
}