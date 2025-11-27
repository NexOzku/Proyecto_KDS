// js/editar_producto.js - CORREGIDO (Stock único)
(function () {
    // Almacenar productos cargados desde la API
    let productos = [];
    let productoEnEdicion = null;

    // Mapeo de IDs de categoría a Nombres de categoría
    const categoryMap = {
        1: "Hamburguesas",
        2: "Bebidas",
        3: "Postres",
        4: "Acompañamientos"
    };

    // Función auxiliar para formatear la moneda (asumiendo que existe globalmente)
    function formatCurrency(value) {
        // Asegúrate de que esta función exista o añádela si no: 
        // return (parseFloat(value) || 0).toFixed(2);
        return value ? parseFloat(value).toFixed(2) : '0.00';
    }

    // Referencias a elementos del HTML
    const searchInput = document.getElementById('busquedaInput');
    const categoriaFiltro = document.getElementById('categoriaFiltro');
    const listaProductos = document.getElementById('listaProductos');
    const panelEdicion = document.getElementById('panelEdicion');
    const guardarBtn = document.getElementById('guardarBtn');

    // Elementos del formulario
    const inputCodigo = document.getElementById('codigo');
    const inputNombre = document.getElementById('nombre');
    const inputDescripcion = document.getElementById('descripcion');
    const inputCategoria = document.getElementById('categoria');
    const inputPrecio = document.getElementById('precio');
    const inputStock = document.getElementById('stock'); // Referencia única

    // Cargar productos desde la API al iniciar
    async function cargarProductos() {
        try {
            console.log('Cargando productos desde API...');
            // Asume que productAPI.getAll() incluye el campo 'blocked'
            // NOTA: Si productAPI no está definido, el código fallará aquí.
            productos = await productAPI.getAll();
            renderListaProductos(productos);
        } catch (error) {
            console.error('Error cargando productos:', error);
            showToast('Error al cargar productos', 'error');
        }
    }

    // Renderizar lista de productos
    function renderListaProductos(items) {
        listaProductos.innerHTML = '';

        if (!items || items.length === 0) {
            listaProductos.innerHTML = '<p class="no-productos">No hay productos disponibles</p>';
            return;
        }

        items.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'producto-item';
            item.setAttribute('data-id', producto.id);

            // Renderizar estado (Bloqueado/Activo) basado en el campo 'blocked' de la API
            const isBlocked = producto.blocked === true || producto.blocked === 1;
            const estadoBadge = isBlocked
                ? '<span class="badge blocked">🔒 Bloqueado</span>'
                : '<span class="badge active">✓ Activo</span>';

            const categoriaNombre = categoryMap[producto.category_id] || 'Sin categoría';

            item.innerHTML = `
                <div class="producto-info">
                    <h4>${producto.name}</h4>
                    <p class="categoria">${categoriaNombre}</p>
                </div>
                <div class="precio-container">
                    <p class="precio">S/ ${formatCurrency(producto.price)}</p>
                    ${estadoBadge}
                </div>
                <button class="btn-select">Editar</button>
            `;

            // Manejador para seleccionar el producto
            item.querySelector('.btn-select').addEventListener('click', (e) => {
                e.stopPropagation();
                cargarProducto(producto.id);
            });

            listaProductos.appendChild(item);
        });
    }

    // Cargar y mostrar detalles de un producto
    async function cargarProducto(productoId) {
        try {
            const producto = await productAPI.getById(productoId);

            if (!producto) {
                showToast('No se pudo cargar el producto', 'error');
                return;
            }

            productoEnEdicion = { ...producto };

            // Llenar formulario de edición
            inputCodigo.value = producto.id || '';
            inputNombre.value = producto.name || '';
            inputDescripcion.value = producto.description || '';
            inputCategoria.value = producto.category_id || '';
            inputPrecio.value = producto.price || '';
            inputStock.value = producto.stock === undefined ? 0 : producto.stock;

            // Mostrar panel de edición
            panelEdicion.style.display = 'block';

            // Marcar item como seleccionado
            document.querySelectorAll('.producto-item').forEach(item => {
                item.classList.remove('selected');
            });
            const selectedItem = document.querySelector(`[data-id="${productoId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }

        } catch (error) {
            console.error('Error cargando producto:', error);
            showToast('Error al cargar producto', 'error');
        }
    }



    // Búsqueda y Filtro (Manejo de eventos)
    if (searchInput) {
        searchInput.addEventListener('input', filtrarProductos);
    }

    if (categoriaFiltro) {
        categoriaFiltro.addEventListener('change', filtrarProductos);
    }

    // Función de filtrado
    function filtrarProductos() {
        const termino = (searchInput?.value || '').toLowerCase();
        const categoriaId = categoriaFiltro?.value ? parseInt(categoriaFiltro.value) : null;

        const filtrados = productos.filter(p => {
            const coincideNombre = p.name.toLowerCase().includes(termino) ||
                (p.description && p.description.toLowerCase().includes(termino));
            const coincideCategoria = !categoriaId || p.category_id === categoriaId;

            return coincideNombre && coincideCategoria;
        });

        renderListaProductos(filtrados);
    }

    // Inicializar
    cargarProductos();
})();