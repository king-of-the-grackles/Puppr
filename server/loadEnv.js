import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localEnv = path.resolve(__dirname, '.env');
const rootEnv = path.resolve(__dirname, '../.env');

const envPath = fs.existsSync(localEnv)
  ? localEnv
  : (fs.existsSync(rootEnv) ? rootEnv : undefined);

dotenv.config(envPath ? { path: envPath } : undefined);
