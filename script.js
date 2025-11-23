// 1. Inisialisasi AOS (Hanya untuk Cover & elemen statis lain)
AOS.init({ duration: 1000, once: true });

// 2. Variabel Global UI
const cover = document.getElementById("cover");
const mainContent = document.getElementById("main-content");
const navbar = document.getElementById("navbar");
const musicControl = document.getElementById("music-control");
const audio = document.getElementById("bg-music");
const musicIcon = document.getElementById("music-icon");
let isPlaying = false;

// 3. Logika URL Parameter (Nama Tamu)
function getGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get("to");
  const displayGuest = document.getElementById("guest-name-cover");
  const inputNama = document.getElementById("nama");
  if (guestName) {
    displayGuest.innerText = guestName;
    inputNama.value = guestName;
  }
}
getGuestName();

// 4. Fungsi Buka Undangan
function bukaUndangan() {
  const btn = document.querySelector(".btn-open");
  const cover = document.getElementById("cover");
  const canvasExplosion = document.getElementById("explosion-canvas");

  // Confetti Setup
  const myConfetti = confetti.create(canvasExplosion, { resize: true });
  const rect = btn.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  const blastColors = ["#d4af37", "#f3e5ab", "#ffffff"];

  myConfetti({
    particleCount: 200,
    spread: 100,
    origin: { x: x, y: y },
    colors: blastColors,
    shapes: ["circle"],
    scalar: 0.8,
    gravity: 0.8,
    ticks: 400,
    disableForReducedMotion: true,
    zIndex: 20001,
  });

  // Play Music
  musicControl.style.opacity = "1";
  playMusic();

  // Transisi Buka
  setTimeout(() => {
    cover.classList.add("hidden");
    document.body.style.overflow = "auto";
    mainContent.style.display = "block";
    navbar.style.display = "flex";

    setTimeout(() => {
      AOS.refresh();
      // PENTING: Jalankan animasi GSAP setelah website terbuka
      initPremiumAnimations();
    }, 500);

    loadUcapan();
    initParticles();
    setTimeout(() => {
      stopRain();
    }, 15000);
    setTimeout(() => {
      myConfetti.reset();
    }, 4000);
  }, 800);
}

// 5. Musik Logic
function playMusic() {
  audio.play().catch((e) => console.log("Autoplay blocked"));
  isPlaying = true;
  musicControl.classList.add("spin");
}
function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    musicControl.classList.remove("spin");
    musicIcon.classList.replace("bi-music-note-beamed", "bi-pause-fill");
  } else {
    audio.play();
    musicControl.classList.add("spin");
    musicIcon.classList.replace("bi-pause-fill", "bi-music-note-beamed");
  }
  isPlaying = !isPlaying;
}

// 6. Countdown
const weddingDate = new Date("Dec 15, 2025 08:00:00").getTime();
const countdownInterval = setInterval(function () {
  const now = new Date().getTime();
  const distance = weddingDate - now;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = hours;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("seconds").innerText = seconds;
  if (distance < 0) {
    clearInterval(countdownInterval);
    document.querySelector(".countdown-box").innerHTML =
      "<p style='color:#d4af37;'>Alhamdulillah, We Are Married</p>";
  }
}, 1000);

// 7. Copy Text
function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => {
      showToast("Berhasil Disalin!");
    },
    () => {
      alert("Gagal salin: " + text);
    }
  );
}
function showToast(msg) {
  const toast = document.getElementById("copy-toast");
  toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${msg}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// 8. Particle System (Hujan Emas)
const canvas = document.getElementById("gold-particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particlesArray;
let isRainingActive = true;
const dustPalette = [
  "rgba(212, 175, 55, 0.5)",
  "rgba(243, 229, 171, 0.4)",
  "rgba(255, 255, 255, 0.2)",
];

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
function stopRain() {
  isRainingActive = false;
}
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.color = dustPalette[Math.floor(Math.random() * dustPalette.length)];
    this.speedY = Math.random() * 1.5 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y > canvas.height && isRainingActive) {
      this.y = 0 - this.size;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function initParticles() {
  isRainingActive = true;
  particlesArray = [];

  let particleCount = window.innerWidth < 768 ? 40 : 80;

  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle());
  }
  animateParticles();
}
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }
  requestAnimationFrame(animateParticles);
}

// 10. FIREBASE LOGIC (FIXED)
function kirimUcapan(e) {
  e.preventDefault();
  const nama = document.getElementById("nama").value;
  const kehadiran = document.getElementById("kehadiran").value;
  const pesan = document.getElementById("pesan").value;
  const btn = document.querySelector(".btn-kirim");
  const originalText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Mengirim...';

  db.collection("ucapan")
    .add({
      nama: nama,
      kehadiran: kehadiran,
      pesan: pesan,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      showToast("Terima Kasih, Ucapan Terkirim!");
      document.getElementById("rsvpForm").reset();
      getGuestName();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Gagal mengirim ucapan.");
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
    });
}

// ==========================================
// FUNGSI UCAPAN (UPDATE: AUTO-DETECT FIELD)
// ==========================================
function loadUcapan() {
  const list = document.getElementById("comments-list");
  if (!list) return;

  db.collection("ucapan")
    .orderBy("timestamp", "desc")
    .limit(20)
    .onSnapshot((snapshot) => {
      let html = "";
      if (snapshot.empty) {
        html =
          '<div class="loading-text">Belum ada ucapan. Jadilah yang pertama!</div>';
      } else {
        snapshot.forEach((doc) => {
          const data = doc.data();

          // 1. AMBIL NAMA
          const nama = data.nama ? escapeHtml(data.nama) : "Tanpa Nama";

          // 2. AMBIL KEHADIRAN & STYLE
          // Support data lama (present/notpresent) dan data baru (Hadir/Tidak Hadir)
          let kehadiran = data.kehadiran ? escapeHtml(data.kehadiran) : "Hadir";
          let statusClass = "Hadir";

          // Cek jika mengandung kata "Tidak" atau "not" (untuk data lama)
          if (
            kehadiran.toLowerCase().includes("tidak") ||
            kehadiran.toLowerCase().includes("not")
          ) {
            statusClass = "Tidak";
          }

          // 3. AMBIL PESAN (AUTO-DETECT)
          // Kode ini akan mencari isi pesan di kolom 'pesan', 'message', 'ucapan', atau 'comment'
          let rawPesan =
            data.pesan || data.message || data.ucapan || data.comment || "";
          let pesan = rawPesan
            ? escapeHtml(rawPesan)
            : "<em style='color:#777'>(Tidak ada pesan)</em>";

          // 4. SUSUN HTML
          html += `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="c-name">${nama}</span>
                            <span class="c-status ${statusClass}">${kehadiran}</span>
                        </div>
                        <div class="c-message">${pesan}</div>
                    </div>`;
        });
      }
      list.innerHTML = html;
    });
}

// PERBAIKAN FUNGSI ESCAPE HTML (Anti Error)
function escapeHtml(text) {
  if (!text) return "";
  // Pastikan input dikonversi jadi string dulu
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================
   GSAP ANIMATIONS (FULL UPDATED & STABIL)
   ============================================ */
function initPremiumAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // A. VERSE (Slide Samping + Replay)
  const verseAnim = gsap.timeline({
    scrollTrigger: {
      trigger: ".section-verse",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse",
    },
  });
  verseAnim.fromTo(
    ".glass-box-verse",
    { x: -200, opacity: 0, rotationY: 45, skewX: 20 },
    {
      x: 0,
      opacity: 1,
      rotationY: 0,
      skewX: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.75)",
    }
  );
  verseAnim.fromTo(
    ".verse-decoration",
    { scale: 0, rotation: -180 },
    { scale: 1, rotation: 0, duration: 1, ease: "back.out(2)" },
    "-=1.2"
  );
  verseAnim.fromTo(
    ".verse-text",
    { x: 100, opacity: 0, filter: "blur(5px)" },
    {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1,
      ease: "power2.out",
    },
    "-=1.0"
  );
  verseAnim.fromTo(
    ".verse-source",
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
    "-=0.8"
  );
  gsap.to(".verse-decoration", {
    rotation: 360,
    duration: 20,
    repeat: -1,
    ease: "none",
  });

  // B. MEMPELAI (Independent Flip + Replay)
  gsap.fromTo(
    ".card-bride-anim",
    { rotationY: -90, opacity: 0 },
    {
      rotationY: 0,
      opacity: 1,
      duration: 1.2,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: ".card-bride-anim",
        start: "top 85%",
        toggleActions: "play reverse play reverse",
      },
    }
  );
  gsap.fromTo(
    ".card-groom-anim",
    { rotationY: 90, opacity: 0 },
    {
      rotationY: 0,
      opacity: 1,
      duration: 1.2,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: ".card-groom-anim",
        start: "top 85%",
        toggleActions: "play reverse play reverse",
      },
    }
  );

  // C. EVENTS (Flip + Replay)
  const eventsAnim = gsap.timeline({
    scrollTrigger: {
      trigger: ".section-events",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse",
    },
  });
  eventsAnim.fromTo(
    ".event-card",
    { rotationY: -90, opacity: 0 },
    {
      rotationY: 0,
      opacity: 1,
      duration: 1,
      ease: "back.out(1.2)",
      stagger: 0.3,
    }
  );

  // ============================================================
  // D. LOCATION (3D BLUR REVEAL - GAYA SEPERTI RSVP)
  // Map muncul dari miring (3D), buram, lalu menjadi tajam.
  // ============================================================
  gsap.fromTo(
    ".glass-map-card",
    {
      opacity: 0,
      rotationX: 45, // Miring ke belakang (seperti layar canggih)
      y: 50, // Agak di bawah
      filter: "blur(5px)", // Efek Buram (Khas RSVP)
      transformOrigin: "center center",
    },
    {
      opacity: 1,
      rotationX: 0, // Tegak lurus
      y: 0,
      filter: "blur(0px)", // Tajam
      duration: 1.2,
      ease: "back.out(1.0)", // Membal sedikit biar elegan
      scrollTrigger: {
        trigger: ".glass-map-card", // Trigger langsung di kartunya
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse", // Replay aktif
      },
    }
  );

  // E. GIFT (Flip + Replay)
  const giftAnim = gsap.timeline({
    scrollTrigger: {
      trigger: ".section-gift",
      start: "top 80%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse",
    },
  });
  giftAnim.fromTo(
    ".atm-card",
    { rotationX: 90, opacity: 0, y: 50 },
    {
      rotationX: 0,
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "back.out(1.2)",
      stagger: 0.2,
    }
  );

  // ============================================================
  // 6. RSVP (INDEPENDENT 3D OPEN + REPLAY)
  // Dipecah jadi dua agar di HP animasinya pas saat discroll
  // ============================================================

  // A. FORMULIR (Kiri / Atas) -> Membuka Pintu Kiri
  gsap.fromTo(
    ".glass-form-card",
    {
      opacity: 0,
      rotationY: 30, // Miring sedikit (efek pintu)
      x: -30, // Geser kiri sedikit
      transformOrigin: "right center", // Poros putar di kanan
      filter: "blur(5px)",
    },
    {
      opacity: 1,
      rotationY: 0,
      x: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "back.out(1.2)", // Efek membal sedikit biar keren
      scrollTrigger: {
        trigger: ".glass-form-card", // Pemicu: Elemen Form itu sendiri
        start: "top 80%", // Mulai saat form masuk layar
        end: "bottom 20%",
        toggleActions: "play reverse play reverse", // Fitur REPLAY Aktif
      },
    }
  );

  // B. UCAPAN (Kanan / Bawah) -> Membuka Pintu Kanan
  gsap.fromTo(
    ".glass-comments-card",
    {
      opacity: 0,
      rotationY: -30, // Miring berlawanan
      x: 30, // Geser kanan sedikit
      transformOrigin: "left center", // Poros putar di kiri
      filter: "blur(5px)",
    },
    {
      opacity: 1,
      rotationY: 0,
      x: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "back.out(1.2)",
      scrollTrigger: {
        trigger: ".glass-comments-card", // Pemicu: Elemen Ucapan itu sendiri
        start: "top 80%", // Mulai saat ucapan masuk layar
        end: "bottom 20%",
        toggleActions: "play reverse play reverse", // Fitur REPLAY Aktif
      },
    }
  );

  // G. FOOTER (Zoom In + Replay)
  gsap.fromTo(
    ".glass-footer-content",
    { scale: 0.8, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "back.out(1.2)",
      scrollTrigger: {
        trigger: ".footer-section",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // H. Navbar Active State
  gsap.utils.toArray("section").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom 30%",
      onEnter: () => updateNav(section.id),
      onEnterBack: () => updateNav(section.id),
    });
  });
}

function updateNav(id) {
  const navItem = document.querySelector(`.nav-item[href="#${id}"]`);
  if (navItem) {
    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));
    navItem.classList.add("active");
  }
}
