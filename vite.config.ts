import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-toast",
            "@radix-ui/react-accordion",
            "@radix-ui/react-progress",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "i18n-vendor": ["i18next", "react-i18next"],
          "utils": ["clsx", "tailwind-merge", "class-variance-authority"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
