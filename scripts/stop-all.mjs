import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

console.log('\x1b[33m\x1b[1m[STOP] Stopping AI Marketplace services...\x1b[0m');

// Stop Docker containers
try {
  console.log('[STOP] Stopping docker containers...');
  execSync('docker compose down', { cwd: rootDir, stdio: 'inherit' });
  console.log('\x1b[32m[STOP] Docker containers stopped.\x1b[0m');
} catch (e) {
  console.log('\x1b[90m[STOP] Docker compose down skipped or not running.\x1b[0m');
}

// Windows-specific port check and cleanup for ports 3000 and 4000
if (isWindows) {
  const ports = [3000, 4000];
  for (const port of ports) {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid)) && Number(pid) > 0) {
          console.log(`[STOP] Freeing port ${port} by terminating PID ${pid}...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } catch (_) {}
        }
      }
    } catch (_) {
      // Port was not in use, ignore
    }
  }
}

console.log('\x1b[32m\x1b[1m[STOP] Done! All services stopped.\x1b[0m');
