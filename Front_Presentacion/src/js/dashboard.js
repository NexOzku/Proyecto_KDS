// ==========================================
// 1. VARIABLES Y DATOS (Globales)
// ==========================================
const getDbLocalISO = d => { const z = d.getTimezoneOffset() * 60000; return new Date(d - z).toISOString().split('T')[0]; };
const getDbDaysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return getDbLocalISO(d); };

const dbRawData = [
  { product: "Hamburguesa Royal", category: "Hamburguesas", price: 25, qty: 5, date: getDbDaysAgo(0) },
  { product: "Inka Cola 500ml", category: "Bebidas", price: 5, qty: 15, date: getDbDaysAgo(0) },
  { product: "Hamburguesa Doble", category: "Hamburguesas", price: 28, qty: 10, date: getDbDaysAgo(1) },
  { product: "Coca Cola 1L", category: "Bebidas", price: 9, qty: 12, date: getDbDaysAgo(1) },
  { product: "Alitas BBQ", category: "Acompañamientos", price: 35, qty: 4, date: getDbDaysAgo(1) },
  { product: "Hamburguesa Clásica", category: "Hamburguesas", price: 18, qty: 20, date: getDbDaysAgo(2) },
  { product: "Nuggets x6", category: "Acompañamientos", price: 12, qty: 20, date: getDbDaysAgo(2) },
  { product: "Limonada", category: "Bebidas", price: 10, qty: 15, date: getDbDaysAgo(3) },
  { product: "Torta Chocolate", category: "Postres", price: 10, qty: 5, date: getDbDaysAgo(4) },
  { product: "Hamburguesa Vegana", category: "Hamburguesas", price: 24, qty: 4, date: getDbDaysAgo(5) },
  { product: "Hamburguesa Royal", category: "Hamburguesas", price: 25, qty: 25, date: getDbDaysAgo(6) },
  { product: "Salchipapa", category: "Acompañamientos", price: 14, qty: 40, date: getDbDaysAgo(7) },
  { product: "Hamburguesa Parrillera", category: "Hamburguesas", price: 30, qty: 10, date: getDbDaysAgo(12) },
  { product: "Chicha Morada", category: "Bebidas", price: 12, qty: 30, date: getDbDaysAgo(15) },
  { product: "Milkshake Fresa", category: "Postres", price: 15, qty: 10, date: getDbDaysAgo(20) },
  { product: "Papas Fritas", category: "Acompañamientos", price: 10, qty: 50, date: getDbDaysAgo(28) },
  { product: "Hamburguesa Doble", category: "Hamburguesas", price: 28, qty: 15, date: getDbDaysAgo(45) },
  { product: "Cerveza Artesanal", category: "Bebidas", price: 15, qty: 20, date: getDbDaysAgo(60) }
];

let dbCharts = {};

// ==========================================
// 2. FUNCIONES (Asignadas directamente a window)
// ==========================================

window.setDbPreset = function(t) {
  // Manejo de botones activos
  const btns = document.querySelectorAll('.db-btn-preset');
  btns.forEach(b => b.classList.remove('active'));
  
  const activeBtn = document.getElementById(`db-btn-${t}`);
  if(activeBtn) activeBtn.classList.add('active');

  const today = new Date();
  let s = getDbLocalISO(today), e = getDbLocalISO(today);
  
  if(t==='week') s = getDbDaysAgo(6);
  if(t==='month') { const d = new Date(); d.setDate(1); s = getDbLocalISO(d); }
  if(t==='year') { const d = new Date(); d.setMonth(0); d.setDate(1); s = getDbLocalISO(d); }
  
  const sInput = document.getElementById('db-start-date');
  const eInput = document.getElementById('db-end-date');
  
  if(sInput && eInput) {
      sInput.value = s;
      eInput.value = e;
      window.updateDashboard(); // Llamada directa
  }
};

window.checkInventoryCount = function() {
  const uniqueProds = [...new Set(dbRawData.map(i => i.product))];
  let lowStockCount = 0;
  const THRESHOLD = 10; 

  uniqueProds.forEach(p => {
    const simStock = Math.floor(Math.random() * 25); 
    if(simStock < THRESHOLD) lowStockCount++;
  });

  const alertCard = document.getElementById('db-alert-card-container');
  const alertIcon = document.getElementById('db-alert-icon-content');
  const alertText = document.getElementById('db-alert-text-content');

  if(alertCard) {
      alertCard.classList.remove('danger', 'safe');
      if (lowStockCount === 0) {
        alertCard.classList.add('safe');
        if(alertIcon) alertIcon.innerText = '✅';
        if(alertText) alertText.innerText = "Todo en orden";
      } else {
        alertCard.classList.add('danger');
        if(alertIcon) alertIcon.innerText = '!';
        if(alertText) alertText.innerText = `${lowStockCount} productos`;
      }
  }
};

window.getAllDatesInRange = function(startDate, endDate) {
  const dates = [];
  let curr = new Date(startDate + 'T12:00:00');
  const last = new Date(endDate + 'T12:00:00');
  while (curr <= last) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

window.updateDashboard = function() {
  const sInput = document.getElementById('db-start-date');
  const eInput = document.getElementById('db-end-date');
  
  // Seguridad si los inputs no existen aún
  if(!sInput || !eInput) return;

  const s = sInput.value;
  const e = eInput.value;
  
  const rangeText = document.getElementById('db-date-range-text');
  if(rangeText) rangeText.innerText = `${s} al ${e}`;
  
  const data = dbRawData.filter(i => i.date >= s && i.date <= e);
  
  const rev = data.reduce((a,c) => a + (c.qty*c.price), 0);
  const ticket = data.length ? rev/data.length : 0;
  
  // Actualizar DOM solo si los elementos existen
  const elTotal = document.getElementById('db-kpi-total');
  const elOrders = document.getElementById('db-kpi-orders');
  const elTicket = document.getElementById('db-kpi-ticket');
  
  if(elTotal) elTotal.innerText = `S/. ${rev.toFixed(2)}`;
  if(elOrders) elOrders.innerText = data.length;
  if(elTicket) elTicket.innerText = `S/. ${ticket.toFixed(2)}`;
  
  window.checkInventoryCount();

  const fullDateRange = window.getAllDatesInRange(s, e);
  const dateMap = {}; 
  
  data.forEach(i => {
    const v = i.qty * i.price;
    dateMap[i.date] = (dateMap[i.date] || 0) + v;
  });

  const trendData = fullDateRange.map(date => dateMap[date] || 0);

  const catMap = {};
  data.forEach(i => {
    catMap[i.category] = (catMap[i.category] || 0) + (i.qty * i.price);
  });
  const cats = Object.keys(catMap);
  const catVals = Object.values(catMap);

  const prodMap = {};
  data.forEach(i => {
    prodMap[i.product] = (prodMap[i.product] || 0) + i.qty;
  });
  const topProds = Object.entries(prodMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  window.renderDbCharts(fullDateRange, trendData, cats, catVals, topProds.map(x=>x[0]), topProds.map(x=>x[1]));
};

window.renderDbCharts = function(trendLabels, trendValues, catLabels, catValues, prods, prodVals) {
  // Chart 1: Trend
  const cv1 = document.getElementById('dbChartTrend');
  if(cv1) {
      const ctxTrend = cv1.getContext('2d');
      if(dbCharts.trend) dbCharts.trend.destroy();
      dbCharts.trend = new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Ventas (S/.)',
            data: trendValues,
            borderColor: '#2563eb', 
            backgroundColor: 'rgba(37, 99, 235, 0.1)', 
            borderWidth: 2,
            fill: true, 
            tension: 0.3, 
            pointRadius: 3,
            pointBackgroundColor: '#2563eb'
          }]
        },
        options: { 
          responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, 
          scales:{ y:{beginAtZero:true}, x:{ grid:{display:false}, ticks: { maxTicksLimit: 10, autoSkip: true, maxRotation: 0 } } } 
        }
      });
  }

  // Chart 2: Category
  const cv2 = document.getElementById('dbChartCat');
  if(cv2) {
      const ctxCat = cv2.getContext('2d');
      if(dbCharts.cat) dbCharts.cat.destroy();
      dbCharts.cat = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{ data: catValues, backgroundColor: ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'], borderWidth:1 }]
        },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right'}}, cutout:'65%' }
      });
  }

  // Chart 3: Top Products
  const cv3 = document.getElementById('dbChartTop');
  if(cv3) {
      const ctxTop = cv3.getContext('2d');
      if(dbCharts.top) dbCharts.top.destroy();
      dbCharts.top = new Chart(ctxTop, {
        type: 'bar',
        data: {
          labels: prods,
          datasets: [{ label:'Unidades', data:prodVals, backgroundColor:'#0f172a', borderRadius:4 }]
        },
        options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{display:false}}} }
      });
  }
};

// Función de inicialización segura
window.initDashboard = function() {
    setTimeout(() => {
        const btnToday = document.getElementById('db-btn-today');
        if(btnToday) {
            window.setDbPreset('today'); 
        }
    }, 100);
};

// Auto-inicializar si ya estamos en la vista (por si acaso)
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('db-btn-today')) {
        window.setDbPreset('today');
    }
});