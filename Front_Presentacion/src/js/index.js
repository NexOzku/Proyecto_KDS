const $ = (sel) => document.querySelector(sel);

// API Configuration
const API_BASE_URL = 'http://burger-api-sandbox.com';
const LOGIN_ENDPOINT = '/auth/login';

// ✅ Toggle visibility de contraseña
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

// ✅ Cambiar a panel de registro
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

// ✅ Cambiar a panel de login
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

// ✅ Validación de Login
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
        alert("Error: " + err.message);
    }
});
