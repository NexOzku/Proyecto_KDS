let orders = [];
let notifications = [];
let orderCounter = 101;
let currentOrderId = null;

const sampleCustomers = [
    { name: "Juan Pérez", phone: "987-654-321", email: "juan@email.com" },
    { name: "María García", phone: "987-123-456", email: "maria@email.com" },
    { name: "Carlos López", phone: "987-789-012", email: "carlos@email.com" },
    { name: "Ana Silva", phone: "987-345-678", email: "ana@email.com" },
    { name: "Pedro Rodríguez", phone: "987-901-234", email: "pedro@email.com" }
];

const sampleItems = [
    { name: "Hamburguesa Clásica", price: 18.50 },
    { name: "Hamburguesa Doble", price: 25.00 },
    { name: "Hamburguesa Especial", price: 22.00 },
    { name: "Hamburguesa Premium", price: 28.00 },
    { name: "Hamburguesa Vegana", price: 20.00 },
    { name: "Embutidos Variados", price: 16.50 },
    { name: "Sándwich de Embutidos", price: 17.50 },
    { name: "Hamburguesa Casera", price: 24.00 }
];

const orderTypes = ['Mesa', 'Delivery', 'Para llevar'];

// === UTILIDAD: Detectar si viene del admin ===
function isFromAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('from') === 'admin';
}

// === ACTUALIZAR TEXTO DEL ROL ===
function updateRoleDisplay() {
    const roleElement = document.querySelector('#user-menu-trigger .header-user-name span');
    if (roleElement) {
        roleElement.textContent = isFromAdmin() ? 'Administrador' : 'Personal de cocina';
    }
}

function addSampleOrder(status = 'preparing') {
    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    for (let i = 0; i < itemCount; i++) {
        const sampleItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
        items.push({
            id: Date.now() + i,
            name: sampleItem.name,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: sampleItem.price
        });
    }
    const order = {
        id: orderCounter++,
        number: `#${String(orderCounter - 1).padStart(3, '0')}`,
        timestamp: new Date(),
        type: orderType,
        customer: customer,
        status: status,
        items: items,
        completedAt: status === 'ready' ? new Date(Date.now() - Math.random() * 10 * 60000) : null
    };
    orders.push(order);
    renderOrders();
    updateStats();
}

function renderOrders() {
    const preparingContainer = document.getElementById('preparingOrders');
    const readyContainer = document.getElementById('readyOrders');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    if (preparingOrders.length === 0) {
        preparingContainer.innerHTML = '<div class="no-orders">No hay pedidos en preparación</div>';
    } else {
        preparingContainer.innerHTML = '';
        preparingOrders.forEach(order => {
            preparingContainer.appendChild(createOrderCard(order));
        });
    }

    if (readyOrders.length === 0) {
        readyContainer.innerHTML = '<div class="no-orders">No hay pedidos listos</div>';
    } else {
        readyContainer.innerHTML = '';
        readyOrders.forEach(order => {
            readyContainer.appendChild(createOrderCard(order));
        });
    }
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = `order-card ${order.status}`;
    card.setAttribute('data-order-id', order.id);
    const elapsed = Math.floor((new Date() - order.timestamp) / 1000 / 60);
    const total = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">${order.number}</div>
            <div class="order-time">
                <div>${order.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="time-elapsed">${elapsed} min</div>
            </div>
        </div>
        <div class="customer-info">
            <div class="customer-details">
                <div class="customer-name">👤 ${order.customer.name}</div>
                <div class="customer-contact">📱 ${order.customer.phone}</div>
                <div class="customer-contact">📧 ${order.customer.email}</div>
            </div>
            <div class="order-type ${order.type.toLowerCase().replace(' ', '-')}">${order.type}</div>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="item">
                    <div class="item-header">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">${item.quantity}</div>
                    </div>
                    <div style="color: #666; font-size: 0.9em;">S/ ${item.price.toFixed(2)} c/u</div>
                </div>
            `).join('')}
        </div>
        <div style="text-align: right; margin-bottom: 15px; font-weight: bold; color: #1e3c72;">
            Total: S/ ${total.toFixed(2)}
        </div>
        <div class="order-actions">
            ${order.status === 'preparing' ? `
                <button class="action-btn complete-btn" onclick="showCompletionModal(${order.id})">
                    ✅ Marcar Completado
                </button>
            ` : `
                <button class="action-btn deliver-btn" onclick="showDeliveryModal(${order.id})">
                    🚀 Entregar Pedido
                </button>
            `}
        </div>
    `;
    return card;
}

function showCompletionModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        currentOrderId = orderId;
        document.getElementById('modalOrderNumber').textContent = order.number;
        document.getElementById('completionModal').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('completionModal').style.display = 'none';
    currentOrderId = null;
}

function confirmCompletion() {
    if (currentOrderId) {
        const order = orders.find(o => o.id === currentOrderId);
        if (order) {
            order.status = 'ready';
            order.completedAt = new Date();
            const notification = {
                id: Date.now(),
                orderId: order.id,
                orderNumber: order.number,
                customerName: order.customer.name,
                customerContact: order.customer.email,
                message: "Pedido listo para entregar",
                timestamp: new Date(),
                type: 'ready'
            };
            notifications.unshift(notification);
            sendNotificationToCustomer(order, notification);
            renderOrders();
            renderNotifications();
            updateStats();
            showLeftTopNotification(`✅ Pedido ${order.number} marcado como completado`, 'success');
        }
    }
    closeModal();
}

function showDeliveryModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        currentOrderId = orderId;
        document.getElementById('deliveryModalOrderNumber').textContent = order.number;
        document.getElementById('deliveryModal').style.display = 'block';
    }
}

function closeDeliveryModal() {
    document.getElementById('deliveryModal').style.display = 'none';
    currentOrderId = null;
}

function confirmDelivery() {
    if (currentOrderId) {
        const order = orders.find(o => o.id === currentOrderId);
        if (order) {
            const notification = {
                id: Date.now(),
                orderId: order.id,
                orderNumber: order.number,
                customerName: order.customer.name,
                customerContact: order.customer.email,
                message: "Pedido entregado exitosamente",
                timestamp: new Date(),
                type: 'delivered'
            };
            notifications.unshift(notification);
            orders = orders.filter(o => o.id !== currentOrderId);
            renderOrders();
            renderNotifications();
            updateStats();
            showLeftTopNotification(`🚀 Pedido ${order.number} entregado exitosamente`, 'success');
        }
    }
    closeDeliveryModal();
}

function sendNotificationToCustomer(order, notification) {
    console.log('📧 Enviando email a:', order.customer.email);
    console.log('📱 Enviando SMS a:', order.customer.phone);
    setTimeout(() => {
        showLeftTopNotification(`📧 Notificación enviada a ${order.customer.name}`, 'info');
    }, 1000);
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (notifications.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No hay notificaciones recientes</div>';
        return;
    }
    container.innerHTML = '';
    notifications.slice(0, 10).forEach((notification, index) => {
        const item = document.createElement('div');
        item.className = `notification-item ${index === 0 ? 'new' : ''}`;
        const icon = notification.type === 'ready' ? '✅' : '🚀';
        const bgColor = notification.type === 'ready' ? '#e8f5e8' : '#e3f2fd';
        item.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${icon} ${notification.message}</div>
                <div class="notification-time">${notification.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="notification-message">
                Cliente: <strong>${notification.customerName}</strong>
            </div>
            <div class="notification-details">
                <span>Pedido: ${notification.orderNumber}</span>
                <span>${notification.customerContact}</span>
            </div>
        `;
        if (index === 0) {
            item.style.backgroundColor = bgColor;
        }
        container.appendChild(item);
    });
}

function updateStats() {
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const completed = notifications.filter(n => n.type === 'delivered').length;
    document.getElementById('preparingCount').textContent = preparing;
    document.getElementById('readyCount').textContent = ready;
    document.getElementById('completedCount').textContent = completed;
}

function clearAllData() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
        orders = [];
        notifications = [];
        renderOrders();
        renderNotifications();
        updateStats();
        showLeftTopNotification('🗑️ Todos los datos han sido eliminados', 'info');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColors = {
        success: 'linear-gradient(45deg, #51cf66, #40c057)',
        info: 'linear-gradient(45deg, #74c0fc, #339af0)',
        warning: 'linear-gradient(45deg, #ffd43b, #fab005)',
        error: 'linear-gradient(45deg, #ff6b6b, #ee5a6f)'
    };
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 2000;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        animation: slideInToast 0.3s ease-out;
        max-width: 400px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Mostrar notificación apilada en la esquina superior izquierda (comportamiento igual a ControlInventario)
function showLeftTopNotification(message, type = 'success') {
    const spacing = 10;
    const startTop = 100; // px desde arriba donde se sitúa la primera notificación
    const displayDuration = 6000; // ms que la notificación permanece visible
    const animationDuration = 400; // ms para la animación de salida (coincide con CSS)
    const baseZ = 2000;

    const notification = document.createElement('div');
    notification.className = `left-top-notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.left = '20px';
    notification.style.top = startTop + 'px';
    notification.style.transition = 'top 0.25s ease';

    // Añadir al DOM para poder medir su altura
    document.body.appendChild(notification);
    const notifHeight = notification.getBoundingClientRect().height;

    // Reposicionar notificaciones existentes hacia abajo
    const existing = Array.from(document.querySelectorAll('.left-top-notification')).filter(n => n !== notification);
    existing.forEach((notif, idx) => {
        const currentTop = parseFloat(notif.style.top);
        const computedTop = isNaN(currentTop) ? notif.getBoundingClientRect().top : currentTop;
        notif.style.top = (computedTop + notifHeight + spacing) + 'px';
        notif.style.zIndex = (baseZ + idx);
    });

    notification.style.top = startTop + 'px';
    notification.style.zIndex = (baseZ + existing.length + 10);

    // Auto-eliminar después del tiempo y mover hacia arriba las restantes
    setTimeout(() => {
        notification.style.zIndex = (baseZ + existing.length + 20);
        // animar salida desplazando a la izquierda y reduciendo opacidad
        notification.style.transition = `transform ${animationDuration}ms ease-in, opacity ${animationDuration}ms ease-in`;
        notification.style.transform = 'translateX(-120%)';
        notification.style.opacity = '0';

        setTimeout(() => {
            const removedHeight = notification.getBoundingClientRect().height + spacing;
            notification.remove();
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

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    updateRoleDisplay(); // ✅ Actualiza el rol

    addSampleOrder('preparing');
    addSampleOrder('preparing');
    addSampleOrder('ready');

    // === MENÚ DESPLEGABLE ===
    const trigger = document.getElementById('user-menu-trigger');
    const dropdown = document.getElementById('user-dropdown');
    const icon = document.getElementById('dropdown-icon');
    const kdsPanelBtn = document.getElementById('kds-panel-btn');
    const controlBtn = document.getElementById('control-pedidos-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (trigger && dropdown && icon) {
        const toggle = (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            icon.textContent = dropdown.classList.contains('active') ? '▲' : '▼';
        };
        trigger.addEventListener('click', toggle);
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                icon.textContent = '▼';
            }
        });
    }

    if (kdsPanelBtn) {
        kdsPanelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = isFromAdmin() ? 'KDS.html?from=admin' : 'KDS.html';
        });
    }

    if (controlBtn) {
        controlBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = isFromAdmin() ? 'ControlKDS.html?from=admin' : 'ControlKDS.html';
        });
    }

    // ✅ Agregar "Admin Panel" solo si viene del admin
    if (isFromAdmin()) {
        const adminBtn = document.createElement('button');
        adminBtn.className = 'dropdown-item';
        adminBtn.textContent = 'Admin Panel';
        const logoutBtnEl = document.getElementById('logout-btn');
        if (logoutBtnEl && logoutBtnEl.parentNode) {
            logoutBtnEl.parentNode.insertBefore(adminBtn, logoutBtnEl);
        }
        adminBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = 'admin.html';
        });
    }

    // === CERRAR SESIÓN ===
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('logoutConfirmModal').classList.add('active');
        });
    }

    document.getElementById('logoutCancelBtn')?.addEventListener('click', () => {
        document.getElementById('logoutConfirmModal').classList.remove('active');
    });

    document.getElementById('logoutConfirmBtn')?.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
});