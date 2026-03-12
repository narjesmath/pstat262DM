# Deploy to GitHub Pages

## Overview

This project deploys to GitHub Pages via GitHub Actions. The workflow builds the Vite app and pushes the `dist` folder to the `gh-pages` branch.

**Live URL:** https://narjesmath.github.io/pstat262DM/

---

## Prerequisites

- Repo is **public** (or you have a paid GitHub plan for private repos)
- Default branch is `main` or `master`

---

## Setup

1. **Configure GitHub Pages**
   - Repo → **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to **Deploy from a branch**
   - Set **Branch** to `gh-pages` and folder to `/ (root)`
   - Click **Save**

2. **Push to trigger deploy**
   - Push to `main` or `master` — the workflow runs automatically
   - Check **Actions** tab for build status

3. **Wait**
   - First deploy can take a few minutes
   - Site will be available at `https://<username>.github.io/<repo-name>/`

---

## How it works

- **Workflow:** `.github/workflows/deploy.yml`
- **Build:** `npm run build` produces `dist/` with base path `/pstat262DM/`
- **Deploy:** `peaceiris/actions-gh-pages` pushes `dist/` to the `gh-pages` branch
- **Base path:** `vite.config.js` sets `base: '/pstat262DM/'` for correct asset URLs

---

## Local vs production

- **Local:** `npm run dev` — served at `http://localhost:5173/pstat262DM/`
- **Production:** Built assets use `/pstat262DM/` prefix for GitHub Pages subpath
