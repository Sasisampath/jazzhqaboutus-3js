"use client";

import { useEffect, useRef, useState } from "react";
import { AI_PROVIDERS, AI_PROVIDER_ORDER, JAZZHQ_AI_PROMPT, copyJazzHQPrompt, openAIProvider, openJazzHQWithAI, type AIProviderKey } from "@/lib/jazzhq-ai";
import { FooterTip } from "./footer-tip";

// "Summarize with AI" tiles: click → copy the JazzHQ brief → open the provider
// in a new tab → confirm with a toast. A fallback panel appears only if copying fails.
export function FooterAI() {
  const [toast, setToast] = useState("");
  const [fallback, setFallback] = useState<AIProviderKey | null>(null);
  const [manualCopied, setManualCopied] = useState(false);
  const timer = useRef<number>(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (message: string) => {
    window.clearTimeout(timer.current);
    setToast(message);
    timer.current = window.setTimeout(() => setToast(""), 3600);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!fallback) return;
    areaRef.current?.select();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setFallback(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fallback]);

  const ask = async (provider: AIProviderKey) => {
    const { copied } = await openJazzHQWithAI(provider);
    if (copied) {
      setFallback(null);
      showToast(`JazzHQ brief copied — paste it into ${AI_PROVIDERS[provider].label}`);
    } else {
      setManualCopied(false);
      setFallback(provider);
    }
  };

  const copyManually = async () => {
    const ok = await copyJazzHQPrompt();
    if (!ok) areaRef.current?.select();
    setManualCopied(ok);
  };

  return (
    <>
      <div className="site-footer__ai-logos">
        {AI_PROVIDER_ORDER.map((key, index) => {
          const { label, logo } = AI_PROVIDERS[key];
          return (
            <FooterTip key={key} align={index === 0 ? "start" : index === AI_PROVIDER_ORDER.length - 1 ? "end" : "center"} tip={`Ask ${label}`}>
              <button type="button" className="site-footer__ai-logo" aria-label={`Ask ${label} about JazzHQ`} onClick={() => ask(key)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" width={30} height={30} loading="lazy" />
              </button>
            </FooterTip>
          );
        })}
      </div>

      {fallback && (
        <div className="site-ai-fallback" role="dialog" aria-label="Copy this JazzHQ brief">
          <div className="site-ai-fallback__head">
            <p className="site-ai-fallback__title">Copy this JazzHQ brief</p>
            <button type="button" className="site-ai-fallback__close" aria-label="Close" onClick={() => setFallback(null)}>×</button>
          </div>
          <textarea ref={areaRef} className="site-ai-fallback__text" readOnly value={JAZZHQ_AI_PROMPT} aria-label="JazzHQ brief" />
          <div className="site-ai-fallback__actions">
            <button type="button" className="site-ai-fallback__btn site-ai-fallback__btn--primary" onClick={copyManually}>
              {manualCopied ? "Copied" : "Copy prompt"}
            </button>
            <button type="button" className="site-ai-fallback__btn" onClick={() => openAIProvider(fallback)}>
              Open {AI_PROVIDERS[fallback].label}
            </button>
          </div>
        </div>
      )}

      <div className={`site-ai-toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
