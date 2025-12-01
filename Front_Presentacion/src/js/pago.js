const CART_STORAGE_KEY = 'miBarrioBurgerCart';
const msgDiv = document.getElementById('mensaje-pago');
const carrito = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
const userData = JSON.parse(localStorage.getItem('user')) || 
                 JSON.parse(sessionStorage.getItem('user'));




let nombreClienteDB = "Cliente sin sesión";
if (userData && userData.first_name) {
    nombreClienteDB = `${userData.first_name} ${userData.last_name}`;
}
// === Verificar carrito vacío al cargar ===
if (carrito.length === 0) {
  msgDiv.innerHTML = "Tu carrito ya fue procesado. No puedes realizar otro pago.";
  msgDiv.className = "error";
  msgDiv.style.display = "block";
  document.getElementById('btn-pagar').disabled = true;
  document.getElementById('btn-pagar').style.opacity = '0.6';
  document.getElementById('btn-pagar').style.cursor = 'not-allowed';
}

const metodos = document.querySelectorAll('input[name="metodo"]');
const camposTarjeta = document.querySelector('.campos-tarjeta');
const camposYape = document.querySelector('.campos-yape');
let pagoRealizado = false;

metodos.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'tarjeta') {
      camposTarjeta.classList.add('activo');
      camposYape.classList.remove('activo');
    } else {
      camposTarjeta.classList.remove('activo');
      camposYape.classList.add('activo');
    }
    msgDiv.style.display = 'none';
  });
});
// === FUNCIONES DE MENSAJE ===
function mostrarMensajeConIcono(mensaje, esExito) {
  const iconSrc = esExito ? 'img/iconos/check_circle.svg' : 'img/iconos/cancel.svg';
  msgDiv.innerHTML = `
    <img src="${iconSrc}" alt="${esExito ? 'Éxito' : 'Error'}" style="vertical-align: middle; margin-right: 8px; width: 24px; height: 24px;">
    ${mensaje}
  `;
  msgDiv.className = esExito ? 'exito' : 'error';
  msgDiv.style.display = 'block';
}

function mostrarMensajeTexto(mensaje, esError = true) {
  msgDiv.textContent = mensaje;
  msgDiv.className = esError ? 'error' : 'exito';
  msgDiv.style.display = 'block';
}

// === BOTÓN PAGAR ===
document.getElementById('btn-pagar').addEventListener('click', async () => {
  if (pagoRealizado) {
    mostrarMensajeTexto("Tu carrito ya fue procesado. No puedes realizar otro pago.");
    return;
  }
const metodoSeleccionado = document.querySelector('input[name="metodo"]:checked');
if (!metodoSeleccionado) {
  mostrarMensajeConIcono("Selecciona un método de pago.", false);
  return;
}
  const metodo = document.querySelector('input[name="metodo"]:checked').value;
  let exito = false;
  let nombreCliente = "Cliente General";

if (metodo === 'tarjeta') {
        const num = document.getElementById('num-tarjeta').value.trim();
        const titular = document.getElementById('titular').value.trim();
        const venc = document.getElementById('vencimiento').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        
        // Comprobar que los campos mínimos estén llenos
        if (!titular || !num || !venc || !cvv) {
          mostrarMensajeConIcono("Pago rechazado: Faltan datos de la tarjeta.", false);
          return;
        }

        // Mantenemos la prueba de error intencional (si se desea)
        if (titular.toLowerCase() === "error") { 
          mostrarMensajeConIcono("Pago rechazado. Titular bloqueado.", false);
          return;
        }

        // Si pasa las validaciones básicas, SIMULA ÉXITO
        nombreCliente = titular;
        exito = true; // Se marca como exitoso y continúa el flujo
    } else {
        nombreCliente = "Cliente Yape";
        exito = true;
    }

  if (exito) {
    const ahora = new Date();
  const fechaStr = ahora.toLocaleString('es-PE');
    // === CALCULAR TOTALES ===
    let subtotal = 0;
    carrito.forEach(item => {
      subtotal += item.precio * item.cantidad;
    });
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    // === GUARDAR PEDIDO EN sessionStorage ===
const hoy = new Date();
const fechaFormateada =
  hoy.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) +
  ' - ' +
  hoy.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });

const pedidoGuardado = {
  id: `#ORD-${hoy.getFullYear()}-${String(carrito.length).padStart(3, '0')}`,
  fecha: fechaStr,
  ubicacion: "Av. Principal 123, Distrito Centro",
  estado: 0,
  productos: carrito.map(item => {
    const precio = Number(item.precio);
    const precioLimpio = isNaN(precio) ? 0 : precio;
    const opcionesLimpio = Array.isArray(item.opciones)
      ? item.opciones
      : (item.opciones ? [String(item.opciones)] : ["Estándar"]);

    return {
      nombre: item.nombre || "Producto Desconocido",
      opciones: opcionesLimpio,
      cantidad: item.cantidad || 1,
      precio: `S/${precioLimpio.toFixed(2)}`
    };
  }),
  subtotal: subtotal.toFixed(2),
  igv: igv.toFixed(2),
  total: total.toFixed(2)
};

sessionStorage.setItem('pedido-activo', JSON.stringify(pedidoGuardado));
const historial = JSON.parse(sessionStorage.getItem('historial-pedidos')) || [];
historial.unshift(pedidoGuardado);
sessionStorage.setItem('historial-pedidos', JSON.stringify(historial));

    // Guardar como pedido activo y en historial
    sessionStorage.setItem('pedido-activo', JSON.stringify(pedidoGuardado));
    historial.unshift(pedidoGuardado); // Más reciente al inicio
    sessionStorage.setItem('historial-pedidos', JSON.stringify(historial));

    // === Notificar éxito y generar PDF ===
    mostrarMensajeConIcono("Pago realizado con éxito. Tu pedido ha sido confirmado.", true);
console.log('carrito antes de generarPDF:', carrito);
  generarPDF(nombreClienteDB);

setTimeout(() => {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.location.href = 'catalogo.html?seccion=seguimiento';
}, 2000);

    // Limpiar carrito y marcar como pagado
    sessionStorage.removeItem(CART_STORAGE_KEY);  // 'carrito'
    pagoRealizado = true;
  } else {
    mostrarMensajeConIcono("Pago rechazado. Intente otro método.", false);
  }
});

// === FUNCIÓN GENERAR PDF ===
async function generarPDF(nombreClienteDB) {
  const detalleBoleta = document.getElementById('detalle-boleta');
  const subtotalSpan = document.getElementById('subtotal-boleta');
  const igvSpan = document.getElementById('igv-boleta');
  const totalSpan = document.getElementById('total-boleta');
  const fechaBoletaSpan = document.querySelector('.fecha-boleta');
  const nombreClienteSpan = document.getElementById('nombre-cliente-boleta');
  const dniClienteSpan = document.getElementById('dni-cliente-boleta');
  const emailClienteSpan = document.getElementById('email-cliente-boleta');

  // Leer usuario desde storage
  const userData = JSON.parse(localStorage.getItem('user')) ||
                   JSON.parse(sessionStorage.getItem('user')) || {};

  const nombreCompleto =
    nombreClienteDB ||
    `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
    'Cliente General';

  nombreClienteSpan.textContent = nombreCompleto;
  dniClienteSpan.textContent = userData.nro_document || '---------';
  emailClienteSpan.textContent = userData.email || '---------';
  const ahora = new Date();
  const fechaStr = ahora.toLocaleString('es-PE');
  fechaBoletaSpan.textContent = fechaStr;

  // Llenar filas y calcular totales
let subtotal = 0;

carrito.forEach(item => {
  // Precio
const rawPrice = item.final_price ?? item.precio ?? item.base_price ?? item.price;
const precioNum = Number(rawPrice);
const precio = isNaN(precioNum) ? 0 : precioNum;

  // Cantidad
  const cantidad = Number(item.cantidad ?? item.quantity) || 1;

  const totalItem = precio * cantidad;

  // PERSONALIZACIÓN (extras)
  let opciones = 'Estándar';

  if (Array.isArray(item.extras) && item.extras.length > 0) {
    const textos = item.extras.map(extra => {
      if (typeof extra === 'string') return extra;
      if (extra && typeof extra === 'object') {
        if (extra.name && extra.price) {
          return `${extra.name} (+S/${extra.price})`;
        }
        if (extra.name) return extra.name;
        return JSON.stringify(extra);
      }
      return String(extra);
    });
    opciones = textos.join(', ');
  } else if (Array.isArray(item.opciones) && item.opciones.length > 0) {
    opciones = item.opciones.join(', ');
  } else if (item.opciones) {
    opciones = String(item.opciones);
  }

  const nombreProducto = item.nombre ?? item.name ?? 'N/A';

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px;">${nombreProducto}</td>
    <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px;">${opciones}</td>
    <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; text-align: right;">S/ ${precio.toFixed(2)}</td>
    <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; text-align: center;">${cantidad}</td>
    <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; text-align: right;">S/ ${totalItem.toFixed(2)}</td>
  `;
  detalleBoleta.appendChild(tr);
  subtotal += totalItem;
});

  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  subtotalSpan.textContent = subtotal.toFixed(2);
  igvSpan.textContent = igv.toFixed(2);
  totalSpan.textContent = total.toFixed(2);

  // Generar PDF
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', 'a4');
  const boleta = document.getElementById('boleta-pdf');

  const canvas = await html2canvas(boleta, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 20;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }

  pdf.save(`Boleta_MiBarrioBurger_${fechaStr.replace(/\//g, '-')}.pdf`);
}

