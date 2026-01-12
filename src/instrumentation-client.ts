import posthog from 'posthog-js'

// Debug logging
console.log('PostHog init:', {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'SET' : 'MISSING',
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'MISSING'
});

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
  defaults: '2025-11-30',
  debug: true, // Enable debug mode
  loaded: (posthog) => {
    console.log('PostHog loaded successfully');
  }
});
