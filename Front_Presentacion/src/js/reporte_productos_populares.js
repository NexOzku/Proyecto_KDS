// js/reporte_productos_populares.js

// ==========================================
// 1. VARIABLES Y DATOS
// ==========================================

// Helper: Obtiene la fecha local YYYY-MM-DD sin error de zona horaria
const getRppLocalISO = d => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper: Resta días a la fecha actual de forma segura
const getRppDaysAgo = n => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return getRppLocalISO(d);
};

// DATOS DE PRUEBA VARIADOS
// Usamos fechas de 0 días (hoy), 2 días atrás, 5 días atrás, etc. para que los filtros hagan efecto.
const rppRawData = [
    // Hoy (0)
    { id: 1, product: "Hamburguesa Royal", category: "Hamburguesas", price: 25.00, qty: 5, date: getRppDaysAgo(0) },
    { id: 2, product: "Inka Cola 500ml", category: "Bebidas", price: 5.00, qty: 10, date: getRppDaysAgo(0) },

    // Hace 2 días (Entra en Semana)
    { id: 3, product: "Hamburguesa Clásica", category: "Hamburguesas", price: 18.00, qty: 6, date: getRppDaysAgo(2) },
    { id: 4, product: "Papas Fritas", category: "Acompañamientos", price: 8.00, qty: 8, date: getRppDaysAgo(2) },

    // Hace 5 días (Entra en Semana)
    { id: 5, product: "Hamburguesa Doble", category: "Hamburguesas", price: 28.00, qty: 12, date: getRppDaysAgo(5) },

    // Hace 10 días (No entra en Semana, sí en Mes - depende de la fecha actual)
    { id: 6, product: "Coca Cola 1L", category: "Bebidas", price: 9.00, qty: 15, date: getRppDaysAgo(10) },
    { id: 7, product: "Nuggets x6", category: "Acompañamientos", price: 12.00, qty: 5, date: getRppDaysAgo(10) },

    // Hace 25 días (Mes pasado o este mes dependiendo del día)
    { id: 8, product: "Torta de Chocolate", category: "Postres", price: 10.00, qty: 8, date: getRppDaysAgo(25) },
    { id: 9, product: "Hamburguesa Vegana", category: "Hamburguesas", price: 24.00, qty: 4, date: getRppDaysAgo(25) },

    // Hace 60 días (Año)
    { id: 10, product: "Gaseosa 1.5L", category: "Bebidas", price: 11.00, qty: 2, date: getRppDaysAgo(60) }
];

let rppAggregatedData = [];
let rppGrandTotalUnits = 0;
const formatRppCurrency = (num) => `S/. ${num.toFixed(2)}`;

// ==========================================
// 2. FUNCIONES GLOBALES
// ==========================================

window.setRppPreset = function (type) {
    const btns = document.querySelectorAll('.rpp-btn');
    btns.forEach(b => b.classList.remove('active'));

    const btn = document.getElementById(`rpp-btn-${type}`);
    if (btn) btn.classList.add('active');

    const today = new Date();
    let startStr = "", endStr = "";

    // Lógica de Filtros Robusta
    if (type === 'today') {
        startStr = getRppLocalISO(today);
        endStr = getRppLocalISO(today);
    }
    else if (type === 'week') {
        const start = new Date();
        start.setDate(today.getDate() - 6); // Últimos 7 días
        startStr = getRppLocalISO(start);
        endStr = getRppLocalISO(today);
    }
    else if (type === 'month') {
        // Inicio: Día 1 del mes actual
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        // Fin: Último día del mes actual (Día 0 del mes siguiente)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        startStr = getRppLocalISO(start);
        endStr = getRppLocalISO(end);
    }
    else if (type === 'year') {
        // 1 de Enero a 31 de Diciembre del año actual
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);

        startStr = getRppLocalISO(start);
        endStr = getRppLocalISO(end);
    }

    // Asignar a los inputs
    const sInput = document.getElementById('rpp-start-date');
    const eInput = document.getElementById('rpp-end-date');

    if (sInput && eInput) {
        sInput.value = startStr;
        eInput.value = endStr;
        // Forzar aplicación del filtro
        window.applyRppFilters();
    }
};

window.applyRppFilters = function () {
    const sInput = document.getElementById('rpp-start-date');
    const eInput = document.getElementById('rpp-end-date');
    const cSelect = document.getElementById('rpp-category-filter');

    if (!sInput || !eInput || !cSelect) return;

    const startStr = sInput.value;
    const endStr = eInput.value;
    const catFilter = cSelect.value;

    const label = document.getElementById('rpp-pdf-context-label');
    if (label) label.innerText = `Análisis: ${startStr} al ${endStr}`;

    // Filtramos el RawData usando comparación de strings ISO (YYYY-MM-DD)
    const filteredRaw = rppRawData.filter(item => {
        const dateMatch = item.date >= startStr && item.date <= endStr;
        const catMatch = catFilter === 'all' || item.category === catFilter;
        return dateMatch && catMatch;
    });

    // Agrupar datos (Sumar cantidades si el producto se repite en el rango)
    const grouped = {};

    filteredRaw.forEach(item => {
        const key = item.product;
        if (!grouped[key]) {
            grouped[key] = {
                product: item.product,
                category: item.category,
                totalQty: 0,
                totalRevenue: 0
            };
        }
        grouped[key].totalQty += item.qty;
        grouped[key].totalRevenue += (item.qty * item.price);
    });

    // Convertir a array y ordenar por cantidad vendida
    rppAggregatedData = Object.values(grouped).sort((a, b) => b.totalQty - a.totalQty);

    // Calcular total global para porcentajes
    rppGrandTotalUnits = rppAggregatedData.reduce((acc, curr) => acc + curr.totalQty, 0);

    window.updateRppKPIs(rppAggregatedData);
    window.renderRppTable(rppAggregatedData);
};

window.updateRppKPIs = function (data) {
    const elSalesName = document.getElementById('rpp-kpi-top-sales-name');
    const elSalesVal = document.getElementById('rpp-kpi-top-sales-value');
    const elCatName = document.getElementById('rpp-kpi-top-cat-name');
    const elCatVal = document.getElementById('rpp-kpi-top-cat-value');
    const elUnits = document.getElementById('rpp-kpi-total-units');

    if (data.length === 0) {
        if (elSalesName) elSalesName.innerText = "-";
        if (elSalesVal) elSalesVal.innerText = "Sin datos";
        if (elCatName) elCatName.innerText = "-";
        if (elCatVal) elCatVal.innerText = "";
        if (elUnits) elUnits.innerText = "0";
        return;
    }

    const topSeller = data[0];

    // Calcular categoría top
    const catCounts = {};
    data.forEach(item => { catCounts[item.category] = (catCounts[item.category] || 0) + item.totalQty; });
    let topCat = "-"; let maxCatQty = 0;
    for (const [cat, qty] of Object.entries(catCounts)) { if (qty > maxCatQty) { maxCatQty = qty; topCat = cat; } }

    const totalUnits = data.reduce((acc, curr) => acc + curr.totalQty, 0);

    if (elSalesName) elSalesName.innerText = topSeller.product;
    if (elSalesVal) elSalesVal.innerText = `${topSeller.totalQty} unids.`;

    if (elCatName) elCatName.innerText = topCat;
    if (elCatVal) elCatVal.innerText = `${maxCatQty} unids.`;

    if (elUnits) elUnits.innerText = totalUnits;
};

window.renderRppTable = function (data) {
    const tbody = document.getElementById('rpp-table-body');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #64748b;">No hay productos vendidos en este rango de fechas.</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        const rank = index + 1;
        let rankDisplay = rank;
        let rankClass = "";
        if (rank === 1) { rankDisplay = "🥇"; rankClass = "rank-1"; }
        else if (rank === 2) { rankDisplay = "🥈"; rankClass = "rank-2"; }
        else if (rank === 3) { rankDisplay = "🥉"; rankClass = "rank-3"; }

        const percentage = rppGrandTotalUnits > 0 ? ((item.totalQty / rppGrandTotalUnits) * 100).toFixed(1) : 0;

        const row = `
      <tr>
        <td class="rank-cell ${rankClass}">${rankDisplay}</td>
        <td class="font-bold">${item.product}</td>
        <td>${item.category}</td>
        <td class="text-right font-bold">${item.totalQty}</td>
        <td class="text-right">${formatRppCurrency(item.totalRevenue)}</td>
        <td>
          <div style="font-size: 11px; margin-bottom: 2px;">${percentage}% del total</div>
          <div class="popularity-container">
            <div class="popularity-fill" style="width: ${percentage}%"></div>
          </div>
        </td>
      </tr>
    `;
        tbody.innerHTML += row;
    });
};

// PDF Generator
window.generatePopPDF = function () {
    if (!window.jspdf) { alert('Librería PDF no cargada'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const softBlack = [30, 30, 30];
    const softGray = [100, 100, 100];

    doc.setTextColor(...softBlack);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Reporte de Productos Populares", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Rango: ${document.getElementById('rpp-start-date').value} al ${document.getElementById('rpp-end-date').value}`, 14, 28);

    const tableColumn = ["#", "Producto", "Categoría", "Und. Vendidas", "Ingresos", "% Part."];
    const tableRows = [];

    rppAggregatedData.forEach((item, index) => {
        const percentage = rppGrandTotalUnits > 0 ? ((item.totalQty / rppGrandTotalUnits) * 100).toFixed(1) + "%" : "0%";
        const rowData = [
            index + 1,
            item.product,
            item.category,
            item.totalQty,
            formatRppCurrency(item.totalRevenue),
            percentage
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid'
    });

    doc.save('Ranking_Productos.pdf');
};

// Inicialización externa
window.initReportePopulares = function () {
    // Pequeño timeout para asegurar que el DOM está listo al cambiar de pestaña
    setTimeout(() => {
        if (document.getElementById('rpp-btn-today')) {
            window.setRppPreset('month'); // Por defecto mostramos MES para ver datos
        }
    }, 50);
};