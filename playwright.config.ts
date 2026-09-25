import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 600_000,
  workers: 1,
  reporter: 'list',
  // Final state by default (no entrance animation); tests/anim.spec.ts opts back into motion.
  use: { browserName: 'chromium', reducedMotion: 'reduce' },
  webServer: [
    // Built site: what the check and the screenshots judge.
    { command: 'npm run build && npm run preview', url: 'http://localhost:4173', reuseExistingServer: false, timeout: 180_000 },
    // Dev server: only for tools/ pages (icon comparison).
    { command: 'npx vite --port 5179 --strictPort', url: 'http://localhost:5179/tools/icons.html', reuseExistingServer: false, timeout: 60_000 },
  ],
});
