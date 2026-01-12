# PostHog Analytics Setup for Next.js 15.5.9

## Overview
This project uses PostHog for accurate, privacy-focused analytics tracking. The implementation follows Next.js 15.5.9 best practices for optimal performance and tracking accuracy.

## Architecture

### Key Components

1. **`src/lib/posthog.ts`** - Centralized PostHog configuration
2. **`src/app/providers.tsx`** - PostHog Provider and PageView tracking
3. **`src/app/layout.tsx`** - Root layout with provider integration

## Features

✅ **Accurate Pageview Tracking** - Manual pageview capture using Next.js router hooks  
✅ **Client-side Events** - Video and music player tracking  
✅ **Provider Pattern** - Uses `@posthog/react` for proper context management  
✅ **Debug Mode** - Automatic debug logging in development  
✅ **Person Profiles** - Optimized for identified users only  
✅ **Page Leave Tracking** - Captures when users leave pages  

## Installation

Already installed:
```bash
npm install posthog-js @posthog/react
```

## Configuration

### 1. Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Important:** These must start with `NEXT_PUBLIC_` to be accessible on the client-side.

### 2. Deployment

Set environment variables in your hosting platform:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site settings → Build & deploy → Environment
- **Other**: Check your hosting provider's documentation

## Usage

### Tracking Custom Events

Use the `usePostHog` hook in any client component:

```tsx
'use client'

import { usePostHog } from '@posthog/react'

export function MyComponent() {
  const posthog = usePostHog()
  
  const handleClick = () => {
    posthog.capture('button_clicked', {
      button_name: 'signup',
      location: 'homepage'
    })
  }
  
  return <button onClick={handleClick}>Sign Up</button>
}
```

### Current Event Tracking

#### Video Player Events
- `video_played` - When video starts playing
- `video_paused` - When video is paused
- `video_completed` - When video finishes
- `video_initial_play` - When user clicks initial play button

#### Music Player Events
- `music_played` - When track starts playing
- `music_paused` - When track is paused
- `music_completed` - When track finishes
- `music_track_changed` - When switching tracks

#### Automatic Events
- `$pageview` - Captured on every route change
- `$pageleave` - Captured when user leaves page

## Why This Setup is Accurate

1. **Manual Pageview Capture**: Uses `usePathname()` and `useSearchParams()` to accurately track route changes in Next.js App Router
2. **PostHog Provider**: Ensures PostHog context is available throughout the app
3. **usePostHog Hook**: Provides stable PostHog instance that doesn't cause re-renders
4. **Suspense Boundary**: Prevents hydration issues with pageview tracking
5. **Person Profiles**: Only tracks identified users to reduce noise

## Debugging

### Development Mode
PostHog automatically enables debug mode in development. Check browser console for:
```
[PostHog] Loaded successfully
[PostHog] Tracking event: $pageview
```

### Production Testing
1. Open browser DevTools → Network tab
2. Filter by "posthog"
3. Look for POST requests to `/e/` endpoint
4. Check request payload for your events

### Common Issues

**Events not appearing:**
- Check environment variables are set correctly
- Verify PostHog key starts with `phc_`
- Check browser console for errors
- Disable ad-blockers for testing

**Duplicate pageviews:**
- This setup prevents duplicates by using manual capture with `capture_pageview: false`

**CSP blocking requests:**
- CSP headers have been removed to allow PostHog requests
- If you re-enable CSP, add PostHog domains to `connect-src`

## Performance Impact

- **Bundle size**: ~30KB gzipped (posthog-js)
- **Network**: <1KB per event
- **Bandwidth**: Negligible (<0.001% of media streaming)
- **Events are batched** and sent asynchronously

## Best Practices

1. **Use descriptive event names**: `video_played` not `play`
2. **Include context**: Add relevant properties to events
3. **Don't track PII**: Avoid capturing sensitive user data
4. **Test in development**: Use debug mode to verify events
5. **Monitor quota**: Check PostHog dashboard for usage

## Next Steps

1. ✅ Set up environment variables in production
2. ✅ Deploy and verify events in PostHog dashboard
3. 🔄 Create dashboards for key metrics
4. 🔄 Set up alerts for important events
5. 🔄 Add user identification when users log in

## Resources

- [PostHog Next.js Docs](https://posthog.com/docs/libraries/next-js)
- [PostHog React Hooks](https://posthog.com/docs/libraries/react)
- [Next.js 15 Docs](https://nextjs.org/docs)
