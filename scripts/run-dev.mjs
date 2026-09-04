/**
 * Starts `next dev` behind a pid lock so two servers cannot share `.next`.
 * Concurrent writers delete each other's CSS/JS chunks and surface as random 404s.
 * Lock lives outside `.next` because Next.js recreates that directory on boot.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = path.join(root, '.dev-server.lock');

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readLockPid() {
  try {
    const raw = fs.readFileSync(lockPath, 'utf8').trim();
    const pid = Number(raw);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function clearLock() {
  try {
    if (readLockPid() === process.pid) {
      fs.unlinkSync(lockPath);
    }
  } catch {
    // Lock may already be gone.
  }
}

const existing = readLockPid();
if (existing !== null && isAlive(existing)) {
  console.error(
    `[dev] Another Next.js dev server already holds .next (pid ${existing}).`,
  );
  console.error(
    `[dev] Stop it first (kill ${existing}) so CSS/JS chunks are not deleted mid-request.`,
  );
  process.exit(1);
}

fs.writeFileSync(lockPath, `${process.pid}\n`, 'utf8');

const child = spawn('pnpm', ['exec', 'next', 'dev', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

const release = () => {
  clearLock();
};

child.on('exit', (code, signal) => {
  release();
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
process.on('exit', release);
