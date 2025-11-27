/**
 * ADMIN.JS - CONTROLADOR DE INTERFAZ (UI)
 * Maneja: Sidebar, Navegación, Gráficos y Eventos del DOM.
 * Respeta la lógica original de los botones.
 */

// ---------- NOTIFICACIONES (UI) ----------
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
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
    
    // Clonamos para limpiar eventos previos
    const newProceed = proceed.cloneNode(true);
    const newCancel = cancel.cloneNode(true);
    proceed.parentNode.replaceChild(newProceed, proceed);
    cancel.parentNode.replaceChild(newCancel, cancel);

    function cleanup() { modal.classList.remove('active'); }
    
    newProceed.addEventListener('click', () => { cleanup(); onConfirm && onConfirm(); });
    newCancel.addEventListener('click', cleanup);
    modal.onclick = (e) => { if (e.target === modal) cleanup(); };
}

// ---------- GRÁFICOS ----------
function initChart(){ 
    try{ 
        const c = document.getElementById('salesChart'); 
        if(!c) return; 
        const ctx = c.getContext('2d'); 
        if(typeof Chart === 'undefined') return; 
        new Chart(ctx,{ type:'line', data:{ labels:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], datasets:[{ label:'Ventas (S/)', data:[1250,1900,1450,2200,1800,2500,2100], borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', tension:0.3, fill:true }] }, options:{ responsive:true } }); 
    }catch(e){ console.warn('Chart init error',e); } 
}

// ---------- NAVEGACIÓN (Restaurando Estado) ----------
function restoreViewFromHash(){
    const raw = (location.hash||'').replace(/^#/,''); 
    let target = raw || 'inicio';
    
    // Limpiar clases activas
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelectorAll('.submenu li').forEach(li=>li.classList.remove('active'));
    
    // CASO 1: MANTENIMIENTO
    if(target.startsWith('mantenimiento')){
        const parts = target.split('/'); 
        const table = parts[1] || 'usuarios'; 
        
        // 1. Activar UI
        document.getElementById('mantenimiento').classList.add('active');
        document.getElementById('mantenimientoSubmenu').classList.add('active');
        document.getElementById('mantenimientoToggle').classList.add('active');
        // Poner flecha hacia arriba
        const arrow = document.querySelector('#mantenimientoToggle .arrow');
        if(arrow) arrow.textContent = '▲';
        
        const activeBtn = document.querySelector(`#mantenimientoSubmenu li[data-table="${table}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        
        // 2. Cargar Datos (Llamada a mantenimiento.js)
        // 2. Cargar Datos (Llamada genérica a API para cualquier tabla)
        if(typeof cargarDatosAPI === 'function') {
            cargarDatosAPI(table); // <-- Esta función ahora controla todo en mantenimiento.js
        }
        return;
    }
    
    // CASO 2: REPORTES
    if(target.startsWith('reporte-')){
        const reportName = target.replace('reporte-', '');
        const sectionId = target;
        
        document.getElementById(sectionId) && document.getElementById(sectionId).classList.add('active');
        document.getElementById('reportesSubmenu') && document.getElementById('reportesSubmenu').classList.add('active');
        document.getElementById('reportesToggle') && document.getElementById('reportesToggle').classList.add('active');
        
        const arrow = document.querySelector('#reportesToggle .arrow');
        if(arrow) arrow.textContent = '▲';
        
        const activeBtn = document.querySelector(`#reportesSubmenu li[data-report="${reportName}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        return;
    }
    
    // CASO 3: VISTAS NORMALES
    const gestionItem = document.querySelector(`#gestionProductosSubmenu li[data-view="${target}"]`);
    if(gestionItem){ 
        document.getElementById(target) && document.getElementById(target).classList.add('active'); 
        document.getElementById('gestionProductosSubmenu') && document.getElementById('gestionProductosSubmenu').classList.add('active'); 
        document.querySelector('#gestionProductosToggle .arrow') && (document.querySelector('#gestionProductosToggle .arrow').textContent='▲'); 
        gestionItem.classList.add('active'); 
        return; 
    }
    
    const sec = document.getElementById(target);
    if(sec){ 
        sec.classList.add('active'); 
        const navItem = document.querySelector(`.nav-item[data-view="${target}"]`);
        if(navItem) navItem.classList.add('active');
    } else { 
        document.getElementById('inicio') && document.getElementById('inicio').classList.add('active'); 
        const navStart = document.querySelector('.nav-item[data-view="inicio"]');
        if(navStart) navStart.classList.add('active');
    }
}

// ---------- SIDEBAR DELEGATION (Tu lógica EXACTA restaurada) ----------
function initSidebarDelegation(){
    const sidebar = document.querySelector('.sidebar-nav'); 
    if(!sidebar) return;
    
    sidebar.addEventListener('click',(e)=>{
        const li = e.target.closest('li'); 
        if(!li || !sidebar.contains(li)) return;
        e.stopPropagation();
        
        // Botones Especiales
        if(li.id==='logoutBtn'){ 
            showConfirm('¿Deseas cerrar sesión?', ()=>{ 
                sessionStorage.clear(); 
                window.location.href='index.html?logout=true'; 
            }); 
            return; 
        }
        if(li.id==='interfazClienteBtn'){ window.location.href='catalogo.html?from=admin'; return; }
        if(li.id==='interfazKDSBtn'){ window.location.href='KDS.html?from=admin'; return; }
        
        // Toggles (Acordeones) - LÓGICA ORIGINAL
        if(li.id==='gestionProductosToggle' || li.id==='mantenimientoToggle' || li.id==='reportesToggle'){
            const submenuId = li.id === 'gestionProductosToggle' ? 'gestionProductosSubmenu' : 
                              li.id === 'mantenimientoToggle' ? 'mantenimientoSubmenu' : 'reportesSubmenu';
            
            const submenu = document.getElementById(submenuId);
            if(submenu){ 
                const isActive = submenu.classList.contains('active'); 
                submenu.classList.toggle('active', !isActive); 
                const arrow = li.querySelector('.arrow'); 
                if(arrow) arrow.textContent = isActive ? '▼' : '▲'; 
            }
            return;
        }
        
        // CLICS EN SUBMENUS (MANTENIMIENTO)
        if(li.closest && li.closest('#mantenimientoSubmenu')){
            const table = li.dataset.table; 
            if(!table) return;
            
            // 1. Cambiar Hash
            window.location.hash = `mantenimiento/${table}`;
            // 2. Recargar (Lo que pediste)
            window.location.reload();
            return;
        }
        
        // CLICS EN GESTION PRODUCTOS
        if(li.closest && li.closest('#gestionProductosSubmenu')){
            const view = li.dataset.view; 
            if(!view) return;
            
            document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); 
            document.getElementById(view) && document.getElementById(view).classList.add('active'); 
            document.querySelectorAll('#gestionProductosSubmenu li').forEach(x=>x.classList.remove('active')); 
            li.classList.add('active'); 
            document.getElementById('gestionProductosSubmenu') && document.getElementById('gestionProductosSubmenu').classList.add('active'); 
            document.querySelector('#gestionProductosToggle .arrow') && (document.querySelector('#gestionProductosToggle .arrow').textContent='▲'); 
            try{ location.hash = view; }catch(e){} 
            return;
        }

        // CLICS EN REPORTES
        if(li.closest && li.closest('#reportesSubmenu')){
            const report = li.dataset.report; 
            if(!report) return;
            
            const sectionId = `reporte-${report}`; 
            document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); 
            document.getElementById(sectionId) && document.getElementById(sectionId).classList.add('active'); 
            document.querySelectorAll('#reportesSubmenu li').forEach(x=>x.classList.remove('active')); 
            li.classList.add('active'); 
            document.getElementById('reportesSubmenu') && document.getElementById('reportesSubmenu').classList.add('active'); 
            document.querySelector('#reportesToggle .arrow') && (document.querySelector('#reportesToggle .arrow').textContent='▲'); 
            try{ location.hash = sectionId; }catch(e){} 
            return;
        }
        
        // Links Simples
        const view = li.dataset && li.dataset.view;
        if(view){ 
            document.querySelectorAll('.section').forEach(s=>s.classList.remove('active')); 
            document.getElementById(view) && document.getElementById(view).classList.add('active'); 
            document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active')); 
            document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active'); 
            try{ location.hash = view; }catch(e){} 
            return; 
        }
    });
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener('DOMContentLoaded',()=>{
    try{
        initChart();
        
        // Conectar botones del DOM a funciones de mantenimiento.js (si existen)
        const btnAdd = document.getElementById('btnAdd'); 
        if(btnAdd) btnAdd.addEventListener('click', () => { if(typeof openModal === 'function') openModal('create'); });
        
        const searchInput = document.getElementById('searchInput'); 
        if(searchInput) searchInput.addEventListener('input', (e) => { if(typeof filterMantenimiento === 'function') filterMantenimiento(e.target.value); });
        
        const btnCancel = document.getElementById('btnCancel'); 
        if(btnCancel) btnCancel.addEventListener('click', () => { if(typeof closeModal === 'function') closeModal(); });
        
        const btnSave = document.getElementById('btnSave'); 
        if(btnSave) btnSave.addEventListener('click', (e) => { if(typeof handleModalSave === 'function') handleModalSave(e); });
        
        const crudModal = document.getElementById('crudModal'); 
        if(crudModal) crudModal.addEventListener('click', (e) => { if(e.target === crudModal && typeof closeModal === 'function') closeModal(); });

        // Llamar a las funciones de navegación
        initSidebarDelegation();
        restoreViewFromHash();
        
    }catch(err){
        console.error('Init admin error', err);
    }
});