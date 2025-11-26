const $ = (sel) => document.querySelector(sel);

// API Configuration
const API_BASE_URL = 'http://burger-api-sandbox.com';
const LOGIN_ENDPOINT = '/auth/login';


document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = $(`#${targetId}`);
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    });
});

$('#switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    $('#flipper').classList.add('flipped');
    // Limpiar formulario de inicio de sesión
    $('#loginForm').reset();
    // Quitar clases de validación
    document.querySelectorAll('#loginForm .form-group').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
});


$('#switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    $('#flipper').classList.remove('flipped');
    // Limpiar formulario de registro
    $('#registerForm').reset();
    // Quitar clases de validación y restablecer botón
    document.querySelectorAll('#registerForm .form-group').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
    const submitBtn = $('#registerSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;
    // Restablecer la barra de fuerza de contraseña
    const strengthFill = $('#strengthFill');
    if (strengthFill) {
        strengthFill.style.width = '0%';
        strengthFill.style.backgroundColor = '';
    }
    const strengthText = $('#strengthText');
    if (strengthText) strengthText.textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
});

// ✅Validación registro
const registerFields = {
    firstName: $('#registerFirstName'),
    lastName: $('#registerLastName'),
    email: $('#registerEmail'),
    docType: $('#registerDocType'),
    document: $('#registerDocument'),
    password: $('#registerPassword')
};

function validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

function updatePasswordStrength(password) {
    const strength = (password.length >= 8 ? 1 : 0) +
        (/[A-Z]/.test(password) ? 1 : 0) +
        (/\d/.test(password) ? 1 : 0);
    const fill = $('#strengthFill');
    const text = $('#strengthText');
    const colors = ['#f44336', '#ff9800', '#4caf50'];
    const messages = [
        'Débil: faltan requisitos',
        'Media: casi lista',
        'Fuerte: cumple todos los requisitos'
    ];
    fill.style.width = `${(strength / 3) * 100}%`;
    fill.style.backgroundColor = colors[strength - 1] || '#f44336';
    text.textContent = messages[strength - 1] || 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
}

Object.values(registerFields).forEach(field => {
    if (!field) return; // Saltar si el elemento no existe
    
    field.addEventListener('input', () => {
        const group = field.closest('.form-group');
        group.classList.remove('invalid', 'valid');

        let valid = false;
        if (field === registerFields.firstName) valid = field.value.trim() !== '';
        else if (field === registerFields.lastName) valid = field.value.trim() !== '';
        else if (field === registerFields.email) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        else if (field === registerFields.docType) valid = field.value !== '';
        else if (field === registerFields.document) valid = field.value.replace(/\D/g, '').length >= 6;
        else if (field === registerFields.password) {
            valid = validatePassword(field.value);
            updatePasswordStrength(field.value);
        }

        if (field.value.trim() !== '') {
            group.classList.add(valid ? 'valid' : 'invalid');
        }

        const allValid = registerFields.firstName && registerFields.firstName.value.trim() !== '' &&
                        registerFields.lastName && registerFields.lastName.value.trim() !== '' &&
                        registerFields.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerFields.email.value) &&
                        registerFields.docType && registerFields.docType.value !== '' &&
                        registerFields.document && registerFields.document.value.replace(/\D/g, '').length >= 6 &&
                        registerFields.password && validatePassword(registerFields.password.value);
        
        const submitBtn = $('#registerSubmitBtn');
        if (submitBtn) submitBtn.disabled = !allValid;
    });
});

$('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Credenciales incorrectas");
        }

        const data = await response.json();
        console.log("Login exitoso:", data);

        // Guardar token
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // Redirigir al dashboard
        window.location.href = "catalogo.html";

    } catch (err) {
        console.error("Error al enviar login:", err);
    }
});


//Funcion que sincroniza las APIS
async function login(email, password) {
  const url = `${API_BASE_URL}${LOGIN_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      // Capturamos el error HTTP para poder manejarlo mejor
      throw new Error("Error en la petición: ${response.status}");
    }

    const data = await response.json();

    // Guardar access_token en sessionStorage
    sessionStorage.setItem("access_token", data.access_token);

    console.log("Login exitoso", data);
    return data;
  } catch (error) {
    console.error("Error al hacer login:", error);
    return null;
  }
}


// --- Lógica para manejar el envío del formulario ---

// Obtener el formulario por su ID
const loginForm = document.getElementById('loginForm');
// Obtener los inputs para acceder a sus valores
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');

// Agregar un escuchador de eventos para el envío del formulario
loginForm.addEventListener('submit', async function(event) {
    // Prevenir el comportamiento por defecto (la recarga de página)
    event.preventDefault();

    // Obtener los valores de los inputs
    const email = emailInput.value;
    const password = passwordInput.value;

    // Opcional: Manejo del estado del botón
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Cargando...";

    // Llamar a la función de login
    const result = await login(email, password);

    // Volver a activar el botón
    submitButton.disabled = false;
    submitButton.textContent = "Ingresar";

    if (result) {
        // Si el login fue exitoso, puedes redirigir
        console.log("¡Login exitoso! Redirigiendo...");
        // window.location.href = "/bienvenido.html"; 
    } else {
        // Si falló, mostrar el mensaje de error del formulario (ajusta el selector según tu CSS)
        // Ejemplo de cómo mostrar el mensaje de error general
        const errorDiv = loginForm.querySelector('.form-group:nth-child(2) .error');
        if (errorDiv) {
            errorDiv.style.display = 'block'; // Asumiendo que por defecto está oculto
        }
    }
});