import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/openclaw-arena-board/",
  plugins: [react()],
});
