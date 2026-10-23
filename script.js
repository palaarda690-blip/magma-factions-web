// IP Kopyalama Fonksiyonu
function copyIP() {
    const ip = "gold.magmanode.com:27367";
    navigator.clipboard.writeText(ip);
    const feedback = document.getElementById("copyFeedback");
    if (feedback) {
        feedback.style.opacity = "1";
        setTimeout(() => { feedback.style.opacity = "0"; }, 2000);
    }
}

// Mobil Menü Aç/Kapat
function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) menu.classList.toggle("hidden");
}

// Giriş Modalı
function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.remove("hidden");
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.add("hidden");
}

function handleLogin() {
    const usernameInput = document.getElementById("mcUsernameInput");
    if (!usernameInput) return;
    
    const username = usernameInput.value.trim();
    if (!username) {
        alert("Lütfen geçerli bir Minecraft kullanıcı adı girin!");
        return;
    }

    localStorage.setItem("magma_user", username);
    updateAuthUI(username);
    closeLoginModal();
}

function updateAuthUI(username) {
    const container = document.getElementById("authContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <img src="https://minotar.net/avatar/${username}/32" class="w-7 h-7 rounded-lg" alt="Skin">
            <span class="text-sm font-bold text-zinc-200">${username}</span>
            <button onclick="logout()" class="text-xs text-rose-500 hover:underline ml-2">Çıkış</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem("magma_user");
    location.reload();
}

// VIP Fiyatlarını Yükle
function loadPrices() {
    const prices = JSON.parse(localStorage.getItem("magma_vip_prices")) || { vip: 30, vipplus: 50, mvip: 80, mvipplus: 120 };
    
    if (document.getElementById("price-vip")) document.getElementById("price-vip").innerText = prices.vip;
    if (document.getElementById("price-vipplus")) document.getElementById("price-vipplus").innerText = prices.vipplus;
    if (document.getElementById("price-mvip")) document.getElementById("price-mvip").innerText = prices.mvip;
    if (document.getElementById("price-mvipplus")) document.getElementById("price-mvipplus").innerText = prices.mvipplus;
}

// Bakım Modu ve Geri Sayım Yönetimi
let maintenanceTimerInterval = null;

function checkMaintenance() {
    const isMaint = localStorage.getItem("magma_maintenance") === "true";
    const maintMsg = localStorage.getItem("magma_maintenance_msg") || "Sunucumuzda bakım yapılmaktadır.";
    const endTime = localStorage.getItem("magma_maintenance_endtime");
    
    const overlay = document.getElementById("maintenanceOverlay");
    const text = document.getElementById("maintenanceText");
    const timerElem = document.getElementById("maintenanceCountdown");

    if (overlay && text) {
        if (isMaint) {
            overlay.classList.remove("hidden");
            text.innerText = maintMsg;

            if (endTime && timerElem) {
                if (maintenanceTimerInterval) clearInterval(maintenanceTimerInterval);
                
                function updateCountdown() {
                    const now = Date.now();
                    const diff = parseInt(endTime) - now;

                    if (diff <= 0) {
                        timerElem.innerText = "Süre doldu, yakında açılıyor!";
                        clearInterval(maintenanceTimerInterval);
                    } else {
                        const minutes = Math.floor(diff / (1000 * 60));
                        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                        timerElem.innerText = `Tahmini Kalan Süre: ${minutes} dk ${seconds < 10 ? '0' : ''}${seconds} sn`;
                    }
                }

                updateCountdown();
                maintenanceTimerInterval = setInterval(updateCountdown, 1000);
            }
        } else {
            overlay.classList.add("hidden");
            if (maintenanceTimerInterval) clearInterval(maintenanceTimerInterval);
        }
    }
}

// Canlı Sunucu Durumu
let countdown = 10;

function updateServerStatus() {
    const ip = "gold.magmanode.com";
    const port = "27367";
    const cacheBuster = Date.now();

    fetch(`https://api.mcsrvstat.us/3/${ip}:${port}?_=${cacheBuster}`)
        .then(res => res.json())
        .then(data => {
            const dot = document.getElementById("serverStatusDot");
            const statusText = document.getElementById("serverStatusText");
            const players = document.getElementById("onlinePlayers");

            if (!dot || !statusText || !players) return;

            if (data && data.online === true) {
                dot.className = "w-3 h-3 rounded-full bg-emerald-500 animate-pulse";
                statusText.innerText = "Sunucu Çevrimiçi";
                players.innerText = `${data.players ? data.players.online : 0} / ${data.players ? data.players.max : 0}`;
            } else {
                dot.className = "w-3 h-3 rounded-full bg-rose-500";
                statusText.innerText = "Sunucu Çevrimdışı";
                players.innerText = "0 / 0";
            }
        })
        .catch(() => {
            fetchFallbackStatus(ip, port);
        });
}

function fetchFallbackStatus(ip, port) {
    const cacheBuster = Date.now();
    fetch(`https://mcapi.us/server/status?ip=${ip}&port=${port}&_=${cacheBuster}`)
        .then(res => res.json())
        .then(data => {
            const dot = document.getElementById("serverStatusDot");
            const statusText = document.getElementById("serverStatusText");
            const players = document.getElementById("onlinePlayers");

            if (!dot || !statusText || !players) return;

            if (data && data.online) {
                dot.className = "w-3 h-3 rounded-full bg-emerald-500 animate-pulse";
                statusText.innerText = "Sunucu Çevrimiçi";
                players.innerText = `${data.players.now} / ${data.players.max}`;
            } else {
                dot.className = "w-3 h-3 rounded-full bg-rose-500";
                statusText.innerText = "Sunucu Çevrimdışı";
                players.innerText = "0 / 0";
            }
        })
        .catch(() => {
            const dot = document.getElementById("serverStatusDot");
            const statusText = document.getElementById("serverStatusText");
            if (dot && statusText) {
                dot.className = "w-3 h-3 rounded-full bg-rose-500";
                statusText.innerText = "Sunucu Çevrimdışı";
            }
        });
}

setInterval(() => {
    countdown--;
    const timerElem = document.getElementById("refreshTimer");
    if (timerElem) timerElem.innerText = countdown + "s";
    
    if (countdown <= 0) {
        updateServerStatus();
        countdown = 10;
    }
}, 1000);

function filterRules() {
    const queryInput = document.getElementById("ruleSearch");
    if (!queryInput) return;
    
    const query = queryInput.value.toLowerCase();
    const items = document.querySelectorAll(".rule-item");
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
    });
}

function buyPackage(pkgName) {
    const user = localStorage.getItem("magma_user");
    if (!user) {
        alert("Satın alma yapabilmek için lütfen önce Minecraft kullanıcı adınızla giriş yapın!");
        openLoginModal();
        return;
    }

    const whatsappNumber = "905383228459"; 
    const message = `Merhaba! Ben ${user}. Sunucunuzdan ${pkgName} paketini satın almak istiyorum. Ödeme için yardımcı olur musunuz?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

function savePricesFromAdmin() {
    const prices = {
        vip: Number(document.getElementById("input-vip").value),
        vipplus: Number(document.getElementById("input-vipplus").value),
        mvip: Number(document.getElementById("input-mvip").value),
        mvipplus: Number(document.getElementById("input-mvipplus").value)
    };
    localStorage.setItem("magma_vip_prices", JSON.stringify(prices));
    alert("VIP fiyatları başarıyla güncellendi!");
}

// Admin Paneli: Bakım Modu ve Dakika Kaydetme
function saveMaintenanceFromAdmin() {
    const isMaint = document.getElementById("maintToggle").checked;
    const msg = document.getElementById("maintMsg").value;
    const duration = Number(document.getElementById("maintDuration").value) || 0;
    
    localStorage.setItem("magma_maintenance", isMaint);
    localStorage.setItem("magma_maintenance_msg", msg);

    if (isMaint && duration > 0) {
        const endTime = Date.now() + (duration * 60 * 1000);
        localStorage.setItem("magma_maintenance_endtime", endTime);
    } else if (!isMaint) {
        localStorage.removeItem("magma_maintenance_endtime");
    }

    alert("Bakım modu ve geri sayım ayarları başarıyla güncellendi!");
}

document.addEventListener("DOMContentLoaded", function() {
    loadPrices();
    checkMaintenance();
    updateServerStatus();
    
    const savedUser = localStorage.getItem("magma_user");
    if (savedUser) updateAuthUI(savedUser);

    if (document.getElementById("input-vip")) {
        const prices = JSON.parse(localStorage.getItem("magma_vip_prices")) || { vip: 30, vipplus: 50, mvip: 80, mvipplus: 120 };
        document.getElementById("input-vip").value = prices.vip;
        document.getElementById("input-vipplus").value = prices.vipplus;
        document.getElementById("input-mvip").value = prices.mvip;
        document.getElementById("input-mvipplus").value = prices.mvipplus;

        document.getElementById("maintToggle").checked = localStorage.getItem("magma_maintenance") === "true";
        document.getElementById("maintMsg").value = localStorage.getItem("magma_maintenance_msg") || "Sunucumuzda bakım yapılmaktadır.";
    }
});
