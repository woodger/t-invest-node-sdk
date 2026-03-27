import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/tinkoff-invest-node-sdk/',
  title: 'Tinkoff Invest Node SDK',
  description: 'Документация по TypeScript/Node.js SDK для T-Invest API',
  lang: 'ru-RU',
  lastUpdated: true,
  vite: {
    server: {
      port: 4173,
    },
    preview: {
      port: 4173,
    },
  },
  themeConfig: {
    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Лимиты API', link: '/limits-policy' },
      { text: 'GitHub', link: 'https://github.com/woodger/tinkoff-invest-node-sdk' },
    ],
    sidebar: [
      {
        text: 'Документация',
        items: [
          { text: 'Обзор', link: '/' },
          { text: 'Лимитная политика', link: '/limits-policy' },
        ],
      },
    ],
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/woodger/tinkoff-invest-node-sdk' },
    ],
    footer: {
      message: 'MIT',
      copyright: 'Copyright © Stanislav Potemkin',
    },
  },
});
