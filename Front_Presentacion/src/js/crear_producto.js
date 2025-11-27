// js/crear_producto.js - CORREGIDO PARA USAR JSON Y URL SIMULADA
(function () {
    // -------------------------------------------------------------------------
    // --- LÓGICA DE API (Usando la estructura JSON de tu api.js) ---
    // NOTA: Asumimos que showToast y productAPI están disponibles globalmente.
    
    function showCustomAlert(message, isSuccess = false) {
        if (typeof showToast === 'function') {
            showToast(message, isSuccess ? 'success' : 'error');
        } else {
            alert(message);
        }
    }
    
    // Función de utilidad para cerrar el modal (asumimos que existe)
    function closeModal() {
        const modal = document.getElementById('crudModal');
        if (modal) modal.classList.remove('active');
    }
    // -------------------------------------------------------------------------

    // Datos Ficticios (Simulando la tabla 'extras' o 'supplies').
    const insumosDisponibles = [
        { id: 101, nombre: "Carne de Res (50g)", unidad: "porción", costo: 5.50 },
        { id: 102, nombre: "Pan de Hamburguesa", unidad: "unidad", costo: 1.00 },
        { id: 103, nombre: "Queso Cheddar", unidad: "unidad", costo: 1.00 },
        { id: 104, nombre: "Lechuga", unidad: "g", costo: 0.02 },
        { id: 105, nombre: "Tomate", unidad: "unidad", costo: 1.00 },
        { id: 106, nombre: "Papas congeladas", unidad: "kg", costo: 6.00 },
        { id: 107, nombre: "Salsa de tomate", unidad: "ml", costo: 0.03 },
    ];
    
    let insumosSeleccionados = [];

    // --- Elementos DOM ---
    const section = document.getElementById('crear-producto');
    if (!section) return; 
    
    const tabContents = document.querySelectorAll('#crear-producto .cp-tab-content');
    const btnSiguiente = document.getElementById('cp-btnSiguiente');
    const btnVolver = document.getElementById('cp-btnVolver');
    const btnCrear = document.getElementById('cp-btnCrear');
    const listaInsumos = document.getElementById('cp-listaInsumos');
    const cuerpoSeleccionados = document.getElementById('cp-cuerpoSeleccionados');
    const costoTotalSpan = document.getElementById('cp-costoTotal');
    const imagenInput = document.getElementById('cp-imagen');
    const imagePreview = document.getElementById('cp-imagePreview');
    const productoForm = document.getElementById('cp-productoForm');

    function mostrarTab(tabId) { /* ... función sin cambios ... */
        tabContents.forEach(sec => sec.classList.remove('active'));
        document.getElementById('cp-' + tabId).classList.add('active');

        document.querySelectorAll('#crear-producto .cp-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
    }

    function openCantidadModal(insumo, onAccept) { /* ... función sin cambios ... */
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
                showCustomAlert('Cantidad inválida. Debe ser un entero mayor o igual a 1.', false);
                return;
            }

            if (typeof window.modalCantidadCallback === 'function') {
                window.modalCantidadCallback(cantidad);
                window.modalCantidadCallback = null;
            }
            if (typeof closeModal === 'function') {
                closeModal();
            } else {
                document.getElementById('crudModal').classList.remove('active');
            }
        };

        document.getElementById('crudModal').classList.add('active');
    }

    function showCantidadModal(insumo) { /* ... función sin cambios ... */
        openCantidadModal(insumo, (cantidad) => {
            insumosSeleccionados.push({ ...insumo, cantidad });
            renderizarSeleccionados();
        });
    }
    
    /**
     * Genera la descripción del producto basada en los insumos seleccionados.
     */
    function generarDescripcion() {
        if (insumosSeleccionados.length === 0) {
            return "Producto sin insumos definidos.";
        }

        const partes = insumosSeleccionados.map(item => {
            const unidad = item.cantidad > 1 ? `${item.unidad}s` : item.unidad; 
            return `${item.cantidad} ${unidad} de ${item.nombre.replace(` (${item.unidad})`, '')}`;
        });

        if (partes.length > 1) {
            const ultimo = partes.pop();
            return `Contiene: ${partes.join(', ')} y ${ultimo}.`;
        }
        return `Contiene: ${partes[0]}.`;
    }

    // --- Lógica de Pestañas y Validación ---

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            const nombre = document.getElementById('cp-nombre').value.trim();
            const categoria = document.getElementById('cp-categoria').value; 
            const precio = document.getElementById('cp-precio').value;

            // Validación de campos obligatorios
            if (!nombre || !categoria || !precio) {
                showCustomAlert('Por favor, completa los campos Nombre, Categoría y Precio.', false);
                return;
            }
            if (isNaN(precio) || parseFloat(precio) <= 0) {
                showCustomAlert('El precio debe ser un número válido mayor a 0.', false);
                return;
            }
            
            // NO se valida la imagen aquí, se usará una URL por defecto
            
            mostrarTab('insumos');
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            mostrarTab('detalle');
        });
    }

    function renderizarInsumos() { /* ... función sin cambios ... */
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
                const isSelected = insumosSeleccionados.some(item => item.id === insumo.id);
                if (isSelected) {
                     showCustomAlert('Este insumo ya ha sido agregado.', false);
                     return;
                }
                showCantidadModal(insumo);
            });
            listaInsumos.appendChild(li);
        });
    }

    function renderizarSeleccionados() { /* ... función sin cambios ... */
        cuerpoSeleccionados.innerHTML = '';
        let total = 0;

        if (insumosSeleccionados.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" style="text-align: center; color: #aaa;">No hay insumos seleccionados.</td>';
            cuerpoSeleccionados.appendChild(tr);
            costoTotalSpan.textContent = '0.00';
            return;
        }

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

    // --- Lógica de Creación (Usando productAPI.create JSON) ---

    if (btnCrear) {
        btnCrear.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. Recolección y Validación de datos
            const nombre = document.getElementById('cp-nombre').value.trim();
            const categoria = document.getElementById('cp-categoria').value;
            const precio = parseFloat(document.getElementById('cp-precio').value);
            const stock = parseInt(document.getElementById('cp-stock').value) || 0;
            const categoryId = parseInt(categoria, 10); 
            
            const descripcionGenerada = generarDescripcion();

            // Validación final
            if (insumosSeleccionados.length === 0) {
                showCustomAlert('Debe seleccionar al menos un insumo.', false);
                return;
            }

            if (!nombre || !precio || isNaN(precio) || precio <= 0 || isNaN(categoryId)) {
                showCustomAlert('Error: Faltan completar datos en la pestaña "Detalle de Producto".', false);
                mostrarTab('detalle');
                return;
            }

            // 2. Preparar el objeto JSON para la API
            const extrasData = insumosSeleccionados.map(item => ({
                extra_id: item.id,
                quantity: item.cantidad,
                costo_unitario: item.costo.toFixed(2)
            }));
            
            // Objeto de datos que se enviará como JSON
            const dataToSend = {
                // Usamos el campo 'name', 'description', etc., que tu api.js espera
                nombre: nombre, 
                descripcion: descripcionGenerada, 
                precio: precio.toFixed(2),
                categoria_id: categoryId,
                stock: stock,
                // SIMULACIÓN: Usamos una URL genérica para la imagen
                // El backend DEBE aceptar el campo 'image' en el cuerpo JSON
                image: 'https://burger-api-sandbox.com/default-image.jpg', 
                // Enviamos los extras como un array/objeto JSON dentro del cuerpo principal
                extras: extrasData 
            };
            
            console.log('Enviando JSON a productAPI.create:', dataToSend);

            // 3. Llamada a la API usando productAPI.create (que usa JSON)
            try {
                // Usamos la función original productAPI.create que encapsula apiCall (JSON)
                const resultado = await productAPI.create(dataToSend);
                
                console.log('Producto creado exitosamente:', resultado);

                showCustomAlert(`¡Producto ${nombre} creado con éxito!`, true);

                // 4. Limpiar formulario y reiniciar
                productoForm.reset();
                imagePreview.innerHTML = '<div class="cp-image-placeholder">📷 URL de Imagen simulada</div>';
                insumosSeleccionados = [];
                renderizarSeleccionados();
                mostrarTab('detalle');

            } catch (error) {
                console.error('Error al crear producto:', error);
                
                // El error 415 ya no debería ocurrir si se usa JSON.
                showCustomAlert(`Error al crear producto: ${error.message || 'Verifica la consola para más detalles.'}`, false);
            }
        });
    }

    // --- Manejo de Imagen (Modificado) ---
    // Simplemente muestra una URL/ruta en el preview, ya que no se sube el archivo.

    if (imagenInput) {
        imagenInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                 // Aquí podríamos simular subir la imagen y obtener una URL, 
                 // pero por simplicidad solo indicamos que se usará una URL por defecto.
                 imagePreview.innerHTML = `<div class="cp-image-placeholder">✅ Imagen seleccionada. Se usará una URL de prueba.</div>`;
            } else {
                 imagePreview.innerHTML = '<div class="cp-image-placeholder">📷 Arrastre o seleccione una imagen</div>';
            }
        });

        imagePreview.addEventListener('click', () => imagenInput.click());
        // El resto del drag and drop se mantiene si quieres el efecto visual, aunque no suba el archivo.
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

    // --- Inicialización ---
    document.addEventListener('DOMContentLoaded', () => {
        renderizarInsumos();
        renderizarSeleccionados();
        mostrarTab('detalle');
    });
})();