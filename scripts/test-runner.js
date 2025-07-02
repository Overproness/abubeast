#!/usr/bin/env node

/**
 * ABUBOT Test Runner
 * Comprehensive test runner for the AI trading bot
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            coverage: null
        };

        this.testSuites = [
            {
                name: 'Configuration Tests',
                pattern: '__tests__/trading/config.test.js',
                description: 'Tests trading bot configuration and settings'
            },
            {
                name: 'Quantum Engine Tests',
                pattern: '__tests__/ai/quantumEngine.test.js',
                description: 'Tests quantum-inspired analysis engine'
            },
            {
                name: 'Advanced Solana Strategy Tests',
                pattern: '__tests__/trading/strategies/advancedSolanaStrategy.test.js',
                description: 'Tests ML-enhanced memecoin strategy'
            },
            {
                name: 'Risk Manager Tests',
                pattern: '__tests__/risk/riskManager.test.js',
                description: 'Tests risk assessment and management'
            },
            {
                name: 'Integration Tests',
                pattern: '__tests__/integration/abubotEngine.test.js',
                description: 'End-to-end trading engine tests'
            }
        ];
    }

    async runAllTests() {
        console.log('🚀 ABUBOT Test Suite Runner\n');
        console.log('Running comprehensive tests for AI trading bot...\n');

        try {
            // Run all tests with coverage
            const result = execSync('npm test -- --coverage --verbose', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            console.log(result);
            this.parseTestResults(result);
            this.displaySummary();

        } catch (error) {
            console.error('❌ Test execution failed:');
            console.error(error.stdout || error.message);
            process.exit(1);
        }
    }

    async runTestSuite(suiteName) {
        const suite = this.testSuites.find(s =>
            s.name.toLowerCase().includes(suiteName.toLowerCase())
        );

        if (!suite) {
            console.error(`❌ Test suite "${suiteName}" not found`);
            console.log('Available test suites:');
            this.testSuites.forEach(s => console.log(`  - ${s.name}`));
            return;
        }

        console.log(`🧪 Running ${suite.name}...`);
        console.log(`📝 ${suite.description}\n`);

        try {
            const result = execSync(`npm test -- ${suite.pattern} --verbose`, {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            console.log(result);

        } catch (error) {
            console.error(`❌ ${suite.name} failed:`);
            console.error(error.stdout || error.message);
        }
    }

    async runQuickTests() {
        console.log('⚡ Running quick test suite (unit tests only)...\n');

        const quickSuites = [
            '__tests__/trading/config.test.js',
            '__tests__/ai/quantumEngine.test.js'
        ];

        for (const suite of quickSuites) {
            try {
                console.log(`Testing ${suite}...`);
                execSync(`npm test -- ${suite}`, { stdio: 'inherit' });
            } catch (error) {
                console.error(`❌ Quick test failed: ${suite}`);
            }
        }
    }

    async runIntegrationTests() {
        console.log('🔗 Running integration tests...\n');

        try {
            const result = execSync('npm test -- __tests__/integration/ --verbose', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            console.log(result);

        } catch (error) {
            console.error('❌ Integration tests failed:');
            console.error(error.stdout || error.message);
        }
    }

    async checkTestCoverage() {
        console.log('📊 Generating test coverage report...\n');

        try {
            const result = execSync('npm test -- --coverage --coverageReporters=text-lcov', {
                encoding: 'utf8'
            });

            // Parse coverage data
            const coverageLines = result.split('\n').filter(line =>
                line.includes('% ') && (line.includes('Lines') || line.includes('Functions'))
            );

            console.log('Coverage Summary:');
            coverageLines.forEach(line => console.log(`  ${line.trim()}`));

        } catch (error) {
            console.error('❌ Coverage generation failed:');
            console.error(error.message);
        }
    }

    async validateTestEnvironment() {
        console.log('🔍 Validating test environment...\n');

        const checks = [
            {
                name: 'Node.js version',
                check: () => {
                    const version = process.version;
                    const major = parseInt(version.slice(1).split('.')[0]);
                    return major >= 16;
                },
                message: 'Node.js 16+ required'
            },
            {
                name: 'Jest configuration',
                check: () => fs.existsSync('jest.config.js'),
                message: 'jest.config.js not found'
            },
            {
                name: 'Test setup file',
                check: () => fs.existsSync('jest.setup.js'),
                message: 'jest.setup.js not found'
            },
            {
                name: 'Package.json test script',
                check: () => {
                    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                    return pkg.scripts && pkg.scripts.test;
                },
                message: 'No test script in package.json'
            }
        ];

        let allValid = true;

        for (const check of checks) {
            const isValid = check.check();
            const status = isValid ? '✅' : '❌';
            console.log(`${status} ${check.name}`);

            if (!isValid) {
                console.log(`   ${check.message}`);
                allValid = false;
            }
        }

        if (allValid) {
            console.log('\n🎉 Test environment is ready!');
        } else {
            console.log('\n⚠️  Please fix the issues above before running tests.');
        }

        return allValid;
    }

    parseTestResults(output) {
        // Parse Jest output to extract test statistics
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.includes('Tests:')) {
                const match = line.match(/(\d+) passed.*?(\d+) total/);
                if (match) {
                    this.testResults.passed = parseInt(match[1]);
                    this.testResults.total = parseInt(match[2]);
                    this.testResults.failed = this.testResults.total - this.testResults.passed;
                }
            }

            if (line.includes('% Lines')) {
                const coverageMatch = line.match(/(\d+\.?\d*)%/);
                if (coverageMatch) {
                    this.testResults.coverage = parseFloat(coverageMatch[1]);
                }
            }
        }
    }

    displaySummary() {
        console.log('\n📈 Test Summary');
        console.log('================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);

        if (this.testResults.coverage !== null) {
            console.log(`📊 Coverage: ${this.testResults.coverage}%`);
        }

        const successRate = (this.testResults.passed / this.testResults.total) * 100;
        console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`);

        if (successRate === 100) {
            console.log('\n🎉 All tests passed! ABUBOT is ready for action! 🚀');
        } else if (successRate >= 80) {
            console.log('\n✨ Most tests passed. Review failed tests before deployment.');
        } else {
            console.log('\n⚠️  Many tests failed. Please fix issues before proceeding.');
        }
    }

    displayUsage() {
        console.log(`
🤖 ABUBOT Test Runner

Usage: node test-runner.js [command]

Commands:
  all              Run all tests with coverage
  quick            Run quick unit tests only
  integration      Run integration tests
  coverage         Generate coverage report
  validate         Validate test environment
  suite <name>     Run specific test suite

Test Suites:
${this.testSuites.map(s => `  ${s.name.padEnd(30)} - ${s.description}`).join('\n')}

Examples:
  node test-runner.js all
  node test-runner.js suite quantum
  node test-runner.js coverage
  node test-runner.js validate

For more information, see TESTING_GUIDE.md
`);
    }
}

// CLI Interface
async function main() {
    const runner = new TestRunner();
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case 'all':
            await runner.runAllTests();
            break;

        case 'quick':
            await runner.runQuickTests();
            break;

        case 'integration':
            await runner.runIntegrationTests();
            break;

        case 'coverage':
            await runner.checkTestCoverage();
            break;

        case 'validate':
            await runner.validateTestEnvironment();
            break;

        case 'suite':
            if (!arg) {
                console.error('❌ Please specify a test suite name');
                runner.displayUsage();
                return;
            }
            await runner.runTestSuite(arg);
            break;

        default:
            runner.displayUsage();
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TestRunner;
