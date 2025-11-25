#!/usr/bin/env node
/**
 * Pre-commit validation script
 * 
 * This script runs additional checks beyond lint-staged to ensure
 * code quality and agent rule compliance before commits.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// Rule: No console.log in production code (except debug files)
function checkNoConsoleLog(files) {
  const issues = [];
  const allowedPatterns = [/debug/i, /\.test\./i, /\.spec\./i, /scripts\//];
  
  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    if (allowedPatterns.some(p => p.test(file))) continue;
    
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('console.log') && !line.includes('// eslint-disable')) {
        issues.push(`${file}:${index + 1} - console.log found (use logger instead)`);
      }
    });
  }
  
  return issues;
}

// Rule: No hardcoded secrets
function checkNoSecrets(files) {
  const issues = [];
  const secretPatterns = [
    /['"]sk_live_[a-zA-Z0-9]+['"]/,           // Stripe live key
    /['"]pk_live_[a-zA-Z0-9]+['"]/,           // Stripe publishable live key
    /password\s*[:=]\s*['"][^'"]+['"]/i,      // Hardcoded passwords
    /apiKey\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i, // API keys
    /secret\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i, // Secrets
  ];
  
  for (const file of files) {
    if (file.includes('.env') || file.includes('example')) continue;
    if (!fs.existsSync(path.join(ROOT_DIR, file))) continue;
    
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        issues.push(`${file} - Potential hardcoded secret detected`);
        break;
      }
    }
  }
  
  return issues;
}

// Rule: API routes must have Zod validation
function checkApiValidation(files) {
  const issues = [];
  
  for (const file of files) {
    if (!file.includes('/api/') || !file.endsWith('route.ts')) continue;
    
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    
    // Check for POST/PUT/PATCH handlers without Zod
    if ((content.includes('export async function POST') ||
         content.includes('export async function PUT') ||
         content.includes('export async function PATCH')) &&
        !content.includes('import { z }') &&
        !content.includes("from 'zod'")) {
      issues.push(`${file} - Mutating API route missing Zod validation`);
    }
  }
  
  return issues;
}

// Rule: Components must have TypeScript props interface
function checkComponentTypes(files) {
  const issues = [];
  
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    if (file.includes('.test.') || file.includes('.spec.')) continue;
    
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    
    // Check for function components without props type
    const functionMatch = content.match(/export\s+(default\s+)?function\s+\w+\s*\(\s*{\s*\w+/);
    if (functionMatch && !content.includes('interface') && !content.includes(': {')) {
      issues.push(`${file} - Component may be missing typed props interface`);
    }
  }
  
  return issues;
}

// Rule: Check for TODO/FIXME without issue reference
function checkTodoComments(files) {
  const issues = [];
  
  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const todoMatch = line.match(/\/\/\s*(TODO|FIXME|HACK):/i);
      if (todoMatch && !line.includes('#') && !line.includes('http')) {
        issues.push(`${file}:${index + 1} - ${todoMatch[1]} without issue reference`);
      }
    });
  }
  
  return issues;
}

// Main validation
function main() {
  log('\n🔍 Running pre-commit validations...\n', 'blue');
  
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    log('No files to validate.', 'green');
    process.exit(0);
  }
  
  const allIssues = [];
  
  // Run all checks
  const checks = [
    { name: 'Console.log check', fn: checkNoConsoleLog },
    { name: 'Secrets check', fn: checkNoSecrets },
    { name: 'API validation check', fn: checkApiValidation },
    { name: 'Component types check', fn: checkComponentTypes },
    { name: 'TODO comments check', fn: checkTodoComments },
  ];
  
  for (const check of checks) {
    const issues = check.fn(changedFiles);
    if (issues.length > 0) {
      log(`\n❌ ${check.name} failed:`, 'red');
      issues.forEach(issue => log(`   ${issue}`, 'yellow'));
      allIssues.push(...issues);
    } else {
      log(`✅ ${check.name} passed`, 'green');
    }
  }
  
  if (allIssues.length > 0) {
    log(`\n⚠️  Found ${allIssues.length} issue(s). Please fix before committing.\n`, 'red');
    log('💡 Tip: Add "// eslint-disable-next-line" with justification to bypass specific rules.\n', 'blue');
    process.exit(1);
  }
  
  log('\n✅ All pre-commit validations passed!\n', 'green');
  process.exit(0);
}

main();
