(function () {
    const insumosDisponibles = [
        { id: 1, nombre: "Carne de Res (50g)", unidad: "porción", costo: 5.50 },
        { id: 2, nombre: "Pan de Hamburguesa", unidad: "unidad", costo: 1.00 },
        { id: 3, nombre: "Queso Cheddar", unidad: "unidad", costo: 1.00 },
        { id: 4, nombre: "Lechuga", unidad: "g", costo: 0.02 },
        { id: 5, nombre: "Tomate", unidad: "unidad", costo: 1.00 },
        { id: 6, nombre: "Papas congeladas", unidad: "kg", costo: 6.00 },
        { id: 7, nombre: "Salsa de tomate", unidad: "ml", costo: 0.03 },
    ];

    let insumosSeleccionados = [];

    const tabContents = document.querySelectorAll('#crear-producto .cp-tab-content');
    const btnSiguiente = document.getElementById('cp-btnSiguiente');
    const btnVolver = document.getElementById('cp-btnVolver');
    const btnCrear = document.getElementById('cp-btnCrear');
    const listaInsumos = document.getElementById('cp-listaInsumos');
    const cuerpoSeleccionados = document.getElementById('cp-cuerpoSeleccionados');
    const costoTotalSpan = document.getElementById('cp-costoTotal');
    const imagenInput = document.getElementById('cp-imagen');
    const imagePreview = document.getElementById('cp-imagePreview');

    function mostrarTab(tabId) {
        tabContents.forEach(sec => sec.classList.remove('active'));
        document.getElementById('cp-' + tabId).classList.add('active');

        document.querySelectorAll('#crear-producto .cp-tab').forEach(tab => {
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    function showCustomAlert(message, isSuccess = false) {
        showToast(message, isSuccess ? 'success' : 'error');
    }

    // ✅ Nueva función: abre el modal existente con input numérico
    function openCantidadModal(insumo, onAccept) {
        const form = document.getElementById('crudForm');
        document.getElementById('modalTitle').textContent = `Ingrese cantidad de "${insumo.nombre}" en ${insumo.unidad}:`;

        form.innerHTML = `
            <div class="form-group">
            <label>Cantidad</label>
            <input type="number" id="modalCantidadInput" class="form-control" min="1" step="1" value="1" required />
            </div>
        `;

        window.modalCantidadCallback = onAccept;

        document.getElementById('btnSave').onclick = () => {
            const cantidadInput = document.getElementById('modalCantidadInput');
            const cantidad = parseInt(cantidadInput.value, 10);

            if (isNaN(cantidad) || cantidad < 1) {
                showToast('Cantidad inválida. Debe ser un entero mayor o igual a 1.', 'error');
                return;
            }

            if (typeof window.modalCantidadCallback === 'function') {
                window.modalCantidadCallback(cantidad);
                window.modalCantidadCallback = null;
            }

            closeModal();
        };

        document.getElementById('btnCancel').onclick = closeModal;
        document.getElementById('crudModal').classList.add('active');
    }

    function showCantidadModal(insumo) {
        openCantidadModal(insumo, (cantidad) => {
            insumosSeleccionados.push({ ...insumo, cantidad });
            renderizarSeleccionados();
        });
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            const nombre = document.getElementById('cp-nombre').value.trim();
            const descripcion = document.getElementById('cp-descripcion').value.trim();
            const categoria = document.getElementById('cp-categoria').value;
            const precio = document.getElementById('cp-precio').value;
            const imagen = imagenInput.files[0];

            if (!nombre) { showCustomAlert('El campo "Nombre del Producto" es obligatorio.'); return; }
            if (!descripcion) { showCustomAlert('El campo "Descripción" es obligatorio.'); return; }
            if (!categoria) { showCustomAlert('Seleccione una categoría.'); return; }
            if (!precio || isNaN(precio) || parseFloat(precio) <= 0) { showCustomAlert('Ingrese un precio válido mayor a 0.'); return; }
            if (!imagen) { showCustomAlert('Seleccione una imagen.'); return; }

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                mostrarTab('insumos');
            };
            reader.readAsDataURL(imagen);
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            mostrarTab('detalle');
        });
    }

    function renderizarInsumos() {
        listaInsumos.innerHTML = '';
        insumosDisponibles.forEach(insumo => {
            const li = document.createElement('li');
            li.className = 'cp-insumo-item';
            li.innerHTML = `
            <div class="cp-insumo-info">
                <strong>${insumo.nombre}</strong><br>
                <small>Costo: S/ ${insumo.costo.toFixed(2)} / ${insumo.unidad}</small>
            </div>
            <button class="cp-add-btn" data-id="${insumo.id}">+</button>
            `;
            listaInsumos.appendChild(li);
        });

        document.querySelectorAll('#crear-producto .cp-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const insumo = insumosDisponibles.find(i => i.id === id);
                if (!insumo) return;

                showCantidadModal(insumo);
            });
        });
    }

    function renderizarSeleccionados() {
        cuerpoSeleccionados.innerHTML = '';
        let total = 0;

        insumosSeleccionados.forEach((item, index) => {
            const unitCost = parseFloat(item.costo) || 0;
            const cantidad = parseInt(item.cantidad, 10) || 0;
            const subtotal = unitCost * cantidad;
            total += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.unidad}</td>
            <td>${cantidad}</td>
            <td>S/ ${unitCost.toFixed(2)}</td>
            <td>S/ ${subtotal.toFixed(2)}</td>
            <td><button class="cp-remove-btn" data-index="${index}">✕</button></td>
            `;
            cuerpoSeleccionados.appendChild(tr);
        });

        costoTotalSpan.textContent = total.toFixed(2);

        document.querySelectorAll('#crear-producto .cp-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                insumosSeleccionados.splice(idx, 1);
                renderizarSeleccionados();
            });
        });
    }

    if (btnCrear) {
        btnCrear.addEventListener('click', () => {
            if (insumosSeleccionados.length === 0) {
                showCustomAlert('Debe seleccionar al menos un insumo.');
                return;
            }

            const codigo = 'PROD-' + Date.now().toString(36).toUpperCase();
            const nombre = document.getElementById('cp-nombre').value;

            showCustomAlert(`¡Producto creado con éxito!\nCódigo: ${codigo}\nNombre: ${nombre}`, true);

            document.getElementById('cp-productoForm').reset();
            imagePreview.innerHTML = '<div class="cp-image-placeholder">📷 Arrastre o seleccione una imagen</div>';
            insumosSeleccionados = [];
            renderizarSeleccionados();
            mostrarTab('detalle');
        });
    }

    renderizarInsumos();
})();
