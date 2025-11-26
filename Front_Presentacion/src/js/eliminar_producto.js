// js/eliminar_producto.js
document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('eliminar-producto');
    if (!section) return;

    // Datos de ejemplo (puedes reemplazar con datos reales)
    let products = [
        {
            id: 1,
            name: 'Hamburguesa Clásica',
            category: 'Hamburguesas',
            price: 18.50,
            activeOrders: 2,
            totalSales: 150,
            status: 'active',
            image: 'img/Hamburguesas/Burger clasica.jpeg'
        },
        {
            id: 2,
            name: 'Hamburguesa BBQ',
            category: 'Hamburguesas',
            price: 22.00,
            activeOrders: 0,
            totalSales: 320,
            status: 'active',
            image: 'img/Hamburguesas/Burger BBQ.jpeg'
        },
        {
            id: 3,
            name: 'Gaseosa',
            category: 'Bebidas',
            price: 5.50,
            activeOrders: 5,
            totalSales: 410,
            status: 'active',
            image: 'img/Bebidas/Gaseosa.jpg'
        },
        {
            id: 4,
            name: 'Hamburguesa Picante',
            category: 'Hamburguesas',
            price: 20.00,
            activeOrders: 0,
            totalSales: 45,
            status: 'deleted',
            image: 'img/Hamburguesas/Burger Picante.jpeg'
        }
    ];

    // Referencias a elementos
    const tbodyActive = section.querySelector('#tbody-active');
    const tbodyDeleted = section.querySelector('#tbody-deleted');
    const modal = document.querySelector('.eliminar-modal-overlay');
    const modalMessage = modal?.querySelector('.eliminar-modal-body h3');
    const modalCancel = modal?.querySelector('.eliminar-modal-footer .btn:not(.btn-danger)');
    const modalConfirm = modal?.querySelector('.eliminar-modal-footer .btn-danger');

    let productToDelete = null;

    // Renderiza las tablas
    function renderTables() {
        tbodyActive.innerHTML = '';
        tbodyDeleted.innerHTML = '';

        products
            .filter(p => p.status === 'active')
            .forEach(p => {
                const row = createRow(p, false);
                row.classList.add('fade-move');
                setTimeout(() => row.classList.add('show'), 10);
                tbodyActive.appendChild(row);
            });

        products
            .filter(p => p.status === 'deleted')
            .forEach(p => {
                const row = createRow(p, true);
                row.classList.add('fade-move');
                setTimeout(() => row.classList.add('show'), 10);
                tbodyDeleted.appendChild(row);
            });
    }

    // Crea una fila de producto
    function createRow(product, isDeleted) {
        const tr = document.createElement('tr');

        const productCell = document.createElement('td');
        productCell.className = 'product-cell';
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.onerror = () => img.src = 'img/iconos/default-product.jpg';
        const span = document.createElement('span');
        span.textContent = product.name;
        productCell.append(img, span);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = product.category;

        const priceCell = document.createElement('td');
        priceCell.textContent = `S/ ${product.price.toFixed(2)}`;

        const ordersCell = document.createElement('td');
        ordersCell.textContent = product.activeOrders;

        const salesCell = document.createElement('td');
        salesCell.textContent = product.totalSales;

        const actionsCell = document.createElement('td');

        if (isDeleted) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-restore';
            btn.textContent = '↺ Restaurar';
            btn.type = 'button';
            btn.onclick = () => {
                product.status = 'active';
                renderTables();
            };
            actionsCell.appendChild(btn);
        } else {
            const btn = document.createElement('button');
            btn.className = 'btn btn-delete';
            btn.textContent = '🗑 Eliminar';
            btn.type = 'button';
            btn.onclick = () => {
                productToDelete = product;
                let warning = product.activeOrders > 0
                    ? '⚠️ Este producto tiene pedidos activos.\n'
                    : '';
                modalMessage.textContent = `${warning}¿Eliminar “${product.name}” del menú?`;
                modal.classList.add('active');
            };
            actionsCell.appendChild(btn);
        }

        tr.append(productCell, categoryCell, priceCell, ordersCell, salesCell, actionsCell);
        return tr;
    }

    // Configurar eventos del modal
    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            if (productToDelete) {
                productToDelete.status = 'deleted';
                renderTables();
                if (typeof showToast === 'function') {
                    showToast(`Producto eliminado`, 'success');
                }
            }
            modal.classList.remove('active');
            productToDelete = null;
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            modal.classList.remove('active');
            productToDelete = null;
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                productToDelete = null;
            }
        });
    }

    renderTables();
});