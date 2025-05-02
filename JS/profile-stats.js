// profile-stats.js — Стабільний лічильник ігор + стильне оновлення UI
window.addEventListener('load', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn('Exit fullscreen error:', err));
    }
});

(function () {
    const key = 'gamesPlayed';
    let count = Number(localStorage.getItem(key)) || 0;

    // Автоматичне оновлення: симуляція гри
    window.incrementGameCount = function () {
        count++;
        localStorage.setItem(key, count);
        updateGameUI(count);
    };

    function updateGameUI(count) {
        const display = document.getElementById('gamesPlayed');
        if (display) {
            display.textContent = count;
            display.classList.add('highlighted-count');
            setTimeout(() => display.classList.remove('highlighted-count'), 1000);
        }
    }

    // Показати поточний рахунок при завантаженні
    updateGameUI(count);
})();

const stored = JSON.parse(localStorage.getItem("profile") || "{}");
document.getElementById("name").value = stored.name || "";
document.getElementById("surname").value = stored.surname || "";
document.getElementById("nickname").value = stored.nickname || "";
document.getElementById("wallet").value = stored.wallet || "";

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png';
document.getElementById("avatarImg").src = stored.avatar || defaultAvatar;

document.getElementById("avatar").addEventListener("change", function () {
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById("avatarImg").src = e.target.result;
        stored.avatar = e.target.result;
        localStorage.setItem("profile", JSON.stringify(stored));
        showToast("Фото профілю оновлено!", "success");
    };
    reader.readAsDataURL(this.files[0]);
});

function saveProfile() {
    const nickname = document.getElementById("nickname").value.trim();
    if (!/^[a-zA-Z0-9_]{5,}$/.test(nickname)) {
        showToast("Нікнейм має бути англійською, мінімум 5 символів!", "error");
        return;
    }
    stored.name = document.getElementById("name").value;
    stored.surname = document.getElementById("surname").value;
    stored.nickname = nickname;
    localStorage.setItem("profile", JSON.stringify(stored));
    showToast("Профіль збережено!", "success");
}

function toggleRating(type) {
    document.getElementById('localBtn').classList.remove('active');
    document.getElementById('globalBtn').classList.remove('active');
    document.getElementById(type + 'Btn').classList.add('active');
    const ratingEl = document.getElementById('ratingContent');

    if (type === 'local') {
        ratingEl.innerHTML = '<p>Ваше місце: <strong>#12</strong></p><p>Рейтинг: <strong>1580</strong></p>';
    } else {
        ratingEl.innerHTML = '<p>Ваше місце: <strong>#543</strong></p><p>Рейтинг: <strong>9120</strong></p>';
    }
}

function showToast(message = 'Готово!', type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}