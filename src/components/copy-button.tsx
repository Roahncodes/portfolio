"use client";

import { useEffect, useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/icons";
import { sound } from "@/lib/audio";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyButton({ value, label = "Copy", className = "btn btn-primary" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      sound.playChime();
    } catch {
      // clipboard is unavailable (insecure context / denied) — select instead
      setCopied(false);
    }
  }

  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}
