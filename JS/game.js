const taskPanel = document.getElementById("taskPanel");

const tasks = [
    { name: "Эйфелева башня", description: "Один из самых известных символов Европы.", answer: { lat: 48.8584, lng: 2.2945 } },
    { name: "Статуя Свободы", description: "Подарок Франции США, Нью-Йорк.", answer: { lat: 40.6892, lng: -74.0445 } },
    { name: "Сиднейский оперный театр", description: "Знаменитое здание в Австралии.", answer: { lat: -33.8568, lng: 151.2153 } },
    { name: "Мачу-Пикчу", description: "Инкская цитадель в Перу.", answer: { lat: -13.1631, lng: -72.5450 } },
    { name: "Тадж-Махал", description: "Мавзолей в Индии.", answer: { lat: 27.1751, lng: 78.0421 } }
];

let taskIndex = Math.floor(Math.random() * tasks.length);
let task = tasks[taskIndex];

taskPanel.querySelector("h2").textContent = task.name;
taskPanel.querySelector("p").textContent = task.description;

window.addEventListener('load', () => {
    setTimeout(() => taskPanel.classList.add("minimized"), 2000);
});

// определяем системную тему
let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let darkTheme = prefersDark;

const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap & Carto' });
const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' });

const map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    layers: [darkTheme ? darkLayer : lightLayer],
    zoomControl: true,
    scrollWheelZoom: true,
    inertia: true,
    inertiaDeceleration: 3000,
    worldCopyJump: true,
    maxBounds: [
        [-90, -Infinity],
        [90, Infinity]
    ],
    maxBoundsViscosity: 0.5
});

let userMarker = null;
let selectedCoords = null;

const customIcon = L.divIcon({
    html: '📍',
    className: '',
    iconSize: [30, 30]
});

map.on("click", e => {
    const { lat, lng } = e.latlng;
    selectedCoords = { lat, lng };
    if (userMarker) userMarker.setLatLng([lat, lng]);
    else userMarker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);
    map.setView([lat, lng], map.getZoom(), { animate: true, duration: 1 });
});

document.getElementById("hintBtn").addEventListener("click", () => showToast("🌍 Об'єкт знаходиться на своєму континенті 😉"));

document.getElementById("toggleThemeBtn").addEventListener("click", () => {
    map.removeLayer(darkTheme ? darkLayer : lightLayer);
    darkTheme = !darkTheme;
    map.addLayer(darkTheme ? darkLayer : lightLayer);
    showToast(darkTheme ? "🌑 Темна тема" : "🌞 Світла тема");
});

const fullscreenBtn = document.getElementById("fullscreenBtn");
fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            fullscreenBtn.textContent = "🗗 Згорнути екран";
            showToast("🔲 Повноекранний режим увімкнено");
        });
    } else {
        document.exitFullscreen().then(() => {
            fullscreenBtn.textContent = "🔲 На весь екран";
            showToast("🗗 Вийшли з повноекранного");
        });
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        showToast("❗ Якщо вийдете - результат не збережеться!");
        sessionStorage.setItem("forceNewTask", "yes");
    }
    if (document.visibilityState === "visible" && sessionStorage.getItem("forceNewTask") === "yes") {
        switchTask("📢 Ви повернулися - завдання оновлено 😉");
        sessionStorage.removeItem("forceNewTask");
    }
});

const submitBtn = document.getElementById("submitGuessBtn");
const btnText = submitBtn.querySelector('.btn-text');
const spinner = submitBtn.querySelector('.spinner');

submitBtn.addEventListener("click", () => {
    if (!selectedCoords) return showToast("⚠️ Спочатку виберіть точку на карті!");

    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';

    const distance = getDistance(task.answer, selectedCoords);
    const reward = Math.floor(25 * Math.max(0, 1 - distance / 200));
    const resultData = { task: task.name, userCoords: selectedCoords, distance: +distance.toFixed(1), reward };

    localStorage.setItem("result", JSON.stringify(resultData));
    fetch("http://localhost:4000/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData)
    }).catch(() => console.warn("API error"));

    window.location.href = "result.html";
});

function getDistance(a, b) {
    const R = 6371, dLat = deg2rad(b.lat - a.lat), dLon = deg2rad(b.lng - a.lng);
    const c = 2 * Math.atan2(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * Math.sin(dLon / 2) ** 2), Math.sqrt(1 - Math.sin(dLat / 2) ** 2 - Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * Math.sin(dLon / 2) ** 2));
    return R * c;
}

function deg2rad(deg) { return deg * (Math.PI / 180); }

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
}

function switchTask(msg) {
    taskIndex = Math.floor(Math.random() * tasks.length);
    task = tasks[taskIndex];
    taskPanel.querySelector("h2").textContent = task.name;
    taskPanel.querySelector("p").textContent = task.description;
    showToast(msg);
}
