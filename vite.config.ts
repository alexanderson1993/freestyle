import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet";
import babel from "vite-plugin-babel";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./workers/app.ts",
        }
      : undefined,
  },
  plugins: [
    babel({
      include: ["./app/**/*"],
      filter: (name) => name.endsWith("tsx"),
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    cloudflare({
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    iconsSpritesheet({
      // Defaults to false, should it generate TS types for you
      withTypes: true,
      // The path to the icon directory
      inputDir: "app/icons",
      // Output path for the generated spritesheet and types
      outputDir: "app/components/ui/icons",
      // Output path for the generated type file, defaults to types.ts in outputDir
      typesOutputFile: "app/components/ui/icons/icons.ts",
      // The name of the generated spritesheet, defaults to sprite.svg
      fileName: "icon.svg",
    }),
  ],
}));
