const API_BASE_URL = 'http://burger-api-sandbox.com/auth'; 

/**
 * Obtiene la lista de productos del API.
 * Requiere el access_token guardado en sessionStorage.
 * @returns {Array} Lista de productos.
 */
export async function getProducts() {
    const accessToken = sessionStorage.getItem('access_token');

    if (!accessToken) {
        console.error("Error: No se encontró el access_token en la sesión.");
        // Opcional: Redirigir al login si no hay token
        // window.location.href = 'index.html'; 
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // ✅ ESTE ES EL PASO CLAVE para la autenticación
                'Authorization': `Bearer ${accessToken}` 
            }
        });

        if (!response.ok) {
            // Manejar errores como 401 (No autorizado) o 404
            console.error(`Error al obtener productos: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        // Asumo que tu API devuelve los productos dentro de un campo 'data' o similar,
        // si no, ajusta a 'return data;'
        return data.data || data; 

    } catch (error) {
        console.error('Error de red al conectar con el API de productos:', error);
        return [];
    }
}

