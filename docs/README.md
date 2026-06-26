# AuleLiberePoliMi Bot

Bot Telegram per la ricerca di aule libere al Politecnico di Milano.

Ti permette di trovare rapidamente le aule libere in qualsiasi sede del PoliMi,
selezionando data, orario e campus. Include una **Telegram Mini App** per la
gestione delle preferenze utente, interamente lato client.

---

## Architettura

```
┌─────────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Telegram Client    │────▶│  Bot Container   │────▶│ PoliMi Web       │
│  (app mobile /      │◀────│  (Cloud Run)     │◀────│ onlineservices   │
│   desktop / web)    │     │                  │     │ .polimi.it       │
│                     │     │  python-telegram │     └──────────────────┘
│  ┌───────────────┐  │     │  -bot v22        │
│  │ Mini App      │  │     │  requests+bs4    │
│  │ (Cloudflare   │──│────▶│ (web_app_data)   │
│  │  Pages)       │  │     └──────────────────┘
│  └───────────────┘  │
└─────────────────────┘
```

- **Bot**: container Python su Google Cloud Run
- **Scraping**: `requests` + `BeautifulSoup` → pagine PoliMi
- **Mini App**: HTML+CSS+JS statico su Cloudflare Pages
- **Preferenze**: interamente lato client (`localStorage` della Mini App)
- **Stateless**: nessun database, nessun file persistente

---

## Stack

| Componente | Tecnologia |
|---|---|
| Linguaggio | Python 3.13+ |
| Framework bot | [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) v22 |
| Scraping | requests + beautifulsoup4 |
| Mini App | HTML5 + CSS3 + JS vanilla (statica) |
| Hosting bot | Google Cloud Run |
| Hosting Mini App | Cloudflare Pages |
| Contenitore | Docker (multi-stage) |

---

## Struttura del progetto

```
AuleLiberePoliMi/
├── bot.py                        # Entry point del bot
├── requirements.txt              # Dipendenze Python
├── Dockerfile                    # Image per Cloud Run
├── docker-compose.yml            # Sviluppo locale
├── .env                          # Variabili locali (NON in Git)
├── .env.example                  # Template per .env
├── .dockerignore
├── functions/
│   ├── __init__.py
│   ├── errorhandler.py           # Gestione errori + bonk
│   ├── input_check.py            # Validazione input utente
│   ├── keyboard_builder.py       # Generazione tastiere
│   ├── regex_builder.py          # Regex per alias multilingua
│   └── string_builder.py         # Formattazione risposte
├── search/
│   ├── __init__.py
│   ├── find_classrooms.py        # Scraping occupazioni PoliMi
│   ├── free_classroom.py         # Calcolo aule libere
│   └── powerFileGen.py           # Generatore aule con prese
├── json/
│   ├── location.json             # Sedi PoliMi (codice → nome)
│   ├── roomsWithPower.json       # ID aule con prese elettriche
│   └── lang/
│       ├── it.json               # Testi italiano
│       └── en.json               # Testi inglese
├── webapp/
│   └── settings/
│       ├── index.html            # Mini App impostazioni
│       ├── style.css             # Stile tema Telegram
│       └── script.js             # Logica preferenze client-side
├── photos/
├── AGENTS.md                   # Contesto per AI agent (root)
│   └── bonk.jpg                  # Meme per input errati
└── docs/
    ├── README.md                 # Questa documentazione
    └── TODO.md                   # Piano di rinnovamento
```

---

## Come funziona

1. L'utente avvia il bot con `/start`
2. Sceglie tra **Cerca**, **Ora**, **Info** e **Preferenze**
3. **Cerca**: seleziona campus → giorno → ora inizio → ora fine → risultati
4. **Ora**: cerca subito (usa preferenze dalla Mini App se impostate)
5. **Preferenze**: apre la Mini App via pulsante testuale o bottone blu Web App
   - Nella Mini App: lingua, campus preferito, durata ricerca rapida
   - I dati sono salvati nel `localStorage` del client Telegram
   - Quando si preme "Salva", i dati arrivano al bot via `web_app_data`

Il bot è **stateless**: nessuna preferenza è salvata lato server.
Al riavvio del container, tutto riparte pulito.
Le preferenze vivono solo nel client Telegram.

---

## Licenza

MIT — originale di [Daniele Ferrazzo](https://github.com/feDann).
Fork e rinnovamento a cura di Joel Shepard.
