import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite-ს ნაგულისხმევ სიაში .m4a არ არის (mp3, wav, ogg, flac კი არის),
  // ამიტომ import-ისას ბინარულ ფაილს JavaScript-ად კითხულობდა და build ვარდებოდა.
  assetsInclude: ['**/*.m4a'],
  server: {
    allowedHosts: process.env.VITE_ALLOWED_HOST
      ? [process.env.VITE_ALLOWED_HOST]
      : []
  }
})
