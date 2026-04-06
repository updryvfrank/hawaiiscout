import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hawaiiscout.com',
  output: 'static',
  integrations: [tailwind(), sitemap()],
  build: {
    // Trailing slash for clean URLs
    format: 'directory',
  },
  trailingSlash: 'always',
});
