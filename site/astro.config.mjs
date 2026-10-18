import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { handbookMarkdown } from './src/handbook.mjs';

export default defineConfig({
  site: 'https://andrestaoflorez.github.io',
  base: '/software-architecture/',
  trailingSlash: 'always',
  markdown: { processor: unified({ remarkPlugins: [handbookMarkdown] }) },
  integrations: [starlight({
    title: 'Software Architecture',
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AndresTaoFlorez/software-architecture' }],
    sidebar: [
      { label: 'Start here', link: '/' },
      { label: 'Glossary', link: '/glossary/' },
      { label: 'Architecture', items: [{ autogenerate: { directory: 'architecture' } }] },
      { label: 'Extras', items: [{ autogenerate: { directory: 'extras' } }] },
    ],
  })],
});
