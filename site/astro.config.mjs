import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { handbookMarkdown } from './src/handbook.mjs';
import { diagramMarkdown } from './src/diagrams/markdown.mjs';

export default defineConfig({
  site: 'https://andrestaoflorez.github.io',
  base: '/software-architecture/',
  trailingSlash: 'always',
  markdown: { processor: unified({ remarkPlugins: [handbookMarkdown, diagramMarkdown] }) },
  integrations: [starlight({
    title: 'Software Architecture',
    customCss: ['./src/styles/reader.css'],
    components: { Footer: './src/components/ReaderFooter.astro' },
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AndresTaoFlorez/software-architecture' }],
    sidebar: [
      { label: 'Learn — reading route', link: '/' },
      { label: 'Reference — topic map', link: '/architecture/' },
      { label: 'Glossary', link: '/glossary/' },
      ...[
        ['Foundations', 'architecture/foundations'],
        ['Styles', 'architecture/styles'],
        ['Patterns', 'architecture/patterns'],
        ['Frontend', 'architecture/frontend'],
        ['Backend', 'architecture/backend'],
        ['API', 'architecture/api-design'],
      ].map(([label, directory]) => ({ label, items: [{ autogenerate: { directory } }] })),
      { label: 'Design Systems', link: '/architecture/frontend/styling-and-design-system/' },
      { label: 'Exercises', items: [
        { label: 'Frontend exercises', link: '/architecture/frontend/exercises/' },
        { label: 'Backend exercises', link: '/architecture/backend/exercises/' },
        { label: 'API exercises', link: '/architecture/api-design/exercises/' },
      ] },
      { label: 'Conventions', items: [{ autogenerate: { directory: 'architecture/conventions' } }] },
      { label: 'Extras', items: [{ autogenerate: { directory: 'extras' } }] },
    ],
  })],
});
