#!/usr/bin/env node
/**
 * Dev launcher — `npm run up`, `./start.sh` (macOS/Linux) or `start.cmd` (Windows).
 *
 * Does the three things that otherwise go wrong by hand: installs dependencies on a
 * fresh clone, reuses a dev server that is already running instead of failing against
 * it, and opens the browser once the server actually answers.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const isWindows = process.platform === 'win32';

const FIRST_PORT = 3000;
const LAST_PORT = 3010;
/** Appears in the header of every page — distinguishes our server from a stranger's. */
const MARKER = 'busychild';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

/** True only if this port serves *this* site, not merely something. */
async function servedByThisSite(port) {
  try {
    const response = await fetch(`http://localhost:${port}/`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return false;
    return (await response.text()).toLowerCase().includes(MARKER);
  } catch {
    return false;
  }
}

function portIsFree(port) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port, '127.0.0.1');
  });
}

function openBrowser(url) {
  const [command, args] = isWindows
    ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]];
  spawn(command, args, { stdio: 'ignore', detached: true }).unref();
}

async function waitForServer(port, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await servedByThisSite(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return false;
}

async function main() {
  if (!existsSync(join(root, 'node_modules'))) {
    console.log('→ Installing dependencies (first run, this takes a minute)…');
    const code = await run(isWindows ? 'npm.cmd' : 'npm', ['install']);
    if (code !== 0) process.exit(code);
  }

  // Next refuses to start a second dev server for the same directory — whatever port
  // you ask for. So reuse a running one rather than dying with an error.
  for (let port = FIRST_PORT; port <= LAST_PORT; port++) {
    if (await servedByThisSite(port)) {
      const url = `http://localhost:${port}/`;
      console.log(`→ Dev server is already running at ${url} — opening that.`);
      openBrowser(url);
      return;
    }
  }

  let port = FIRST_PORT;
  while (port <= LAST_PORT && !(await portIsFree(port))) port++;
  if (port > LAST_PORT) {
    console.error(`✗ Every port from ${FIRST_PORT} to ${LAST_PORT} is taken.`);
    process.exit(1);
  }

  const nextBin = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'dev', '--port', String(port)], {
    cwd: root,
    stdio: 'inherit',
  });
  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });

  const url = `http://localhost:${port}/`;
  void waitForServer(port).then((up) => {
    if (up) {
      console.log(`\n→ ${url}   (English: ${url}en/)   Ctrl+C to stop.\n`);
      openBrowser(url);
    }
  });

  const stop = () => child.kill('SIGINT');
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
