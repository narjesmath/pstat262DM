# Deploy Your Presentation

GitHub Pages **does not support private repos** on free accounts. Use **Netlify** to deploy from a private repo.

---

## Option A: Netlify (works with private repo)

1. **Make your repo private** (optional):
   - GitHub → repo **Settings** → **Danger Zone** → **Make private**

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up (free)
   - Click **Add new site** → **Import an existing project**
   - Choose **GitHub** and authorize Netlify
   - Select your repo `pstat262DM` (private repos work)
   - Build settings (auto-detected from `netlify.toml`):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variable: `VITE_BASE_URL` = `/`
   - Click **Deploy site**

3. **Your site** will be at `https://[your-site-name].netlify.app`

4. **Custom URL** (optional): In Netlify → Domain settings → change to `pstat262dm.netlify.app` or add a custom domain.

---

## Option B: GitHub Pages (repo must be public)

If you keep the repo **public**, GitHub Pages works:

1. **Settings** → **Pages** → **Source**: GitHub Actions
2. Site: **https://narjesmath.github.io/pstat262DM/**

---

## Local preview

```bash
npm run build
npm run preview
```
