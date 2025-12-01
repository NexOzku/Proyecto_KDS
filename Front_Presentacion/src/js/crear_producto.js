// nexozku/proyecto_kds/.../Front_Presentacion/src/js/crear_producto.js

/**
 * Función que convierte un archivo de imagen (File) a un Blob en formato WebP.
 * WebP es el formato más eficiente para la web.
 */
function convertImageToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error("El archivo seleccionado no es una imagen válida."));
            return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Error al convertir a WebP."));
                    }
                }, 'image/webp', quality);
            };
            image.onerror = () => reject(new Error("Error al cargar la imagen."));
            image.src = readerEvent.target.result;
        };
        reader.onerror = () => reject(new Error("Error al leer el archivo."));
        reader.readAsDataURL(file);
    });
}

// --- Inicio de la lógica principal del CRUD ---
(function () {
    // --- Elementos DOM ---
    const section = document.getElementById('crear-producto');
    if (!section) return;

    const btnCrear = document.getElementById('cp-btnCrear');
    const imagePreview = document.getElementById('cp-imagePreview');
    const productoForm = document.getElementById('cp-productoForm');
    const imagenInput = document.getElementById('cp-imagen');

    // Función de alerta/toast
    function showCustomAlert(message, isSuccess = false) {
        if (typeof showToast === 'function') {
            showToast(message, isSuccess ? 'success' : 'error');
        } else {
            alert(message);
        }
    }

    if (btnCrear) {
        btnCrear.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. Recolección y Validación de datos
            const nombre = document.getElementById('cp-nombre').value.trim();
            const descripcion = document.getElementById('cp-descripcion').value.trim();
            const categoria = document.getElementById('cp-categoria').value;
            const precio = document.getElementById('cp-precio').value;
            const stock = document.getElementById('cp-stock')?.value || '0';
            const imagenFile = imagenInput.files[0];
            const categoryId = categoria;

            // Validación de campos
            if (!nombre) { showCustomAlert('El campo "Nombre del Producto" es obligatorio.'); return; }
            if (!descripcion) { showCustomAlert('El campo "Descripción" es obligatorio.'); return; }
            if (!categoria) { showCustomAlert('Seleccione una categoría.'); return; }
            if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) { showCustomAlert('Ingrese un precio válido mayor a 0.', false); return; }
            if (!imagenFile) { showCustomAlert('Seleccione una imagen para el producto, es obligatorio.', false); return; }

            // --- INICIO: Conversión de Imagen a WebP (ASYNC) ---
            let webpBlob;
            try {
                showCustomAlert('Procesando imagen (convirtiendo a WebP)... Por favor, espere.', false);
                webpBlob = await convertImageToWebP(imagenFile);
            } catch (err) {
                console.error('Error al convertir la imagen a WebP:', err);
                showCustomAlert(`Error al procesar la imagen: ${err.message}`, false);
                return;
            }
            // --- FIN: Conversión de Imagen a WebP ---

            // 2. Construir el objeto FormData
            const formData = new FormData();

            formData.append('name', nombre);
            formData.append('description', descripcion);
            formData.append('price', parseFloat(precio).toFixed(2));
            formData.append('stock', parseInt(stock) || 0);
            formData.append('category_id', categoryId);

            // Generamos un nombre de archivo limpio y único para WebP.
            const imageFilename = `${nombre.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.webp`;

            // Adjuntamos el BLOB convertido. Este es el nombre que tu backend DEBE usar para guardar el archivo físico.
            formData.append('image', webpBlob, imageFilename);

            console.log('Enviando FormData con imagen WebP:', imageFilename);

            try {
                // 3. Llamada a la API (POST con FormData)
                const resultado = await productAPI.create(formData);

                console.log('Producto creado exitosamente:', resultado);
                showCustomAlert(`¡Producto ${nombre} creado con éxito!`, true);

                // 4. Limpiar formulario y reiniciar UI
                productoForm.reset();
                imagePreview.innerHTML = '<div class="cp-image-placeholder">📷 Arrastre o seleccione una imagen</div>';

            } catch (error) {
                console.error('Error al crear producto:', error);
                showCustomAlert(`Error al crear producto: ${error.message || 'Verifica la consola para más detalles.'}`, false);
            }
        });
    }

    // --- Manejo de Imagen (UI) ---
    if (imagenInput) {
        imagenInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                imagePreview.innerHTML = `<div class="cp-image-placeholder">✅ Imagen seleccionada: <strong>${file.name}</strong> (Se convertirá a WebP al crear)</div>`;
            } else {
                imagePreview.innerHTML = '<div class="cp-image-placeholder">📷 Arrastre o seleccione una imagen</div>';
            }
        });
        imagePreview.addEventListener('click', () => imagenInput.click());
    }
})();