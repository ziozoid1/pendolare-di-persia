import { defineConfig } from "vite";

export default defineConfig({
  // './' rende la build pubblicabile anche in una sottocartella (GitHub Pages).
  base: "./",
  build: {
    target: "esnext",
    assetsInlineLimit: 0 // gli sprite restano file separati, mai inlinati in base64
  },
  server: { port: 5173, open: true }
});
