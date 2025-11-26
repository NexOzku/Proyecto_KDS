let currentFilter = 'all';
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
// Parámetros de URL (global para evitar ReferenceError cuando se usan fuera de DOMContentLoaded)
const urlParams = new URLSearchParams(window.location.search);

// ✅=== FUNCIONES EXISTENTES (NO MODIFICADAS) ===

// ✅Función para mostrar secciones del catálogo
function showSection(sectionId) {
  document.querySelectorAll('.carousel-card').forEach(card => {
    card.style.display = 'block';
  });
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById('combos-empty').classList.remove('active');
  if (sectionId === 'all') {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('active'));
    document.getElementById('combos-empty').classList.add('active');
  } else {
    const target = document.getElementById(sectionId + '-section');
    if (target) target.classList.add('active');
    if (sectionId === 'combos') {
      document.getElementById('combos-empty').classList.add('active');
    }
  }
  currentFilter = sectionId;
}

// ✅Función para filtrar tarjetas por búsqueda
function filterCards(query) {
  query = query.trim().toLowerCase();
  if (query === '') {
    showSection(currentFilter);
    return;
  }
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById('combos-empty').classList.remove('active');
  let burgerMatch = false, drinkMatch = false;
  document.querySelectorAll('#burger-carousel .carousel-card').forEach(card => {
    const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
    if (name.includes(query)) { card.style.display = 'block'; burgerMatch = true; }
    else card.style.display = 'none';
  });
  document.querySelectorAll('#drink-carousel .carousel-card').forEach(card => {
    const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
    if (name.includes(query)) { card.style.display = 'block'; drinkMatch = true; }
    else card.style.display = 'none';
  });
  if (burgerMatch) document.getElementById('burgers-section').classList.add('active');
  if (drinkMatch) document.getElementById('drinks-section').classList.add('active');
}

// ✅Función para inicializar carruseles
function initCarousel(carouselId, visibleCount = 5) {
  const carousel = document.getElementById(carouselId);
  const cards = Array.from(carousel.children);
  const totalCards = cards.length;
  const cardWidth = 262;
  let currentIndex = 0;
  cards.forEach(card => {
    card.style.minWidth = '240px';
    card.style.marginRight = '22px';
  });
  function updatePosition() {
    carousel.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
  }
  document.querySelectorAll(`.prev-btn[data-target="${carouselId.replace('-carousel', '')}"]`).forEach(btn => {
    btn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; updatePosition(); } });
  });
  document.querySelectorAll(`.next-btn[data-target="${carouselId.replace('-carousel', '')}"]`).forEach(btn => {
    btn.addEventListener('click', () => { if (currentIndex < totalCards - visibleCount) { currentIndex++; updatePosition(); } });
  });
}

// ✅=== INICIALIZAR ===
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const desdePago = urlParams.get('seccion') === 'seguimiento';
  const vistaGuardada = sessionStorage.getItem('vista-actual');

  limpiarPedidoFinalizado();

  // ✅=== Detectar si viene como administrador ===
  const desdeAdmin = urlParams.has('from') && urlParams.get('from') === 'admin';


  // ✅=== Menú de usuario ===
  const trigger = document.getElementById('user-menu-trigger');
  const dropdown = document.getElementById('user-dropdown');
  const icon = document.getElementById('dropdown-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const seguimientoBtn = document.getElementById('seguimiento-btn');

  // ✅=== Determinar rol del usuario ===
  let roleText = 'Cliente';
  const savedRole = sessionStorage.getItem('userRole');

  if (desdeAdmin) {

    // ✅Viene desde admin → activar modo admin y persistir
    roleText = 'Administrador';
    sessionStorage.setItem('userRole', 'administrador');
    history.replaceState({}, document.title, 'catalogo.html');

  } else if (savedRole === 'administrador') {

    // ✅Ya estaba en modo admin (ej: tras volver de pago.html) → mantenerlo
    roleText = 'Administrador';
  } else {

    // ✅Acceso normal → forzar "Cliente" y limpiar cualquier rastro
    sessionStorage.removeItem('userRole');
    roleText = 'Cliente';
  }

  // ✅=== Actualizar el bloque de usuario ===
  const userBlock = document.querySelector('.header-user-block');
  if (userBlock) {
    userBlock.innerHTML = `
      <span class="header-user-name">
        Samir Aguilar<br>
        <span style="font-size:12px; font-weight:normal; color:rgba(255,255,255,0.85);">${roleText}</span>
      </span>
      <div class="header-user-avatar">
        <img src="img/iconos/account_circle.svg" alt="Usuario" />
        <span class="dropdown-icon" id="dropdown-icon">▼</span>
      </div>
    `;
  }

  // ✅=== Configurar el menú desplegable ===
  if (trigger && dropdown && icon) {
    // ✅Toggle del menú
    const toggle = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      icon.textContent = dropdown.classList.contains('active') ? '▲' : '▼';
    };

    // ✅Eventos
    trigger.addEventListener('click', toggle);
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        icon.textContent = '▼';
      }
    });

    // ✅=== Mostrar/ocultar el botón "Admin Panel" según el rol ===
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    if (adminPanelBtn) {

      if (roleText === 'Administrador') {
        // ✅Mostrar botón Admin Panel
        adminPanelBtn.style.display = 'block';
        adminPanelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.remove('active');
          document.getElementById('dropdown-icon').textContent = '▼';
          window.location.href = 'admin.html';
        });
      } else {
        // ✅Ocultar botón Admin Panel
        adminPanelBtn.style.display = 'none';
      }
    }
  }

  // ✅=== Botón de seguimiento ===
  if (seguimientoBtn) {
    seguimientoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('active');
      document.getElementById('dropdown-icon').textContent = '▼';
      mostrarSeguimiento();
    });
  }

  // ✅=== Cerrar sesión ===
  if (logoutBtn) {
    // En lugar de cerrar sesión directamente, mostramos un modal de confirmación
    logoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = document.getElementById('confirmModal');
      if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
      }
      // cerrar dropdown
      if (dropdown) dropdown.classList.remove('active');
      const iconEl = document.getElementById('dropdown-icon');
      if (iconEl) iconEl.textContent = '▼';
    });
  }
  // Handlers del modal de cierre de sesión (IDs iguales a admin.html)
  const confirmModal = document.getElementById('confirmModal');
  const confirmProceed = document.getElementById('confirmProceed');
  const confirmCancel = document.getElementById('confirmCancel');

  if (confirmCancel) {
    confirmCancel.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (confirmModal) {
        confirmModal.classList.remove('active');
        confirmModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (confirmModal) {
    // cerrar modal al click fuera del diálogo
    confirmModal.addEventListener('click', (ev) => {
      if (ev.target === confirmModal) {
        confirmModal.classList.remove('active');
        confirmModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (confirmProceed) {
    confirmProceed.addEventListener('click', () => {
      // Acción de cerrar sesión: limpiar storage y redirigir
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  }

  // ✅=== Lógica de vista inicial ===
  if (desdePago) {
    mostrarSeguimiento();
    sessionStorage.setItem('vista-actual', 'seguimiento');
    history.replaceState({}, document.title, window.location.pathname);

  } else if (vistaGuardada === 'seguimiento') {

    mostrarSeguimiento();
  } else if (vistaGuardada === 'historial') {

    mostrarHistorial();
  } else {

    sessionStorage.setItem('vista-actual', 'catalogo');
    mostrarCatalogo();
  }


});

// ✅=== EVENTOS DE NAVEGACIÓN ===
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => showSection(item.getAttribute('data-section')));
});

// ✅=== LOGICA DE CATALOGO ===
document.getElementById('logo')?.addEventListener('click', () => {
  document.querySelector('.nav').style.display = 'flex';
  document.querySelector('.catalog').style.display = 'block';
  document.getElementById('product-detail').style.display = 'none';
  const contenedor = document.getElementById('seguimiento-container');
  if (contenedor) contenedor.style.display = 'none';
  sessionStorage.setItem('vista-actual', 'catalogo');
  showSection('all');
  initCarousel('burger-carousel', 5);
  initCarousel('drink-carousel', 3);
  history.replaceState({}, document.title, window.location.pathname);
});

document.getElementById('search-input')?.addEventListener('input', (e) => filterCards(e.target.value));

// ✅=== ALERTA PERSONALIZADA ===
const customAlert = document.getElementById('custom-alert');
if (customAlert) {
  document.getElementById('close-alert')?.addEventListener('click', () => customAlert.style.display = 'none');
  document.querySelectorAll('.carousel-card').forEach(card => {
    if (card.classList.contains('warning')) {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        customAlert.style.display = 'flex';
      });
    }
  });
}

// ✅=== CARRITO ===
const modalCarrito = document.getElementById("modal-carrito");
const cerrarModal = document.getElementById("cerrarModalCarrito");
const carritoItems = document.getElementById("carrito-items");
const totalGeneral = document.getElementById("total-general");
const contadorEl = document.getElementById("carrito-contador");
const carritoIcon = document.getElementById("carrito-container");

if (carritoIcon) {
  carritoIcon.addEventListener("click", () => {
    renderizarCarrito();
    modalCarrito.style.display = "flex";
  });
}
if (cerrarModal) {
  cerrarModal.addEventListener("click", () => modalCarrito.style.display = "none");
}
window.addEventListener("click", (e) => {
  if (e.target === modalCarrito) modalCarrito.style.display = "none";
});

// ✅=== FUNCIONES DEL CARRITO ===
function agregarAlCarrito(producto) {
  const existente = carrito.find(item =>
    item.nombre === producto.nombre &&
    JSON.stringify(item.opciones) === JSON.stringify(producto.opciones)
  );
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      nombre: producto.nombre,
      imagen: producto.imagen,
      precio: producto.precio,
      cantidad: 1,
      opciones: producto.opciones
    });
  }
  guardarCarrito();
  actualizarContadorCarrito();
  mostrarToast("Producto agregado al carrito 🛒");
}

function renderizarCarrito() {
  carritoItems.innerHTML = "";
  if (carrito.length === 0) {
    carritoItems.innerHTML = `<p class="vacio">Tu carrito está vacío</p>`;
    totalGeneral.textContent = "0.00";
    return;
  }
  const encabezado = document.createElement("div");
  encabezado.className = "carrito-encabezado";
  encabezado.innerHTML = `<span>Producto</span><span>Personalización</span><span>Cantidad</span><span>Subtotal</span><span></span>`;
  carritoItems.appendChild(encabezado);
  carrito.forEach((item, index) => {
    const fila = document.createElement("div");
    fila.className = "carrito-fila";
    const productoCol = document.createElement("div");
    productoCol.className = "carrito-producto";
    productoCol.innerHTML = `<img src="${item.imagen}" alt="${item.nombre}"><span>${item.nombre}</span>`;
    const opcionesCol = document.createElement("div");
    opcionesCol.className = "carrito-opciones-scroll";
    opcionesCol.textContent = item.opciones.length ? item.opciones.join(", ") : "Estándar";
    const cantidadCol = document.createElement("input");
    cantidadCol.type = "number";
    cantidadCol.min = "1";
    cantidadCol.value = item.cantidad;
    cantidadCol.className = "input-cantidad";
    cantidadCol.addEventListener("input", (e) => {
      const val = parseInt(e.target.value) || 1;
      item.cantidad = val;
      subtotalCol.textContent = `S/.${(item.precio * item.cantidad).toFixed(2)}`;
      actualizarTotalGeneral();
      guardarCarrito();
      actualizarContadorCarrito();
    });
    const subtotalCol = document.createElement("div");
    subtotalCol.className = "subtotal";
    subtotalCol.textContent = `S/.${(item.precio * item.cantidad).toFixed(2)}`;
    const eliminarCol = document.createElement("span");
    eliminarCol.className = "eliminar-item";
    eliminarCol.textContent = "✖";
    eliminarCol.addEventListener("click", () => {
      carrito.splice(index, 1);
      guardarCarrito();
      renderizarCarrito();
      actualizarContadorCarrito();
    });
    fila.append(productoCol, opcionesCol, cantidadCol, subtotalCol, eliminarCol);
    carritoItems.appendChild(fila);
  });
  actualizarTotalGeneral();
}

function actualizarTotalGeneral() {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  totalGeneral.textContent = total.toFixed(2);
}

function actualizarContadorCarrito() {
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contadorEl.textContent = total;
  contadorEl.style.animation = "none";
  setTimeout(() => { contadorEl.style.animation = "pulse 0.4s"; }, 10);
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function mostrarToast(texto) {
  if (document.querySelector(".carrito-toast")) return;
  const toast = document.createElement("div");
  toast.className = "carrito-toast";
  toast.textContent = texto;
  document.body.appendChild(toast);
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

// ✅=== DETALLE DE PRODUCTO ===
const catalogDiv = document.querySelector('.catalog');
const productDetailDiv = document.getElementById('product-detail');
const firstBurgerCard = document.querySelector('#burger-carousel .carousel-card:first-child');

if (firstBurgerCard) {
  firstBurgerCard.addEventListener('click', function (e) {
    e.stopPropagation();
    const name = this.querySelector('.product-name').textContent;
    const imgSrc = this.querySelector('img').src;
    const description = this.querySelector('.product-desc').textContent;
    const basePriceText = this.querySelector('.product-price').textContent;
    const basePrice = parseFloat(basePriceText.replace('S/.', '').replace(' (30% desc)', ''));
    document.getElementById('detail-title').textContent = name;
    document.getElementById('detail-image').src = imgSrc;
    document.getElementById('detail-description').textContent = description;
    document.getElementById('detail-price').textContent = `Precio: S/.${basePrice.toFixed(2)}`;
    catalogDiv.style.display = 'none';
    productDetailDiv.style.display = 'block';
    const checkboxes = document.querySelectorAll('#product-detail input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        let total = basePrice;
        checkboxes.forEach(c => {
          if (c.checked) total += parseFloat(c.getAttribute('data-price'));
        });
        document.getElementById('detail-price').textContent = `Precio: S/.${total.toFixed(2)}`;
      });
    });
    document.getElementById('add-to-cart-btn').onclick = () => {
      let total = basePrice;
      const opcionesSeleccionadas = [];
      checkboxes.forEach(cb => {
        if (cb.checked) {
          total += parseFloat(cb.getAttribute('data-price'));
          const label = cb.closest('label').textContent.trim();
          const opcion = label.split(' (+')[0].replace('Pan ', '').replace('Sin ', '');
          opcionesSeleccionadas.push(opcion);
        }
      });
      const producto = {
        nombre: name,
        imagen: imgSrc,
        precio: total,
        opciones: opcionesSeleccionadas.length ? opcionesSeleccionadas : ["Estándar"]
      };
      agregarAlCarrito(producto);
    };
  });
}

// ✅=== Volver al catálogo desde detalle ===
document.getElementById('back-to-catalog')?.addEventListener('click', () => {
  productDetailDiv.style.display = 'none';
  catalogDiv.style.display = 'block';
});

// ✅=== Comprar y proceder al pago ===
document.getElementById('btn-comprar')?.addEventListener('click', () => {
  if (carrito.length === 0) {
    mostrarToast("Tu carrito está vacío");
    return;
  }
  guardarCarrito();
  window.location.href = 'pago.html';
});

// Nota: las reglas de animación y estilos del carrito ahora están en `css/catalogo.css`.

// ✅=== LIMPIAR PEDIDO FINALIZADO AL CARGAR ===
function limpiarPedidoFinalizado() {
  const pedidoActivo = JSON.parse(localStorage.getItem('pedido-activo'));
  if (pedidoActivo && pedidoActivo.estado >= 3) {
    localStorage.removeItem('pedido-activo');
  }
}

// ✅=== MOSTRAR SEGUIMIENTO ===
function mostrarSeguimiento() {
  document.querySelector('.nav').style.display = 'none';
  document.querySelector('.catalog').style.display = 'none';
  document.getElementById('product-detail').style.display = 'none';
  const contenedor = document.getElementById('seguimiento-container');
  if (!contenedor) return;
  contenedor.style.display = 'block';
  contenedor.style.opacity = '0';
  contenedor.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    contenedor.style.opacity = '1';
    renderizarSeguimiento();
  }, 50);
  sessionStorage.setItem('vista-actual', 'seguimiento');
}

// ✅=== RENDERIZAR SEGUIMIENTO ===
function renderizarSeguimiento() {
  const contenedor = document.getElementById('seguimiento-container');
  const pedidoActivo = JSON.parse(localStorage.getItem('pedido-activo'));
  const historial = JSON.parse(localStorage.getItem('historial-pedidos')) || [];

  if (!pedidoActivo) {
    contenedor.classList.add('seguimiento-vacio');
    contenedor.innerHTML = `
      <button class="seguimiento-back-btn" id="back-to-catalog-seguimiento">← Volver al catálogo</button>
      <div class="seguimiento-panel" style="height: 400px; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:30px; background:#fff; max-width:600px; margin:35px auto; border-radius:16px; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
        <h1 style="font-size:24px; font-weight:700; color:#2c3e50; margin-bottom:20px;">Seguimiento de Pedido</h1>
        <div style="text-align:center; margin:20px 0; color:#777;">
          <div style="font-size:60px; margin-bottom:20px;">📦</div>
          <p style="font-size:18px; font-weight:600; color:#555; margin-bottom:10px;">No tienes pedidos pendientes</p>
          <p style="font-size:15px; color:#888;">Realiza una compra para ver el estado en tiempo real.</p>
        </div>
        <button id="btn-historial-vacio" class="btn-historial"
          style="background:#e0e0e0; color:#333; border:none; padding:12px 28px; border-radius:12px; font-weight:600; cursor:pointer; transition:background 0.2s;">
          Ver Historial de Pedidos
        </button>
      </div>
    `;
    document.getElementById('btn-historial-vacio').addEventListener('click', () => {
      mostrarHistorial();
    });
    document.getElementById('back-to-catalog-seguimiento').addEventListener('click', (e) => {
      e.stopPropagation();
      mostrarCatalogo();
    });
    return;
  }

  const productosDetalle = pedidoActivo.productos.map(p => {
    let detalle = p.nombre;
    if (p.opciones && Array.isArray(p.opciones) && p.opciones.length > 0) {
      const opcionesFiltradas = p.opciones.filter(opt =>
        !opt.includes("Estándar") &&
        opt !== "Sin queso extra" &&
        opt !== "Solo carne clásica" &&
        opt !== "Estándar (lechuga, tomate, cebolla)"
      );
      if (opcionesFiltradas.length > 0) {
        detalle += ` (${opcionesFiltradas.join(', ')})`;
      }
    }
    if (p.cantidad && p.cantidad > 0) {
      detalle += ` x${p.cantidad}`;
    }
    return detalle;
  });

  const estadosTexto = ["Pedido Recibido", "En Preparación", "Listo para Entrega", "Entregado"];
  const estadoActual = pedidoActivo.estado;
  const mensajes = [
    { titulo: "¡Tu pedido fue recibido!", tiempo: "Llega en 15-20 minutos", color: "#e8f5e9", borderColor: "#4caf50", textColor: "#2e7d32", timeColor: "#1b5e20" },
    { titulo: "¡Tu comida se está preparando!", tiempo: "Llega en 10-15 minutos", color: "#fff8e1", borderColor: "#ffc107", textColor: "#e65100", timeColor: "#bf360c" },
    { titulo: "¡Tu pedido está listo para entrega!", tiempo: "Llega en 3-5 minutos", color: "#e3f2fd", borderColor: "#2196f3", textColor: "#1565c0", timeColor: "#0d47a1" },
    { titulo: "¡Pedido entregado!", tiempo: "Gracias por tu compra 🙌", color: "#f1f8e9", borderColor: "#8bc34a", textColor: "#689f38", timeColor: "#33691e" }
  ];
  const msg = mensajes[estadoActual] || mensajes[0];

  contenedor.classList.remove('seguimiento-vacio');
  contenedor.innerHTML = `
    <button class="seguimiento-back-btn" id="back-to-catalog-seguimiento">← Volver al catálogo</button>
    <div class="seguimiento-panel" style="height:100%; overflow-y:auto; padding:24px; background:#fff; max-width:600px; margin:35px auto; border-radius:16px; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
      <h1 style="font-size:24px; font-weight:700; color:#2c3e50; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #eee;">Seguimiento de Pedido</h1>
      <div style="background:#f9f9f9; padding:16px; border-radius:12px; margin-bottom:24px; font-size:14px; color:#555;">
        <p><strong>ID del pedido:</strong> ${pedidoActivo.id}</p>
        <p><strong>Fecha:</strong> ${pedidoActivo.fecha}</p>
        <p><strong>Última actualización:</strong> <span id="ultima-actualizacion">${pedidoActivo.fecha}</span></p>
      </div>
      <div class="tiempo-estimado" style="background:${msg.color}; border-left:4px solid ${msg.borderColor}; padding:16px; border-radius:8px; margin-bottom:24px; text-align:center;">
        <h3 style="color:${msg.textColor}; font-size:18px; margin-bottom:8px;">${msg.titulo}</h3>
        <p style="font-size:16px; font-weight:600; color:${msg.timeColor};">${msg.tiempo}</p>
      </div>
      <div style="position:relative; margin-bottom:30px;">
        <div style="position:absolute; top:20px; left:0; right:0; height:4px; background:#e0e0e0; z-index:1;"></div>
        <div class="progress-line" style="position:absolute; top:20px; left:0; height:4px; background:#4caf50; width:${(estadoActual / 3) * 100}%; transition:width 0.4s ease; z-index:2;"></div>
        <div style="display:flex; justify-content:space-between; position:relative; z-index:3;">
          ${estadosTexto.map((label, i) => `
            <div class="step" style="display:flex; flex-direction:column; align-items:center;">
              <div class="step-circle" style="width:36px; height:36px; border-radius:50%; background:${i <= estadoActual ? '#4caf50' : '#e0e0e0'}; color:${i <= estadoActual ? 'white' : '#777'}; display:flex; align-items:center; justify-content:center; font-weight:600; margin-bottom:10px;">${i + 1}</div>
              <div class="step-label" style="font-size:12px; color:${i <= estadoActual ? '#4caf50' : '#777'}; text-align:center; max-width:90px; line-height:1.3; font-weight:${i <= estadoActual ? '600' : 'normal'};">${label}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="background:#fff8f4; padding:20px; border-radius:12px; margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#d35400; margin-bottom:16px;">Detalles del Pedido</h2>
        ${productosDetalle.map((detalle, i) => `
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f0f0f0; font-size:16px;">
            <span>${detalle}</span>
            <span style="font-weight:600; color:#e67e22;">${pedidoActivo.productos[i].precio}</span>
          </div>
        `).join('')}
      </div>
      <div style="background:#f0f9ff; padding:20px; border-radius:12px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:15px;">
          <span>Subtotal</span>
          <span>S/${pedidoActivo.subtotal}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:15px;">
          <span>IGV</span>
          <span>S/${pedidoActivo.igv}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; margin-top:12px; padding-top:12px; border-top:1px dashed #ccc; font-weight:700; font-size:17px; color:#e67e22;">
          <span>Total</span>
          <span>S/${pedidoActivo.total}</span>
        </div>
      </div>
      <div style="background:#f0f7ff; padding:16px; border-radius:12px; margin-bottom:24px;">
        <p><strong>Ubicación de entrega:</strong><br>${pedidoActivo.ubicacion}</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <button id="btn-actualizar" style="background:${estadoActual >= 3 ? '#ccc' : '#4caf50'}; color:white; border:none; padding:14px; border-radius:12px; font-size:17px; font-weight:600; cursor:${estadoActual >= 3 ? 'not-allowed' : 'pointer'};">
          ${estadoActual >= 3 ? "Pedido Finalizado" : "Actualizar Estado"}
        </button>
        <button id="btn-historial" style="background:#e0e0e0; color:#333; border:none; padding:14px; border-radius:12px; font-size:17px; font-weight:600; cursor:pointer;">Ver Historial de Pedido</button>
      </div>
    </div>
  `;

  document.getElementById('btn-actualizar').addEventListener('click', () => {
    if (estadoActual < 3) {
      pedidoActivo.estado++;
      localStorage.setItem('pedido-activo', JSON.stringify(pedidoActivo));
      const historial = JSON.parse(localStorage.getItem('historial-pedidos')) || [];
      const index = historial.findIndex(p => p.id === pedidoActivo.id);
      if (index !== -1) {
        historial[index] = { ...pedidoActivo };
        localStorage.setItem('historial-pedidos', JSON.stringify(historial));
      }
      renderizarSeguimiento();
    }
  });

  document.getElementById('btn-historial').addEventListener('click', () => {
    mostrarHistorial();
  });
  document.getElementById('back-to-catalog-seguimiento').addEventListener('click', (e) => {
    e.stopPropagation();
    mostrarCatalogo();
  });
  sessionStorage.setItem('vista-actual', 'seguimiento');
}

// ✅=== MOSTRAR HISTORIAL ===
function mostrarHistorial() {
  const contenedor = document.getElementById('seguimiento-container');
  const historial = JSON.parse(localStorage.getItem('historial-pedidos')) || [];

  contenedor.classList.remove('seguimiento-vacio');
  contenedor.innerHTML = `
    <div class="seguimiento-panel" style="height:100%; overflow-y:auto; padding:24px; background:#fff; max-width:600px; margin:35px auto; border-radius:16px; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
      <h1 style="font-size:24px; font-weight:700; color:#2c3e50; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #eee;">Historial de Pedidos</h1>
      <button id="btn-volver-historial"
        style="background: #f1c40f; color: #2c3e50; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 6px; width: auto;">
        ← Volver al seguimiento
      </button>
      <div id="lista-historial"></div>
    </div>
  `;

  if (historial.length === 0) {
    document.getElementById('lista-historial').innerHTML = `
      <div style="text-align:center; padding:30px 0; color:#777;">
        <div style="font-size:50px; margin-bottom:16px;">📜</div>
        <p>No has realizado ningún pedido aún.</p>
      </div>
    `;
  } else {
    document.getElementById('lista-historial').innerHTML = historial.map(p => {
      const estados = ["Pedido Recibido", "En Preparación", "Listo para Entrega", "Entregado"];
      return `
        <div class="historial-item" data-id="${p.id}" 
          style="padding:16px; border:1px solid #eee; border-radius:12px; margin-bottom:12px; cursor:pointer; background:#fafafa; transition:background 0.2s;">
          <div style="font-weight:600; color:#2c3e50;">${p.id}</div>
          <div style="font-size:13px; color:#666; margin-top:4px;">${p.fecha}</div>
          <div style="font-size:14px; color:#4caf50; margin-top:4px;">${estados[p.estado]}</div>
          <div style="font-weight:600; color:#e67e22; margin-top:6px;">Total: S/${p.total}</div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('btn-volver-historial').addEventListener('click', () => {
    renderizarSeguimiento();
  });

  document.querySelectorAll('.historial-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const pedido = historial.find(p => p.id === id);
      if (pedido) {
        localStorage.setItem('pedido-activo', JSON.stringify(pedido));
        renderizarSeguimiento();
      }
    });
  });
  sessionStorage.setItem('vista-actual', 'seguimiento');
}

// ✅=== MOSTRAR CATÁLOGO ===
function mostrarCatalogo() {
  document.querySelector('.nav').style.display = 'flex';
  document.querySelector('.catalog').style.display = 'block';
  document.getElementById('product-detail').style.display = 'none';
  const seguimientoCont = document.getElementById('seguimiento-container');
  if (seguimientoCont) {
    seguimientoCont.style.display = 'none';
    seguimientoCont.classList.remove('seguimiento-vacio');
  }
  actualizarContadorCarrito();
  showSection('all');
  initCarousel('burger-carousel', 5);
  initCarousel('drink-carousel', 3);
}

// ✅=== Detectar si viene explícitamente como administrador ===
const desdeAdmin = urlParams.has('from') && urlParams.get('from') === 'admin';
const savedRole = sessionStorage.getItem('userRole');

let roleText = 'Cliente';

if (desdeAdmin) {
  roleText = 'Administrador';
  sessionStorage.setItem('userRole', 'administrador');
  history.replaceState({}, document.title, 'catalogo.html');
} else if (savedRole === 'administrador') {
  roleText = 'Administrador';
} else {
  sessionStorage.removeItem('userRole');
  roleText = 'Cliente';
}

// ✅=== Actualizar el bloque de usuario ===
const userBlock = document.querySelector('.header-user-block');
if (userBlock) {
  userBlock.innerHTML = `
    <span class="header-user-name">
      Samir Aguilar<br>
      <span style="font-size:12px; font-weight:normal; color:rgba(255,255,255,0.85);">${roleText}</span>
    </span>
    <div class="header-user-avatar">
      <img src="img/iconos/account_circle.svg" alt="Usuario" />
      <span class="dropdown-icon" id="dropdown-icon">▼</span>
    </div>
  `;
}