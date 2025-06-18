// check-env.js
console.log('Checking Agora Environment Variables:');
console.log('----------------------------------------');
console.log('NEXT_PUBLIC_AGORA_APP_ID:', process.env.NEXT_PUBLIC_AGORA_APP_ID || '(not set)');
console.log('AGORA_APP_ID:', process.env.AGORA_APP_ID || '(not set)');
console.log('AGORA_APP_CERTIFICATE:', process.env.AGORA_APP_CERTIFICATE ? '(set)' : '(not set)');
console.log('----------------------------------------');
console.log('NEXT_PUBLIC prefix is required for client-side access.');
console.log('Remember that environment variables must be exposed through next.config.js to be available at runtime.');
