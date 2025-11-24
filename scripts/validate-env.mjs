#!/usr/bin/env node
import process from 'process';

const requiredEnv = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXTAUTH_URL'
];

const invalid = requiredEnv.filter((key) => {
  const value = process.env[key];
  return !value || String(value).trim() === '';
});

if (invalid.length) {
  console.error('Missing or empty required env vars:', invalid.join(', '));
  console.error('Please set these env vars in your environment or CI.');
  process.exit(1);
}

console.log('Environment validation passed.');
process.exit(0);
