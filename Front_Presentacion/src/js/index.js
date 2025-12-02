const $ = (sel) => document.querySelector(sel);


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
    $('#registerSubmitBtn').disabled = true;
    // Restablecer la barra de fuerza de contraseña
    $('#strengthFill').style.width = '0%';
    $('#strengthFill').style.backgroundColor = '';
    $('#strengthText').textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
});


$('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    try {
        const response = await fetch('http://burger-api-sandbox.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // Manejo de credenciales incorrectas (4xx)
        if (!response.ok) {
            // Mostrar el div.error del formulario
            const errorDiv = $('#loginPassword').closest('.form-group').querySelector('.error');
            if (errorDiv) errorDiv.style.display = 'block';
            
            throw new Error("Credenciales incorrectas");
        }
        
        // Ocultar mensaje de error si el login fue exitoso
        const errorDiv = $('#loginPassword').closest('.form-group').querySelector('.error');
        if (errorDiv) errorDiv.style.display = 'none';

        const data = await response.json();
        console.log("Login exitoso:", data);

        // Guardar token y datos del usuario
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // ----------------------------------------------------
        // 🔑 CAMBIO CRUCIAL: CONVERSIÓN A ENTERO CON parseInt()
        // ----------------------------------------------------
        const roleId = data.user ? parseInt(data.user.role_id) : null; 
        
        // 4. Redirección Basada en el Rol
        if (roleId === 1) {
            // Rol ID 1: Administrador
            window.location.href = "admin.html";
            console.log("Redirigiendo a Admin...");
        } else if (roleId === 2) {
            // Rol ID 2: Cliente
            window.location.href = "catalogo.html";
            console.log("Redirigiendo a Catálogo (Cliente)...");
        } else if (roleId === 3) {
            // Rol ID 3: Personal KDS
            window.location.href = "ControlKDS.html";
            console.log("Redirigiendo a Control KDS...");
        } else {
            // Rol no reconocido o faltante (Redirección por defecto)
            console.warn("Rol de usuario no reconocido o faltante:", roleId);
            window.location.href = "catalogo.html";
        }

    } catch (err) {
        console.error("Error al enviar login:", err);
    }
});

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

// ====================================================================
// 1. FUNCIÓN ASÍNCRONA DE REGISTRO (Comunicación con la API)
// ====================================================================
async function register(email, password, first_name, last_name, document_type_id, nro_document) {
  const url = "http://burger-api-sandbox.com/auth/register";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // ¡ACTUALIZACIÓN CRUCIAL AQUÍ!
      // Enviamos la estructura que la API espera (first_name, last_name, document_type_id, nro_document)
      body: JSON.stringify({ 
          email, 
          password, 
          first_name, 
          last_name, 
          document_type_id: parseInt(document_type_id), // Aseguramos que sea un número
          nro_document 
      })
    });

    if (!response.ok) {
        // Intentamos leer el mensaje de error del servidor
        const errorData = await response.json();
        if (errorData && errorData.message) {
             throw new Error(errorData.message);
        }
        throw new Error(`Error en la petición: ${response.status}`); 
    }

    const data = await response.json();
    console.log("Registro exitoso", data);
    return data;
    
  } catch (error) {
    console.error("Error al registrar:", error.message);
    return { error: error.message }; 
  }
}
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Obtener referencias del DOM (¡Nuevas y Actualizadas!)
    const registerForm = document.getElementById('registerForm');
    const registerFirstNameInput = document.getElementById('registerFirstName'); // Nuevo
    const registerLastNameInput = document.getElementById('registerLastName');   // Nuevo
    const documentTypeIdInput = document.getElementById('documentTypeId');       // Nuevo
    const nroDocumentInput = document.getElementById('nroDocument');             // Nuevo
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPhoneInput = document.getElementById('registerPhone');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const togglePasswordBtn = document.querySelector('.toggle-password-btn[data-target="registerPassword"]');
    
    // Referencias al indicador de fuerza
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    // Obtener referencias a los DIVs de error (¡Actualizadas!)
    const firstNameErrorDiv = registerFirstNameInput.closest('.form-group').querySelector('.error');
    const lastNameErrorDiv = registerLastNameInput.closest('.form-group').querySelector('.error');
    const documentTypeIdErrorDiv = documentTypeIdInput.closest('.form-group').querySelector('.error');
    const nroDocumentErrorDiv = nroDocumentInput.closest('.form-group').querySelector('.error');
    const emailErrorDiv = registerEmailInput.closest('.form-group').querySelector('.error');
    const phoneErrorDiv = registerPhoneInput.closest('.form-group').querySelector('.error');
    const passwordErrorDiv = registerPasswordInput.closest('.form-group').querySelector('.error:last-child');
    
    // Array para manejar los estados de error de cada campo
    const errors = { 
        firstName: true, 
        lastName: true, 
        documentType: true,
        nroDocument: true,
        email: true, 
        phone: true, 
        password: true 
    };

    function hideAllErrors() {
        if (firstNameErrorDiv) firstNameErrorDiv.style.display = 'none';
        if (lastNameErrorDiv) lastNameErrorDiv.style.display = 'none';
        if (documentTypeIdErrorDiv) documentTypeIdErrorDiv.style.display = 'none';
        if (nroDocumentErrorDiv) nroDocumentErrorDiv.style.display = 'none';
        if (emailErrorDiv) emailErrorDiv.style.display = 'none';
        if (phoneErrorDiv) phoneErrorDiv.style.display = 'none';
        if (passwordErrorDiv) passwordErrorDiv.style.display = 'none';
    }
    hideAllErrors();

    // --- Funciones de Utilidad ---

    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Carácter especial

        let color = password.length === 0 ? 'gray' : (score === 4 ? 'green' : (score >= 2 ? 'orange' : 'red'));
        let text = password.length === 0 ? 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.' : (score === 4 ? '¡Excelente!' : 'Débil.');
        
        strengthFill.style.width = `${(score / 4) * 100}%`;
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
        
        // Criterio de validación: al menos 8, mayúscula, número (score >= 3)
        return score >= 3; 
    }
    
    function updateSubmitButton() {
        const isFormValid = !Object.values(errors).some(e => e === true);
        if (registerSubmitBtn) registerSubmitBtn.disabled = !isFormValid;
    }

    function validateInput(inputElement, errorDiv, validationFn, errorKey) {
        const value = inputElement.value.trim();
        const isValid = validationFn(value);
        
        if (!isValid) {
            if (errorDiv) errorDiv.style.display = 'block';
            errors[errorKey] = true;
        } else {
            if (errorDiv) errorDiv.style.display = 'none';
            errors[errorKey] = false;
        }
        updateSubmitButton();
        return isValid;
    }

    // --- B. Eventos de Validación al Escribir ---
    
    // Nombre y Apellido (No vacíos)
    registerFirstNameInput.addEventListener('input', () => {
        validateInput(registerFirstNameInput, firstNameErrorDiv, (val) => val.length > 0, 'firstName');
    });
    registerLastNameInput.addEventListener('input', () => {
        validateInput(registerLastNameInput, lastNameErrorDiv, (val) => val.length > 0, 'lastName');
    });
    
    // Tipo de Documento (Selección)
    documentTypeIdInput.addEventListener('change', () => {
        validateInput(documentTypeIdInput, documentTypeIdErrorDiv, (val) => val !== "", 'documentType');
    });

    // Número de Documento (No vacío, se podría añadir más validación)
    nroDocumentInput.addEventListener('input', () => {
        validateInput(nroDocumentInput, nroDocumentErrorDiv, (val) => val.length > 0, 'nroDocument');
    });
    
    // Email (Formato)
    registerEmailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateInput(registerEmailInput, emailErrorDiv, (val) => emailRegex.test(val), 'email');
    });

    // Teléfono (Mínimo 7 dígitos)
    registerPhoneInput.addEventListener('input', () => {
        const phoneRegex = /^\d{7,}$/;
        validateInput(registerPhoneInput, phoneErrorDiv, (val) => phoneRegex.test(val), 'phone');
    });

    // Contraseña (Requisitos de fuerza)
    registerPasswordInput.addEventListener('input', () => {
        const isStrong = checkPasswordStrength(registerPasswordInput.value);
        
        if (!isStrong) {
            if (passwordErrorDiv) passwordErrorDiv.style.display = 'block';
            errors.password = true;
        } else {
            if (passwordErrorDiv) passwordErrorDiv.style.display = 'none';
            errors.password = false;
        }
        updateSubmitButton();
    });

    // C. Manejo del Envío del Formulario (Llamada a la API)
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 1. Re-validación final antes de enviar
        const checks = [
            validateInput(registerFirstNameInput, firstNameErrorDiv, (val) => val.length > 0, 'firstName'),
            validateInput(registerLastNameInput, lastNameErrorDiv, (val) => val.length > 0, 'lastName'),
            validateInput(documentTypeIdInput, documentTypeIdErrorDiv, (val) => val !== "", 'documentType'),
            validateInput(nroDocumentInput, nroDocumentErrorDiv, (val) => val.length > 0, 'nroDocument'),
            validateInput(registerEmailInput, emailErrorDiv, (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'email'),
            validateInput(registerPhoneInput, phoneErrorDiv, (val) => /^\d{7,}$/.test(val), 'phone'),
            checkPasswordStrength(registerPasswordInput.value)
        ];
        
        const isFormValid = checks.every(result => result === true);

        if (isFormValid) {
            registerSubmitBtn.disabled = true; 
            registerSubmitBtn.textContent = 'Registrando...';

            // 2. Extracción de datos
            const first_name = registerFirstNameInput.value.trim();
            const last_name = registerLastNameInput.value.trim();
            const document_type_id = documentTypeIdInput.value;
            const nro_document = nroDocumentInput.value.trim();
            const email = registerEmailInput.value.trim();
            const password = registerPasswordInput.value;
            
            // 3. Llamada a la API
            const result = await register(email, password, first_name, last_name, document_type_id, nro_document);

            // 4. Manejo de Respuesta
            registerSubmitBtn.textContent = 'Registrar';
            registerSubmitBtn.disabled = false;
            
            if (result && !result.error) {
                // ✅ Éxito
                alert('¡Registro exitoso! Ya puedes iniciar sesión.');
                // Redirigir o limpiar formulario
                // window.location.href = '/login'; 
            } else {
                // ❌ Fallo (Error de API: ej. correo duplicado)
                if (passwordErrorDiv) {
                    passwordErrorDiv.textContent = result.error || 'Ocurrió un error inesperado al registrar.';
                    passwordErrorDiv.style.display = 'block';
                }
            }
        } else {
             alert('Por favor, completa todos los campos correctamente.');
        }
    });

});

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




//SINCRONIZA API
let URL="burger-api-sandbox.com"
console.log(URL)