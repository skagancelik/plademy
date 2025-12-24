import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: netlify({
    edgeMiddleware: true,
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      // Statik sayfalar için, dinamik sitemap ayrı endpoint'te
      filter: (page) => {
        // Sadece statik sayfaları sitemap'e ekle
        return !page.includes('/resources/') && !page.includes('/programs/');
      },
    }),
  ],
  site: 'https://plademy.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fi', 'sv'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

