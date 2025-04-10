import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  input: {
    background: "src/background.ts",
    popup: "src/popup.ts",
    panel: "src/panel.ts",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
  },
  plugins: [
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
