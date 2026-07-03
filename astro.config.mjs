import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// Vincent 2000 OS — couche contenu (Astro) + couche OS (Svelte), cf. docs/090 D10.
export default defineConfig({
  integrations: [svelte()],
});
