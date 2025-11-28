// ====== MULTI-USER SYSTEM ======
const USERS_KEY = "admin_users";
const SESSIONS_KEY = "active_sessions";

// Default users dengan role yang berbeda
const defaultUsers = [
  {
    id: 1,
    username: "superadmin",
    password: "super123",
    name: "Super Administrator",
    role: "superadmin",
    email: "superadmin@hotel.com",
    createdAt: new Date().toISOString(),
    isActive: true,
    permissions: ["all"],
  },
  {
    id: 2,
    username: "manager",
    password: "manager123",
    name: "Ballroom Manager",
    role: "manager",
    email: "manager@hotel.com",
    createdAt: new Date().toISOString(),
    isActive: true,
    permissions: ["view", "edit", "add", "delete"],
  },
  {
    id: 3,
    username: "staff",
    password: "staff123",
    name: "Ballroom Staff",
    role: "staff",
    email: "staff@hotel.com",
    createdAt: new Date().toISOString(),
    isActive: true,
    permissions: ["view", "edit"],
  },
  {
    id: 4,
    username: "viewer",
    password: "viewer123",
    name: "View Only",
    role: "viewer",
    email: "viewer@hotel.com",
    createdAt: new Date().toISOString(),
    isActive: true,
    permissions: ["view"],
  },
];

// Initialize users system
function initializeUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(SESSIONS_KEY)) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
  }
}

// Get all users
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Save users
function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Find user by username
function findUser(username) {
  const users = getUsers();
  return users.find((user) => user.username === username && user.isActive);
}

// Verify password
function verifyPassword(user, password) {
  return user.password === password;
}

// Create session
function createSession(user) {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
  const session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    loginTime: new Date().toISOString(),
    token: generateToken(),
  };
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return session;
}

// Get current session
function getCurrentSession() {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
  return sessions.length > 0 ? sessions[sessions.length - 1] : null;
}

// Logout - clear session
function clearSession() {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
  sessionStorage.removeItem("isAdmin");
}

// Generate simple token
function generateToken() {
  return "token_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
}

// Check if user is logged in
function isLoggedIn() {
  const session = getCurrentSession();
  return session && sessionStorage.getItem("isAdmin") === "1";
}

// Check user permissions
function hasPermission(requiredPermission) {
  const session = getCurrentSession();
  if (!session) return false;

  // Superadmin memiliki semua permissions
  if (session.role === "superadmin") return true;

  return (
    session.permissions.includes(requiredPermission) ||
    session.permissions.includes("all")
  );
}

// Get user role hierarchy
function getRoleHierarchy(role) {
  const hierarchy = {
    viewer: 1,
    staff: 2,
    manager: 3,
    superadmin: 4,
  };
  return hierarchy[role] || 0;
}

// ====== UPDATED LOGIN FLOW ======
function handleLogin() {
  const username = loginUser.value.trim();
  const password = loginPass.value;

  if (!username || !password) {
    alert("Username dan password harus diisi");
    return;
  }

  const user = findUser(username);

  if (user && verifyPassword(user, password)) {
    const session = createSession(user);
    sessionStorage.setItem("isAdmin", "1");

    // Update UI dengan info user
    adminStatus.textContent = `Signed in as ${user.name} (${user.role})`;
    showDashboard();

    // Tampilkan welcome message
    showWelcomeMessage(user);
  } else {
    alert("Username / password salah");
  }
}

// ====== PERMISSION-BASED UI UPDATES ======
function updateUIForPermissions() {
  const session = getCurrentSession();
  if (!session) return;

  // Show/hide elements based on permissions
  if (!hasPermission("add")) {
    btnAdd.style.display = "none";
  }

  if (!hasPermission("delete")) {
    // Hide delete buttons in table
    document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.style.display = "none";
    });
    btnResetAll.style.display = "none";
  }

  // Show user management only for superadmin
  if (session.role === "superadmin") {
    setupUserManagement();
  }

  // Update table actions based on permissions
  updateTableActions();
}

function updateTableActions() {
  const rows = tblBody.querySelectorAll("tr");
  rows.forEach((row) => {
    const editBtn = row.querySelector('[data-action="edit"]');
    const deleteBtn = row.querySelector('[data-action="delete"]');

    if (editBtn && !hasPermission("edit")) {
      editBtn.style.display = "none";
    }

    if (deleteBtn && !hasPermission("delete")) {
      deleteBtn.style.display = "none";
    }
  });
}

// ====== USER MANAGEMENT UI ======
function setupUserManagement() {
  // Check if user management already exists
  if (document.getElementById("userManagementSection")) {
    return;
  }

  const userManagementHTML = `
        <div class="card" id="userManagementSection">
            <div class="card-header">
                <h3>👥 User Management</h3>
            </div>
            <div class="card-body">
                <button type="button" class="btn primary" onclick="openUserModal()">
                    ➕ Tambah User Baru
                </button>
                <div id="usersTable" style="margin-top: 1rem;"></div>
            </div>
        </div>
        
        <!-- User Modal -->
        <div id="userModal" class="modal-backdrop" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="userModalTitle">Tambah User Baru</h3>
                    <span class="close" onclick="closeUserModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="newUserName">Nama Lengkap:</label>
                        <input type="text" id="newUserName" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="newUserUsername">Username:</label>
                        <input type="text" id="newUserUsername" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="newUserPassword">Password:</label>
                        <input type="password" id="newUserPassword" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="newUserEmail">Email:</label>
                        <input type="email" id="newUserEmail" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="newUserRole">Role:</label>
                        <select id="newUserRole" class="form-control">
                            <option value="viewer">Viewer</option>
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="toggle-switch">
                            <span>User Aktif</span>
                            <input type="checkbox" id="newUserActive" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn secondary" onclick="closeUserModal()">Batal</button>
                    <button type="button" class="btn primary" onclick="saveUser()">Simpan</button>
                </div>
            </div>
        </div>
    `;

  // Insert after the first card in dashboard
  const firstCard = dashboard.querySelector(".card");
  if (firstCard) {
    firstCard.insertAdjacentHTML("afterend", userManagementHTML);
  } else {
    dashboard.insertAdjacentHTML("afterbegin", userManagementHTML);
  }

  renderUsersTable();
}

// Render users table
function renderUsersTable() {
  const users = getUsers();
  const table = document.getElementById("usersTable");
  const currentUser = getCurrentSession();

  if (!table) return;

  if (users.length === 0) {
    table.innerHTML = '<p style="color: var(--muted);">Tidak ada user</p>';
    return;
  }

  let html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                <thead>
                    <tr style="background-color: #14631bff;">
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbbd5f;">Nama</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbbd5f;">Username</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbbd5f;">Role</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbbd5f;">Status</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbbd5f;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;

  users.forEach((user) => {
    const canEdit =
      currentUser &&
      (currentUser.role === "superadmin" ||
        getRoleHierarchy(currentUser.role) > getRoleHierarchy(user.role));

    html += `
            <tr>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${escapeHtml(
                  user.name
                )}</td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${escapeHtml(
                  user.username
                )}</td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                    <span class="role-badge ${user.role}">${user.role}</span>
                </td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                    <span class="status-badge ${
                      user.isActive ? "active" : "inactive"
                    }">
                        ${user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                </td>
                <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                    ${
                      canEdit
                        ? `
                        <button class="btn ghost small" onclick="editUser(${
                          user.id
                        })">Edit</button>
                        ${
                          user.role !== "superadmin"
                            ? `<button class="btn danger small" onclick="deleteUser(${user.id})">Hapus</button>`
                            : ""
                        }
                    `
                        : '<span style="color: var(--muted);">Tidak dapat edit</span>'
                    }
                </td>
            </tr>
        `;
  });

  html += "</tbody></table></div>";
  table.innerHTML = html;
}

// User modal functions
function openUserModal(userId = null) {
  const modal = document.getElementById("userModal");
  const title = document.getElementById("userModalTitle");

  if (userId) {
    title.textContent = "Edit User";
    const user = getUsers().find((u) => u.id === userId);
    if (user) {
      document.getElementById("newUserName").value = user.name;
      document.getElementById("newUserUsername").value = user.username;
      document.getElementById("newUserEmail").value = user.email;
      document.getElementById("newUserRole").value = user.role;
      document.getElementById("newUserActive").checked = user.isActive;
      modal.dataset.editingUserId = userId;
    }
  } else {
    title.textContent = "Tambah User Baru";
    document.getElementById("newUserName").value = "";
    document.getElementById("newUserUsername").value = "";
    document.getElementById("newUserPassword").value = "";
    document.getElementById("newUserEmail").value = "";
    document.getElementById("newUserRole").value = "staff";
    document.getElementById("newUserActive").checked = true;
    delete modal.dataset.editingUserId;
  }

  modal.style.display = "flex";
}

function closeUserModal() {
  const modal = document.getElementById("userModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function saveUser() {
  const name = document.getElementById("newUserName").value.trim();
  const username = document.getElementById("newUserUsername").value.trim();
  const password = document.getElementById("newUserPassword").value;
  const email = document.getElementById("newUserEmail").value.trim();
  const role = document.getElementById("newUserRole").value;
  const isActive = document.getElementById("newUserActive").checked;

  if (!name || !username) {
    alert("Nama dan username harus diisi");
    return;
  }

  const users = getUsers();
  const modal = document.getElementById("userModal");
  const isEditing = modal.dataset.editingUserId;
  const currentUser = getCurrentSession();

  if (isEditing) {
    const userId = parseInt(isEditing);
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      // Check permission to edit this user
      const targetUser = users[userIndex];
      if (
        getRoleHierarchy(currentUser.role) <=
          getRoleHierarchy(targetUser.role) &&
        currentUser.role !== "superadmin"
      ) {
        alert("Anda tidak memiliki permission untuk mengedit user ini");
        return;
      }

      users[userIndex] = {
        ...users[userIndex],
        name,
        username,
        email,
        role,
        isActive,
        ...(password && { password }),
      };
    }
  } else {
    if (!password) {
      alert("Password harus diisi untuk user baru");
      return;
    }

    if (users.find((u) => u.username === username)) {
      alert("Username sudah digunakan");
      return;
    }

    // Set permissions based on role
    const permissions = {
      viewer: ["view"],
      staff: ["view", "edit"],
      manager: ["view", "edit", "add", "delete"],
      superadmin: ["all"],
    };

    const newUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name,
      username,
      password,
      email,
      role,
      isActive,
      permissions: permissions[role] || ["view"],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
  }

  setUsers(users);
  renderUsersTable();
  closeUserModal();
  alert("User berhasil disimpan");
}

function editUser(userId) {
  openUserModal(userId);
}

function deleteUser(userId) {
  if (!confirm("Hapus user ini?")) return;

  const users = getUsers();
  const userToDelete = users.find((u) => u.id === userId);
  const currentUser = getCurrentSession();

  if (userToDelete && userToDelete.role === "superadmin") {
    alert("Tidak dapat menghapus superadmin");
    return;
  }

  // Check permission
  if (
    getRoleHierarchy(currentUser.role) <= getRoleHierarchy(userToDelete.role) &&
    currentUser.role !== "superadmin"
  ) {
    alert("Anda tidak memiliki permission untuk menghapus user ini");
    return;
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  setUsers(updatedUsers);
  renderUsersTable();
  alert("User berhasil dihapus");
}

// ====== WELCOME MESSAGE ======
function showWelcomeMessage(user) {
  const welcomeMessages = {
    superadmin: `Selamat datang, ${user.name}! Anda memiliki akses penuh ke sistem.`,
    manager: `Selamat datang, ${user.name}! Anda dapat mengelola ballroom dan data.`,
    staff: `Selamat datang, ${user.name}! Anda dapat melihat dan mengedit data ballroom.`,
    viewer: `Selamat datang, ${user.name}! Anda dapat melihat data ballroom.`,
  };

  // Create toast notification
  const toast = document.createElement("div");
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-weight: 500;
        max-width: 400px;
    `;
  toast.textContent = welcomeMessages[user.role] || "Selamat datang!";
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      document.body.removeChild(toast);
    }
  }, 5000);
}

// ====== UPDATE EXISTING FUNCTIONS ======
// Update showDashboard function
const originalShowDashboard = showDashboard;
showDashboard = function () {
  originalShowDashboard();
  updateUIForPermissions();
};

function handleLogout() {
  clearSession();
  showLogin();
}

// Update table render to include permission checks
const originalRenderTable = renderTable;
renderTable = function () {
  originalRenderTable();
  updateTableActions();
};

// Add permission checks to critical operations
const originalOpenEdit = openEdit;
openEdit = function (id) {
  if (!hasPermission("edit")) {
    alert("Anda tidak memiliki permission untuk mengedit data");
    return;
  }
  originalOpenEdit(id);
};

const originalRemoveOne = removeOne;
removeOne = function (id) {
  if (!hasPermission("delete")) {
    alert("Anda tidak memiliki permission untuk menghapus data");
    return;
  }
  originalRemoveOne(id);
};

// ====== ADD CSS FOR USER MANAGEMENT ======
const userManagementCSS = `
.role-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.role-badge.superadmin {
    background-color: #dc2626;
    color: white;
}

.role-badge.manager {
    background-color: #cbbd5f;
    color: white;
}

.role-badge.staff {
    background-color: #10b981;
    color: white;
}

.role-badge.viewer {
    background-color: #6b7280;
    color: white;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-badge.active {
    background-color: #10b981;
    color: white;
}

.status-badge.inactive {
    background-color: #6b7280;
    color: white;
}

.btn.small {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    margin-right: 0.25rem;
}
`;

// Inject CSS
const style = document.createElement("style");
style.textContent = userManagementCSS;
document.head.appendChild(style);

// ====== UPDATE EVENT LISTENERS ======
// Remove existing listeners and add new ones
btnLogin.addEventListener("click", handleLogin);
btnLogout.addEventListener("click", handleLogout);

// ====== INITIALIZE USERS SYSTEM ======
document.addEventListener("DOMContentLoaded", function () {
  initializeUsers();

  // Check login
  if (isLoggedIn()) {
    showDashboard();
  } else {
    showLogin();
  }
});
