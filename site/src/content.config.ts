import { defineCollection } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';
import { handbookLoader } from './infrastructure/handbook/astroHandbook.mjs';

export const collections = {
  i18n: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/i18n' }), schema: i18nSchema() }),
  docs: defineCollection({ loader: handbookLoader(), schema: docsSchema() }),
};
