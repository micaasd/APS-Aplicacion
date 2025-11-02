// ===============================
// Conexión a Supabase + Login con MD5
// ===============================

// Importar librerías desde los CDN en el HTML, no aquí

//import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl =  "https://vhkubknqknvqmhpgrljn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoa3Via25xa252cW1ocGdybGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5NjUsImV4cCI6MjA3NDc0NDk2NX0.Mi0a3OqjFWkKoMqhAEfZyOaruoXeesFiaGavafk5yUQ";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Encriptar la contraseña con MD5
        const hashedPassword = CryptoJS.MD5(password).toString();

        console.log("Usuario :", username);
        console.log("Contraseña :", password);

        try {
            // Buscar usuario en Supabase
            const { data, error } = await supabaseClient
                .from("Cuenta") // Nombre de la tabla
                .select("*")
                .ilike("usuario", "laureano")
                .eq('contrase%C3%B1a', password)
                .maybeSingle();

                console.log(data, error );

            if (error) {
                console.error(error);
                alert("Usuario o contraseña incorrectos.");
                return;
            }

            if (data) {
                alert(`Bienvenido ${data.usuario}!`);
                window.location.href = "contrataciones.html";
            } else {
                console.log(data);
                alert("Credenciales incorrectas.");
            }

        } catch (err) {
            console.error("Error en el inicio de sesión:", err);
            alert("Error al conectar con el servidor.");
        }
    });
});
