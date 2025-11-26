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

    // Abre el modal para cantidad de insumo
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

            if (!nombre || !descripcion || !categoria || !precio) {
                showCustomAlert('Por favor, completa todos los campos del producto.');
                return;
            }

            if (isNaN(precio) || precio <= 0) {
                showCustomAlert('El precio debe ser un número válido mayor a 0.');
                return;
            }

            mostrarTab('insumos');
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
                    <strong>${insumo.nombre}</strong>
                    <span>${insumo.unidad} - S/ ${insumo.costo.toFixed(2)}</span>
                </div>
                <button class="cp-add-btn" type="button">+ Agregar</button>
            `;
            li.querySelector('.cp-add-btn').addEventListener('click', (e) => {
                e.preventDefault();
                showCantidadModal(insumo);
            });
            listaInsumos.appendChild(li);
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
            <td><button class="cp-remove-btn" type="button" data-index="${index}">✕</button></td>
            `;
            cuerpoSeleccionados.appendChild(tr);
        });

        costoTotalSpan.textContent = total.toFixed(2);

        document.querySelectorAll('#crear-producto .cp-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(btn.dataset.index);
                insumosSeleccionados.splice(idx, 1);
                renderizarSeleccionados();
            });
        });
    }

    if (btnCrear) {
        btnCrear.addEventListener('click', async (e) => {
            e.preventDefault();

            // Validaciones
            if (insumosSeleccionados.length === 0) {
                showCustomAlert('Debe seleccionar al menos un insumo.');
                return;
            }

            const nombre = document.getElementById('cp-nombre').value.trim();
            const descripcion = document.getElementById('cp-descripcion').value.trim();
            const categoria = document.getElementById('cp-categoria').value;
            const precio = parseFloat(document.getElementById('cp-precio').value);
            const stock = parseInt(document.getElementById('cp-stock').value) || 0;

            if (!nombre || !descripcion || !categoria || !precio || isNaN(precio) || precio <= 0) {
                showCustomAlert('Por favor, completa todos los campos correctamente.');
                return;
            }

            try {
                // Preparar datos del producto
                const productData = {
                    name: nombre,
                    description: descripcion,
                    price: precio,
                    category_id: parseInt(categoria),
                    stock: stock
                };

                console.log('Creando producto con datos:', productData);

                // Llamar a la API para crear el producto
                const resultado = await productAPI.create(productData);

                console.log('Producto creado exitosamente:', resultado);

                showCustomAlert(`¡Producto ${nombre} creado con éxito!`, true);

                // Limpiar formulario
                document.getElementById('cp-productoForm').reset();
                imagePreview.innerHTML = '<div class="cp-image-placeholder">📷 Arrastre o seleccione una imagen</div>';
                insumosSeleccionados = [];
                renderizarSeleccionados();
                mostrarTab('detalle');

            } catch (error) {
                console.error('Error al crear producto:', error);
                showCustomAlert(`Error al crear producto: ${error.message}`, false);
            }
        });
    }

    // Manejo de imagen
    if (imagenInput) {
        imagenInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });

        imagePreview.addEventListener('dragover', (e) => {
            e.preventDefault();
            imagePreview.classList.add('dragover');
        });

        imagePreview.addEventListener('dragleave', () => {
            imagePreview.classList.remove('dragover');
        });

        imagePreview.addEventListener('drop', (e) => {
            e.preventDefault();
            imagePreview.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                imagenInput.files = files;
                imagenInput.dispatchEvent(new Event('change'));
            }
        });
    }

    renderizarInsumos();
})();
