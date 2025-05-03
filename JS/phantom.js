// phantom.js

document.addEventListener("DOMContentLoaded", () => {
    if (inPhantomApp() && window.solana) {
        registerPhantom();
    }
});

document.getElementById("phantomConnectBtn").addEventListener("click", registerPhantom);

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => (toast.style.display = 'none'), 3000);
}

function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function inPhantomApp() {
    return /(PhantomMobile|Phantom)/i.test(navigator.userAgent);
}

// Сборка deeplink-а теперь на корень сайта
function getBrowseLink() {
    const origin = encodeURIComponent(window.location.origin);
    // После открытия Phantom загрузит именно ваш основной индекс/SPA
    return `https://phantom.app/ul/browse/${origin}`;
}

async function registerPhantom() {
    const btn = document.getElementById("phantomConnectBtn");
    const loader = document.getElementById("loader");
    btn.style.display = "none";
    loader.style.display = "block";

    const message = "Підтверджую, що я власник гаманця для гри в Solomap.";
    const encodedMessage = new TextEncoder().encode(message);

    try {
        if (!isMobile() && window.solana && window.solana.isPhantom) {
            // ─── DESKTOP FLOW ─────────────────────────────────
            const wallet = await window.solana.connect({ onlyIfTrusted: false });
            const signature = await window.solana.signMessage(encodedMessage, "utf8");
            saveProfile(wallet.publicKey.toString(), signature.signature);
            showToast("✅ Успішне підключення! Перенаправляємо…");
            setTimeout(() => window.location.href = "profile.html", 1500);

        } else if (isMobile()) {
            // ─── MOBILE FLOW ──────────────────────────────────
            const link = getBrowseLink();
            showToast("📱 Відкриваємо Phantom App…");
            window.location.href = link;

        } else {
            throw new Error("Phantom не знайдено. Встановіть розширення або Phantom App.");
        }
    } catch (e) {
        loader.style.display = "none";
        btn.style.display = "block";
        showToast("❌ " + e.message);
    }
}

function saveProfile(address, signatureBytes) {
    const nickname = "User_" + address.slice(0, 4);
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";
    const profile = {
        wallet: address, nickname, name: "", surname: "", avatar: defaultAvatar,
        verified: true,
        signature: btoa(String.fromCharCode(...signatureBytes))
    };
    localStorage.setItem("wallet", address);
    localStorage.setItem("profile", JSON.stringify(profile));
}
