import { defineConfig, ProxyOptions, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

const rmgProxies = [
    '/rmg',
    '/rmp',
    '/rmg-palette',
    '/rmg-components',
    '/rmg-templates',
    '/seed-project',
    '/rmg-translate',
].reduce<Record<string, ProxyOptions>>(
    (acc, cur) => ({
        ...acc,
        [cur]: {
            target: 'https://uat-railmapgen.github.io',
            changeOrigin: true,
            secure: false,
        },
    }),
    {}
);

// https://vitejs.dev/config
export default defineConfig({
    base: '/',
    plugins: [
        react(),
        checker({ typescript: true, eslint: { lintCommand: 'eslint ./src' } }),
        splitVendorChunkPlugin(),
    ],
    server: {
        proxy: {
            ...rmgProxies,
        },
    },
});
