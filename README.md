# PTSLT Prototype v0.1 — Production Test Support & Loss Time Tracking

A static, game-inspired web prototype for demonstrating how production teams might report test issues, call TE/PE/AE/ME, track incident status, review repeat failures, and earn XP for good support habits.

## What this is
- Static HTML, CSS, and JavaScript — no backend and no database.
- Uses mock/sample data only.
- Interactive demo: create an incident, search/filter the incident list, open case details, update status, add root-cause/corrective-action notes, and earn demo XP.
- Responsive layout for desktop and mobile.
- No Microsoft Teams integration, no real notifications, no corporate authentication, and no real loss-time calculations.
- The interface loads Lucide icons and Google Fonts from CDNs; an internet connection is needed for those assets. The app itself is static.

## Run locally
Open `index.html` in a modern browser, or serve the folder with a simple static server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Publish a live link with GitHub Pages
1. Create a new GitHub repository, e.g. `ptslt-prototype`.
2. Upload `index.html`, `style.css`, `app.js`, and this README to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then Save.
6. Wait for the deployment to finish. GitHub will show a public URL similar to `https://YOUR-USERNAME.github.io/ptslt-prototype/`.
7. Share that URL with colleagues for a concept demo.

You can also push using Git:

```bash
git init
git add index.html style.css app.js README.md
git commit -m "Add PTSLT static prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ptslt-prototype.git
git push -u origin main
```

## Demo walkthrough
1. Click **Report Incident**.
2. Create a sample issue and assign it to TE, PE, AE, or ME.
3. Open the Incident Board and click **Details**.
4. Click **Update status** to cycle through Open → Acknowledged → In Progress → Resolved.
5. Click **Add root cause** to add sample root-cause and corrective-action notes.
6. Visit **Quest & Rewards** to show the gamification concept.

## Important before sharing
This prototype is intended for UI/concept review only. It does not contact real engineers or send Teams messages. It contains illustrative names, incidents, timestamps, and metrics. Do not enter confidential production, customer, product, or employee information. For an internal pilot, obtain the required approval and add authentication, a central database, audit controls, and approved notification integration.
