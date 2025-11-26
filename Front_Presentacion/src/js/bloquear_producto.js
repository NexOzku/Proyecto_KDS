// js/bloquear_producto.js
let currentProductId = null;
let currentAction = 'block';
let hasOutOfStock = false;

function openBlockPanel(id, name, action, hasStockIssue) {
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

  // ✅ Corregido: usa -bp
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
    textarea.placeholder = 'Ej: “Falta insumo”, “Mantenimiento”';
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
    textarea.placeholder = 'Ej: “Insumos repuestos”, “Mantenimiento finalizado”';
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

function confirmAction() {
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

  if (currentAction === 'unblock' && hasOutOfStock) {
    const stockErr = document.createElement('div');
    stockErr.className = 'bp-warning';
    stockErr.textContent = '❌ No se puede desbloquear el producto hasta que todos los insumos estén disponibles.';
    stockErrorContainer.appendChild(stockErr);
    return;
  }

  const card = document.querySelector(`.bp-product-card[data-product-id="${currentProductId}"]`);
  const notifList = document.getElementById('notificationList-bp');

  if (currentAction === 'block') {
    card.querySelector('.bp-status-indicator').textContent = '🔒';
    const btn = card.querySelector('.bp-btn');
    btn.textContent = 'Desbloquear Producto';
    btn.className = 'bp-btn bp-btn-green';
    btn.setAttribute(
      'onclick',
      `openBlockPanel(${currentProductId}, '${productName.replace(/'/g, "\\'")}', 'unblock', ${hasOutOfStock})`
    );
    card.setAttribute('data-has-out-of-stock', 'true');

    const notif = document.createElement('div');
    notif.className = 'bp-notification-item';
    notif.innerHTML = `<span class="bp-notification-dot">🔴</span>
                       <span>Producto ${productName} bloqueado: ${reason}</span>`;
    notifList.prepend(notif);

  } else {
    card.querySelector('.bp-status-indicator').textContent = '✔️';
    const btn = card.querySelector('.bp-btn');
    btn.textContent = 'Bloquear Producto';
    btn.className = 'bp-btn bp-btn-red';
    btn.setAttribute(
      'onclick',
      `openBlockPanel(${currentProductId}, '${productName.replace(/'/g, "\\'")}', 'block', false)`
    );
    card.setAttribute('data-has-out-of-stock', 'false');

    const notif = document.createElement('div');
    notif.className = 'bp-notification-item';
    notif.innerHTML = `<span class="bp-notification-dot">🟢</span>
                       <span>Producto ${productName} desbloqueado: ${reason}</span>`;
    notifList.prepend(notif);
  }

  closeBlockPanel();
}