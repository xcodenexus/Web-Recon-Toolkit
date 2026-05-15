const scan = require('./src/commands/scan');
const { exec } = require('child_process');

async function runTests() {
  console.log('🧪 Running WRT Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Basic scan
  console.log('Test 1: Basic scan of example.com (no ports)');
  try {
    const result = await scan('example.com', { skipPorts: true });
    if (result && result.domain === 'example.com') {
      console.log('✅ Test 1 passed\n');
      passed++;
    } else {
      console.log('❌ Test 1 failed: unexpected result\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 1 failed: ${error.message}\n`);
    failed++;
  }

  // Test 2: JSON output
  console.log('Test 2: JSON output format');
  try {
    const result = await scan('google.com', { format: 'json', skipPorts: true });
    if (result && result.modules) {
      console.log('✅ Test 2 passed\n');
      passed++;
    } else {
      console.log('❌ Test 2 failed: no modules in result\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 2 failed: ${error.message}\n`);
    failed++;
  }

  // Test 3: CLI help command
  console.log('Test 3: CLI help command');
  exec('node bin/wrt.js --help', (error, stdout) => {
    if (error) {
      console.log(`❌ Test 3 failed: ${error.message}`);
      failed++;
    } else if (stdout.includes('scan')) {
      console.log('✅ Test 3 passed\n');
      passed++;
    } else {
      console.log('❌ Test 3 failed: help output missing scan command\n');
      failed++;
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  });
}

runTests();
