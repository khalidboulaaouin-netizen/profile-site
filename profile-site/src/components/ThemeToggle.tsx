"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";

function resolveMode(mode: Mode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return mode;
}

export function ThemeToggle({
  initialMode = "system",
  labels,
}: {
  initialMode?: Mode;
  labels: { light: string; dark: string; system: string; theme: string };
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    const saved = window.localStorage.getItem("hodouri-color-mode") as Mode | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      setMode(saved);
    }
  }, []);

  useEffect(() => {
    const applied = resolveMode(mode);
    document.documentElement.dataset.colorMode = applied;
    document.body.dataset.colorMode = applied;
    window.localStorage.setItem("hodouri-color-mode", mode);
  }, [mode]);

  return (
    <label className="theme-toggle">
      <span className="theme-toggle-label">{labels.theme}</span>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as Mode)}
        aria-label={labels.theme}
      >
        <option value="system">{labels.system}</option>
        <option value="light">{labels.light}</option>
        <option value="dark">{labels.dark}</option>
      </select>
    </label>
  );
}
