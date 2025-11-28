// script.js

// Fungsi untuk menampilkan title dan subtitle dari localStorage
function loadHeader() {
  const savedTitle = localStorage.getItem("websiteTitle");
  const savedSubtitle = localStorage.getItem("websiteSubtitle");

  if (savedTitle) {
    document.getElementById("title").textContent = savedTitle;
  }
  if (savedSubtitle) {
    document.getElementById("subtitle").textContent = savedSubtitle;
  }
}

// Panggil saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadHeader);

function openModal(ballroomData) {
  const modal = document.getElementById("ballroomModal");

  // Mengisi data ke dalam elemen-elemen di modal
  document.getElementById("modalName").innerText = ballroomData.name;
  document.getElementById("modalFloor").innerText = ballroomData.floor;
  document.getElementById("modalCapacity").innerText = ballroomData.capacity;
  document.getElementById("modalImage").src = ballroomData.imageUrl;
  document.getElementById("modalDescription").innerText =
    ballroomData.description;

  // Mengisi detail acara tambahan
  // Gunakan format DD/MM/YYYY
  const formatTanggal = (dateString) => {
    if (!dateString) return "Tidak tersedia";
    return new Date(dateString + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  document.getElementById("modalEventName").innerText =
    ballroomData.eventName || "N/A";
  document.getElementById("modalEventType").innerText =
    ballroomData.eventType || "N/A";
  document.getElementById("modalStartDate").innerText = formatTanggal(
    ballroomData.startDate
  );
  document.getElementById("modalEndDate").innerText = formatTanggal(
    ballroomData.endDate
  );
  document.getElementById("modalStartTime").innerText =
    ballroomData.startTime || "N/A";
  document.getElementById("modalEndTime").innerText =
    ballroomData.endTime || "N/A";

  // Update Status Button
  //const statusButton = modal.querySelector(".status-button");
  //statusButton.textContent = ballroomData.status;
  //statusButton.className = "status-button"; // Reset class
  //statusButton.classList.add(
  //ballroomData.status === "Available" ? "TERSEDIA" : "DIGUNAKAN"
  //); // Add specific class for styling

  // Update Available text in modal
  modal.querySelector(".modal-available").textContent =
    ballroomData.status === "Available"
      ? "Available For Your Event"
      : "Occupied :";
  modal.querySelector(".modal-available").style.color =
    ballroomData.status === "Available" ? "#0fe00fff" : "#4726dcff";

  // Tampilkan modal
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("ballroomModal");
  // Sembunyikan modal
  modal.classList.remove("active");
}

// Tutup modal ketika pengguna mengklik di luar area modal
window.onclick = function (event) {
  const modal = document.getElementById("ballroomModal");
  if (event.target === modal) {
    closeModal();
  }
};

// Tambahan: Logika untuk jam dan tanggal
function updateTime() {
  const now = new Date();

  // Mendapatkan zona waktu Indonesia
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let timezoneSuffix = "";

  if (timezone.includes("Jakarta") || timezone.includes("Asia/Jakarta")) {
    timezoneSuffix = " WIB";
  } else if (
    timezone.includes("Makassar") ||
    timezone.includes("Asia/Makassar")
  ) {
    timezoneSuffix = " WITA";
  } else if (
    timezone.includes("Jayapura") ||
    timezone.includes("Asia/Jayapura")
  ) {
    timezoneSuffix = " WIT";
  }

  // Format waktu (misal: 14:30 WIB)
  const formattedTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0") +
    timezoneSuffix;

  // Opsi untuk format tanggal dalam bahasa Indonesia
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta", // Default ke WIB
  };

  // Format tanggal (misal: Selasa, 18 November 2024)
  const formattedDate = now.toLocaleDateString("id-ID", dateOptions);

  document.getElementById("time").innerText = formattedTime;
  document.getElementById("date").innerText = formattedDate;
}

// Atau alternatif lebih sederhana jika ingin manual timezone:
function updateTimeManual() {
  const now = new Date();

  // Pilih zona waktu manual (ubah sesuai kebutuhan)
  const timezone = "WIB"; // atau 'WITA' atau 'WIT'

  // Format waktu (misal: 14:30 WIB)
  const formattedTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0") +
    " " +
    timezone;

  // Daftar hari dalam bahasa Indonesia
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Daftar bulan dalam bahasa Indonesia
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayName = days[now.getDay()];
  const date = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  // Format tanggal (misal: Selasa, 18 November 2024)
  const formattedDate = `${dayName}, ${date} ${monthName} ${year}`;

  document.getElementById("time").innerText = formattedTime;
  document.getElementById("date").innerText = formattedDate;
}

// Panggil fungsi setiap detik
setInterval(updateTime, 1000);
updateTime(); // Panggil sekali saat pertama kali load

// ====== Logika Dinamis untuk Memuat Kartu dari localStorage ======

// Helper untuk mengambil data ballroom
function getBallrooms() {
  return JSON.parse(localStorage.getItem("ballrooms")) || [];
}

// Fungsi untuk merender semua kartu ballroom
function renderBallroomCards() {
  const data = getBallrooms();
  const cardGrid = document.getElementById("card-grid");
  cardGrid.innerHTML = ""; // Kosongkan grid yang ada

  data.forEach((b) => {
    // Buat elemen card-wrapper (div yang dapat diklik)
    const cardWrapper = document.createElement("div");
    cardWrapper.id = `card-wrapper-${b.id}`;
    cardWrapper.className = "card-wrapper";
    cardWrapper.setAttribute("data-ballroom-id", b.id);

    // Atur event klik untuk membuka modal
    cardWrapper.onclick = () => openModal(b);

    // Tentukan teks dan styling ketersediaan
    const availabilityText =
      b.status === "Available" ? "Available" : "Occupied";
    const availabilityClass =
      b.status === "Available" ? "available-status" : "occupied-status";
    const noteText =
      b.status === "Available"
        ? "Available For Your Event"
        : `${b.eventName} @ ${b.startTime} - ${b.endTime}`;

    // Tambahkan styling khusus untuk status
    cardWrapper.classList.add(availabilityClass);

    // Isi konten HTML kartu
    cardWrapper.innerHTML = `
        <div id="availability-${b.id}" class="availability ${availabilityClass}">${availabilityText}</div>
        <article id="card-${b.id}" class="card">
            <img id="img-${b.id}" src="${b.imageUrl}" alt="${b.name}" />
            <div id="card-content-${b.id}" class="card-content">
                <h3 id="card-header-${b.id}" class="card-header" style="margin: 0;"> ${b.name}</h3>
                <p id="note-${b.id}" style="font-size: 1rem; color: white; margin: 0;">${noteText}</p>
                <div id="details-${b.id}" class="details">
                    <span id="floor-${b.id}">
                        <svg stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                        ${b.floor}
                    </span>
                    <span>
                        <svg stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        TAB FOR DETAILS
                    </span>
                </div>
            </div>
        </article>
    `;

    cardGrid.appendChild(cardWrapper);
  });

  /* ================================================
     ===   BAGIAN PENTING untuk CSS otomatis   ======
     ================================================ */

  const cards = document.querySelectorAll(".card-wrapper");
  const total = cards.length;

  // Hapus semua class lama di cardGrid
  cardGrid.className = "";
  cardGrid.classList.add("card-grid");

  // Tambahkan class sesuai jumlah kartu → misal cards-5, cards-7, dll.
  cardGrid.classList.add(`cards-${total}`);
}

//////////////////////////////////////////
// KODE DIBAWAH INI ADALAH KODE UNTUK YANG DIATAS YANG KEMUDIAN DI GANTI FUNGSINYA
// <span id="capacity-${b.id}"><svg stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/></svg>Capacity: ${b.capacity}</span>

// Panggil fungsi renderCards saat DOM dimuat
document.addEventListener("DOMContentLoaded", () => {
  renderBallroomCards();
  checkPreviewRequest();

  // Tambahkan listener untuk mendengarkan perubahan localStorage dari halaman Admin
  window.addEventListener("storage", (event) => {
    if (event.key === "ballrooms") {
      renderBallroomCards(); // Re-render kartu jika data berubah
    }
    if (event.key === "previewBallroomId") {
      checkPreviewRequest();
    }
  });
});

// Cek permintaan preview dari halaman admin
function checkPreviewRequest() {
  const previewId = localStorage.getItem("previewBallroomId");
  if (previewId) {
    const data = getBallrooms();
    const ballroom = data.find((b) => b.id === previewId);
    if (ballroom) {
      openModal(ballroom);
    }
    localStorage.removeItem("previewBallroomId"); // Hapus request setelah dibuka
  }
}

(function () {
  /* ============================================
     CONSTANTS & GLOBAL VARIABLES
  ============================================ */
  const AUTO_DELAY = 7000; // jeda antar slide
  const REOPEN_DELAY = 60000; // 1 menit
  const REFRESH_DELAY = 150000; // 5 menit - Auto Refresh
  const AUTO_OPEN_DELAY = 10000; // 10 detik - Auto Open Modal

  let autoTimer = null;
  let reopenTimeout = null;
  let refreshTimer = null;
  let autoOpenTimer = null;
  let cycleRunning = false;

  /* ============================================
     INJECT CSS UNTUK SLIDE MODAL
  ============================================ */
  const css = `
    .modal-slide-wrapper {
        position: fixed;
        inset: 0;
        display: flex;
        overflow: hidden;
        z-index: 9999;
        pointer-events: auto;
    }
    .modal-slide-panel {
        flex: 0 0 100%;
        transform: translateX(0);
        transition: transform 0.6s ease;
        opacity: 1;
    }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  /* ============================================
     GLOBAL ELEMENT & ORIGINAL FUNCTION
  ============================================ */
  const modal = document.getElementById("ballroomModal");

  if (typeof originalOpenModal !== "function") {
    window.originalOpenModal = openModal;
  }

  const originalCloseModal = closeModal;

  /* ============================================
     FUNGSI CLONE MODAL
  ============================================ */
  function cloneModal() {
    const clone = modal.cloneNode(true);
    clone.removeAttribute("id");
    clone.style.display = "block";
    clone.classList.add("show");
    return clone;
  }

  /* ============================================
     ANIMASI SLIDE ANTAR MODAL
  ============================================ */
  function slideTo(ballroomData) {
    const wrapper = document.createElement("div");
    wrapper.className = "modal-slide-wrapper";

    const panelCurrent = document.createElement("div");
    const panelNext = document.createElement("div");
    panelCurrent.className = "modal-slide-panel";
    panelNext.className = "modal-slide-panel";

    const oldModal = cloneModal();
    originalOpenModal(ballroomData);
    const newModal = cloneModal();

    panelCurrent.appendChild(oldModal);
    panelNext.appendChild(newModal);

    panelNext.style.transform = "translateX(100%)";

    wrapper.appendChild(panelCurrent);
    wrapper.appendChild(panelNext);
    document.body.appendChild(wrapper);

    requestAnimationFrame(() => {
      panelCurrent.style.transform = "translateX(-100%)";
      panelNext.style.transform = "translateX(0)";
    });

    setTimeout(() => wrapper.remove(), 650);
  }

  /* ============================================
     AUTO REFRESH
  ============================================ */
  function startAutoRefresh() {
    stopAutoRefresh();
    refreshTimer = setInterval(() => {
      console.log("Auto refresh triggered");
      location.reload();
    }, REFRESH_DELAY);
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  /* ============================================
     AUTO OPEN MODAL
  ============================================ */
  function startAutoOpenModal() {
    stopAutoOpenModal();

    autoOpenTimer = setTimeout(() => {
      const list = getBallrooms();
      if (list.length > 0 && !modal.classList.contains("show")) {
        console.log("Auto opening modal");
        const first = list[0];

        currentModalIndex = 0;
        cycleRunning = true;

        originalOpenModal(first);
        modal.classList.add("show");

        startAuto();
      }
    }, AUTO_OPEN_DELAY);
  }

  function stopAutoOpenModal() {
    if (autoOpenTimer) {
      clearTimeout(autoOpenTimer);
      autoOpenTimer = null;
    }
  }

  /* ============================================
     DETEKSI PUTARAN LENGKAP
  ============================================ */
  function detectCycle() {
    const list = getBallrooms();

    if (currentModalIndex === 0 && cycleRunning) {
      cycleRunning = false;
      stopAuto();

      modal.classList.remove("show");
      originalCloseModal();

      reopenTimeout = setTimeout(() => {
        const first = list[0];
        cycleRunning = true;
        openModal(first);
      }, REOPEN_DELAY);
    }
  }

  /* ============================================
     OVERRIDE openModal
  ============================================ */
  openModal = function (ballroomData) {
    const list = getBallrooms();

    currentModalIndex = list.findIndex((b) => b.id === ballroomData.id);

    if (!modal.classList.contains("show")) {
      originalOpenModal(ballroomData);
      modal.classList.add("show");
      cycleRunning = true;
      startAuto();
      return;
    }

    slideTo(ballroomData);
    detectCycle();
  };

  /* ============================================
     INJECT TOMBOL NEXT & PREV
  ============================================ */
  const navStyle = document.createElement("style");
  navStyle.innerHTML = `
    .modal-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      padding: 10px 15px;
      background: rgba(0,0,0,0.45);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 28px;
      cursor: pointer;
      z-index: 2000;
      transition: background 0.2s;
    }
    .modal-nav-btn:hover { background: rgba(41,9,9,0.8); }
    .modal-nav-prev { left: 10px; }
    .modal-nav-next { right: 10px; }
  `;
  document.head.appendChild(navStyle);

  const modalContent = modal.querySelector(".modal-content");

  const btnPrev = document.createElement("button");
  btnPrev.className = "modal-nav-btn modal-nav-prev";
  btnPrev.innerHTML = "&#10094;";

  const btnNext = document.createElement("button");
  btnNext.className = "modal-nav-btn modal-nav-next";
  btnNext.innerHTML = "&#10095;";

  modalContent.appendChild(btnPrev);
  modalContent.appendChild(btnNext);

  /* ============================================
     HANDLER NEXT / PREV
  ============================================ */
  btnNext.addEventListener("click", () => {
    const list = getBallrooms();
    if (!list.length) return;

    stopAuto();
    currentModalIndex = (currentModalIndex + 1) % list.length;
    openModal(list[currentModalIndex]);
    startAuto();
  });

  btnPrev.addEventListener("click", () => {
    const list = getBallrooms();
    if (!list.length) return;

    stopAuto();
    currentModalIndex = (currentModalIndex - 1 + list.length) % list.length;
    openModal(list[currentModalIndex]);
    startAuto();
  });

  /* ============================================
     AUTO SLIDE
  ============================================ */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      const list = getBallrooms();
      if (!list.length) return;

      currentModalIndex = (currentModalIndex + 1) % list.length;
      openModal(list[currentModalIndex]);
    }, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;

    if (reopenTimeout) clearTimeout(reopenTimeout);
    reopenTimeout = null;
  }

  /* ============================================
     OVERRIDE closeModal
  ============================================ */
  closeModal = function () {
    stopAuto();
    stopAutoRefresh();
    stopAutoOpenModal();
    cycleRunning = false;

    originalCloseModal();
    startAutoOpenModal();
  };

  /* ============================================
     INITIALIZER
  ============================================ */
  function initializeAutoFeatures() {
    startAutoRefresh();

    if (!modal.classList.contains("show")) {
      startAutoOpenModal();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAutoFeatures);
  } else {
    initializeAutoFeatures();
  }
})();

// ===================================
// KONFIGURASI DAN STATUS GLOBAL
// ===================================
const config = {
  // Durasi scroll dari atas ke bawah (dalam milidetik)
  scrollDuration: 10000,
  // Jeda di bagian bawah sebelum kembali ke atas (ms)
  pauseAtBottom: 1000,
  // Jeda di bagian atas sebelum scroll down lagi (ms)
  pauseAtTop: 1000,
  // Waktu tunggu setelah mouse diam sebelum scroll dimulai (ms)
  mouseInactivityTimeout: 2000,
  // Easing function (Gunakan fungsi matematis, bukan string CSS)
  // Contoh: quadratic ease out (semakin lambat di akhir)
  easing: (t) => 1 - Math.pow(1 - t, 2),
};

let animationId = null;
let mouseTimeoutId = null;
let isScrollingActive = true; // Status apakah scroll diizinkan
let isAnimating = false; // Status apakah requestAnimationFrame sedang berjalan

// ===================================
// FUNGSI UTAMA SCROLL
// ===================================

/**
 * Menghentikan animasi scroll saat ini.
 */
function stopScrollAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  isAnimating = false;
}

/**
 * Animasi smooth scroll dari posisi saat ini ke target.
 * @param {number} startPos - Posisi scroll awal.
 * @param {number} targetPos - Posisi scroll tujuan.
 * @param {number} duration - Durasi animasi.
 * @param {function} onComplete - Callback setelah animasi selesai.
 */
function smoothScroll(startPos, targetPos, duration, onComplete) {
  stopScrollAnimation(); // Pastikan animasi sebelumnya dihentikan
  if (!isScrollingActive) return;

  const distance = targetPos - startPos;
  let startTime = null;
  isAnimating = true;

  function animate(time) {
    if (!startTime) startTime = time;

    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Aplikasikan easing function
    const easedProgress = config.easing(progress);

    window.scrollTo(0, startPos + distance * easedProgress);

    if (progress < 1 && isScrollingActive) {
      animationId = requestAnimationFrame(animate);
    } else {
      isAnimating = false;
      // Pastikan posisi target tercapai jika scroll tidak dihentikan
      if (isScrollingActive) window.scrollTo(0, targetPos);

      if (onComplete) onComplete();
    }
  }

  animationId = requestAnimationFrame(animate);
}

/**
 * Logika scroll bolak-balik: Atas -> Bawah -> Atas...
 */
function startAutoScrollLoop() {
  if (isAnimating || !isScrollingActive) return;

  const currentScroll = window.pageYOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (currentScroll < maxScroll) {
    // Scroll ke bawah
    smoothScroll(currentScroll, maxScroll, config.scrollDuration, () => {
      setTimeout(() => {
        // Setelah jeda di bawah, scroll ke atas
        smoothScroll(maxScroll, 0, config.scrollDuration / 5, () => {
          // Scroll ke atas lebih cepat
          setTimeout(startAutoScrollLoop, config.pauseAtTop);
        });
      }, config.pauseAtBottom);
    });
  } else {
    // Sudah di bawah atau di atas, langsung ke atas
    smoothScroll(currentScroll, 0, config.scrollDuration / 5, () => {
      setTimeout(startAutoScrollLoop, config.pauseAtTop);
    });
  }
}

// ===================================
// KONTROL INTERAKSI PENGGUNA (MOUSE)
// ===================================

/**
 * Mengaktifkan status scroll dan memulai loop.
 */
function activateScroll() {
  isScrollingActive = true;
  startAutoScrollLoop();
}

/**
 * Menonaktifkan status scroll dan menghentikan animasi.
 */
function deactivateScroll() {
  isScrollingActive = false;
  stopScrollAnimation();
}

/**
 * Handle pergerakan mouse untuk menghentikan scroll dan menjadwalkan peluncuran kembali.
 */
function handleMouseMove() {
  // 1. Hentikan animasi dan scroll aktif segera
  if (isAnimating) {
    deactivateScroll();
  }

  // 2. Hapus timeout sebelumnya (reset timer)
  if (mouseTimeoutId) {
    clearTimeout(mouseTimeoutId);
  }

  // 3. Jadwalkan peluncuran kembali setelah periode tidak aktif
  mouseTimeoutId = setTimeout(() => {
    // Cek jika scroll memang mati dan tidak ada aktivitas lain (misal, scroll manual)
    if (!isAnimating) {
      activateScroll();
    }
  }, config.mouseInactivityTimeout);
}

// ===================================
// INISIALISASI
// ===================================

// Mulai monitor pergerakan mouse
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("touchstart", deactivateScroll); // Opsional: Berhenti saat sentuhan

// Mulai scroll setelah jeda awal
setTimeout(activateScroll, 2000);

/*function enableAutoFullscreenOnce() {
    document.documentElement.requestFullscreen();
    document.removeEventListener('click', enableAutoFullscreenOnce);
}
document.addEventListener('click', enableAutoFullscreenOnce);*/
