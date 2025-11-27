// ✅ FUNCIÓN DE UTILIDAD: Selector rápido de elementos del DOM
const $ = (sel) => document.querySelector(sel);

// ============================================================================
// 1. MANEJO DE LOS BOTONES "MOSTRAR/OCULTAR CONTRASEÑA"
// ============================================================================
document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Obtiene el ID del campo de contraseña al que afecta este botón
        const targetId = btn.getAttribute('data-target');
        const input = $(`#${targetId}`);
        
        // Alterna entre los tipos 'password' y 'text'
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈'; // Icono para "ocultar"
        } else {
            input.type = 'password';
            btn.textContent = '👁️'; // Icono para "mostrar"
        }
    });
});

// ============================================================================
// 2. CAMBIO ENTRE PANELES: "Iniciar Sesión" <-> "Crear Cuenta"
// ============================================================================
$('#switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    // Esconde el panel de login quitando la clase 'active'
    $('.flip-panel.front').classList.remove('active');
    // Muestra el panel de registro agregando la clase 'active'
    $('.flip-panel.back').classList.add('active');
    
    // Limpia el formulario de login y sus estados de validación
    $('#loginForm').reset();
    document.querySelectorAll('#loginForm .form-group').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
});

$('#switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    // Esconde el panel de registro
    $('.flip-panel.back').classList.remove('active');
    // Muestra el panel de login
    $('.flip-panel.front').classList.add('active');
    
    // Limpia el formulario de registro y sus estados
    $('#registerForm').reset();
    document.querySelectorAll('#registerForm .form-group').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
    // Restablece el estado del botón y la barra de fuerza de la contraseña
    $('#registerSubmitBtn').disabled = true;
    $('#strengthFill').style.width = '0%';
    $('#strengthFill').style.backgroundColor = '';
    $('#strengthText').textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
});

// ============================================================================
// 3. FUNCIÓN ASÍNCRONA DE LOGIN (Comunicación con la API)
// ============================================================================
$('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    // Referencia al botón de envío para dar feedback visual
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Cargando...";

    try {
        const response = await fetch('http://burger-api-sandbox.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // --- 👇 NUEVO: Añadimos un retraso mínimo de 1.5 segundos ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        // --- 👆 FIN DEL RETRASO ---

        // Restablece el botón
        submitButton.disabled = false;
        submitButton.textContent = "Ingresar";

        // Manejo de errores de la API (credenciales incorrectas)
        if (!response.ok) {
            const errorDiv = $('#loginPassword').closest('.form-group').querySelector('.error');
            if (errorDiv) errorDiv.style.display = 'block';
            return; // Salimos de la función si hay error
        }
        
        // Si el login es exitoso, ocultamos el mensaje de error
        const errorDiv = $('#loginPassword').closest('.form-group').querySelector('.error');
        if (errorDiv) errorDiv.style.display = 'none';

        const data = await response.json();
        console.log("Login exitoso:", data);

        // Guardamos los datos de la sesión
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // Redirección basada en el rol del usuario
        const roleId = data.user ? parseInt(data.user.role_id) : null; 
        
        if (roleId === 1) {
            window.location.href = "admin.html";
        } else if (roleId === 2) {
            window.location.href = "catalogo.html";
        } else if (roleId === 3) {
            window.location.href = "ControlKDS.html";
        } else {
            // Redirección por defecto si el rol es desconocido
            window.location.href = "admin.html";
        }

    } catch (err) {
        console.error("Error de red al enviar login:", err);
        // --- 👇 NUEVO: Añadimos el mismo retraso en caso de error ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        // --- 👆 FIN DEL RETRASO ---
        // Restablece el botón en caso de error de red
        submitButton.disabled = false;
        submitButton.textContent = "Ingresar";
    }
});

// ============================================================================
// 4. FUNCIÓN ASÍNCRONA DE REGISTRO (Comunicación con la API)
// ============================================================================
async function register(email, password, first_name, last_name, document_type_id, nro_document) {
    const url = "http://burger-api-sandbox.com/auth/register";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email, 
                password, 
                first_name, 
                last_name, 
                document_type_id: parseInt(document_type_id),
                nro_document 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        console.log("Registro exitoso", data);
        return data;
        
    } catch (error) {
        console.error("Error al registrar:", error.message);
        return { error: error.message }; 
    }
}

// ============================================================================
// 5. VALIDACIÓN Y ENVÍO DEL FORMULARIO DE REGISTRO (Al cargar el DOM)
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- A. Referencias a elementos del DOM ---
    const registerForm = $('#registerForm');
    const registerFirstNameInput = $('#registerFirstName');
    const registerLastNameInput = $('#registerLastName');
    const documentTypeIdInput = $('#documentTypeId');
    const nroDocumentInput = $('#nroDocument');
    const registerEmailInput = $('#registerEmail');
    const registerPhoneInput = $('#registerPhone');
    const registerPasswordInput = $('#registerPassword');
    const registerSubmitBtn = $('#registerSubmitBtn');
    
    // Referencias a los indicadores de fuerza de la contraseña
    const strengthFill = $('#strengthFill');
    const strengthText = $('#strengthText');
    
    // Referencias a los mensajes de error
    const firstNameErrorDiv = registerFirstNameInput.closest('.form-group').querySelector('.error');
    const lastNameErrorDiv = registerLastNameInput.closest('.form-group').querySelector('.error');
    const documentTypeIdErrorDiv = documentTypeIdInput.closest('.form-group').querySelector('.error');
    const nroDocumentErrorDiv = nroDocumentInput.closest('.form-group').querySelector('.error');
    const emailErrorDiv = registerEmailInput.closest('.form-group').querySelector('.error');
    const phoneErrorDiv = registerPhoneInput.closest('.form-group').querySelector('.error');
    const passwordErrorDiv = registerPasswordInput.closest('.form-group').querySelector('.error:last-child');
    
    // Objeto para rastrear el estado de validación de cada campo
    const errors = { 
        firstName: true, lastName: true, documentType: true,
        nroDocument: true, email: true, phone: true, password: true 
    };

    // Función para ocultar todos los mensajes de error al iniciar
    function hideAllErrors() {
        [firstNameErrorDiv, lastNameErrorDiv, documentTypeIdErrorDiv, 
         nroDocumentErrorDiv, emailErrorDiv, phoneErrorDiv, passwordErrorDiv
        ].forEach(div => {
            if (div) div.style.display = 'none';
        });
    }
    hideAllErrors();

    // --- B. Funciones de Utilidad ---
    
        // Referencia al nuevo mensaje dinámico
    const strengthMessageDiv = $('#strengthMessage');

    // --- Funciones de Utilidad ---

    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        let color = 'gray';
        let message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
        let stateClass = 'state-empty';

        if (password.length > 0) {
            if (score === 4) {
                color = 'green';
                message = '¡Excelente!';
                stateClass = 'state-strong';
            } else if (score >= 2) {
                color = 'orange';
                message = 'Media: Casi lista';
                stateClass = 'state-medium';
            } else {
                color = 'red';
                message = 'Débil: Faltan requisitos';
                stateClass = 'state-weak';
            }
        }

        // Actualiza la barra de fuerza
        strengthFill.style.width = `${(score / 4) * 100}%`;
        strengthFill.style.backgroundColor = color;

        // Actualiza el texto y la clase del mensaje
        strengthMessageDiv.textContent = message;
        strengthMessageDiv.className = 'strength-message'; // Limpia las clases anteriores
        strengthMessageDiv.classList.add(stateClass);

        // Actualiza el estado de validación
        return score >= 3; 
    }
    
    // Habilita o deshabilita el botón de registro según la validez del formulario
    function updateSubmitButton() {
        const isFormValid = !Object.values(errors).some(e => e === true);
        registerSubmitBtn.disabled = !isFormValid;
    }

    // Función genérica para validar un campo de entrada
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

    // --- C. Eventos de Validación en Tiempo Real ---
    registerFirstNameInput.addEventListener('input', () => {
        validateInput(registerFirstNameInput, firstNameErrorDiv, (val) => val.length > 0, 'firstName');
    });
    registerLastNameInput.addEventListener('input', () => {
        validateInput(registerLastNameInput, lastNameErrorDiv, (val) => val.length > 0, 'lastName');
    });
    documentTypeIdInput.addEventListener('change', () => {
        validateInput(documentTypeIdInput, documentTypeIdErrorDiv, (val) => val !== "", 'documentType');
    });
    nroDocumentInput.addEventListener('input', () => {
        validateInput(nroDocumentInput, nroDocumentErrorDiv, (val) => val.length > 0, 'nroDocument');
    });
    registerEmailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateInput(registerEmailInput, emailErrorDiv, (val) => emailRegex.test(val), 'email');
    });
    registerPhoneInput.addEventListener('input', () => {
        const phoneRegex = /^\d{7,}$/;
        validateInput(registerPhoneInput, phoneErrorDiv, (val) => phoneRegex.test(val), 'phone');
    });
        // Referencia al nuevo mensaje de error específico para la contraseña
    const registerPasswordErrorDiv = $('#registerPasswordError');

    // Contraseña (Requisitos de fuerza)
        registerPasswordInput.addEventListener('input', () => {
        const password = registerPasswordInput.value;
        const isStrong = checkPasswordStrength(password);
        
        // El estado de validación se maneja directamente en checkPasswordStrength
        errors.password = !isStrong;
        updateSubmitButton();
    });

    // --- D. Manejo del Envío del Formulario de Registro ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Re-validación final de todos los campos
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

            // Envía los datos a la API
            const result = await register(
                registerEmailInput.value.trim(),
                registerPasswordInput.value,
                registerFirstNameInput.value.trim(),
                registerLastNameInput.value.trim(),
                documentTypeIdInput.value,
                nroDocumentInput.value.trim()
            );

            registerSubmitBtn.textContent = 'Registrar';
            registerSubmitBtn.disabled = false;
            
            if (result && !result.error) {
                // Mostrar la alerta personalizada
                const alert = document.getElementById('registerSuccessAlert');
                alert.style.display = 'flex';

                // Ocultar la alerta y cambiar al panel de login después de 1.8 segundos
                setTimeout(() => {
                    alert.style.display = 'none';
                    // Disparar el evento de cambio de panel
                    document.getElementById('switchToLogin').click();
                }, 1800);
            } else {
                // ... manejo de error (se mantiene igual)
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

// ============================================================================
// 6. CONFIGURACIÓN DE LA URL DE LA API (Para futuras referencias)
// ============================================================================
// Nota: Esta variable no se usa en el código actual, pero se mantiene como referencia.
const API_URL = "burger-api-sandbox.com";
console.log("URL de la API:", API_URL);