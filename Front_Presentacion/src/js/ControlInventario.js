
// ControlInventario.js - extraído de ControlInventario.html
// Base de datos simulada
let inventory = {
    'carne_res': { name: 'Carne de Res', stock: 50, minStock: 10, maxStock: 100, unit: 'kg', cost: 25.00, blocked: false },
    'pollo': { name: 'Pollo', stock: 30, minStock: 8, maxStock: 80, unit: 'kg', cost: 15.00, blocked: false },
    'queso': { name: 'Queso', stock: 5, minStock: 5, maxStock: 50, unit: 'kg', cost: 18.00, blocked: false },
    'tomate': { name: 'Tomate', stock: 20, minStock: 5, maxStock: 40, unit: 'kg', cost: 3.50, blocked: false },
    'lechuga': { name: 'Lechuga', stock: 2, minStock: 3, maxStock: 25, unit: 'kg', cost: 4.00, blocked: false },
    'pan': { name: 'Pan', stock: 0, minStock: 10, maxStock: 100, unit: 'unidades', cost: 0.50, blocked: false },
    'papas': { name: 'Papas', stock: 35, minStock: 10, maxStock: 60, unit: 'kg', cost: 2.80, blocked: false },
    'aceite': { name: 'Aceite', stock: 8, minStock: 5, maxStock: 30, unit: 'litros', cost: 12.00, blocked: false },
    'sal': { name: 'Sal', stock: 15, minStock: 2, maxStock: 20, unit: 'kg', cost: 1.50, blocked: false },
    'cebolla': { name: 'Cebolla', stock: 12, minStock: 5, maxStock: 30, unit: 'kg', cost: 2.20, blocked: false }
};

let products = {
    'hamburguesa_clasica': {
        name: 'Hamburguesa Clásica',
        price: 18.50,
        ingredients: {
            'carne_res': 0.2,
            'queso': 0.05,
            'tomate': 0.03,
            'lechuga': 0.02,
            'pan': 1,
            'cebolla': 0.02
        },
        available: true
    },
    'pollo_parrilla': {
        name: 'Pollo a la Parrilla',
        price: 22.00,
        ingredients: {
            'pollo': 0.3,
            'papas': 0.2,
            'aceite': 0.02,
            'sal': 0.005
        },
        available: true
    },
    'papas_fritas': {
        name: 'Papas Fritas',
        price: 8.50,
        ingredients: {
            'papas': 0.25,
            'aceite': 0.05,
            'sal': 0.002
        },
        available: true
    },
    'sandwich_pollo': {
        name: 'Sandwich de Pollo',
        price: 16.00,
        ingredients: {
            'pollo': 0.15,
            'pan': 1,
            'tomate': 0.02,
            'lechuga': 0.01
        },
        available: true
    }
};

let activities = [];

function getStockStatus(item) {
    if (item.blocked) return 'blocked';
    if (item.stock === 0) return 'out';
    if (item.stock <= item.minStock) return 'low';
    return 'available';
}

function getStockPercentage(item) {
    return Math.min((item.stock / item.maxStock) * 100, 100);
}

function addActivity(message, type = 'info') {
    const activity = {
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date()
    };
    activities.unshift(activity);

    // Mantener solo los últimos 50 registros
    if (activities.length > 50) {
        activities = activities.slice(0, 50);
    }

    renderActivities();
}

function renderInventory() {
    const container = document.getElementById('inventoryGrid');
    container.innerHTML = '';

    Object.entries(inventory).forEach(([key, item]) => {
        const status = getStockStatus(item);
        const percentage = getStockPercentage(item);

        const card = document.createElement('div');
        card.className = `item-card ${status === 'low' ? 'low-stock' : ''} ${status === 'out' ? 'out-of-stock' : ''} ${status === 'blocked' ? 'blocked' : ''}`;

        let statusClass, statusText;
        switch (status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'Disponible';
                break;
            case 'low':
                statusClass = 'status-low';
                statusText = 'Stock Bajo';
                break;
            case 'out':
                statusClass = 'status-out';
                statusText = 'Agotado';
                break;
            case 'blocked':
                statusClass = 'status-blocked';
                statusText = 'Bloqueado';
                break;
        }

        let stockFillClass;
        if (percentage > 70) stockFillClass = 'stock-high';
        else if (percentage > 30) stockFillClass = 'stock-medium';
        else stockFillClass = 'stock-low';

        card.innerHTML = `
            <div class="item-header">
                <div class="item-name">${item.name}</div>
                <div class="item-status ${statusClass}">${statusText}</div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <span>Stock Actual:</span>
                    <strong>${item.stock} ${item.unit}</strong>
                </div>
                <div class="detail-item">
                    <span>Stock Mínimo:</span>
                    <span>${item.minStock} ${item.unit}</span>
                </div>
                <div class="detail-item">
                    <span>Costo Unitario:</span>
                    <span>S/ ${item.cost.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <span>Valor Total:</span>
                    <strong>S/ ${(item.stock * item.cost).toFixed(2)}</strong>
                </div>
            </div>
            <div class="stock-bar">
                <div class="stock-fill ${stockFillClass}" style="width: ${percentage}%"></div>
            </div>
            <div class="item-actions">
                <button class="action-btn restock-btn" onclick="quickRestock('${key}')">
                    📦 Reponer
                </button>
                ${item.blocked ?
                `<button class="action-btn unblock-btn" onclick="toggleBlock('${key}')">
                        ✅ Desbloquear
                    </button>` :
                `<button class="action-btn block-btn" onclick="toggleBlock('${key}')">
                        🚫 Bloquear
                    </button>`
            }
            </div>
        `;

        container.appendChild(card);
    });
}

function renderProducts() {
    const container = document.getElementById('productGrid');
    container.innerHTML = '';

    Object.entries(products).forEach(([key, product]) => {
        const availability = checkProductAvailability(key);
        const card = document.createElement('div');
        card.className = `product-card ${!availability.available ? 'unavailable' : ''}`;

        card.innerHTML = `
            <div class="product-header">
                <div class="product-name">${product.name}</div>
                <div class="product-price">S/ ${product.price.toFixed(2)}</div>
            </div>
            <div class="product-ingredients">
                ${Object.entries(product.ingredients).map(([ingredientKey, quantity]) => {
            const ingredient = inventory[ingredientKey];
            const hasStock = ingredient.stock >= quantity && !ingredient.blocked;
            const statusClass = hasStock ? 'ingredient-ok' : (ingredient.stock < quantity ? 'ingredient-out' : 'ingredient-low');
            const statusText = hasStock ? 'OK' : (ingredient.stock < quantity ? 'Sin stock' : 'Bloqueado');

            return `
                        <div class="ingredient">
                            <span>${ingredient.name} (${quantity} ${ingredient.unit})</span>
                            <span class="ingredient-status ${statusClass}">${statusText}</span>
                        </div>
                    `;
        }).join('')}
            </div>
            <div class="product-actions">
                <button class="order-btn" ${!availability.available ? 'disabled' : ''} 
                        onclick="orderProduct('${key}')" 
                        ${!availability.available ? 'title="Producto no disponible"' : ''}>
                    ${availability.available ? '🛒 Ordenar' : '❌ No Disponible'}
                </button>
            </div>
            ${!availability.available ?
                `<div style="color: #dc3545; font-size: 0.9em; margin-top: 10px; text-align: center;">
                    <strong>Motivo:</strong> ${availability.reason}
                </div>` : ''
            }
        `;

        container.appendChild(card);
    });
}

function checkProductAvailability(productKey) {
    const product = products[productKey];

    for (const [ingredientKey, requiredQuantity] of Object.entries(product.ingredients)) {
        const ingredient = inventory[ingredientKey];

        if (ingredient.blocked) {
            return { available: false, reason: `${ingredient.name} está bloqueado` };
        }

        if (ingredient.stock < requiredQuantity) {
            return { available: false, reason: `Sin stock de ${ingredient.name}` };
        }
    }

    return { available: true, reason: '' };
}

function orderProduct(productKey) {
    const product = products[productKey];
    const availability = checkProductAvailability(productKey);

    if (!availability.available) {
        showLeftTopNotification(`❌ No se puede ordenar: ${availability.reason}`, 'error');
        return;
    }

    // Descontar ingredientes del inventario
    Object.entries(product.ingredients).forEach(([ingredientKey, quantity]) => {
        inventory[ingredientKey].stock -= quantity;
        inventory[ingredientKey].stock = Math.max(0, inventory[ingredientKey].stock);
    });

    addActivity(`🛒 Pedido procesado: ${product.name}`, 'info');

    // Verificar si algún ingrediente se agotó
    Object.entries(product.ingredients).forEach(([ingredientKey, quantity]) => {
        const ingredient = inventory[ingredientKey];
        if (ingredient.stock === 0) {
            addActivity(`⚠️ ALERTA: ${ingredient.name} se ha agotado`, 'danger');
            autoBlockProducts(ingredientKey);
        } else if (ingredient.stock <= ingredient.minStock) {
            addActivity(`⚠️ Stock bajo: ${ingredient.name} (${ingredient.stock} ${ingredient.unit})`, 'warning');
        }
    });

    updateAll();
    showLeftTopNotification(`✅ Pedido procesado: ${product.name}`, 'success');
}

function autoBlockProducts(ingredientKey) {
    const ingredient = inventory[ingredientKey];
    let blockedProducts = [];

    Object.entries(products).forEach(([productKey, product]) => {
        if (product.ingredients[ingredientKey] && product.available) {
            blockedProducts.push(product.name);
        }
    });

    if (blockedProducts.length > 0) {
        addActivity(`🚫 Productos bloqueados automáticamente por falta de ${ingredient.name}: ${blockedProducts.join(', ')}`, 'danger');
    }
}

function simulateOrder() {
    const availableProducts = Object.entries(products).filter(([key, product]) =>
        checkProductAvailability(key).available
    );

    if (availableProducts.length === 0) {
        showLeftTopNotification('❌ No hay productos disponibles para ordenar', 'error');
        return;
    }

    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    orderProduct(randomProduct[0]);
    showLeftNotification(`🛒 Pedido simulado correctamente`, 'success');
}

function quickRestock(itemKey) {
    const item = inventory[itemKey];
    const restockAmount = Math.ceil((item.maxStock - item.stock) / 2);

    inventory[itemKey].stock += restockAmount;
    inventory[itemKey].stock = Math.min(inventory[itemKey].stock, item.maxStock);

    if (item.blocked && inventory[itemKey].stock > item.minStock) {
        inventory[itemKey].blocked = false;
        addActivity(`✅ ${item.name} desbloqueado automáticamente tras reposición`, 'info');
    }

    addActivity(`📦 Reposición rápida: +${restockAmount} ${item.unit} de ${item.name}`, 'info');
    updateAll();
    showLeftNotification(`📦 Repuesto: ${restockAmount} ${item.unit} de ${item.name}`, 'success');
}

function toggleBlock(itemKey) {
    const item = inventory[itemKey];
    inventory[itemKey].blocked = !item.blocked;

    const action = item.blocked ? 'desbloqueado' : 'bloqueado';
    const icon = item.blocked ? '✅' : '🚫';

    addActivity(`${icon} ${item.name} ${action} manualmente`, item.blocked ? 'info' : 'warning');
    updateAll();
    showLeftTopNotification(`${icon} ${item.name} ${action}`, item.blocked ? 'success' : 'warning');
}

function openRestockModal() {
    const select = document.getElementById('restockItem');
    select.innerHTML = '';

    Object.entries(inventory).forEach(([key, item]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${item.name} (Stock actual: ${item.stock} ${item.unit})`;
        select.appendChild(option);
    });

    document.getElementById('restockModal').style.display = 'block';
}

function closeRestockModal() {
    document.getElementById('restockModal').style.display = 'none';
    document.getElementById('restockQuantity').value = '';
}

function confirmRestock() {
    const itemKey = document.getElementById('restockItem').value;
    const quantity = parseInt(document.getElementById('restockQuantity').value);

    if (!itemKey || !quantity || quantity <= 0) {
        showLeftTopNotification('❌ Seleccione un item y cantidad válida', 'error');
        return;
    }

    const item = inventory[itemKey];
    const oldStock = item.stock;

    inventory[itemKey].stock += quantity;
    inventory[itemKey].stock = Math.min(inventory[itemKey].stock, item.maxStock);

    const actualAdded = inventory[itemKey].stock - oldStock;

    if (item.blocked && inventory[itemKey].stock > item.minStock) {
        inventory[itemKey].blocked = false;
        addActivity(`✅ ${item.name} desbloqueado automáticamente tras reposición`, 'info');
    }

    addActivity(`📦 Reposición manual: +${actualAdded} ${item.unit} de ${item.name}`, 'info');

    updateAll();
    closeRestockModal();
    showLeftNotification(`📦 Repuesto: ${actualAdded} ${item.unit} de ${item.name}`, 'success');
}

function renderActivities() {
    const container = document.getElementById('activityFeed');

    if (activities.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No hay actividad reciente</div>';
        return;
    }

    container.innerHTML = '';
    activities.slice(0, 20).forEach(activity => {
        const item = document.createElement('div');
        item.className = `activity-item ${activity.type}`;

        item.innerHTML = `
            <div class="activity-time">
                ${activity.timestamp.toLocaleString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        })}
            </div>
            <div>${activity.message}</div>
        `;

        container.appendChild(item);
    });
}

function updateStats() {
    const totalItems = Object.keys(inventory).length;
    const lowStockItems = Object.values(inventory).filter(item =>
        item.stock <= item.minStock && item.stock > 0
    ).length;
    const outOfStockItems = Object.values(inventory).filter(item =>
        item.stock === 0
    ).length;
    const blockedProducts = Object.values(products).filter(product =>
        !checkProductAvailability(Object.keys(products).find(key => products[key] === product)).available
    ).length;

    document.getElementById('totalItems').querySelector('.stat-number').textContent = totalItems;
    document.getElementById('lowStockItems').querySelector('.stat-number').textContent = lowStockItems;
    document.getElementById('outOfStockItems').querySelector('.stat-number').textContent = outOfStockItems;
    document.getElementById('blockedProducts').querySelector('.stat-number').textContent = blockedProducts;

    // Actualizar clases de alerta
    const lowStockCard = document.getElementById('lowStockItems');
    const outOfStockCard = document.getElementById('outOfStockItems');

    if (lowStockItems > 0) {
        lowStockCard.classList.add('warning');
    } else {
        lowStockCard.classList.remove('warning');
    }

    if (outOfStockItems > 0) {
        outOfStockCard.classList.add('danger');
    } else {
        outOfStockCard.classList.remove('danger');
    }
}

function updateAll() {
    renderInventory();
    renderProducts();
    updateStats();
}

function generateReport() {
    const report = {
        timestamp: new Date().toLocaleString('es-PE'),
        inventory: Object.entries(inventory).map(([key, item]) => ({
            name: item.name,
            stock: item.stock,
            unit: item.unit,
            status: getStockStatus(item),
            value: item.stock * item.cost
        })),
        summary: {
            totalItems: Object.keys(inventory).length,
            totalValue: Object.values(inventory).reduce((sum, item) => sum + (item.stock * item.cost), 0),
            lowStockItems: Object.values(inventory).filter(item => item.stock <= item.minStock && item.stock > 0).length,
            outOfStockItems: Object.values(inventory).filter(item => item.stock === 0).length,
            unavailableProducts: Object.values(products).filter(product =>
                !checkProductAvailability(Object.keys(products).find(key => products[key] === product)).available
            ).length
        },
        recentActivity: activities.slice(0, 10)
    };

    console.log('📊 Reporte de Inventario:', report);
    showLeftNotification('📊 Reporte generado en consola', 'info');

    // Aquí normalmente se exportaría el reporte a PDF o Excel
    downloadReport(report);
}

function downloadReport(report) {
    // Simular descarga de reporte
    const reportText = `
REPORTE DE INVENTARIO
Fecha: ${report.timestamp}

RESUMEN:
- Total de items: ${report.summary.totalItems}
- Valor total: S/ ${report.summary.totalValue.toFixed(2)}
- Items con stock bajo: ${report.summary.lowStockItems}
- Items agotados: ${report.summary.outOfStockItems}
- Productos no disponibles: ${report.summary.unavailableProducts}

INVENTARIO DETALLADO:
${report.inventory.map(item =>
        `${item.name}: ${item.stock} ${item.unit} (${item.status}) - S/ ${item.value.toFixed(2)}`
    ).join('\n')}
            `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function showToast(message, type = 'success') {
    // Delegate to stacked top-left notifications so all alerts aparecen allí
    showLeftTopNotification(message, type);
}

function showLeftNotification(message, type = 'success') {
    // Use top-left stacked notifications for consistency
    showLeftTopNotification(message, type);
}

function showLeftTopNotification(message, type = 'success') {
    const spacing = 10;
    const startTop = 100; // px from top where the first notification sits
    const displayDuration = 3500; // ms que la notificación permanece visible
    const animationDuration = 400; // ms for slide out animation (match CSS)
    const baseZ = 2000;

    const notification = document.createElement('div');
    notification.className = `left-top-notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.left = '20px';
    notification.style.top = startTop + 'px';
    notification.style.transition = 'top 0.25s ease';

    // Append to DOM so we can measure its height
    document.body.appendChild(notification);
    const notifHeight = notification.getBoundingClientRect().height;

    // Reposition existing notifications: push them down by notifHeight + spacing
    const existing = Array.from(document.querySelectorAll('.left-top-notification')).filter(n => n !== notification);
    // Ensure existing have inline top set (use current position as fallback)
    existing.forEach((notif, idx) => {
        const currentTop = parseFloat(notif.style.top);
        const computedTop = isNaN(currentTop) ? notif.getBoundingClientRect().top : currentTop;
        notif.style.top = (computedTop + notifHeight + spacing) + 'px';
        // assign lower z-index for older notifications
        notif.style.zIndex = (baseZ + idx);
    });

    // Newest notification must be on top
    notification.style.top = startTop + 'px';
    notification.style.zIndex = (baseZ + existing.length + 10);

    // Auto-remove after timeout and pull up remaining notifications
    setTimeout(() => {
        // ensure it animates out to the left
        notification.style.zIndex = (baseZ + existing.length + 20);
        notification.style.animation = 'slideOutToLeftTop 0.4s ease-in';

        // Wait for animation to complete before removing and shifting others
        setTimeout(() => {
            const removedHeight = notification.getBoundingClientRect().height + spacing;
            // remove it from DOM
            notification.remove();

            // Shift remaining notifications up smoothly
            const siblings = Array.from(document.querySelectorAll('.left-top-notification'));
            siblings.forEach((notif, idx) => {
                const currentTop = parseFloat(notif.style.top);
                const computedTop = isNaN(currentTop) ? notif.getBoundingClientRect().top : currentTop;
                const newTop = Math.max(startTop, computedTop - removedHeight);
                notif.style.top = newTop + 'px';
                notif.style.zIndex = baseZ + idx;
            });
        }, animationDuration);
    }, displayDuration);

    return notification;
}

// Simulación de reposiciones automáticas
function simulateAutomaticRestock() {
    setInterval(() => {
        const lowStockItems = Object.entries(inventory).filter(([key, item]) =>
            item.stock <= item.minStock && !item.blocked && Math.random() > 0.7
        );

        if (lowStockItems.length > 0) {
            const [itemKey, item] = lowStockItems[Math.floor(Math.random() * lowStockItems.length)];
            const restockAmount = Math.floor(Math.random() * 20) + 10;

            inventory[itemKey].stock += restockAmount;
            inventory[itemKey].stock = Math.min(inventory[itemKey].stock, item.maxStock);

            addActivity(`📦 Reposición automática: +${restockAmount} ${item.unit} de ${item.name}`, 'info');
            updateAll();
        }
    }, 60000); // Cada minuto
}

// Simulación de pedidos aleatorios
function simulateRandomOrders() {
    setInterval(() => {
        if (Math.random() > 0.6) { // 40% de probabilidad
            simulateOrder();
        }
    }, 30000); // Cada 30 segundos
}

// Event listeners para cerrar modal
window.onclick = function (event) {
    const modal = document.getElementById('restockModal');
    if (event.target === modal) {
        closeRestockModal();
    }
}

// Estilos para animaciones (estos se inyectaban dinámicamente en el HTML; los dejamos en JS)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInToast {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutToast {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicialización
function initialize() {
    // Actividades iniciales
    addActivity('🚀 Sistema de inventario iniciado', 'info');
    addActivity('📊 Inventario cargado correctamente', 'info');

    // Verificar estado inicial del inventario
    Object.entries(inventory).forEach(([key, item]) => {
        if (item.stock === 0) {
            addActivity(`⚠️ ALERTA: ${item.name} sin stock al inicio`, 'danger');
        } else if (item.stock <= item.minStock) {
            addActivity(`⚠️ Stock bajo detectado: ${item.name} (${item.stock} ${item.unit})`, 'warning');
        }
    });

    updateAll();

    // Iniciar simulaciones
    setTimeout(() => {
        simulateAutomaticRestock();
        simulateRandomOrders();
    }, 5000);

    // Inicialización completada (notificación de inicio removida a petición)
}

// Inicializar cuando la página esté lista
document.addEventListener('DOMContentLoaded', initialize);

