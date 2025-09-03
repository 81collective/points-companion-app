#!/usr/bin/env node

// Comprehensive Test Runner for Points Companion App
// Runs all tests with coverage reporting and performance monitoring

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      coverage: {},
      performance: {},
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  async setupTestEnvironment() {
    this.log('Setting up test environment...', 'info');

    try {
      // Install test dependencies if needed
      if (!fs.existsSync('node_modules/.bin/jest')) {
        this.log('Installing test dependencies...', 'warning');
        await this.runCommand('npm', ['install']);
      }

      // Create test directories if they don't exist
      const testDirs = [
        'src/test',
        'coverage',
        'test-results',
        '.jest-cache',
      ];

      testDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log(`Created directory: ${dir}`, 'info');
        }
      });

      this.log('Test environment setup complete', 'success');
    } catch (error) {
      this.log(`Failed to setup test environment: ${error.message}`, 'error');
      throw error;
    }
  }

  async runUnitTests() {
    this.log('Running unit tests...', 'info');

    try {
      await this.runCommand('npm', [
        'run',
        'test',
        '--',
        '--config',
        'jest.config.ts',
        '--coverage',
        '--coverageReporters=json-summary',
        '--testMatch=**/src/test/**/*.test.(ts|tsx|js|jsx)',
        '--verbose',
        '--detectOpenHandles',
        '--forceExit',
      ]);

      this.log('Unit tests completed', 'success');
    } catch (error) {
      this.log(`Unit tests failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runIntegrationTests() {
    this.log('Running integration tests...', 'info');

    try {
      // Start test server
      const serverProcess = spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'ignore',
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Run integration tests
      await this.runCommand('npx', [
        'jest',
        '--config',
        'jest.config.ts',
        '--testPathPattern=src/test/integration',
        '--verbose',
      ]);

      // Kill server
      process.kill(-serverProcess.pid);

      this.log('Integration tests completed', 'success');
    } catch (error) {
      this.log(`Integration tests failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runPerformanceTests() {
    this.log('Running performance tests...', 'info');

    try {
      await this.runCommand('npx', [
        'jest',
        '--config',
        'jest.config.ts',
        '--testPathPattern=src/test/performance',
        '--verbose',
      ]);

      this.log('Performance tests completed', 'success');
    } catch (error) {
      this.log(`Performance tests failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runE2ETests() {
    this.log('Running E2E tests...', 'info');

    try {
      // Install Playwright if needed
      if (!fs.existsSync('node_modules/.bin/playwright')) {
        this.log('Installing Playwright...', 'warning');
        await this.runCommand('npx', ['playwright', 'install']);
      }

      await this.runCommand('npx', [
        'playwright',
        'test',
        '--config',
        'playwright.config.ts',
        '--reporter=json',
      ]);

      this.log('E2E tests completed', 'success');
    } catch (error) {
      this.log(`E2E tests failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateCoverageReport() {
    this.log('Generating coverage report...', 'info');

    try {
      const coveragePath = 'coverage/coverage-summary.json';

      if (fs.existsSync(coveragePath)) {
        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

        this.results.coverage = {
          lines: coverageData.total.lines.pct,
          functions: coverageData.total.functions.pct,
          branches: coverageData.total.branches.pct,
          statements: coverageData.total.statements.pct,
        };

        this.log(`Coverage Report:`, 'info');
        this.log(`  Lines: ${this.results.coverage.lines}%`, 'info');
        this.log(`  Functions: ${this.results.coverage.functions}%`, 'info');
        this.log(`  Branches: ${this.results.coverage.branches}%`, 'info');
        this.log(`  Statements: ${this.results.coverage.statements}%`, 'info');

        // Check coverage thresholds
        const thresholds = {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        };

        let coverageMet = true;
        Object.entries(thresholds).forEach(([metric, threshold]) => {
          if (this.results.coverage[metric] < threshold) {
            this.log(`❌ ${metric} coverage below threshold: ${this.results.coverage[metric]}% < ${threshold}%`, 'error');
            coverageMet = false;
          }
        });

        if (coverageMet) {
          this.log('✅ All coverage thresholds met!', 'success');
        }
      } else {
        this.log('Coverage report not found', 'warning');
      }
    } catch (error) {
      this.log(`Failed to generate coverage report: ${error.message}`, 'error');
    }
  }

  async generatePerformanceReport() {
    this.log('Generating performance report...', 'info');

    try {
      const perfPath = 'test-results/performance.json';

      if (fs.existsSync(perfPath)) {
        const perfData = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
        this.results.performance = perfData;

        this.log('Performance Report:', 'info');
        Object.entries(perfData).forEach(([metric, value]) => {
          this.log(`  ${metric}: ${value}`, 'info');
        });
      }
    } catch (error) {
      this.log(`Failed to generate performance report: ${error.message}`, 'error');
    }
  }

  async generateHTMLReport() {
    this.log('Generating HTML test report...', 'info');

    try {
      const reportPath = 'test-results/report.html';
      const coveragePath = 'coverage/lcov-report/index.html';

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Points Companion - Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
        .metric.good { background: #d4edda; color: #155724; }
        .metric.warning { background: #fff3cd; color: #856404; }
        .metric.danger { background: #f8d7da; color: #721c24; }
        .links { margin: 20px 0; }
        .links a { display: inline-block; margin: 0 10px; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Points Companion - Test Results</h1>
        <p>Test execution completed at ${new Date().toISOString()}</p>
        <p>Total execution time: ${((Date.now() - this.startTime) / 1000).toFixed(2)} seconds</p>
    </div>

    <div class="metrics">
        <div class="metric ${this.results.coverage.lines >= 80 ? 'good' : this.results.coverage.lines >= 60 ? 'warning' : 'danger'}">
            <h3>Line Coverage</h3>
            <div style="font-size: 2em; font-weight: bold;">${this.results.coverage.lines || 0}%</div>
        </div>
        <div class="metric ${this.results.coverage.functions >= 80 ? 'good' : this.results.coverage.functions >= 60 ? 'warning' : 'danger'}">
            <h3>Function Coverage</h3>
            <div style="font-size: 2em; font-weight: bold;">${this.results.coverage.functions || 0}%</div>
        </div>
        <div class="metric ${this.results.coverage.branches >= 80 ? 'good' : this.results.coverage.branches >= 60 ? 'warning' : 'danger'}">
            <h3>Branch Coverage</h3>
            <div style="font-size: 2em; font-weight: bold;">${this.results.coverage.branches || 0}%</div>
        </div>
        <div class="metric ${this.results.passedTests / Math.max(this.results.totalTests, 1) >= 0.95 ? 'good' : this.results.passedTests / Math.max(this.results.totalTests, 1) >= 0.80 ? 'warning' : 'danger'}">
            <h3>Test Pass Rate</h3>
            <div style="font-size: 2em; font-weight: bold;">${this.results.totalTests > 0 ? Math.round((this.results.passedTests / this.results.totalTests) * 100) : 0}%</div>
        </div>
    </div>

    <div class="links">
        ${fs.existsSync(coveragePath) ? `<a href="${path.relative('test-results', coveragePath)}">View Coverage Report</a>` : ''}
        ${fs.existsSync('test-results/junit.xml') ? `<a href="junit.xml">View JUnit Report</a>` : ''}
        ${fs.existsSync('playwright-report/index.html') ? `<a href="../playwright-report/index.html">View E2E Report</a>` : ''}
    </div>
</body>
</html>`;

      fs.writeFileSync(reportPath, html);
      this.log(`HTML report generated: ${reportPath}`, 'success');
    } catch (error) {
      this.log(`Failed to generate HTML report: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    try {
      await this.setupTestEnvironment();

      // Run test suites in parallel where possible
      const testPromises = [
        this.runUnitTests(),
        // this.runIntegrationTests(), // Uncomment when integration tests are ready
        // this.runPerformanceTests(), // Uncomment when performance tests are ready
        // this.runE2ETests(), // Uncomment when E2E tests are ready
      ];

      await Promise.allSettled(testPromises);

      // Generate reports
      await this.generateCoverageReport();
      await this.generatePerformanceReport();
      await this.generateHTMLReport();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.log(`All tests completed in ${duration} seconds`, 'success');

      // Exit with appropriate code
      const hasFailures = this.results.failedTests > 0;
      process.exit(hasFailures ? 1 : 0);

    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const testRunner = new TestRunner();
  testRunner.runAllTests();
}

module.exports = TestRunner;
