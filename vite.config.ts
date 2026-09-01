import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          tourNilgiris: path.resolve(__dirname, 'tour-nilgiris.html'),
          tourMunnar: path.resolve(__dirname, 'tour-munnar.html'),
          tourKodaikanal: path.resolve(__dirname, 'tour-kodaikanal.html'),
          tourYercaud: path.resolve(__dirname, 'tour-yercaud.html'),
          tourIshaYoga: path.resolve(__dirname, 'tour-isha-yoga.html'),
          tourKeralaCoastal: path.resolve(__dirname, 'tour-kerala-coastal.html'),
          tourPilgrimage: path.resolve(__dirname, 'tour-pilgrimage.html'),
          tourKanyakumari: path.resolve(__dirname, 'tour-kanyakumari.html'),
          tourWildlifeSafari: path.resolve(__dirname, 'tour-wildlife-safari.html'),
          blogOotyGuide: path.resolve(__dirname, 'blog-ooty-guide.html'),
          blogAirportGuide: path.resolve(__dirname, 'blog-airport-guide.html'),
          blogOnewayVsRound: path.resolve(__dirname, 'blog-oneway-vs-round.html'),
          blogHillDrives: path.resolve(__dirname, 'blog-hill-drives.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
