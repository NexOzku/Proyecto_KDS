(function () {
  // Almacenar productos cargados desde la API
  let productos = [];
  let productoEnEdicion = null;

  // Referencias a elementos del HTML
  const searchInput = document.getElementById('busquedaInput');
  const categoriaFiltro = document.getElementById('categoriaFiltro');
  const listaProductos = document.getElementById('listaProductos');
  const panelEdicion = document.getElementById('panelEdicion');
  const guardarBtn = document.getElementById('guardarBtn');
  const mensaje = document.getElementById('mensaje');

  // Elementos del formulario
  const inputCodigo = document.getElementById('codigo');
  const inputEstado = document.getElementById('estado');
  const inputNombre = document.getElementById('nombre');
  const inputDescripcion = document.getElementById('descripcion');
  const inputCategoria = document.getElementById('categoria');
  const inputPrecio = document.getElementById('precio');

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

      item.innerHTML = `
        <div class="producto-info">
          <h4>${producto.name}</h4>
          <p class="categoria">${producto.category_id || 'Sin categoría'}</p>
          <p class="precio">S/ ${formatCurrency(producto.price)}</p>
          ${estadoBadge}
        </div>
        <button class="btn-select">Editar</button>
      `;

      item.addEventListener('click', () => {
        cargarProducto(producto.id);
      });

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
      inputEstado.value = producto.blocked ? 'Inactivo' : 'Activo';

      // Mostrar panel de edición
      panelEdicion.style.display = 'block';

      // Marcar item como seleccionado
      document.querySelectorAll('.producto-item').forEach(item => {
        item.classList.remove('selected');
      });
      document.querySelector(`[data-id="${productoId}"]`).classList.add('selected');

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

      const nombre = inputNombre.value.trim();
      const descripcion = inputDescripcion.value.trim();
      const categoria = inputCategoria.value;
      const precio = parseFloat(inputPrecio.value);
      const estado = inputEstado.value;

      // Validaciones
      if (!nombre || !descripcion || !categoria || isNaN(precio) || precio <= 0) {
        showToast('Por favor, completa todos los campos correctamente', 'error');
        return;
      }

      try {
        const datosActualizados = {
          name: nombre,
          category_id: parseInt(categoria),
          description: descripcion,
          price: precio
        };

        console.log('Actualizando producto:', productoEnEdicion.id, datosActualizados);

        await productAPI.update(productoEnEdicion.id, datosActualizados);

        showToast('Producto actualizado correctamente', 'success');

        // Recargar productos
        await cargarProductos();

        // Limpiar panel
        panelEdicion.style.display = 'none';

      } catch (error) {
        console.error('Error al actualizar producto:', error);
        showToast(`Error al actualizar: ${error.message}`, 'error');
      }
    });
  }

  // Búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filtrarProductos();
    });
  }

  // Filtro de categoría
  if (categoriaFiltro) {
    categoriaFiltro.addEventListener('change', (e) => {
      filtrarProductos();
    });
  }

  // Función de filtrado
  function filtrarProductos() {
    const termino = (searchInput?.value || '').toLowerCase();
    const categoria = categoriaFiltro?.value || '';

    const filtrados = productos.filter(p => {
      const coincideNombre = p.name.toLowerCase().includes(termino) ||
                            (p.description && p.description.toLowerCase().includes(termino));
      const coincideCategoria = !categoria || p.category_id === parseInt(categoria);
      
      return coincideNombre && coincideCategoria;
    });

    renderListaProductos(filtrados);
  }

  // Inicializar
  cargarProductos();
})();