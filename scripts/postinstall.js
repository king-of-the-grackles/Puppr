#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const envPath = path.join(root, '.env');
const samplePath = path.join(root, '.env.sample');

try {
  if (fs.existsSync(envPath)) {
    console.log('[postinstall] .env already exists, skipping copy');
    process.exit(0);
  }

  if (!fs.existsSync(samplePath)) {
    console.warn('[postinstall] No .env.sample found, skipping');
    process.exit(0);
  }

  fs.copyFileSync(samplePath, envPath);
  console.log('[postinstall] Created .env from .env.sample');
} catch (error) {
  console.error('[postinstall] Failed to initialize .env:', error);
  process.exit(1);
}
