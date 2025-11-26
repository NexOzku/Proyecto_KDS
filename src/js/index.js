const $ = (sel) => document.querySelector(sel);

// ✅Toggle contraseña (solo tu ícono)
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

// ✅Flip 3D + limpiar formularios al cambiar
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

// ✅Volver al login
$('#switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    $('#flipper').classList.remove('flipped');
    // Limpiar formulario de registro
    $('#registerForm').reset();
    // Quitar clases de validación y restablecer botón
    document.querySelectorAll('#registerForm .form-group').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
    $('#registerSubmitBtn').disabled = true;
    // Restablecer la barra de fuerza de contraseña
    $('#strengthFill').style.width = '0%';
    $('#strengthFill').style.backgroundColor = '';
    $('#strengthText').textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
});

// ✅Validación registro
const registerFields = {
    name: $('#registerName'),
    email: $('#registerEmail'),
    phone: $('#registerPhone'),
    password: $('#registerPassword')
};

// ✅Función para validar contraseña
function validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

// ✅Función para actualizar la barra de fuerza de contraseña
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

// ✅Agregar event listeners para validación en tiempo real
Object.values(registerFields).forEach(field => {
    field.addEventListener('input', () => {
        const group = field.closest('.form-group');
        group.classList.remove('invalid', 'valid');

        let valid = false;
        if (field === registerFields.name) valid = field.value.trim() !== '';
        else if (field === registerFields.email) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        else if (field === registerFields.phone) valid = field.value.replace(/\D/g, '').length >= 7;
        else if (field === registerFields.password) {
            valid = validatePassword(field.value);
            updatePasswordStrength(field.value);
        }

        if (field.value.trim() !== '') {
            group.classList.add(valid ? 'valid' : 'invalid');
        }

        const allValid = Object.values(registerFields).every(f =>
            f.value.trim() !== '' &&
            ((f === registerFields.name && f.value.trim() !== '') ||
                (f === registerFields.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) ||
                (f === registerFields.phone && f.value.replace(/\D/g, '').length >= 7) ||
                (f === registerFields.password && validatePassword(f.value)))
        );
        $('#registerSubmitBtn').disabled = !allValid;
    });
});

// ✅Cuentas predeterminadas
const PREDEFINED_USERS = {
    'usuario@dartkitchen.com': { password: '123456', redirect: 'catalogo.html' },
    'admin@dartkitchen.com': { password: '123456', redirect: 'admin.html' },
    'kds@dartkitchen.com': { password: '123456', redirect: 'KDS.html' }
};

// ✅Manejo de envíos de formularios
$('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    const user = PREDEFINED_USERS[email];
    const passGroup = $('#loginPassword').closest('.form-group');
    passGroup.classList.remove('invalid');

    if (user && user.password === password) {
        window.location.href = user.redirect;
    } else {
        passGroup.classList.add('invalid');
    }
});

// ✅Manejo de envío de registro
$('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Registro exitoso!');
    $('#flipper').classList.remove('flipped');
});

