import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hlavní web První pozice (1P). Static output, deploy na Vercel.
// site = produkční doména (kvůli sitemap + kanonickým URL).
export default defineConfig({
  site: 'https://www.prvni-pozice.com',
  integrations: [sitemap()],
  // Veškeré CSS inline do HTML — žádné render-blocking requesty (PSI/LCP).
  build: { inlineStylesheets: 'always' },
});
