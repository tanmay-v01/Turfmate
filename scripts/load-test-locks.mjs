/**
 * Phase 5d entrypoint — runs server/scripts/loadTestLocks.js
 * Usage: npm run load-test:locks
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(root, '..', 'server', 'scripts', 'loadTestLocks.js');

const child = spawn(process.execPath, [script], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(root, '..'),
});

child.on('exit', (code) => process.exit(code ?? 1));
