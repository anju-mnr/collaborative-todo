// app/airstate.client.ts
"use client"
export {} // <-- makes this file an external module so `declare global` is allowed

// optional: keep your imports below; the order doesn’t matter after this point

declare global {
  interface Window {
    __airstateConfigured?: boolean
  }
}

;(async () => {
  const APP_ID =
    process.env.NEXT_PUBLIC_AIRSTATE_APP_ID ||
    process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_TOKEN

  if (!APP_ID) {
    console.warn("[AirState] Missing NEXT_PUBLIC_AIRSTATE_APP_ID")
    return
  }
  if (window.__airstateConfigured) return

  try {
    const mod = await import("@airstate/client")
    const configure: any = (mod as any).configure
    if (typeof configure === "function") {
      configure({ appId: APP_ID, publicKey: APP_ID, token: APP_ID })
      window.__airstateConfigured = true
      console.info("[AirState] configure() OK:", APP_ID.slice(0, 14) + "…")
    } else {
      console.warn("[AirState] configure() not found; will pass key via useSharedState.")
    }
  } catch (e) {
    console.warn("[AirState] @airstate/client import failed; relying on useSharedState options.", e)
  }
})()
