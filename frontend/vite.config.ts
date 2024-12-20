import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load environment variables from `.env`
dotenv.config();

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "~": "/app", // Alias for easier imports
    },
  },
  define: {
    "process.env.API_BASE_URL": JSON.stringify(process.env.API_BASE_URL),
  },
  server: {
    port: 3000, // Dev server port
    open: true, // Auto-open browser
  },
  build: {
    outDir: "dist", // Build output directory
    sourcemap: true, // Generate sourcemaps for debugging
  },
});
