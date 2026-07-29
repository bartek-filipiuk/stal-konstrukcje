// Next ładuje .env sam, vitest nie — bez tego payload.config nie widzi PAYLOAD_SECRET/DATABASE_URI
import 'dotenv/config'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/int/**/*.int.spec.ts'],
    hookTimeout: 90_000,
    testTimeout: 90_000,
    // Payload trzyma jedno połączenie do bazy — testy int muszą iść sekwencyjnie
    fileParallelism: false,
  },
})
