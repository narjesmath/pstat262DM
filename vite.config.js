import { defineConfig } from 'vite'

// Use '/' for Netlify (private repo), '/pstat262DM/' for GitHub Pages (public repo)
const base = process.env.VITE_BASE_URL || '/'

export default defineConfig({
  base,
})
