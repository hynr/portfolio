/**
 * Privacy-respecting analytics — Plausible, env-gated.
 *
 * The script tag in <head> only renders when
 * NEXT_PUBLIC_ANALYTICS_DOMAIN is set at build time. Local dev,
 * preview deploys without the env var, and any consumer of this
 * code without analytics configured: zero network, zero cookies,
 * zero behavior change.
 *
 * Three event types only:
 *   - pageview     (auto, fired by Plausible's script)
 *   - mode_switch  (props: from, to)  — fired from setModePreference
 *   - pipe_click   (props: linkTo)    — fired from handlePipeClick
 *
 * No PII, no cookies, no fingerprinting.
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void
  }
}

export const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN

export const isAnalyticsEnabled = (): boolean => Boolean(ANALYTICS_DOMAIN)

export type ModeSwitchProps = { from: 'content' | 'game'; to: 'content' | 'game' }
export type PipeClickProps = { linkTo: string }

export function trackEvent(
  name: 'mode_switch' | 'pipe_click',
  props: ModeSwitchProps | PipeClickProps
): void {
  if (typeof window === 'undefined') return
  if (!isAnalyticsEnabled()) return
  try {
    window.plausible?.(name, { props })
  } catch {
    // Network failure or script not loaded — silent.
  }
}
