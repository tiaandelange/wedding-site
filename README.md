# Nina & Tiaan — Wedding Website

Static wedding website for **Tiaan & Nina** (trounaweek 25–27 September 2026). Plain HTML, CSS, and JavaScript.

## Project structure

```
├── index.html          # Homepage (weekend programme first)
├── main.js             # Navigation, hero slideshow, scroll interactions
├── styles.css          # Main site styles
├── cancel.js           # Cancel RSVP modal (posts to Google Apps Script)
├── rsvp.html           # Legacy /rsvp route → redirects to Cancel RSVP
├── rsvp.js / rsvp.css  # Legacy RSVP assets (submissions closed)
├── apps-script.gs      # Google Apps Script backend (deploy separately)
├── images/             # Photos, hero slides, favicon, social preview image
├── Fonts/              # Self-hosted fonts
├── PDFs/               # Downloadable drink menu documents
├── scripts/            # Vercel public/ build copy step
├── vercel.json         # Vercel static deployment config
└── package.json        # Local preview + build scripts
```

## Local preview

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (often `http://localhost:3000`).

## Deploy to Vercel

1. Push to GitHub.
2. Import in Vercel (Framework: Other).
3. Build command: `npm run build` (copies static files into `public/`).
4. Output directory: `public`.
5. Attach `delangetroue.co.za` / `www.delangetroue.co.za`.

## Cancel RSVP / Google Sheets

Cancellation is handled via a **Google Apps Script Web App**:

- Frontend: `cancel.js` posts `{ action: "search" | "cancel", ... }` to the Web App URL.
- Backend: paste `apps-script.gs` into Apps Script and **redeploy** as a Web App.

### Apps Script deployment

1. Open [Google Apps Script](https://script.google.com).
2. Paste `apps-script.gs`.
3. Optional Script Properties: `SPREADSHEET_ID`, `SHEET_NAME`, `CANCEL_SECRET`.
4. Deploy → New deployment → Web app.
5. Execute as: Me · Who has access: Anyone.
6. Copy the URL into `WEB_APP_URL` in `cancel.js` if it changes.
7. Redeploy the Vercel site after updating `cancel.js`.

### Sheet mapping (resolved from headers)

| Header | Role |
|--------|------|
| `Naam` / `Naam?` | Primary guest first name |
| `Van` | Primary guest surname |
| `Guest Name` | Additional guest first name |
| `Kan jy kom?` | Attendance (`Yes` / `No`) — one value per row/party |
| `Sel No.` | Phone verification |

New RSVP submissions are rejected by the Apps Script. Cancellation only changes `Kan jy kom?` from `Yes` to `No`.

## Security notes

- No private credentials are stored in the frontend.
- Search returns only display names, masked phone hints, and opaque tokens.
- Phone verification is required before writing `No`.
- `apps-script.gs` is documentation for the backend; Vercel does not execute it.
