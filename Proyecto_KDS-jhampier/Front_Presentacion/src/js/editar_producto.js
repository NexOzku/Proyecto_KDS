// js/editar_producto.js - SIMPLIFICADO Y MEJORADO
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
    return (parseFloat(value) || 0).toFixed(2);
  }

  // Referencias a elementos del HTML
  const searchInput = document.getElementById('busquedaInput');
  const categoriaFiltro = document.getElementById('categoriaFiltro');
  const listaProductos = document.getElementById('listaProductos');
  const panelEdicion = document.getElementById('panelEdicion');
  const guardarBtn = document.getElementById('guardarBtn');

  // Elementos del formulario
  const inputCodigo = document.getElementById('codigo');
  const inputEstado = document.getElementById('estado');
  const inputNombre = document.getElementById('nombre');
  const inputDescripcion = document.getElementById('descripcion');
  const inputCategoria = document.getElementById('categoria');
  const inputPrecio = document.getElementById('precio');
  const inputStock = document.getElementById('stock');

  // Cargar productos desde la API al iniciar
  async function cargarProductos() {
    try {
      console.log('Cargando productos desde API...');
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

      // Reestructurando el layout para el producto-item (dependerá de tu CSS final)
      // Se asume que el CSS ya maneja .producto-info y .precio-container.

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

      const isBlocked = producto.blocked === true || producto.blocked === 1;
      inputEstado.value = isBlocked ? 'Inactivo' : 'Activo';

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

  // Guardar cambios
  if (guardarBtn) {
    guardarBtn.addEventListener('click', async () => {
      if (!productoEnEdicion) {
        showToast('No hay producto seleccionado', 'error');
        return;
      }

      // Recoger valores del formulario
      const nombre = inputNombre.value.trim();
      const descripcion = inputDescripcion.value.trim();
      const categoryId = parseInt(inputCategoria.value);
      const precio = parseFloat(inputPrecio.value);
      const stock = parseInt(inputStock.value) || 0;
      const estado = inputEstado.value;

      // Validaciones
      if (!nombre || !descripcion || isNaN(categoryId) || isNaN(precio) || precio <= 0) {
        showToast('Por favor, completa todos los campos correctamente', 'error');
        return;
      }
      if (isNaN(stock) || stock < 0) {
        showToast('El Stock debe ser un número entero mayor o igual a cero.', 'error');
        return;
      }

      try {
        // Mapear estado a valor booleano/numérico para la API
        const newBlockedValue = (estado === 'Inactivo' || estado === 'Bloqueado') ? 1 : 0;

        const datosActualizados = {
          name: nombre,
          category_id: categoryId,
          description: descripcion,
          price: precio,
          stock: stock,
          blocked: newBlockedValue,
          // Si tu API necesita la URL de la imagen (aunque no la cambies), inclúyela
          image: productoEnEdicion.image || 'https://burger-api-sandbox.com/default-image.jpg'
        };

        console.log(`Actualizando producto ${productoEnEdicion.id}:`, datosActualizados);

        await productAPI.update(productoEnEdicion.id, datosActualizados);

        showToast('Producto actualizado correctamente', 'success');

        // Recargar productos
        await cargarProductos();

        // Ocultar panel de edición
        panelEdicion.style.display = 'none';

      } catch (error) {
        console.error('Error al actualizar producto:', error);
        showToast(`Error al actualizar: ${error.message || 'Error de conexión/API'}`, 'error');
      }
    });
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