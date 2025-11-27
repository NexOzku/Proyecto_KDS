
// API Configuration y funciones globales
const API_BASE_URL = 'http://burger-api-sandbox.com';
const API_PRODUCTS_ENDPOINT = '/auth/products';

// ✅ Función para obtener token desde sessionStorage
function getAuthToken() {
    const token = sessionStorage.getItem('token') || sessionStorage.getItem('access_token');
    console.log('Token obtenido:', token ? 'Sí' : 'No');
    return token;
}

// ✅ Función para hacer peticiones a la API
async function apiCall(method, endpoint, body = null) {
    const token = getAuthToken();

    // Si no hay token, redirigir a login
    if (!token) {
        console.warn('No hay token de autenticación. Redirigiendo a login...');
        showToast('Sesión expirada. Por favor, inicie sesión nuevamente.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        throw new Error('No hay token de autenticación');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    console.log(`${method} ${API_BASE_URL}${endpoint}`, body || '');

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        // Manejar errores específicos
        if (response.status === 401) {
            console.error('Error 401: Token inválido o expirado');
            sessionStorage.clear();
            showToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            throw new Error('Sesión expirada (401)');
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `Error HTTP ${response.status}` };
            }
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ✅ CRUD Operations for Products
const productAPI = {
    // Crear producto
    create: async (data) => {
        return apiCall('POST', API_PRODUCTS_ENDPOINT, {
            name: data.name || data.nombre,
            description: data.description || data.descripcion,
            price: parseFloat(data.price || data.precio),
            stock: parseInt(data.stock) || 0,
            category_id: parseInt(data.category_id || data.categoria_id)
        });
    },

    // Obtener todos los productos
    getAll: async () => {
        return apiCall('GET', API_PRODUCTS_ENDPOINT);
    },

    // Obtener un producto por ID
    getById: async (id) => {
        return apiCall('GET', `${API_PRODUCTS_ENDPOINT}/${id}`);
    },

    // Actualizar producto
    update: async (id, data) => {
        return apiCall('PUT', `${API_PRODUCTS_ENDPOINT}/${id}`, {
            name: data.name || data.nombre,
            description: data.description || data.descripcion,
            price: parseFloat(data.price || data.precio),
            stock: parseInt(data.stock),
            category_id: parseInt(data.category_id || data.categoria_id)
        });
    },

    // Eliminar producto
    delete: async (id) => {
        // Obtener primero los datos del producto para enviarlos en el DELETE
        try {
            const producto = await productAPI.getById(id);
            if (!producto) throw new Error('Producto no encontrado');

            return apiCall('DELETE', `${API_PRODUCTS_ENDPOINT}/${id}`, {
                name: producto.name,
                category_id: producto.category_id,
                description: producto.description,
                price: producto.price,
                stock: producto.stock
            });
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    // Bloquear/Desbloquear producto
    toggleBlock: async (id, isBlocked) => {
        // Esta función dependerá de tu API
        // Por ahora asumimos que hay un endpoint para esto
        return apiCall('PATCH', `${API_PRODUCTS_ENDPOINT}/${id}/block`, {
            blocked: isBlocked
        });
    }
};

// ✅ Utilidades
function showToast(message, type = 'info') {
    // Crear un toast simple en el DOM
    const container = document.getElementById('toastContainer');
    if (container) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            padding: 12px 16px;
            margin: 8px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;

        if (type === 'success') toast.style.backgroundColor = '#4caf50';
        else if (type === 'error') toast.style.backgroundColor = '#f44336';
        else if (type === 'warning') toast.style.backgroundColor = '#ff9800';
        else toast.style.backgroundColor = '#2196f3';

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ✅ Función para formatear dinero
function formatCurrency(value) {
    if (!value) return '0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
}

// ✅ Función para validar si stock llegó a 0
function checkAndBlockIfNeeded(product) {
    if (product.stock <= 0 && !product.blocked) {
        productAPI.toggleBlock(product.id, true)
            .then(() => {
                showToast(`Producto "${product.name}" bloqueado automáticamente (Stock en 0)`, 'info');
            })
            .catch(err => console.error('Error al bloquear producto:', err));
    }
}