let orders = [];
let orderCounter = 101;
let completedToday = 0;

const sampleItems = [
    { name: "Hamburguesa Clásica", customizations: ["Sin cebolla", "Extra queso", "Punto"] },
    { name: "Hamburguesa Doble", customizations: ["Extra queso", "Bacon", "Mayonesa"] },
    { name: "Hamburguesa Especial", customizations: ["Huevo", "Lechuga", "Tomate", "Picante"] },
    { name: "Hamburguesa Premium", customizations: ["Queso azul", "Cebolla caramelizada", "Champiñones"] },
    { name: "Hamburguesa Vegana", customizations: ["Sin queso", "Lechuga", "Tomate", "Aguacate"] },
    { name: "Embutidos Variados", customizations: ["Jamón", "Queso", "Tomate", "Lechuga"] },
    { name: "Sándwich de Embutidos", customizations: ["Queso derretido", "Cebolla", "Pepinillo"] },
    { name: "Hamburguesa Casera", customizations: ["Salsa BBQ", "Bacon crujiente", "Anillos de cebolla"] }
];

const orderTypes = ['Mesa', 'Delivery', 'Para llevar'];
const customerNames = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Silva', 'Pedro Rodríguez'];

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

function updateTimer() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('es-PE');
    orders.forEach(order => {
        const elapsed = Math.floor((now - order.timestamp) / 1000 / 60);
        const orderElement = document.querySelector(`[data-order-id="${order.id}"] .time-elapsed`);
        if (orderElement) {
            orderElement.textContent = `${elapsed} min`;
            if (elapsed > 15) {
                orderElement.style.color = '#ff6b6b';
                orderElement.style.animation = 'pulse 2s infinite';
            }
        }
    });
}

function updateStats() {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('preparingCount').textContent = preparing;
    document.getElementById('completedToday').textContent = completedToday;
}

function addSampleOrder() {
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items = [];
    for (let i = 0; i < itemCount; i++) {
        const sampleItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
        items.push({
            id: Date.now() + i,
            name: sampleItem.name,
            quantity: Math.floor(Math.random() * 3) + 1,
            customizations: sampleItem.customizations.slice(0, Math.floor(Math.random() * 3) + 1)
        });
    }
    const order = {
        id: orderCounter++,
        number: `#${String(orderCounter - 1).padStart(3, '0')}`,
        timestamp: new Date(),
        type: orderType,
        customer: customerName,
        status: 'pending',
        items: items,
        specialInstructions: Math.random() > 0.7 ? 'Pedido urgente - Cliente esperando' : null,
        priority: Math.random() > 0.8
    };
    orders.unshift(order);
    renderOrders();
    updateStats();
}

function renderOrders() {
    const container = document.getElementById('ordersContainer');
    if (orders.length === 0) {
        container.innerHTML = '<div class="no-orders">🎯 No hay pedidos pendientes</div>';
        return;
    }
    container.innerHTML = '';
    const sortedOrders = orders.sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.timestamp - b.timestamp;
    });
    sortedOrders.forEach(order => {
        const card = createOrderCard(order);
        container.appendChild(card);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = `order-card ${order.priority ? 'priority' : ''} ${order.status === 'ready' ? 'ready' : ''}`;
    card.setAttribute('data-order-id', order.id);
    const elapsed = Math.floor((new Date() - order.timestamp) / 1000 / 60);
    const targetUrl = isFromAdmin() ? 'ControlKDS.html?from=admin' : 'ControlKDS.html';
    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">${order.number}</div>
            <div class="order-time">
                <div>${order.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="time-elapsed">${elapsed} min</div>
            </div>
        </div>
        <div class="order-type ${order.type.toLowerCase().replace(' ', '-')}">${order.type}</div>
        <div class="customer-info">
            👤 Cliente: <strong>${order.customer}</strong>
        </div>
        ${order.specialInstructions ? `
            <div class="special-instructions">
                ⚠️ <strong>Instrucciones especiales:</strong><br>
                ${order.specialInstructions}
            </div>
        ` : ''}
        <div class="order-items">
            ${order.items.map(item => `
                <div class="item">
                    <div class="item-name">
                        <span class="item-quantity">${item.quantity}</span>
                        ${item.name}
                    </div>
                    ${item.customizations.length > 0 ? `
                        <div class="item-customizations">
                            ${item.customizations.map(custom => `<span class="customization">${custom}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        <a href="${targetUrl}" class="control-link">
            🍽️ Ir a Control de Pedidos
        </a>
    `;
    return card;
}

function clearAllOrders() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los pedidos?')) {
        orders = [];
        renderOrders();
        updateStats();
        showLeftTopNotification('Todos los pedidos han sido eliminados', 'info');
    }
}

// Mostrar notificación apilada en la esquina superior izquierda
function showLeftTopNotification(message, type = 'success') {
    const spacing = 10;
    const startTop = 100; // px desde arriba donde se sitúa la primera notificación
    const displayDuration = 3500; // ms que la notificación permanece visible (igual que ControlInventario)
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
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes slideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }
`;
document.head.appendChild(style);

function initializeSampleData() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => addSampleOrder(), i * 500);
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    updateRoleDisplay(); // ✅ Actualiza el rol

    setInterval(updateTimer, 1000);
    updateTimer();
    setTimeout(initializeSampleData, 1000);
    updateStats();

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
        sessionStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
});