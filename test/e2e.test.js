const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const SESSION_ID = `test-${Date.now()}`;

async function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}`);
    await fn();
    console.log(`✅ ${name} passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
    return false;
  }
}

async function callAPI(endpoint, body = null) {
  const url = `${BASE_URL}/api${endpoint}`;
  const options = {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {}
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function runTests() {
  console.log('🚀 Starting E2E Tests...');
  console.log(`Base URL: ${BASE_URL}`);
  
  const results = [];

  // Test 1: Health Check
  results.push(await test('Health Check', async () => {
    const data = await callAPI('/health');
    if (data.status !== 'healthy' || !data.ready) {
      throw new Error('Service not healthy');
    }
    console.log(`   Mode: ${data.mode}, Environment: ${data.environment}`);
  }));

  // Test 2: Get Models
  results.push(await test('Get Models', async () => {
    const data = await callAPI('/models');
    if (!data.models || !Array.isArray(data.models)) {
      throw new Error('Invalid models response');
    }
    if (!data.defaultModel || data.defaultModel.id !== 'deepseek/deepseek-r1:free') {
      throw new Error('Default model should be deepseek-r1:free');
    }
    console.log(`   Found ${data.totalFree} free models`);
  }));

  // Test 3: Open Browser Session
  results.push(await test('Open Browser Session', async () => {
    const data = await callAPI('/browser/open', { sessionId: SESSION_ID });
    if (data.status !== 'success' || data.sessionId !== SESSION_ID) {
      throw new Error('Failed to open session');
    }
    console.log(`   Session opened in ${data.timing}ms (mode: ${data.mode})`);
  }));

  // Test 4: Navigate to URL
  results.push(await test('Navigate to URL', async () => {
    const data = await callAPI('/browser/goto', {
      sessionId: SESSION_ID,
      url: 'https://example.com'
    });
    if (data.status !== 'success' || !data.url.includes('example.com')) {
      throw new Error('Navigation failed');
    }
    console.log(`   Navigated in ${data.timing}ms to ${data.title}`);
  }));

  // Test 5: Extract Data
  results.push(await test('Extract Page Data', async () => {
    const data = await callAPI('/browser/extract', {
      sessionId: SESSION_ID,
      selector: 'h1'
    });
    if (data.status !== 'success' || !data.data) {
      throw new Error('Extraction failed');
    }
    console.log(`   Extracted: "${data.data}"`);
  }));

  // Test 6: Take Screenshot
  results.push(await test('Take Screenshot', async () => {
    const data = await callAPI('/browser/screenshot', {
      sessionId: SESSION_ID,
      quality: 60
    });
    if (data.status !== 'success' || !data.screenshot) {
      throw new Error('Screenshot failed');
    }
    console.log(`   Screenshot taken (${data.screenshot.length} bytes)`);
  }));

  // Test 7: Close Session
  results.push(await test('Close Browser Session', async () => {
    const data = await callAPI('/browser/close', { sessionId: SESSION_ID });
    if (data.status !== 'success' || !data.closed) {
      throw new Error('Failed to close session');
    }
    console.log(`   Session closed, ${data.activeSessions} active sessions remaining`);
  }));

  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
