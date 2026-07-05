# Pulse SA — Kasi Intelligence Platform

A Progressive Web App (PWA) for structured data collection from South Africa's informal economy.

## What It Does
- **Agent PWA** — field agents use the smartphone simulator to log 37-point trader profiles (spaza shops, street vendors, hawkers, salons, prepared food sellers and more)
- **Analytics Dashboard** — ward-level data visualisation, ontology explorer, impact simulator, and live MDB ward boundary map
- **Institutional Output** — same data served through different lenses: Capitec (credit), Unilever (shelf intelligence), Hollard (underwriting)

## Gigs (Data Collection Tasks)
| Gig | Reward | Buyer |
|---|---|---|
| Full Trader Profile Visit (37 points) | R25 | Banks, FMCGs, Insurers |
| Spaza Shelf Audit | R10 | FMCGs |
| Price Basket Monitor | R8 | FMCGs, Government |
| Foot-Traffic Verification | R3 | Banks (verification layer) |
| Infrastructure Report | R2 | Municipalities |

## Works Offline
This is a full PWA. After the first load, it works with **no data connection** — critical for the SA market where data is expensive.

## Tech Stack
- Vanilla HTML / CSS / JavaScript — no framework, no build step
- Leaflet.js for ward boundary maps (MDB 2026 official data)
- Service Worker for offline caching
- Chart.js for analytics

## Deploy
Hosted on Render. Connected to this GitHub repo — every push to `main` auto-deploys.
