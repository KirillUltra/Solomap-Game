// phantom.js

document.addEventListener("DOMContentLoaded", () => {
    // если мы внутри Phantom Mobile App (in-app browser) — сразу автоконнект
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

// надёжно определяем in-app browser Phantom
function inPhantomApp() {
    return /(PhantomMobile|Phantom)/i.test(navigator.userAgent);
}

// формируем browse‑deeplink:
// https://phantom.app/ul/browse/<url>?ref=<ref>
function getBrowseLink() {
    const url = encodeURIComponent(window.location.origin + '/phantom.html');
    const ref = encodeURIComponent(window.location.origin + '/phantom.html');
    return `https://phantom.app/ul/browse/${url}?ref=${ref}`;
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
            const address = wallet.publicKey.toString();

            saveProfile(address, signature.signature);
            showToast("✅ Успішне підключення! Перенаправляємо…");
            setTimeout(() => window.location.href = "profile.html", 1500);

        } else if (isMobile()) {
            // ─── MOBILE FLOW ──────────────────────────────────
            // Открываем встроенный браузер Phantom
            const link = getBrowseLink();
            showToast("📱 Відкриваємо Phantom App…");
            window.location.href = link;

        } else {
            // Phantom не найден ни там, ни там
            throw new Error("Phantom не знайдено. Встановіть розширення або Phantom App.");
        }
    } catch (e) {
        loader.style.display = "none";
        btn.style.display = "block";
        showToast("❌ " + e.message);
    }
}

function saveProfile(walletAddress, signatureBytes) {
    const nickname = "User_" + walletAddress.slice(0, 4);
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";
    const profile = {
        wallet: walletAddress,
        nickname,
        name: "",
        surname: "",
        avatar: defaultAvatar,
        verified: true,
        signature: btoa(String.fromCharCode(...signatureBytes))
    };
    localStorage.setItem("wallet", walletAddress);
    localStorage.setItem("profile", JSON.stringify(profile));
}
