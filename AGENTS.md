# AGENTS.md — Contesto per AI agent

Questo file documenta le decisioni, l'architettura e le convenzioni
del progetto **AuleLiberePoliMi**, emerse dalla conversazione con
l'utente (Joel Shepard). Leggilo prima di lavorare sul progetto.

---

## ⚙️ Visione del progetto

Bot Telegram per trovare aule libere al PoliMi.
Rinnovamento tecnologico completo di un bot esistente (originariamente
di Daniele Ferrazzo, 2021). L'obiettivo è portarlo su cloud con
stack moderno e architettura stateless.

**Approccio**: stateless, containerizzato, preferenze client-side.

---

## 🧠 Decisioni architetturali (conversazione del 26/06/2026)

### Stateless
- Il bot **non deve** avere alcuna persistenza lato server
- Niente PicklePersistence, niente database, niente file system
- Le preferenze utente vivono nel `localStorage` del client Telegram

### Preferenze client-side via Telegram Mini App
- Una **Telegram Web App (Mini App)** HTML+CSS+JS statica gestisce:
  - Lingua preferita (it/en)
  - Campus preferito
  - Durata della ricerca rapida (1-8 ore)
- La Mini App è hostata su **Cloudflare Pages** (statica)
- I dati arrivano al bot via `web_app_data` quando l'utente salva
- La Mini App è solo per le *impostazioni* — il bot rimane **inline**
  (testo e tastiere) per tutta la ricerca

### Interazione impostazioni — ibrida (Scenario B)
- Nel menu principale: il pulsante testuale `⚙️Preferenze` rimane
- C'è **anche** il bottone blu `Web App` (inline keyboard) per
  chi conosce già le Mini App
- Chi preme il pulsante testuale entra nello stato SETTINGS e
  riceve un messaggio con link/bottone alla Mini App
- La Mini App **non sostituisce** l'intero bot, solo le impostazioni

### Google Cloud Run
- Container deployato su GCP Cloud Run (europe-west1)
- Niente dominio personalizzato per ora — solo polling
- Segreto (TOKEN) via Secret Manager o GitHub Secrets

### Python — ultima stabile
- Python 3.13+ (quella stabile al momento del deploy)
- Dipendenze tutte all'ultima versione compatibile

### Ricerca rapida "Ora"
- Mantenuta. Se preferenze Mini App sono state inviate in questa
  sessione, le usa. Altrimenti chiede campus e durata inline.

### Logging
- Solo stdout (catturato da Cloud Run Logs Explorer)
- Formato plain per ora, eventualmente JSON strutturato in futuro

### roomsWithPower.json
- File statico incluso nell'immagine Docker
- Rigenerabile via `search/powerFileGen.py`
- Aggiornato in build-time

### Ownership
- Repository: `github.com/JoelShepard/AuleLiberePoliMi`
- Credits a Daniele Ferrazzo per il lavoro originale
- Licenza: MIT (invariata)

---

## 📦 Struttura file importante

| File | Ruolo |
|---|---|
| `bot.py` | Entry point, ConversationHandler, web_app_data handler |
| `functions/keyboard_builder.py` | Tastiere, ora con bottone Mini App |
| `functions/user_data_handler.py` | Ridotto/minimo (bot stateless) |
| `webapp/settings/` | Mini App statica (Cloudflare Pages) |
| `Dockerfile` | Multi-stage per Cloud Run |
| `docs/TODO.md` | Tracking del rinnovamento |

---

## 🔮 Futuro (non implementare ora)

- Webhook invece di polling (richiede dominio)
- Mini App più completa che diventa interfaccia principale
- JSON logging strutturato
- CI/CD con GitHub Actions
- Helm chart / Terraform per deploy

---

## 🚫 Convenzioni da ricordare

- Non salvare mai nulla su filesystem (tranne JSON statici nell'immagine)
- Non usare PicklePersistence
- La lingua si ottiene da `update.effective_user.language_code`
- Le preferenze sono sempre opzionali
- Il bot deve funzionare anche senza Mini App (fallback inline)
- I file JSON in `json/` sono bundled nell'immagine Docker
