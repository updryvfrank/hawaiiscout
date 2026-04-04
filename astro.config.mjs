import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://hawaiiscout.com',
  output: 'static',
  integrations: [tailwind()],
  build: {
    // Trailing slash for clean URLs
    format: 'directory',
  },
  trailingSlash: 'always',
});
