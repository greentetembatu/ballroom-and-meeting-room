// script-admin.js

// ====== Admin logic ======

// Default admin credentials (stored in localStorage)
/*const ADMIN_KEY = 'admin_credentials';
    if (!localStorage.getItem(ADMIN_KEY)) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify({ username: 'admin', password: 'admin123' }));
    }*/

// Helpers for data
function getBallrooms() {
  return JSON.parse(localStorage.getItem("ballrooms")) || [];
}
function setBallrooms(arr) {
  localStorage.setItem("ballrooms", JSON.stringify(arr));
  // Trigger storage event for main page to react (optional, but good practice)
  window.dispatchEvent(new Event("storage"));
}

// Elements
const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const adminStatus = document.getElementById("adminStatus");

const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const btnLogin = document.getElementById("btnLogin");
const btnSeed = document.getElementById("btnSeed");

const tblBody = document.getElementById("tblBody");
const btnAdd = document.getElementById("btnAdd");
const btnLogout = document.getElementById("btnLogout");
const btnResetAll = document.getElementById("btnResetAll");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const imgPreview = document.getElementById("imgPreview");

const f_name = document.getElementById("f_name");
const f_floor = document.getElementById("f_floor");
const f_capacity = document.getElementById("f_capacity");
const f_description = document.getElementById("f_description");
const f_imageUrl = document.getElementById("f_imageUrl");
const f_imageFile = document.getElementById("f_imageFile");
const f_eventName = document.getElementById("f_eventName");
const f_eventType = document.getElementById("f_eventType");
const f_startDate = document.getElementById("f_startDate");
const f_endDate = document.getElementById("f_endDate");
const f_startTime = document.getElementById("f_startTime");
const f_endTime = document.getElementById("f_endTime");
const f_status = document.getElementById("f_status");

const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");

let editingId = null; // null => adding new

// Simple auth check
/* function isLoggedIn() {
      return sessionStorage.getItem('isAdmin') === '1';
    }*/

function showDashboard() {
  loginPanel.style.display = "none";
  // Clear login field on successful login
  loginPass.value = "";
  dashboard.style.display = "block";
  adminStatus.textContent = "Signed in";
  renderTable();
}
function showLogin() {
  loginPanel.style.display = "block";
  dashboard.style.display = "none";
  adminStatus.textContent = "Not signed in";
}

// Render table
function renderTable() {
  const data = getBallrooms();
  tblBody.innerHTML = "";
  if (data.length === 0) {
    tblBody.innerHTML =
      '<tr><td colspan="5" style="color:var(--muted)">No ballroom data</td></tr>';
    return;
  }
  data.forEach((b) => {
    const tr = document.createElement("tr");
    const eventInfo =
      b.eventName && b.startDate
        ? `<div class="small">${escapeHtml(b.eventName)}</div>
            <div class="small">${formatDateForTable(b.startDate)}</div> : 
            <div class="small">${formatDateForTable(b.endDate)}</div>`
        : `<div class="small">-</div>`;
    const statusClass =
      b.status === "Available" ? "available-text" : "occupied-text";

    tr.innerHTML = `
          <td><strong>${escapeHtml(
            b.name
          )}</strong><div class="small">${escapeHtml(
      b.description
        ? b.description.substring(0, 50) +
            (b.description.length > 50 ? "..." : "")
        : ""
    )}</div></td>
          <td>${escapeHtml(b.floor)}<div class="small">${escapeHtml(
      b.capacity
    )}</div></td>
          <td>${eventInfo}</td>
          <td style="color: ${
            b.status === "Available" ? "#cbbd5f" : "#ef4444"
          }"><strong>${escapeHtml(b.status || "Available")}</strong></td>
          <td class="row-actions">
            <button class="btn ghost" data-action="edit" data-id="${
              b.id
            }">Edit</button>
            <button class="btn ghost" data-action="view" data-id="${
              b.id
            }">View</button>
            <button class="btn danger" data-action="delete" data-id="${
              b.id
            }">Hapus</button>
          </td>
        `;
    tblBody.appendChild(tr);
  });
}

// Helper to format date (YYYY-MM-DD to DD/MM/YYYY)
function formatDateForTable(dateString) {
  if (!dateString) return "-";
  try {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
}

// Escape helper
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

// Event delegation for table actions
tblBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === "edit") openEdit(id);
  if (action === "view") viewInMainPage(id);
  if (action === "delete") removeOne(id);
});

// Enable/Disable form inputs
function setFormReadOnly(isReadOnly) {
  document
    .querySelectorAll(
      "#modalBackdrop input, #modalBackdrop textarea, #modalBackdrop select"
    )
    .forEach((el) => (el.disabled = isReadOnly));
  btnSave.style.display = isReadOnly ? "none" : "inline-block";
}

// Open edit
function openEdit(id) {
  const data = getBallrooms();
  const found = data.find((x) => x.id === id);
  if (!found) return alert("Data tidak ditemukan");

  editingId = id;
  modalTitle.textContent = "Edit Ballroom";

  // Set values
  f_name.value = found.name;
  f_floor.value = found.floor;
  f_capacity.value = found.capacity;
  f_description.value = found.description || "";
  f_imageUrl.value = found.imageUrl || "";
  f_eventName.value = found.eventName || "";
  f_eventType.value = found.eventType || "";
  f_startDate.value = found.startDate || ""; // YYYY-MM-DD
  f_endDate.value = found.endDate || ""; // YYYY-MM-DD
  f_startTime.value = found.startTime || "";
  f_endTime.value = found.endTime || "";
  f_status.value = found.status || "Available";
  setPreview(found.imageUrl);

  setFormReadOnly(false); // Enable input for editing
  modalBackdrop.style.display = "flex";
}

// View in main page by opening modal there
function viewInMainPage(id) {
  // set a temporary key so main page (if open) can react
  localStorage.setItem("previewBallroomId", id);

  // Open main page in a new tab
  window.open("index.html", "_blank");

  // Quick preview in admin modal (optional, using existing openEdit logic but read-only)
  const data = getBallrooms();
  const found = data.find((x) => x.id === id);
  if (!found) return; // Should not happen if data is in table

  editingId = id; // Use the ID temporarily for reference
  modalTitle.textContent = "Preview Ballroom (Read Only)";

  // Set values (reuse openEdit value setting)
  f_name.value = found.name;
  f_floor.value = found.floor;
  f_capacity.value = found.capacity;
  f_description.value = found.description || "";
  f_imageUrl.value = found.imageUrl || "";
  f_eventName.value = found.eventName || "";
  f_eventType.value = found.eventType || "";
  f_date.value = found.date || "";
  f_startTime.value = found.startTime || "";
  f_endTime.value = found.endTime || "";
  f_status.value = found.status || "Available";
  setPreview(found.imageUrl);

  setFormReadOnly(true); // Disable input for preview
  modalBackdrop.style.display = "flex";
}

// Remove one
function removeOne(id) {
  if (!confirm("Hapus ballroom ini?")) return;
  let data = getBallrooms();
  data = data.filter((x) => x.id !== id);
  setBallrooms(data);
  renderTable();
  alert("Ballroom berhasil dihapus.");
}

// New
btnAdd.addEventListener("click", () => {
  editingId = null;
  modalTitle.textContent = "Tambah Ballroom";
  // Clear form fields
  f_name.value = "";
  f_floor.value = "";
  f_capacity.value = "";
  f_description.value = "";
  f_imageUrl.value = "";
  //f_eventName.value=''; f_eventType.value=''; f_date.value=''; f_startTime.value=''; f_endTime.value=''; f_status.value='Available';
  setPreview("");
  setFormReadOnly(false); // Enable input for new addition
  modalBackdrop.style.display = "flex";
});

// Image preview & upload
f_imageUrl.addEventListener("input", () => setPreview(f_imageUrl.value));
f_imageFile.addEventListener("change", () => {
  const file = f_imageFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    f_imageUrl.value = reader.result;
    setPreview(reader.result);
  };
  reader.readAsDataURL(file);
});

function setPreview(src) {
  if (!src) {
    imgPreview.textContent = "Preview";
    imgPreview.style.backgroundImage = "none";
    return;
  }
  imgPreview.textContent = "";
  imgPreview.style.backgroundImage = `url(${src})`;
  imgPreview.style.backgroundSize = "cover";
  imgPreview.style.backgroundPosition = "center";
}

// Save handler
btnSave.addEventListener("click", () => {
  const name = f_name.value.trim();
  if (!name) return alert("Nama wajib diisi");
  if (!f_floor.value.trim()) return alert("Lantai wajib diisi");
  if (!f_capacity.value.trim()) return alert("Kapasitas wajib diisi");

  let payload = {
    id: editingId || generateId(name), // If editingId is present, use it
    name: name,
    floor: f_floor.value.trim(),
    capacity: f_capacity.value.trim(),
    imageUrl: f_imageUrl.value.trim(),
    description: f_description.value.trim(),
    eventName: f_eventName.value.trim(),
    eventType: f_eventType.value.trim(),
    startDate: f_startDate.value, // YYYY-MM-DD
    endDate: f_endDate.value, // YYYY-MM-DD
    startTime: f_startTime.value,
    endTime: f_endTime.value,
    status: f_status.value,
  };

  let data = getBallrooms();

  if (editingId) {
    // UPDATE: Find and replace the existing item
    data = data.map((x) => (x.id === editingId ? payload : x));
    alert("Ballroom berhasil diupdate!");
  } else {
    // ADD NEW: Check for ID conflict and push new item
    let newId = payload.id;
    let counter = 1;
    while (data.some((x) => x.id === newId)) {
      newId = `${payload.id}-${counter++}`;
    }
    payload.id = newId;
    data.push(payload);
    alert("Ballroom berhasil ditambahkan!");
  }

  setBallrooms(data);
  modalBackdrop.style.display = "none";
  renderTable();
});

btnCancel.addEventListener("click", () => {
  modalBackdrop.style.display = "none";
});

// Generate simple id (improved uniqueness check added in Save Handler)
function generateId(name) {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
    "-" +
    Date.now().toString().slice(-4)
  );
}

// Login flow
/*btnLogin.addEventListener('click', ()=>{
      const creds = JSON.parse(localStorage.getItem(ADMIN_KEY));
      if (loginUser.value === creds.username && loginPass.value === creds.password) {
        sessionStorage.setItem('isAdmin','1');
        showDashboard();
      } else {
        alert('Username / password salah');
      }
    });*/

// Logout
//  btnLogout.addEventListener('click', ()=>{ sessionStorage.removeItem('isAdmin'); showLogin(); });

// Seed/reset to default (Improved default data based on main page structure)
/*const defaultBallrooms = [
  {
    id: "garden-pavilion",
    name: "Garden Pavilion",
    floor: "Floor 1",
    capacity: "200 guests",
    imageUrl: "assets/lesti-kejora.png",
    description:
      "Sebuah paviliun elegan dengan dinding kaca dan pemandangan langsung ke taman hotel. Sempurna untuk resepsi siang hari dan acara intim.",
    eventName: "Pernikahan Tn. dan Ny. Smith",
    eventType: "Resepsi Pernikahan",
    date: "2025-12-10",
    startTime: "10:00",
    endTime: "14:00",
    status: "Occupied",
  },
  {
    id: "royal-suite",
    name: "Royal Suite",
    floor: "Floor 2",
    capacity: "150 guests",
    imageUrl: "[Placeholder Image 2 URL]",
    description:
      "Suite serbaguna mewah, ideal untuk pertemuan eksekutif dan pesta koktail.",
    eventName: "Rapat Tahunan Perusahaan",
    eventType: "Konferensi",
    date: "2026-01-15",
    startTime: "09:00",
    endTime: "17:00",
    status: "Available",
  },
  {
    id: "executive-room",
    name: "Executive Room",
    floor: "Floor 2",
    capacity: "80 guests",
    imageUrl: "[Placeholder Image 3 URL]",
    description:
      "Ruangan yang lebih kecil dan nyaman, cocok untuk rapat tim atau jamuan makan malam privat.",
    eventName: "Peluncuran Produk Baru",
    eventType: "Acara Bisnis",
    date: "2026-02-20",
    startTime: "18:00",
    endTime: "21:00",
    status: "Available",
  },
  {
    id: "grand-ballroom",
    name: "Grand Ballroom",
    floor: "Floor 3",
    capacity: "500 guests",
    imageUrl: "[Placeholder Image 4 URL]",
    description:
      "Ballroom terbesar kami, dilengkapi sistem audio canggih dan panggung luas. Ideal untuk gala dinner dan perayaan besar.",
    eventName: "Gala Dinner Amal",
    eventType: "Gala Dinner",
    date: "2026-03-05",
    startTime: "19:00",
    endTime: "23:00",
    status: "Occupied",
  },
  {
    id: "vip-lounge",
    name: "VIP Lounge",
    floor: "Floor 4",
    capacity: "120 guests",
    imageUrl: "[Placeholder Image 5 URL]",
    description:
      "Lounge eksklusif di lantai atas, menawarkan privasi dan pemandangan kota. Cocok untuk acara VIP dan sesi networking.",
    eventName: "Sesi Networking Investor",
    eventType: "Networking",
    date: "2026-04-10",
    startTime: "16:00",
    endTime: "19:00",
    status: "Available",
  },
  {
    id: "diamond-hall",
    name: "Diamond Hall",
    floor: "Floor 6",
    capacity: "500 guests",
    imageUrl: "[Placeholder Image 6 URL]",
    description:
      "Salah satu aula terbesar kami, sangat fleksibel untuk berbagai konfigurasi acara, dari pameran hingga jamuan makan formal.",
    eventName: "Pameran Seni Kontemporer",
    eventType: "Pameran",
    date: "2026-05-20",
    startTime: "09:00",
    endTime: "20:00",
    status: "Available",
  },
];

btnSeed.addEventListener("click", () => {
  if (
    !confirm(
      "Reset data ballroom ke default? Ini akan menimpa semua data yang ada."
    )
  )
    return;
  setBallrooms(defaultBallrooms);
  renderTable();
  alert("Data default berhasil dimuat");
});

// Reset All (delete)
btnResetAll.addEventListener("click", () => {
  if (!confirm("Hapus semua ballroom? Aksi ini tidak dapat dibatalkan."))
    return;
  setBallrooms([]);
  renderTable();
  alert("Semua data ballroom telah dihapus.");
});*/

// Remove modal on backdrop click
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) {
    modalBackdrop.style.display = "none";
    setFormReadOnly(false); // Pastikan input diaktifkan kembali
  }
});

// On load, check login
window.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) showDashboard();
  else showLogin();
});

// If no ballrooms, load default data
if (getBallrooms().length === 0) {
  setBallrooms(defaultBallrooms);
}

// Fungsi untuk load data yang sudah disimpan
function loadSavedHeader() {
  const savedTitle = localStorage.getItem("websiteTitle") || "LUXURY HOTEL";
  const savedSubtitle =
    localStorage.getItem("websiteSubtitle") || "Ballroom Directory";

  document.getElementById("adminTitle").value = savedTitle;
  document.getElementById("adminSubtitle").value = savedSubtitle;
}

// Fungsi untuk update header
function updateHeader() {
  const newTitle = document.getElementById("adminTitle").value;
  const newSubtitle = document.getElementById("adminSubtitle").value;

  // Simpan ke localStorage
  localStorage.setItem("websiteTitle", newTitle);
  localStorage.setItem("websiteSubtitle", newSubtitle);

  alert("Header berhasil diupdate!");
}

// Load data saat halaman admin dimuat
document.addEventListener("DOMContentLoaded", loadSavedHeader);

// ====== AUTO DOWNLOAD FEATURE ======
const autoDownloadToggle = document.getElementById("autoDownloadToggle");
const downloadStatus = document.getElementById("downloadStatus");
const downloadIntervalSelect = document.getElementById(
  "downloadIntervalSelect"
);

// Initialize auto download feature
function initializeAutoDownload() {
  // Load saved settings
  const autoDownloadEnabled =
    localStorage.getItem("autoDownloadEnabled") === "true";
  const downloadInterval =
    localStorage.getItem("downloadInterval") || "86400000"; // Default 24 jam

  if (autoDownloadToggle) {
    autoDownloadToggle.checked = autoDownloadEnabled;
  }
  if (downloadIntervalSelect) {
    downloadIntervalSelect.value = downloadInterval;
  }
  updateDownloadStatus();

  if (autoDownloadEnabled) {
    startAutoDownload(parseInt(downloadInterval));
  }
}

// Update download status display
function updateDownloadStatus() {
  if (!downloadStatus) return;

  const isEnabled = autoDownloadToggle ? autoDownloadToggle.checked : false;
  const nextDownload = localStorage.getItem("nextDownloadTime");

  if (isEnabled && nextDownload) {
    const nextTime = new Date(parseInt(nextDownload));
    const now = new Date();
    const timeDiff = nextTime - now;

    if (timeDiff > 0) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      downloadStatus.textContent = `Auto download berikutnya: ${hours} jam ${minutes} menit lagi`;
      downloadStatus.style.color = "#cbbd5f";
    } else {
      downloadStatus.textContent = "Auto download akan segera berjalan";
      downloadStatus.style.color = "#cbbd5f";
    }
  } else if (isEnabled) {
    downloadStatus.textContent = "Auto download aktif";
    downloadStatus.style.color = "#cbbd5f";
  } else {
    downloadStatus.textContent = "Auto download nonaktif";
    downloadStatus.style.color = "#ef4444";
  }
}

// Start auto download
function startAutoDownload(interval) {
  stopAutoDownload(); // Clear existing timer

  // Calculate next download time
  const nextDownloadTime = Date.now() + interval;
  localStorage.setItem("nextDownloadTime", nextDownloadTime.toString());
  localStorage.setItem("autoDownloadInterval", interval.toString());

  // Start timer
  const timer = setInterval(() => {
    downloadDailyData();
    // Schedule next download
    const newNextTime = Date.now() + interval;
    localStorage.setItem("nextDownloadTime", newNextTime.toString());
    updateDownloadStatus();
  }, interval);

  localStorage.setItem("autoDownloadTimer", timer.toString());
  updateDownloadStatus();
}

// Stop auto download
function stopAutoDownload() {
  const timerId = localStorage.getItem("autoDownloadTimer");
  if (timerId) {
    clearInterval(parseInt(timerId));
    localStorage.removeItem("autoDownloadTimer");
    localStorage.removeItem("nextDownloadTime");
  }
  updateDownloadStatus();
}

// FIXED CSV formatting function - menggunakan BOM untuk UTF-8 dan format yang benar
function formatCSVData(ballrooms) {
  // Header dengan kolom yang lebih terorganisir
  const headers = [
    "No",
    "Nama Ballroom",
    "Lantai",
    "Kapasitas",
    "Deskripsi",
    "Nama Acara",
    "Jenis Acara",
    "Tanggal Mulai",
    "Tanggal Selesai",
    "Waktu Mulai",
    "Waktu Selesai",
    "Status",
    "ID Ballroom",
  ];

  // Gunakan BOM untuk UTF-8 dan gunakan pemisah yang benar
  let csvContent = "\uFEFF"; // BOM untuk UTF-8
  csvContent += headers.join(";") + "\r\n"; // Gunakan ; sebagai pemisah

  ballrooms.forEach((ballroom, index) => {
    const row = [
      (index + 1).toString(), // No
      cleanCSVValue(ballroom.name || ""),
      cleanCSVValue(ballroom.floor || ""),
      cleanCSVValue(ballroom.capacity || ""),
      cleanCSVValue(ballroom.description || ""),
      cleanCSVValue(ballroom.eventName || "-"),
      cleanCSVValue(ballroom.eventType || "-"),
      cleanCSVValue(ballroom.startDate || "-"),
      cleanCSVValue(ballroom.endDate || "-"),
      cleanCSVValue(ballroom.startTime || "-"),
      cleanCSVValue(ballroom.endTime || "-"),
      cleanCSVValue(ballroom.status || "Available"),
      cleanCSVValue(ballroom.id || ""),
    ];
    csvContent += row.join(";") + "\r\n"; // Gunakan ; sebagai pemisah
  });

  return csvContent;
}

// Helper function untuk membersihkan nilai CSV
function cleanCSVValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  // Jika mengandung titik koma, quote, atau newline, wrap dengan quotes
  if (
    stringValue.includes(";") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return '"' + stringValue.replace(/"/g, '""') + '"'; // Escape quotes
  }

  return stringValue;
}

// Download daily data function - FIXED VERSION
function downloadDailyData() {
  try {
    const ballrooms = getBallrooms();
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Filter data untuk berbagai skenario
    const todaysEvents = ballrooms.filter((ballroom) => {
      if (!ballroom.startDate) return false;
      const eventDate = ballroom.startDate;
      return eventDate === currentDate;
    });

    // Jika tidak ada event hari ini, download semua data
    const dataToDownload = todaysEvents.length > 0 ? todaysEvents : ballrooms;
    const dataType = todaysEvents.length > 0 ? "harian" : "semua";

    if (dataToDownload.length === 0) {
      if (downloadStatus) {
        downloadStatus.textContent = "Tidak ada data untuk didownload";
        downloadStatus.style.color = "#ef4444";
      }
      return;
    }

    // Buat konten CSV dengan format yang benar
    const csvContent = formatCSVData(dataToDownload);

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const fileName =
      todaysEvents.length > 0
        ? `ballroom-data-${currentDate}.csv`
        : `ballroom-all-data-${currentDate}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);

    // Update status
    if (downloadStatus) {
      downloadStatus.textContent = `Data ${dataType} berhasil didownload (${
        dataToDownload.length
      } data) - ${new Date().toLocaleTimeString()}`;
      downloadStatus.style.color = "#10b981";
    }

    console.log(
      `Auto download completed: ${dataToDownload.length} ${dataType} data`
    );
  } catch (error) {
    console.error("Download error:", error);
    if (downloadStatus) {
      downloadStatus.textContent = "Error saat download data";
      downloadStatus.style.color = "#ef4444";
    }
  }
}

// Manual download function dengan opsi tambahan - FIXED
function manualDownload() {
  const ballrooms = getBallrooms();
  const currentDate = new Date().toISOString().split("T")[0];

  // Tanya user mau download data apa
  const choice = confirm(
    `Pilih jenis download:\n\nOK - Download data HARI INI (${currentDate})\nCancel - Download SEMUA data`
  );

  let dataToDownload;
  let dataType;

  if (choice) {
    // Download data hari ini
    dataToDownload = ballrooms.filter(
      (ballroom) => ballroom.startDate && ballroom.startDate === currentDate
    );
    dataType = "harian";
  } else {
    // Download semua data
    dataToDownload = ballrooms;
    dataType = "semua";
  }

  if (dataToDownload.length === 0) {
    alert("Tidak ada data untuk didownload!");
    return;
  }

  // Buat CSV dengan format yang benar
  const csvContent = formatCSVData(dataToDownload);
  const fileName = choice
    ? `ballroom-data-${currentDate}.csv`
    : `ballroom-all-data-${currentDate}.csv`;

  // Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);

  // Update status
  if (downloadStatus) {
    downloadStatus.textContent = `Data ${dataType} berhasil didownload (${dataToDownload.length} data)`;
    downloadStatus.style.color = "#10b981";
  }

  // Reset status after 5 seconds
  setTimeout(() => {
    updateDownloadStatus();
  }, 5000);
}

// Fungsi untuk download semua data - FIXED
function downloadAllData() {
  const ballrooms = getBallrooms();
  const currentDate = new Date().toISOString().split("T")[0];

  if (ballrooms.length === 0) {
    alert("Tidak ada data ballroom!");
    return;
  }

  const csvContent = formatCSVData(ballrooms);
  const fileName = `ballroom-complete-data-${currentDate}.csv`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);

  if (downloadStatus) {
    downloadStatus.textContent = `Semua data berhasil didownload (${ballrooms.length} data)`;
    downloadStatus.style.color = "#10b981";
  }

  setTimeout(() => {
    updateDownloadStatus();
  }, 5000);
}

// Event listeners for auto download
if (autoDownloadToggle) {
  autoDownloadToggle.addEventListener("change", function () {
    const isEnabled = this.checked;
    localStorage.setItem("autoDownloadEnabled", isEnabled.toString());

    if (isEnabled) {
      const interval = downloadIntervalSelect
        ? parseInt(downloadIntervalSelect.value)
        : 86400000;
      startAutoDownload(interval);
    } else {
      stopAutoDownload();
    }
  });
}

if (downloadIntervalSelect) {
  downloadIntervalSelect.addEventListener("change", function () {
    const interval = parseInt(this.value);
    localStorage.setItem("downloadInterval", interval.toString());

    if (autoDownloadToggle && autoDownloadToggle.checked) {
      startAutoDownload(interval);
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Tunggu sebentar untuk memastikan semua elemen sudah loaded
  setTimeout(() => {
    initializeAutoDownload();

    // Update countdown every minute
    setInterval(updateDownloadStatus, 60000);
  }, 100);
});
