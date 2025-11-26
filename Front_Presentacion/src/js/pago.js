let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
const msgDiv = document.getElementById('mensaje-pago');

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

  const metodo = document.querySelector('input[name="metodo"]:checked').value;
  let exito = false;
  let nombreCliente = "Cliente General";

  if (metodo === 'tarjeta') {
    const num = document.getElementById('num-tarjeta').value.trim();
    const titular = document.getElementById('titular').value.trim();
    const venc = document.getElementById('vencimiento').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!titular) {
      mostrarMensajeConIcono("Pago rechazado. Intente otro método.", false);
      return;
    }
    if (titular.toLowerCase() === "error") {
      mostrarMensajeConIcono("Pago rechazado. Intente otro método.", false);
      return;
    }
    if (!num || !venc || !cvv) {
      mostrarMensajeConIcono("Pago rechazado. Intente otro método.", false);
      return;
    }

    nombreCliente = titular;
    exito = true;
  } else {
    nombreCliente = "Cliente Yape";
    exito = true;
  }

  if (exito) {
    // === CALCULAR TOTALES ===
    let subtotal = 0;
    carrito.forEach(item => {
      subtotal += item.precio * item.cantidad;
    });
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    // === GUARDAR PEDIDO EN sessionStorage ===
    const hoy = new Date();
    const pedidoGuardado = {
      id: `#ORD-${hoy.getFullYear()}-${String(carrito.length).padStart(3, '0')}`,
      fecha: hoy.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) + ' - ' + hoy.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      ubicacion: "Av. Principal 123, Distrito Centro",
      estado: 0, // Estado inicial: Pedido Recibido
      productos: carrito.map(item => ({
        nombre: item.nombre,
        opciones: item.opciones || ["Estándar"], // ← Asegurar que exista
        cantidad: item.cantidad || 1,           // ← Asegurar que exista
        precio: `S/${item.precio.toFixed(2)}`
      })),
      subtotal: subtotal.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2)
    };

    // Guardar como pedido activo y en historial
    sessionStorage.setItem('pedido-activo', JSON.stringify(pedidoGuardado));
    const historial = JSON.parse(sessionStorage.getItem('historial-pedidos')) || [];
    historial.unshift(pedidoGuardado); // Más reciente al inicio
    sessionStorage.setItem('historial-pedidos', JSON.stringify(historial));

    // === Notificar éxito y generar PDF ===
    mostrarMensajeConIcono("Pago realizado con éxito. Tu pedido ha sido confirmado.", true);
    await generarPDF(nombreCliente);
    window.location.href = 'catalogo.html?seccion=seguimiento';

    // Limpiar carrito y marcar como pagado
    sessionStorage.removeItem('carrito');
    pagoRealizado = true;
  } else {
    mostrarMensajeConIcono("Pago rechazado. Intente otro método.", false);
  }
});

// === FUNCIÓN GENERAR PDF ===
async function generarPDF(nombreCliente) {
  const { jsPDF } = window.jspdf;
  document.getElementById('nombre-cliente-boleta').textContent = nombreCliente;

  const hoy = new Date();
  const fechaStr = hoy.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  document.querySelector('.fecha-boleta').textContent = fechaStr;

  const detalleBoleta = document.getElementById('detalle-boleta');
  detalleBoleta.innerHTML = '';
  let subtotal = 0;

  carrito.forEach(item => {
    const precioUnitario = item.precio;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px;">${item.nombre}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px;">${item.opciones.join(', ')}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; text-align: right;">S/ ${precioUnitario.toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; text-align: center;">${item.cantidad}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; text-align: right;">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
    `;
    detalleBoleta.appendChild(tr);
    subtotal += item.precio * item.cantidad;
  });

  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  document.getElementById('subtotal-boleta').textContent = subtotal.toFixed(2);
  document.getElementById('igv-boleta').textContent = igv.toFixed(2);
  document.getElementById('total-boleta').textContent = total.toFixed(2);

  // === Generar PDF ===
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

