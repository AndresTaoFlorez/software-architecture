import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { handbookLoader } from './handbook.mjs';

export const collections = {
  docs: defineCollection({ loader: handbookLoader(), schema: docsSchema() }),
};
