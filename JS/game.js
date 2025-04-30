// game.js (оновлений MVP з toast і лічильником)

// 🔹 Масив із завдань
const tasks = [
    { id: "task1", name: "Ейфелева вежа", description: "Один із найвідоміших символів Європи, побудований у 19 столітті.", answer: { lat: 48.8584, lng: 2.2945 } },
    { id: "task2", name: "Статуя Свободи", description: "Подарунок Франції США, розташована в Нью-Йорку.", answer: { lat: 40.6892, lng: -74.0445 } },
    { id: "task3", name: "Сіднейський оперний театр", description: "Знаменита сучасна будівля культури в Австралії.", answer: { lat: -33.8568, lng: 151.2153 } },
    { id: "task4", name: "Мачу-Пікчу", description: "Інкська цитадель у горах Перу.", answer: { lat: -13.1631, lng: -72.5450 } },
    { id: "task5", name: "Тадж-Махал", description: "Мавзолей, символ любові в Індії.", answer: { lat: 27.1751, lng: 78.0421 } }
];

const task = tasks[Math.floor(Math.random() * tasks.length)];

const taskPanel = document.getElementById("taskPanel");
taskPanel.querySelector("h2").textContent = task.name;
taskPanel.querySelector("p").textContent = task.description;

setTimeout(() => {
    taskPanel.classList.add("slide-out");
}, 10000);

const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap & Carto',
}).addTo(map);

let userMarker = null;
let selectedCoords = null;

map.on("click", function (e) {
    const { lat, lng } = e.latlng;
    selectedCoords = { lat, lng };

    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
    }
});

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
}

document.getElementById("hintBtn").addEventListener("click", () => {
    showToast("🌍 Об'єкт знаходиться в межах континенту, де його збудували 😉");
});

document.getElementById("submitGuessBtn").addEventListener("click", () => {
    if (!selectedCoords) {
        showMessage("Спочатку оберіть точку на мапі!", "error");
        return;
    }

    const distance = getDistanceFromLatLonInKm(
        task.answer.lat,
        task.answer.lng,
        selectedCoords.lat,
        selectedCoords.lng
    );

    const reward = calculateReward(distance);
    const wallet = localStorage.getItem("wallet") || "guest_wallet";

    const resultData = {
        task: task.name,
        userCoords: selectedCoords,
        wallet,
        distance: +distance.toFixed(1),
        reward
    };

    localStorage.setItem("result", JSON.stringify(resultData));

    // 🔄 ОНОВЛЕННЯ ЛІЧИЛЬНИКА ДО ПЕРЕХОДУ
    let count = Number(localStorage.getItem("gamesPlayed")) || 0;
    count++;
    localStorage.setItem("gamesPlayed", count);

    fetch("http://localhost:4000/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData)
    })
        .then(res => res.json())
        .then(() => {
            window.location.href = "result.html";
        })
        .catch(() => {
            showMessage("❌ Помилка збереження результату. Перевір API-сервер.", "error");
            setTimeout(() => window.location.href = "result.html", 4000);
        });
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function calculateReward(distance) {
    const maxReward = 25;
    const radiusMax = 200;
    const accuracy = Math.max(0, 1 - distance / radiusMax);
    return Math.floor(maxReward * accuracy);
}

// ✅ Toast-функція
function showMessage(text, type = 'error', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration + 1000);
}
