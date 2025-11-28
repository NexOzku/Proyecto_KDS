// js/reporte_ventas.js

// 1. Variables Globales
const getRvLocalISO = d => { const z = d.getTimezoneOffset() * 60000; return new Date(d - z).toISOString().split('T')[0]; };
const getRvDaysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return getRvLocalISO(d); };

const rvRawData = [
  { id: 1, product: "Hamburguesa Royal", customization: "Estándar", category: "Hamburguesas", price: 25.00, qty: 2, date: getRvDaysAgo(0) },
  { id: 2, product: "Hamburguesa Royal", customization: "Extra Queso", category: "Hamburguesas", price: 30.00, qty: 1, date: getRvDaysAgo(0) },
  { id: 3, product: "Hamburguesa Doble", customization: "Estándar", category: "Hamburguesas", price: 30.00, qty: 2, date: getRvDaysAgo(0) },
  { id: 4, product: "Inka Cola 500ml", customization: "Helada", category: "Bebidas", price: 5.00, qty: 10, date: getRvDaysAgo(0) },
  { id: 5, product: "Papas Fritas", customization: "Grandes", category: "Acompañamientos", price: 10.00, qty: 5, date: getRvDaysAgo(0) },
  { id: 6, product: "Milkshake", customization: "Fresa", category: "Postres", price: 15.00, qty: 2, date: getRvDaysAgo(0) },
  { id: 7, product: "Hamburguesa Doble", customization: "Estándar", category: "Hamburguesas", price: 28.00, qty: 5, date: getRvDaysAgo(1) },
  { id: 8, product: "Coca Cola 1L", customization: "Sin Hielo", category: "Bebidas", price: 9.00, qty: 3, date: getRvDaysAgo(1) },
  { id: 10, product: "Nuggets x6", customization: "Estándar", category: "Acompañamientos", price: 12.00, qty: 4, date: getRvDaysAgo(2) },
  { id: 11, product: "Hamburguesa Royal", customization: "Extra Tocino", category: "Hamburguesas", price: 29.00, qty: 2, date: getRvDaysAgo(2) },
  { id: 12, product: "Jugo de Naranja", customization: "Estándar", category: "Bebidas", price: 8.00, qty: 5, date: getRvDaysAgo(3) },
  { id: 13, product: "Torta de Chocolate", customization: "Estándar", category: "Postres", price: 10.00, qty: 3, date: getRvDaysAgo(3) },
  { id: 14, product: "Hamburguesa Vegana", customization: "Pan Integral", category: "Hamburguesas", price: 24.00, qty: 1, date: getRvDaysAgo(4) },
  { id: 15, product: "Papas Nativas", customization: "Queso y Tocino", category: "Acompañamientos", price: 15.00, qty: 8, date: getRvDaysAgo(4) },
  { id: 16, product: "Chicha Morada", customization: "Vaso Grande", category: "Bebidas", price: 6.00, qty: 10, date: getRvDaysAgo(5) },
  { id: 17, product: "Hamburguesa Parrillera", customization: "Término Medio", category: "Hamburguesas", price: 30.00, qty: 2, date: getRvDaysAgo(5) },
  { id: 18, product: "Ensalada César", customization: "Sin Crutones", category: "Acompañamientos", price: 18.00, qty: 2, date: getRvDaysAgo(6) },
  { id: 19, product: "Milkshake Oreo", customization: "Estándar", category: "Postres", price: 14.00, qty: 4, date: getRvDaysAgo(6) },
  { id: 21, product: "Gaseosa 1.5L", customization: "Estándar", category: "Bebidas", price: 11.00, qty: 5, date: getRvDaysAgo(15) }
];

let rvCurrentFilteredData = [];
const formatRvCurrency = (num) => `S/. ${num.toFixed(2)}`;

// 2. Funciones Globales
window.setRvPreset = function(type) {
  const btns = document.querySelectorAll('.rv-btn');
  btns.forEach(b => b.classList.remove('active'));
  
  const btn = document.getElementById(`rv-btn-${type}`);
  if(btn) btn.classList.add('active');

  const today = new Date();
  let startStr = "", endStr = "";

  if (type === 'today') {
    startStr = getRvLocalISO(today);
    endStr = getRvLocalISO(today);
  } else if (type === 'week') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    startStr = getRvLocalISO(start);
    endStr = getRvLocalISO(today);
  } else if (type === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    startStr = getRvLocalISO(start);
    endStr = getRvLocalISO(today);
  } else if (type === 'year') {
    const start = new Date(today.getFullYear(), 0, 1);
    startStr = getRvLocalISO(start);
    endStr = getRvLocalISO(today);
  }

  const sInput = document.getElementById('rv-start-date');
  const eInput = document.getElementById('rv-end-date');
  if(sInput && eInput) {
      sInput.value = startStr;
      eInput.value = endStr;
      window.applyRvFilters();
  }
};

window.applyRvFilters = function() {
  const sInput = document.getElementById('rv-start-date');
  const eInput = document.getElementById('rv-end-date');
  const cSelect = document.getElementById('rv-category-filter');

  if(!sInput || !eInput || !cSelect) return;

  const startStr = sInput.value;
  const endStr = eInput.value;
  const catFilter = cSelect.value;
  
  const label = document.getElementById('rv-pdf-context-label');
  if(label) label.innerText = `Reporte: ${startStr} al ${endStr}`;

  const filteredRaw = rvRawData.filter(item => {
    const dateMatch = item.date >= startStr && item.date <= endStr;
    const catMatch = catFilter === 'all' || item.category === catFilter;
    return dateMatch && catMatch;
  });

  const groupedData = {};
  filteredRaw.forEach(item => {
    const key = `${item.product}|${item.customization}|${item.date}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        product: item.product,
        customization: item.customization,
        category: item.category,
        date: item.date,
        unitPrice: item.price,
        totalQty: 0,
        totalRevenue: 0
      };
    }
    groupedData[key].totalQty += item.qty;
    groupedData[key].totalRevenue += (item.qty * item.price);
  });

  rvCurrentFilteredData = Object.values(groupedData).sort((a,b) => b.totalRevenue - a.totalRevenue);

  window.updateRvKPIs(rvCurrentFilteredData);
  window.renderRvTable(rvCurrentFilteredData);
};

window.updateRvKPIs = function(data) {
  const totalRev = data.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  
  const catRevenue = {};
  data.forEach(item => { catRevenue[item.category] = (catRevenue[item.category] || 0) + item.totalRevenue; });
  let topCat = "-"; let maxCatRev = 0;
  for (const [cat, rev] of Object.entries(catRevenue)) { if (rev > maxCatRev) { maxCatRev = rev; topCat = cat; } }

  const prodRevenue = {};
  data.forEach(item => { const prodName = item.product; prodRevenue[prodName] = (prodRevenue[prodName] || 0) + item.totalRevenue; });
  let topProd = "-"; let maxProdRev = 0;
  for (const [prod, rev] of Object.entries(prodRevenue)) { if (rev > maxProdRev) { maxProdRev = rev; topProd = prod; } }
  
  const elRev = document.getElementById('rv-kpi-revenue');
  const elCat = document.getElementById('rv-kpi-top-cat-name');
  const elCatVal = document.getElementById('rv-kpi-top-cat-value');
  const elProd = document.getElementById('rv-kpi-top-prod-name');
  const elProdVal = document.getElementById('rv-kpi-top-prod-value');

  if(elRev) elRev.innerText = formatRvCurrency(totalRev);
  if(elCat) elCat.innerText = topCat;
  if(elCatVal) elCatVal.innerText = maxCatRev > 0 ? formatRvCurrency(maxCatRev) : "";
  if(elProd) elProd.innerText = topProd;
  if(elProdVal) elProdVal.innerText = maxProdRev > 0 ? formatRvCurrency(maxProdRev) : "";
};

window.renderRvTable = function(data) {
  const tbody = document.getElementById('rv-table-body');
  if(!tbody) return;
  tbody.innerHTML = "";
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: #64748b;">No hay datos para este rango.</td></tr>`;
    return;
  }

  data.forEach(item => {
    const row = `
      <tr>
        <td class="font-bold">${item.product}</td>
        <td class="col-personalizacion">${item.customization}</td>
        <td>${item.category}</td>
        <td class="text-right">${formatRvCurrency(item.unitPrice)}</td>
        <td class="text-right">${item.totalQty}</td>
        <td class="text-right font-bold" style="color: var(--primary);">${formatRvCurrency(item.totalRevenue)}</td>
        <td class="col-fecha" style="text-align: center;">${item.date}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
};

window.generateSalesPDF = function() {
  if(!window.jspdf) { alert("Librería PDF no cargada"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const softBlack = [30, 30, 30]; 
  const softGray = [100, 100, 100];
  const lightGrayFill = [245, 245, 245];

  doc.setTextColor(...softBlack);
  doc.setDrawColor(200, 200, 200);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Mi Barrio Burger", 14, 20);

  doc.setLineWidth(0.1);
  doc.line(14, 25, pageWidth - 14, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("REPORTE DE VENTAS DETALLADO", 14, 35);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...softGray);
  doc.text("Generado por: Juan Pérez (Rol: Admin)", 14, 40);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...softBlack);
  doc.text(`Fecha Impresión: ${new Date().toLocaleString()}`, 14, 46);
  
  doc.text(`Desde: ${document.getElementById('rv-start-date').value}`, pageWidth - 14, 35, { align: 'right' });
  doc.text(`Hasta: ${document.getElementById('rv-end-date').value}`, pageWidth - 14, 40, { align: 'right' });

  const tableColumn = ["Producto", "Personalización", "Cat.", "Precio", "Cant.", "Total", "Fecha"];
  const tableRows = [];

  rvCurrentFilteredData.forEach(item => {
    const rowData = [
      item.product,
      item.customization,
      item.category,
      formatRvCurrency(item.unitPrice),
      item.totalQty,
      formatRvCurrency(item.totalRevenue),
      item.date
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, textColor: softBlack, lineColor: [230, 230, 230], lineWidth: 0.1 },
    headStyles: { fillColor: lightGrayFill, textColor: softBlack, fontStyle: 'bold', lineWidth: 0, },
    columnStyles: {
      0: { fontStyle: 'bold' }, 
      1: { fontStyle: 'italic', textColor: softGray },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 25, textColor: softGray } 
    },
    alternateRowStyles: { fillColor: [252, 252, 252] }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  const totalRev = rvCurrentFilteredData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.1);
  doc.line(pageWidth - 80, finalY, pageWidth - 14, finalY);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL INGRESOS:`, pageWidth - 80, finalY + 7);
  doc.text(`${formatRvCurrency(totalRev)}`, pageWidth - 14, finalY + 7, { align: 'right' });

  doc.save('Reporte_Ventas_MiBarrio.pdf');
};

// Inicialización externa
window.initReporteVentas = function() {
    setTimeout(() => {
        if(document.getElementById('rv-btn-today')) {
            window.setRvPreset('today'); 
        }
    }, 50);
};