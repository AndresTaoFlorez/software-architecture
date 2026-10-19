import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { handbookMarkdown, pagePaths } from './handbook.mjs';
import { sidebarItems } from './sidebar.mjs';
import { diagramMarkdown } from '../presentation/diagrams/markdown.mjs';

const paths = await pagePaths();

export const siteConfig = defineConfig({
  site: 'https://andrestaoflorez.github.io',
  base: '/software-architecture/',
  trailingSlash: 'always',
  markdown: { processor: unified({ remarkPlugins: [handbookMarkdown, diagramMarkdown] }) },
  integrations: [starlight({
    title: 'Software Architecture',
    customCss: ['./src/styles/reader.css'],
    components: { Footer: './src/composition/ReaderFooter.astro', Header: './src/presentation/reader/components/ReaderHeader.astro', ThemeSelect: './src/presentation/theme/ThemeSelect.astro' },
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AndresTaoFlorez/software-architecture' }],
    sidebar: [
      { label: 'Learn — reading route', link: '/' },
      { label: 'Reference — topic map', link: '/architecture/' },
      { label: 'Glossary', link: '/glossary/' },
      ...[
        ['Foundations', 'architecture/foundations'],
        ['Styles', 'architecture/styles'],
        ['Patterns', 'architecture/patterns'],
        ['Architecture prompts', 'architecture/prompts'],
        ['Frontend', 'architecture/frontend'],
        ['Backend', 'architecture/backend'],
        ['API', 'architecture/api-design'],
      ].map(([label, directory]) => ({ label, items: sidebarItems(directory, paths) })),
      { label: 'Design Systems', link: '/architecture/frontend/styling-and-design-system/' },
      { label: 'Exercises', items: [
        { label: 'Frontend exercises', link: '/architecture/frontend/exercises/' },
        { label: 'Backend exercises', link: '/architecture/backend/exercises/' },
        { label: 'API exercises', link: '/architecture/api-design/exercises/' },
      ] },
      { label: 'Conventions', items: sidebarItems('architecture/conventions', paths) },
      { label: 'Extras', items: sidebarItems('extras', paths) },
    ],
  })],
});
