import { spawn, exec, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Command-line flags
const args = process.argv.slice(2);
const skipDocker = args.includes('--no-docker');
const skipWorker = args.includes('--no-worker');
const skipClient = args.includes('--no-client');
const separateWindows = args.includes('--windows') || args.includes('--separate');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function logHeader() {
  console.log(`${colors.cyan}${colors.bold}`);
  console.log('===========================================================');
  console.log('            AI MARKETPLACE - FULL DEV RUNNER               ');
  console.log('===========================================================');
  console.log(`${colors.reset}`);
}

function tag(label, color) {
  const pad = 8 - label.length;
  const padding = pad > 0 ? ' '.repeat(pad) : '';
  return `${color}${colors.bold}[${label}]${padding}${colors.reset} `;
}

function checkPort(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function waitForPort(port, serviceName, maxWaitSeconds = 15) {
  process.stdout.write(`${tag('WAIT', colors.yellow)}Waiting for ${serviceName} on port ${port}...`);
  const start = Date.now();
  while (Date.now() - start < maxWaitSeconds * 1000) {
    const ok = await checkPort(port);
    if (ok) {
      console.log(` ${colors.green}Ready!${colors.reset}`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 800));
    process.stdout.write('.');
  }
  console.log(` ${colors.yellow}Timed out${colors.reset}`);
  return false;
}

function isDockerDaemonRunning() {
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

async function startDocker() {
  if (skipDocker) {
    console.log(`${tag('DOCKER', colors.yellow)}Skipped (--no-docker specified)`);
    return;
  }

  // Check if ports are already alive
  const pgAlive = await checkPort(5433);
  const redisAlive = await checkPort(6379);

  if (pgAlive && redisAlive) {
    console.log(`${tag('DOCKER', colors.green)}Postgres (5433) and Redis (6379) are already running.`);
    return;
  }

  let daemonRunning = isDockerDaemonRunning();

  if (!daemonRunning && isWindows) {
    const dockerDesktopPath = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
    if (fs.existsSync(dockerDesktopPath)) {
      console.log(`${tag('DOCKER', colors.cyan)}Docker daemon is stopped. Launching Docker Desktop...`);
      exec(`start "" "${dockerDesktopPath}"`);

      process.stdout.write(`${tag('DOCKER', colors.yellow)}Waiting for Docker daemon to initialize...`);
      const start = Date.now();
      while (Date.now() - start < 45000) {
        await new Promise((r) => setTimeout(r, 3000));
        process.stdout.write('.');
        if (isDockerDaemonRunning()) {
          daemonRunning = true;
          console.log(` ${colors.green}Docker is ready!${colors.reset}`);
          break;
        }
      }
      if (!daemonRunning) {
        console.log(` ${colors.yellow}Docker startup is taking longer than expected.${colors.reset}`);
      }
    }
  }

  if (daemonRunning) {
    try {
      console.log(`${tag('DOCKER', colors.cyan)}Running "docker compose up -d"...`);
      execSync('docker compose up -d', { cwd: rootDir, stdio: 'inherit' });
      await waitForPort(5433, 'PostgreSQL', 12);
      await waitForPort(6379, 'Redis', 8);
      console.log(`${tag('DOCKER', colors.green)}Postgres, Redis & Adminer containers are up!`);
      return;
    } catch (err) {
      console.log(`${tag('DOCKER', colors.red)}Failed to start containers via docker compose.`);
    }
  } else {
    console.log(
      `${tag('DOCKER', colors.yellow)}WARNING: Docker daemon is not active.\n` +
      `         Please ensure PostgreSQL (port 5433) and Redis (port 6379) are running,\n` +
      `         or open Docker Desktop and rerun this script.`
    );
  }
}

async function runMigrations() {
  console.log(`${tag('DB', colors.blue)}Checking database connection (port 5433)...`);
  const isPgOpen = await checkPort(5433);
  if (!isPgOpen) {
    console.log(`${tag('DB', colors.yellow)}Database port 5433 is not reachable yet. Skipping migrate.`);
    return;
  }

  console.log(`${tag('DB', colors.blue)}Applying database migrations (npm run db:migrate)...`);
  try {
    execSync(`${npmCmd} run db:migrate`, { cwd: serverDir, stdio: 'inherit' });
    console.log(`${tag('DB', colors.green)}Database migrations complete!`);
  } catch (err) {
    console.log(`${tag('DB', colors.yellow)}Migration notice: database may still be starting or already updated.`);
  }
}

const activeProcesses = [];

function killProcessTree(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (isWindows) {
      execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
    } else {
      process.kill(-proc.pid, 'SIGKILL');
    }
  } catch (_) {
    try {
      proc.kill('SIGKILL');
    } catch (_) {}
  }
}

function freePort(port) {
  if (!isWindows) return;
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    for (const line of output.trim().split('\n')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(Number(pid)) && Number(pid) > 0) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch (_) {}
      }
    }
  } catch (_) {}
}

let isShuttingDown = false;
function cleanExit() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${tag('SHUTDOWN', colors.red)}Stopping all services...`);
  for (const item of activeProcesses) {
    console.log(`${tag(item.name, colors.gray)}Stopping PID ${item.proc.pid}...`);
    killProcessTree(item.proc);
  }
  // Free dev ports
  freePort(4000);
  freePort(3000);
  console.log(`${tag('SHUTDOWN', colors.green)}All processes stopped cleanly.`);
  process.exit(0);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

function startService({ name, command, args, cwd, color }) {
  if (separateWindows && isWindows) {
    const title = `AI Marketplace - ${name}`;
    const cmdStr = `start "${title}" cmd.exe /k "cd /d "${cwd}" && ${command} ${args.join(' ')}"`;
    exec(cmdStr);
    console.log(`${tag(name, color)}Launched in separate terminal window.`);
    return;
  }

  const proc = spawn(command, args, {
    cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
    detached: !isWindows,
  });

  activeProcesses.push({ name, proc });

  const rlOut = readline.createInterface({ input: proc.stdout });
  rlOut.on('line', (line) => {
    console.log(`${tag(name, color)}${line}`);
  });

  const rlErr = readline.createInterface({ input: proc.stderr });
  rlErr.on('line', (line) => {
    console.log(`${tag(name, colors.red)}${line}`);
  });

  proc.on('close', (code) => {
    console.log(`${tag(name, color)}Process exited with code ${code}`);
  });

  return proc;
}

function printSummary() {
  console.log('\n' + colors.bold + colors.green + '===========================================================' + colors.reset);
  console.log(` ${colors.bold}AI Marketplace services starting up!${colors.reset}`);
  console.log('-----------------------------------------------------------');
  console.log(`  ${colors.bold}Frontend App:${colors.reset}    ${colors.cyan}http://localhost:3000${colors.reset}`);
  console.log(`  ${colors.bold}Backend API:${colors.reset}     ${colors.cyan}http://localhost:4000${colors.reset}`);
  console.log(`  ${colors.bold}API Health:${colors.reset}      ${colors.cyan}http://localhost:4000/health${colors.reset}`);
  console.log(`  ${colors.bold}Adminer DB:${colors.reset}      ${colors.cyan}http://localhost:8081${colors.reset} (Postgres: marketplace_dev)`);
  console.log(`  ${colors.bold}Redis:${colors.reset}           ${colors.cyan}localhost:6379${colors.reset}`);
  console.log('-----------------------------------------------------------');
  console.log(`  ${colors.yellow}Flags:${colors.reset} --no-docker | --no-worker | --no-client | --windows`);
  console.log(`  ${colors.dim}Press Ctrl + C at any time to stop all services.${colors.reset}`);
  console.log(colors.bold + colors.green + '===========================================================' + colors.reset + '\n');
}

async function main() {
  logHeader();

  // 1. Docker
  await startDocker();

  // 2. Database migrations
  await runMigrations();

  // 3. Print dashboard
  printSummary();

  // 4. Start Server API
  startService({
    name: 'API',
    command: npmCmd,
    args: ['run', 'dev'],
    cwd: serverDir,
    color: colors.cyan,
  });

  // 5. Start Worker
  if (!skipWorker) {
    startService({
      name: 'WORKER',
      command: npmCmd,
      args: ['run', 'worker'],
      cwd: serverDir,
      color: colors.magenta,
    });
  }

  // 6. Start Client
  if (!skipClient) {
    startService({
      name: 'CLIENT',
      command: npmCmd,
      args: ['run', 'dev'],
      cwd: clientDir,
      color: colors.green,
    });
  }
}

main().catch((err) => {
  console.error(`${tag('ERROR', colors.red)}Fatal runner error:`, err);
  process.exit(1);
});
