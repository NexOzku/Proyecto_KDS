function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  // force reflow for transition if needed
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 320);
  }, 3000);
}

function showConfirm(message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;
  modal.classList.add('active');
  const proceed = document.getElementById('confirmProceed');
  const cancel = document.getElementById('confirmCancel');
  if (!proceed || !cancel) return;
  function cleanup() {
    modal.classList.remove('active');
    proceed.removeEventListener('click', proceedHandler);
    cancel.removeEventListener('click', cancelHandler);
    modal.removeEventListener('click', outside);
  }
  function proceedHandler() { cleanup(); onConfirm && onConfirm(); }
  function cancelHandler() { cleanup(); }
  function outside(ev) { if (ev.target === modal) cleanup(); }
  proceed.addEventListener('click', proceedHandler);
  cancel.addEventListener('click', cancelHandler);
  modal.addEventListener('click', outside);
}

// ---------- Datos de ejemplo y helpers ----------
let rawData = {
  usuarios: [
    { id:1, nombre:'Ana López', email:'ana@example.com', telefono:'999-111-222', rol:'admin' },
    { id:2, nombre:'Luis García', email:'luis@example.com', telefono:'999-222-333', rol:'editor' },
    { id:3, nombre:'María Pérez', email:'maria@example.com', telefono:'999-333-444', rol:'usuario' },
    { id:4, nombre:'Carlos Ruiz', email:'carlos@example.com', telefono:'999-444-555', rol:'usuario' },
    { id:5, nombre:'Sofía Díaz', email:'sofia@example.com', telefono:'999-555-666', rol:'gestor' }
  ],
  productos: [
    { id:1, nombre:'Hamburguesa Clásica', precio:10.00, categoria:'Hamburguesas', stock:12 },
    { id:2, nombre:'Hamburguesa BBQ', precio:15.00, categoria:'Hamburguesas', stock:5 },
    { id:3, nombre:'Papas Fritas', precio:6.00, categoria:'Acompañamientos', stock:20 },
    { id:4, nombre:'Gaseosa 500ml', precio:5.00, categoria:'Bebidas', stock:30 },
    { id:5, nombre:'Helado Vainilla', precio:7.50, categoria:'Postres', stock:8 }
  ],
  pedidos: [
    { id:1, cliente:'Ana López', fecha:'2025-11-10', estado:0, subtotal:30, igv:5.4, total:35.4, productos:'Hamburguesa x1, Papas x1' },
    { id:2, cliente:'Luis García', fecha:'2025-11-11', estado:1, subtotal:25, igv:4.5, total:29.5, productos:'Hamburguesa BBQ x1' },
    { id:3, cliente:'María Pérez', fecha:'2025-11-12', estado:2, subtotal:18, igv:3.24, total:21.24, productos:'Papas x2' },
    { id:4, cliente:'Carlos Ruiz', fecha:'2025-11-13', estado:3, subtotal:50, igv:9, total:59, productos:'Combo Familiar' },
    { id:5, cliente:'Sofía Díaz', fecha:'2025-11-14', estado:1, subtotal:12, igv:2.16, total:14.16, productos:'Gaseosa x2' }
  ],
  categorias: [
    { id:1, nombre:'Hamburguesas', descripcion:'Burgers clásicas y especiales' },
    { id:2, nombre:'Bebidas', descripcion:'Refrescos y jugos' },
    { id:3, nombre:'Postres', descripcion:'Dulces y helados' },
    { id:4, nombre:'Acompañamientos', descripcion:'Papas, aros de cebolla' },
    { id:5, nombre:'Extras', descripcion:'Salsas y complementos' }
  ],
  ubicaciones: [
    { id:1, nombre:'Sucursal Centro', direccion:'Av. Principal 123', telefono:'01-234567' },
    { id:2, nombre:'Sucursal Norte', direccion:'Calle Norte 45', telefono:'01-345678' },
    { id:3, nombre:'Sucursal Sur', direccion:'Av. Sur 67', telefono:'01-456789' },
    { id:4, nombre:'Sucursal Este', direccion:'Jr. Este 89', telefono:'01-567890' },
    { id:5, nombre:'Sucursal Oeste', direccion:'Plaza Oeste 10', telefono:'01-678901' }
  ]
};

const schemas = {
  usuarios: [
    { key:'nombre', label:'Nombre', type:'text', required:true },
    { key:'email', label:'Email', type:'email', required:true },
    { key:'telefono', label:'Teléfono', type:'text' },
    { key:'rol', label:'Rol', type:'text' }
  ],
  productos: [
    { key:'nombre', label:'Nombre', type:'text', required:true },
    { key:'precio', label:'Precio', type:'number', required:true, step:'0.01' },
    { key:'categoria', label:'Categoría', type:'text' },
    { key:'stock', label:'Stock', type:'number' }
  ],
  pedidos: [
    { key:'cliente', label:'Cliente', type:'text', required:true },
    { key:'fecha', label:'Fecha', type:'date' },
    { key:'estado', label:'Estado', type:'number' },
    { key:'subtotal', label:'Subtotal', type:'number', step:'0.01' },
    { key:'igv', label:'IGV', type:'number', step:'0.01' },
    { key:'total', label:'Total', type:'number', step:'0.01' },
    { key:'productos', label:'Productos (texto)', type:'text' }
  ],
  categorias: [
    { key:'nombre', label:'Nombre', type:'text', required:true },
    { key:'descripcion', label:'Descripción', type:'text' }
  ],
  ubicaciones: [
    { key:'nombre', label:'Nombre', type:'text', required:true },
    { key:'direccion', label:'Dirección', type:'text' },
    { key:'telefono', label:'Teléfono', type:'text' }
  ]
};

const headers = {
  usuarios:['ID','Nombre','Email','Teléfono','Rol'],
  productos:['ID','Nombre','Precio','Categoría','Stock'],
  pedidos:['ID','Cliente','Fecha','Estado','Subtotal','IGV','Total'],
  categorias:['ID','Nombre','Descripción'],
  ubicaciones:['ID','Nombre','Dirección','Teléfono']
};
let currentTable = 'usuarios';
function capitalize(s){ return s? s.charAt(0).toUpperCase()+s.slice(1):''; }
function getKeyFromHeader(h){ const m = { 'ID':'id','Nombre':'nombre','Email':'email','Precio':'precio','Categoría':'categoria','Teléfono':'telefono','Rol':'rol','Stock':'stock','Cliente':'cliente','Fecha':'fecha','Estado':'estado','Subtotal':'subtotal','IGV':'igv','Total':'total','Descripción':'descripcion','Dirección':'direccion' }; return m[h]||h.toLowerCase(); }
function getDisplayName(r){ if(!r) return ''; return r.nombre||r.cliente||r.email||r.id||''; }
function updateMetrics(){
  const elU = document.getElementById('metric-usuarios'); if(elU) elU.textContent = rawData.usuarios.length;
  const elP = document.getElementById('metric-pedidos'); if(elP) elP.textContent = rawData.pedidos.length;
  const elPr = document.getElementById('metric-productos'); if(elPr) elPr.textContent = rawData.productos.length;
}

// ---------- Render tabla mantenimiento ----------
function renderMantenimientoTable(tableKey){
  currentTable = tableKey;
  // actualizar título de sección y texto del botón agregar
  const titleEl = document.getElementById('mantenimientoTitle');
  if(titleEl) titleEl.textContent = `Mantenimiento - ${capitalize(tableKey)}`;
  const btnAdd = document.getElementById('btnAdd');
  if(btnAdd) btnAdd.textContent = `➕ Agregar ${capitalize(tableKey.slice(0,-1))}`;
  const searchEl = document.getElementById('searchInput'); if(searchEl) searchEl.placeholder = `Buscar en ${capitalize(tableKey)}`;
  // limpiar buscador al cambiar de tabla
  if(searchEl) searchEl.value = '';
  const headerRow = document.getElementById('mantenimientoHeader');
  const tbody = document.getElementById('mantenimientoBody');
  if(!headerRow || !tbody) return;
  // Construir columnas: usar `headers` si existen, si no inferir de los datos
  let colKeys = [];
  let colLabels = [];
  if (headers[tableKey] && headers[tableKey].length) {
    colLabels = headers[tableKey];
    colKeys = headers[tableKey].map(h => getKeyFromHeader(h));
  } else if (rawData[tableKey] && rawData[tableKey].length) {
    // Inferir claves en orden del primer registro
    colKeys = Object.keys(rawData[tableKey][0]);
    colLabels = colKeys.map(k => capitalize(k));
  } else {
    // Fallback genérico
    colKeys = ['id'];
    colLabels = ['ID'];
  }

  headerRow.innerHTML = '';
  colLabels.forEach(h => { const th = document.createElement('th'); th.textContent = h; headerRow.appendChild(th); });
  headerRow.innerHTML += '<th>Acciones</th>';
  tbody.innerHTML = '';

  (rawData[tableKey]||[]).forEach(row=>{
    const tr = document.createElement('tr');
    colKeys.forEach(key=>{ const td = document.createElement('td'); td.textContent = (row[key] !== undefined ? row[key] : '-'); tr.appendChild(td); });
    const tdActions = document.createElement('td');
    const edit = document.createElement('button'); edit.className = 'btn btn-warning'; edit.textContent = '✏️'; edit.addEventListener('click',()=>openModal('edit',row.id));
    const del = document.createElement('button'); del.className = 'btn btn-danger'; del.textContent = '🗑️'; del.addEventListener('click',()=>openCrudConfirm(`¿Eliminar ${getDisplayName(row)}?`, ()=>{ const idx = rawData[tableKey].findIndex(r=>r.id===row.id); if(idx!==-1){ rawData[tableKey].splice(idx,1); renderMantenimientoTable(tableKey); updateMetrics(); showToast('Eliminado','success'); } }));
    tdActions.appendChild(edit); tdActions.appendChild(del); tr.appendChild(tdActions); tbody.appendChild(tr);
  });
}

// Filtrado simple para el buscador de mantenimiento (actúa sobre filas ya renderizadas)
function filterMantenimiento(query){
  const tbody = document.getElementById('mantenimientoBody');
  if(!tbody) return;
  const q = (query||'').trim().toLowerCase();
  const rows = Array.from(tbody.querySelectorAll('tr'));
  if(!q){ rows.forEach(r=> r.style.display=''); return; }
  rows.forEach(r=>{
    const text = r.textContent.replace(/\s+/g,' ').toLowerCase();
    r.style.display = text.indexOf(q) !== -1 ? '' : 'none';
  });
}

// ---------- Modales y CRUD ----------
function openModal(mode,id=null){
  const form = document.getElementById('crudForm'); if(!form) return;
  form.innerHTML = '';
  const schema = schemas[currentTable]||[];
  const modalTitle = document.getElementById('modalTitle'); if(modalTitle) modalTitle.textContent = mode==='create' ? `Crear ${capitalize(currentTable.slice(0,-1))}` : `Editar ${capitalize(currentTable.slice(0,-1))}`;
  if(mode==='edit') form.dataset.editId = id;
  schema.forEach(f=>{
    const div = document.createElement('div'); div.className = 'form-group';
    const val = (mode==='edit' && form.dataset.editId) ? ((rawData[currentTable].find(r=>r.id==form.dataset.editId)||{})[f.key]||'') : '';
    div.innerHTML = `<label>${f.label}${f.required? ' *':''}</label><input type="${f.type}" name="${f.key}" class="form-control" value="${val}" ${f.required? 'required':''} ${f.step? `step="${f.step}"` : ''}>`;
    form.appendChild(div);
  });
  form.dataset.mode = mode;
  const crudModal = document.getElementById('crudModal'); if(crudModal) crudModal.classList.add('active');
}
function closeModal(){ const crudModal = document.getElementById('crudModal'); if(crudModal) crudModal.classList.remove('active'); }
function openCrudConfirm(message,onConfirm){ const form = document.getElementById('crudForm'); if(!form) return; const modalTitle = document.getElementById('modalTitle'); if(modalTitle) modalTitle.textContent='Confirmación'; form.innerHTML = `<div style="padding:12px 0">${message}</div>`; form.dataset.mode='deleteConfirm'; window._admin_confirm_cb = onConfirm; const crudModal = document.getElementById('crudModal'); if(crudModal) crudModal.classList.add('active'); }
function handleModalSave(e){ if(e) e.preventDefault(); const form = document.getElementById('crudForm'); if(!form) return; if(form.dataset.mode==='deleteConfirm'){ if(typeof window._admin_confirm_cb === 'function'){ window._admin_confirm_cb(); window._admin_confirm_cb = null; } closeModal(); return; } const mode = form.dataset.mode; const editId = form.dataset.editId ? parseInt(form.dataset.editId) : null; const inputs = form.querySelectorAll('input'); const entry = {}; inputs.forEach(i=>entry[i.name]=i.value); if(mode==='create'){ entry.id = Math.max(0,...(rawData[currentTable].map(d=>d.id||0)))+1; rawData[currentTable].push(entry); showToast('Creado','success'); } else if(mode==='edit'){ const idx = rawData[currentTable].findIndex(d=>d.id===editId); if(idx!==-1){ entry.id = editId; rawData[currentTable][idx]=entry; showToast('Actualizado','success'); } } renderMantenimientoTable(currentTable); updateMetrics(); closeModal(); }

// ---------- Chart ----------
function initChart(){ try{ const c = document.getElementById('salesChart'); if(!c) return; const ctx = c.getContext('2d'); if(typeof Chart === 'undefined') return; new Chart(ctx,{ type:'line', data:{ labels:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], datasets:[{ label:'Ventas (S/)', data:[1250,1900,1450,2200,1800,2500,2100], borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', tension:0.3, fill:true }] }, options:{ responsive:true } }); }catch(e){ console.warn('Chart init error',e); } }

// ---------- Hash navigation ----------
function restoreViewFromHash(){
  const raw = (location.hash||'').replace(/^#/,''); let target = raw || 'inicio';
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('.submenu li').forEach(li=>li.classList.remove('active'));
  if(target.startsWith('mantenimiento')){
    const parts = target.split('/'); const table = parts[1]||'usuarios'; renderMantenimientoTable(table);
    document.getElementById('mantenimiento') && document.getElementById('mantenimiento').classList.add('active');
    document.getElementById('mantenimientoSubmenu') && document.getElementById('mantenimientoSubmenu').classList.add('active');
    document.querySelector(`#mantenimientoSubmenu li[data-table="${table}"]`)?.classList.add('active');
    document.getElementById('mantenimientoToggle') && document.getElementById('mantenimientoToggle').classList.add('active');
    document.querySelector('#mantenimientoToggle .arrow') && (document.querySelector('#mantenimientoToggle .arrow').textContent='▲');
    return;
  }
  if(target.startsWith('reporte-')){
    document.getElementById(target) && document.getElementById(target).classList.add('active');
    document.getElementById('reportesSubmenu') && document.getElementById('reportesSubmenu').classList.add('active');
    document.querySelector(`#reportesSubmenu li[data-report="${target.replace('reporte-','')}"]`)?.classList.add('active');
    document.querySelector('#reportesToggle .arrow') && (document.querySelector('#reportesToggle .arrow').textContent='▲');
    return;
  }
  const gestionItem = document.querySelector(`#gestionProductosSubmenu li[data-view="${target}"]`);
  if(gestionItem){ document.getElementById(target) && document.getElementById(target).classList.add('active'); document.getElementById('gestionProductosSubmenu') && document.getElementById('gestionProductosSubmenu').classList.add('active'); document.querySelector('#gestionProductosToggle .arrow') && (document.querySelector('#gestionProductosToggle .arrow').textContent='▲'); gestionItem.classList.add('active'); return; }
  const sec = document.getElementById(target);
  if(sec){ sec.classList.add('active'); document.querySelector(`.nav-item[data-view="${target}"]`)?.classList.add('active'); }
  else { document.getElementById('inicio') && document.getElementById('inicio').classList.add('active'); document.querySelector('.nav-item[data-view="inicio"]')?.classList.add('active'); }
}

// ---------- Sidebar delegation ----------
function initSidebarDelegation(){
  const sidebar = document.querySelector('.sidebar-nav'); if(!sidebar) return;
  sidebar.addEventListener('click',(e)=>{
    const li = e.target.closest('li'); if(!li || !sidebar.contains(li)) return;
    e.stopPropagation();
    // botones especiales
    if(li.id==='logoutBtn'){ showConfirm('¿Deseas cerrar sesión?', ()=>{ sessionStorage.clear(); sessionStorage.clear(); window.location.href='index.html?logout=true'; }); return; }
    if(li.id==='interfazClienteBtn'){ window.location.href='catalogo.html?from=admin'; return; }
    if(li.id==='interfazKDSBtn'){ window.location.href='KDS.html?from=admin'; return; }
    // toggles de submenus
    if(li.id==='gestionProductosToggle' || li.id==='mantenimientoToggle' || li.id==='reportesToggle'){
      const submenuId = li.id==='gestionProductosToggle' ? 'gestionProductosSubmenu' : li.id==='mantenimientoToggle' ? 'mantenimientoSubmenu' : 'reportesSubmenu';
      const submenu = document.getElementById(submenuId);
      if(submenu){ const isActive = submenu.classList.contains('active'); submenu.classList.toggle('active', !isActive); const arrow = li.querySelector('.arrow'); if(arrow) arrow.textContent = isActive ? '▼' : '▲'; }
      return;
    }
    // clicks dentro de submenus
    if(li.closest && li.closest('#gestionProductosSubmenu')){
      const view = li.dataset.view; if(!view) return; document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); document.getElementById(view) && document.getElementById(view).classList.add('active'); document.querySelectorAll('#gestionProductosSubmenu li').forEach(x=>x.classList.remove('active')); li.classList.add('active'); document.getElementById('gestionProductosSubmenu') && document.getElementById('gestionProductosSubmenu').classList.add('active'); document.querySelector('#gestionProductosToggle .arrow') && (document.querySelector('#gestionProductosToggle .arrow').textContent='▲'); try{ location.hash = view; }catch(e){} return;
    }
    if(li.closest && li.closest('#mantenimientoSubmenu')){
      const table = li.dataset.table; if(!table) return; renderMantenimientoTable(table); document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); document.getElementById('mantenimiento') && document.getElementById('mantenimiento').classList.add('active'); document.querySelectorAll('#mantenimientoSubmenu li').forEach(x=>x.classList.remove('active')); li.classList.add('active'); document.getElementById('mantenimientoSubmenu') && document.getElementById('mantenimientoSubmenu').classList.add('active'); document.querySelector('#mantenimientoToggle .arrow') && (document.querySelector('#mantenimientoToggle .arrow').textContent='▲'); try{ location.hash = `mantenimiento/${table}`; }catch(e){} return;
    }
    if(li.closest && li.closest('#reportesSubmenu')){
      const report = li.dataset.report; if(!report) return; const sectionId = `reporte-${report}`; document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); document.getElementById(sectionId) && document.getElementById(sectionId).classList.add('active'); document.querySelectorAll('#reportesSubmenu li').forEach(x=>x.classList.remove('active')); li.classList.add('active'); document.getElementById('reportesSubmenu') && document.getElementById('reportesSubmenu').classList.add('active'); document.querySelector('#reportesToggle .arrow') && (document.querySelector('#reportesToggle .arrow').textContent='▲'); try{ location.hash = sectionId; }catch(e){} return;
    }
    // links simples
    const view = li.dataset && li.dataset.view;
    if(view){ document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); document.getElementById(view) && document.getElementById(view).classList.add('active'); document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active')); document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active'); try{ location.hash = view; }catch(e){} return; }
  });
}

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded',()=>{
  try{
    initChart();
    updateMetrics();
    renderMantenimientoTable('usuarios');
    const btnAdd = document.getElementById('btnAdd'); if(btnAdd) btnAdd.addEventListener('click',()=>openModal('create'));
    const searchInput = document.getElementById('searchInput'); if(searchInput) searchInput.addEventListener('input',(e)=> filterMantenimiento(e.target.value));
    const btnCancel = document.getElementById('btnCancel'); if(btnCancel) btnCancel.addEventListener('click', closeModal);
    const btnSave = document.getElementById('btnSave'); if(btnSave) btnSave.addEventListener('click', handleModalSave);
    const crudModal = document.getElementById('crudModal'); if(crudModal) crudModal.addEventListener('click',(e)=>{ if(e.target===crudModal) closeModal(); });
    initSidebarDelegation();
    restoreViewFromHash();
    window.addEventListener('hashchange', restoreViewFromHash);
  }catch(err){
    console.error('Init admin error', err);
    try{ showToast('Error en inicialización: '+(err && err.message ? err.message : String(err)), 'error'); }catch(e){}
  }
});
