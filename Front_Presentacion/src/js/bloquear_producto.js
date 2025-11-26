// js/bloquear_producto.js
// Gestión de bloqueo automático cuando stock llega a 0

let currentProductId = null;
let currentAction = 'block';
let hasOutOfStock = false;
let productosCargados = [];
let autoBlockInterval = null;

// Cargar productos desde la API
async function cargarProductos() {
  try {
    console.log('Cargando productos desde la API...');
    const productos = await productAPI.getAll();
    productosCargados = productos;
    renderProductosBloqueo(productos);
    
    // Iniciar verificación automática de stock
    iniciarVerificacionAutomatica();
  } catch (error) {
    console.error('Error cargando productos:', error);
    showToast('Error al cargar productos', 'error');
  }
}

// Renderizar tarjetas de productos con opciones de bloqueo
function renderProductosBloqueo(productos) {
  const container = document.querySelector('.bp-catalogo');
  if (!container) {
    console.error('Contenedor .bp-catalogo no encontrado');
    return;
  }
  
  container.innerHTML = '';

  if (!productos || productos.length === 0) {
    container.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
    return;
  }

  productos.forEach(producto => {
    const isBlocked = producto.blocked === true || producto.blocked === 1;
    const isOutOfStock = producto.stock === 0 || producto.stock === null;
    
    const card = document.createElement('div');
    card.className = `bp-product-card ${isBlocked ? 'bloqueado' : ''} ${isOutOfStock ? 'sin-stock' : ''}`;
    card.setAttribute('data-product-id', producto.id);
    
    card.innerHTML = `
      <div class="bp-product-image">
        <img src="img/Hamburguesas/Burger BBQ.jpeg" alt="${producto.name}" />
      </div>
      <div class="bp-product-info">
        <div class="bp-product-name">${producto.name}</div>
        <div class="bp-product-desc">${producto.description || 'Sin descripción'}</div>
        <div class="bp-product-price">S/ ${formatCurrency(producto.price)}</div>
        <div class="bp-product-stock">Stock: <strong class="${isOutOfStock ? 'stock-cero' : 'stock-ok'}">${producto.stock || 0}</strong></div>
        <div class="bp-status">
          ${isBlocked ? '<span class="badge-blocked">🔒 BLOQUEADO</span>' : '<span class="badge-active">✓ ACTIVO</span>'}
          ${isOutOfStock ? '<span class="badge-stock">⚠️ SIN STOCK</span>' : ''}
        </div>
      </div>
      <div class="bp-product-actions">
        <div class="bp-status-indicator">${isBlocked ? '🔒' : '✔️'}</div>
        <button class="bp-btn ${isBlocked ? 'bp-btn-green' : 'bp-btn-red'}" 
                onclick="abrirPanelBloqueo(${producto.id}, '${producto.name.replace(/'/g, "\\'")}', '${isBlocked ? 'unblock' : 'block'}', ${isOutOfStock})">
          ${isBlocked ? 'Desbloquear Producto' : 'Bloquear Producto'}
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Abrir panel de bloqueo/desbloqueo
function abrirPanelBloqueo(id, name, action, hasStockIssue = false) {
  currentProductId = id;
  currentAction = action;
  hasOutOfStock = hasStockIssue;

  const title = document.getElementById('panelTitle-bp');
  const btn = document.getElementById('confirmActionBtn-bp');
  const label = document.getElementById('reasonLabel-bp');
  const textarea = document.getElementById('blockReason-bp');
  const warning = document.getElementById('warningMessage-bp');
  const error = document.getElementById('reasonError-bp');
  const inputProduct = document.getElementById('selectedProduct-bp');

  document.getElementById('stockErrorContainer-bp').innerHTML = '';

  inputProduct.value = name;
  textarea.value = '';
  error.style.display = 'none';

  if (action === 'block') {
    title.textContent = '🔒 Bloquear Producto';
    btn.textContent = 'Bloquear';
    btn.className = 'bp-btn bp-btn-red';
    label.textContent = 'Motivo del bloqueo';
    label.className = 'required';
    textarea.placeholder = 'Ej: "Falta insumo", "Mantenimiento"';
    warning.innerHTML = `
      <span class="warning-icon-bq">⚠️</span>
      <span>El producto no estará disponible hasta que se desbloquee manualmente.</span>
    `;
  } else {
    title.textContent = '✔️ Desbloquear Producto';
    btn.textContent = 'Desbloquear';
    btn.className = 'bp-btn bp-btn-green';
    label.textContent = 'Motivo del desbloqueo';
    label.className = 'required';
    textarea.placeholder = 'Ej: "Insumos repuestos", "Mantenimiento finalizado"';
    warning.innerHTML = `
      <span class="warning-icon-bq">ℹ️</span>
      <span>El producto volverá a estar disponible en el catálogo del cliente.</span>
    `;
  }

  document.getElementById('blockPanel-bp').style.display = 'block';
}

function closeBlockPanel() {
  document.getElementById('stockErrorContainer-bp').innerHTML = '';
  document.getElementById('blockPanel-bp').style.display = 'none';
}

async function confirmAction() {
  const productName = document.getElementById('selectedProduct-bp').value;
  const reason = document.getElementById('blockReason-bp').value.trim();
  const error = document.getElementById('reasonError-bp');
  const stockErrorContainer = document.getElementById('stockErrorContainer-bp');

  error.style.display = 'none';
  stockErrorContainer.innerHTML = '';

  if (!reason) {
    error.style.display = 'block';
    return;
  }

  try {
    // Determinar nuevo estado bloqueado
    const newBlockedStatus = currentAction === 'block' ? true : false;
    
    // Llamar a la API para cambiar estado del producto
    await productAPI.toggleBlock(currentProductId, newBlockedStatus);
    
    // Mostrar notificación
    showToast(
      `Producto ${newBlockedStatus ? 'bloqueado' : 'desbloqueado'} correctamente`,
      'success'
    );
    
    // Recargar productos
    await cargarProductos();
    closeBlockPanel();
    
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    showToast('Error al cambiar el estado del producto', 'error');
  }
}

// Verificación automática de productos con stock = 0
async function iniciarVerificacionAutomatica() {
  // Limpiar intervalo anterior si existe
  if (autoBlockInterval) clearInterval(autoBlockInterval);
  
  // Verificar cada 30 segundos
  autoBlockInterval = setInterval(async () => {
    await verificarProductosConStockCero();
  }, 30000);
}

// Verificar y bloquear automáticamente productos con stock = 0
async function verificarProductosConStockCero() {
  try {
    const productos = await productAPI.getAll();
    
    for (const producto of productos) {
      const isOutOfStock = producto.stock === 0 || producto.stock === null;
      const isBlocked = producto.blocked === true || producto.blocked === 1;
      
      // Si stock = 0 y no está bloqueado, bloquearlo automáticamente
      if (isOutOfStock && !isBlocked) {
        console.log(`Auto-bloqueando producto: ${producto.name} (Stock: ${producto.stock})`);
        
        try {
          await productAPI.toggleBlock(producto.id, true);
          showToast(`⚠️ ${producto.name} bloqueado automáticamente (Sin stock)`, 'warning');
        } catch (error) {
          console.error(`Error al auto-bloquear ${producto.name}:`, error);
        }
      }
    }
    
    // Actualizar vista
    renderProductosBloqueo(productos);
    
  } catch (error) {
    console.error('Error en verificación automática:', error);
  }
}

// Inicializar cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});