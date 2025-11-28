/**
 * ADMIN.JS - CONTROLADOR DE INTERFAZ (UI)
 */

// ... (El código de showToast y showConfirm sigue igual) ... 
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
    
    const newProceed = proceed.cloneNode(true);
    const newCancel = cancel.cloneNode(true);
    proceed.parentNode.replaceChild(newProceed, proceed);
    cancel.parentNode.replaceChild(newCancel, cancel);

    function cleanup() { modal.classList.remove('active'); }
    
    newProceed.addEventListener('click', () => { cleanup(); onConfirm && onConfirm(); });
    newCancel.addEventListener('click', cleanup);
    modal.onclick = (e) => { if (e.target === modal) cleanup(); };
}

// ---------- NAVEGACIÓN ----------
function restoreViewFromHash(){
    const raw = (location.hash||'').replace(/^#/,''); 
    let target = raw || 'inicio';
    
    // Limpiar clases activas
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelectorAll('.submenu li').forEach(li=>li.classList.remove('active'));
    
    // 1. DASHBOARD
    if(target === 'dashboard') {
        document.getElementById('dashboard').classList.add('active');
        document.querySelector('.nav-item[data-view="dashboard"]').classList.add('active');
        // INICIALIZAR DASHBOARD SI EXISTE LA FUNCIÓN
        if(window.initDashboard) window.initDashboard();
        return;
    }

    // 2. REPORTES
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

        // INICIALIZAR REPORTES ESPECÍFICOS
        if(target === 'reporte-ventas' && window.initReporteVentas) window.initReporteVentas();
        if(target === 'reporte-productos-populares' && window.initReportePopulares) window.initReportePopulares();

        return;
    }
    
    // ... (El resto de la navegación: Mantenimiento, Productos, Inicio sigue igual) ...
    if(target.startsWith('mantenimiento')){
        const parts = target.split('/'); 
        const table = parts[1] || 'usuarios'; 
        
        document.getElementById('mantenimiento').classList.add('active');
        document.getElementById('mantenimientoSubmenu').classList.add('active');
        document.getElementById('mantenimientoToggle').classList.add('active');
        const arrow = document.querySelector('#mantenimientoToggle .arrow');
        if(arrow) arrow.textContent = '▲';
        
        const activeBtn = document.querySelector(`#mantenimientoSubmenu li[data-table="${table}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        
        if(typeof cargarDatosAPI === 'function') cargarDatosAPI(table);
        return;
    }

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

function initSidebarDelegation(){
    const sidebar = document.querySelector('.sidebar-nav'); 
    if(!sidebar) return;
    
    sidebar.addEventListener('click',(e)=>{
        const li = e.target.closest('li'); 
        if(!li || !sidebar.contains(li)) return;
        e.stopPropagation();
        
        if(li.id==='logoutBtn'){ 
            showConfirm('¿Deseas cerrar sesión?', ()=>{ 
                sessionStorage.clear(); 
                window.location.href='index.html?logout=true'; 
            }); 
            return; 
        }
        if(li.id==='interfazClienteBtn'){ window.location.href='catalogo.html?from=admin'; return; }
        if(li.id==='interfazKDSBtn'){ window.location.href='KDS.html?from=admin'; return; }
        
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
        
        if(li.closest && li.closest('#mantenimientoSubmenu')){
            const table = li.dataset.table; 
            if(!table) return;
            window.location.hash = `mantenimiento/${table}`;
            // Simular recarga para limpiar estado visual
            setTimeout(restoreViewFromHash, 10);
            return;
        }
        
        if(li.closest && li.closest('#gestionProductosSubmenu')){
            const view = li.dataset.view; 
            if(!view) return;
            try{ location.hash = view; setTimeout(restoreViewFromHash, 10); }catch(e){} 
            return;
        }

        if(li.closest && li.closest('#reportesSubmenu')){
            const report = li.dataset.report; 
            if(!report) return;
            const sectionId = `reporte-${report}`; 
            try{ location.hash = sectionId; setTimeout(restoreViewFromHash, 10); }catch(e){} 
            return;
        }
        
        const view = li.dataset && li.dataset.view;
        if(view){ 
            try{ location.hash = view; setTimeout(restoreViewFromHash, 10); }catch(e){} 
            return; 
        }
    });
}

document.addEventListener('DOMContentLoaded',()=>{
    try{
        // Event listeners de mantenimiento (si existen)
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

        initSidebarDelegation();
        restoreViewFromHash();
        
        // Listener para cambios de Hash (navegación por URL)
        window.addEventListener('hashchange', restoreViewFromHash);
        
    }catch(err){
        console.error('Init admin error', err);
    }
});