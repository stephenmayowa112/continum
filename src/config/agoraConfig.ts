// Create environment variables for client-side use

// Hard-code the app ID for client use - typically we would use environment variables,
// but we're having issues with Next.js not properly loading them at runtime
export const AGORA_CLIENT_APP_ID = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AGORA_APP_ID || '6bce0f40bd7e431ea852bcb69f66ad61';
