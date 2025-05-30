document.getElementById("phantomConnectBtn").addEventListener("click", registerPhantom);

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
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
            // Desktop flow
            const wallet = await window.solana.connect({ onlyIfTrusted: false });
            const signature = await window.solana.signMessage(encodedMessage, "utf8");
            const walletAddress = wallet.publicKey.toString();

            saveProfile(walletAddress, signature.signature);
            showToast("✅ Успішне підключення! Перенаправляємо...");
            setTimeout(() => window.location.href = "profile.html", 1500);
        } else if (isMobile()) {
            // Mobile flow (deep link)
            const siteUrl = encodeURIComponent(window.location.href);
            const phantomLink = `https://phantom.app/ul/browse/${siteUrl}`;
            showToast("📱 Відкриваємо Phantom App...");
            window.location.href = phantomLink;
        } else {
            showToast("❌ Phantom не знайдено. Встановіть розширення або Phantom App.");
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
