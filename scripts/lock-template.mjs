import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import crypto from 'crypto';

const LOCK_FILE = resolve('.template-lock.json');
const SNAP_DIR = resolve('.template-snapshot');

function hash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function snapshotPath(p) {
  return resolve(SNAP_DIR, p.replaceAll('/', '__'));
}

function ensureDir(p) {
  const dir = dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const { lock } = JSON.parse(readFileSync(LOCK_FILE, 'utf8'));

if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

// snapshot yoksa oluştur
for (const file of lock) {
  const abs = resolve(file);
  const snap = snapshotPath(file);
  ensureDir(snap);
  if (!existsSync(snap)) copyFileSync(abs, snap);
}

// değiştiyse geri al
let restored = [];
for (const file of lock) {
  const abs = resolve(file);
  const snap = snapshotPath(file);
  const cur = readFileSync(abs, 'utf8');
  const prev = readFileSync(snap, 'utf8');
  if (hash(cur) !== hash(prev)) {
    copyFileSync(snap, abs);
    restored.push(file);
  }
}

if (restored.length) {
  console.log('🔒 Template restored for:\n - ' + restored.join('\n - '));
} else {
  console.log('🔒 Template OK');
}