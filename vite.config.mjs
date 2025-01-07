import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ["babel-plugin-react-compiler", {
              target: '19'
            }],
          ],
        },
      }),
    ],
  })