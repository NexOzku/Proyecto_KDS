(function () {
    // Datos iniciales
    const users = [
        { id: 1, name: "Samir Aguilar", role: "Admin" },
        { id: 2, name: "María López", role: "Personal de cocina" },
        { id: 3, name: "Carlos Díaz", role: "Cliente" },
        { id: 4, name: "Ana Torres", role: "Admin" },
        { id: 5, name: "Luis Ramírez", role: "Cliente" },
        { id: 6, name: "Sofía Martínez", role: "Personal de cocina" },
        { id: 7, name: "Diego Pérez", role: "Cliente" },
        { id: 8, name: "Elena Gómez", role: "Admin" },
        { id: 9, name: "Javier Ruiz", role: "Cliente" },
        { id: 10, name: "Lucía Fernández", role: "Personal de cocina" },
        { id: 11, name: "Raúl Castro", role: "Cliente" },
        { id: 12, name: "Valeria Soto", role: "Admin" },
        { id: 13, name: "Fernando Mendoza", role: "Personal de cocina" },
        { id: 14, name: "Carla Ríos", role: "Cliente" },
        { id: 15, name: "Miguel Ángel", role: "Admin" },
        { id: 16, name: "Patricia Rojas", role: "Personal de cocina" },
        { id: 17, name: "Andrés Salazar", role: "Cliente" },
        { id: 18, name: "Gabriela Paredes", role: "Admin" },
        { id: 19, name: "Ricardo Vargas", role: "Cliente" },
        { id: 20, name: "Daniela Ortega", role: "Personal de cocina" }
    ];

    let filteredUsers = [...users]; // Copia para filtrado

    const tbody = document.getElementById('grp-usersTableBody');
    const searchInput = document.getElementById('grp-searchInput');
    const roleFilter = document.getElementById('grp-roleFilter');

    if (!tbody || !searchInput || !roleFilter) return;

    function renderTable() {
        tbody.innerHTML = '';

        filteredUsers.forEach(user => {
            let badgeClass = '';
            if (user.role === "Admin") badgeClass = "role-admin";
            else if (user.role === "Personal de cocina") badgeClass = "role-kitchen";
            else if (user.role === "Cliente") badgeClass = "role-client";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td><span class="role-badge ${badgeClass}">${user.role}</span></td>
                <td><button class="edit-btn" data-id="${user.id}">✏️</button></td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll('#gestion-roles-permisos .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedRole = roleFilter.value;

        filteredUsers = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm);
            const matchesRole = selectedRole === "" || user.role === selectedRole;
            return matchesSearch && matchesRole;
        });

        renderTable();
    }

    function openEditModal(userId) {
        const user = users.find(u => u.id == userId);
        if (!user) return;

        document.getElementById('grp-editUserId').value = user.id;
        document.getElementById('grp-editUserName').textContent = user.name;
        document.getElementById('grp-roleSelect').value = user.role;
        document.getElementById('grp-editModal').classList.add('active');
    }

    function closeEditModal() {
        document.getElementById('grp-editModal').classList.remove('active');
    }

    function showToast(message = 'Rol actualizado correctamente') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'success');
        } else {
            alert(message);
        }
    }

    // Eventos
    searchInput.addEventListener('input', applyFilters);
    roleFilter.addEventListener('change', applyFilters);

    document.getElementById('grp-cancelEdit')?.addEventListener('click', closeEditModal);
    document.getElementById('grp-saveEdit')?.addEventListener('click', () => {
        const userId = document.getElementById('grp-editUserId').value;
        const newRole = document.getElementById('grp-roleSelect').value;

        const userIndex = users.findIndex(u => u.id == userId);
        if (userIndex !== -1) {
            users[userIndex].role = newRole;
            applyFilters(); // Refresca la tabla filtrada
            closeEditModal();
            showToast();
        }
    });

    // Inicializar
    renderTable();
})();