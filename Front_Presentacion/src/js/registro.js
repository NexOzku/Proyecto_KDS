// API Configuration (ya definida en index.js)
// const API_BASE_URL = 'http://burger-api-sandbox.com';
// const REGISTER_ENDPOINT = '/auth/register';

// Get form and input elements
const registerForm = document.getElementById('registerForm');
const registerFirstName = document.getElementById('registerFirstName');
const registerLastName = document.getElementById('registerLastName');
const registerEmail = document.getElementById('registerEmail');
const registerDocType = document.getElementById('registerDocType');
const registerDocument = document.getElementById('registerDocument');
const registerPassword = document.getElementById('registerPassword');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');

// ✅ Validar Nombre
registerFirstName.addEventListener('blur', function() {
  const isValid = this.value.trim().length > 0;
  this.parentElement.classList.toggle('error-active', !isValid);
});

// ✅ Validar Apellido
registerLastName.addEventListener('blur', function() {
  const isValid = this.value.trim().length > 0;
  this.parentElement.classList.toggle('error-active', !isValid);
});

// ✅ Validar Email
registerEmail.addEventListener('blur', function() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(this.value);
  this.parentElement.classList.toggle('error-active', !isValid);
});

// ✅ Validar Tipo de Documento
registerDocType.addEventListener('blur', function() {
  const isValid = this.value !== '';
  this.parentElement.classList.toggle('error-active', !isValid);
});

// ✅ Validar Número de Documento
registerDocument.addEventListener('blur', function() {
  const docRegex = /^[0-9]{6,}$/;
  const isValid = docRegex.test(this.value.replace(/\D/g, ''));
  this.parentElement.classList.toggle('error-active', !isValid);
});

// ✅ Validar Contraseña y mostrar indicador de fuerza
registerPassword.addEventListener('input', function() {
  const password = this.value;
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  // Calcular fortaleza
  let strength = 0;
  if (hasMinLength) strength++;
  if (hasUpperCase) strength++;
  if (hasNumber) strength++;
  
  // Actualizar barra de fortaleza
  const strengthPercentage = (strength / 3) * 100;
  strengthFill.style.width = strengthPercentage + '%';
  
  // Cambiar color según fortaleza
  if (strength === 0) {
    strengthFill.style.backgroundColor = '#ff4444';
    strengthText.textContent = 'Contraseña muy débil';
  } else if (strength === 1) {
    strengthFill.style.backgroundColor = '#ffaa00';
    strengthText.textContent = 'Contraseña débil';
  } else if (strength === 2) {
    strengthFill.style.backgroundColor = '#ffdd00';
    strengthText.textContent = 'Contraseña moderada';
  } else if (strength === 3) {
    strengthFill.style.backgroundColor = '#44dd44';
    strengthText.textContent = 'Contraseña fuerte';
  }
  
  // Habilitar/deshabilitar botón
  checkFormValidity();
});

// ✅ Toggle visibility de contraseña
document.querySelectorAll('.toggle-password-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? '🙈' : '👁️';
  });
});

// ✅ Validar formulario en tiempo real
function checkFormValidity() {
  const firstName = registerFirstName.value.trim().length > 0;
  const lastName = registerLastName.value.trim().length > 0;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.value);
  const docType = registerDocType.value !== '';
  const document = /^[0-9]{6,}$/.test(registerDocument.value.replace(/\D/g, ''));
  const password = registerPassword.value.length >= 8 && 
                   /[A-Z]/.test(registerPassword.value) && 
                   /[0-9]/.test(registerPassword.value);
  
  registerSubmitBtn.disabled = !(firstName && lastName && email && docType && document && password);
}

// ✅ Escuchar cambios en todos los inputs
[registerFirstName, registerLastName, registerEmail, registerDocType, registerDocument, registerPassword].forEach(input => {
  input.addEventListener('input', checkFormValidity);
});

// ✅ Manejar envío del formulario
registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Deshabilitar botón durante envío
  registerSubmitBtn.disabled = true;
  registerSubmitBtn.textContent = 'Registrando...';
  
  try {
    const userData = {
      email: registerEmail.value.trim(),
      password: registerPassword.value,
      first_name: registerFirstName.value.trim(),
      last_name: registerLastName.value.trim(),
      document_type_id: parseInt(registerDocType.value),
      nro_document: registerDocument.value.trim().replace(/\D/g, '')
    };
    
    console.log('Enviando datos:', userData);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('Status:', response.status);
    
    const data = await response.json();
    
    console.log('Response data:', data);
    
    if (response.ok) {
      // Registro exitoso
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      registerForm.reset();
      strengthFill.style.width = '0%';
      strengthText.textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
      
      // Cambiar al panel de login
      document.getElementById('flipper').classList.remove('flipped');
    } else {
      // Error del servidor
      console.error('Error en respuesta:', data);
      alert(`Error: ${data.message || data.detail || 'Error al registrar. Por favor intenta de nuevo.'}`);
    }
  } catch (error) {
    console.error('Error en registro:', error);
    alert('Error de conexión: ' + error.message);
  } finally {
    registerSubmitBtn.disabled = false;
    registerSubmitBtn.textContent = 'Registrar';
    checkFormValidity();
  }
});
