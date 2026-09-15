import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Timeout für beforeAll/afterAll/beforeEach/afterEach Hooks (in ms)
        hookTimeout: 600_000, // 10 Minuten – zum Debuggen großzügig bemessen

        // Optional: auch den Test-Timeout selbst hochsetzen,
        // falls du während des Tests debuggst, nicht nur im Hook
        testTimeout: 600_000,

        // Für CAP-Tests i.d.R. sinnvoll: sequenziell statt parallel,
        // damit DB-State zwischen Tests nicht kollidiert
        fileParallelism: false,

        environment: 'node',
    }
})