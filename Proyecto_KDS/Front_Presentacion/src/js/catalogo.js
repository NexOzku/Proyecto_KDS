let currentFilter = 'all';
let ALL_PRODUCTS = [];
let DRINK_OPTIONS = [];
const CART = [];
const cartModal = document.getElementById('modal-carrito');
const cartItemsDiv = document.getElementById('carrito-items');
const cartTotalSpan = document.getElementById('total-general');
const closeCartSpan = document.getElementById('cerrarModalCarrito');
const cartIconBtn = document.getElementById('carrito-container');

function initDrinkOptions() {
  DRINK_OPTIONS = ALL_PRODUCTS.filter(p => Number(p.category_id) === 9);
}
const detailTitle = document.getElementById('detail-title');
const detailImage = document.getElementById('detail-image');
const detailDescription = document.getElementById('detail-description');
const detailPrice = document.getElementById('detail-price');
let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
// Parámetros de URL (global para evitar ReferenceError cuando se usan fuera de DOMContentLoaded)
const urlParams = new URLSearchParams(window.location.search);

document.addEventListener('DOMContentLoaded', () => {
  const vista = sessionStorage.getItem('vista-actual');
  if (vista === 'seguimiento') {
    mostrarSeguimiento();
  } else {
    mostrarCatalogo();
  }
});













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

function getProductImageUrl(product) {
  const img = product?.image;
  if (!img) return 'img/placeholder.png';

  // Si ya es URL completa
  if (img.startsWith('http')) return img;

  // Si empieza con "uploads/" o "/uploads/", solo agrega dominio
  if (img.startsWith('uploads/') || img.startsWith('/uploads/')) {
    return 'http://burger-api-sandbox.com/' + img.replace(/^\/+/, '');
  }

  // Si solo es nombre de archivo (caso futuro)
  return 'http://burger-api-sandbox.com/uploads/products/' + img;
}

const API_URL = 'http://burger-api-sandbox.com/auth/products';

async function getProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener productos');
    const data = await res.json();   // <- es el array con category_id, name, description, price, etc.
    return data;
  } catch (err) {
    console.error('Error en getProducts:', err);
    return [];
  }
}
async function loadAndRenderProducts() {
  // 1. Obtener los productos de la API
  const products = await getProducts(); // Esta función trae los datos
  ALL_PRODUCTS = products;
  initDrinkOptions();
  if (!products || products.length === 0) {
    console.log('No se pudieron cargar productos.');
    return;
  }
  initDrinkOptions();
  // 2. Definir los contenedores por ID
  const burgerCarousel = document.getElementById('burger-carousel');   // ID para Categoría 1
  const drinkCarousel = document.getElementById('drink-carousel');    // ID para Categoría 2
  const combosCarousel = document.getElementById('combos-carousel');  // ID para Categoría 3
  const combosEmpty = document.getElementById('combos-empty');

  inicializarEventosCarrito();
  let combosCount = 0; // Contador para saber si hay combos

  //Actualizar el Precio de Extras
  function renderDynamicOptions(product) {
    const panCont = document.getElementById('opts-pan');
    const quesoCont = document.getElementById('opts-queso');
    const protCont = document.getElementById('opts-proteina');
    const compCont = document.getElementById('opts-complementos');

    // limpiar anteriores
    [panCont, quesoCont, protCont, compCont].forEach(c => c.innerHTML = '');

    if (!Array.isArray(product.extras)) return;

    product.extras.forEach(extra => {
      const label = document.createElement('label');
      label.innerHTML = `
      <input type="checkbox" data-price="${extra.price}">
      ${extra.name} (+S/.${Number(extra.price).toFixed(2)})
    `;

      switch (extra.extra_type) {        // campo que definas en la BD
        case 'pan':
          panCont.appendChild(label);
          break;
        case 'queso':
          quesoCont.appendChild(label);
          break;
        case 'proteina':
          protCont.appendChild(label);
          break;
        case 'complemento':
        default:
          compCont.appendChild(label);
          break;
      }
    });
  }

  function renderDynamicOptionsFromCategories() {
    const panCont = document.getElementById('opts-pan');
    const quesoCont = document.getElementById('opts-queso');
    const protCont = document.getElementById('opts-proteina');
    const compCont = document.getElementById('opts-complementos');

    [panCont, quesoCont, protCont, compCont].forEach(c => c.innerHTML = '');

    const panes = ALL_PRODUCTS.filter(p => p.category_id === 6);
    const quesos = ALL_PRODUCTS.filter(p => p.category_id === 7);
    const prot = ALL_PRODUCTS.filter(p => p.category_id === 8);
    const extras = ALL_PRODUCTS.filter(p => p.category_id === 3);

    const renderGroup = (items, container, groupName) => {
      items.forEach(item => {
        const label = document.createElement('label');
        label.innerHTML = `
        <input type="checkbox"
               data-price="${item.price}"
               data-id="${item.id}"
               data-group="${groupName}">
        ${item.name} (+S/.${Number(item.price).toFixed(2)})
      `;
        container.appendChild(label);
      });
    };

    renderGroup(panes, panCont, 'pan');
    renderGroup(quesos, quesoCont, 'queso');
    renderGroup(prot, protCont, 'proteina');
    renderGroup(extras, compCont, 'complemento'); // aquí sí quieres múltiples, luego lo dejamos libre
  }
  const secPan = document.getElementById('sec-pan');
  const secQueso = document.getElementById('sec-queso');
  const secProt = document.getElementById('sec-proteina');
  const secComp = document.getElementById('sec-complementos');
  const catalogDiv = document.querySelector('.catalog');
  const productDetailDiv = document.getElementById('product-detail');


  // =================================================================
  // 🔥 PASO 1: FUNCIONES AUXILIARES PARA EL MANEJO DE DATA PERSISTENTE
  // Agrega esto ANTES de la función 'openProductDetail'
  // =================================================================

  const CART_STORAGE_KEY = 'miBarrioBurgerCart';

  /** Obtiene el carrito de localStorage */
  function getCart() {
    try {
      const cartJson = localStorage.getItem(CART_STORAGE_KEY);
      return cartJson
        ? JSON.parse(cartJson).map(item => ({
          ...item,
          temp_id: item.temp_id || Date.now() + Math.random().toString(16).slice(2),
          quantity: item.quantity || 1
        }))
        : [];
    } catch (e) {
      console.error("Error al obtener el carrito de localStorage:", e);
      return [];
    }
  }

  const btnComprar = document.getElementById('btn-comprar')
  function inicializarEventosCarrito() {
    // Es mejor usar document.getElementById aquí en lugar de la variable global btnComprar
    const btnComprar = document.getElementById('btn-comprar');

    if (btnComprar) {
      btnComprar.addEventListener('click', () => {

        // ✅ CORRECCIÓN APLICADA: Obtener el estado real del carrito
        const carritoActual = getCart();

        if (carritoActual.length === 0) {
          // Aquí podrías usar tu `mostrarToast` o simplemente un alert
          alert("El carrito está vacío. ¡Agrega productos primero! 🛍️");
          return;
        }

        // ✅ PASO FINAL: Redirección
        window.location.href = 'pago.html';
      });
    } else {
      console.error('Error: No se encontró el botón con ID "btn-comprar"');
    }
  }

  /** Actualiza el contador numérico del carrito */
  function updateCartCount() {
    const cart = getCart();
    // Suma la cantidad (quantity) de cada ítem en el carrito
    const count = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    if (cartCountSpan) {
      cartCountSpan.textContent = String(count);
    }
  }
  /** Guarda el carrito en localStorage y actualiza el contador */
  function saveCart(cartArray) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartArray));
      updateCartCount();
    } catch (e) {
      console.error("Error al guardar el carrito en localStorage:", e);
    }
  }

  /** Elimina un ítem del carrito por su ID temporal (Usada por el botón 'X') */
  function removeItemFromCart(temp_id) {
    const cart = getCart();
    const newCart = cart.filter(item => item.temp_id !== temp_id);
    saveCart(newCart);
    renderCartModal(); // Llama a la función existente para re-renderizar
  }


  /** Actualiza la cantidad de un ítem (Usada por el input number) */
  function updateItemQuantity(temp_id, newQuantity) {
    const cart = getCart();
    let quantity = parseInt(newQuantity);
    // Asegura que la cantidad sea al menos 1
    if (isNaN(quantity) || quantity <= 0) quantity = 1;

    const itemIndex = cart.findIndex(item => item.temp_id === temp_id);
    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity;
      saveCart(cart);
      renderCartModal(); // Llama a la función existente para re-renderizar
    }
  }

  /**
   * 🔥 NUEVA FUNCIÓN INTERMEDIA: Reúne la lógica de adición y guarda el ítem.
   * Esta función será llamada por los onclick del botón "Agregar al Carrito".
   */
  function addToCartHelper(product, basePrice) {
    const selectedInputs = document.querySelectorAll(
      '#product-detail input[type="checkbox"]:checked, #product-detail input[type="radio"]:checked'
    );

    const extras = [];
    let finalPrice = basePrice;

    selectedInputs.forEach(inp => {
      const price = Number(inp.dataset.price || 0);
      finalPrice += price;

      const name = inp.parentElement.textContent.trim().replace(/\(\+S\/.[\d.]+\)/, '').trim();

      extras.push({
        id: Number(inp.dataset.id || 0),
        price: price,
        group: inp.dataset.group || null,
        name: name
      });
    });

    const cartItem = {
      temp_id: Date.now() + Math.random().toString(16).slice(2),
      product_id: product.id,
      name: product.name,
      // Obtiene la imagen del producto principal
      image: product.image || 'img/placeholder.png',
      base_price: basePrice,
      final_price: finalPrice,
      quantity: 1,
      extras
    };

    const cart = getCart();
    cart.push(cartItem);
    saveCart(cart);

    // Ocultar el detalle del producto y volver al catálogo
    productDetailDiv.style.display = 'none';
    catalogDiv.style.display = 'block';

    // Abrir el modal del carrito
    openCartModal();
  }

  function openProductDetail(product, mode = 'burger') {
    const basePrice = Number(product.price);

    detailTitle.textContent = product.name;
    detailImage.src = getProductImageUrl(product);
    detailImage.alt = product.name;
    detailDescription.textContent = product.description || '';
    detailPrice.textContent = `Precio: S/.${basePrice.toFixed(2)}`;

    if (mode === 'burger') {
      // Mostrar todas las secciones
      secPan.style.display = '';
      secQueso.style.display = '';
      secProt.style.display = '';
      secComp.style.display = '';

      secPan.querySelector('h4').textContent = '🍞 Tipo de pan';
      renderDynamicOptionsFromCategories();   // usa data-group en cada sección

    } else if (mode === 'drink') {
      // Solo "Tipo de bebida"
      secPan.style.display = '';
      secQueso.style.display = 'none';
      secProt.style.display = 'none';
      secComp.style.display = 'none';
      const drinkOkBtnLocal = document.getElementById('drink-ok');
      if (drinkOkBtnLocal) {
        drinkOkBtnLocal.onclick = () => {
          // ... (Tu lógica de clic) ...
        };
      } else {
        console.error("Error: El botón 'drinkOkBtn' no fue encontrado en el DOM.");
      }
      secPan.querySelector('h4').textContent = '🥤 Tipo de bebida';

      const panCont = document.getElementById('opts-pan');
      panCont.innerHTML = '';

      const drinkOptions = ALL_PRODUCTS.filter(p => Number(p.category_id) === 9);
      drinkOptions.forEach(opt => {
        const label = document.createElement('label');
        label.innerHTML = `
        <input type="checkbox"
               data-price="${opt.price}"
               data-id="${opt.id}"
               data-group="drink">
        ${opt.name} (+S/.${Number(opt.price).toFixed(2)})
      `;
        panCont.appendChild(label);
      });

    } else if (mode === 'dessert') {
      // Solo "Opciones de postre"
      secPan.style.display = '';
      secQueso.style.display = 'none';
      secProt.style.display = 'none';
      secComp.style.display = 'none';

      secPan.querySelector('h4').textContent = '🍰 Opciones de postre';

      const panCont = document.getElementById('opts-pan');
      panCont.innerHTML = '';

      const dessertOptions = ALL_PRODUCTS.filter(p => Number(p.category_id) === 10);
      dessertOptions.forEach(opt => {
        const label = document.createElement('label');
        label.innerHTML = `
        <input type="checkbox"
               data-price="${opt.price}"
               data-id="${opt.id}"
               data-dessert-name="${opt.name}">
        ${opt.name} (+S/.${Number(opt.price).toFixed(2)})`;
        panCont.appendChild(label);
      });

      // Lógica especial "Sin extra"
      const dessertInputs = secPan.querySelectorAll('input[type="checkbox"]');
      let sinExtraInput = null;

      dessertInputs.forEach(inp => {
        const name = (inp.dataset.dessertName || '').toLowerCase();
        if (name.includes('sin extra')) sinExtraInput = inp;
      });

      dessertInputs.forEach(inp => {
        inp.onchange = () => {
          if (inp === sinExtraInput) {
            if (sinExtraInput.checked) {
              dessertInputs.forEach(other => {
                if (other !== sinExtraInput) {
                  other.checked = false;
                  other.disabled = true;
                }
              });
            } else {
              dessertInputs.forEach(other => {
                if (other !== sinExtraInput) {
                  other.disabled = false;
                }
              });
            }
          } else {
            if (sinExtraInput && inp.checked) {
              sinExtraInput.checked = false;
              sinExtraInput.disabled = false;
            }
          }

          // Recalcular precio total
          let total = basePrice;
          const allInputs = document.querySelectorAll(
            '#product-detail input[type="radio"], #product-detail input[type="checkbox"]'
          );
          allInputs.forEach(c => {
            if (c.checked) total += parseFloat(c.dataset.price || 0);
          });
          detailPrice.textContent = `Precio: S/.${total.toFixed(2)}`;
        };
      });

      // Mostrar detalle y salir (para no sobrescribir onchange)
      catalogDiv.style.display = 'none';
      productDetailDiv.style.display = 'block';

      // Conectar botón "Agregar al carrito" también para postres
      console.log('openProductDetail ejecutado para:', product.name, 'modo:', mode);
      const addBtnDessert = document.getElementById('add-to-cart-btn'); // Asume que es el mismo botón
      if (addBtnDessert) {
        // 🔥 Llamamos a la función auxiliar que maneja la lógica de adición y apertura del modal
        addBtnDessert.onclick = () => addToCartHelper(product, basePrice);
      }
      return;
    }

    // Mostrar detalle (hamburguesas y bebidas)
    // Mostrar detalle (hamburguesas y bebidas)
    catalogDiv.style.display = 'none';
    productDetailDiv.style.display = 'block';

    // Lógica genérica: suma de precios + selección única por grupo
    const inputs = document.querySelectorAll(
      '#product-detail input[type="radio"], #product-detail input[type="checkbox"]'
    );
    inputs.forEach(i => i.checked = false);

    inputs.forEach(input => {
      input.onchange = () => {
        const group = input.dataset.group || '';

        // Grupos con solo una opción permitida
        if (group === 'pan' || group === 'queso' || group === 'proteina' || group === 'drink') {
          if (input.checked) {
            inputs.forEach(other => {
              if (other !== input && other.dataset.group === group) {
                other.checked = false;
              }
            });
          }
        }
        // 'complemento' queda libre (varias opciones)

        let total = basePrice;
        inputs.forEach(c => {
          if (c.checked) total += parseFloat(c.dataset.price || 0);
        });
        detailPrice.textContent = `Precio: S/.${total.toFixed(2)}`;
      };
    });

    // Conectar botón "Agregar al carrito" (hamburguesas y bebidas)
    const addBtn = document.getElementById('add-to-cart-btn');
    console.log('addBtn dentro de openProductDetail:', addBtn);
    if (!addBtn) return;
    addBtn.onclick = () => addToCartHelper(product, basePrice);
  }



  function renderCartModal() {
    console.log('renderCartModal, Renderizando con nuevo formato visual.');
    const cart = getCart(); // 🔥 OBTENEMOS EL CARRITO PERSISTENTE
    cartItemsDiv.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<p style="text-align:center;color:#999; padding: 20px;">Tu carrito está vacío</p>';
      cartTotalSpan.textContent = '0.00';
      return;
    }

    // Encabezado con CSS Grid (5 columnas)
    cartItemsDiv.innerHTML += `
        <div style="display: grid; grid-template-columns: 1.5fr 3.5fr 80px 1fr 40px; gap: 10px; padding: 10px 0; border-bottom: 2px solid #ccc; font-weight: bold; background-color: #f7f7f7;">
            <div style="padding-left: 10px;">Producto</div>
            <div>Personalización</div>
            <div style="text-align: center;">Cantidad</div>
            <div style="text-align: right;">Subtotal</div>
            <div></div>
        </div>
    `;

    cart.forEach(item => {
      const itemQuantity = item.quantity || 1;
      const itemSubtotal = item.final_price * itemQuantity;
      grandTotal += itemSubtotal;

      // Construye la lista de extras de personalización
      const extrasNames = item.extras
        .map(e => `<li>${e.name} (+S/.${Number(e.price).toFixed(2)})</li>`)
        .join('');

      // Columna 2: Personalización
      const personalizationDisplay = extrasNames.length > 0 ?
        `<ul style="margin: 0; padding-left: 15px; font-size: 0.9em; list-style-type: none;">${extrasNames}</ul>` :
        'Estándar / Sin extras';

      // Fila del ítem con la estructura de 5 columnas (El div principal es el contenedor Grid)
      cartItemsDiv.innerHTML += `
            <div class="carrito-item-row" style="display: grid; grid-template-columns: 1.5fr 3.5fr 80px 1fr 40px; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eee;">
                
                <div class="carrito-producto" style="display: flex; align-items: center; gap: 10px; padding-left: 10px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;"> 
                    <span style="font-weight: bold;">${item.name}</span>
                </div>
                
                <div class="carrito-personalizacion">
                    ${personalizationDisplay}
                </div>
                
                <div class="carrito-cantidad" style="text-align: center;">
                   <input type="number" 
                        class="input-cantidad-carrito" 
                        value="${itemQuantity}" 
                        min="1"
                        data-temp-id="${item.temp_id}" 
                        style="width: 60px; text-align: center; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div class="subtotal" style="text-align: right; font-weight: bold;">
                    S/.${itemSubtotal.toFixed(2)}
                </div>
                
                <div class="eliminar-item" data-temp-id="${item.temp_id}" 
                    style="cursor: pointer; font-weight: bold; color: #ff0000; text-align: center; font-size: 1.5em;">
                    <span class="btn-eliminar-item" >&times;</span> 
                </div>
        `;
    });

    cartTotalSpan.textContent = grandTotal.toFixed(2);
  }

  // =================================================================
  // ⚡ NUEVA FUNCIÓN: Conexión de Eventos (Se llama inmediatamente después de renderizar)
  // =================================================================

  function attachCartListeners() {
    // Usamos la variable global cartItemsDiv que ya existe para renderizar
    if (cartItemsDiv) {
      console.log('✅ Intentando adjuntar listeners al carrito...');

      // Removemos listeners anteriores para evitar duplicados
      // Nota: esto es una solución simplificada. Una implementación más limpia
      // implicaría usar .cloneNode(true) en renderCartModal, pero esto funcionará.

      // A. Manejar clics (para el botón 'X' de eliminar)
      cartItemsDiv.addEventListener('click', (event) => {
        // Buscamos el elemento que tenga la clase para eliminar
        const targetElement = event.target.closest('.eliminar-item');

        if (targetElement) {
          const temp_id = targetElement.dataset.tempId;
          if (temp_id) {
            removeItemFromCart(temp_id);
          }
        }
      });

      // B. Manejar cambios (para el input de cantidad)
      cartItemsDiv.addEventListener('change', (event) => {
        if (event.target.classList.contains('input-cantidad-carrito')) {
          const temp_id = event.target.dataset.tempId;
          const newQuantity = event.target.value;

          if (temp_id) {
            updateItemQuantity(temp_id, newQuantity);
          }
        }
      });

    } else {
      console.error("❌ ERROR: cartItemsDiv es null en attachCartListeners.");
    }
  }

  function openCartModal() {
    renderCartModal();              // ← importante
    cartModal.style.display = 'block';
    attachCartListeners();
    inicializarEventosCarrito();
  }

  function closeCartModal() {
    cartModal.style.display = 'none';
  }

  if (cartIconBtn) cartIconBtn.onclick = openCartModal;
  if (closeCartSpan) closeCartSpan.onclick = closeCartModal;

  window.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModal();
  });

  function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('carousel-card');

    card.productData = product;

    const imgUrl = getProductImageUrl(product);

    card.innerHTML = `
    <img src="${imgUrl}" alt="${product.name}">
    <h3 class="product-name">${product.name}</h3>
    <p class="product-desc">${product.description || ''}</p>
    <span class="product-price">S/.${Number(product.price).toFixed(2)}</span>
  `;

    card.addEventListener('click', () => {
      const p = card.productData;
      const catId = Number(p.category_id);

      if (catId === 1) {
        openProductDetail(p, 'burger');
      } else if (catId === 2) {
        openProductDetail(p, 'drink');
      } else if (catId === 4) {
        openProductDetail(p, 'dessert');
      }
    });

    return card;
  }
  // 3. Iterar y Distribuir los productos
  products.forEach(product => {
    const card = createProductCard(product);

    switch (product.category_id) {
      case 1: // Hamburguesas
        burgerCarousel.appendChild(card);
        break;

      case 2: // Bebidas
        drinkCarousel.appendChild(card);
        break;

      case 4: // Combos (antes usabas 3) 
        combosCarousel.appendChild(card);
        combosCount++;
        break;

      default:
        console.warn(
          `Producto "${product.name}" tiene una categoría desconocida: ${product.category_id}`
        );
    }
  });

  // 4. Manejar el mensaje de "no hay combos"
  if (combosCount === 0 && combosEmpty) {
    combosCarousel.style.display = 'none'; // Ocultar el carrusel vacío
    combosEmpty.style.display = 'block';   // Mostrar el mensaje de vacío
  } else if (combosEmpty) {
    combosCarousel.style.display = 'flex'; // Mostrar el carrusel (asumiendo que tiene display: flex)
    combosEmpty.style.display = 'none';    // Ocultar el mensaje de vacío
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user) {
    console.warn("No hay usuario logueado");
    return;
  }

  const nameElement = document.querySelector('.user-display-name');
  const roleElement = document.getElementById('user-role');

  if (nameElement) {
    nameElement.textContent = `${user.first_name} ${user.last_name}`;
  }

  if (roleElement) {
    roleElement.textContent = user.roles[0] ?? "Cliente";
  }
});









// -------------------------------------------------
//    FUNCIONALIDADES NO INCLUYENTES AL PROCESO DE COMPRA
// -------------------------------------------------



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
  if (totalCards === 0) return;

  const cardWidth = 262 + 22;
  let currentIndex = 0;
  const maxIndex = Math.max(0, totalCards - visibleCount);

  function updatePosition() {
    carousel.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
  }

  document
    .querySelectorAll(`.prev-btn[data-target="${carouselId.replace('-carousel', '')}"]`)
    .forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updatePosition();
        }
      });
    });

  document
    .querySelectorAll(`.next-btn[data-target="${carouselId.replace('-carousel', '')}"]`)
    .forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
          currentIndex++;
          updatePosition();
        }
      });
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
      sessionStorage.clear();
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
  inicializarEventosCarrito(); // Habilita el clic en el botón "Comprar"
  updateCartCount();
});


// ✅=== EVENTOS DE NAVEGACIÓN ===
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => showSection(item.getAttribute('data-section')));
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
const cartCountSpan = document.getElementById('carrito-contador');

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




function renderOptionsByCategory(categoryId) {
  const container = document.getElementById('opts-pan'); // mismo que usas en drink/dessert
  if (!container) return; // evita el error si por algo no existe

  container.innerHTML = '';

  const items = ALL_PRODUCTS.filter(p => Number(p.category_id) === categoryId);

  items.forEach(item => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox"
             data-price="${item.price}"
             data-id="${item.id}"
             data-group="drink">
      ${item.name} (+S/.${Number(item.price).toFixed(2)})
    `;
    container.appendChild(label);
  });
}


























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
  sessionStorage.setItem('carrito', JSON.stringify(carrito));
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


//Mostrar Bebidas 
let currentDrink = null;
let currentDrinkBase = 0;

const drinkModal = document.getElementById('drink-modal');
const drinkOptsDiv = document.getElementById('drink-options-container');
const drinkOkBtn = document.getElementById('drink-ok');
const drinkCancelBtn = document.getElementById('drink-cancel');

function openDrinkModal(product) {

  currentDrink = product;
  currentDrinkBase = Number(product.price);

  // limpiar
  drinkOptsDiv.innerHTML = '';

  // renderizar opciones desde BD (cat 9)
  DRINK_OPTIONS.forEach((opt, idx) => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="radio"
             name="drink-temp"
             value="${opt.id}"
             data-extra-price="${opt.price}"
             ${idx === 0 ? 'checked' : ''}>
      ${opt.name} (+S/.${Number(opt.price).toFixed(2)})
    `;
    drinkOptsDiv.appendChild(label);
  });

  drinkModal.style.display = 'flex';
}

function closeDrinkModal() {
  // ✅ CORRECCIÓN: Verifica que drinkModal exista antes de modificar su estilo
  if (drinkModal) {
    drinkModal.style.display = 'none';
  }
  currentDrink = null;
}

if (drinkCancelBtn) {
  drinkCancelBtn.addEventListener('click', closeDrinkModal);
}

if (drinkOkBtn) {
  drinkOkBtn.onclick = () => {
    if (!currentDrink) return;
    const selected = document.querySelector('input[name="drink-temp"]:checked');
    const extra = selected ? Number(selected.dataset.extraPrice) : 0;
    const finalPrice = currentDrinkBase + extra;

    const selectedOptionId = selected ? Number(selected.value) : null;

    console.log('Bebida:', currentDrink.name,
      'opciónId:', selectedOptionId,
      'precio final:', finalPrice);

    closeDrinkModal();
  };
} else {
  console.error("Error: El botón 'drinkOkBtn' no fue encontrado en el DOM.");
};



// Nota: las reglas de animación y estilos del carrito ahora están en `css/catalogo.css`.

// ✅=== LIMPIAR PEDIDO FINALIZADO AL CARGAR ===
function limpiarPedidoFinalizado() {
  const pedidoActivo = JSON.parse(sessionStorage.getItem('pedido-activo'));
  if (pedidoActivo && pedidoActivo.estado >= 3) {
    sessionStorage.removeItem('pedido-activo');
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
  const pedidoActivo = JSON.parse(sessionStorage.getItem('pedido-activo'));
  const historial = JSON.parse(sessionStorage.getItem('historial-pedidos')) || [];

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
    const base = `${p.nombre} x${p.cantidad || 1}`;
    if (!Array.isArray(p.opciones) || p.opciones.length === 0) return base;

    const opcionesFiltradas = p.opciones.filter(opt => !opt.includes('Estándar'));
    if (opcionesFiltradas.length === 0) return base;

    return `${base}\n${opcionesFiltradas.join(' | ')}`;
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
            <span style="white-space: pre-line;">${detalle}</span>
            <span style="font-weight:600; color:#e67e22;">
            ${pedidoActivo.productos[i].precio}</span>
          </div>
        `).join('')}
      </div>
      <div style="background:#f0f9ff; padding:20px; border-radius:12px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:15px;">
          <span>Subtotal</span>
          <span>S/${Number(pedidoActivo.subtotal).toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:15px;">
          <span>IGV</span>
          <span>S/${Number(pedidoActivo.igv).toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; margin-top:12px; padding-top:12px; border-top:1px dashed #ccc; font-weight:700; font-size:17px; color:#e67e22;">
          <span>Total</span>
          <span>S/${Number(pedidoActivo.total).toFixed(2)}</span>
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
      sessionStorage.setItem('pedido-activo', JSON.stringify(pedidoActivo));
      const historial = JSON.parse(sessionStorage.getItem('historial-pedidos')) || [];
      const index = historial.findIndex(p => p.id === pedidoActivo.id);
      if (index !== -1) {
        historial[index] = { ...pedidoActivo };
        sessionStorage.setItem('historial-pedidos', JSON.stringify(historial));
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
  const historial = JSON.parse(sessionStorage.getItem('historial-pedidos')) || [];

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
        sessionStorage.setItem('pedido-activo', JSON.stringify(pedido));
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

  // 1) Cargar productos desde la API y pintarlos
  loadAndRenderProducts().then(() => {
    initCarousel('burger-carousel', 1); // o 2
    initCarousel('drink-carousel', 1);
    initCarousel('combos-carousel', 1);
  });
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