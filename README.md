# Nina & Tiaan — Wedding Website

Static wedding website for **Tiaan & Nina** (26 September 2026). Plain HTML, CSS, and JavaScript — no build step required.

## Project structure

```
├── index.html          # Homepage (single-page layout with anchor sections)
├── main.js             # Navigation, hero slideshow, scroll interactions
├── styles.css          # Main site styles
├── rsvp.html           # Standalone RSVP form page
├── rsvp.js             # RSVP form logic (submits to Google Apps Script)
├── rsvp.css            # RSVP page styles
├── apps-script.gs      # Google Apps Script backend (deploy separately in Google)
├── images/             # Photos, hero slides, favicon, social preview image
├── Fonts/              # Self-hosted fonts
├── PDFs/               # Downloadable drink menu documents
├── vercel.json         # Vercel static deployment config
└── package.json        # Optional local preview only
```

## Local preview

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (or the port shown in the terminal).

## Deploy to Vercel

### 1. Push to GitHub

Ensure the repository is pushed to GitHub (`tiaandelange/wedding-site`).

### 2. Import in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Import the GitHub repository.
4. Use these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other |
| **Root Directory** | `.` (repository root) |
| **Build Command** | *(leave empty)* |
| **Output Directory** | *(leave empty / default)* |
| **Install Command** | *(leave empty, or `npm install` if you want)* |

5. Click **Deploy**.

No build step is required. Vercel serves the static files directly from the repo root.

### 3. Custom domain — delangetroue.co.za

1. In the Vercel project, go to **Settings → Domains**.
2. Add `delangetroue.co.za` and `www.delangetroue.co.za`.
3. Update DNS at your domain registrar using the records Vercel provides (typically an `A` record and/or `CNAME` for `www`).
4. Wait for DNS propagation (can take a few minutes to 48 hours).
5. Vercel will provision HTTPS automatically.

### 4. Post-deployment testing checklist

After DNS is live, verify:

- [ ] Homepage loads (`https://www.delangetroue.co.za/`)
- [ ] Anchor navigation works (Ons Storie, Skedule, RSVP section, etc.)
- [ ] Hero slideshow and images load
- [ ] RSVP page opens at `/rsvp`
- [ ] RSVP form submits successfully (test with a dummy entry)
- [ ] Success and error messages display correctly
- [ ] PDF links open (`Pryslys`, `Specials` in FAQs)
- [ ] Google Maps link opens in a new tab
- [ ] Accommodation links open in a new tab
- [ ] Mobile layout looks correct
- [ ] Desktop layout looks correct

## RSVP / Google Sheets integration

RSVP submissions are handled client-side via a **Google Apps Script Web App**:

- Frontend: `rsvp.js` posts JSON to the deployed Apps Script URL.
- Backend: `apps-script.gs` (copy into Google Apps Script, deploy as Web App).

### Apps Script deployment (manual, one-time)

1. Open [Google Apps Script](https://script.google.com).
2. Create a new project and paste the contents of `apps-script.gs`.
3. Set the correct `SPREADSHEET_ID` and `SHEET_NAME`.
4. Deploy → **New deployment** → type **Web app**.
5. Set **Execute as**: Me.
6. Set **Who has access**: **Anyone**.
7. Copy the deployment URL and paste it into `WEB_APP_URL` in `rsvp.js`.
8. Redeploy the Vercel site after updating `rsvp.js`.

The Web App URL is public by design (same pattern as most static-site RSVP forms). No API keys or service accounts are needed in the frontend.

> **Note:** `apps-script.gs` contains a Google Sheet ID for reference when maintaining the Apps Script project. That file is not executed by Vercel — it stays in the repo as documentation for the backend setup.

## Security notes

- No private credentials are stored in the frontend.
- The Google Apps Script Web App URL is intentionally public.
- `apps-script.gs` includes a spreadsheet ID for backend maintenance only (not served to browsers).
