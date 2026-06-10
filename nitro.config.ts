import { defineNitroConfig } from 'nitropack';

export default defineNitroConfig({
  preset: 'vercel',
  output: {
    dir: '.vercel/output',
  },
});
