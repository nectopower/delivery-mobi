import { exec } from 'child_process';
import path from 'path';

console.log('Starting mobile app test server...');

// Start the test server
const testServer = exec('node mobile/test-app.js');

testServer.stdout.on('data', (data) => {
  console.log(`Test server: ${data}`);
});

testServer.stderr.on('data', (data) => {
  console.error(`Test server error: ${data}`);
});

console.log('\nTest server started at http://localhost:3000');
console.log('\nTo test the mobile app:');
console.log('1. Use the test server to simulate API responses');
console.log('2. Modify mobile/services/api.js to point to your test server');
console.log('3. When ready to run on a real device, install Expo Go on your phone');
console.log('4. Run "cd mobile && npx expo start" to start the Expo development server');
console.log('5. Scan the QR code with Expo Go to run the app on your device');
console.log('\nPress Ctrl+C to stop the test server');
