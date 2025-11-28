/**
 * MANTENIMIENTO.JS - VERSIÓN FINAL (VISUALIZACIÓN TEXTO/IMAGEN)
 * - Mantiene lógica original de guardado.
 * - Corrige visualización en tabla: Si no es URL, muestra texto.
 */

// ==========================================
// 1. CONFIGURACIÓN Y ENDPOINTS
// ==========================================
const API_BASE = 'http://burger-api-sandbox.com';

const API_CONFIG = {
    usuarios: {
        get:    `${API_BASE}/auth/management/users`,
        create: `${API_BASE}/auth/register`,
        edit:   `${API_BASE}/auth/management/user-edit`,
        delete: `${API_BASE}/auth/management/user-delete`
    },
    productos: {
        get:    `${API_BASE}/auth/products`,
        create: `${API_BASE}/auth/products`,
        edit:   `${API_BASE}/auth/products`,
        delete: `${API_BASE}/auth/products`
    },
    categorias: {
        get:    `${API_BASE}/auth/categories`,
        create: `${API_BASE}/auth/categories`,
        edit:   `${API_BASE}/auth/categories`,
        delete: `${API_BASE}/auth/categories`
    }
};

let rawData = {
    usuarios: [],
    productos: [],
    categorias: []
};

// ==========================================
// 2. CONFIGURACIÓN DE TABLAS
// ==========================================
const headers = {
    usuarios:   ['ID', 'Email', 'Nombres', 'Apellidos', 'Password', 'Doc Type', 'Nro Doc', 'Creado'],
    productos:  ['ID', 'Nombre', 'Cat. ID', 'Descripción', 'Precio', 'Stock', 'Imagen', 'Creado'],
    categorias: ['ID', 'Nombre', 'Descripción']
};

// ==========================================
// 3. CONFIGURACIÓN DE FORMULARIOS
// ==========================================
const schemas = {
    usuarios: [
        { key:'first_name', label:'Nombres', type:'text', required:true },
        { key:'last_name', label:'Apellidos', type:'text', required:true },
        { key:'email', label:'Email', type:'email', required:true },
        { key:'password', label:'Contraseña', type:'password', required:true },
        { key:'document_type_id', label:'ID Tipo Doc', type:'number' },
        { key:'nro_document', label:'Nro Documento', type:'text' }
    ],
    productos: [
        { key:'name', label:'Nombre Producto', type:'text', required:true },
        { key:'category_id', label:'ID Categoría', type:'number', required:true },
        { key:'description', label:'Descripción', type:'text' },
        { key:'price', label:'Precio', type:'number', step:'0.01', required:true },
        { key:'stock', label:'Stock', type:'number', required:true },
        // Input File + Texto
        { key:'image', label:'Imagen (URL o Archivo)', type:'file' }
    ],
    categorias: [
        { key:'name', label:'Nombre Categoría', type:'text', required:true },
        { key:'description', label:'Descripción', type:'text' }
    ]
};

let currentTable = 'usuarios';

// ==========================================
// 4. HELPERS
// ==========================================
function capitalize(s){ return s? s.charAt(0).toUpperCase()+s.slice(1):''; }

function getKeyFromHeader(h){ 
    const m = { 
        'ID':'id', 'Email':'email', 'Nombres':'first_name', 'Apellidos':'last_name', 'Password':'password',
        'Doc Type':'document_type_id', 'Nro Doc':'nro_document', 
        'Nombre':'name', 'Cat. ID':'category_id', 'Categoría ID':'category_id',
        'Descripción':'description', 'Precio':'price', 'Stock':'stock', 
        'Imagen':'image', 'URL Imagen':'image', 
        'Creado':'created_at' 
    }; 
    return m[h]||h.toLowerCase(); 
}

function getDisplayName(r){ 
    if(!r) return '';
    if(r.first_name) return `${r.first_name} ${r.last_name}`;
    if(r.name) return r.name;
    return r.id;
}

// Helper global para input file
window.updateImagePath = function(input, keyName) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        const newPath = `img/productos/${fileName}`;
        const textInput = document.getElementById(`path_${keyName}`);
        if(textInput) {
            textInput.value = newPath;
            textInput.dispatchEvent(new Event('input'));
        }
    }
};

// ==========================================
// 5. LÓGICA API
// ==========================================

async function cargarDatosAPI(tabla) {
    currentTable = tabla;
    const token = sessionStorage.getItem('token');
    if (!token) return; 

    const tbody = document.getElementById('mantenimientoBody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="10" class="text-center">🔄 Cargando datos...</td></tr>';

    try {
        const url = API_CONFIG[tabla].get;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        let data = await response.json();
        
        if (data.users) rawData[tabla] = data.users;
        else if (Array.isArray(data)) rawData[tabla] = data;
        else rawData[tabla] = []; 

        renderMantenimientoTable(tabla);

    } catch (e) {
        console.error(e);
        if(tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Error: ${e.message}</td></tr>`;
    }
}

async function crudAPI(action, payload, id = null) {
    const token = sessionStorage.getItem('token');
    const config = API_CONFIG[currentTable];
    let url, method;

    try {
        if ((action === 'edit' || action === 'delete') && !id) throw new Error("ID inválido.");

        if (action === 'create') {
            url = config.create;
            method = 'POST';
        } else if (action === 'edit') {
            url = currentTable === 'usuarios' ? `${config.edit}/${id}` : `${config.edit}/${id}`;
            method = 'PUT';
        } else if (action === 'delete') {
            url = `${config.delete}/${id}`;
            method = 'DELETE';
        }

        const headers = { 'Authorization': `Bearer ${token}` };
        const options = { method, headers };

        if (action !== 'delete') {
            headers['Content-Type'] = 'application/json';
            if (payload) options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const err = await response.json();
                throw new Error(err.message || err.msg || "Error API");
            } else {
                if(response.status === 500) throw new Error("Error 500 del Servidor.");
                throw new Error(`Error HTTP ${response.status}`);
            }
        }

        if(typeof showToast === 'function') showToast('Operación exitosa', 'success');
        setTimeout(() => location.reload(), 500);
        return true;

    } catch (e) {
        console.error(e);
        alert(`❌ Error:\n${e.message}`);
        return false;
    }
}

// ==========================================
// 6. RENDERIZADO DE TABLA
// ==========================================
function renderMantenimientoTable(tableKey){
    currentTable = tableKey;
    
    const titleEl = document.getElementById('mantenimientoTitle');
    if(titleEl) titleEl.textContent = `Mantenimiento - ${capitalize(tableKey)}`;
    const btnAdd = document.getElementById('btnAdd');
    if(btnAdd) btnAdd.textContent = `➕ Agregar ${capitalize(tableKey.slice(0,-1))}`; 
    
    const tbody = document.getElementById('mantenimientoBody');
    const headerRow = document.getElementById('mantenimientoHeader');
    if(!tbody || !headerRow) return;

    let colLabels = headers[tableKey] || [];
    let colKeys = colLabels.map(h => getKeyFromHeader(h));

    headerRow.innerHTML = '';
    colLabels.forEach(h => { 
        const th = document.createElement('th'); th.textContent = h; headerRow.appendChild(th); 
    });
    headerRow.innerHTML += '<th>Acciones</th>';
    
    tbody.innerHTML = '';
    const data = rawData[tableKey] || [];

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colLabels.length + 1}" class="text-center">No hay registros.</td></tr>`;
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        colKeys.forEach(key => { 
            const td = document.createElement('td'); 
            let val = row[key];
            
            // --- FORMATO ---
            if (val === undefined || val === null) {
                val = '-';
            } 
            else if (key === 'password') {
                val = '••••••'; 
            }
            else if (key === 'price') {
                val = `S/ ${parseFloat(val).toFixed(2)}`;
            }
            
            // ✅ IMAGEN: Muestra foto si es URL, texto si no lo es
            else if (key === 'image') {
                if (val.toString().startsWith('http')) {
                    val = `<img src="${val}" alt="img" 
                           style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #ccc;" 
                           onerror="this.outerHTML='<span style=\'font-size:0.8em; color:red\'>Link Roto</span>';">`;
                } 
                else {
                    // Muestra el texto tal cual (ej: "hola11")
                    val = `<span style="font-family:monospace; color:#555; font-size:0.9em;">${val}</span>`;
                }
            }
            
            else if (key === 'description') {
                if (val.length > 35) val = `<span title="${val}">${val.substring(0, 32)}...</span>`;
            }
            else if (key === 'created_at') { 
                try { 
                    const d = new Date(val);
                    if(!isNaN(d.getTime())) val = d.toLocaleDateString('es-PE');
                } catch(e){}
            }

            if(key === 'image' || key === 'description') td.innerHTML = val;
            else td.textContent = val; 
            
            tr.appendChild(td); 
        });
        
        const tdActions = document.createElement('td');
        tdActions.className = "action-cell";
        
        const edit = document.createElement('button'); 
        edit.className = 'btn btn-warning btn-sm'; 
        edit.innerHTML = '✏️'; 
        edit.onclick = () => openModal('edit', row.id);
        
        const del = document.createElement('button'); 
        del.className = 'btn btn-danger btn-sm'; 
        del.innerHTML = '🗑️'; 
        del.onclick = () => {
            if(confirm(`¿Eliminar ${getDisplayName(row)}?`)) crudAPI('delete', null, row.id);
        };
        
        tdActions.appendChild(edit); tdActions.appendChild(del); 
        tr.appendChild(tdActions); tbody.appendChild(tr);
    });
}

function filterMantenimiento(query){
    const tbody = document.getElementById('mantenimientoBody');
    if(!tbody) return;
    const q = (query||'').trim().toLowerCase();
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(r=>{
        const text = r.textContent.replace(/\s+/g,' ').toLowerCase();
        r.style.display = text.indexOf(q) !== -1 ? '' : 'none';
    });
}

// ==========================================
// 7. MODALES Y GUARDADO
// ==========================================
function openModal(mode, id=null){
    const form = document.getElementById('crudForm'); if(!form) return;
    form.innerHTML = '';
    
    const schema = schemas[currentTable]||[];
    const modalTitle = document.getElementById('modalTitle'); 
    if(modalTitle) modalTitle.textContent = mode==='create' ? `Crear` : `Editar`;
    
    if(mode==='edit') form.dataset.editId = id;
    
    let record = {};
    if(mode==='edit') {
        record = rawData[currentTable].find(r => r.id == id) || {};
    }
    
    schema.forEach(f=>{
        const div = document.createElement('div'); 
        div.className = 'form-group';
        
        let val = (mode==='edit') ? (record[f.key]||'') : '';
        let isRequired = f.required;

        if (f.key === 'password' && mode === 'edit') {
            val = '';
            isRequired = false;
        }

        // Input File + Texto Editable
        if (f.type === 'file') {
            div.innerHTML = `
                <label>${f.label}</label>
                <input type="file" class="form-control" accept="image/*" 
                       onchange="updateImagePath(this, '${f.key}')"
                       style="margin-bottom: 5px;">
                
                <input type="text" id="path_${f.key}" name="${f.key}" class="form-control" value="${val}" 
                       placeholder="Escribe la URL o selecciona un archivo..." 
                       style="background:#fff; color:#333; border:1px solid #bbb;">
                <small style="color:#666; font-size:0.8em;">* Edita el texto libremente o selecciona un archivo.</small>
            `;
        } 
        else {
            div.innerHTML = `<label>${f.label}${isRequired? ' *':''}</label><input type="${f.type}" name="${f.key}" class="form-control" value="${val}" ${isRequired? 'required':''} ${f.step? `step="${f.step}"` : ''}>`;
        }

        form.appendChild(div);
    });
    
    form.dataset.mode = mode;
    const crudModal = document.getElementById('crudModal'); 
    if(crudModal) crudModal.classList.add('active');
}

function closeModal(){ 
    const crudModal = document.getElementById('crudModal'); 
    if(crudModal) crudModal.classList.remove('active'); 
}

async function handleModalSave(e){ 
    if(e) e.preventDefault(); 
    const form = document.getElementById('crudForm'); if(!form) return;
    
    const mode = form.dataset.mode; 
    const editId = form.dataset.editId;
    const inputs = form.querySelectorAll('input'); 
    const entry = {}; 
    
    // ✅ Captura TODOS los inputs con 'name' (incluyendo el texto de imagen)
    inputs.forEach(i => {
        if(i.name) {
            entry[i.name] = i.value;
        }
    });
    
    // --- LIMPIEZA ---
    if (entry.password === "") delete entry.password;
    if (entry.price) entry.price = parseFloat(entry.price);
    if (entry.stock) entry.stock = parseInt(entry.stock);
    if (entry.category_id) entry.category_id = parseInt(entry.category_id);
    if (entry.document_type_id) entry.document_type_id = parseInt(entry.document_type_id);

    // Imagen: Solo enviamos null si está vacío
    if (currentTable === 'productos') {
        if (!entry.image || entry.image.trim() === "") {
            entry.image = null;
        } else {
            entry.image = entry.image.trim();
        }
    }

    console.log("🚀 Enviando:", entry);
    await crudAPI(mode, entry, editId);
}