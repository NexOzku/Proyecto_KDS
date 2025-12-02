// js/eliminar_producto.js
document.addEventListener('DOMContentLoaded', async () => {
    const section = document.getElementById('eliminar-producto');
    if (!section) return;

    let productos = [];

    // Referencias a elementos
    const tbodyActive = document.getElementById('tbody-active');
    const tbodyDeleted = document.getElementById('tbody-deleted');

    let productToDelete = null;

    // Cargar productos desde la API
    async function cargarProductos() {
        try {
            console.log('Cargando productos para eliminación...');
            productos = await productAPI.getAll();
            renderTablas();
        } catch (error) {
            console.error('Error cargando productos:', error);
            showToast('Error al cargar productos', 'error');
        }
    }

    // Renderizar tablas de productos activos y eliminados
    function renderTablas() {
        // Limpiar tablas
        if (tbodyActive) tbodyActive.innerHTML = '';
        if (tbodyDeleted) tbodyDeleted.innerHTML = '';

        // Separar activos y eliminados
        const activos = productos.filter(p => !p.deleted);
        const eliminados = productos.filter(p => p.deleted);

        // Renderizar activos
        if (tbodyActive) {
            if (activos.length === 0) {
                tbodyActive.innerHTML = '<tr><td colspan="6" class="no-data">No hay productos activos</td></tr>';
            } else {
                activos.forEach(producto => {
                    const fila = crearFilaProducto(producto, 'active');
                    tbodyActive.appendChild(fila);
                });
            }
        }

        // Renderizar eliminados
        if (tbodyDeleted) {
            if (eliminados.length === 0) {
                tbodyDeleted.innerHTML = '<tr><td colspan="6" class="no-data">No hay productos eliminados</td></tr>';
            } else {
                eliminados.forEach(producto => {
                    const fila = crearFilaProducto(producto, 'deleted');
                    tbodyDeleted.appendChild(fila);
                });
            }
        }
    }

// Mapa de IDs → nombres de categorías
const categoriasMap = {
    1: "burger",
    2: "bebida",
    3: "extra",
    4: "postre",
    6: "pollo",
    7: "pollos y mas"
};

// Función para formatear moneda, necesaria para la fila.
function formatCurrency(value) {
    if (!value) return '0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
}

function crearFilaProducto(producto, estado) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-product-id', producto.id);

    const precioFormato = formatCurrency(producto.price);

    tr.innerHTML = `
        <td><strong>${producto.name}</strong></td>

        <!-- Aquí cambiamos el category_id por el NOMBRE -->
        <td>${categoriasMap[producto.category_id] || 'Sin categoría'}</td>

        <td>S/ ${precioFormato}</td>
        <td>
            ${estado === 'active'
                ? `<button class="btn-delete" onclick="eliminarProducto(${producto.id})">🗑️ Eliminar</button>`
                : ''
            }
        </td>
    `;

    return tr;
}

    // Función global para eliminar producto
    window.eliminarProducto = (productoId) => {
        const producto = productos.find(p => p.id === productoId);
        if (!producto) return;

        if (confirm(`¿Está seguro de que desea eliminar "${producto.name}"?`)) {
            realizarEliminacion(productoId);
        }
    };

    // Función para realizar eliminación
    async function realizarEliminacion(productoId) {
        try {
            console.log(`Eliminando producto ${productoId}...`);

            // Llamar a la API para eliminar
            await productAPI.delete(productoId);

            const producto = productos.find(p => p.id === productoId);
            showToast(`${producto.name} eliminado correctamente`, 'success');

            // Recargar productos
            await cargarProductos();

        } catch (error) {
            console.error('Error al eliminar:', error);
            showToast(`Error al eliminar: ${error.message}`, 'error');
        }
    }

    // Función global para restaurar producto
    window.restaurarProducto = async (productoId) => {
        const producto = productos.find(p => p.id === productoId);
        if (!producto) return;

        try {
            // Marcar como no eliminado
            await productAPI.update(productoId, {
                ...producto,
                deleted: false
            });

            showToast(`${producto.name} restaurado correctamente`, 'success');
            await cargarProductos();

        } catch (error) {
            console.error('Error al restaurar:', error);
            showToast('Error al restaurar producto', 'error');
        }
    };

    // Inicializar
    await cargarProductos();
});