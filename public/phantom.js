// phantom.js

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('phantomConnectBtn');
    if (btn) btn.addEventListener('click', registerPhantom);
});

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getConnectLink() {
    const origin = window.location.origin;
    const appUrl = encodeURIComponent(origin + '/phantom.html');
    const redirectUrl = encodeURIComponent(origin + '/phantom-callback.html');
    return `https://phantom.app/ul/v1/connect?app_url=${appUrl}&redirect_link=${redirectUrl}`;
}

async function registerPhantom() {
    const btn = document.getElementById('phantomConnectBtn');
    const loader = document.getElementById('loader');
    if (btn) btn.style.display = 'none';
    if (loader) loader.style.display = 'block';

    try {
        // ── Desktop
        if (!isMobile() && window.solana && window.solana.isPhantom) {
            const message = 'Підтверджую, що я власник гаманця для гри в Solomap.';
            const encodedMessage = new TextEncoder().encode(message);

            const wallet = await window.solana.connect({ onlyIfTrusted: false });
            const sigResult = await window.solana.signMessage(encodedMessage, 'utf8');

            saveProfile(wallet.publicKey.toString(), sigResult.signature);
            showToast('✅ Підключено! Переходимо…');
            setTimeout(() => window.location.href = '/Реєстрація%20та%20Профіль/profile.html', 1500);

            // ── Mobile
        } else if (isMobile()) {
            const link = getConnectLink();
            showToast('📱 Відкриваємо Phantom App...');
            window.location.href = link;

        } else {
            throw new Error('Phantom не знайдено. Встановіть розширення або Phantom App.');
        }

    } catch (e) {
        if (loader) loader.style.display = 'none';
        if (btn) btn.style.display = 'block';
        showToast('❌ ' + e.message);
    }
}

function saveProfile(address, signatureBytes) {
    const profile = {
        wallet: address,
        nickname: 'User_' + address.slice(0, 4),
        name: '',
        surname: '',
        avatar: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
        verified: true,
        signature: signatureBytes
            ? btoa(String.fromCharCode(...signatureBytes))
            : ''
    };
    localStorage.setItem('wallet', address);
    localStorage.setItem('profile', JSON.stringify(profile));
}
