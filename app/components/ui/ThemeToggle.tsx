"use client"
import { useEffect } from "react"

const THEMES: Record<string, {brand: string; brandFrom: string; brandTo: string}> = {
  purple: { brand: "262 83% 58%", brandFrom: "258 90% 66%", brandTo: "280 86% 54%" },
  teal:   { brand: "188 88% 40%", brandFrom: "190 95% 42%", brandTo: "170 78% 45%" },
  emerald:{ brand: "150 71% 40%", brandFrom: "152 76% 41%", brandTo: "140 65% 45%" },
  rose:   { brand: "347 77% 54%", brandFrom: "345 85% 58%", brandTo: "15 86% 55%" },
}

function applyTheme(name: keyof typeof THEMES) {
  const t = THEMES[name]
  const root = document.documentElement
  root.style.setProperty("--brand", t.brand)
  root.style.setProperty("--brand-from", t.brandFrom)
  root.style.setProperty("--brand-to", t.brandTo)
  root.style.setProperty("--ring", t.brand)
  localStorage.setItem("brand-theme", name)
}

export function BrandThemeSwitcher() {
  useEffect(() => {
    const saved = (localStorage.getItem("brand-theme") as keyof typeof THEMES) || "purple"
    applyTheme(saved)
  }, [])

  return (
    <div className="flex gap-2">
      {Object.keys(THEMES).map((k) => (
        <button
          key={k}
          onClick={() => applyTheme(k as keyof typeof THEMES)}
          className="h-6 px-2 rounded-full text-xs bg-white/70 hover:bg-white shadow"
        >
          {k}
        </button>
      ))}
    </div>
  )
}
