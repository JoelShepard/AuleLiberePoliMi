/* ── AuleLiberePoliMi — Mini App Settings ──────────────────────────
 *  This script runs inside Telegram's Mini App WebView.
 *  Uses window.Telegram.WebApp to communicate with the Telegram client.
 *
 *  PERSISTENCE STRATEGY:
 *  - Uses Telegram CloudStorage (Bot API 6.9+) when available → persists
 *    across Mini App sessions within Telegram.
 *  - Falls back to browser localStorage when outside Telegram.
 *
 *  WARNING: Telegram.WebApp.sendData() ONLY works when Mini App is
 *  launched from a KeyboardButton (reply keyboard), NOT from an
 *  InlineKeyboardButton. The bot's ⚙️ button is a KeyboardButton.
 */

// ── Campus data (embedded for static hosting) ──────────────────
const CAMPUSES = [
    "Milano Città Studi",
    "Milano Bovisa",
    "Como",
    "Como - Via Anzani",
    "Como - Via Zezio",
    "Cremona",
    "Cremona - Via Bissolati 34",
    "Genova",
    "Genova - Punta Nave",
    "Genova - Via delle Fabbriche",
    "Piacenza",
    "Lecco",
    "Lecco - Residenza Loos",
    "Mantova",
    "Milano Bovisa - Via Giampietrino",
    "Milano Tortona",
    "Milano Tortona - Via Tortona",
    "Servizi",
    "Servizi - Residenza Pareto",
    "Servizi - Residenza Einstein",
    "Servizi - Residenza Marie Curie",
    "Servizi - Off Campus",
    "Servizi - Residenza Newton",
    "Sesto Ulteriano",
    "Sesto Ulteriano - Via Calabria",
    "Lecco - Via Ghislanzoni",
    "Mantova - Via Scarsellini 15",
    "Mantova - Via Scarsellini 2",
    "Milano Bovisa - Via Durando",
    "Milano Bovisa - Via La Masa",
    "Milano Città Studi - Piazza Leonardo da Vinci 26",
    "Milano Città Studi - Piazza Leonardo da Vinci 32",
    "Milano Città Studi - Via Bassini",
    "Milano Città Studi - Via Bonardi",
    "Milano Città Studi - Via Colombo 40",
    "Milano Città Studi - Via Colombo 81",
    "Milano Città Studi - Via Golgi 20",
    "Milano Città Studi - Via Golgi 40",
    "Milano Città Studi - Via Mancinelli",
    "Milano Città Studi - Via Pascoli 70",
    "Milano Città Studi - Viale Romagna",
    "Piacenza - Via Scalabrini 113",
    "Piacenza - Via Scalabrini 76",
];

const STORAGE_KEY = "auleliberepolimi_prefs";

// ── DOM refs ──────────────────────────────────────────────────
const langSelect = document.getElementById("lang");
const campusSelect = document.getElementById("campus");
const durationSlider = document.getElementById("duration");
const durationValue = document.getElementById("duration-value");
const saveBtn = document.getElementById("save-btn");

// ── Populate campus dropdown ──────────────────────────────────
function populateCampuses() {
    campusSelect.innerHTML = '<option value="">— Select a campus —</option>';
    CAMPUSES.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        campusSelect.appendChild(opt);
    });
}

// ── Apply loaded preferences to form ──────────────────────────
function applyPrefs(prefs) {
    console.log("Applying preferences:", prefs);
    if (prefs.lang) langSelect.value = prefs.lang;
    if (prefs.campus && CAMPUSES.includes(prefs.campus))
        campusSelect.value = prefs.campus;
    if (prefs.duration >= 1 && prefs.duration <= 8) {
        durationSlider.value = prefs.duration;
        updateDurationDisplay();
    }
}

// ── Load saved preferences from Telegram CloudStorage ─────────
function loadPreferences() {
    const tg = window.Telegram && window.Telegram.WebApp;

    // Prefer Telegram CloudStorage (persists across Mini App sessions)
    if (tg && tg.CloudStorage) {
        console.log("Loading from Telegram CloudStorage...");
        tg.CloudStorage.getItem(STORAGE_KEY, function (err, value) {
            if (!err && value) {
                try {
                    applyPrefs(JSON.parse(value));
                } catch (e) {
                    console.warn("CloudStorage parse error:", e);
                }
            } else {
                console.log("No CloudStorage data found");
                // Fallback: try browser localStorage
                loadFromLocalStorage();
            }
        });
    } else {
        // No CloudStorage → browser localStorage
        loadFromLocalStorage();
    }
}

// ── Fallback: load from browser localStorage ──────────────────
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            console.log("Loaded from localStorage:", saved);
            applyPrefs(JSON.parse(saved));
        } else {
            console.log("No localStorage data found");
        }
    } catch (e) {
        console.warn("localStorage load failed:", e);
    }
}

// ── Save to persistent storage + send to bot + close ──────────
function savePreferences() {
    const lang = langSelect.value;
    const campus = campusSelect.value;
    const duration = parseInt(durationSlider.value, 10);

    if (!campus) {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert("Please select a campus.");
        } else {
            window.alert("Please select a campus.");
        }
        return;
    }

    const data = JSON.stringify({ lang, campus, duration });
    console.log("Saving preferences:", data);

    const tg = window.Telegram && window.Telegram.WebApp;

    // 1. Persist via Telegram CloudStorage (cross-session)
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem(STORAGE_KEY, data, function (err) {
            if (err) console.warn("CloudStorage save failed:", err);
            else console.log("CloudStorage save OK");
        });
    }

    // 2. Also save to localStorage as fallback
    try {
        localStorage.setItem(STORAGE_KEY, data);
        console.log("localStorage save OK");
    } catch (e) {
        console.warn("localStorage save failed:", e);
    }

    // 3. Send data to bot via Telegram WebApp API
    //    sendData() auto-closes the Mini App — no need to call close()
    if (tg) {
        tg.sendData(data);
        console.log("sendData() called — Mini App will close");
    } else {
        // Running outside Telegram (browser dev)
        console.log("Outside Telegram — data:", data);
        window.alert("Preferences saved (outside Telegram): " + data);
    }
}

// ── Update duration display ───────────────────────────────────
function updateDurationDisplay() {
    const val = durationSlider.value;
    durationValue.textContent = val + "h";
}

// ─── Apply Telegram theme ─────────────────────────────────────
function applyTheme() {
    if (window.Telegram && window.Telegram.WebApp) {
        document.documentElement.style.colorScheme =
            window.Telegram.WebApp.colorScheme;
    }
}

// ── Init ──────────────────────────────────────────────────────
function init() {
    console.log("Mini App initialized");
    populateCampuses();

    const tg = window.Telegram && window.Telegram.WebApp;

    if (tg) {
        console.log("Telegram WebApp API available — version:", tg.version);
        console.log("CloudStorage available:", !!tg.CloudStorage);
        console.log("DeviceStorage available:", !!tg.DeviceStorage);
        applyTheme();
        tg.ready();
        tg.expand();
        tg.onEvent("themeChanged", applyTheme);
    } else {
        console.log("Running outside Telegram — browser localStorage fallback");
    }

    loadPreferences();

    durationSlider.addEventListener("input", updateDurationDisplay);
    saveBtn.addEventListener("click", savePreferences);
}

document.addEventListener("DOMContentLoaded", init);
