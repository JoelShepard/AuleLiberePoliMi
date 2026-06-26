# TODO — Rinnovamento AuleLiberePoliMi Bot

Stato progetto: **iniziato** — Fase 0 da completare.

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto

---

## ⬜ Fase 0 — Pulizia fondazioni

- [ ] Rigenerare `requirements.txt` dall'ambiente reale (`pip freeze`)
- [ ] Aggiornare `Pipfile` a Python 3.13+
- [ ] Rimuovere `Procfile` (Heroku legacy)
- [ ] Rimuovere `log/` directory dal tracking
- [ ] Rimuovere `aulelibere_pp` (file pickle) dal tracking
- [ ] `.gitignore`: assicurarsi che .env, log/, __pycache__ siano ignorati
- [ ] Logging: rimuovere `FileHandler`, tenere solo `StreamHandler` (stdout)
- [ ] Verificare che il bot funzioni ancora dopo le pulizie

**Obiettivo**: repository pulito, zero file obsoleti, dipendenze reali.

---

## ⬜ Fase 1 — Bot stateless (nessuna persistenza)

- [ ] Rimuovere `PicklePersistence` da `bot.py`
- [ ] Lingua: ottenere da `update.effective_user.language_code`
- [ ] Eliminare stati SET_LANG, SET_CAMPUS, SET_TIME dal ConversationHandler
- [ ] Aggiungere handler per `web_app_data` (ricezione preferenze dalla Mini App)
- [ ] Preferenze in `context.user_data` solo per durata della sessione (ephemeral)
  - "Ora": se preferenze presenti in sessione, le usa
  - "Ora": altrimenti chiede campus + durata inline
- [ ] Ridurre `functions/user_data_handler.py` (minimo indispensabile)
- [ ] Aggiornare `functions/regex_builder.py`: rimuovere regex settings
- [ ] Aggiornare `functions/input_check.py`: rimuovere check lingue/tempo/campus
- [ ] Aggiungere bottone Web App nei metodi `keyboard_builder.py`

**Obiettivo**: bot pienamente stateless, nessun file persistente,
preferenze solo via Mini App o inline.

---

## ⬜ Fase 2 — Mini App impostazioni (Cloudflare Pages)

### 2a — Struttura statica
- [ ] Creare `webapp/settings/index.html`
- [ ] Creare `webapp/settings/style.css` (tema Telegram)
- [ ] Creare `webapp/settings/script.js` (logica)

### 2b — Mini App: requisiti funzionali
- [ ] Apertura: carica preferenze da `localStorage` (se presenti)
- [ ] Campo Lingua: dropdown 🇮🇹 Italiano / 🇬🇧 English
- [ ] Campo Campus: dropdown lungo (40+ sedi da `location.json`)
- [ ] Campo Durata: slider o dropdown 1-8 ore
- [ ] Bottone "💾 Salva preferenze":
  - Salva in `localStorage`
  - Invia al bot via `Telegram.WebApp.sendData()`
  - Chiude la Mini App con `close()`
- [ ] Integrazione `telegram-web-app.js` CDN
- [ ] Tema: usare `Telegram.WebApp.themeParams` per chiaro/scuro
- [ ] Pagina responsive, segue linee guida Telegram

### 2c — Deploy
- [ ] Istruzioni per deploy su Cloudflare Pages
- [ ] URL della Mini App come variabile d'ambiente (es. `WEBAPP_URL`)
- [ ] Test funzionamento end-to-end

**Obiettivo**: Mini App funzionante, hostata staticamente,
preferenze persistenti nel client Telegram.

---

## ⬜ Fase 3 — Containerizzazione

- [ ] Creare `Dockerfile` multi-stage
  - `builder`: installa dipendenze
  - `runtime`: python:3.13-slim, copia sorgenti, USER non-root
- [ ] Creare `.dockerignore`
- [ ] Creare `docker-compose.yml` per sviluppo locale
- [ ] Verificare build locale dell'immagine
- [ ] Verificare avvio del bot nel container
- [ ] `HEALTHCHECK` (opzionale, polling basta)

**Obiettivo**: immagine Docker pronta per Cloud Run, < 200MB.

---

## ⬜ Fase 4 — Deploy su Google Cloud Run

- [ ] Creare `cloudbuild.yaml` per build automatizzata
- [ ] Istruzioni deploy: `gcloud run deploy`
- [ ] Variabili d'ambiente: `TOKEN` da Secret Manager
- [ ] Test deploy su Cloud Run (regione europe-west1)
- [ ] Verificare log su Cloud Logging
- [ ] Verificare funzionamento bot dopo deploy

**Obiettivo**: bot live su Cloud Run, raggiungibile via Telegram.

---

## ⬜ Fase 5 — Ownership & documentazione

- [ ] Aggiornare `README.md` principale del progetto
  - Nuovo autore (Joel), crediti a Daniele
  - Istruzioni per sviluppo locale
  - Link alla Mini App
  - Badge stato build/deploy
- [ ] Aggiungere `.env.example` (senza token reali)
- [ ] Verificare `LICENSE` (MIT, invariata)
- [ ] Commit finale con messaggio significativo

**Obiettivo**: repository pronto per contributi esterni.

---

## 📝 Note

- Il bot FUNZIONA già sulla macchina locale (testato al 26/06/2026).
- Le modifiche devono preservare la compatibilità con il flusso esistente.
- La Mini App è un'aggiunta, non una sostituzione del bot inline.
- Ogni fase deve essere commit separata (git history pulito).
