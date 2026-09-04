/**
 * Fails `next build` if a locked `next dev` is still writing `.next`.
 */
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

try {
  const raw = fs.readFileSync(lockPath, 'utf8').trim();
  const pid = Number(raw);
  if (Number.isInteger(pid) && pid > 0 && isAlive(pid)) {
    console.error(
      `[build] Refusing to run: next dev still holds .next (pid ${pid}).`,
    );
    console.error(`[build] Stop the dev server first, then retry.`);
    process.exit(1);
  }
} catch {
  // No lock file: safe to build.
}
