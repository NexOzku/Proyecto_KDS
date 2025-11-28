// js/reporte_productos_populares.js

const getRppLocalISO = d => { const z = d.getTimezoneOffset() * 60000; return new Date(d - z).toISOString().split('T')[0]; };
const getRppDaysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return getRppLocalISO(d); };

const rppRawData = [
  { id: 1, product: "Hamburguesa Royal", category: "Hamburguesas", price: 25.00, qty: 5, date: getRppDaysAgo(0) },
  { id: 2, product: "Hamburguesa Royal", category: "Hamburguesas", price: 25.00, qty: 3, date: getRppDaysAgo(0) },
  { id: 3, product: "Inka Cola 500ml", category: "Bebidas", price: 5.00, qty: 10, date: getRppDaysAgo(0) },
  { id: 4, product: "Papas Fritas", category: "Acompañamientos", price: 8.00, qty: 8, date: getRppDaysAgo(0) },
  { id: 5, product: "Hamburguesa Clásica", category: "Hamburguesas", price: 18.00, qty: 6, date: getRppDaysAgo(0) },
  { id: 6, product: "Hamburguesa Doble", category: "Hamburguesas", price: 28.00, qty: 12, date: getRppDaysAgo(1) }, 
  { id: 7, product: "Coca Cola 1L", category: "Bebidas", price: 9.00, qty: 15, date: getRppDaysAgo(1) },
  { id: 8, product: "Hamburguesa Clásica", category: "Hamburguesas", price: 18.00, qty: 20, date: getRppDaysAgo(2) },
  { id: 9, product: "Nuggets x6", category: "Acompañamientos", price: 12.00, qty: 5, date: getRppDaysAgo(2) },
  { id: 10, product: "Jugo de Naranja", category: "Bebidas", price: 8.00, qty: 2, date: getRppDaysAgo(2) },
  { id: 11, product: "Torta de Chocolate", category: "Postres", price: 10.00, qty: 8, date: getRppDaysAgo(3) },
  { id: 12, product: "Hamburguesa Vegana", category: "Hamburguesas", price: 24.00, qty: 4, date: getRppDaysAgo(3) },
  { id: 13, product: "Chicha Morada", category: "Bebidas", price: 6.00, qty: 25, date: getRppDaysAgo(4) },
  { id: 14, product: "Milkshake Oreo", category: "Postres", price: 14.00, qty: 15, date: getRppDaysAgo(5) },
  { id: 15, product: "Gaseosa 1.5L", category: "Bebidas", price: 11.00, qty: 2, date: getRppDaysAgo(6) }
];

let rppAggregatedData = [];
let rppGrandTotalUnits = 0; 
const formatRppCurrency = (num) => `S/. ${num.toFixed(2)}`;

window.setRppPreset = function(type) {
  const btns = document.querySelectorAll('.rpp-btn');
  btns.forEach(b => b.classList.remove('active'));
  
  const btn = document.getElementById(`rpp-btn-${type}`);
  if(btn) btn.classList.add('active');

  const today = new Date();
  let startStr = "", endStr = "";

  if (type === 'today') {
    startStr = getRppLocalISO(today);
    endStr = getRppLocalISO(today);
  } else if (type === 'week') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    startStr = getRppLocalISO(start);
    endStr = getRppLocalISO(today);
  } else if (type === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    startStr = getRppLocalISO(start);
    endStr = getRppLocalISO(today);
  } else if (type === 'year') {
    const start = new Date(today.getFullYear(), 0, 1);
    startStr = getRppLocalISO(start);
    endStr = getRppLocalISO(today);
  }

  const sInput = document.getElementById('rpp-start-date');
  const eInput = document.getElementById('rpp-end-date');
  if(sInput && eInput) {
      sInput.value = startStr;
      eInput.value = endStr;
      window.applyRppFilters();
  }
};

window.applyRppFilters = function() {
  const sInput = document.getElementById('rpp-start-date');
  const eInput = document.getElementById('rpp-end-date');
  const cSelect = document.getElementById('rpp-category-filter');

  if(!sInput || !eInput || !cSelect) return;

  const startStr = sInput.value;
  const endStr = eInput.value;
  const catFilter = cSelect.value;
  
  const label = document.getElementById('rpp-pdf-context-label');
  if(label) label.innerText = `Análisis: ${startStr} al ${endStr}`;

  const filteredRaw = rppRawData.filter(item => {
    const dateMatch = item.date >= startStr && item.date <= endStr;
    const catMatch = catFilter === 'all' || item.category === catFilter;
    return dateMatch && catMatch;
  });

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

  rppAggregatedData = Object.values(grouped).sort((a,b) => b.totalQty - a.totalQty);
  rppGrandTotalUnits = rppAggregatedData.reduce((acc, curr) => acc + curr.totalQty, 0);

  window.updateRppKPIs(rppAggregatedData);
  window.renderRppTable(rppAggregatedData);
};

window.updateRppKPIs = function(data) {
  // Elementos
  const elSalesName = document.getElementById('rpp-kpi-top-sales-name');
  const elSalesVal = document.getElementById('rpp-kpi-top-sales-value');
  const elCatName = document.getElementById('rpp-kpi-top-cat-name');
  const elCatVal = document.getElementById('rpp-kpi-top-cat-value');
  const elUnits = document.getElementById('rpp-kpi-total-units');

  if (data.length === 0) {
    if(elSalesName) elSalesName.innerText = "-";
    if(elSalesVal) elSalesVal.innerText = "";
    if(elCatName) elCatName.innerText = "-";
    if(elCatVal) elCatVal.innerText = "";
    if(elUnits) elUnits.innerText = "0";
    return;
  }

  const topSeller = data[0]; 
  
  const catCounts = {};
  data.forEach(item => { catCounts[item.category] = (catCounts[item.category] || 0) + item.totalQty; });
  let topCat = "-"; let maxCatQty = 0;
  for (const [cat, qty] of Object.entries(catCounts)) { if (qty > maxCatQty) { maxCatQty = qty; topCat = cat; } }

  const totalUnits = data.reduce((acc, curr) => acc + curr.totalQty, 0);

  if(elSalesName) elSalesName.innerText = topSeller.product;
  if(elSalesVal) elSalesVal.innerText = `${topSeller.totalQty} unids.`;
  
  if(elCatName) elCatName.innerText = topCat;
  if(elCatVal) elCatVal.innerText = `${maxCatQty} unids.`;
  
  if(elUnits) elUnits.innerText = totalUnits;
};

window.renderRppTable = function(data) {
  const tbody = document.getElementById('rpp-table-body');
  if(!tbody) return;
  tbody.innerHTML = "";
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #64748b;">No hay productos vendidos en este período.</td></tr>`;
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

window.generatePopPDF = function() {
  if(!window.jspdf) { alert('Librería PDF no cargada'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const softBlack = [30, 30, 30]; 
  const softGray = [100, 100, 100];

  doc.setTextColor(...softBlack);
  doc.setDrawColor(200, 200, 200);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Mi Barrio Burger", 14, 20);

  doc.setLineWidth(0.1);
  doc.line(14, 25, pageWidth - 14, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("REPORTE DE PRODUCTOS POPULARES (RANKING)", 14, 35);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...softGray);
  doc.text("Generado por: Juan Pérez (Rol: Admin)", 14, 40);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...softBlack);
  doc.text(`Fecha Impresión: ${new Date().toLocaleString()}`, 14, 46);
  
  doc.text(`Desde: ${document.getElementById('rpp-start-date').value}`, pageWidth - 14, 35, { align: 'right' });
  doc.text(`Hasta: ${document.getElementById('rpp-end-date').value}`, pageWidth - 14, 40, { align: 'right' });

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
    startY: 55,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, textColor: softBlack, lineColor: [230, 230, 230], lineWidth: 0.1 },
    headStyles: { fillColor: [245, 245, 245], textColor: softBlack, fontStyle: 'bold', lineWidth: 0 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    },
    alternateRowStyles: { fillColor: [252, 252, 252] }
  });

  doc.save('Ranking_Productos_MiBarrio.pdf');
};

// Inicialización externa
window.initReportePopulares = function() {
    setTimeout(() => {
        if(document.getElementById('rpp-btn-today')) {
            window.setRppPreset('today'); 
        }
    }, 50);
};
