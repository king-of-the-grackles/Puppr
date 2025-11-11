#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = process.cwd();
const envPath = path.join(root, '.env');
const samplePath = path.join(root, '.env.sample');

function ensureEnvFile() {
  if (fs.existsSync(envPath)) {
    return;
  }

  if (fs.existsSync(samplePath)) {
    fs.copyFileSync(samplePath, envPath);
    console.log('[configure-env] Created .env from .env.sample');
    return;
  }

  fs.writeFileSync(envPath, '', 'utf8');
  console.log('[configure-env] Created empty .env file');
}

function updateEnvFile(key) {
  const input = fs.readFileSync(envPath, 'utf8');
  const lines = input.split(/\r?\n/);
  let updated = false;

  const next = lines.map(line => {
    if (line.startsWith('ANTHROPIC_API_KEY=')) {
      updated = true;
      return `ANTHROPIC_API_KEY=${key}`;
    }
    return line;
  });

  if (!updated) {
    next.push(`ANTHROPIC_API_KEY=${key}`);
  }

  const output = next
    .filter((line, idx, arr) => !(line === '' && idx === arr.length - 1))
    .join('\n')
    .concat('\n');

  fs.writeFileSync(envPath, output, 'utf8');
}

function promptForKey() {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    rl.stdoutMuted = false;
    rl._writeToOutput = stringToWrite => {
      if (rl.stdoutMuted) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };

    rl.question('Enter Anthropic API key: ', answer => {
      rl.close();
      resolve(answer.trim());
    });
    rl.stdoutMuted = true;
  });
}

(async function run() {
  ensureEnvFile();
  const key = await promptForKey();

  if (!key) {
    console.error('[configure-env] No API key entered. Aborting.');
    process.exit(1);
  }

  updateEnvFile(key);
  console.log('[configure-env] Anthropic API key saved to .env');
})();
