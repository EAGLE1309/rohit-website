'use client'

import { PostHogProvider } from '@posthog/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { posthog, initPostHog } from '@/lib/posthog'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}
