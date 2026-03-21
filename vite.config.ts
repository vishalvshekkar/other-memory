import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from "fs";
import { parse as parseYaml } from "yaml";

/** Simple Vite plugin to import .yaml files as JSON modules */
function yamlPlugin() {
  return {
    name: "yaml-loader",
    transform(code: string, id: string) {
      if (id.endsWith(".yaml") || id.endsWith(".yml")) {
        const content = readFileSync(id, "utf-8");
        const parsed = parseYaml(content);
        return {
          code: `export default ${JSON.stringify(parsed)}`,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), yamlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@data": path.resolve(__dirname, "./data"),
    },
  },
  build: {
    target: "es2022",
  },
});
