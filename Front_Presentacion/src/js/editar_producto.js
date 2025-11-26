(function () {
  // Datos de ejemplo (en producción, esto vendría de rawData.productos)
  let productos = [
    {
      id: 1,
      codigo: "H001",
      estado: "Activo",
      nombre: "Hamburguesa Clásica",
      descripcion: "Carne de res, lechuga, tomate, cebolla y salsa especial.",
      categoria: "Hamburguesas",
      precio: 18.50,
      imagen: "img/Hamburguesas/Burger clasica.jpeg",
      insumos: [{ nombre: "Pan", costo: 1.20, cantidad: 1 }]
    },
    {
      id: 2,
      codigo: "B001",
      estado: "Activo",
      nombre: "Refresco de Cola",
      descripcion: "Refresco gaseoso de 500ml.",
      categoria: "Bebidas",
      precio: 5.00,
      imagen: "img/Hamburguesas/Burger clasica.jpeg",
      insumos: [{ nombre: "Botella", costo: 0.50, cantidad: 1 }]
    },
    {
      id: 3,
      codigo: "P001",
      estado: "Inactivo",
      nombre: "Brownie con Helado",
      descripcion: "Brownie casero con una bola de helado de vainilla.",
      categoria: "Postres",
      precio: 12.00,
      imagen: "img/Hamburguesas/Burger clasica.jpeg",
      insumos: [{ nombre: "Brownie", costo: 2.50, cantidad: 1 }]
    },
      {
        id: 4,
        codigo: "H002",
        estado: "Activo",
        nombre: "Doble Queso",
        descripcion: "Doble carne y doble queso cheddar.",
        categoria: "Hamburguesas",
        precio: 24.00,
        imagen: "img/Hamburguesas/Burger clasica.jpeg",
        insumos: [{ nombre: "Carne", costo: 3.00, cantidad: 2 }]
      },
      {
        id: 5,
        codigo: "B002",
        estado: "Activo",
        nombre: "Limonada",
        descripcion: "Limonada fresca con menta.",
        categoria: "Bebidas",
        precio: 8.50,
        imagen: "img/Hamburguesas/Burger clasica.jpeg",
        insumos: [{ nombre: "Limón", costo: 0.40, cantidad: 2 }]
      },
      {
        id: 6,
        codigo: "H003",
        estado: "Activo",
        nombre: "Pollo BBQ",
        descripcion: "Filete de pollo con salsa BBQ.",
        categoria: "Hamburguesas",
        precio: 20.00,
        imagen: "img/Hamburguesas/Burger clasica.jpeg",
        insumos: [{ nombre: "Filete", costo: 3.20, cantidad: 1 }]
      },
      {
        id: 7,
        codigo: "H004",
        estado: "Activo",
        nombre: "Vegetariana",
        descripcion: "Con vegetales frescos y queso mozzarella.",
        categoria: "Hamburguesas",
        precio: 19.00,
        imagen: "img/Hamburguesas/Burger clasica.jpeg",
        insumos: [{ nombre: "Vegetales", costo: 1.80, cantidad: 1 }]
      },
      {
        id: 8,
        codigo: "P002",
        estado: "Activo",
        nombre: "Tarta de Limón",
        descripcion: "Tarta con base crujiente y relleno cítrico.",
        categoria: "Postres",
        precio: 10.50,
        imagen: "img/Hamburguesas/Burger clasica.jpeg",
        insumos: [{ nombre: "Masa", costo: 0.90, cantidad: 1 }]
      }
  ];

  let productoSeleccionado = null;

  function renderListaProductos(filtro = "") {
    const lista = document.getElementById("listaProductos");
    if (!lista) return;

    lista.innerHTML = "";

    const termino = filtro.toLowerCase();
    const categoria = document.getElementById("categoriaFiltro")?.value || "";

    const filtrados = productos.filter(p => {
      const coincide = p.nombre.toLowerCase().includes(termino) || p.codigo.toLowerCase().includes(termino);
      const cat = !categoria || p.categoria === categoria;
      return coincide && cat;
    });

    filtrados.forEach(p => {
      const item = document.createElement("div");
      item.className = "producto-item";
      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjhmOWZhIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZW48L3RleHQ+Cjwvc3ZnPgo='" />
        <div class="producto-info">
          <h3>${p.nombre}</h3>
          <div class="codigo">Código: ${p.codigo}</div>
          <div class="categoria">Categoría: ${p.categoria}</div>
        </div>
        <div class="precio-container">
          <span class="precio">S/ ${p.precio.toFixed(2)}</span>
        </div>
      `;
      item.addEventListener("click", () => cargarProducto(p));
      lista.appendChild(item);
    });
  }

  function cargarProducto(producto) {
    productoSeleccionado = producto;
    const panel = document.getElementById("panelEdicion");
    if (panel) panel.style.display = "grid";

    document.getElementById("codigo").value = producto.codigo;
    document.getElementById("estado").value = producto.estado;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("descripcion").value = producto.descripcion;
    document.getElementById("categoria").value = producto.categoria;
    document.getElementById("precio").value = producto.precio;

    renderInsumos(producto.insumos);
  }

  function renderInsumos(insumos) {
    const contenedor = document.getElementById("insumosContenedor");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    insumos.forEach((insumo, index) => {
      const div = document.createElement("div");
      div.className = "insumo-item";
      div.innerHTML = `
        <div class="nombre">${insumo.nombre}</div>
        <div class="costo">Costo: S/ ${insumo.costo.toFixed(2)}</div>
        <input type="number" value="${insumo.cantidad}" min="0" step="1" data-index="${index}" />
        <div class="nota">double-click to edit</div>
      `;
      contenedor.appendChild(div);

      const input = div.querySelector("input");
      input.addEventListener("change", (e) => {
        const idx = e.target.dataset.index;
        productoSeleccionado.insumos[idx].cantidad = parseFloat(e.target.value) || 0;
      });
    });
  }

  function guardarCambios() {
    if (!productoSeleccionado) return;

    const nombre = document.getElementById("nombre")?.value.trim();
    const descripcion = document.getElementById("descripcion")?.value.trim();
    const precio = parseFloat(document.getElementById("precio")?.value);

    if (!nombre || !descripcion || isNaN(precio) || precio <= 0) {
      showToast("Complete todos los campos correctamente.", "error");
      return;
    }

    productoSeleccionado.nombre = nombre;
    productoSeleccionado.descripcion = descripcion;
    productoSeleccionado.estado = document.getElementById("estado")?.value;
    productoSeleccionado.categoria = document.getElementById("categoria")?.value;
    productoSeleccionado.precio = precio;

    showToast("Producto actualizado correctamente.", "success");

    const msg = document.getElementById("mensaje");
    if (msg) {
      msg.textContent = "";
      msg.style.display = "none";
    }

    renderListaProductos(document.getElementById("busquedaInput")?.value || "");
  }

  // Inicialización
  if (document.getElementById("editar-producto")) {
    document.getElementById("busquedaInput")?.addEventListener("input", e => renderListaProductos(e.target.value));
    document.getElementById("categoriaFiltro")?.addEventListener("change", () => renderListaProductos(document.getElementById("busquedaInput")?.value || ""));
    document.getElementById("guardarBtn")?.addEventListener("click", guardarCambios);

    renderListaProductos();
  }
})();