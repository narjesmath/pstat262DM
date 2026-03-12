# Deploy to GitHub Pages

## Make the repo private (optional)

1. Go to your repo: https://github.com/narjesmath/pstat262DM
2. **Settings** → **General** → scroll to **Danger Zone**
3. Click **Change repository visibility** → **Make private**

The source code will be private; the live presentation at https://narjesmath.github.io/pstat262DM/ remains publicly viewable (anyone with the link can see it).

## Setup

1. **Initialize git and push to your repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/narjesmath/pstat262DM.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo: https://github.com/narjesmath/pstat262DM
   - **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to **GitHub Actions**

3. **Deploy:** The workflow runs automatically on every push to `main`. After it completes, your presentation will be live at:

   **https://narjesmath.github.io/pstat262DM/**

## Manual deploy (optional)

To build locally and preview:
```bash
npm run build
npm run preview
```
