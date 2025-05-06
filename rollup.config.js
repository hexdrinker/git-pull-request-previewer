import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  input: {
    background: "src/background.ts",
    popup: "src/popup.ts",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
  },
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    }),
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
    copy({
      targets: [
        { src: "manifest.json", dest: "dist" },
        { src: "public/popup.html", dest: "dist" },
        { src: "public/panel.html", dest: "dist" },
        { src: "public/styles.css", dest: "dist" },
        { src: "public/popup.css", dest: "dist" },
        { src: "public/icon-128.png", dest: "dist" },
        { src: "public/icon-48.png", dest: "dist" },
        { src: "public/icon-32.png", dest: "dist" },
      ],
    }),
  ],
});
