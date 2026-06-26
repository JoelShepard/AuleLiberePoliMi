# Aule Libere Polimi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Bot Telegram per trovare aule libere al Politecnico di Milano.
~~Puoi aggiungerlo su Telegram con questo [link](https://telegram.me/auleliberepolimi_bot).~~

Il bot cerca lo stato delle aule nel sito del PoliMi nel giorno scelto e trova le aule libere
nel tuo slot orario preferito.

<table>
  <tr>
    <td>Start</td>
     <td>Search</td>
     <td>Day</td>
  </tr>
  <tr>
    <td><img src="photos/README/start.png"></td>
    <td><img src="./photos/README/search.png"></td>
    <td><img src="./photos/README/day.png"></td>
  </tr>
 </table>

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

## Sviluppo locale

### Dipendenze

```bash
pip install python-telegram-bot python-dotenv pytz requests beautifulsoup4 lxml
```

### Configurazione

Crea un file `.env` con:

```
TOKEN=IL_TUO_TOKEN_BOT
```

Poi avvia:

```bash
python bot.py
```

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

## Crediti

- **Daniele Ferrazzo** ([@feDann](https://github.com/feDann)) — bot originale (2021)
- **Joel Shepard** ([@JoelShepard](https://github.com/JoelShepard)) — fork, rinnovamento e manutenzione (2026)

## Licenza

MIT — vedi [LICENSE](LICENSE) per i dettagli.
